import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    Users,
    Copy,
    CheckCheck,
    BookOpen,
    CheckCircle2,
    RefreshCw,
    Loader2,
    AlertCircle,
    ChevronDown,
    ChevronUp,
    Star,
    Plus,
    Trash2,
    ClipboardList,
    Calendar,
    Lock,
    Unlock,
    Settings,
    Archive,
    Eye,
    EyeOff,
    UserMinus,
} from 'lucide-react';
import {
    getClassroom,
    createClassroom,
    listTeacherClassrooms,
    setStudentUnlockedCourses,
    removeStudentFromClassroom,
} from '../services/classroomService';
import { listAssignmentsForClassroom, deleteAssignment } from '../services/assignmentsService';
import { listPostsForClassroom, createPost, deletePost, setPostPinned } from '../services/postsService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import type { Classroom, Module, Assignment, Post } from '../types';
import { COURSES, resolveCourseModuleIds } from '../data/coursesData';
import { AssignLessonModal } from './AssignLessonModal';
import { StreamView } from './StreamView';
import { ClassroomSettingsModal } from './ClassroomSettingsModal';
import { assignmentTitle, assignmentSubtitle } from '../utils/assignmentDisplay';

// ─── Types ────────────────────────────────────────────────────────────────────

interface StudentProgress {
    uid: string;
    username: string;
    name: string;
    completedLessons: string[];
    totalStars: number;
    currentStreak: number;
    lastActive: number | null;
    unlockedCourseIds: string[];
}

type Tab = 'stream' | 'students' | 'lessons' | 'assignments';

interface TeacherDashboardProps {
    modules: Module[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const timeAgo = (ts: number | null): string => {
    if (!ts) return 'Never';
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
};

const formatDue = (dueAt: number | null): string => {
    if (dueAt === null) return 'No due date';
    const now = Date.now();
    const d = dueAt - now;
    const day = 24 * 60 * 60 * 1000;
    if (d < 0) return 'Overdue';
    if (d < day) return 'Due today';
    if (d < 3 * day) return `Due in ${Math.ceil(d / day)} days`;
    return `Due ${new Date(dueAt).toLocaleDateString()}`;
};

// Courses other than Python Basics — those a teacher might grant early access to.
const GRANTABLE_COURSES = COURSES.filter(c => c.prerequisiteCourseId !== null);

// ─── Component ────────────────────────────────────────────────────────────────

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ modules }) => {
    const { user, refreshUser } = useAuth();

    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [activeClassId, setActiveClassId] = useState<string | null>(null);
    const [students, setStudents] = useState<StudentProgress[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [tab, setTab] = useState<Tab>('stream');
    const [classroomMenuOpen, setClassroomMenuOpen] = useState(false);
    const [creatingNew, setCreatingNew] = useState(false);
    const [newClassName, setNewClassName] = useState('');
    const [createSubmitting, setCreateSubmitting] = useState(false);
    const [codeCopied, setCodeCopied] = useState(false);
    const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
    const [assignTarget, setAssignTarget] = useState<{ moduleId: string; lessonId: string; lessonTitle: string; courseId: string; courseTitle: string } | null>(null);
    const [expandedCourseInLessons, setExpandedCourseInLessons] = useState<string | null>(null);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [showArchived, setShowArchived] = useState(false);

    const activeClassroom = useMemo(
        () => classrooms.find(c => c.classId === activeClassId) ?? null,
        [classrooms, activeClassId]
    );

    // Active list = archived hidden unless explicitly toggled on.
    const visibleClassrooms = useMemo(
        () => classrooms.filter(c => showArchived || !c.archived),
        [classrooms, showArchived]
    );
    const archivedCount = classrooms.filter(c => c.archived).length;

    // ── Data fetching ─────────────────────────────────────────────────────────

    const fetchStudentData = useCallback(async (classroom: Classroom): Promise<StudentProgress[]> => {
        if (classroom.studentIds.length === 0) return [];
        const results = await Promise.all(
            classroom.studentIds.map(async (uid): Promise<StudentProgress> => {
                try {
                    const [userSnap, progressSnap, starsSnap] = await Promise.all([
                        getDoc(doc(db, 'users', uid)),
                        getDoc(doc(db, 'users', uid, 'progress', 'classroom')),
                        getDoc(doc(db, 'users', uid, 'economy', 'stars')),
                    ]);
                    const userData = userSnap.exists() ? userSnap.data() : {};
                    const completedLessons: string[] = progressSnap.exists()
                        ? (progressSnap.data().completedLessons ?? [])
                        : [];
                    const totalStars: number = starsSnap.exists() ? (starsSnap.data().totalEarned ?? 0) : 0;
                    const currentStreak: number = starsSnap.exists() ? (starsSnap.data().currentStreak ?? 0) : 0;
                    return {
                        uid,
                        username: userData.username ?? uid.slice(0, 8),
                        name: userData.name ?? 'Unknown',
                        completedLessons,
                        totalStars,
                        currentStreak,
                        lastActive: userData.lastActive ?? null,
                        unlockedCourseIds: Array.isArray(userData.unlockedCourseIds) ? userData.unlockedCourseIds : [],
                    };
                } catch {
                    return {
                        uid,
                        username: uid.slice(0, 8),
                        name: 'Unknown',
                        completedLessons: [],
                        totalStars: 0,
                        currentStreak: 0,
                        lastActive: null,
                        unlockedCourseIds: [],
                    };
                }
            })
        );
        return results.sort((a, b) => b.completedLessons.length - a.completedLessons.length);
    }, []);

    // Initial: load all classrooms owned by this teacher.
    const loadClassrooms = useCallback(async () => {
        if (!user) return;
        try {
            const list = await listTeacherClassrooms(user.id);
            setClassrooms(list);
            // Pick a sensible active class: previously-active if still there,
            // else user.classId, else the first one.
            setActiveClassId(prev => {
                if (prev && list.some(c => c.classId === prev)) return prev;
                if (user.classId && list.some(c => c.classId === user.classId)) return user.classId;
                return list[0]?.classId ?? null;
            });
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Failed to load classrooms.');
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Load students + assignments for the active classroom.
    const loadClassroomData = useCallback(async (showSpinner = false) => {
        if (!activeClassroom) return;
        if (showSpinner) setRefreshing(true);
        try {
            // Re-fetch the classroom doc so studentIds is fresh.
            const cls = await getClassroom(activeClassroom.classId);
            if (!cls) { setError('Classroom not found.'); return; }
            // Update in-place inside classrooms list.
            setClassrooms(prev => prev.map(c => c.classId === cls.classId ? cls : c));
            // Cheap reads only on the initial load — assignments + posts. Student
            // data costs 3 Firestore reads per student and is only needed for the
            // Students + Assignments tabs, so it's deferred to the effect below.
            const [assignmentList, postList] = await Promise.all([
                listAssignmentsForClassroom(cls.classId),
                listPostsForClassroom(cls.classId),
            ]);
            setAssignments(assignmentList);
            setPosts(postList);
            // If students were already loaded for this class, refresh them too
            // (the user explicitly hit Refresh and they're already paying for it).
            if (students.length > 0 || showSpinner) {
                const studentData = await fetchStudentData(cls);
                setStudents(studentData);
            }
            setError(null);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Failed to load classroom data.');
        } finally {
            setRefreshing(false);
        }
    }, [activeClassroom, fetchStudentData, students.length]);

    // Deferred student-progress fetch: only when the current tab actually needs
    // it (Students or Assignments). Teachers who only post to the Stream pay 0
    // student reads.
    const needsStudentData = tab === 'students' || tab === 'assignments';
    useEffect(() => {
        if (!activeClassroom || !needsStudentData || students.length > 0) return;
        let cancelled = false;
        fetchStudentData(activeClassroom).then(data => {
            if (!cancelled) setStudents(data);
        });
        return () => { cancelled = true; };
    }, [activeClassroom?.classId, needsStudentData, students.length, fetchStudentData]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => { loadClassrooms(); }, [loadClassrooms]);
    // When switching classes, drop the stale student list so the deferred
    // fetch above re-runs for the new class on tab open.
    useEffect(() => {
        setStudents([]);
        if (activeClassroom) loadClassroomData();
    }, [activeClassroom?.classId, loadClassroomData]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Actions ───────────────────────────────────────────────────────────────

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newClassName.trim()) return;
        setCreateSubmitting(true);
        setError(null);
        try {
            const created = await createClassroom(user.id, user.name, newClassName.trim());
            await refreshUser();
            // Optimistically add + activate.
            setClassrooms(prev => [...prev, created]);
            setActiveClassId(created.classId);
            setNewClassName('');
            setCreatingNew(false);
            setClassroomMenuOpen(false);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to create classroom.');
        } finally {
            setCreateSubmitting(false);
        }
    };

    const copyJoinCode = () => {
        if (!activeClassroom) return;
        navigator.clipboard.writeText(activeClassroom.joinCode).catch(() => {});
        setCodeCopied(true);
        setTimeout(() => setCodeCopied(false), 2000);
    };

    const toggleCourseUnlock = async (studentId: string, courseId: string) => {
        const student = students.find(s => s.uid === studentId);
        if (!student) return;
        const next = student.unlockedCourseIds.includes(courseId)
            ? student.unlockedCourseIds.filter(c => c !== courseId)
            : [...student.unlockedCourseIds, courseId];
        // Optimistic update.
        setStudents(prev => prev.map(s => s.uid === studentId ? { ...s, unlockedCourseIds: next } : s));
        try {
            await setStudentUnlockedCourses(studentId, next);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Failed to update unlocks.');
            // Revert.
            setStudents(prev => prev.map(s => s.uid === studentId ? { ...s, unlockedCourseIds: student.unlockedCourseIds } : s));
        }
    };

    const handleDeleteAssignment = async (a: Assignment) => {
        if (!activeClassroom) return;
        try {
            await deleteAssignment(activeClassroom.classId, a.id);
            setAssignments(prev => prev.filter(x => x.id !== a.id));
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Failed to delete assignment.');
        }
    };

    const handleCreatePost = async (content: string) => {
        if (!activeClassroom || !user) return;
        const created = await createPost({
            classroomId: activeClassroom.classId,
            teacherId: user.id,
            teacherName: user.name,
            content,
        });
        // Prepend so it appears at the top immediately (StreamView re-sorts anyway).
        setPosts(prev => [created, ...prev]);
    };

    const handleDeletePost = async (p: Post) => {
        if (!activeClassroom) return;
        try {
            await deletePost(activeClassroom.classId, p.id);
            setPosts(prev => prev.filter(x => x.id !== p.id));
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Failed to delete post.');
        }
    };

    const handleTogglePin = async (p: Post) => {
        if (!activeClassroom) return;
        const next = !p.pinned;
        // Optimistic update.
        setPosts(prev => prev.map(x => x.id === p.id ? { ...x, pinned: next } : x));
        try {
            await setPostPinned(activeClassroom.classId, p.id, next);
        } catch (e: unknown) {
            setPosts(prev => prev.map(x => x.id === p.id ? { ...x, pinned: !next } : x));
            setError(e instanceof Error ? e.message : 'Failed to update pin.');
        }
    };

    const handleRemoveStudent = async (studentId: string) => {
        if (!activeClassroom) return;
        // Optimistic: drop from local students list.
        const previous = students;
        setStudents(prev => prev.filter(s => s.uid !== studentId));
        setClassrooms(prev => prev.map(c => c.classId === activeClassroom.classId
            ? { ...c, studentIds: c.studentIds.filter(id => id !== studentId) }
            : c));
        try {
            await removeStudentFromClassroom(activeClassroom.classId, studentId);
        } catch (e: unknown) {
            setStudents(previous);
            setError(e instanceof Error ? e.message : 'Failed to remove student.');
        }
    };

    // ── No-classroom-yet empty state ──────────────────────────────────────────

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-cyan-500 animate-spin" />
            </div>
        );
    }

    if (classrooms.length === 0) {
        return (
            <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
                    <header className="mb-6">
                        <div className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wide mb-1">Teacher</div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Class</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            You don't have a classroom yet. Create one to get a join code for your students.
                        </p>
                    </header>
                    <form onSubmit={handleCreate} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-2">Class name</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newClassName}
                                onChange={(e) => setNewClassName(e.target.value)}
                                className="flex-1 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-gray-900 dark:text-white text-sm"
                                placeholder="e.g. Grade 8 Python, Period 3"
                                maxLength={60}
                                autoFocus
                            />
                            <button type="submit" disabled={createSubmitting || !newClassName.trim()}
                                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                                {createSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
                            </button>
                        </div>
                        {error && (
                            <div className="mt-3 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />{error}
                            </div>
                        )}
                    </form>
                </div>
            </div>
        );
    }

    if (!activeClassroom) return null;

    // ── Main hub render ──────────────────────────────────────────────────────

    const avgLessons = students.length
        ? Math.round(students.reduce((sum, s) => sum + s.completedLessons.length, 0) / students.length)
        : 0;

    return (
        <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 min-h-0">
            {/* Top bar: classroom switcher + actions */}
            <div className="flex items-center gap-3 px-4 sm:px-6 py-3 border-b border-gray-200 dark:border-gray-800 flex-shrink-0 flex-wrap">
                <div className="relative">
                    <div className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-[0.08em] mb-0.5 ml-0.5">Class</div>
                    <button
                        onClick={() => setClassroomMenuOpen(o => !o)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-sm font-semibold text-gray-900 dark:text-white shadow-sm"
                        aria-haspopup="listbox"
                        aria-expanded={classroomMenuOpen}
                    >
                        <span className="truncate max-w-[220px]">{activeClassroom.className}</span>
                        <span className="text-xs text-gray-400">{visibleClassrooms.length > 1 ? `· ${visibleClassrooms.length}` : ''}</span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${classroomMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {classroomMenuOpen && (
                        <div className="absolute left-0 top-full mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 p-1">
                            {visibleClassrooms.map(c => (
                                <button
                                    key={c.classId}
                                    onClick={() => { setActiveClassId(c.classId); setClassroomMenuOpen(false); setCreatingNew(false); }}
                                    className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center justify-between gap-2 transition-colors ${
                                        c.classId === activeClassId
                                            ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 font-semibold'
                                            : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
                                    }`}
                                >
                                    <span className="truncate flex items-center gap-1.5">
                                        {c.archived && <Archive className="w-3 h-3 text-gray-400 flex-shrink-0" />}
                                        {c.className}
                                    </span>
                                    {c.classId === activeClassId && <CheckCheck className="w-4 h-4 flex-shrink-0" />}
                                </button>
                            ))}
                            {archivedCount > 0 && (
                                <button
                                    onClick={() => setShowArchived(s => !s)}
                                    className="w-full text-left px-3 py-1.5 rounded-md text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-1.5"
                                >
                                    {showArchived ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                    {showArchived ? 'Hide archived' : `Show archived (${archivedCount})`}
                                </button>
                            )}
                            <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                            {!creatingNew ? (
                                <button
                                    onClick={() => setCreatingNew(true)}
                                    className="w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 font-semibold"
                                >
                                    <Plus className="w-4 h-4" /> New classroom
                                </button>
                            ) : (
                                <form onSubmit={handleCreate} className="p-2 space-y-2">
                                    <input
                                        type="text"
                                        value={newClassName}
                                        onChange={(e) => setNewClassName(e.target.value)}
                                        className="w-full px-2 py-1.5 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                        placeholder="Class name"
                                        maxLength={60}
                                        autoFocus
                                    />
                                    <div className="flex gap-2">
                                        <button type="button" onClick={() => { setCreatingNew(false); setNewClassName(''); }}
                                            className="flex-1 px-2 py-1 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                                            Cancel
                                        </button>
                                        <button type="submit" disabled={createSubmitting || !newClassName.trim()}
                                            className="flex-1 px-2 py-1 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 rounded">
                                            {createSubmitting ? '…' : 'Create'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}
                </div>

                {/* Compact join code + refresh */}
                <div className="flex items-end gap-2 ml-auto">
                    <div className="hidden sm:flex flex-col">
                        <div className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-[0.08em] mb-0.5 ml-0.5">Join code</div>
                        <button
                            onClick={copyJoinCode}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 shadow-sm group"
                            title="Copy join code"
                        >
                            <span className="font-mono font-bold text-sm text-gray-900 dark:text-white tracking-[0.2em]">{activeClassroom.joinCode}</span>
                            {codeCopied
                                ? <CheckCheck className="w-3.5 h-3.5 text-green-500" />
                                : <Copy className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />}
                        </button>
                    </div>
                    <button
                        onClick={() => loadClassroomData(true)}
                        disabled={refreshing}
                        className="p-2 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 shadow-sm disabled:opacity-50"
                        title="Refresh"
                        aria-label="Refresh classroom data"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={() => setSettingsOpen(true)}
                        className="p-2 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 shadow-sm"
                        title="Classroom settings"
                        aria-label="Open classroom settings"
                    >
                        <Settings className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {error && (
                <div className="mx-4 sm:mx-6 mt-3 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-300 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-0 px-4 sm:px-6 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
                {([
                    { id: 'stream', label: 'Stream', count: posts.length + assignments.length },
                    { id: 'students', label: 'Students', count: students.length },
                    { id: 'lessons', label: 'Lessons', count: undefined },
                    { id: 'assignments', label: 'Assignments', count: assignments.length },
                ] as { id: Tab; label: string; count?: number }[]).map(t => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
                            tab === t.id
                                ? 'text-gray-900 dark:text-white'
                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                        {t.label}
                        {t.count !== undefined && t.count > 0 && (
                            <span className={`ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-semibold ${
                                tab === t.id
                                    ? 'bg-cyan-500 text-white'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                            }`}>{t.count}</span>
                        )}
                        {tab === t.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500" />}
                    </button>
                ))}
            </div>

            {/* Tab content fills remaining space */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5">
                {tab === 'stream' && (
                    <StreamView
                        posts={posts}
                        assignments={assignments}
                        canPost
                        onCreatePost={handleCreatePost}
                        onDeletePost={handleDeletePost}
                        onDeleteAssignment={handleDeleteAssignment}
                        onTogglePin={handleTogglePin}
                        classroomId={activeClassroom.classId}
                        isClassTeacher
                    />
                )}
                {tab === 'students' && (
                    <StudentsTab
                        students={students}
                        assignments={assignments}
                        avgLessons={avgLessons}
                        expandedStudent={expandedStudent}
                        onExpand={(id) => setExpandedStudent(p => p === id ? null : id)}
                        onToggleCourseUnlock={toggleCourseUnlock}
                        onRemoveStudent={handleRemoveStudent}
                    />
                )}
                {tab === 'lessons' && (
                    <LessonsTab
                        modules={modules}
                        expandedCourse={expandedCourseInLessons}
                        onToggleCourse={(id) => setExpandedCourseInLessons(p => p === id ? null : id)}
                        onAssign={(t) => setAssignTarget(t)}
                    />
                )}
                {tab === 'assignments' && (
                    <AssignmentsTab
                        assignments={assignments}
                        students={students}
                        onDelete={handleDeleteAssignment}
                    />
                )}
            </div>

            {assignTarget && user && (
                <AssignLessonModal
                    classroom={activeClassroom}
                    teacherId={user.id}
                    courseId={assignTarget.courseId}
                    courseTitle={assignTarget.courseTitle}
                    moduleId={assignTarget.moduleId}
                    lessonId={assignTarget.lessonId}
                    lessonTitle={assignTarget.lessonTitle}
                    onClose={() => setAssignTarget(null)}
                    onAssigned={() => loadClassroomData()}
                    students={students.map(s => ({ uid: s.uid, name: s.name, username: s.username }))}
                />
            )}

            {settingsOpen && user && (
                <ClassroomSettingsModal
                    classroom={activeClassroom}
                    teacherId={user.id}
                    onClose={() => setSettingsOpen(false)}
                    onUpdated={(patch) => {
                        // Mirror the change locally so the UI updates without a round-trip.
                        setClassrooms(prev => prev.map(c => c.classId === activeClassroom.classId ? { ...c, ...patch } : c));
                    }}
                    onArchived={(archived) => {
                        if (!archived) return;
                        // Auto-switch to another active class once this one is archived.
                        const next = classrooms.find(c => c.classId !== activeClassroom.classId && !c.archived);
                        if (next) {
                            setActiveClassId(next.classId);
                            setSettingsOpen(false);
                        }
                    }}
                    onDeleted={() => {
                        const remaining = classrooms.filter(c => c.classId !== activeClassroom.classId);
                        setClassrooms(remaining);
                        const nextActive = remaining.find(c => !c.archived) ?? remaining[0] ?? null;
                        setActiveClassId(nextActive?.classId ?? null);
                        setStudents([]);
                        setAssignments([]);
                        setPosts([]);
                    }}
                />
            )}
        </div>
    );
};

// ─── Tab components ──────────────────────────────────────────────────────────

// An assignment targets this student iff it's class-wide (studentIds=null)
// or the student's uid is explicitly listed.
const assignmentTargetsStudent = (a: Assignment, studentId: string): boolean =>
    a.studentIds === null || a.studentIds.includes(studentId);

const StudentsTab: React.FC<{
    students: StudentProgress[];
    assignments: Assignment[];
    avgLessons: number;
    expandedStudent: string | null;
    onExpand: (id: string) => void;
    onToggleCourseUnlock: (studentId: string, courseId: string) => void;
    onRemoveStudent?: (studentId: string) => Promise<void>;
}> = ({ students, assignments, avgLessons, expandedStudent, onExpand, onToggleCourseUnlock, onRemoveStudent }) => {
    const topStudent = students[0];
    const [confirmingRemove, setConfirmingRemove] = React.useState<string | null>(null);
    const [removing, setRemoving] = React.useState(false);
    return (
        <div className="space-y-4">
            {/* Stats strip — inline, minimal chrome */}
            <div className="flex items-baseline gap-6 px-1">
                <div>
                    <div className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-[0.08em]">Students</div>
                    <div className="text-xl font-semibold text-gray-900 dark:text-white tabular-nums">{students.length}</div>
                </div>
                <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
                <div>
                    <div className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-[0.08em]">Avg. lessons</div>
                    <div className="text-xl font-semibold text-gray-900 dark:text-white tabular-nums">{avgLessons}</div>
                </div>
                <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
                <div className="min-w-0">
                    <div className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-[0.08em]">Top</div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {topStudent ? `@${topStudent.username}` : '—'}
                    </div>
                </div>
            </div>

            {/* Student list */}
            {students.length === 0 ? (
                <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-5 py-8 text-center">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">No students yet.</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Share the join code above; students appear here once they join.
                    </p>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden divide-y divide-gray-100 dark:divide-gray-700">
                    {students.map((s, idx) => {
                        const isExpanded = expandedStudent === s.uid;
                        return (
                            <div key={s.uid}>
                                <button
                                    onClick={() => onExpand(s.uid)}
                                    className="w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors text-left"
                                >
                                    <span className="w-5 text-xs font-bold text-gray-400 flex-shrink-0">{idx + 1}</span>
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                        {s.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-sm text-gray-900 dark:text-white truncate">{s.name}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">@{s.username}</div>
                                    </div>
                                    <div className="hidden md:flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                                        <div className="flex items-center gap-1">
                                            <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                                            <span className="font-semibold">{s.completedLessons.length}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Star className="w-3.5 h-3.5 text-yellow-400" />
                                            <span className="font-semibold">{s.totalStars}</span>
                                        </div>
                                        {s.unlockedCourseIds.length > 0 && (
                                            <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400" title={`${s.unlockedCourseIds.length} unlocked course(s)`}>
                                                <Unlock className="w-3.5 h-3.5" />
                                                <span className="font-semibold">{s.unlockedCourseIds.length}</span>
                                            </div>
                                        )}
                                        <div className="text-xs text-gray-400 w-14 text-right">{timeAgo(s.lastActive)}</div>
                                    </div>
                                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                                </button>

                                {isExpanded && (
                                    <div className="px-5 pb-4 pt-1 bg-gray-50/60 dark:bg-gray-900/30 space-y-4">
                                        {/* Mobile stats */}
                                        <div className="md:hidden flex items-center gap-4 py-2 text-xs text-gray-600 dark:text-gray-300">
                                            <span><BookOpen className="inline w-3 h-3 mr-1 text-purple-400" /><span className="font-semibold">{s.completedLessons.length}</span> lessons</span>
                                            <span><Star className="inline w-3 h-3 mr-1 text-yellow-400" /><span className="font-semibold">{s.totalStars}</span></span>
                                            <span className="text-gray-400">{timeAgo(s.lastActive)}</span>
                                        </div>

                                        {/* Per-student course unlocks */}
                                        <div>
                                            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                                                Course access
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                                Toggle on to give this student early access to a course without finishing the prerequisite. Python Basics is always available.
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {GRANTABLE_COURSES.map(c => {
                                                    const granted = s.unlockedCourseIds.includes(c.id);
                                                    return (
                                                        <button
                                                            key={c.id}
                                                            onClick={() => onToggleCourseUnlock(s.uid, c.id)}
                                                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                                                                granted
                                                                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50'
                                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                            }`}
                                                            title={granted ? `Click to revoke access to ${c.title}` : `Click to grant access to ${c.title}`}
                                                        >
                                                            {granted ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                                                            {c.title}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Per-student assignment status */}
                                        {(() => {
                                            const studentAssignments = assignments.filter(a => assignmentTargetsStudent(a, s.uid));
                                            const completedSet = new Set(s.completedLessons);
                                            const completedCount = studentAssignments.filter(a => completedSet.has(a.lessonId)).length;
                                            return (
                                                <div>
                                                    <div className="flex items-baseline justify-between mb-1.5">
                                                        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                                            Assignments
                                                        </div>
                                                        {studentAssignments.length > 0 && (
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                <span className={`font-bold ${completedCount === studentAssignments.length ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                                                    {completedCount}
                                                                </span>
                                                                {' / '}{studentAssignments.length} done
                                                            </div>
                                                        )}
                                                    </div>
                                                    {studentAssignments.length === 0 ? (
                                                        <p className="text-sm text-gray-400">No assignments targeted at this student.</p>
                                                    ) : (
                                                        <ul className="space-y-1">
                                                            {studentAssignments.map(a => {
                                                                const done = completedSet.has(a.lessonId);
                                                                return (
                                                                    <li key={a.id} className="flex items-center gap-2 text-sm">
                                                                        {done ? (
                                                                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                                                                        ) : (
                                                                            <div className="w-3.5 h-3.5 rounded-full border border-gray-300 dark:border-gray-600 flex-shrink-0" />
                                                                        )}
                                                                        <span className={`truncate ${done ? 'text-gray-500 dark:text-gray-400 line-through' : 'text-gray-700 dark:text-gray-200'}`}>
                                                                            {assignmentTitle(a)}
                                                                        </span>
                                                                        {assignmentSubtitle(a) && (
                                                                            <span className="text-xs text-gray-400 truncate">· {assignmentSubtitle(a)}</span>
                                                                        )}
                                                                    </li>
                                                                );
                                                            })}
                                                        </ul>
                                                    )}
                                                </div>
                                            );
                                        })()}

                                        {/* Completed lessons */}
                                        <div>
                                            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                                                All Completed Lessons
                                            </div>
                                            {s.completedLessons.length === 0 ? (
                                                <p className="text-sm text-gray-400">None yet.</p>
                                            ) : (
                                                <div className="flex flex-wrap gap-1.5">
                                                    {s.completedLessons.slice(0, 20).map(id => (
                                                        <span key={id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs">
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            {id}
                                                        </span>
                                                    ))}
                                                    {s.completedLessons.length > 20 && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 text-xs">
                                                            +{s.completedLessons.length - 20} more
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {s.currentStreak > 0 && (
                                            <div className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                                                {s.currentStreak}-day streak
                                            </div>
                                        )}

                                        {/* Remove from class — destructive action, sits at the bottom */}
                                        {onRemoveStudent && (
                                            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                                                {confirmingRemove !== s.uid ? (
                                                    <button
                                                        onClick={() => setConfirmingRemove(s.uid)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-900"
                                                    >
                                                        <UserMinus className="w-3.5 h-3.5" />
                                                        Remove from class
                                                    </button>
                                                ) : (
                                                    <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-900/10">
                                                        <span className="text-xs text-red-700 dark:text-red-300 flex-1">
                                                            Remove <span className="font-semibold">{s.name}</span> from this classroom?
                                                        </span>
                                                        <button
                                                            onClick={() => setConfirmingRemove(null)}
                                                            disabled={removing}
                                                            className="px-2 py-1 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded disabled:opacity-50"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={async () => {
                                                                setRemoving(true);
                                                                try {
                                                                    await onRemoveStudent(s.uid);
                                                                    setConfirmingRemove(null);
                                                                } finally {
                                                                    setRemoving(false);
                                                                }
                                                            }}
                                                            disabled={removing}
                                                            className="px-2 py-1 text-xs font-bold text-white bg-red-600 hover:bg-red-500 disabled:opacity-50 rounded"
                                                        >
                                                            {removing ? '…' : 'Remove'}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const LessonsTab: React.FC<{
    modules: Module[];
    expandedCourse: string | null;
    onToggleCourse: (id: string) => void;
    onAssign: (target: { moduleId: string; lessonId: string; lessonTitle: string; courseId: string; courseTitle: string }) => void;
}> = ({ modules, expandedCourse, onToggleCourse, onAssign }) => {
    const allModuleIds = modules.map(m => m.id);
    return (
        <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
                Browse the curriculum. Tap "Assign" on any lesson to push it to the class.
            </p>
            {COURSES.map(course => {
                const moduleIds = resolveCourseModuleIds(course.id, allModuleIds);
                const courseModules = moduleIds.map(id => modules.find(m => m.id === id)).filter((m): m is Module => !!m);
                const expanded = expandedCourse === course.id;
                const isAssignable = !course.comingSoon && courseModules.length > 0;
                return (
                    <div key={course.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <button
                            onClick={() => isAssignable && onToggleCourse(course.id)}
                            disabled={!isAssignable}
                            className={`w-full flex items-center justify-between px-5 py-3 transition-colors ${
                                isAssignable
                                    ? 'hover:bg-gray-50 dark:hover:bg-gray-700/40 cursor-pointer'
                                    : 'cursor-not-allowed opacity-60'
                            }`}
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div className={`w-1 h-8 rounded-full bg-gradient-to-b ${course.accentColor}`} />
                                <div className="min-w-0 text-left">
                                    <div className="font-semibold text-sm text-gray-900 dark:text-white truncate">{course.title}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {course.comingSoon
                                            ? 'Material coming soon'
                                            : `${courseModules.length} module${courseModules.length === 1 ? '' : 's'}`}
                                    </div>
                                </div>
                            </div>
                            {isAssignable && (expanded
                                ? <ChevronUp className="w-4 h-4 text-gray-400" />
                                : <ChevronDown className="w-4 h-4 text-gray-400" />)}
                        </button>

                        {expanded && isAssignable && (
                            <div className="border-t border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
                                {courseModules.map(module => (
                                    <div key={module.id} className="px-5 py-3">
                                        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                                            {module.title}
                                        </div>
                                        <div className="space-y-1">
                                            {module.lessons.map((lesson, lessonIndex) => (
                                                <div key={lesson.id} className="flex items-center gap-3 py-1.5 px-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                                    <span className="w-6 text-center text-xs font-bold text-gray-400">{lessonIndex + 1}</span>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm text-gray-900 dark:text-white truncate">{lesson.title}</div>
                                                    </div>
                                                    <button
                                                        onClick={() => onAssign({
                                                            moduleId: module.id,
                                                            lessonId: lesson.id,
                                                            lessonTitle: lesson.title,
                                                            courseId: course.id,
                                                            courseTitle: course.title,
                                                        })}
                                                        className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 hover:bg-cyan-200 dark:hover:bg-cyan-900/50"
                                                    >
                                                        <ClipboardList className="w-3.5 h-3.5" />
                                                        Assign
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

const AssignmentsTab: React.FC<{
    assignments: Assignment[];
    students: StudentProgress[];
    onDelete: (a: Assignment) => void;
}> = ({ assignments, students, onDelete }) => {
    const [expanded, setExpanded] = useState<string | null>(null);

    if (assignments.length === 0) {
        return (
            <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-5 py-10 text-center">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">No assignments yet.</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Open the Lessons tab and click Assign on a lesson to push it to your class.
                </p>
            </div>
        );
    }

    const studentById = new Map(students.map(s => [s.uid, s] as const));

    // For an assignment, compute who is targeted, who's done, and who's pending.
    // NOTE: practice completion lives in a different progress doc than lessons.
    // For now the teacher view only sees lesson-style completion; practice
    // assignments report 0/N until per-practice-item completion is wired in.
    const getStatus = (a: Assignment) => {
        const targetIds = a.studentIds === null ? students.map(s => s.uid) : a.studentIds;
        const targetStudents = targetIds.map(id => studentById.get(id)).filter((s): s is StudentProgress => !!s);
        const targetItemId = a.kind === 'practice' ? a.practiceItem?.id : a.lessonId;
        const completed = targetItemId
            ? targetStudents.filter(s => s.completedLessons.includes(targetItemId))
            : [];
        const pending = targetItemId
            ? targetStudents.filter(s => !s.completedLessons.includes(targetItemId))
            : targetStudents;
        return { total: targetStudents.length, completed, pending };
    };

    return (
        <div className="space-y-3">
            {/* Overall summary strip — inline, minimal chrome */}
            <div className="flex items-baseline gap-6 px-1">
                <div>
                    <div className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-[0.08em]">Assignments</div>
                    <div className="text-xl font-semibold text-gray-900 dark:text-white tabular-nums">{assignments.length}</div>
                </div>
                <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
                <div>
                    <div className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-[0.08em]">Submissions</div>
                    <div className="text-xl font-semibold text-gray-900 dark:text-white tabular-nums">
                        {assignments.reduce((sum, a) => sum + getStatus(a).completed.length, 0)}
                    </div>
                </div>
                <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
                <div>
                    <div className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-[0.08em]">Overdue</div>
                    <div className={`text-xl font-semibold tabular-nums ${
                        assignments.filter(a => a.dueAt !== null && a.dueAt < Date.now()).length > 0
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-gray-900 dark:text-white'
                    }`}>
                        {assignments.filter(a => a.dueAt !== null && a.dueAt < Date.now()).length}
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden divide-y divide-gray-100 dark:divide-gray-700">
                {assignments.map(a => {
                    const status = getStatus(a);
                    const isOpen = expanded === a.id;
                    const allDone = status.total > 0 && status.pending.length === 0;
                    const overdue = a.dueAt !== null && a.dueAt < Date.now();

                    return (
                        <div key={a.id}>
                            <button
                                onClick={() => setExpanded(p => p === a.id ? null : a.id)}
                                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors text-left"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-sm text-gray-900 dark:text-white truncate">{assignmentTitle(a)}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-3 mt-0.5">
                                        {assignmentSubtitle(a) && <span className="truncate">{assignmentSubtitle(a)}</span>}
                                        <span className={`flex items-center gap-1 ${overdue ? 'text-red-600 dark:text-red-400 font-medium' : ''}`}>
                                            <Calendar className="w-3 h-3" />
                                            {formatDue(a.dueAt)}
                                        </span>
                                        <span>
                                            {a.studentIds === null ? 'Whole class' : `${a.studentIds.length} student${a.studentIds.length === 1 ? '' : 's'}`}
                                        </span>
                                    </div>
                                </div>
                                {/* Completion pill */}
                                <div className={`hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${
                                    allDone
                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                        : status.completed.length === 0
                                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                                            : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                                }`}>
                                    <CheckCircle2 className="w-3 h-3" />
                                    {status.completed.length} / {status.total}
                                </div>
                                {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDelete(a); }}
                                    className="p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0"
                                    title="Delete assignment"
                                    aria-label="Delete assignment"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </button>

                            {isOpen && (
                                <div className="px-5 pb-4 pt-1 bg-gray-50/60 dark:bg-gray-900/30 grid sm:grid-cols-2 gap-4">
                                    {/* Pending list */}
                                    <div>
                                        <div className="flex items-center gap-1.5 mb-2">
                                            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Pending</span>
                                            <span className="text-xs text-gray-400">({status.pending.length})</span>
                                        </div>
                                        {status.pending.length === 0 ? (
                                            <p className="text-sm text-green-600 dark:text-green-400 font-medium">Everyone is done.</p>
                                        ) : (
                                            <ul className="space-y-1">
                                                {status.pending.map(s => (
                                                    <li key={s.uid} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                                                        <div className="w-3.5 h-3.5 rounded-full border border-gray-300 dark:border-gray-600 flex-shrink-0" />
                                                        <span className="truncate">{s.name}</span>
                                                        <span className="text-xs text-gray-400 truncate">@{s.username}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                    {/* Done list */}
                                    <div>
                                        <div className="flex items-center gap-1.5 mb-2">
                                            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Done</span>
                                            <span className="text-xs text-gray-400">({status.completed.length})</span>
                                        </div>
                                        {status.completed.length === 0 ? (
                                            <p className="text-sm text-gray-400">No one yet.</p>
                                        ) : (
                                            <ul className="space-y-1">
                                                {status.completed.map(s => (
                                                    <li key={s.uid} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                                                        <span className="truncate">{s.name}</span>
                                                        <span className="text-xs text-gray-400 truncate">@{s.username}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

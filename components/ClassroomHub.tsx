import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    ArrowRight,
    Loader2,
    AlertCircle,
    Copy,
    CheckCheck,
    LogOut,
    Calendar,
    ExternalLink,
    ClipboardList,
} from 'lucide-react';
import {
    joinClassroom,
    getClassroom,
    setUserRole,
    leaveClassroom,
} from '../services/classroomService';
import { listAssignmentsForStudent } from '../services/assignmentsService';
import { listPostsForClassroom } from '../services/postsService';
import type { Classroom, Post, Assignment } from '../types';
import type { ViewState } from './Header';
import { StreamView } from './StreamView';
import { assignmentTitle, assignmentSubtitle, assignmentOpenPath } from '../utils/assignmentDisplay';

interface ClassroomHubProps {
    onNavigate: (view: ViewState) => void;
}

type StudentTab = 'stream' | 'assignments' | 'info';

// Module-level so its identity is stable across renders — defining this inside
// the component would remount its children on every keystroke (losing input focus).
const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">{children}</div>
    </div>
);

export const ClassroomHub: React.FC<ClassroomHubProps> = ({ onNavigate }) => {
    const { user, refreshUser } = useAuth();

    const [settingRole, setSettingRole] = useState(false);
    const [joinCode, setJoinCode] = useState('');
    const [joinError, setJoinError] = useState<string | null>(null);
    const [joinLoading, setJoinLoading] = useState(false);
    const [classroom, setClassroom] = useState<Classroom | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [classLoading, setClassLoading] = useState(false);
    const [codeCopied, setCodeCopied] = useState(false);
    const [leaving, setLeaving] = useState(false);
    const [studentTab, setStudentTab] = useState<StudentTab>('stream');

    const loadClassroom = useCallback(async () => {
        if (!user?.classId) { setClassroom(null); return; }
        setClassLoading(true);
        try {
            const cls = await getClassroom(user.classId);
            setClassroom(cls);
            if (cls) {
                const [postList, assignmentList] = await Promise.all([
                    listPostsForClassroom(cls.classId),
                    listAssignmentsForStudent(user.id, cls.classId),
                ]);
                setPosts(postList);
                setAssignments(assignmentList);
            }
        } catch {
            setClassroom(null);
        } finally {
            setClassLoading(false);
        }
    }, [user?.classId, user?.id]);

    useEffect(() => { loadClassroom(); }, [loadClassroom]);

    if (!user) return null;

    const chooseTeacher = async () => {
        setSettingRole(true);
        try {
            await setUserRole(user.id, 'teacher');
            await refreshUser();
            onNavigate('teacher');
        } finally {
            setSettingRole(false);
        }
    };

    const chooseStudent = async () => {
        setSettingRole(true);
        try {
            await setUserRole(user.id, 'student');
            await refreshUser();
        } finally {
            setSettingRole(false);
        }
    };

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (joinCode.length !== 6) return;
        setJoinLoading(true);
        setJoinError(null);
        try {
            await joinClassroom(user.id, joinCode.trim());
            await refreshUser();
            await loadClassroom();
        } catch (err: unknown) {
            setJoinError(err instanceof Error ? err.message : 'Invalid join code');
        } finally {
            setJoinLoading(false);
        }
    };

    const copyJoinCode = () => {
        if (!classroom) return;
        navigator.clipboard.writeText(classroom.joinCode).catch(() => {});
        setCodeCopied(true);
        setTimeout(() => setCodeCopied(false), 2000);
    };

    const handleLeave = async () => {
        if (!classroom) return;
        setLeaving(true);
        try {
            await leaveClassroom(user.id, classroom.classId);
            await refreshUser();
            setClassroom(null);
            setJoinCode('');
        } finally {
            setLeaving(false);
        }
    };

    // ── No role yet → compact chooser ──────────────────────────────────────────
    if (!user.role) {
        return (
            <Shell>
                <header className="mb-5">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Classroom</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Are you a teacher or a student? This sets up the right classroom tools for you.
                    </p>
                </header>

                <div className="grid sm:grid-cols-2 gap-3">
                    <button
                        onClick={chooseTeacher}
                        disabled={settingRole}
                        className="text-left rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-cyan-500 dark:hover:border-cyan-500 hover:shadow-md p-4 transition-all disabled:opacity-60 group"
                    >
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wide">Teacher</span>
                            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-cyan-500 transition-colors" />
                        </div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">I'm a teacher</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Create a class, share a join code, and track student progress.
                        </p>
                    </button>

                    <button
                        onClick={chooseStudent}
                        disabled={settingRole}
                        className="text-left rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-md p-4 transition-all disabled:opacity-60 group"
                    >
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide">Student</span>
                            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-purple-500 transition-colors" />
                        </div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">I'm a student</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Join your teacher's class with a 6-letter code.
                        </p>
                    </button>
                </div>

                {settingRole && (
                    <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-500">
                        <Loader2 className="w-4 h-4 animate-spin" /> Setting up…
                    </div>
                )}
            </Shell>
        );
    }

    // ── Teacher → compact pointer to My Class ──────────────────────────────────
    if (user.role === 'teacher') {
        return (
            <Shell>
                <header className="mb-5">
                    <div className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wide">Teacher</div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Classroom</h1>
                </header>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            Manage your class, share your join code, and track student progress from <span className="font-semibold">My Class</span>.
                        </p>
                    </div>
                    <button
                        onClick={() => onNavigate('teacher')}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold rounded-md transition-colors flex-shrink-0"
                    >
                        Open <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </Shell>
        );
    }

    // ── Student: already in a classroom ────────────────────────────────────────
    if (user.classId) {
        if (classLoading) {
            return <Shell><div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-purple-500 animate-spin" /></div></Shell>;
        }
        if (classroom) {
            return (
                <Shell>
                    <header className="mb-5">
                        <div className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-[0.08em] mb-0.5">Classroom</div>
                        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white truncate">{classroom.className}</h1>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            {classroom.teacherName} · {classroom.studentIds.length} {classroom.studentIds.length === 1 ? 'student' : 'students'}
                        </div>
                    </header>

                    {/* Student tabs */}
                    <div className="flex gap-0 mb-5 border-b border-gray-200 dark:border-gray-800">
                        {([
                            { id: 'stream' as StudentTab, label: 'Stream', count: posts.length + assignments.length },
                            { id: 'assignments' as StudentTab, label: 'Assignments', count: assignments.length },
                            { id: 'info' as StudentTab, label: 'Class info' },
                        ]).map(t => (
                            <button
                                key={t.id}
                                onClick={() => setStudentTab(t.id)}
                                className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
                                    studentTab === t.id
                                        ? 'text-gray-900 dark:text-white'
                                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                            >
                                {t.label}
                                {t.count !== undefined && t.count > 0 && (
                                    <span className={`ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-semibold ${
                                        studentTab === t.id
                                            ? 'bg-purple-500 text-white'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                                    }`}>{t.count}</span>
                                )}
                                {studentTab === t.id && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
                                )}
                            </button>
                        ))}
                    </div>

                    {studentTab === 'stream' ? (
                        <StreamView
                            posts={posts}
                            assignments={assignments}
                            canPost={false}
                            showOpenButton
                        />
                    ) : studentTab === 'assignments' ? (
                        <StudentAssignmentsList assignments={assignments} />
                    ) : (
                        <div className="space-y-3">
                            <dl className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-3 px-1">
                                <dt className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-[0.08em] self-center">Teacher</dt>
                                <dd className="text-sm font-medium text-gray-900 dark:text-white">{classroom.teacherName}</dd>

                                <dt className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-[0.08em] self-center">Classmates</dt>
                                <dd className="text-sm font-medium text-gray-900 dark:text-white tabular-nums">{classroom.studentIds.length}</dd>

                                <dt className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-[0.08em] self-center">Join code</dt>
                                <dd>
                                    <button
                                        onClick={copyJoinCode}
                                        className="inline-flex items-center gap-1.5 font-mono font-semibold tracking-[0.2em] text-sm text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400"
                                    >
                                        {classroom.joinCode}
                                        {codeCopied ? <CheckCheck className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                                    </button>
                                </dd>
                            </dl>
                            <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                                <button
                                    onClick={handleLeave}
                                    disabled={leaving}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors disabled:opacity-60"
                                >
                                    {leaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
                                    Leave classroom
                                </button>
                            </div>
                        </div>
                    )}
                </Shell>
            );
        }
        // classId set but classroom doc missing → fall through to the join form.
    }

    // ── Student: not in a classroom → compact join form ────────────────────────
    return (
        <Shell>
            <header className="mb-5">
                <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide">Student</div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Join a classroom</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Enter the 6-letter code your teacher gave you.
                </p>
            </header>

            <form onSubmit={handleJoin} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-3">
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Join code</label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={joinCode}
                        onChange={(e) => { setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z]/g, '')); setJoinError(null); }}
                        className={`flex-1 px-3 py-2 text-lg font-bold font-mono tracking-[0.3em] text-center rounded-lg bg-gray-50 dark:bg-gray-900 border outline-none transition-all ${
                            joinError ? 'border-red-400 focus:ring-2 focus:ring-red-500' : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
                        }`}
                        placeholder="ABCDEF"
                        maxLength={6}
                        autoFocus
                        autoCapitalize="characters"
                    />
                    <button
                        type="submit"
                        disabled={joinLoading || joinCode.length !== 6}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {joinLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Join <ArrowRight className="w-4 h-4" /></>}
                    </button>
                </div>
                {joinError && (
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4" /> {joinError}
                    </p>
                )}
            </form>
        </Shell>
    );
};

// Read-only list of assignments for the joined student.
// Sorted by due-date (overdue first → soonest → no-due-date last).
const StudentAssignmentsList: React.FC<{
    assignments: Assignment[];
}> = ({ assignments }) => {
    const sorted = [...assignments].sort((a, b) => {
        const A = a.dueAt ?? Number.POSITIVE_INFINITY;
        const B = b.dueAt ?? Number.POSITIVE_INFINITY;
        return A - B;
    });

    const formatDue = (dueAt: number | null) => {
        if (dueAt === null) return { label: 'No due date', tone: 'none' as const };
        const d = dueAt - Date.now();
        const day = 24 * 60 * 60 * 1000;
        if (d < 0) return { label: 'Overdue', tone: 'overdue' as const };
        if (d < day) return { label: 'Due today', tone: 'soon' as const };
        if (d < 3 * day) return { label: `Due in ${Math.ceil(d / day)} days`, tone: 'soon' as const };
        return { label: `Due ${new Date(dueAt).toLocaleDateString()}`, tone: 'later' as const };
    };

    if (sorted.length === 0) {
        return (
            <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-5 py-10 text-center">
                <ClipboardList className="w-6 h-6 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">No assignments yet.</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    When your teacher assigns a lesson, it'll show up here.
                </p>
            </div>
        );
    }

    return (
        <ul className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden divide-y divide-gray-100 dark:divide-gray-700">
            {sorted.map(a => {
                const due = formatDue(a.dueAt);
                const toneClass =
                    due.tone === 'overdue' ? 'text-red-600 dark:text-red-400' :
                    due.tone === 'soon' ? 'text-amber-700 dark:text-amber-400' :
                    'text-gray-500 dark:text-gray-400';
                return (
                    <li key={a.id} className="flex items-center gap-3 px-5 py-3">
                        <div className="min-w-0 flex-1">
                            <div className="font-semibold text-sm text-gray-900 dark:text-white truncate">{assignmentTitle(a)}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-3 mt-0.5">
                                {assignmentSubtitle(a) && <span className="truncate">{assignmentSubtitle(a)}</span>}
                                <span className={`flex items-center gap-1 font-medium ${toneClass}`}>
                                    <Calendar className="w-3 h-3" />
                                    {due.label}
                                </span>
                            </div>
                        </div>
                        <a
                            href={assignmentOpenPath(a)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-md flex-shrink-0"
                        >
                            Open
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    </li>
                );
            })}
        </ul>
    );
};

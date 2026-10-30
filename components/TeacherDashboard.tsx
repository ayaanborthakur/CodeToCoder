import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    Copy,
    CheckCheck,
    CheckCircle2,
    RefreshCw,
    AlertCircle,
    ChevronDown,
    ChevronRight,
    Plus,
    Trash2,
    ClipboardList,
    Calendar,
    Lock,
    Unlock,
    Archive,
    UserMinus,
    GraduationCap,
    UserPlus,
    Users,
    X,
    Maximize2,
    Megaphone,
    Dumbbell,
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
import {
    loadClassroomStudents,
    assignmentTargets,
    isAssignmentDone,
    DAY_MS,
    type StudentProgress,
} from '../services/classroomProgressService';
import type { Classroom, Module, Assignment, Post, School } from '../types';
import { COURSES, resolveCourseModuleIds } from '../data/coursesData';
import { AssignLessonModal } from './AssignLessonModal';
import { StreamView } from './StreamView';
import { ClassroomSettingsModal } from './ClassroomSettingsModal';
import { assignmentTitle, assignmentSubtitle, dueLabel } from '../utils/assignmentDisplay';
import { getSchool, listSchoolsForRegistrar, listPendingJoinRequests, approveSchoolJoin, rejectSchoolJoin, type PendingSchoolJoin } from '../services/schoolService';
import {
    Page,
    PageHeader,
    Section,
    Card,
    List,
    Button,
    LinkButton,
    RouteTabs,
    Pill,
    Stat,
    ProgressBar,
    Avatar,
    EmptyState,
    Alert,
    Spinner,
    Field,
    inputClass,
} from './ui';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const timeAgo = (ts: number | null): string => {
    if (!ts) return 'Not yet';
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
};

// Courses other than Python Basics — those a teacher might grant early access to.
const GRANTABLE_COURSES = COURSES.filter(c => c.prerequisiteCourseId !== null);

const INACTIVE_AFTER_MS = 7 * DAY_MS;

type ClassTab = 'overview' | 'assignments' | 'students' | 'stream' | 'settings';
const CLASS_TABS: ClassTab[] = ['overview', 'assignments', 'students', 'stream', 'settings'];

interface AssignmentStatus {
    targeted: StudentProgress[];
    done: StudentProgress[];
    pending: StudentProgress[];
}

const statusFor = (a: Assignment, students: StudentProgress[]): AssignmentStatus => {
    const targeted = students.filter(s => assignmentTargets(a, s.uid));
    const done = targeted.filter(s => isAssignmentDone(a, s.completedLessons, s.completedPractice));
    return { targeted, done, pending: targeted.filter(s => !done.includes(s)) };
};

// ─── Entry: picks the classes list or a single class from the URL ────────────

interface TeacherDashboardProps {
    modules: Module[];
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ modules }) => {
    const { user } = useAuth();
    const { classId } = useParams<{ classId?: string }>();
    const [classrooms, setClassrooms] = useState<Classroom[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    const loadClassrooms = useCallback(async () => {
        if (!user) return;
        try {
            setClassrooms(await listTeacherClassrooms(user.id));
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Could not load your classes.');
            setClassrooms([]);
        }
    }, [user]);

    useEffect(() => { loadClassrooms(); }, [loadClassrooms]);

    if (!user) return null;
    if (classrooms === null) return <Page><Spinner label="Loading classes" /></Page>;

    if (!classId) {
        return (
            <ClassesList
                classrooms={classrooms}
                error={error}
                onCreated={(c) => setClassrooms(prev => [...(prev ?? []), c])}
            />
        );
    }

    const classroom = classrooms.find(c => c.classId === classId);
    if (!classroom) return <Navigate to="/teacher" replace />;

    return (
        <ClassView
            key={classroom.classId}
            classroom={classroom}
            modules={modules}
            onClassroomChange={(patch) => setClassrooms(prev => (prev ?? []).map(c => c.classId === classId ? { ...c, ...patch } : c))}
            onClassroomRemoved={() => setClassrooms(prev => (prev ?? []).filter(c => c.classId !== classId))}
        />
    );
};

// ─── Classes list ────────────────────────────────────────────────────────────

const ClassesList: React.FC<{
    classrooms: Classroom[];
    error: string | null;
    onCreated: (c: Classroom) => void;
}> = ({ classrooms, error, onCreated }) => {
    const { user, refreshUser } = useAuth();
    const navigate = useNavigate();
    const [creating, setCreating] = useState(classrooms.length === 0);
    const [name, setName] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);
    const [showArchived, setShowArchived] = useState(false);
    const school = useTeacherSchool();

    const active = classrooms.filter(c => !c.archived);
    const archived = classrooms.filter(c => c.archived);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !name.trim()) return;
        setSubmitting(true);
        setCreateError(null);
        try {
            const created = await createClassroom(user.id, user.name, name.trim());
            await refreshUser();
            onCreated(created);
            navigate(`/teacher/${created.classId}/overview`);
        } catch (err: unknown) {
            setCreateError(err instanceof Error ? err.message : 'Could not create the class.');
            setSubmitting(false);
        }
    };

    return (
        <Page width="narrow">
            <PageHeader
                eyebrow="Teacher"
                title="Classes"
                description={classrooms.length === 0
                    ? 'Create a class to get a join code for your students.'
                    : 'Open a class to see assignments, students and announcements.'}
                actions={!creating && (
                    <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setCreating(true)}>
                        New class
                    </Button>
                )}
            />

            {error && <Alert tone="danger" icon={<AlertCircle className="w-4 h-4" />} className="mb-6">{error}</Alert>}

            {creating && (
                <Card className="mb-6">
                    <form onSubmit={handleCreate} className="space-y-3">
                        <Field label="Class name" htmlFor="new-class-name" hint="Students see this name when they join.">
                            <input
                                id="new-class-name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={inputClass}
                                placeholder="e.g. Grade 8 Python, Period 3"
                                maxLength={60}
                                autoFocus
                            />
                        </Field>
                        {createError && <p className="text-sm text-red-600 dark:text-red-400">{createError}</p>}
                        <div className="flex gap-2 justify-end">
                            {classrooms.length > 0 && (
                                <Button variant="ghost" onClick={() => { setCreating(false); setName(''); }}>Cancel</Button>
                            )}
                            <Button type="submit" variant="primary" loading={submitting} disabled={!name.trim()}>
                                Create class
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            {active.length > 0 && (
                <Section title="Your classes">
                    <List>
                        {active.map(c => <ClassRow key={c.classId} classroom={c} />)}
                    </List>
                </Section>
            )}

            <Section title="School">
                {school.school ? (
                    <Card className="flex items-center gap-3">
                        <GraduationCap className="w-5 h-5 text-cyan-600 dark:text-cyan-400 flex-shrink-0" aria-hidden="true" />
                        <div className="min-w-0 flex-1">
                            <div className="font-semibold text-gray-900 dark:text-white truncate">{school.school.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                {school.isRegistrar ? 'You registered this school.' : 'Your school'}
                            </div>
                        </div>
                    </Card>
                ) : (
                    <Card className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="min-w-0 flex-1">
                            <div className="font-semibold text-gray-900 dark:text-white">Your school isn't registered yet</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Registering lets students from your school find and join your classes.</div>
                        </div>
                        <LinkButton to="/schools" icon={<GraduationCap className="w-4 h-4" />}>Register school</LinkButton>
                    </Card>
                )}
                {school.pending.length > 0 && <PendingJoins school={school} />}
            </Section>

            {archived.length > 0 && (
                <Section>
                    <button
                        onClick={() => setShowArchived(s => !s)}
                        className="no-hover flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        aria-expanded={showArchived}
                    >
                        {showArchived ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        Archived classes ({archived.length})
                    </button>
                    {showArchived && (
                        <List className="mt-3">
                            {archived.map(c => <ClassRow key={c.classId} classroom={c} />)}
                        </List>
                    )}
                </Section>
            )}
        </Page>
    );
};

const ClassRow: React.FC<{ classroom: Classroom }> = ({ classroom }) => {
    const count = Array.isArray(classroom.studentIds) ? classroom.studentIds.length : 0;
    return (
        <li>
            <Link
                to={`/teacher/${classroom.classId}/overview`}
                className="no-hover flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/40"
            >
                <div className="w-10 h-10 rounded-lg bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center flex-shrink-0">
                    {classroom.archived ? <Archive className="w-5 h-5" aria-hidden="true" /> : <Users className="w-5 h-5" aria-hidden="true" />}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white truncate">{classroom.className}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {count} {count === 1 ? 'student' : 'students'}
                        {classroom.description ? ` · ${classroom.description}` : ''}
                    </div>
                </div>
                <span className="hidden sm:block font-mono text-sm font-semibold tracking-[0.2em] text-gray-500 dark:text-gray-400">{classroom.joinCode}</span>
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" aria-hidden="true" />
            </Link>
        </li>
    );
};

// ─── School (registrar) ──────────────────────────────────────────────────────

const useTeacherSchool = () => {
    const { user } = useAuth();
    const [school, setSchool] = useState<School | null>(null);
    const [pending, setPending] = useState<PendingSchoolJoin[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [actingOn, setActingOn] = useState<{ uid: string; mode: 'approve' | 'reject' } | null>(null);

    useEffect(() => {
        if (!user?.id) return;
        let cancelled = false;
        (async () => {
            try {
                let s: School | null = null;
                if (user.schoolId) s = await getSchool(user.schoolId);
                if (!s) s = (await listSchoolsForRegistrar(user.id))[0] ?? null;
                if (cancelled) return;
                setSchool(s);
                // Only the registrar may read join requests (rule-enforced).
                if (s && s.registrarId === user.id) {
                    const list = await listPendingJoinRequests(s.id).catch(() => []);
                    if (!cancelled) setPending(list);
                }
            } catch { /* non-fatal: the school card just shows "not registered" */ }
        })();
        return () => { cancelled = true; };
    }, [user?.id, user?.schoolId]);

    const act = async (uid: string, mode: 'approve' | 'reject') => {
        setActingOn({ uid, mode });
        const previous = pending;
        setPending(prev => prev.filter(p => p.userId !== uid));
        try {
            if (mode === 'approve') await approveSchoolJoin(uid);
            else await rejectSchoolJoin(uid);
        } catch (e: unknown) {
            setPending(previous);
            setError(e instanceof Error ? e.message : `Could not ${mode} this student.`);
        } finally {
            setActingOn(null);
        }
    };

    return { school, pending, error, actingOn, act, isRegistrar: !!school && school.registrarId === user?.id };
};

const PendingJoins: React.FC<{ school: ReturnType<typeof useTeacherSchool> }> = ({ school }) => (
    <Card className="mt-3" padded={false}>
        <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 dark:border-gray-700">
            <UserPlus className="w-4 h-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {school.pending.length} {school.pending.length === 1 ? 'student wants' : 'students want'} to join {school.school?.name}
            </h3>
        </div>
        {school.error && <Alert tone="danger" className="m-3">{school.error}</Alert>}
        <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {school.pending.map(p => {
                const busy = school.actingOn?.uid === p.userId;
                return (
                    <li key={p.userId} className="flex items-center gap-3 px-5 py-3">
                        <Avatar name={p.name} src={p.avatar} size="sm" />
                        <div className="min-w-0 flex-1">
                            <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">{p.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{p.username ? `@${p.username}` : (p.email ?? '')}</div>
                        </div>
                        <Button size="sm" variant="primary" loading={busy && school.actingOn?.mode === 'approve'} disabled={busy} onClick={() => school.act(p.userId, 'approve')}>
                            Approve
                        </Button>
                        <Button size="sm" variant="ghost" loading={busy && school.actingOn?.mode === 'reject'} disabled={busy} onClick={() => school.act(p.userId, 'reject')}>
                            Decline
                        </Button>
                    </li>
                );
            })}
        </ul>
    </Card>
);

// ─── A single class ──────────────────────────────────────────────────────────

const ClassView: React.FC<{
    classroom: Classroom;
    modules: Module[];
    onClassroomChange: (patch: Partial<Classroom>) => void;
    onClassroomRemoved: () => void;
}> = ({ classroom, modules, onClassroomChange, onClassroomRemoved }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { tab: tabParam, sub } = useParams<{ tab?: string; sub?: string }>();
    const tab: ClassTab = CLASS_TABS.includes(tabParam as ClassTab) ? (tabParam as ClassTab) : 'overview';

    const [students, setStudents] = useState<StudentProgress[] | null>(null);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [codeCopied, setCodeCopied] = useState(false);
    const [projecting, setProjecting] = useState(false);
    const [assignTarget, setAssignTarget] = useState<{ moduleId: string; lessonId: string; lessonTitle: string; courseId: string; courseTitle: string } | null>(null);

    const base = `/teacher/${classroom.classId}`;

    const load = useCallback(async () => {
        setRefreshing(true);
        try {
            // Re-read the classroom so studentIds is current.
            const fresh = (await getClassroom(classroom.classId)) ?? classroom;
            const [assignmentList, postList, studentList] = await Promise.all([
                listAssignmentsForClassroom(fresh.classId),
                listPostsForClassroom(fresh.classId),
                loadClassroomStudents(fresh),
            ]);
            setAssignments(assignmentList);
            setPosts(postList);
            setStudents(studentList);
            if (fresh.studentIds?.length !== classroom.studentIds?.length) onClassroomChange({ studentIds: fresh.studentIds });
            setError(null);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Could not load this class.');
            setStudents(prev => prev ?? []);
        } finally {
            setRefreshing(false);
        }
    }, [classroom.classId]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => { load(); }, [load]);

    const copyJoinCode = () => {
        navigator.clipboard.writeText(classroom.joinCode).catch(() => {});
        setCodeCopied(true);
        setTimeout(() => setCodeCopied(false), 2000);
    };

    // ── Mutations (optimistic, with rollback) ──
    const handleDeleteAssignment = async (a: Assignment) => {
        if (!window.confirm(`Delete "${assignmentTitle(a)}"? Students will no longer see it.`)) return;
        const previous = assignments;
        setAssignments(prev => prev.filter(x => x.id !== a.id));
        try {
            await deleteAssignment(classroom.classId, a.id);
        } catch (e: unknown) {
            setAssignments(previous);
            setError(e instanceof Error ? e.message : 'Could not delete the assignment.');
        }
    };

    const handleCreatePost = async (content: string) => {
        if (!user) return;
        const created = await createPost({ classroomId: classroom.classId, teacherId: user.id, teacherName: user.name, content });
        setPosts(prev => [created, ...prev]);
    };

    const handleDeletePost = async (p: Post) => {
        const previous = posts;
        setPosts(prev => prev.filter(x => x.id !== p.id));
        try {
            await deletePost(classroom.classId, p.id);
        } catch (e: unknown) {
            setPosts(previous);
            setError(e instanceof Error ? e.message : 'Could not delete the post.');
        }
    };

    const handleTogglePin = async (p: Post) => {
        const next = !p.pinned;
        setPosts(prev => prev.map(x => x.id === p.id ? { ...x, pinned: next } : x));
        try {
            await setPostPinned(classroom.classId, p.id, next);
        } catch (e: unknown) {
            setPosts(prev => prev.map(x => x.id === p.id ? { ...x, pinned: !next } : x));
            setError(e instanceof Error ? e.message : 'Could not update the pin.');
        }
    };

    const handleToggleCourseUnlock = async (studentId: string, courseId: string) => {
        const student = students?.find(s => s.uid === studentId);
        if (!student) return;
        const next = student.unlockedCourseIds.includes(courseId)
            ? student.unlockedCourseIds.filter(c => c !== courseId)
            : [...student.unlockedCourseIds, courseId];
        setStudents(prev => prev?.map(s => s.uid === studentId ? { ...s, unlockedCourseIds: next } : s) ?? null);
        try {
            await setStudentUnlockedCourses(studentId, next);
        } catch (e: unknown) {
            setStudents(prev => prev?.map(s => s.uid === studentId ? { ...s, unlockedCourseIds: student.unlockedCourseIds } : s) ?? null);
            setError(e instanceof Error ? e.message : 'Could not update course access.');
        }
    };

    const handleRemoveStudent = async (studentId: string) => {
        const previous = students;
        setStudents(prev => prev?.filter(s => s.uid !== studentId) ?? null);
        try {
            await removeStudentFromClassroom(classroom.classId, studentId);
            onClassroomChange({ studentIds: classroom.studentIds.filter(id => id !== studentId) });
        } catch (e: unknown) {
            setStudents(previous);
            setError(e instanceof Error ? e.message : 'Could not remove the student.');
        }
    };

    const studentCount = students?.length ?? (Array.isArray(classroom.studentIds) ? classroom.studentIds.length : 0);

    return (
        <Page width="default">
            <PageHeader
                back={{ to: '/teacher', label: 'All classes' }}
                title={classroom.className}
                description={classroom.archived ? 'Archived class' : (classroom.description || `${studentCount} ${studentCount === 1 ? 'student' : 'students'}`)}
                actions={
                    <>
                        <button
                            onClick={copyJoinCode}
                            className="no-hover inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
                            title="Copy join code"
                        >
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Join code</span>
                            <span className="font-mono font-bold tracking-[0.2em] text-gray-900 dark:text-white">{classroom.joinCode}</span>
                            {codeCopied ? <CheckCheck className="w-4 h-4 text-green-500" aria-label="Copied" /> : <Copy className="w-4 h-4 text-gray-400" aria-hidden="true" />}
                        </button>
                        <Button variant="secondary" icon={<Maximize2 className="w-4 h-4" />} onClick={() => setProjecting(true)} aria-label="Show join code full screen" title="Show join code full screen" />
                        <Button variant="secondary" icon={<RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />} onClick={load} disabled={refreshing} aria-label="Refresh" title="Refresh" />
                    </>
                }
            />

            <RouteTabs
                className="mb-6"
                tabs={[
                    { to: `${base}/overview`, label: 'Overview' },
                    { to: `${base}/assignments`, label: 'Assignments', count: assignments.length },
                    { to: `${base}/students`, label: 'Students', count: studentCount },
                    { to: `${base}/stream`, label: 'Stream', count: posts.length },
                    { to: `${base}/settings`, label: 'Settings' },
                ]}
            />

            {error && <Alert tone="danger" icon={<AlertCircle className="w-4 h-4" />} className="mb-6">{error}</Alert>}

            {students === null && tab !== 'settings' && tab !== 'stream' ? (
                <Spinner label="Loading class" />
            ) : (
                <>
                    {tab === 'overview' && (
                        <OverviewTab
                            base={base}
                            classroom={classroom}
                            students={students ?? []}
                            assignments={assignments}
                            posts={posts}
                            onShowCode={() => setProjecting(true)}
                        />
                    )}
                    {tab === 'assignments' && sub !== 'new' && (
                        <AssignmentsTab base={base} assignments={assignments} students={students ?? []} onDelete={handleDeleteAssignment} />
                    )}
                    {tab === 'assignments' && sub === 'new' && (
                        <CurriculumPicker base={base} modules={modules} onAssign={setAssignTarget} />
                    )}
                    {tab === 'students' && (
                        <StudentsTab
                            joinCode={classroom.joinCode}
                            students={students ?? []}
                            assignments={assignments}
                            onToggleCourseUnlock={handleToggleCourseUnlock}
                            onRemoveStudent={handleRemoveStudent}
                        />
                    )}
                    {tab === 'stream' && (
                        <StreamView
                            posts={posts}
                            assignments={assignments}
                            canPost
                            onCreatePost={handleCreatePost}
                            onDeletePost={handleDeletePost}
                            onDeleteAssignment={async (a) => handleDeleteAssignment(a)}
                            onTogglePin={handleTogglePin}
                            classroomId={classroom.classId}
                            isClassTeacher
                        />
                    )}
                    {tab === 'settings' && user && (
                        <ClassroomSettingsModal
                            inline
                            classroom={classroom}
                            teacherId={user.id}
                            onClose={() => navigate(`${base}/overview`)}
                            onUpdated={onClassroomChange}
                            onArchived={(archived) => onClassroomChange({ archived })}
                            onDeleted={() => { onClassroomRemoved(); navigate('/teacher', { replace: true }); }}
                        />
                    )}
                </>
            )}

            {assignTarget && user && (
                <AssignLessonModal
                    classroom={classroom}
                    teacherId={user.id}
                    courseId={assignTarget.courseId}
                    courseTitle={assignTarget.courseTitle}
                    moduleId={assignTarget.moduleId}
                    lessonId={assignTarget.lessonId}
                    lessonTitle={assignTarget.lessonTitle}
                    onClose={() => setAssignTarget(null)}
                    onAssigned={() => { setAssignTarget(null); load(); navigate(`${base}/assignments`); }}
                    students={(students ?? []).map(s => ({ uid: s.uid, name: s.name, username: s.username }))}
                />
            )}

            {projecting && <JoinCodeProjector classroom={classroom} onClose={() => setProjecting(false)} />}
        </Page>
    );
};

// ─── Overview ────────────────────────────────────────────────────────────────

const OverviewTab: React.FC<{
    base: string;
    classroom: Classroom;
    students: StudentProgress[];
    assignments: Assignment[];
    posts: Post[];
    onShowCode: () => void;
}> = ({ base, classroom, students, assignments, posts, onShowCode }) => {
    const now = Date.now();
    const activeThisWeek = students.filter(s => s.lastActive && now - s.lastActive < INACTIVE_AFTER_MS).length;
    const inactive = students.filter(s => !s.lastActive || now - s.lastActive >= INACTIVE_AFTER_MS);
    const avgLessons = students.length
        ? Math.round(students.reduce((sum, s) => sum + s.completedLessons.length, 0) / students.length)
        : 0;
    const overdue = assignments
        .filter(a => a.dueAt !== null && a.dueAt < now)
        .map(a => ({ a, status: statusFor(a, students) }))
        .filter(x => x.status.pending.length > 0);
    const openAssignments = assignments.filter(a => a.dueAt === null || a.dueAt >= now).length;
    const recentPosts = [...posts].sort((a, b) => b.createdAt - a.createdAt).slice(0, 3);

    if (students.length === 0) {
        return (
            <EmptyState
                icon={<Users className="w-5 h-5" />}
                title="No students yet"
                description={<>Ask students to open <span className="font-semibold">Class</span> in Code2Coder and enter the join code <span className="font-mono font-bold tracking-widest">{classroom.joinCode}</span>.</>}
                action={<Button variant="primary" icon={<Maximize2 className="w-4 h-4" />} onClick={onShowCode}>Show code to the class</Button>}
            />
        );
    }

    return (
        <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                <Stat label="Students" value={students.length} />
                <Stat label="Active this week" value={activeThisWeek} hint={`of ${students.length}`} />
                <Stat label="Avg. lessons done" value={avgLessons} />
                <Stat label="Open assignments" value={openAssignments} hint={overdue.length ? `${overdue.length} overdue` : undefined} tone={overdue.length ? 'danger' : 'default'} />
            </div>

            <Section title="Needs attention">
                {overdue.length === 0 && inactive.length === 0 ? (
                    <Alert tone="success" icon={<CheckCircle2 className="w-4 h-4" />}>Everything is on track. No overdue work and everyone has been active this week.</Alert>
                ) : (
                    <List>
                        {overdue.map(({ a, status }) => (
                            <li key={a.id}>
                                <Link to={`${base}/assignments`} className="no-hover flex items-center gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/40">
                                    <Calendar className="w-4 h-4 text-red-500 flex-shrink-0" aria-hidden="true" />
                                    <div className="min-w-0 flex-1">
                                        <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">{assignmentTitle(a)} is overdue</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">{status.pending.length} of {status.targeted.length} haven't finished</div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-400" aria-hidden="true" />
                                </Link>
                            </li>
                        ))}
                        {inactive.length > 0 && (
                            <li>
                                <Link to={`${base}/students`} className="no-hover flex items-center gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/40">
                                    <Users className="w-4 h-4 text-amber-500 flex-shrink-0" aria-hidden="true" />
                                    <div className="min-w-0 flex-1">
                                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                            {inactive.length} {inactive.length === 1 ? 'student hasn\'t' : 'students haven\'t'} practiced this week
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                            {inactive.slice(0, 4).map(s => s.name).join(', ')}{inactive.length > 4 ? ` and ${inactive.length - 4} more` : ''}
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-400" aria-hidden="true" />
                                </Link>
                            </li>
                        )}
                    </List>
                )}
            </Section>

            <Section title="Latest announcements" action={<Link to={`${base}/stream`} className="text-sm font-semibold text-cyan-600 dark:text-cyan-400 hover:underline">Open stream</Link>}>
                {recentPosts.length === 0 ? (
                    <EmptyState icon={<Megaphone className="w-5 h-5" />} title="No announcements yet" action={<LinkButton to={`${base}/stream`} size="sm">Post an announcement</LinkButton>} />
                ) : (
                    <List>
                        {recentPosts.map(p => (
                            <li key={p.id} className="px-5 py-3">
                                <p className="text-sm text-gray-800 dark:text-gray-200 line-clamp-2 whitespace-pre-wrap">{p.content}</p>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</p>
                            </li>
                        ))}
                    </List>
                )}
            </Section>
        </>
    );
};

// ─── Assignments ─────────────────────────────────────────────────────────────

const AssignmentsTab: React.FC<{
    base: string;
    assignments: Assignment[];
    students: StudentProgress[];
    onDelete: (a: Assignment) => void;
}> = ({ base, assignments, students, onDelete }) => {
    const [open, setOpen] = useState<string | null>(null);
    const sorted = useMemo(
        () => [...assignments].sort((a, b) => (a.dueAt ?? Infinity) - (b.dueAt ?? Infinity) || b.assignedAt - a.assignedAt),
        [assignments],
    );

    const actions = (
        <div className="flex flex-wrap gap-2">
            <LinkButton to={`${base}/assignments/new`} variant="primary" icon={<ClipboardList className="w-4 h-4" />}>Assign a lesson</LinkButton>
            <LinkButton to="/practice" icon={<Dumbbell className="w-4 h-4" />}>Assign practice</LinkButton>
        </div>
    );

    if (assignments.length === 0) {
        return (
            <EmptyState
                icon={<ClipboardList className="w-5 h-5" />}
                title="No assignments yet"
                description="Assign a lesson from the curriculum, or a quiz, problem or project from Practice. Students see it on their Class page."
                action={actions}
            />
        );
    }

    return (
        <Section title={`${assignments.length} ${assignments.length === 1 ? 'assignment' : 'assignments'}`} action={actions}>
            <List>
                {sorted.map(a => {
                    const status = statusFor(a, students);
                    const due = dueLabel(a.dueAt);
                    const isOpen = open === a.id;
                    const allDone = status.targeted.length > 0 && status.pending.length === 0;
                    return (
                        <li key={a.id}>
                            <div className="flex items-center gap-3 px-5 py-4">
                                <button
                                    onClick={() => setOpen(p => p === a.id ? null : a.id)}
                                    className="no-hover flex-1 min-w-0 flex items-center gap-4 text-left"
                                    aria-expanded={isOpen}
                                >
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-semibold text-gray-900 dark:text-white truncate">{assignmentTitle(a)}</span>
                                            <Pill tone={due.tone}>{due.text}</Pill>
                                        </div>
                                        <div className="mt-0.5 text-sm text-gray-500 dark:text-gray-400 truncate">
                                            {[assignmentSubtitle(a), a.studentIds === null ? 'Whole class' : `${a.studentIds.length} selected ${a.studentIds.length === 1 ? 'student' : 'students'}`].filter(Boolean).join(' · ')}
                                        </div>
                                    </div>
                                    <div className="hidden sm:block w-40 flex-shrink-0">
                                        <div className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1 tabular-nums">
                                            {status.targeted.length === 0 ? 'No students yet' : `${status.done.length} of ${status.targeted.length} done`}
                                        </div>
                                        <ProgressBar value={status.done.length} max={status.targeted.length} tone={allDone ? 'success' : 'accent'} label="Completion" />
                                    </div>
                                    <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                                </button>
                                <button
                                    onClick={() => onDelete(a)}
                                    className="no-hover p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0"
                                    aria-label={`Delete ${assignmentTitle(a)}`}
                                    title="Delete assignment"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            {isOpen && (
                                <div className="px-5 pb-4 grid sm:grid-cols-2 gap-4 border-t border-gray-100 dark:border-gray-700 pt-4 bg-gray-50/60 dark:bg-gray-900/30">
                                    <StudentNameList title="Not finished" students={status.pending} empty="Everyone has finished." />
                                    <StudentNameList title="Finished" students={status.done} empty="No one yet." done />
                                </div>
                            )}
                        </li>
                    );
                })}
            </List>
        </Section>
    );
};

const StudentNameList: React.FC<{ title: string; students: StudentProgress[]; empty: string; done?: boolean }> = ({ title, students, empty, done }) => (
    <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{title} ({students.length})</h3>
        {students.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">{empty}</p>
        ) : (
            <ul className="space-y-1.5">
                {students.map(s => (
                    <li key={s.uid} className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
                        {done
                            ? <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" aria-hidden="true" />
                            : <span className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600 flex-shrink-0" aria-hidden="true" />}
                        <span className="truncate">{s.name}</span>
                    </li>
                ))}
            </ul>
        )}
    </div>
);

const CurriculumPicker: React.FC<{
    base: string;
    modules: Module[];
    onAssign: (t: { moduleId: string; lessonId: string; lessonTitle: string; courseId: string; courseTitle: string }) => void;
}> = ({ base, modules, onAssign }) => {
    const allIds = modules.map(m => m.id);
    const [openCourse, setOpenCourse] = useState<string | null>(COURSES[0]?.id ?? null);
    return (
        <>
            <Link to={`${base}/assignments`} className="no-hover inline-flex items-center gap-1.5 mb-4 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                <X className="w-4 h-4" aria-hidden="true" /> Cancel
            </Link>
            <Section title="Choose a lesson to assign">
                <div className="space-y-3">
                    {COURSES.map(course => {
                        const courseModules = resolveCourseModuleIds(course.id, allIds)
                            .map(id => modules.find(m => m.id === id))
                            .filter((m): m is Module => !!m);
                        const assignable = !course.comingSoon && courseModules.length > 0;
                        const expanded = openCourse === course.id && assignable;
                        return (
                            <Card key={course.id} padded={false} className={assignable ? '' : 'opacity-60'}>
                                <button
                                    onClick={() => assignable && setOpenCourse(p => p === course.id ? null : course.id)}
                                    disabled={!assignable}
                                    className="no-hover w-full flex items-center justify-between gap-3 px-5 py-4 text-left disabled:cursor-not-allowed"
                                    aria-expanded={expanded}
                                >
                                    <div className="min-w-0">
                                        <div className="font-semibold text-gray-900 dark:text-white">{course.title}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {course.comingSoon ? 'Coming soon' : `${courseModules.length} ${courseModules.length === 1 ? 'module' : 'modules'}`}
                                        </div>
                                    </div>
                                    {assignable && <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} aria-hidden="true" />}
                                </button>
                                {expanded && (
                                    <div className="border-t border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
                                        {courseModules.map(module => (
                                            <div key={module.id} className="px-5 py-3">
                                                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{module.title}</h3>
                                                <ul>
                                                    {module.lessons.map((lesson, i) => (
                                                        <li key={lesson.id} className="flex items-center gap-3 py-1.5">
                                                            <span className="w-6 text-right text-xs font-semibold text-gray-400 tabular-nums">{i + 1}</span>
                                                            <span className="flex-1 min-w-0 text-sm text-gray-900 dark:text-white truncate">{lesson.title}</span>
                                                            <Button
                                                                size="sm"
                                                                onClick={() => onAssign({ moduleId: module.id, lessonId: lesson.id, lessonTitle: lesson.title, courseId: course.id, courseTitle: course.title })}
                                                            >
                                                                Assign
                                                            </Button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Card>
                        );
                    })}
                </div>
            </Section>
        </>
    );
};

// ─── Students ────────────────────────────────────────────────────────────────

const StudentsTab: React.FC<{
    joinCode: string;
    students: StudentProgress[];
    assignments: Assignment[];
    onToggleCourseUnlock: (studentId: string, courseId: string) => void;
    onRemoveStudent: (studentId: string) => Promise<void>;
}> = ({ joinCode, students, assignments, onToggleCourseUnlock, onRemoveStudent }) => {
    const [open, setOpen] = useState<string | null>(null);

    if (students.length === 0) {
        return (
            <EmptyState
                icon={<Users className="w-5 h-5" />}
                title="No students yet"
                description={<>Students join from their Class page with the code <span className="font-mono font-bold tracking-widest">{joinCode}</span>.</>}
            />
        );
    }

    return (
        <Card padded={false} className="overflow-hidden">
            <div className="hidden md:grid grid-cols-[minmax(0,1fr)_90px_120px_80px_100px_24px] gap-4 px-5 py-2.5 border-b border-gray-100 dark:border-gray-700 text-xs font-semibold text-gray-500 dark:text-gray-400">
                <span>Student</span>
                <span className="text-right">Lessons</span>
                <span>Assignments</span>
                <span className="text-right">Stars</span>
                <span className="text-right">Last active</span>
                <span />
            </div>
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                {students.map(s => {
                    const mine = assignments.filter(a => assignmentTargets(a, s.uid));
                    const done = mine.filter(a => isAssignmentDone(a, s.completedLessons, s.completedPractice)).length;
                    const isOpen = open === s.uid;
                    return (
                        <li key={s.uid}>
                            <button
                                onClick={() => setOpen(p => p === s.uid ? null : s.uid)}
                                className="no-hover w-full grid grid-cols-[minmax(0,1fr)_24px] md:grid-cols-[minmax(0,1fr)_90px_120px_80px_100px_24px] gap-4 items-center px-5 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/40"
                                aria-expanded={isOpen}
                            >
                                <span className="flex items-center gap-3 min-w-0">
                                    <Avatar name={s.name} src={s.avatar} size="sm" />
                                    <span className="min-w-0">
                                        <span className="block text-sm font-semibold text-gray-900 dark:text-white truncate">{s.name}</span>
                                        <span className="block text-xs text-gray-500 dark:text-gray-400 truncate">@{s.username}</span>
                                    </span>
                                </span>
                                <span className="hidden md:block text-right text-sm font-semibold tabular-nums text-gray-800 dark:text-gray-200">{s.completedLessons.length}</span>
                                <span className="hidden md:block">
                                    {mine.length === 0 ? (
                                        <span className="text-sm text-gray-400">—</span>
                                    ) : (
                                        <>
                                            <span className="block text-xs font-semibold text-gray-600 dark:text-gray-300 tabular-nums mb-1">{done} / {mine.length}</span>
                                            <ProgressBar value={done} max={mine.length} tone={done === mine.length ? 'success' : 'accent'} />
                                        </>
                                    )}
                                </span>
                                <span className="hidden md:block text-right text-sm tabular-nums text-gray-700 dark:text-gray-300">{s.totalStars}</span>
                                <span className={`hidden md:block text-right text-sm ${!s.lastActive || Date.now() - s.lastActive >= INACTIVE_AFTER_MS ? 'text-amber-600 dark:text-amber-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                    {timeAgo(s.lastActive)}
                                </span>
                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                            </button>
                            {isOpen && (
                                <StudentDetail
                                    student={s}
                                    assignments={mine}
                                    onToggleCourseUnlock={onToggleCourseUnlock}
                                    onRemove={() => onRemoveStudent(s.uid)}
                                />
                            )}
                        </li>
                    );
                })}
            </ul>
        </Card>
    );
};

const StudentDetail: React.FC<{
    student: StudentProgress;
    assignments: Assignment[];
    onToggleCourseUnlock: (studentId: string, courseId: string) => void;
    onRemove: () => Promise<void>;
}> = ({ student: s, assignments, onToggleCourseUnlock, onRemove }) => {
    const [confirming, setConfirming] = useState(false);
    const [removing, setRemoving] = useState(false);
    return (
        <div className="px-5 pb-5 pt-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/30 grid md:grid-cols-2 gap-6">
            <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Assignments</h3>
                {assignments.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Nothing assigned to this student.</p>
                ) : (
                    <ul className="space-y-1.5">
                        {assignments.map(a => {
                            const done = isAssignmentDone(a, s.completedLessons, s.completedPractice);
                            return (
                                <li key={a.id} className="flex items-center gap-2 text-sm">
                                    {done
                                        ? <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" aria-label="Done" />
                                        : <span className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600 flex-shrink-0" aria-label="Not done" />}
                                    <span className="truncate text-gray-800 dark:text-gray-200">{assignmentTitle(a)}</span>
                                </li>
                            );
                        })}
                    </ul>
                )}
                <div className="mt-4 flex gap-4 text-sm text-gray-600 dark:text-gray-400 md:hidden">
                    <span>{s.completedLessons.length} lessons</span>
                    <span>{s.totalStars} stars</span>
                    <span>Active {timeAgo(s.lastActive).toLowerCase()}</span>
                </div>
                {s.currentStreak > 0 && <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{s.currentStreak}-day streak</p>}
            </div>
            <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Course access</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Unlock a course early, before this student finishes the one before it.</p>
                <div className="flex flex-wrap gap-2">
                    {GRANTABLE_COURSES.map(c => {
                        const granted = s.unlockedCourseIds.includes(c.id);
                        return (
                            <button
                                key={c.id}
                                onClick={() => onToggleCourseUnlock(s.uid, c.id)}
                                aria-pressed={granted}
                                className={`no-hover inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                                    granted
                                        ? 'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800'
                                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                }`}
                            >
                                {granted ? <Unlock className="w-3 h-3" aria-hidden="true" /> : <Lock className="w-3 h-3" aria-hidden="true" />}
                                {c.title}
                            </button>
                        );
                    })}
                </div>
                <div className="mt-6">
                    {!confirming ? (
                        <Button size="sm" variant="danger" icon={<UserMinus className="w-3.5 h-3.5" />} onClick={() => setConfirming(true)}>
                            Remove from class
                        </Button>
                    ) : (
                        <Alert tone="danger">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="flex-1 min-w-[12rem]">Remove <span className="font-semibold">{s.name}</span> from this class? Their progress is kept.</span>
                                <Button size="sm" variant="ghost" onClick={() => setConfirming(false)} disabled={removing}>Cancel</Button>
                                <Button
                                    size="sm"
                                    className="!bg-red-600 hover:!bg-red-500 !text-white !border-transparent"
                                    loading={removing}
                                    onClick={async () => {
                                        setRemoving(true);
                                        try { await onRemove(); } finally { setRemoving(false); }
                                    }}
                                >
                                    Remove
                                </Button>
                            </div>
                        </Alert>
                    )}
                </div>
            </div>
        </div>
    );
};

// ─── Join code for the projector ─────────────────────────────────────────────

const JoinCodeProjector: React.FC<{ classroom: Classroom; onClose: () => void }> = ({ classroom, onClose }) => {
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);
    return (
        <div className="fixed inset-0 z-[100] bg-white dark:bg-gray-950 flex flex-col items-center justify-center p-8 text-center" role="dialog" aria-modal="true" aria-label="Join code">
            <button onClick={onClose} className="no-hover absolute top-5 right-5 p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Close">
                <X className="w-6 h-6" />
            </button>
            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-400">Join <span className="font-semibold text-gray-900 dark:text-white">{classroom.className}</span></p>
            <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">Open Code2Coder → Class, then enter</p>
            <p className="mt-8 font-mono font-bold text-6xl sm:text-8xl lg:text-9xl tracking-[0.25em] text-gray-900 dark:text-white">{classroom.joinCode}</p>
        </div>
    );
};

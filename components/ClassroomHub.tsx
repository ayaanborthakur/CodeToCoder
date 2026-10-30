import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    ArrowRight,
    Loader2,
    AlertCircle,
    Copy,
    CheckCheck,
    LogOut,
    ClipboardList,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    GraduationCap,
    Users,
} from 'lucide-react';
import {
    joinClassroom,
    getClassroom,
    setUserRole,
    leaveClassroom,
} from '../services/classroomService';
import { listAssignmentsForStudent } from '../services/assignmentsService';
import { listPostsForClassroom } from '../services/postsService';
import { isAssignmentDone } from '../services/classroomProgressService';
import type { Classroom, Post, Assignment } from '../types';
import type { ViewState } from './Header';
import { StreamView } from './StreamView';
import { assignmentTitle, assignmentSubtitle, assignmentOpenPath, dueLabel } from '../utils/assignmentDisplay';
import { Page, PageHeader, Section, Card, List, Button, Pill, EmptyState, Alert, Spinner, Field, inputClass } from './ui';

interface ClassroomHubProps {
    onNavigate: (view: ViewState) => void;
    completedLessons: Set<string>;
    completedPracticeItems: Set<string>;
}

export const ClassroomHub: React.FC<ClassroomHubProps> = ({ onNavigate, completedLessons, completedPracticeItems }) => {
    const { user, refreshUser } = useAuth();

    const [settingRole, setSettingRole] = useState(false);
    const [classroom, setClassroom] = useState<Classroom | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [classLoading, setClassLoading] = useState(!!user?.classId);
    const [loadError, setLoadError] = useState<string | null>(null);

    const loadClassroom = useCallback(async () => {
        if (!user?.classId) { setClassroom(null); setClassLoading(false); return; }
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
            setLoadError(null);
        } catch (e: unknown) {
            setLoadError(e instanceof Error ? e.message : 'Could not load your class.');
        } finally {
            setClassLoading(false);
        }
    }, [user?.classId, user?.id]);

    useEffect(() => { loadClassroom(); }, [loadClassroom]);

    if (!user) return null;
    // Teachers manage their classes from the Classes area.
    if (user.role === 'teacher') return <Navigate to="/teacher" replace />;

    const chooseRole = async (role: 'teacher' | 'student') => {
        setSettingRole(true);
        try {
            await setUserRole(user.id, role);
            await refreshUser();
            if (role === 'teacher') onNavigate('teacher');
        } finally {
            setSettingRole(false);
        }
    };

    // ── No role yet ──
    if (!user.role) {
        return (
            <Page width="narrow">
                <PageHeader title="Class" description="Are you a teacher or a student? This sets up the right class tools for you." />
                <div className="grid sm:grid-cols-2 gap-3">
                    {([
                        { role: 'student' as const, title: "I'm a student", body: "Join your teacher's class with a 6-letter code.", icon: <Users className="w-5 h-5" /> },
                        { role: 'teacher' as const, title: "I'm a teacher", body: 'Create classes, assign work and follow student progress.', icon: <GraduationCap className="w-5 h-5" /> },
                    ]).map(opt => (
                        <button
                            key={opt.role}
                            onClick={() => chooseRole(opt.role)}
                            disabled={settingRole}
                            className="no-hover text-left rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-cyan-500 p-5 disabled:opacity-60"
                        >
                            <span className="w-10 h-10 rounded-lg bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-3">{opt.icon}</span>
                            <span className="block font-bold text-gray-900 dark:text-white">{opt.title}</span>
                            <span className="block mt-1 text-sm text-gray-500 dark:text-gray-400">{opt.body}</span>
                        </button>
                    ))}
                </div>
                {settingRole && <Spinner label="Setting up" />}
            </Page>
        );
    }

    if (user.classId && classLoading) return <Page><Spinner label="Loading your class" /></Page>;

    if (user.classId && classroom) {
        return (
            <StudentClassPage
                classroom={classroom}
                posts={posts}
                assignments={assignments}
                completedLessons={completedLessons}
                completedPracticeItems={completedPracticeItems}
                onLeft={async () => { await refreshUser(); setClassroom(null); }}
            />
        );
    }

    // ── Not in a class (or the class no longer exists) ──
    return <JoinClass error={loadError} onJoined={async () => { await refreshUser(); }} />;
};

// ─── Join ────────────────────────────────────────────────────────────────────

const JoinClass: React.FC<{ error: string | null; onJoined: () => Promise<void> }> = ({ error, onJoined }) => {
    const { user } = useAuth();
    const [code, setCode] = useState('');
    const [joinError, setJoinError] = useState<string | null>(null);
    const [joining, setJoining] = useState(false);

    if (!user) return null;

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (code.length !== 6) return;
        setJoining(true);
        setJoinError(null);
        try {
            await joinClassroom(user.id, code.trim(), user.schoolJoinPending ? undefined : user.schoolId);
            await onJoined();
        } catch (err: unknown) {
            setJoinError(err instanceof Error ? err.message : "That code didn't work. Check it with your teacher.");
            setJoining(false);
        }
    };

    return (
        <Page width="narrow">
            <PageHeader title="Join your class" description="Your teacher will give you a 6-letter code. Enter it here to see your assignments and class announcements." />
            <SchoolPending />
            {error && <Alert tone="danger" icon={<AlertCircle className="w-4 h-4" />} className="mb-4">{error}</Alert>}
            <Card>
                <form onSubmit={handleJoin} className="space-y-4">
                    <Field label="Class code" htmlFor="join-code">
                        <input
                            id="join-code"
                            type="text"
                            value={code}
                            onChange={(e) => { setCode(e.target.value.toUpperCase().replace(/[^A-Z]/g, '')); setJoinError(null); }}
                            className={`${inputClass} !text-2xl font-mono font-bold tracking-[0.4em] text-center !py-3`}
                            placeholder="ABCDEF"
                            maxLength={6}
                            autoFocus
                            autoCapitalize="characters"
                            autoComplete="off"
                            aria-invalid={!!joinError}
                        />
                    </Field>
                    {joinError && (
                        <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1.5">
                            <AlertCircle className="w-4 h-4" /> {joinError}
                        </p>
                    )}
                    <Button type="submit" variant="primary" className="w-full" loading={joining} disabled={code.length !== 6}>
                        Join class <ArrowRight className="w-4 h-4" />
                    </Button>
                </form>
            </Card>
        </Page>
    );
};

/** Shown while a student's request to join a school waits for approval. */
const SchoolPending: React.FC = () => {
    const { user } = useAuth();
    const [schoolName, setSchoolName] = useState<string | null>(null);
    useEffect(() => {
        if (!user?.schoolJoinPending || !user.schoolId) return;
        let cancelled = false;
        import('../services/schoolService')
            .then(({ getSchool }) => getSchool(user.schoolId!))
            .then(s => { if (!cancelled) setSchoolName(s?.name ?? null); })
            .catch(() => {});
        return () => { cancelled = true; };
    }, [user?.schoolId, user?.schoolJoinPending]);

    if (!user?.schoolJoinPending || !user.schoolId) return null;
    return (
        <Alert tone="warning" icon={<Loader2 className="w-4 h-4 animate-spin" />} className="mb-4">
            <span className="font-semibold">Waiting for school approval.</span>{' '}
            {schoolName ? <>A teacher at {schoolName} is reviewing your request.</> : <>A teacher is reviewing your request.</>}
        </Alert>
    );
};

// ─── The student's class ─────────────────────────────────────────────────────

const StudentClassPage: React.FC<{
    classroom: Classroom;
    posts: Post[];
    assignments: Assignment[];
    completedLessons: Set<string>;
    completedPracticeItems: Set<string>;
    onLeft: () => Promise<void>;
}> = ({ classroom, posts, assignments, completedLessons, completedPracticeItems, onLeft }) => {
    const { user } = useAuth();
    const [showDone, setShowDone] = useState(false);
    const [codeCopied, setCodeCopied] = useState(false);
    const [leaving, setLeaving] = useState(false);

    const { todo, done } = useMemo(() => {
        const byDue = [...assignments].sort((a, b) => (a.dueAt ?? Infinity) - (b.dueAt ?? Infinity));
        const isDone = (a: Assignment) => isAssignmentDone(a, completedLessons, completedPracticeItems);
        return { todo: byDue.filter(a => !isDone(a)), done: byDue.filter(isDone) };
    }, [assignments, completedLessons, completedPracticeItems]);

    const classmates = Array.isArray(classroom.studentIds) ? classroom.studentIds.length : 0;

    const handleLeave = async () => {
        if (!user) return;
        const ok = window.confirm(`Leave ${classroom.className || 'this class'}?\n\nYour teacher will stop seeing your progress. You can rejoin later with the class code.`);
        if (!ok) return;
        setLeaving(true);
        try {
            await leaveClassroom(user.id, classroom.classId);
            await onLeft();
        } finally {
            setLeaving(false);
        }
    };

    const copyCode = () => {
        navigator.clipboard.writeText(classroom.joinCode).catch(() => {});
        setCodeCopied(true);
        setTimeout(() => setCodeCopied(false), 2000);
    };

    return (
        <Page width="default">
            <PageHeader
                eyebrow="Your class"
                title={classroom.className}
                description={`Taught by ${classroom.teacherName}`}
            />
            <SchoolPending />

            <div className="grid lg:grid-cols-[minmax(0,1fr)_280px] gap-8">
                <div className="min-w-0">
                    <Section title={todo.length ? `To do (${todo.length})` : 'To do'}>
                        {todo.length === 0 ? (
                            <EmptyState
                                icon={<CheckCircle2 className="w-5 h-5" />}
                                title={assignments.length ? "You're all caught up" : 'Nothing assigned yet'}
                                description={assignments.length
                                    ? 'Every assignment is finished. Nice work.'
                                    : 'When your teacher assigns a lesson or practice, it shows up here.'}
                            />
                        ) : (
                            <List>{todo.map(a => <AssignmentRow key={a.id} assignment={a} done={false} />)}</List>
                        )}
                    </Section>

                    {done.length > 0 && (
                        <Section>
                            <button
                                onClick={() => setShowDone(s => !s)}
                                className="no-hover flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                aria-expanded={showDone}
                            >
                                {showDone ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                Finished ({done.length})
                            </button>
                            {showDone && <List className="mt-3">{done.map(a => <AssignmentRow key={a.id} assignment={a} done />)}</List>}
                        </Section>
                    )}

                    <Section title="Announcements">
                        {posts.length === 0 ? (
                            <EmptyState icon={<ClipboardList className="w-5 h-5" />} title="No announcements yet" />
                        ) : (
                            <StreamView posts={posts} assignments={[]} canPost={false} classroomId={classroom.classId} isClassTeacher={false} />
                        )}
                    </Section>
                </div>

                <aside className="space-y-4">
                    <Card>
                        <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Class details</h2>
                        <dl className="space-y-3 text-sm">
                            <div className="flex justify-between gap-3">
                                <dt className="text-gray-500 dark:text-gray-400">Teacher</dt>
                                <dd className="font-medium text-gray-900 dark:text-white text-right truncate">{classroom.teacherName}</dd>
                            </div>
                            <div className="flex justify-between gap-3">
                                <dt className="text-gray-500 dark:text-gray-400">Students</dt>
                                <dd className="font-medium text-gray-900 dark:text-white tabular-nums">{classmates}</dd>
                            </div>
                            <div className="flex justify-between items-center gap-3">
                                <dt className="text-gray-500 dark:text-gray-400">Class code</dt>
                                <dd>
                                    <button onClick={copyCode} className="no-hover inline-flex items-center gap-1.5 font-mono font-semibold tracking-[0.2em] text-gray-900 dark:text-white hover:text-cyan-600 dark:hover:text-cyan-400" title="Copy class code">
                                        {classroom.joinCode}
                                        {codeCopied ? <CheckCheck className="w-3.5 h-3.5 text-green-500" aria-label="Copied" /> : <Copy className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />}
                                    </button>
                                </dd>
                            </div>
                        </dl>
                    </Card>
                    <Button variant="ghost" size="sm" icon={<LogOut className="w-3.5 h-3.5" />} onClick={handleLeave} loading={leaving} className="!text-red-600 dark:!text-red-400">
                        Leave class
                    </Button>
                </aside>
            </div>
        </Page>
    );
};

const AssignmentRow: React.FC<{ assignment: Assignment; done: boolean }> = ({ assignment: a, done }) => {
    const due = dueLabel(a.dueAt);
    return (
        <li>
            <Link to={assignmentOpenPath(a)} className="no-hover flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/40 group">
                {done
                    ? <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" aria-label="Finished" />
                    : <span className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 flex-shrink-0" aria-label="Not finished" />}
                <div className="min-w-0 flex-1">
                    <div className={`font-semibold truncate ${done ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>{assignmentTitle(a)}</div>
                    {assignmentSubtitle(a) && <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{assignmentSubtitle(a)}</div>}
                </div>
                {!done && <Pill tone={due.tone}>{due.text}</Pill>}
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-cyan-500 flex-shrink-0" aria-hidden="true" />
            </Link>
        </li>
    );
};

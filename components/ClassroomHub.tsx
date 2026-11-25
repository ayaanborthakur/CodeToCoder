import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
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
import { assignmentPoints } from '../services/assignmentsService';
import { listPostsForClassroom } from '../services/postsService';
import { isAssignmentDone, assignmentState, STATE_LABEL, STATE_TONE, type AssignmentState } from '../services/classroomProgressService';
import type { Classroom, Post, Assignment, Submission } from '../types';
import type { ViewState } from './Header';
import { StreamView } from './StreamView';
import { assignmentTitle, assignmentSubtitle, assignmentOpenPath, dueLabel } from '../utils/assignmentDisplay';
import { Page, PageHeader, Section, Card, List, Button, Pill, EmptyState, Alert, Spinner, Field, inputClass, RouteTabs } from './ui';

interface ClassroomHubProps {
    onNavigate: (view: ViewState) => void;
    completedLessons: Set<string>;
    completedPracticeItems: Set<string>;
    /** The student's assignments and submissions, loaded once by App. */
    assignments: Assignment[];
    submissions: Map<string, Submission>;
    onReloadAssignments: () => void;
}

export const ClassroomHub: React.FC<ClassroomHubProps> = ({ onNavigate, completedLessons, completedPracticeItems, assignments, submissions, onReloadAssignments }) => {
    const { user, refreshUser } = useAuth();

    const [settingRole, setSettingRole] = useState(false);
    const [classroom, setClassroom] = useState<Classroom | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [classLoading, setClassLoading] = useState(!!user?.classId);
    const [loadError, setLoadError] = useState<string | null>(null);

    const loadClassroom = useCallback(async () => {
        if (!user?.classId) { setClassroom(null); setClassLoading(false); return; }
        setClassLoading(true);
        try {
            const cls = await getClassroom(user.classId);
            setClassroom(cls);
            if (cls) {
                setPosts(await listPostsForClassroom(cls.classId));
                onReloadAssignments();
            }
            setLoadError(null);
        } catch (e: unknown) {
            setLoadError(e instanceof Error ? e.message : 'Could not load your class.');
        } finally {
            setClassLoading(false);
        }
    }, [user?.classId, user?.id, onReloadAssignments]);

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
                submissions={submissions}
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
            await joinClassroom(user.id, code.trim(), user.schoolJoinPending ? undefined : user.schoolId, user.classId || undefined);
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
    submissions: Map<string, Submission>;
    completedLessons: Set<string>;
    completedPracticeItems: Set<string>;
    onLeft: () => Promise<void>;
}> = ({ classroom, posts, assignments, submissions, completedLessons, completedPracticeItems, onLeft }) => {
    const { user } = useAuth();
    const { tab } = useParams<{ tab?: string }>();
    const [codeCopied, setCodeCopied] = useState(false);
    const [leaving, setLeaving] = useState(false);

    const rows = useMemo(() => assignments
        .map(a => {
            const sub = submissions.get(a.id);
            return { a, sub, state: assignmentState(a, sub, isAssignmentDone(a, completedLessons, completedPracticeItems)) };
        })
        .sort((x, y) => (x.a.dueAt ?? Infinity) - (y.a.dueAt ?? Infinity)),
    [assignments, submissions, completedLessons, completedPracticeItems]);

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

    const toGrade = rows.filter(r => r.state === 'missing' || r.state === 'todo').length;

    return (
        <Page width="default">
            <PageHeader eyebrow="Your class" title={classroom.className} description={`Taught by ${classroom.teacherName}`} />
            <SchoolPending />
            <RouteTabs
                className="mb-6"
                tabs={[
                    { to: '/classroom', label: 'Assignments', count: toGrade, end: true },
                    { to: '/classroom/grades', label: 'Grades' },
                    { to: '/classroom/announcements', label: 'Announcements', count: posts.length },
                ]}
            />

            <div className="grid lg:grid-cols-[minmax(0,1fr)_260px] gap-8">
                <div className="min-w-0">
                    {tab === 'grades' ? (
                        <GradesView rows={rows} />
                    ) : tab === 'announcements' ? (
                        posts.length === 0
                            ? <EmptyState icon={<ClipboardList className="w-5 h-5" />} title="No announcements yet" />
                            : <StreamView posts={posts} assignments={[]} canPost={false} classroomId={classroom.classId} isClassTeacher={false} />
                    ) : (
                        <AssignmentsView rows={rows} />
                    )}
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

type Row = { a: Assignment; sub: Submission | undefined; state: AssignmentState };

const AssignmentsView: React.FC<{ rows: Row[] }> = ({ rows }) => {
    const groups: { title: string; rows: Row[]; empty?: string }[] = [
        { title: 'Past due', rows: rows.filter(r => r.state === 'missing') },
        { title: 'Upcoming', rows: rows.filter(r => r.state === 'todo'), empty: rows.length ? 'Nothing left to hand in.' : undefined },
        { title: 'Waiting for a grade', rows: rows.filter(r => r.state === 'submitted' || r.state === 'late') },
        { title: 'Graded', rows: rows.filter(r => r.state === 'graded') },
    ];
    if (rows.length === 0) {
        return <EmptyState icon={<CheckCircle2 className="w-5 h-5" />} title="Nothing assigned yet" description="When your teacher assigns a lesson or practice, it shows up here." />;
    }
    return (
        <>
            {groups.filter(g => g.rows.length > 0 || g.empty).map(g => (
                <Section key={g.title} title={`${g.title}${g.rows.length ? ` (${g.rows.length})` : ''}`}>
                    {g.rows.length === 0
                        ? <p className="text-sm text-gray-500 dark:text-gray-400">{g.empty}</p>
                        : <List>{g.rows.map(r => <AssignmentRow key={r.a.id} row={r} />)}</List>}
                </Section>
            ))}
        </>
    );
};

const AssignmentRow: React.FC<{ row: Row }> = ({ row: { a, sub, state } }) => {
    const due = dueLabel(a.dueAt);
    const points = assignmentPoints(a);
    const finished = state === 'graded' || state === 'submitted' || state === 'late';
    return (
        <li>
            <Link to={assignmentOpenPath(a)} className="no-hover flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/40 group">
                {finished
                    ? <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" aria-hidden="true" />
                    : <span className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 flex-shrink-0" aria-hidden="true" />}
                <div className="min-w-0 flex-1">
                    <div className="font-semibold truncate text-gray-900 dark:text-white">{assignmentTitle(a)}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {[assignmentSubtitle(a), a.dueAt ? `Due ${new Date(a.dueAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}` : 'No due date'].filter(Boolean).join(' · ')}
                    </div>
                </div>
                {state === 'graded' && typeof sub?.score === 'number'
                    ? <span className="font-semibold tabular-nums text-gray-900 dark:text-white">{sub.score}/{points}</span>
                    : state === 'todo' ? <Pill tone={due.tone}>{due.text}</Pill> : <Pill tone={STATE_TONE[state]}>{STATE_LABEL[state]}</Pill>}
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-cyan-500 flex-shrink-0" aria-hidden="true" />
            </Link>
        </li>
    );
};

const GradesView: React.FC<{ rows: Row[] }> = ({ rows }) => {
    // Graded work counts; missing work counts as zero, like the teacher's gradebook.
    let earned = 0;
    let possible = 0;
    rows.forEach(r => {
        if (r.state === 'graded' && typeof r.sub?.score === 'number') { earned += r.sub.score; possible += assignmentPoints(r.a); }
        else if (r.state === 'missing') possible += assignmentPoints(r.a);
    });
    const total = possible > 0 ? Math.round((earned / possible) * 100) : null;

    if (rows.length === 0) return <EmptyState title="No grades yet" description="Grades show up here after your teacher reviews your work." />;

    return (
        <>
            <Card className="mb-6 flex items-center justify-between gap-4">
                <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Overall</div>
                    <div className="text-3xl font-bold tabular-nums text-gray-900 dark:text-white">{total === null ? '—' : `${total}%`}</div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-right max-w-xs">
                    {possible > 0 ? `${Math.round(earned * 10) / 10} of ${possible} points so far. Missing work counts as zero.` : 'Your overall grade appears once something is graded.'}
                </p>
            </Card>
            <List>
                {rows.map(({ a, sub, state }) => (
                    <li key={a.id} className="px-5 py-4">
                        <div className="flex items-center gap-4">
                            <div className="min-w-0 flex-1">
                                <Link to={assignmentOpenPath(a)} className="font-semibold text-gray-900 dark:text-white hover:text-cyan-600 dark:hover:text-cyan-400 truncate block">{assignmentTitle(a)}</Link>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{a.dueAt ? `Due ${new Date(a.dueAt).toLocaleDateString()}` : 'No due date'}</div>
                            </div>
                            <Pill tone={STATE_TONE[state]}>{STATE_LABEL[state]}</Pill>
                            <span className="w-20 text-right font-semibold tabular-nums text-gray-900 dark:text-white">
                                {typeof sub?.score === 'number' ? `${sub.score} / ${assignmentPoints(a)}` : `– / ${assignmentPoints(a)}`}
                            </span>
                        </div>
                        {sub?.feedback && (
                            <p className="mt-2 rounded-lg bg-gray-50 dark:bg-gray-900/60 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                <span className="font-semibold">Feedback: </span>{sub.feedback}
                            </p>
                        )}
                    </li>
                ))}
            </List>
        </>
    );
};

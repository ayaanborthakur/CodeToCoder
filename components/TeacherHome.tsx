import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, BookPlus, CalendarDays, ClipboardCheck, Megaphone, Plus, QrCode, Users } from 'lucide-react';
import type { TeacherClassData } from '../hooks/useTeacherClasses';
import type { StudentProgress } from '../services/classroomProgressService';
import { assignmentState, assignmentTargets, isAssignmentDone, loadClassroomStudents } from '../services/classroomProgressService';
import { submissionId } from '../services/submissionsService';
import { assignmentTitle } from '../utils/assignmentDisplay';
import { timeAgo } from '../utils/classroomTime';
import { Avatar, Card, EmptyState, ProgressBar } from './ui';

const DAY = 24 * 60 * 60 * 1000;

interface ClassStats {
    missing: number;
    activeToday: number;
    handedInRate: number | null;
    /** Students worth checking on, with why. */
    attention: { student: StudentProgress; missing: number; inactiveDays: number | null }[];
}

/**
 * The teacher's start page: what needs grading, who needs help, what's due,
 * and one-click routes into each class (modelled on CodeHS and Canvas
 * teacher dashboards).
 */
export const TeacherHome: React.FC<{ teacherClasses: TeacherClassData[] }> = ({ teacherClasses }) => {
    const [students, setStudents] = useState<Map<string, StudentProgress[]>>(new Map());
    const [loadingStudents, setLoadingStudents] = useState(true);
    const classKey = teacherClasses.map(c => `${c.classroom.classId}:${c.classroom.studentIds?.length ?? 0}`).join('|');

    useEffect(() => {
        let cancelled = false;
        setLoadingStudents(true);
        Promise.all(teacherClasses.map(async c => [c.classroom.classId, await loadClassroomStudents(c.classroom).catch(() => [])] as const))
            .then(entries => { if (!cancelled) setStudents(new Map(entries)); })
            .finally(() => { if (!cancelled) setLoadingStudents(false); });
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [classKey]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const now = useMemo(() => Date.now(), [teacherClasses, students]);

    const stats = useMemo(() => {
        const map = new Map<string, ClassStats>();
        teacherClasses.forEach(({ classroom, assignments, submissions }) => {
            const roster = students.get(classroom.classId) ?? [];
            const subs = new Map(submissions.map(s => [s.id, s]));
            let missing = 0;
            let handedIn = 0;
            let due = 0;
            const attention: ClassStats['attention'] = [];
            roster.forEach(st => {
                let mine = 0;
                assignments.forEach(a => {
                    if (!assignmentTargets(a, st.uid)) return;
                    const state = assignmentState(a, subs.get(submissionId(a.id, st.uid)), isAssignmentDone(a, st.completedLessons, st.completedPractice));
                    if (a.dueAt !== null && a.dueAt < now) {
                        due++;
                        if (state === 'missing') mine++; else if (state !== 'todo') handedIn++;
                    }
                });
                missing += mine;
                const inactiveDays = st.lastActive ? Math.floor((now - st.lastActive) / DAY) : null;
                if (mine > 0 || inactiveDays === null || inactiveDays >= 7) attention.push({ student: st, missing: mine, inactiveDays });
            });
            map.set(classroom.classId, {
                missing,
                activeToday: roster.filter(s => s.lastActive && now - s.lastActive < DAY).length,
                handedInRate: due ? Math.round((handedIn / due) * 100) : null,
                attention,
            });
        });
        return map;
    }, [teacherClasses, students, now]);

    if (teacherClasses.length === 0) {
        return (
            <EmptyState
                icon={<Users className="w-5 h-5" />}
                title="Create your first class"
                description="A class gives students a join code, and gives you assignments, grading, a gradebook and live activity."
                action={<Link to="/teacher" className="no-hover inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-semibold"><Plus className="w-4 h-4" />Create a class</Link>}
            />
        );
    }

    const live = (c: TeacherClassData) => new Set(c.assignments.map(a => a.id));
    const waiting = teacherClasses
        .flatMap(c => c.submissions.filter(s => s.status === 'submitted' && s.submittedAt > 0 && live(c).has(s.assignmentId)).map(s => ({ s, c })))
        .sort((x, y) => x.s.submittedAt - y.s.submittedAt);
    const recent = teacherClasses
        .flatMap(c => c.submissions.filter(s => s.submittedAt > 0 && live(c).has(s.assignmentId)).map(s => ({ s, c })))
        .sort((x, y) => y.s.submittedAt - x.s.submittedAt)
        .slice(0, 6);
    const upcoming = teacherClasses
        .flatMap(c => c.assignments.filter(a => a.dueAt !== null && a.dueAt >= now && a.dueAt <= now + 7 * DAY).map(a => ({ a, c })))
        .sort((x, y) => x.a.dueAt! - y.a.dueAt!);
    const attention = teacherClasses
        .flatMap(c => (stats.get(c.classroom.classId)?.attention ?? []).map(x => ({ ...x, c })))
        .sort((x, y) => y.missing - x.missing || (y.inactiveDays ?? 999) - (x.inactiveDays ?? 999));
    const totalStudents = teacherClasses.reduce((n, c) => n + (c.classroom.studentIds?.length ?? 0), 0);
    const activeToday = [...stats.values()].reduce((n, s) => n + s.activeToday, 0);
    const missing = [...stats.values()].reduce((n, s) => n + s.missing, 0);
    const assignmentOf = (c: TeacherClassData, id: string) => c.assignments.find(a => a.id === id);
    const first = teacherClasses[0].classroom.classId;
    const one = teacherClasses.length === 1;
    const pending = loadingStudents ? '…' : undefined;

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatTile to="/grading" icon={<ClipboardCheck className="w-5 h-5" />} label="To grade" value={waiting.length} tone={waiting.length ? 'accent' : undefined} />
                <StatTile to={one ? `/teacher/${first}/gradebook` : '/teacher'} icon={<AlertTriangle className="w-5 h-5" />} label="Missing work" value={pending ?? missing} tone={missing ? 'danger' : undefined} />
                <StatTile to={one ? `/teacher/${first}/activity` : '/teacher'} icon={<Users className="w-5 h-5" />} label="Active today" value={pending ?? `${activeToday} / ${totalStudents}`} />
                <StatTile to="/calendar" icon={<CalendarDays className="w-5 h-5" />} label="Due this week" value={upcoming.length} />
            </div>

            <div className="grid lg:grid-cols-[minmax(0,1fr)_380px] gap-8 items-start">
                <div className="space-y-8 min-w-0">
                    <Panel title="Ready to grade" action={waiting.length > 0 ? <Link to="/grading" className="text-sm font-semibold">See all {waiting.length}</Link> : undefined}>
                        {waiting.length === 0 ? (
                            <p className="px-5 py-5 text-gray-600 dark:text-gray-400">You're all caught up. New work shows up here as students hand it in.</p>
                        ) : (
                            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                                {waiting.slice(0, 5).map(({ s, c }) => (
                                    <li key={s.id}>
                                        <Link to={`/teacher/${c.classroom.classId}/assignments/${s.assignmentId}?student=${s.studentId}`} className="no-hover flex items-center gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/40">
                                            <Avatar name={s.studentName} size="sm" />
                                            <span className="flex-1 min-w-0">
                                                <span className="block font-semibold text-gray-900 dark:text-white truncate">{s.studentName}</span>
                                                <span className="block text-sm text-gray-600 dark:text-gray-400 truncate">{assignmentTitle(assignmentOf(c, s.assignmentId)!)} · {c.classroom.className}</span>
                                            </span>
                                            {s.late && <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">Late</span>}
                                            <span className="text-sm text-gray-500 whitespace-nowrap">{timeAgo(s.submittedAt, now)}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Panel>

                    <Panel title="Students to check on">
                        {loadingStudents ? (
                            <p className="px-5 py-5 text-gray-600 dark:text-gray-400">Loading students…</p>
                        ) : attention.length === 0 ? (
                            <p className="px-5 py-5 text-gray-600 dark:text-gray-400">Everyone is up to date and active this week.</p>
                        ) : (
                            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                                {attention.slice(0, 8).map(({ student, missing: m, inactiveDays, c }) => (
                                    <li key={`${c.classroom.classId}-${student.uid}`}>
                                        <Link to={`/teacher/${c.classroom.classId}/students`} className="no-hover flex items-center gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/40">
                                            <Avatar name={student.name} src={student.avatar} size="sm" />
                                            <span className="flex-1 min-w-0">
                                                <span className="block font-semibold text-gray-900 dark:text-white truncate">{student.name}</span>
                                                <span className="block text-sm text-gray-600 dark:text-gray-400 truncate">{c.classroom.className}</span>
                                            </span>
                                            <span className="flex flex-wrap justify-end gap-1.5">
                                                {m > 0 && <Tag tone="danger">{m} missing</Tag>}
                                                {inactiveDays === null ? <Tag>Never active</Tag> : inactiveDays >= 7 ? <Tag>Away {inactiveDays} days</Tag> : null}
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Panel>

                    <section>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your classes</h2>
                            <Link to="/teacher" className="text-sm font-semibold">Manage classes</Link>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {teacherClasses.map(c => {
                                const { classroom, assignments, submissions } = c;
                                const st = stats.get(classroom.classId);
                                const toGrade = submissions.filter(s => s.status === 'submitted' && s.submittedAt > 0 && live(c).has(s.assignmentId)).length;
                                const count = classroom.studentIds?.length ?? 0;
                                const base = `/teacher/${classroom.classId}`;
                                return (
                                    <Card key={classroom.classId} className="flex flex-col gap-4">
                                        <Link to={`${base}/overview`} className="no-hover block">
                                            <span className="block text-xl font-bold text-gray-900 dark:text-white hover:text-cyan-700 dark:hover:text-cyan-400">{classroom.className}</span>
                                            <span className="block text-gray-600 dark:text-gray-400">{count} {count === 1 ? 'student' : 'students'} · {assignments.length} {assignments.length === 1 ? 'assignment' : 'assignments'} · code <span className="font-mono font-semibold tracking-wider">{classroom.joinCode}</span></span>
                                        </Link>
                                        <div>
                                            <div className="flex justify-between text-sm mb-1.5">
                                                <span className="text-gray-600 dark:text-gray-400">Past-due work handed in</span>
                                                <span className="font-semibold tabular-nums text-gray-900 dark:text-white">{st?.handedInRate === null || st === undefined ? '—' : `${st.handedInRate}%`}</span>
                                            </div>
                                            <ProgressBar value={st?.handedInRate ?? 0} max={100} tone="success" label="Past-due work handed in" />
                                        </div>
                                        <div className="flex flex-wrap gap-2 text-sm">
                                            <ClassLink to={`${base}/assignments`} highlight={toGrade > 0}>{toGrade > 0 ? `${toGrade} to grade` : 'Assignments'}</ClassLink>
                                            <ClassLink to={`${base}/gradebook`}>Gradebook</ClassLink>
                                            <ClassLink to={`${base}/activity`}>Live activity</ClassLink>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    </section>
                </div>

                <aside className="space-y-6">
                    <Panel title="Quick actions">
                        <div className="grid grid-cols-2 gap-2 p-4">
                            <QuickAction to={one ? `/teacher/${first}/assignments/new` : '/lessons'} icon={<BookPlus className="w-5 h-5" />}>Assign a lesson</QuickAction>
                            <QuickAction to={one ? `/teacher/${first}/stream` : '/teacher'} icon={<Megaphone className="w-5 h-5" />}>Post an announcement</QuickAction>
                            <QuickAction to={one ? `/teacher/${first}/students` : '/teacher'} icon={<QrCode className="w-5 h-5" />}>Add students</QuickAction>
                            <QuickAction to="/teacher" icon={<Plus className="w-5 h-5" />}>New class</QuickAction>
                        </div>
                    </Panel>

                    <Panel title="Due this week" action={<Link to="/calendar" className="text-sm font-semibold">Calendar</Link>}>
                        {upcoming.length === 0 ? (
                            <p className="px-5 py-5 text-gray-600 dark:text-gray-400">Nothing due in the next 7 days.</p>
                        ) : (
                            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                                {upcoming.slice(0, 6).map(({ a, c }) => {
                                    const handed = c.submissions.filter(s => s.assignmentId === a.id && s.submittedAt > 0).length;
                                    const target = a.studentIds === null ? (c.classroom.studentIds?.length ?? 0) : a.studentIds.length;
                                    return (
                                        <li key={a.id}>
                                            <Link to={`/teacher/${c.classroom.classId}/assignments/${a.id}`} className="no-hover block px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/40">
                                                <span className="block font-semibold text-gray-900 dark:text-white truncate">{assignmentTitle(a)}</span>
                                                <span className="block text-sm text-gray-600 dark:text-gray-400">{c.classroom.className} · {new Date(a.dueAt!).toLocaleString(undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit' })} · {handed}/{target} in</span>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </Panel>

                    <Panel title="Recently handed in">
                        {recent.length === 0 ? (
                            <p className="px-5 py-5 text-gray-600 dark:text-gray-400">No work handed in yet.</p>
                        ) : (
                            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                                {recent.map(({ s, c }) => (
                                    <li key={s.id}>
                                        <Link to={`/teacher/${c.classroom.classId}/assignments/${s.assignmentId}?student=${s.studentId}`} className="no-hover block px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/40">
                                            <span className="block font-semibold text-gray-900 dark:text-white truncate">{s.studentName}</span>
                                            <span className="block text-sm text-gray-600 dark:text-gray-400 truncate">{assignmentTitle(assignmentOf(c, s.assignmentId)!)} · {timeAgo(s.submittedAt, now)}{s.status === 'graded' ? ' · Graded' : ''}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Panel>
                </aside>
            </div>
        </div>
    );
};

const StatTile: React.FC<{ to: string; icon: React.ReactNode; label: string; value: React.ReactNode; tone?: 'accent' | 'danger' }> = ({ to, icon, label, value, tone }) => (
    <Link to={to} className="no-hover rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-cyan-600 p-5">
        <span className={`flex items-center gap-2 text-sm font-semibold ${tone === 'danger' ? 'text-red-700 dark:text-red-400' : tone === 'accent' ? 'text-cyan-700 dark:text-cyan-400' : 'text-gray-600 dark:text-gray-400'}`}>{icon}{label}</span>
        <span className="block mt-2 text-3xl font-bold tabular-nums text-gray-900 dark:text-white">{value}</span>
    </Link>
);

const Panel: React.FC<{ title: string; action?: React.ReactNode; children: React.ReactNode }> = ({ title, action, children }) => (
    <Card padded={false} className="overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
            {action}
        </div>
        {children}
    </Card>
);

const Tag: React.FC<{ tone?: 'danger'; children: React.ReactNode }> = ({ tone, children }) => (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${tone === 'danger' ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>{children}</span>
);

const ClassLink: React.FC<{ to: string; highlight?: boolean; children: React.ReactNode }> = ({ to, highlight, children }) => (
    <Link to={to} className={`no-hover px-3 py-1.5 rounded-lg font-semibold border ${highlight ? 'bg-cyan-700 text-white border-cyan-700 hover:bg-cyan-800' : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/40'}`}>{children}</Link>
);

const QuickAction: React.FC<{ to: string; icon: React.ReactNode; children: React.ReactNode }> = ({ to, icon, children }) => (
    <Link to={to} className="no-hover flex flex-col items-start gap-2 rounded-xl border border-gray-200 dark:border-gray-700 p-3 hover:border-cyan-600 hover:bg-cyan-50/50 dark:hover:bg-cyan-900/20">
        <span className="text-cyan-700 dark:text-cyan-400">{icon}</span>
        <span className="text-sm font-semibold text-gray-900 dark:text-white leading-snug">{children}</span>
    </Link>
);

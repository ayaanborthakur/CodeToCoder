import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, BarChart3, BrainCircuit, Code2, Flame, Rocket, Repeat, Terminal } from 'lucide-react';
import type { Assignment, DailyChallenge, Module, PlaygroundFile, PracticeItem, Submission } from '../types';
import type { TeacherClassData } from '../hooks/useTeacherClasses';
import { TeacherHome } from './TeacherHome';
import { DailyChallengesWidget } from './DailyChallengesWidget';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { ReviewTab } from './ReviewTab';
import { useAuth } from '../contexts/AuthContext';
import { getDueReviews } from '../services/learningService';
import { COURSES, getCourseProgress, isCourseUnlocked } from '../data/coursesData';
import { assignmentPoints } from '../services/assignmentsService';
import { assignmentOpenPath, assignmentTitle, dueLabel } from '../utils/assignmentDisplay';
import { Button, Card, Page, PageHeader, Pill, ProgressBar, Section } from './ui';

interface HomePageProps {
    modules: Module[];
    onNavigate: (view: 'home' | 'classroom' | 'playground' | 'practice' | 'mission' | 'about' | 'profile' | 'marketplace' | 'leaderboard' | 'reference') => void;
    onSelectLesson: (moduleId: string, lessonId: string) => void;
    completedLessons: Set<string>;
    completedPracticeItems: Set<string>;
    practiceItems: PracticeItem[];
    playgroundFiles: PlaygroundFile[];
    mostRecentPlaygroundFile: PlaygroundFile | null;
    onPlaygroundResume: (fileId: string) => void;
    currentStreak?: number;
    dailyChallenges?: DailyChallenge[];
    onClaimChallengeReward?: (challengeId: string) => void;
    /** Student: their class assignments and own submissions. */
    assignments: Assignment[];
    submissions: Map<string, Submission>;
    /** Teacher: their classes with assignments and submissions. */
    teacherClasses: TeacherClassData[];
}

type HomeView = 'home' | 'stats' | 'review';

const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};

/** The first lesson not yet done, in course order. */
const nextLessonOf = (modules: Module[], done: Set<string>) => {
    for (const module of modules) {
        const index = module.lessons.findIndex(l => !done.has(l.id));
        if (index !== -1) return { module, lesson: module.lessons[index], index, started: done.size > 0 };
    }
    return null;
};

export const HomePage: React.FC<HomePageProps> = (props) => {
    const { user } = useAuth();
    const [view, setView] = useState<HomeView>('home');
    const [dueReviews, setDueReviews] = useState(0);

    useEffect(() => {
        // Cached for 5 minutes: the count rarely changes between visits.
        if (!user) return;
        const key = `dueReviewsCount:${user.id}`;
        try {
            const cached = JSON.parse(sessionStorage.getItem(key) || 'null') as { count: number; at: number } | null;
            if (cached && Date.now() - cached.at < 5 * 60 * 1000) { setDueReviews(cached.count); return; }
        } catch { /* storage unavailable: fetch instead */ }
        let cancelled = false;
        getDueReviews(user.id)
            .then(r => {
                if (cancelled) return;
                setDueReviews(r.length);
                try { sessionStorage.setItem(key, JSON.stringify({ count: r.length, at: Date.now() })); } catch { /* ignore */ }
            })
            .catch(() => {});
        return () => { cancelled = true; };
    }, [user]);

    const firstName = user?.name?.split(' ')[0] ?? 'there';
    const isTeacher = user?.role === 'teacher';

    return (
        <Page width="wide">
            <Helmet><title>Home</title></Helmet>
            <PageHeader
                title={view === 'stats' ? 'My stats' : view === 'review' ? 'Review' : `${greeting()}, ${firstName}`}
                description={view === 'home' ? new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) : undefined}
                actions={!isTeacher && (
                    <>
                        {view !== 'home' && <Button size="sm" icon={<ArrowRight className="w-4 h-4 rotate-180" />} onClick={() => setView('home')}>Home</Button>}
                        {view !== 'stats' && <Button size="sm" icon={<BarChart3 className="w-4 h-4" />} onClick={() => setView('stats')}>My stats</Button>}
                        {view !== 'review' && (
                            <Button size="sm" icon={<Repeat className="w-4 h-4" />} onClick={() => setView('review')}>
                                Review{dueReviews > 0 && <span className="ml-1 min-w-[1.25rem] h-5 px-1.5 rounded-full bg-cyan-700 text-white text-xs font-semibold inline-flex items-center justify-center">{dueReviews}</span>}
                            </Button>
                        )}
                    </>
                )}
            />

            {view === 'stats' && <AnalyticsDashboard />}
            {view === 'review' && <ReviewTab onSelectLesson={props.onSelectLesson} />}
            {view === 'home' && (isTeacher ? <TeacherHome teacherClasses={props.teacherClasses} /> : <StudentHome {...props} />)}
        </Page>
    );
};


// ─── Student ─────────────────────────────────────────────────────────────────

const StudentHome: React.FC<HomePageProps> = ({
    modules, onSelectLesson, completedLessons, completedPracticeItems, practiceItems, mostRecentPlaygroundFile, onPlaygroundResume,
    currentStreak = 0, dailyChallenges = [], onClaimChallengeReward, assignments, submissions,
}) => {
    const { user } = useAuth();
    const next = useMemo(() => nextLessonOf(modules, completedLessons), [modules, completedLessons]);

    const courses = useMemo(() => {
        const ids = modules.map(m => m.id);
        const byId = new Map(modules.map(m => [m.id, m] as const));
        return COURSES.filter(c => !c.comingSoon).map(c => ({
            course: c,
            progress: getCourseProgress(c.id, ids, byId, completedLessons),
            unlocked: isCourseUnlocked(c, ids, byId, completedLessons, user?.unlockedCourseIds ?? null),
        }));
    }, [modules, completedLessons, user?.unlockedCourseIds]);

    const todo = useMemo(() => assignments
        .filter(a => {
            const sub = submissions.get(a.id);
            const finished = a.kind === 'practice'
                ? !!a.practiceItem && (completedPracticeItems.has(a.practiceItem.id) || completedPracticeItems.has(`assignment:${a.id}:${a.practiceItem.id}`))
                : !!a.lessonId && completedLessons.has(a.lessonId);
            return !finished && !(sub && sub.submittedAt > 0);
        })
        .sort((a, b) => (a.dueAt ?? Infinity) - (b.dueAt ?? Infinity)), [assignments, submissions, completedLessons, completedPracticeItems]);

    const feedback = useMemo(() => [...submissions.values()]
        .filter(s => s.status === 'graded' && typeof s.score === 'number')
        .sort((a, b) => (b.gradedAt ?? 0) - (a.gradedAt ?? 0))
        .slice(0, 2), [submissions]);

    const practiceStats = (['quiz', 'problem', 'project'] as const).map(type => {
        const items = practiceItems.filter(p => p.type === type);
        return { type, total: items.length, done: items.filter(p => completedPracticeItems.has(p.id)).length };
    });

    const moduleDone = next ? next.module.lessons.filter(l => completedLessons.has(l.id)).length : 0;
    const hasAside = !!user?.classId || feedback.length > 0 || currentStreak > 0 || dailyChallenges.length > 0;

    return (
        <div className={hasAside ? 'grid lg:grid-cols-[minmax(0,1fr)_380px] gap-8 items-start' : 'max-w-5xl'}>
            <div className="min-w-0 space-y-10">
                {next ? (
                    <section aria-labelledby="continue-title" className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 sm:p-8 flex flex-wrap items-center gap-6">
                        <div className="flex-1 min-w-[16rem]">
                            <div className="text-sm font-semibold text-cyan-700 dark:text-cyan-400">{next.started ? 'Continue where you left off' : 'Start your first lesson'}</div>
                            <h2 id="continue-title" className="mt-1 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{next.lesson.title}</h2>
                            <p className="mt-1 text-gray-600 dark:text-gray-400">{next.module.title} · Lesson {next.index + 1} of {next.module.lessons.length}</p>
                            <div className="mt-4 flex items-center gap-3 max-w-md">
                                <ProgressBar value={moduleDone} max={next.module.lessons.length} className="flex-1 !h-2.5" label="Module progress" />
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 tabular-nums">{moduleDone} of {next.module.lessons.length}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => onSelectLesson(next.module.id, next.lesson.id)}
                            className="no-hover inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white text-lg font-semibold"
                        >
                            {next.started ? 'Resume lesson' : 'Start'} <ArrowRight className="w-5 h-5" />
                        </button>
                    </section>
                ) : (
                    <Card><p className="text-lg text-gray-700 dark:text-gray-300">You've finished every lesson. Try a project in Practice.</p></Card>
                )}

                <Section title="Your courses" action={<Link to="/lessons" className="font-semibold">See all</Link>}>
                    <div className="grid sm:grid-cols-2 gap-4">
                        {courses.map(({ course, progress, unlocked }) => (
                            unlocked ? (
                                <Link key={course.id} to={`/courses/${course.id}`} className="no-hover group rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-cyan-600 dark:hover:border-cyan-500 p-6 flex flex-col gap-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-xl font-bold text-gray-900 dark:text-white">{course.title}</span>
                                        <Pill tone={progress.completed === progress.total && progress.total > 0 ? 'success' : progress.completed > 0 ? 'info' : 'neutral'}>
                                            {progress.completed === progress.total && progress.total > 0 ? 'Complete' : progress.completed > 0 ? 'In progress' : 'Not started'}
                                        </Pill>
                                    </div>
                                    <span className="text-gray-600 dark:text-gray-400">{course.description}</span>
                                    <div className="flex items-center gap-3">
                                        <ProgressBar value={progress.completed} max={progress.total} className="flex-1 !h-2" label={`${course.title} progress`} />
                                        <span className="text-sm text-gray-600 dark:text-gray-400 tabular-nums">{progress.completed} / {progress.total}</span>
                                    </div>
                                </Link>
                            ) : (
                                <div key={course.id} className="rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 p-6 flex flex-col gap-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-xl font-bold text-gray-700 dark:text-gray-300">{course.title}</span>
                                        <Pill>Locked</Pill>
                                    </div>
                                    <span className="text-gray-600 dark:text-gray-400">{course.description}</span>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Unlocks when you finish the course before it.</span>
                                </div>
                            )
                        ))}
                    </div>
                </Section>

                <Section title="Keep practicing" action={<Link to="/practice" className="font-semibold">Open Practice</Link>}>
                    <div className="grid sm:grid-cols-3 gap-4">
                        {practiceStats.map(p => (
                            <Link key={p.type} to="/practice" className="no-hover rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-cyan-600 p-5 flex items-center gap-4">
                                <span className="w-11 h-11 rounded-xl bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 flex items-center justify-center flex-shrink-0">
                                    {p.type === 'quiz' ? <BrainCircuit className="w-5 h-5" /> : p.type === 'problem' ? <Terminal className="w-5 h-5" /> : <Rocket className="w-5 h-5" />}
                                </span>
                                <span>
                                    <span className="block font-semibold text-gray-900 dark:text-white">{p.type === 'quiz' ? 'Quizzes' : p.type === 'problem' ? 'Coding problems' : 'Mini projects'}</span>
                                    <span className="block text-sm text-gray-600 dark:text-gray-400">{p.done} of {p.total} done</span>
                                </span>
                            </Link>
                        ))}
                    </div>
                </Section>

                {mostRecentPlaygroundFile && (
                    <Section title="Playground">
                        <button onClick={() => onPlaygroundResume(mostRecentPlaygroundFile.id)} className="no-hover w-full text-left rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-cyan-600 p-5 flex items-center gap-4">
                            <span className="w-11 h-11 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center justify-center"><Code2 className="w-5 h-5" /></span>
                            <span className="flex-1 min-w-0">
                                <span className="block font-semibold text-gray-900 dark:text-white truncate">{mostRecentPlaygroundFile.name}</span>
                                <span className="block text-sm text-gray-600 dark:text-gray-400">Edited {new Date(mostRecentPlaygroundFile.lastModified).toLocaleDateString()}</span>
                            </span>
                            <ArrowRight className="w-5 h-5 text-gray-400" />
                        </button>
                    </Section>
                )}
            </div>

            {hasAside && <aside className="space-y-6">
                {user?.classId && (
                    <Card padded={false} className="overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">To do</h2>
                            <Link to="/classroom" className="text-sm font-semibold">My class</Link>
                        </div>
                        {todo.length === 0 ? (
                            <p className="px-5 py-5 text-gray-600 dark:text-gray-400">You're all caught up.</p>
                        ) : (
                            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                                {todo.slice(0, 5).map(a => {
                                    const due = dueLabel(a.dueAt);
                                    return (
                                        <li key={a.id}>
                                            <Link to={assignmentOpenPath(a)} className="no-hover flex gap-3 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/40">
                                                <span className={`w-2.5 h-2.5 mt-2 rounded-full flex-shrink-0 ${due.tone === 'danger' ? 'bg-red-600' : due.tone === 'warning' ? 'bg-amber-500' : 'bg-gray-400'}`} aria-hidden="true" />
                                                <span className="min-w-0">
                                                    <span className="block font-semibold text-gray-900 dark:text-white truncate">{assignmentTitle(a)}</span>
                                                    <span className={`block text-sm font-medium ${due.tone === 'danger' ? 'text-red-700 dark:text-red-400' : due.tone === 'warning' ? 'text-amber-700 dark:text-amber-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                                        {due.text} · {assignmentPoints(a)} pts
                                                    </span>
                                                </span>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </Card>
                )}

                {feedback.length > 0 && (
                    <Card>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Recent feedback</h2>
                        <ul className="space-y-4">
                            {feedback.map(s => {
                                const a = assignments.find(x => x.id === s.assignmentId);
                                return (
                                    <li key={s.id}>
                                        <div className="font-semibold text-gray-900 dark:text-white">{a ? assignmentTitle(a) : 'Assignment'} · {s.score}{a ? ` / ${assignmentPoints(a)}` : ''}</div>
                                        {s.feedback && <p className="mt-1 text-gray-600 dark:text-gray-400">"{s.feedback}"</p>}
                                    </li>
                                );
                            })}
                        </ul>
                    </Card>
                )}

                {currentStreak > 0 && (
                    <Card className="flex items-center gap-4">
                        <Flame className="w-8 h-8 text-orange-500" aria-hidden="true" />
                        <div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">{currentStreak}-day streak</div>
                            <div className="text-gray-600 dark:text-gray-400">Code a little today to keep it going.</div>
                        </div>
                    </Card>
                )}

                {dailyChallenges.length > 0 && (
                    <DailyChallengesWidget challenges={dailyChallenges} onClaimReward={onClaimChallengeReward || (() => {})} />
                )}
            </aside>}
        </div>
    );
};

// ─── Teacher ─────────────────────────────────────────────────────────────────


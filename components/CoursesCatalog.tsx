import React, { useMemo } from 'react';
import { Lock, CheckCircle2, ArrowRight, Sparkles, Play } from 'lucide-react';
import type { Module } from '../types';
import {
    COURSES,
    getCourseProgress,
    isCourseUnlocked,
} from '../data/coursesData';

interface CoursesCatalogProps {
    modules: Module[];
    completedLessons: Set<string>;
    onSelectCourse: (courseId: string) => void;
    unlockedCourseIds?: string[] | null;
    /** Teachers bypass all locks and can browse every course. */
    isTeacher?: boolean;
}

interface CourseRow {
    course: typeof COURSES[number];
    progress: { completed: number; total: number; fraction: number };
    unlocked: boolean;
    complete: boolean;
    interactive: boolean;
    inProgress: boolean;
    notStarted: boolean;
}

export const CoursesCatalog: React.FC<CoursesCatalogProps> = ({
    modules,
    completedLessons,
    onSelectCourse,
    unlockedCourseIds,
    isTeacher = false,
}) => {
    const rows = useMemo<CourseRow[]>(() => {
        const ids = modules.map(m => m.id);
        const byId = new Map(modules.map(m => [m.id, m] as const));
        return COURSES.map(course => {
            const progress = getCourseProgress(course.id, ids, byId, completedLessons);
            const unlocked = isTeacher || isCourseUnlocked(course, ids, byId, completedLessons, unlockedCourseIds);
            const complete = progress.total > 0 && progress.completed === progress.total;
            const interactive = isTeacher || (unlocked && !course.comingSoon);
            const inProgress = progress.completed > 0 && !complete;
            const notStarted = progress.completed === 0 && !course.comingSoon && unlocked;
            return { course, progress, unlocked, complete, interactive, inProgress, notStarted };
        });
    }, [modules, completedLessons, unlockedCourseIds, isTeacher]);

    // Aggregate overall stats for the hero strip
    const overall = useMemo(() => {
        let completed = 0;
        let total = 0;
        let activeCourses = 0;
        let unlockedCourses = 0;
        for (const r of rows) {
            completed += r.progress.completed;
            total += r.progress.total;
            if (r.inProgress) activeCourses += 1;
            if (r.unlocked && !r.course.comingSoon) unlockedCourses += 1;
        }
        return { completed, total, activeCourses, unlockedCourses };
    }, [rows]);

    // Featured = the course the student is actively working on (highest priority)
    // falls back to the next un-started but unlocked course.
    const featured = useMemo(() => {
        return rows.find(r => r.inProgress) ?? rows.find(r => r.notStarted) ?? rows[0];
    }, [rows]);

    const otherRows = rows.filter(r => r !== featured);

    return (
        <div className="h-full w-full bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 overflow-y-auto">
            <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-8">

                {/* ─── Hero: overall progress ───────────────────────────── */}
                <header className="flex items-end justify-between flex-wrap gap-6">
                    <div>
                        <div className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-[0.08em] mb-1">Curriculum</div>
                        <h1 className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">Your Python journey.</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Five courses, in order. Each unlocks once you finish the previous.
                        </p>
                    </div>
                    <div className="flex items-end gap-6 min-w-[320px] flex-1 justify-end">
                        <Stat label="Lessons" value={overall.completed} suffix={`/ ${overall.total}`} />
                        <Divider />
                        <Stat label="Overall" value={`${overall.total > 0 ? Math.round((overall.completed / overall.total) * 100) : 0}%`} />
                        <Divider />
                        <Stat label="Active" value={overall.activeCourses} />
                        <Divider />
                        <Stat label="Unlocked" value={overall.unlockedCourses} suffix={`/ ${rows.length}`} />
                    </div>
                </header>

                {/* ─── Featured course ──────────────────────────────────── */}
                {featured && (
                    <section>
                        <SectionLabel>{featured.complete ? 'Most recent' : featured.inProgress ? 'In progress' : 'Up next'}</SectionLabel>
                        <FeaturedCard row={featured} isTeacher={isTeacher} onSelect={() => featured.interactive && onSelectCourse(featured.course.id)} />
                    </section>
                )}

                {/* ─── All other courses ────────────────────────────────── */}
                <section>
                    <SectionLabel right={<span className="text-xs text-gray-400">{otherRows.length} {otherRows.length === 1 ? 'course' : 'courses'}</span>}>All courses</SectionLabel>
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden divide-y divide-gray-100 dark:divide-gray-700">
                        {otherRows.map((r) => (
                            <CourseRowItem
                                key={r.course.id}
                                row={r}
                                isTeacher={isTeacher}
                                onSelect={() => r.interactive && onSelectCourse(r.course.id)}
                            />
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

// ─── Sub-components ──────────────────────────────────────────────────────

const SectionLabel: React.FC<{ children: React.ReactNode; right?: React.ReactNode }> = ({ children, right }) => (
    <div className="flex items-center justify-between mb-2 px-1">
        <div className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-[0.08em]">{children}</div>
        {right}
    </div>
);

const Stat: React.FC<{ label: string; value: React.ReactNode; suffix?: string }> = ({ label, value, suffix }) => (
    <div className="flex flex-col">
        <div className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-[0.08em]">{label}</div>
        <div className="text-xl font-semibold text-gray-900 dark:text-white tabular-nums">
            {value}{suffix && <span className="text-sm text-gray-400 font-normal ml-1">{suffix}</span>}
        </div>
    </div>
);

const Divider: React.FC = () => <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />;

const FeaturedCard: React.FC<{ row: CourseRow; isTeacher: boolean; onSelect: () => void }> = ({ row, isTeacher, onSelect }) => {
    const { course, progress, unlocked, complete, interactive, inProgress } = row;
    const pct = progress.total > 0 ? Math.round(progress.fraction * 100) : 0;
    const prereqTitle = COURSES.find(c => c.id === course.prerequisiteCourseId)?.title;

    return (
        <button
            onClick={interactive ? onSelect : undefined}
            disabled={!interactive}
            className={`w-full text-left rounded-2xl overflow-hidden relative group transition-shadow ${
                interactive ? 'hover:shadow-lg cursor-pointer' : 'cursor-not-allowed'
            }`}
        >
            {/* Gradient background — bold for the featured slot only */}
            <div className={`bg-gradient-to-br ${course.accentColor} ${interactive ? '' : 'opacity-50'} p-6 text-white`}>
                <div className="flex items-start justify-between gap-6 flex-wrap">
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/80">Course</span>
                            {complete && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.05em] text-white/95 bg-white/20 px-1.5 py-0.5 rounded">
                                    <CheckCircle2 className="w-2.5 h-2.5" /> Complete
                                </span>
                            )}
                            {!unlocked && !isTeacher && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.05em] text-white/90 bg-white/20 px-1.5 py-0.5 rounded">
                                    <Lock className="w-2.5 h-2.5" /> Locked
                                </span>
                            )}
                            {course.comingSoon && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.05em] text-white/90 bg-white/20 px-1.5 py-0.5 rounded">
                                    <Sparkles className="w-2.5 h-2.5" /> Coming Soon
                                </span>
                            )}
                        </div>
                        <h2 className="text-2xl font-semibold text-white tracking-tight">{course.title}</h2>
                        <p className="text-sm text-white/85 mt-1 max-w-prose">{course.description}</p>
                    </div>

                    {/* Right-side stats */}
                    {!course.comingSoon && unlocked && (
                        <div className="flex items-end gap-5 text-white tabular-nums">
                            <div className="text-right">
                                <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/75">Progress</div>
                                <div className="text-2xl font-semibold">{pct}<span className="text-base text-white/70">%</span></div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/75">Lessons</div>
                                <div className="text-2xl font-semibold">{progress.completed}<span className="text-base text-white/70"> / {progress.total}</span></div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Progress bar */}
                {!course.comingSoon && unlocked && (
                    <div className="mt-5">
                        <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
                            <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                        </div>
                    </div>
                )}

                {/* CTA bar */}
                <div className="mt-5 flex items-center justify-between gap-3">
                    <div className="text-sm text-white/85">
                        {course.comingSoon ? (
                            isTeacher ? 'Preview the empty course shell.' : 'Material is on the way.'
                        ) : !unlocked ? (
                            <>Finish <span className="font-semibold text-white">{prereqTitle}</span> to unlock.</>
                        ) : complete ? (
                            'You finished this course. Revisit anytime.'
                        ) : inProgress ? (
                            'Pick up where you left off.'
                        ) : (
                            'Start with the first lesson.'
                        )}
                    </div>
                    {interactive && (
                        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-white/15 hover:bg-white/25 px-4 py-2 rounded-md transition-colors backdrop-blur-sm">
                            {complete ? 'Review' : inProgress ? 'Continue' : 'Start'}
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                    )}
                </div>
            </div>
        </button>
    );
};

const CourseRowItem: React.FC<{ row: CourseRow; isTeacher: boolean; onSelect: () => void }> = ({ row, isTeacher, onSelect }) => {
    const { course, progress, unlocked, complete, interactive } = row;
    const pct = progress.total > 0 ? Math.round(progress.fraction * 100) : 0;
    const prereqTitle = COURSES.find(c => c.id === course.prerequisiteCourseId)?.title;

    return (
        <button
            onClick={interactive ? onSelect : undefined}
            disabled={!interactive}
            className={`w-full grid grid-cols-[6px_1fr_auto] gap-0 items-stretch text-left transition-colors ${
                interactive ? 'hover:bg-gray-50 dark:hover:bg-gray-700/40' : 'opacity-60 cursor-not-allowed'
            }`}
        >
            {/* Left accent stripe — subtle color cue */}
            <div className={`bg-gradient-to-b ${course.accentColor} ${interactive ? '' : 'opacity-40'}`} />

            {/* Main content */}
            <div className="px-5 py-4 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">{course.title}</h3>
                    {complete && !isTeacher && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.05em] text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-1.5 py-0.5 rounded">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Complete
                        </span>
                    )}
                    {!unlocked && !isTeacher && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.05em] text-gray-500 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                            <Lock className="w-2.5 h-2.5" /> Locked
                        </span>
                    )}
                    {course.comingSoon && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.05em] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded">
                            <Sparkles className="w-2.5 h-2.5" /> Coming Soon
                        </span>
                    )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{course.description}</p>

                {/* Inline progress / status line */}
                {!course.comingSoon && unlocked && progress.total > 0 ? (
                    <div className="mt-2.5 flex items-center gap-3 max-w-md">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1 overflow-hidden">
                            <div className={`h-full bg-gradient-to-r ${course.accentColor} transition-all duration-500`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 tabular-nums whitespace-nowrap">
                            {progress.completed} / {progress.total} · {pct}%
                        </span>
                    </div>
                ) : course.comingSoon ? (
                    <div className="mt-2.5 text-xs text-gray-500 dark:text-gray-400">
                        {isTeacher ? 'Preview (no lessons yet)' : 'Material coming soon'}
                    </div>
                ) : !unlocked ? (
                    <div className="mt-2.5 text-xs text-gray-500 dark:text-gray-400">
                        Finish <span className="font-semibold text-gray-700 dark:text-gray-300">{prereqTitle}</span> to unlock
                    </div>
                ) : null}
            </div>

            {/* Right-side affordance: arrow or lock */}
            <div className="flex items-center px-5">
                {interactive ? (
                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-full text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200">
                        {complete ? <ArrowRight className="w-4 h-4" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                    </span>
                ) : !unlocked ? (
                    <Lock className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                ) : (
                    <Sparkles className="w-4 h-4 text-amber-300 dark:text-amber-600" />
                )}
            </div>
        </button>
    );
};

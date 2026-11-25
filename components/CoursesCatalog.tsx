import React, { useMemo } from 'react';
import { ArrowRight, CheckCircle2, Lock, Sparkles } from 'lucide-react';
import type { Module } from '../types';
import { COURSES, getCourseProgress, isCourseUnlocked, resolveCourseModuleIds } from '../data/coursesData';
import { Page, PageHeader, Pill, ProgressBar } from './ui';

interface CoursesCatalogProps {
    modules: Module[];
    completedLessons: Set<string>;
    onSelectCourse: (courseId: string) => void;
    unlockedCourseIds?: string[] | null;
    /** Teachers bypass all locks and can browse every course. */
    isTeacher?: boolean;
}

/**
 * Every course in order, as cards: what it covers, how far along you are,
 * and whether it's open yet.
 */
export const CoursesCatalog: React.FC<CoursesCatalogProps> = ({ modules, completedLessons, onSelectCourse, unlockedCourseIds, isTeacher = false }) => {
    const rows = useMemo(() => {
        const ids = modules.map(m => m.id);
        const byId = new Map(modules.map(m => [m.id, m] as const));
        return COURSES.map(course => {
            const progress = getCourseProgress(course.id, ids, byId, completedLessons);
            const unlocked = isTeacher || isCourseUnlocked(course, ids, byId, completedLessons, unlockedCourseIds);
            const moduleCount = course.comingSoon ? 0 : resolveCourseModuleIds(course.id, ids).filter(id => byId.has(id)).length;
            const complete = progress.total > 0 && progress.completed === progress.total;
            return { course, progress, unlocked, moduleCount, complete, open: isTeacher || (unlocked && !course.comingSoon) };
        });
    }, [modules, completedLessons, unlockedCourseIds, isTeacher]);

    const done = rows.reduce((n, r) => n + r.progress.completed, 0);
    const total = rows.reduce((n, r) => n + r.progress.total, 0);

    return (
        <Page width="wide">
            <PageHeader
                title={isTeacher ? 'Curriculum' : 'Courses'}
                description={isTeacher
                    ? 'Every course your students can take. Open one to preview lessons and assign them.'
                    : `Take them in order: each course opens when you finish most of the one before.${total ? ` You've done ${done} of ${total} lessons.` : ''}`}
            />
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {rows.map(({ course, progress, unlocked, moduleCount, complete, open }, i) => {
                    const pct = progress.total ? Math.round(progress.fraction * 100) : 0;
                    const started = progress.completed > 0;
                    const prereq = COURSES.find(c => c.id === course.prerequisiteCourseId)?.title;
                    return (
                        <button
                            key={course.id}
                            onClick={() => open && onSelectCourse(course.id)}
                            disabled={!open}
                            className={`no-hover group text-left rounded-2xl border overflow-hidden flex flex-col ${open
                                ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-cyan-600 hover:shadow-md'
                                : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 cursor-not-allowed'}`}
                        >
                            <div className={`h-2 bg-gradient-to-r ${course.accentColor} ${open ? '' : 'opacity-30'}`} />
                            <div className="p-6 flex flex-col gap-4 flex-1">
                                <div className="flex items-start gap-4">
                                    <span className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 bg-gray-100 dark:bg-gray-700 ${open ? '' : 'grayscale opacity-60'}`} aria-hidden="true">{course.icon}</span>
                                    <span className="min-w-0">
                                        <span className="block text-sm font-semibold text-gray-500 dark:text-gray-400">Course {i + 1}</span>
                                        <span className={`block text-xl font-bold ${open ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>{course.title}</span>
                                    </span>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 flex-1">{course.description}</p>

                                {course.comingSoon || (unlocked && progress.total === 0) ? (
                                    <Pill tone="warning" icon={<Sparkles className="w-3.5 h-3.5" />} className="self-start">{course.comingSoon ? 'Coming soon' : 'Lessons on the way'}</Pill>
                                ) : !unlocked ? (
                                    <p className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"><Lock className="w-4 h-4" />Finish {prereq} to open</p>
                                ) : (
                                    <div>
                                        <div className="flex justify-between text-sm mb-1.5">
                                            <span className="text-gray-600 dark:text-gray-400">{moduleCount} {moduleCount === 1 ? 'module' : 'modules'} · {progress.total} lessons</span>
                                            {!isTeacher && <span className="font-semibold tabular-nums text-gray-900 dark:text-white">{pct}%</span>}
                                        </div>
                                        {!isTeacher && <ProgressBar value={progress.completed} max={Math.max(progress.total, 1)} tone={complete ? 'success' : 'accent'} label={`${course.title} progress`} />}
                                    </div>
                                )}

                                {open && !course.comingSoon && progress.total > 0 && (
                                    <span className="inline-flex items-center gap-1.5 font-semibold text-cyan-700 dark:text-cyan-400">
                                        {complete && !isTeacher ? <><CheckCircle2 className="w-4 h-4 text-green-600" />Review</> : isTeacher ? 'Preview and assign' : started ? 'Continue' : 'Start'}
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                    </span>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </Page>
    );
};

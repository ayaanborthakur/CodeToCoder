import React, { useMemo } from 'react';
import { Lock, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
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
}

export const CoursesCatalog: React.FC<CoursesCatalogProps> = ({
    modules,
    completedLessons,
    onSelectCourse,
    unlockedCourseIds,
}) => {
    const { allModuleIds, modulesById } = useMemo(() => {
        const ids = modules.map(m => m.id);
        const byId = new Map(modules.map(m => [m.id, m] as const));
        return { allModuleIds: ids, modulesById: byId };
    }, [modules]);

    return (
        <div className="h-full w-full bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 overflow-y-auto">
            <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Courses</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Work through them in order. Each course unlocks once you finish the previous one.
                    </p>
                </header>

                <div className="space-y-3">
                    {COURSES.map(course => {
                        const progress = getCourseProgress(course.id, allModuleIds, modulesById, completedLessons);
                        const unlocked = isCourseUnlocked(course, allModuleIds, modulesById, completedLessons, unlockedCourseIds);
                        const complete = progress.total > 0 && progress.completed === progress.total;
                        const interactive = unlocked && !course.comingSoon;
                        const pct = progress.total > 0 ? Math.round(progress.fraction * 100) : 0;
                        const prereqTitle = COURSES.find(c => c.id === course.prerequisiteCourseId)?.title;

                        return (
                            <button
                                key={course.id}
                                onClick={() => interactive && onSelectCourse(course.id)}
                                disabled={!interactive}
                                className={`w-full relative flex items-stretch text-left rounded-xl border transition-all overflow-hidden ${
                                    interactive
                                        ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md cursor-pointer'
                                        : 'bg-gray-100 dark:bg-gray-800/40 border-gray-200 dark:border-gray-800 opacity-75 cursor-not-allowed'
                                }`}
                            >
                                {/* Left accent stripe — keeps a color cue without a decorative tile */}
                                <div className={`w-1.5 flex-shrink-0 bg-gradient-to-b ${course.accentColor} ${interactive ? '' : 'opacity-40'}`} />

                                <div className="flex-1 flex items-center gap-6 px-5 py-4 min-w-0">
                                    {/* Title + description */}
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h2 className="text-base font-bold text-gray-900 dark:text-white truncate">
                                                {course.title}
                                            </h2>
                                            {complete && (
                                                <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    Complete
                                                </span>
                                            )}
                                            {!unlocked && (
                                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">
                                                    <Lock className="w-3 h-3" />
                                                    Locked
                                                </span>
                                            )}
                                            {course.comingSoon && unlocked && (
                                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded">
                                                    <Sparkles className="w-3 h-3" />
                                                    Coming Soon
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                            {course.description}
                                        </p>
                                    </div>

                                    {/* Right side: progress / status */}
                                    <div className="flex items-center gap-4 flex-shrink-0">
                                        {course.comingSoon ? (
                                            <span className="text-xs text-gray-500 dark:text-gray-400 italic">
                                                Material coming soon
                                            </span>
                                        ) : !unlocked ? (
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                Finish <span className="font-semibold">{prereqTitle}</span> to unlock
                                            </span>
                                        ) : (
                                            <>
                                                <div className="hidden sm:block w-48">
                                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                                                        <div
                                                            className={`h-full bg-gradient-to-r ${course.accentColor} transition-all duration-500`}
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        {progress.completed} / {progress.total} lessons · {pct}%
                                                    </div>
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                            </>
                                        )}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

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
}

export const CoursesCatalog: React.FC<CoursesCatalogProps> = ({
    modules,
    completedLessons,
    onSelectCourse,
}) => {
    const { allModuleIds, modulesById } = useMemo(() => {
        const ids = modules.map(m => m.id);
        const byId = new Map(modules.map(m => [m.id, m] as const));
        return { allModuleIds: ids, modulesById: byId };
    }, [modules]);

    return (
        <div className="h-full w-full bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 overflow-y-auto">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Courses</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Work through them in order. Each course unlocks once you finish the previous one.
                    </p>
                </header>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {COURSES.map(course => {
                        const progress = getCourseProgress(course.id, allModuleIds, modulesById, completedLessons);
                        const unlocked = isCourseUnlocked(course, allModuleIds, modulesById, completedLessons);
                        const complete = progress.total > 0 && progress.completed === progress.total;
                        const interactive = unlocked && !course.comingSoon;
                        const pct = progress.total > 0 ? Math.round(progress.fraction * 100) : 0;

                        return (
                            <button
                                key={course.id}
                                onClick={() => interactive && onSelectCourse(course.id)}
                                disabled={!interactive}
                                className={`relative text-left rounded-2xl p-5 border transition-all overflow-hidden ${
                                    interactive
                                        ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer'
                                        : 'bg-gray-100 dark:bg-gray-800/40 border-gray-200 dark:border-gray-800 opacity-75 cursor-not-allowed'
                                }`}
                            >
                                {/* Accent bar */}
                                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${course.accentColor} ${interactive ? '' : 'opacity-40'}`} />

                                <div className="flex items-start justify-between mb-3">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-gradient-to-br ${course.accentColor} ${interactive ? '' : 'opacity-50 grayscale'}`}>
                                        {course.icon}
                                    </div>
                                    {complete && (
                                        <div className="flex items-center gap-1 text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-md">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            Complete
                                        </div>
                                    )}
                                    {!unlocked && (
                                        <div className="flex items-center gap-1 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-md">
                                            <Lock className="w-3.5 h-3.5" />
                                            Locked
                                        </div>
                                    )}
                                    {course.comingSoon && unlocked && (
                                        <div className="flex items-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded-md">
                                            <Sparkles className="w-3.5 h-3.5" />
                                            Coming Soon
                                        </div>
                                    )}
                                </div>

                                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-1">{course.title}</h2>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 min-h-[2rem]">
                                    {course.description}
                                </p>

                                {course.comingSoon ? (
                                    <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                                        Material coming soon.
                                    </div>
                                ) : !unlocked ? (
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        Complete <span className="font-semibold">{COURSES.find(c => c.id === course.prerequisiteCourseId)?.title}</span> to unlock.
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                                            <div
                                                className={`h-full bg-gradient-to-r ${course.accentColor} transition-all duration-500`}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {progress.completed} / {progress.total} lessons · {pct}%
                                            </span>
                                            <ArrowRight className="w-4 h-4 text-gray-400" />
                                        </div>
                                    </>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

import React, { useMemo, useState } from 'react';
import { ArrowLeft, BookOpen, Check, Flag, Lock, ExternalLink, ClipboardCheck } from 'lucide-react';
import type { Classroom, Module } from '../types';
import {
    COURSES,
    resolveCourseModuleIds,
    getCourseProgress,
    isCourseUnlocked,
} from '../data/coursesData';
import { AssignLessonModal } from './AssignLessonModal';

interface CoursePageProps {
    courseId: string;
    modules: Module[];
    completedLessons: Set<string>;
    onBackToCatalog: () => void;
    // Teacher-only assignment affordance. When both are present, each lesson row
    // gets an "Assign" button.
    teacherId?: string;
    teacherClassroom?: Classroom | null;
}

export const CoursePage: React.FC<CoursePageProps> = ({
    courseId,
    modules,
    completedLessons,
    onBackToCatalog,
    teacherId,
    teacherClassroom,
}) => {
    const course = COURSES.find(c => c.id === courseId);
    const [assignTarget, setAssignTarget] = useState<{ moduleId: string; lessonId: string; lessonTitle: string } | null>(null);
    const [recentlyAssigned, setRecentlyAssigned] = useState<Set<string>>(new Set());
    const canAssign = !!(teacherId && teacherClassroom);

    const { allModuleIds, modulesById, courseModules, progress, unlocked } = useMemo(() => {
        const allIds = modules.map(m => m.id);
        const byId = new Map(modules.map(m => [m.id, m] as const));
        const moduleIds = resolveCourseModuleIds(courseId, allIds);
        const courseMods = moduleIds.map(id => byId.get(id)).filter((m): m is Module => !!m);
        const prog = getCourseProgress(courseId, allIds, byId, completedLessons);
        const u = course ? isCourseUnlocked(course, allIds, byId, completedLessons) : false;
        return { allModuleIds: allIds, modulesById: byId, courseModules: courseMods, progress: prog, unlocked: u };
    }, [courseId, modules, completedLessons, course]);

    // Opens the IDE for a specific lesson in a new tab.
    const openLesson = (moduleId: string, lessonId: string) => {
        window.open(`/lessons/${moduleId}/${lessonId}`, '_blank', 'noopener,noreferrer');
    };

    if (!course) {
        return (
            <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                Course not found.
                <button onClick={onBackToCatalog} className="ml-3 underline">Back</button>
            </div>
        );
    }

    const pct = progress.total > 0 ? Math.round(progress.fraction * 100) : 0;

    return (
        <div className="h-full w-full bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
                <button
                    onClick={onBackToCatalog}
                    className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    All courses
                </button>

                {/* Course header */}
                <div className={`rounded-xl mb-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden`}>
                    <div className={`h-1.5 bg-gradient-to-r ${course.accentColor}`} />
                    <div className="p-6">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{course.title}</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{course.description}</p>
                        {!course.comingSoon && unlocked && progress.total > 0 && (
                            <div className="mt-4">
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                    <div className={`h-full bg-gradient-to-r ${course.accentColor} transition-all duration-500`} style={{ width: `${pct}%` }} />
                                </div>
                                <div className="text-xs mt-2 text-gray-500 dark:text-gray-400">
                                    {progress.completed} / {progress.total} lessons · {pct}%
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Locked or coming soon empty states */}
                {!unlocked && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 text-center">
                        <Lock className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">This course is locked.</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Finish <span className="font-semibold">{COURSES.find(c => c.id === course.prerequisiteCourseId)?.title}</span> to unlock it.
                        </p>
                    </div>
                )}

                {unlocked && course.comingSoon && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 text-center">
                        <BookOpen className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Material coming soon.</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            We're working on lessons for this course. Check back later.
                        </p>
                    </div>
                )}

                {unlocked && !course.comingSoon && courseModules.length === 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400">
                        No lessons in this course yet.
                    </div>
                )}

                {/* Modules + lesson buttons */}
                {/* Assign modal (teacher only). Kept here so it's in the same render tree as the trigger. */}
                {assignTarget && canAssign && teacherClassroom && teacherId && (
                    <AssignLessonModal
                        classroom={teacherClassroom}
                        teacherId={teacherId}
                        courseId={courseId}
                        courseTitle={course.title}
                        moduleId={assignTarget.moduleId}
                        lessonId={assignTarget.lessonId}
                        lessonTitle={assignTarget.lessonTitle}
                        onClose={() => setAssignTarget(null)}
                        onAssigned={() => {
                            setRecentlyAssigned(prev => {
                                const next = new Set(prev);
                                next.add(assignTarget.lessonId);
                                return next;
                            });
                        }}
                    />
                )}

                {unlocked && !course.comingSoon && courseModules.length > 0 && (
                    <div className="space-y-5">
                        {courseModules.map((module, moduleIndex) => {
                            const completedInModule = module.lessons.filter(l => completedLessons.has(l.id)).length;
                            const total = module.lessons.length;

                            // Module locking: same rule as the old sidebar - locked until previous module's final lesson is done.
                            let moduleLocked = false;
                            if (moduleIndex > 0) {
                                const prevModule = courseModules[moduleIndex - 1];
                                if (prevModule.lessons.length > 0) {
                                    const prevFinal = prevModule.lessons[prevModule.lessons.length - 1];
                                    moduleLocked = !completedLessons.has(prevFinal.id);
                                }
                            }

                            return (
                                <section
                                    key={module.id}
                                    className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden ${moduleLocked ? 'opacity-60' : ''}`}
                                >
                                    <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                        <div>
                                            <h2 className="font-bold text-gray-900 dark:text-white">{module.title}</h2>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                {moduleLocked
                                                    ? 'Locked — finish the previous module'
                                                    : `${completedInModule} / ${total} lessons`}
                                            </p>
                                        </div>
                                        {moduleLocked && <Lock className="w-4 h-4 text-gray-400" />}
                                    </div>

                                    {!moduleLocked && (
                                        <div className="p-3 grid sm:grid-cols-2 gap-2">
                                            {module.lessons.map((lesson, lessonIndex) => {
                                                const isCompleted = completedLessons.has(lesson.id);
                                                const isFinal = lessonIndex === module.lessons.length - 1;

                                                return (
                                                    <div
                                                        key={lesson.id}
                                                        className="group flex items-center gap-3 text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-cyan-500 dark:hover:border-cyan-500 transition-colors"
                                                    >
                                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center border flex-shrink-0 ${
                                                            isCompleted
                                                                ? 'bg-green-500 border-green-500 text-white'
                                                                : isFinal
                                                                    ? 'border-purple-400 text-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                                                    : 'border-gray-300 dark:border-gray-600 text-gray-500'
                                                        }`}>
                                                            {isCompleted ? (
                                                                <Check className="w-4 h-4" strokeWidth={3} />
                                                            ) : isFinal ? (
                                                                <Flag className="w-3.5 h-3.5" />
                                                            ) : (
                                                                <span className="text-xs font-bold">{lessonIndex + 1}</span>
                                                            )}
                                                        </div>
                                                        <button
                                                            onClick={() => openLesson(module.id, lesson.id)}
                                                            className="min-w-0 flex-1 text-left"
                                                        >
                                                            <div className="font-semibold text-sm text-gray-900 dark:text-white truncate group-hover:text-cyan-700 dark:group-hover:text-cyan-400">
                                                                {lesson.title}
                                                            </div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                {isCompleted ? 'Completed' : isFinal ? 'Module project' : `Lesson ${lessonIndex + 1}`}
                                                            </div>
                                                        </button>
                                                        {canAssign && (
                                                            <button
                                                                onClick={() => setAssignTarget({ moduleId: module.id, lessonId: lesson.id, lessonTitle: lesson.title })}
                                                                className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold transition-colors flex-shrink-0 ${
                                                                    recentlyAssigned.has(lesson.id)
                                                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                                                        : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50'
                                                                }`}
                                                                title="Assign this lesson to your class"
                                                            >
                                                                <ClipboardCheck className="w-3.5 h-3.5" />
                                                                {recentlyAssigned.has(lesson.id) ? 'Assigned' : 'Assign'}
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => openLesson(module.id, lesson.id)}
                                                            className="flex-shrink-0"
                                                            title="Open in new tab"
                                                            aria-label="Open lesson in new tab"
                                                        >
                                                            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400" />
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </section>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

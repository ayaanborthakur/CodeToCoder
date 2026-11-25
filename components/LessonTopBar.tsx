import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, ListTree } from 'lucide-react';
import type { Module } from '../types';

/**
 * Where you are in a course while doing a lesson: back to the course, the
 * lesson's place in its module, and previous / next.
 */
export const LessonTopBar: React.FC<{
    courseTitle: string;
    courseHref: string;
    module: Module;
    lessonId: string;
    completedLessons: Set<string>;
    hasPrevious: boolean;
    hasNext: boolean;
    onPrevious: () => void;
    onNext: () => void;
    onToggleOutline: () => void;
    outlineOpen: boolean;
}> = ({ courseTitle, courseHref, module, lessonId, completedLessons, hasPrevious, hasNext, onPrevious, onNext, onToggleOutline, outlineOpen }) => {
    const index = module.lessons.findIndex(l => l.id === lessonId);
    const lesson = module.lessons[index];
    const navButton = 'no-hover inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed';

    return (
        <header className="flex-shrink-0 flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
            <Link to={courseHref} className={navButton}>
                <ArrowLeft className="w-4 h-4" aria-hidden="true" /><span className="hidden sm:inline">{courseTitle}</span><span className="sm:hidden">Course</span>
            </Link>
            <button onClick={onToggleOutline} className={`${navButton} ${outlineOpen ? '!bg-cyan-50 !border-cyan-300 !text-cyan-800 dark:!bg-cyan-900/30 dark:!text-cyan-300' : ''}`} aria-pressed={outlineOpen} title="Show all lessons">
                <ListTree className="w-4 h-4" aria-hidden="true" /><span className="hidden lg:inline">All lessons</span>
            </button>
            <div className="flex-1 min-w-[12rem]">
                <div className="font-bold text-lg leading-tight text-gray-900 dark:text-white truncate">{lesson?.title}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{module.title} · Lesson {index + 1} of {module.lessons.length}</div>
            </div>
            <ol className="hidden md:flex items-center gap-1.5" aria-label="Lessons in this module">
                {module.lessons.map((l, i) => (
                    <li
                        key={l.id}
                        title={l.title}
                        className={`h-2 w-7 rounded-full ${i === index ? 'bg-cyan-700 dark:bg-cyan-400' : completedLessons.has(l.id) ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                    >
                        <span className="sr-only">{l.title}{completedLessons.has(l.id) ? ' (done)' : i === index ? ' (current)' : ''}</span>
                    </li>
                ))}
            </ol>
            <div className="flex gap-2">
                <button onClick={onPrevious} disabled={!hasPrevious} className={navButton}><ChevronLeft className="w-4 h-4" aria-hidden="true" />Previous</button>
                <button onClick={onNext} disabled={!hasNext} className={navButton}>Next<ChevronRight className="w-4 h-4" aria-hidden="true" /></button>
            </div>
        </header>
    );
};

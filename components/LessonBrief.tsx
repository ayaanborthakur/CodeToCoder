import React from 'react';
import { CheckCircle2, Lightbulb, Target } from 'lucide-react';
import type { Lesson } from '../types';
import { Markdown } from './Markdown';

interface LessonBriefProps {
    lesson: Lesson;
    isCompleted: boolean;
}

/**
 * The task for a coding lesson or practice item: what to build, the full
 * instructions, and (on request) the mistakes people usually make.
 */
export const LessonBrief: React.FC<LessonBriefProps> = ({ lesson, isCompleted }) => (
    <article className="px-6 py-6 max-w-[68ch]">
        <h1 className="text-2xl font-bold leading-tight text-gray-900 dark:text-white">{lesson.title}</h1>

        {isCompleted && (
            <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-green-700 dark:text-green-400">
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                Completed
            </p>
        )}

        {lesson.goal && (
            <section className="mt-5 rounded-lg border border-cyan-200 bg-cyan-50 p-4 dark:border-cyan-800/60 dark:bg-cyan-950/40">
                <h2 className="flex items-center gap-2 text-sm font-bold text-cyan-800 dark:text-cyan-300">
                    <Target className="w-4 h-4" aria-hidden="true" />
                    Your goal
                </h2>
                <Markdown className="prose prose-sm max-w-none mt-1 text-gray-800 dark:text-gray-200">{lesson.goal}</Markdown>
            </section>
        )}

        {lesson.content && (
            <Markdown className="prose max-w-none mt-6 text-gray-700 dark:text-gray-300">{lesson.content}</Markdown>
        )}

        {lesson.commonMistakes && (
            <details className="group mt-6 rounded-lg border border-gray-200 dark:border-gray-800">
                <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                    <Lightbulb className="w-4 h-4 text-amber-500" aria-hidden="true" />
                    Stuck? Common mistakes
                    <span className="ml-auto text-xs font-normal text-gray-500 group-open:hidden">Show</span>
                    <span className="ml-auto text-xs font-normal text-gray-500 hidden group-open:inline">Hide</span>
                </summary>
                <Markdown className="prose prose-sm max-w-none px-4 pb-4 text-gray-700 dark:text-gray-300">{lesson.commonMistakes}</Markdown>
            </details>
        )}
    </article>
);

import React from 'react';
import { CheckCircle2, Lightbulb } from 'lucide-react';
import type { Lesson } from '../types';
import { Markdown } from './Markdown';

/**
 * The task for a coding lesson or practice item: the goal, the full
 * instructions, and (when asked for) the mistakes people usually make.
 */
export const LessonBrief: React.FC<{ lesson: Lesson; isCompleted: boolean }> = ({ lesson, isCompleted }) => (
    <div className="p-6 max-w-3xl">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white pr-2 mb-4">{lesson.title}</h2>

        {isCompleted && (
            <div className="bg-green-500/10 border border-green-500/30 text-green-700 dark:bg-green-600/20 dark:border-green-500/50 dark:text-green-300 px-4 py-2 rounded-lg mb-4 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                <p className="font-semibold text-sm">Lesson completed. Great work.</p>
            </div>
        )}

        {lesson.goal && (
            <div className="bg-cyan-50 dark:bg-cyan-900/20 border-l-4 border-cyan-500 text-cyan-900 dark:text-cyan-100 p-4 rounded-r-lg mb-6">
                <h3 className="font-bold text-sm text-cyan-700 dark:text-cyan-300 mb-1">Your goal</h3>
                <Markdown className="text-sm prose prose-sm max-w-none dark:prose-invert prose-p:m-0">{lesson.goal}</Markdown>
            </div>
        )}

        {lesson.content && (
            <Markdown className="prose prose-sm md:prose-base max-w-none dark:prose-invert text-gray-600 dark:text-gray-300">{lesson.content}</Markdown>
        )}

        {lesson.commonMistakes && (
            <details className="group mt-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                    <Lightbulb className="w-4 h-4 text-amber-500" aria-hidden="true" />
                    Stuck? Common mistakes
                    <span className="ml-auto text-xs font-normal text-gray-500 group-open:hidden">Show</span>
                    <span className="ml-auto text-xs font-normal text-gray-500 hidden group-open:inline">Hide</span>
                </summary>
                <Markdown className="text-sm prose prose-sm max-w-none dark:prose-invert px-4 pb-4 text-gray-700 dark:text-gray-300">{lesson.commonMistakes}</Markdown>
            </details>
        )}
    </div>
);

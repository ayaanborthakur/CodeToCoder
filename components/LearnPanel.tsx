
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Lesson } from '../types';

interface LearnPanelProps {
    lesson: Lesson;
    onComplete: () => void;
    isCompleted: boolean;
}

export const LearnPanel: React.FC<LearnPanelProps> = ({ lesson, onComplete, isCompleted }) => {
    const handleContinue = () => {
        onComplete();
        // Scroll to top for next lesson
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="flex flex-col h-full w-full bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="h-16 px-6 flex justify-between items-center bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 shadow-sm z-10">
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-cyan-50 dark:bg-cyan-900/20">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-cyan-600 dark:text-cyan-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                        </svg>
                    </div>
                    <div className="flex flex-col">
                        <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight">{lesson.title}</h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Interactive Lesson</span>
                    </div>
                </div>

                {isCompleted && (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-bold text-sm bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                        <span>Completed</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div id="learn-container" className="flex-1 overflow-y-auto p-4 sm:p-8 scroll-smooth">
                <div className="max-w-3xl mx-auto pb-20">
                    {/* Main Content Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="p-6 sm:p-8">
                            {/* Markdown Content */}
                            <div className="prose dark:prose-invert max-w-none
                                prose-headings:text-gray-900 dark:prose-headings:text-white
                                prose-h1:text-3xl prose-h1:font-extrabold prose-h1:mb-6 prose-h1:text-center
                                prose-h2:text-xl prose-h2:font-bold prose-h2:mt-8 prose-h2:mb-4 prose-h2:text-cyan-700 dark:prose-h2:text-cyan-400
                                prose-h3:text-lg prose-h3:font-bold prose-h3:mt-6 prose-h3:mb-3
                                prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-4
                                prose-a:text-cyan-600 dark:prose-a:text-cyan-400 prose-a:font-medium
                                prose-code:text-cyan-700 dark:prose-code:text-cyan-300 prose-code:bg-cyan-50 dark:prose-code:bg-cyan-900/30 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-sm
                                prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-xl prose-pre:overflow-x-auto prose-pre:shadow-inner
                                prose-ul:text-gray-700 dark:prose-ul:text-gray-300 prose-ul:space-y-2
                                prose-ol:text-gray-700 dark:prose-ol:text-gray-300 prose-ol:space-y-2
                                prose-li:leading-relaxed
                                prose-strong:text-gray-900 dark:prose-strong:text-white prose-strong:font-bold
                                prose-em:text-cyan-700 dark:prose-em:text-cyan-300
                                prose-table:w-full prose-table:border-collapse
                                prose-th:bg-gray-100 dark:prose-th:bg-gray-700 prose-th:p-3 prose-th:text-left prose-th:font-bold prose-th:border prose-th:border-gray-200 dark:prose-th:border-gray-600
                                prose-td:p-3 prose-td:border prose-td:border-gray-200 dark:prose-td:border-gray-700
                                prose-blockquote:border-l-4 prose-blockquote:border-cyan-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600 dark:prose-blockquote:text-gray-400
                            ">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {lesson.content}
                                </ReactMarkdown>
                            </div>

                            {/* Goal Section */}
                            {lesson.goal && (
                                <div className="mt-8 p-4 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-xl">
                                    <div className="flex items-start gap-3">
                                        <div className="p-1 rounded-lg bg-cyan-100 dark:bg-cyan-800">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-cyan-600 dark:text-cyan-400">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-cyan-800 dark:text-cyan-300 uppercase tracking-wide mb-1">Learning Goal</p>
                                            <p className="text-cyan-900 dark:text-cyan-100">{lesson.goal}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Continue Button */}
                    <div className="pt-8 pb-12 flex justify-center">
                        <button
                            onClick={handleContinue}
                            className="group px-12 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-xl rounded-full shadow-xl shadow-cyan-500/20 hover:shadow-2xl hover:shadow-cyan-500/30 hover:scale-105 transition-all transform flex items-center gap-3"
                        >
                            <span>{isCompleted ? 'Continue to Next' : 'I Understand, Continue'}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 group-hover:translate-x-1 transition-transform">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


import React, { useEffect } from 'react';
import type { Lesson } from '../types';
import { CollapseIcon } from './CollapseIcon';
import { ReferencePanel } from './ReferencePanel';

declare global {
    interface Window {
        marked: any;
    }
}

interface BottomPanelProps {
    lesson: Lesson | null;
    isCompleted: boolean;
    terminalOutput: string;
    isTerminalLoading: boolean;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
    activeTab: 'lesson' | 'terminal' | 'reference';
    onTabChange: (tab: 'lesson' | 'terminal' | 'reference') => void;
    showReference?: boolean;
    // Hint button
    onRequestHint?: () => void;
    isHintLoading?: boolean;
    hintFeedback?: string | null;
    aiCreditsLeft?: number;
}

import { CheckCircle2, BookOpen } from 'lucide-react';

import { TerminalPanel } from './TerminalPanel';

const LessonCompletedBanner: React.FC = () => (
    <div className="bg-green-500/10 border border-green-500/30 text-green-700 dark:bg-green-600/20 dark:border-green-500/50 dark:text-green-300 px-4 py-2 rounded-lg mb-4 flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5" />
        <p className="font-semibold text-sm">Lesson Completed! Great work.</p>
    </div>
);

const TabButton: React.FC<{
    name: 'lesson' | 'terminal' | 'reference';
    label: string;
    activeTab: 'lesson' | 'terminal' | 'reference';
    onClick: (name: 'lesson' | 'terminal' | 'reference') => void;
    icon?: React.ReactNode;
}> = ({ name, label, activeTab, onClick, icon }) => (
    <button
        onClick={() => onClick(name)}
        data-tab={name}
        className={`relative px-4 h-full flex items-center gap-2 text-sm font-medium transition-colors border-b-2 ${activeTab === name
            ? 'text-cyan-600 dark:text-cyan-400 border-cyan-500'
            : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-200'
            }`}
        aria-selected={activeTab === name}
        role="tab"
    >
        {icon}
        {label}
    </button>
);



const parseMarkdown = (content: string) => {
    if (typeof window !== 'undefined' && window.marked && window.marked.parse) {
        return window.marked.parse(content);
    }
    return content;
}

export const BottomPanel: React.FC<BottomPanelProps & {
    isWaitingForInput?: boolean;
    onInputSubmit?: (text: string) => void;
}> = ({
    lesson,
    isCompleted,
    terminalOutput,
    isTerminalLoading,
    isCollapsed,
    onToggleCollapse,
    activeTab,
    onTabChange,
    showReference,
    isWaitingForInput = false,
    onInputSubmit = () => {},
    onRequestHint,
    isHintLoading = false,
    hintFeedback = null,
    aiCreditsLeft = 5,
}) => {

    const isTerminal = activeTab === 'terminal';

    // Force terminal tab if no lesson (Playground mode)
    useEffect(() => {
        if (!lesson && !showReference && activeTab === 'lesson') {
            onTabChange('terminal');
        }
    }, [lesson, activeTab, onTabChange, showReference]);

    return (
        <div className={`${isCollapsed ? 'h-auto' : 'h-full'} w-full flex flex-col overflow-hidden transition-colors duration-300 ${isTerminal ? 'bg-gray-900 dark' : 'bg-white dark:bg-gray-800'}`}>
            {/* Header */}
            <div className={`h-12 flex justify-between items-center border-b flex-shrink-0 px-4 ${isTerminal ? 'bg-gray-900 border-gray-800' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800'}`}>
                {!isCollapsed && (
                    <div className="flex items-center h-full" role="tablist">
                        {lesson && (
                            <>
                                <TabButton name="lesson" label="Lesson" activeTab={activeTab} onClick={onTabChange} />
                            </>
                        )}
                        <TabButton name="terminal" label="Terminal" activeTab={activeTab} onClick={onTabChange} />
                        {showReference && (
                            <TabButton
                                name="reference"
                                label="Reference"
                                activeTab={activeTab}
                                onClick={onTabChange}
                                icon={<BookOpen className="w-4 h-4" />}
                            />
                        )}
                    </div>
                )}
                <div className={`${isCollapsed ? 'w-full flex justify-end' : ''}`}>
                    <button
                        onClick={onToggleCollapse}
                        className={`p-1 rounded-md transition-colors ${isTerminal
                            ? 'text-gray-400 hover:bg-gray-800 hover:text-white'
                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-black dark:hover:text-white'
                            }`}
                        aria-label={isCollapsed ? "Expand bottom panel" : "Collapse bottom panel"}
                    >
                        <CollapseIcon isCollapsed={isCollapsed} />
                    </button>
                </div>
            </div>

            {/* Content */}
            {!isCollapsed && (
                <div className={`flex-1 ${activeTab === 'reference' ? 'overflow-hidden' : 'overflow-y-auto'}`} role="tabpanel">
                    {activeTab === 'reference' && (
                        <ReferencePanel embedded={true} />
                    )}

                    {activeTab === 'lesson' && lesson && (
                        <div className="p-6 max-w-3xl">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white truncate pr-2 mb-4">{lesson.title}</h2>
                            {isCompleted && <LessonCompletedBanner />}

                            {/* Goal Section */}
                            <div className="bg-cyan-50 dark:bg-cyan-900/20 border-l-4 border-cyan-500 text-cyan-900 dark:text-cyan-100 p-4 rounded-r-lg mb-6">
                                <h3 className="font-bold text-xs uppercase tracking-wide text-cyan-700 dark:text-cyan-300 mb-1">Your Goal</h3>
                                <div
                                    className="text-sm prose prose-sm max-w-none dark:prose-invert prose-p:m-0 prose-a:text-cyan-600 dark:prose-a:text-cyan-400"
                                    dangerouslySetInnerHTML={{ __html: parseMarkdown(lesson.goal) }}
                                />
                            </div>

                            {/* Common Mistakes Section */}
                            {lesson.commonMistakes && (
                                <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-900 dark:text-red-100 p-4 rounded-r-lg mb-6">
                                    <h3 className="font-bold text-xs uppercase tracking-wide text-red-700 dark:text-red-300 mb-1">Common Mistakes</h3>
                                    <div
                                        className="text-sm prose prose-sm max-w-none dark:prose-invert prose-p:m-0 prose-a:text-red-600 dark:prose-a:text-red-400"
                                        dangerouslySetInnerHTML={{ __html: parseMarkdown(lesson.commonMistakes) }}
                                    />
                                </div>
                            )}

                            <div
                                className="prose prose-sm md:prose-base max-w-none dark:prose-invert text-gray-600 dark:text-gray-300"
                                dangerouslySetInnerHTML={{ __html: parseMarkdown(lesson.content) }}
                            />
                        </div>
                    )}



                    {activeTab === 'terminal' && (
                        <TerminalPanel
                            output={terminalOutput}
                            isLoading={isTerminalLoading}
                            isWaitingForInput={isWaitingForInput}
                            onInputSubmit={onInputSubmit}
                            onRequestHint={onRequestHint}
                            isHintLoading={isHintLoading}
                            hintFeedback={hintFeedback}
                            aiCreditsLeft={aiCreditsLeft}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

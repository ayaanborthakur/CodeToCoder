import React, { useEffect } from 'react';
import type { Lesson } from '../types';
import { CollapseIcon } from './CollapseIcon';
import { ReferencePanel } from './ReferencePanel';
import { LessonBrief } from './LessonBrief';

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
    aiCreditsLeft?: number;
}

import { BookOpen } from 'lucide-react';

import { TerminalPanel } from './TerminalPanel';

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
    aiCreditsLeft = 5,
}) => {

    const isTerminal = activeTab === 'terminal';

    // No lesson tab without a lesson (playground, or when the brief has its
    // own column) — fall back to the terminal.
    useEffect(() => {
        if (!lesson && activeTab === 'lesson') {
            onTabChange('terminal');
        }
    }, [lesson, activeTab, onTabChange]);

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
                        <LessonBrief lesson={lesson} isCompleted={isCompleted} />
                    )}

                    {activeTab === 'terminal' && (
                        <TerminalPanel
                            output={terminalOutput}
                            isLoading={isTerminalLoading}
                            isWaitingForInput={isWaitingForInput}
                            onInputSubmit={onInputSubmit}
                            onRequestHint={onRequestHint}
                            isHintLoading={isHintLoading}
                            aiCreditsLeft={aiCreditsLeft}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

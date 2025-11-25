
import React, { useEffect, useState } from 'react';
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
  activeTab: 'lesson' | 'terminal' | 'video' | 'reference';
  onTabChange: (tab: 'lesson' | 'terminal' | 'video' | 'reference') => void;
  videoUrl: string | null;
  isVideoGenerating: boolean;
  onGenerateVideo: () => void;
  showReference?: boolean;
}

const CheckIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className || "w-5 h-5"}>
        <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
    </svg>
);

const VideoCameraIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-5 h-5"}>
      <path d="M4.5 4.5a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h8.25a3 3 0 0 0 3-3v-9a3 3 0 0 0-3-3H4.5ZM19.94 18.75l-2.69-2.69V7.94l2.69-2.69c.944-.945 2.56-.276 2.56 1.06v11.38c0 1.336-1.616 2.005-2.56 1.06Z" />
    </svg>
);

const PlayIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-5 h-5"}>
      <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
    </svg>
);

const BookIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
    </svg>
);

const LessonCompletedBanner: React.FC = () => (
    <div className="bg-green-500/10 border border-green-500/30 text-green-700 dark:bg-green-600/20 dark:border-green-500/50 dark:text-green-300 px-4 py-2 rounded-lg mb-4 flex items-center gap-3">
        <CheckIcon className="w-5 h-5" />
        <p className="font-semibold text-sm">Lesson Completed! Great work.</p>
    </div>
);

const TabButton: React.FC<{
    name: 'lesson' | 'terminal' | 'video' | 'reference';
    label: string;
    activeTab: 'lesson' | 'terminal' | 'video' | 'reference';
    onClick: (name: 'lesson' | 'terminal' | 'video' | 'reference') => void;
    isTerminal?: boolean;
    icon?: React.ReactNode;
}> = ({ name, label, activeTab, onClick, isTerminal, icon }) => (
    <button
        onClick={() => onClick(name)}
        className={`relative px-4 h-full flex items-center gap-2 text-sm font-medium transition-colors border-b-2 ${
            activeTab === name
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

const LOADING_MESSAGES = [
    "Dreaming up pixels...",
    "Teaching the AI to draw...",
    "Synthesizing knowledge...",
    "Compiling visual data...",
    "Rendering neural frames...",
    "Creating your video...",
];

const parseMarkdown = (content: string) => {
    if (typeof window !== 'undefined' && window.marked && window.marked.parse) {
        return window.marked.parse(content);
    }
    return content;
}

export const BottomPanel: React.FC<BottomPanelProps> = ({ 
    lesson, 
    isCompleted, 
    terminalOutput,
    isTerminalLoading,
    isCollapsed,
    onToggleCollapse,
    activeTab,
    onTabChange,
    videoUrl,
    isVideoGenerating,
    onGenerateVideo,
    showReference
}) => {
  const isTerminal = activeTab === 'terminal';
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);

  useEffect(() => {
    if (isVideoGenerating) {
        const interval = setInterval(() => {
            setLoadingMessage(LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]);
        }, 3000);
        return () => clearInterval(interval);
    }
  }, [isVideoGenerating]);

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
                    <TabButton name="lesson" label="Lesson" activeTab={activeTab} onClick={onTabChange} isTerminal={isTerminal} />
                    <TabButton 
                        name="video" 
                        label="Video" 
                        activeTab={activeTab} 
                        onClick={onTabChange} 
                        isTerminal={isTerminal} 
                        icon={<VideoCameraIcon className="w-4 h-4" />}
                    />
                  </>
                )}
                <TabButton name="terminal" label="Terminal" activeTab={activeTab} onClick={onTabChange} isTerminal={isTerminal} />
                {showReference && (
                    <TabButton 
                        name="reference" 
                        label="Reference" 
                        activeTab={activeTab} 
                        onClick={onTabChange} 
                        isTerminal={isTerminal} 
                        icon={<BookIcon className="w-4 h-4" />}
                    />
                )}
            </div>
        )}
        <div className={`${isCollapsed ? 'w-full flex justify-end' : ''}`}>
            <button 
                onClick={onToggleCollapse}
                className={`p-1 rounded-md transition-colors ${
                    isTerminal 
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
                <ReferencePanel />
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
            
            {activeTab === 'video' && lesson && (
                <div className="p-6 h-full flex flex-col items-center justify-center">
                    {isVideoGenerating ? (
                         <div className="flex flex-col items-center gap-4 animate-fade-in">
                             <div className="relative">
                                 <div className="w-16 h-16 border-4 border-cyan-200 dark:border-cyan-900 rounded-full"></div>
                                 <div className="w-16 h-16 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                             </div>
                             <p className="text-gray-600 dark:text-gray-300 font-medium text-center animate-pulse">
                                 {loadingMessage}
                             </p>
                             <p className="text-xs text-gray-400 max-w-xs text-center">
                                 AI video generation can take a moment. Hang tight!
                             </p>
                         </div>
                    ) : videoUrl ? (
                        <div className="w-full max-w-3xl space-y-4 animate-fade-in">
                             <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700">
                                 <video 
                                    src={videoUrl} 
                                    controls 
                                    className="w-full h-full object-cover"
                                    autoPlay
                                    loop
                                 >
                                     Your browser does not support the video tag.
                                 </video>
                             </div>
                             <div className="flex justify-between items-center">
                                 <div>
                                     <h3 className="font-bold text-gray-900 dark:text-white">{lesson.title} Visualization</h3>
                                     <p className="text-sm text-gray-500 dark:text-gray-400">Generated by Gemini Veo</p>
                                 </div>
                                 <a 
                                    href={videoUrl} 
                                    download={`${lesson.title.replace(/\s+/g, '_')}_intro.mp4`}
                                    className="text-cyan-600 hover:text-cyan-500 text-sm font-medium"
                                 >
                                     Download Video
                                 </a>
                             </div>
                        </div>
                    ) : (
                        <div className="text-center space-y-6 max-w-md animate-fade-in">
                             <div className="w-20 h-20 bg-cyan-100 dark:bg-cyan-900/30 rounded-full flex items-center justify-center mx-auto text-cyan-600 dark:text-cyan-400 mb-4">
                                 <VideoCameraIcon className="w-10 h-10" />
                             </div>
                             <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                 Visualize This Lesson
                             </h3>
                             <p className="text-gray-600 dark:text-gray-300">
                                 Use AI to generate a short, futuristic video visualization of the concepts in <strong>{lesson.title}</strong>.
                             </p>
                             <button
                                onClick={onGenerateVideo}
                                className="inline-flex items-center gap-2 px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-full shadow-lg shadow-cyan-500/20 hover:scale-105 transition-all"
                             >
                                <PlayIcon className="w-5 h-5" />
                                Generate AI Video
                             </button>
                             <p className="text-xs text-gray-400">
                                 Powered by Gemini Veo. Requires a paid API key.
                             </p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'terminal' && (
                <div className="p-4 h-full font-mono text-sm">
                    {isTerminalLoading && !terminalOutput.startsWith('Evaluating') && !terminalOutput.startsWith('Running') && (
                        <div className="flex items-center gap-2 text-gray-400 mb-2">
                            <div className="w-3 h-3 border-2 border-t-transparent border-gray-400 rounded-full animate-spin"></div>
                            <span>Loading...</span>
                        </div>
                    )}
                    <pre className="text-gray-300 whitespace-pre-wrap">{terminalOutput}</pre>
                </div>
            )}
        </div>
      )}
    </div>
  );
};

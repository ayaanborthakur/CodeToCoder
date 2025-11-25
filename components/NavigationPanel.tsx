
import React, { useState } from 'react';
import type { Module } from '../types';

interface NavigationPanelProps {
  modules: Module[];
  currentLessonId: string;
  onSelectLesson: (moduleId: string, lessonId: string) => void;
  completedLessons: Set<string>;
}

const ChevronDownIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
);

const CheckIcon: React.FC<{className?: string; strokeWidth?: number}> = ({className, strokeWidth}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={strokeWidth || 2} stroke="currentColor" className={className || "w-4 h-4"}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
);

const LockIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
);

const ModuleCompleteIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-5 h-5"}>
      <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12c0 1.357-.6 2.573-1.549 3.397a4.49 4.49 0 0 1-1.307 3.498 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.491 4.491 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
    </svg>
);


export const NavigationPanel: React.FC<NavigationPanelProps> = ({ modules, currentLessonId, onSelectLesson, completedLessons }) => {
  const [openModuleId, setOpenModuleId] = useState<string | null>(modules[0]?.id || null);

  const toggleModule = (moduleId: string) => {
    setOpenModuleId(openModuleId === moduleId ? null : moduleId);
  };

  return (
    <nav className="px-2 py-2">
      <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4 px-2">Curriculum</h2>
      <div className="space-y-3">
        {modules.map((module, index) => {
          const completedInModule = module.lessons.filter(l => completedLessons.has(l.id)).length;
          const totalInModule = module.lessons.length;
          const isModuleComplete = totalInModule > 0 && completedInModule === totalInModule;
          
          // LOCK LOGIC: Module is locked if it's not the first one AND the previous module's final lesson is incomplete
          let isLocked = false;
          if (index > 0) {
              const prevModule = modules[index - 1];
              const prevFinalLesson = prevModule.lessons[prevModule.lessons.length - 1];
              if (!completedLessons.has(prevFinalLesson.id)) {
                  isLocked = true;
              }
          }

          // Force close if locked, otherwise obey state
          const isOpen = !isLocked && openModuleId === module.id;

          return (
            <div 
                key={module.id} 
                className={`rounded-xl transition-all duration-300 overflow-hidden border ${
                    isOpen 
                    ? 'bg-white dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 shadow-sm' 
                    : 'bg-transparent border-transparent hover:bg-gray-100 dark:hover:bg-white/5'
                } ${isLocked ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
            >
              <button
                onClick={() => !isLocked && toggleModule(module.id)}
                disabled={isLocked}
                className={`w-full flex justify-between items-center text-left p-4 outline-none focus:outline-none ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                title={isLocked ? "Complete previous module's final project to unlock" : ""}
              >
                <div>
                    <div className={`font-semibold text-sm mb-1 transition-colors ${isOpen ? 'text-cyan-600 dark:text-cyan-400' : 'text-gray-700 dark:text-gray-200'}`}>
                        {module.title}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center gap-2">
                        {isModuleComplete ? (
                            <span className="text-green-500 flex items-center gap-1">
                                <ModuleCompleteIcon className="w-4 h-4" />
                                Completed
                            </span>
                        ) : isLocked ? (
                            <span className="text-gray-400 flex items-center gap-1">
                                Locked
                            </span>
                        ) : (
                            <span>{completedInModule} / {totalInModule} Lessons</span>
                        )}
                    </div>
                </div>
                {isLocked ? (
                    <LockIcon className="w-4 h-4 text-gray-400" />
                ) : (
                    <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                )}
              </button>
              
              <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <ul className="px-3 pb-3 space-y-1">
                  {module.lessons.map((lesson, index) => {
                    const isCompleted = completedLessons.has(lesson.id);
                    const isCurrent = currentLessonId === lesson.id;
                    
                    return (
                        <li key={lesson.id}>
                        <button
                            id={`nav-lesson-${lesson.id}`}
                            onClick={() => onSelectLesson(module.id, lesson.id)}
                            className={`w-full flex items-center gap-3 text-left py-2.5 px-3 rounded-lg transition-all text-sm group ${
                            isCurrent
                                ? 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-200'
                            }`}
                        >
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors flex-shrink-0 ${
                                isCompleted 
                                    ? 'bg-green-500 border-green-500 text-white' 
                                    : isCurrent
                                        ? 'border-cyan-500 text-cyan-500'
                                        : 'border-gray-300 dark:border-gray-600 text-transparent group-hover:border-gray-400 dark:group-hover:border-gray-500'
                            }`}>
                                {isCompleted ? (
                                    <CheckIcon className="w-3 h-3" strokeWidth={3} />
                                ) : (
                                    <span className="text-[10px] font-medium leading-none">{index + 1}</span>
                                )}
                            </div>
                            <span className={`truncate font-medium ${isCurrent ? 'text-cyan-700 dark:text-cyan-300' : ''}`}>{lesson.title}</span>
                        </button>
                        </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )
        })}
      </div>
    </nav>
  );
};

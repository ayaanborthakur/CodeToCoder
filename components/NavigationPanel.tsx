
import React, { useState } from 'react';
import type { Module } from '../types';

interface NavigationPanelProps {
  modules: Module[];
  currentLessonId: string;
  onSelectLesson: (moduleId: string, lessonId: string) => void;
  completedLessons: Set<string>;
}

import ChevronDownIcon from '../assets/icons/ChevronDownIcon.svg?react';
import CheckIcon from '../assets/icons/CheckIcon.svg?react';
import LockIcon from '../assets/icons/LockIcon.svg?react';
import FlagIcon from '../assets/icons/FlagIcon.svg?react';
import ModuleCompleteIcon from '../assets/icons/ModuleCompleteIcon.svg?react';


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
            if (prevModule.lessons.length > 0) {
              const prevFinalLesson = prevModule.lessons[prevModule.lessons.length - 1];
              if (!completedLessons.has(prevFinalLesson.id)) {
                isLocked = true;
              }
            }
          }

          // Force close if locked, otherwise obey state
          const isOpen = !isLocked && openModuleId === module.id;

          return (
            <div
              key={module.id}
              className={`rounded-xl transition-all duration-300 overflow-hidden border ${isOpen
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
                        <LockIcon className="w-3 h-3" />
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

              <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <ul className="px-3 pb-3 space-y-1">
                  {module.lessons.map((lesson, lessonIndex) => {
                    const isCompleted = completedLessons.has(lesson.id);
                    const isCurrent = currentLessonId === lesson.id;
                    const isFinalLesson = lessonIndex === module.lessons.length - 1;

                    return (
                      <li key={lesson.id}>
                        <button
                          id={`nav-lesson-${lesson.id}`}
                          onClick={() => onSelectLesson(module.id, lesson.id)}
                          className={`w-full flex items-center gap-3 text-left py-2.5 px-3 rounded-lg transition-all text-sm group ${isCurrent
                            ? 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-200'
                            }`}
                        >
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors flex-shrink-0 ${isCompleted
                            ? 'bg-green-500 border-green-500 text-white'
                            : isCurrent
                              ? 'border-cyan-500 text-cyan-500'
                              : isFinalLesson
                                ? 'border-purple-400 text-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                : 'border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 group-hover:border-gray-400 dark:group-hover:border-gray-500'
                            }`}>
                            {isCompleted ? (
                              <CheckIcon className="w-3 h-3" strokeWidth={3} />
                            ) : isFinalLesson ? (
                              <FlagIcon className="w-3 h-3" />
                            ) : (
                              <span className="text-[10px] font-medium leading-none">{lessonIndex + 1}</span>
                            )}
                          </div>
                          <span className={`truncate font-medium ${isCurrent ? 'text-cyan-700 dark:text-cyan-300' : ''} ${isFinalLesson && !isCompleted ? 'text-purple-600 dark:text-purple-400' : ''}`}>
                            {lesson.title}
                          </span>
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

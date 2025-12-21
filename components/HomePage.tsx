
import React from 'react';
import { Helmet } from 'react-helmet-async';
import type { Module } from '../types';


interface HomePageProps {
  modules: Module[]; // Dynamic data
  onNavigate: (view: 'home' | 'classroom' | 'playground' | 'practice' | 'mission' | 'about') => void;
  onSelectLesson: (moduleId: string, lessonId: string) => void;
  completedLessons: Set<string>;
  playgroundFiles: any[];
  mostRecentPlaygroundFile: any;
  onPlaygroundResume: (fileId: string) => void;
  practiceCategories?: any;
}

import BookIcon from '../assets/icons/BookIcon.svg?react';
import CodeIcon from '../assets/icons/CodeIcon.svg?react';
import QuizIcon from '../assets/icons/QuizIcon.svg?react';
import StarIcon from '../assets/icons/StarIcon.svg?react';
import ArrowRightIcon from '../assets/icons/ArrowRightIcon.svg?react';
import BoltIcon from '../assets/icons/BoltIcon.svg?react';
import TrophyIcon from '../assets/icons/TrophyIcon.svg?react';

// Inline icon for fire/streak
const FireIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
  </svg>
);

export const HomePage: React.FC<HomePageProps> = ({
  modules, // Destructure prop
  onNavigate,
  onSelectLesson,
  completedLessons,
  playgroundFiles,
  mostRecentPlaygroundFile,
  onPlaygroundResume,
}) => {

  // Find the most recent lesson worked on
  const getMostRecentLesson = () => {
    if (modules.length === 0) return null; // Handle empty loading state

    for (const module of modules) {
      for (const lesson of module.lessons) {
        if (completedLessons.has(lesson.id)) {
          // Find the next incomplete lesson in the current module
          const currentIndex = module.lessons.findIndex(l => l.id === lesson.id);
          if (currentIndex < module.lessons.length - 1) {
            return {
              module,
              lesson: module.lessons[currentIndex + 1],
              status: 'next' as const
            };
          }
        }
      }
    }

    // If no completed lessons, return first lesson
    return {
      module: modules[0],
      lesson: modules[0].lessons[0],
      status: 'start' as const
    };
  };

  const recentLesson = getMostRecentLesson();
  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const completionPercentage = Math.round((completedLessons.size / totalLessons) * 100);

  return (
    <div className="h-full w-full bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 overflow-y-auto">
      <Helmet>
        <title>Dashboard</title>
      </Helmet>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 min-h-full flex flex-col">
        {/* Quick Actions Bar */}
        <div className="flex flex-wrap items-center gap-2 mb-6 pb-4 border-b-2 border-gray-200 dark:border-gray-800">
          <button
            onClick={() => onNavigate('classroom')}
            className="flex items-center gap-2 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-semibold"
          >
            <BookIcon className="w-4 h-4" />
            Open Classroom
          </button>
          <button
            onClick={() => onNavigate('playground')}
            className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-semibold"
          >
            <CodeIcon className="w-4 h-4" />
            New File
          </button>
          <button
            onClick={() => onNavigate('practice')}
            className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-semibold"
          >
            <QuizIcon className="w-4 h-4" />
            Take Quiz
          </button>
          <div className="flex-1" />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Last active: Today
          </span>
        </div>

        {/* Main 2-Column Layout */}
        <div className="grid lg:grid-cols-[1fr_320px] gap-6 flex-1">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Welcome Header */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border-2 border-gray-200 dark:border-gray-700 shadow-strong">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    Welcome Back! 👋
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Pick up where you left off or explore something new
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg border border-yellow-300 dark:border-yellow-700">
                  <StarIcon className="w-4 h-4 text-yellow-500" />
                  <span className="font-bold text-sm text-gray-800 dark:text-gray-200">{completedLessons.size} Stars</span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Course Progress</span>
                <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400">{completionPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-lg h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {completedLessons.size} of {totalLessons} lessons completed
              </p>
            </div>

            {/* Continue Learning Cards */}
            {(recentLesson || mostRecentPlaygroundFile) && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Continue Learning</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Recent Lesson */}
                  {recentLesson && (
                    <button
                      onClick={() => {
                        onNavigate('classroom');
                        onSelectLesson(recentLesson.module.id, recentLesson.lesson.id);
                      }}
                      className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg p-4 shadow-lg hover:shadow-xl transition-all text-left group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                          <BookIcon className="w-5 h-5 text-white" />
                        </div>
                        <ArrowRightIcon className="w-5 h-5 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all" />
                      </div>
                      <h3 className="text-base font-bold text-white mb-1">
                        {recentLesson.status === 'start' ? 'Start Learning' : 'Continue Lesson'}
                      </h3>
                      <p className="text-white/90 text-sm font-medium truncate">{recentLesson.lesson.title}</p>
                      <p className="text-white/70 text-xs truncate">{recentLesson.module.title}</p>
                    </button>
                  )}

                  {/* Recent Playground File */}
                  {mostRecentPlaygroundFile && (
                    <button
                      onClick={() => {
                        onNavigate('playground');
                        onPlaygroundResume(mostRecentPlaygroundFile.id);
                      }}
                      className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg p-4 shadow-lg hover:shadow-xl transition-all text-left group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                          <CodeIcon className="w-5 h-5 text-white" />
                        </div>
                        <ArrowRightIcon className="w-5 h-5 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all" />
                      </div>
                      <h3 className="text-base font-bold text-white mb-1">Continue Coding</h3>
                      <p className="text-white/90 text-sm font-medium truncate">{mostRecentPlaygroundFile.name}</p>
                      <p className="text-white/70 text-xs">
                        Edited: {new Date(mostRecentPlaygroundFile.lastModified).toLocaleDateString()}
                      </p>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Explore Cards - 4 column grid */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Explore</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Classroom Card */}
                <button
                  onClick={() => onNavigate('classroom')}
                  className="neon-glow-cyan bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-gray-200 dark:border-gray-700 transition-all text-left group"
                >
                  <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <BookIcon className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Classroom</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-xs mb-2 line-clamp-2">
                    AI-guided lessons
                  </p>
                  <div className="flex items-center text-xs font-bold text-cyan-600 dark:text-cyan-400">
                    Go <ArrowRightIcon className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                {/* Playground Card */}
                <button
                  onClick={() => onNavigate('playground')}
                  className="neon-glow-purple bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-gray-200 dark:border-gray-700 transition-all text-left group"
                >
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <CodeIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Playground</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-xs mb-2 line-clamp-2">
                    Free coding space
                  </p>
                  <div className="flex items-center text-xs font-bold text-purple-600 dark:text-purple-400">
                    Go <ArrowRightIcon className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                {/* Practice Card */}
                <button
                  onClick={() => onNavigate('practice')}
                  className="neon-glow-green bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-gray-200 dark:border-gray-700 transition-all text-left group"
                >
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <QuizIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Practice</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-xs mb-2 line-clamp-2">
                    Quizzes & projects
                  </p>
                  <div className="flex items-center text-xs font-bold text-green-600 dark:text-green-400">
                    Go <ArrowRightIcon className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                {/* Mission Card */}
                <button
                  onClick={() => onNavigate('mission')}
                  className="neon-glow-orange bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-gray-200 dark:border-gray-700 transition-all text-left group"
                >
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <TrophyIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">About</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-xs mb-2 line-clamp-2">
                    Our mission
                  </p>
                  <div className="flex items-center text-xs font-bold text-orange-600 dark:text-orange-400">
                    Go <ArrowRightIcon className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Stats Cards */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Your Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                    <BookIcon className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{completedLessons.size}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Lessons Done</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <CodeIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{playgroundFiles.length}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Files Created</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <FireIcon />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">1</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Day Streak</div>
                  </div>
                </div>
              </div>
            </div>

            {/* What's New */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">What's New</h3>
              <div className="space-y-2">
                <div className="p-2 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg border border-cyan-200 dark:border-cyan-800">
                  <div className="flex items-center gap-2 mb-1">
                    <BoltIcon className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                    <span className="text-xs font-bold text-cyan-700 dark:text-cyan-300">New Feature</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">AI-powered code hints now available!</p>
                </div>
                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-1">
                    <QuizIcon className="w-3 h-3 text-green-600 dark:text-green-400" />
                    <span className="text-xs font-bold text-green-700 dark:text-green-300">New Content</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">5 new practice quizzes added</p>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-lg p-4 border-2 border-cyan-200 dark:border-cyan-800">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">💡 Quick Tips</h3>
              <ul className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
                {completedLessons.size === 0 && (
                  <li className="flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-cyan-500 mt-1.5 flex-shrink-0" />
                    <span><strong>New?</strong> Start in the Classroom</span>
                  </li>
                )}
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                  <span><strong>Practice</strong> with quizzes to test knowledge</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                  <span><strong>Experiment</strong> freely in the Playground</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


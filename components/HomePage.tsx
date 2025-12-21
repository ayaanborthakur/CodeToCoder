
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
    <div className="min-h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-800 dark:text-gray-200 overflow-y-auto">
      <Helmet>
        <title>Dashboard</title>
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-3">
            Welcome Back! 👋
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Pick up where you left off or explore something new
          </p>
        </div>

        {/* Progress Overview */}
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Progress</h2>
            <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
              <StarIcon className="w-5 h-5 text-yellow-500" />
              <span className="font-bold text-gray-900 dark:text-white">{completedLessons.size} Stars</span>
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            {completedLessons.size} of {totalLessons} lessons completed ({completionPercentage}%)
          </p>
        </div>

        {/* Continue Where You Left Off */}
        {(recentLesson || mostRecentPlaygroundFile) && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Continue Learning</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Recent Lesson */}
              {recentLesson && (
                <button
                  onClick={() => {
                    onNavigate('classroom');
                    onSelectLesson(recentLesson.module.id, recentLesson.lesson.id);
                  }}
                  className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-6 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all text-left group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-white/20 rounded-xl">
                      <BookIcon className="w-8 h-8 text-white" />
                    </div>
                    <ArrowRightIcon className="w-6 h-6 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {recentLesson.status === 'start' ? 'Start Learning' : 'Continue Lesson'}
                  </h3>
                  <p className="text-white/90 font-medium mb-1">{recentLesson.lesson.title}</p>
                  <p className="text-white/70 text-sm">{recentLesson.module.title}</p>
                </button>
              )}

              {/* Recent Playground File */}
              {mostRecentPlaygroundFile && (
                <button
                  onClick={() => {
                    onNavigate('playground');
                    onPlaygroundResume(mostRecentPlaygroundFile.id);
                  }}
                  className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all text-left group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-white/20 rounded-xl">
                      <CodeIcon className="w-8 h-8 text-white" />
                    </div>
                    <ArrowRightIcon className="w-6 h-6 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Continue Coding</h3>
                  <p className="text-white/90 font-medium mb-1">{mostRecentPlaygroundFile.name}</p>
                  <p className="text-white/70 text-sm">
                    Last edited: {new Date(mostRecentPlaygroundFile.lastModified).toLocaleDateString()}
                  </p>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Quick Access Cards */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Explore</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Classroom Card */}
            <button
              onClick={() => onNavigate('classroom')}
              className="neon-glow-cyan bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border-2 border-gray-200 dark:border-gray-700 transform hover:-translate-y-1 transition-all text-left group"
            >
              <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BookIcon className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Classroom</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                Structured lessons with AI guidance and instant feedback
              </p>
              <div className="flex items-center font-bold text-sm">
                <span
                  className="text-cyan-600 dark:text-cyan-400"
                  style={{
                    background: 'linear-gradient(to right, #0891b2, #2563eb)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    display: 'inline-block',
                    backgroundImage: 'linear-gradient(to right, #0891b2, #2563eb)',
                  }}
                >Start Learning</span>
                <ArrowRightIcon className="w-4 h-4 ml-2 text-cyan-600 dark:text-cyan-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* Playground Card */}
            <button
              onClick={() => onNavigate('playground')}
              className="neon-glow-purple bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border-2 border-gray-200 dark:border-gray-700 transform hover:-translate-y-1 transition-all text-left group"
            >
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <CodeIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Playground</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                Experiment freely with Python and test your own ideas
              </p>
              <div className="flex items-center font-bold text-sm">
                <span
                  className="text-purple-600 dark:text-purple-400"
                  style={{
                    background: 'linear-gradient(to right, #9333ea, #db2777)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    display: 'inline-block',
                    backgroundImage: 'linear-gradient(to right, #9333ea, #db2777)',
                  }}
                >Start Coding</span>
                <ArrowRightIcon className="w-4 h-4 ml-2 text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* Practice Card */}
            <button
              onClick={() => onNavigate('practice')}
              className="neon-glow-green bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border-2 border-gray-200 dark:border-gray-700 transform hover:-translate-y-1 transition-all text-left group"
            >
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <QuizIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Practice</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                Challenge yourself with quizzes and coding projects
              </p>
              <div className="flex items-center font-bold text-sm">
                <span
                  className="text-green-600 dark:text-green-400"
                  style={{
                    background: 'linear-gradient(to right, #16a34a, #059669)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    display: 'inline-block',
                    backgroundImage: 'linear-gradient(to right, #16a34a, #059669)',
                  }}
                >Start Practicing</span>
                <ArrowRightIcon className="w-4 h-4 ml-2 text-green-600 dark:text-green-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>
        </div>

        {/* Suggestions */}
        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-2xl p-8 border border-cyan-200 dark:border-cyan-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            💡 What to Try Next
          </h2>
          <div className="space-y-3">
            {completedLessons.size === 0 && (
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-2" />
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>New to coding?</strong> Start with our beginner-friendly lessons in the Classroom
                </p>
              </div>
            )}
            {completedLessons.size > 0 && completedLessons.size < 5 && (
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-2" />
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Great start!</strong> Keep the momentum going with the next lesson
                </p>
              </div>
            )}
            {playgroundFiles.length === 0 && (
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2" />
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Try the Playground</strong> to experiment with code and build your own projects
                </p>
              </div>
            )}
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2" />
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Test your knowledge</strong> with practice quizzes and coding challenges
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2" />
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Learn more</strong> about our{' '}
                <button
                  onClick={() => onNavigate('mission')}
                  className="text-cyan-600 dark:text-cyan-400 font-semibold hover:underline"
                >
                  mission to make coding accessible
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Helmet } from 'react-helmet-async';
import type { Module, PlaygroundFile, DailyChallenge } from '../types';
import { DailyChallengesWidget } from './DailyChallengesWidget';

import {
  BookOpen,
  Terminal,
  Star,
  ArrowRight,
  Trophy,
  Flame,
} from 'lucide-react';

import { AnalyticsDashboard } from './AnalyticsDashboard';
import { AIChatPage } from './AIChatPage';
import { ReviewTab } from './ReviewTab';
import { AssignmentsCard } from './AssignmentsCard';
import { useAuth } from '../contexts/AuthContext';
import { getDueReviews } from '../services/learningService';
import { formatCompactNumber } from '../utils/formatters';

interface HomePageProps {
  modules: Module[];
  onNavigate: (view: 'home' | 'classroom' | 'playground' | 'practice' | 'mission' | 'about' | 'profile' | 'marketplace' | 'leaderboard' | 'reference') => void;
  onSelectLesson: (moduleId: string, lessonId: string) => void;
  completedLessons: Set<string>;
  playgroundFiles: PlaygroundFile[];
  mostRecentPlaygroundFile: PlaygroundFile | null;
  onPlaygroundResume: (fileId: string) => void;
  practiceCategories?: any;
  netWorth?: number;
  starBalance?: number;
  currentStreak?: number;
  dailyChallenges?: DailyChallenge[];
  onClaimChallengeReward?: (challengeId: string) => void;
}

type HomeTab = 'overview' | 'analytics' | 'mentor' | 'review';

export const HomePage: React.FC<HomePageProps> = ({
  modules,
  onNavigate,
  onSelectLesson,
  completedLessons,
  playgroundFiles,
  mostRecentPlaygroundFile,
  onPlaygroundResume,
  netWorth,
  starBalance,
  currentStreak = 0,
  dailyChallenges = [],
  onClaimChallengeReward,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = React.useState<HomeTab>('overview');
  const [dueReviewsCount, setDueReviewsCount] = React.useState<number>(0);

  React.useEffect(() => {
    const loadReviewCount = async () => {
      if (!user) return;
      try {
        const reviews = await getDueReviews(user.id);
        setDueReviewsCount(reviews.length);
      } catch (error) {
        console.error('Failed to fetch review count:', error);
      }
    };
    loadReviewCount();
  }, [user]);

  // Find the next lesson the user should pick up.
  const getMostRecentLesson = () => {
    if (modules.length === 0) return null;
    for (const module of modules) {
      for (const lesson of module.lessons) {
        if (completedLessons.has(lesson.id)) {
          const currentIndex = module.lessons.findIndex(l => l.id === lesson.id);
          if (currentIndex < module.lessons.length - 1) {
            return { module, lesson: module.lessons[currentIndex + 1], status: 'next' as const };
          }
        }
      }
    }
    if (modules.length > 0 && modules[0].lessons.length > 0) {
      return { module: modules[0], lesson: modules[0].lessons[0], status: 'start' as const };
    }
    return null;
  };

  const recentLesson = getMostRecentLesson();
  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const completionPercentage = totalLessons > 0 ? Math.round((completedLessons.size / totalLessons) * 100) : 0;
  const firstName = user?.name?.split(' ')[0] ?? 'there';

  const TabButton: React.FC<{ tab: HomeTab; label: string; badge?: number }> = ({ tab, label, badge }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`relative pb-3 px-1 text-sm font-semibold transition-colors ${
        activeTab === tab
          ? 'text-cyan-600 dark:text-cyan-400'
          : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
      }`}
    >
      {label}
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-1 -right-4 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-gray-900">
          {badge}
        </span>
      )}
      {activeTab === tab && (
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-500 rounded-t-full" />
      )}
    </button>
  );

  const Stat: React.FC<{ value: string | number; label: string; icon: React.ReactNode; accent: string }> = ({ value, label, icon, accent }) => (
    <div className="flex items-center gap-2.5">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${accent}`}>{icon}</div>
      <div>
        <div className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{value}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
      </div>
    </div>
  );

  return (
    <div className="h-full w-full bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 overflow-y-auto">
      <Helmet>
        <title>Dashboard</title>
      </Helmet>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 min-h-full flex flex-col">
        {/* Greeting + status pills */}
        <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Hey {firstName} 👋
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
              {recentLesson?.status === 'start' ? "Let's start your first lesson." : 'Pick up where you left off.'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {starBalance !== undefined && (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-400/30">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="font-bold text-sm text-gray-800 dark:text-gray-200">{formatCompactNumber(starBalance)}</span>
              </div>
            )}
            {currentStreak > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-400/30">
                <Flame className={`w-4 h-4 text-orange-500 ${currentStreak >= 7 ? 'animate-pulse' : ''}`} />
                <span className="font-bold text-sm text-gray-800 dark:text-gray-200">{currentStreak}d</span>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 mb-6 border-b border-gray-200 dark:border-gray-800">
          <TabButton tab="overview" label="Overview" />
          <TabButton tab="analytics" label="Analytics" />
          <TabButton tab="mentor" label="Mentor" />
          <TabButton tab="review" label="Review" badge={dueReviewsCount} />
        </div>

        {activeTab === 'overview' ? (
          <div className="space-y-6 flex-1">
            {/* Assignments — only renders when student has a class and has assignments */}
            {user?.classId && (
              <AssignmentsCard studentId={user.id} classroomId={user.classId} />
            )}

            {/* Continue Learning — the primary action */}
            {(recentLesson || mostRecentPlaygroundFile) && (
              <div className="grid sm:grid-cols-2 gap-4">
                {recentLesson && (
                  <button
                    onClick={() => {
                      onNavigate('classroom');
                      onSelectLesson(recentLesson.module.id, recentLesson.lesson.id);
                    }}
                    className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl p-5 shadow-md hover:shadow-lg transition-all text-left group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                      <ArrowRight className="w-5 h-5 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </div>
                    <div className="text-xs font-semibold text-white/80 uppercase tracking-wide">
                      {recentLesson.status === 'start' ? 'Start Learning' : 'Continue Lesson'}
                    </div>
                    <div className="text-base font-bold text-white mt-1 truncate">{recentLesson.lesson.title}</div>
                    <div className="text-white/70 text-xs truncate mt-0.5">{recentLesson.module.title}</div>
                  </button>
                )}

                {mostRecentPlaygroundFile && (
                  <button
                    onClick={() => {
                      onNavigate('playground');
                      onPlaygroundResume(mostRecentPlaygroundFile.id);
                    }}
                    className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-5 shadow-md hover:shadow-lg transition-all text-left group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <Terminal className="w-5 h-5 text-white" />
                      </div>
                      <ArrowRight className="w-5 h-5 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </div>
                    <div className="text-xs font-semibold text-white/80 uppercase tracking-wide">Continue Coding</div>
                    <div className="text-base font-bold text-white mt-1 truncate">{mostRecentPlaygroundFile.name}</div>
                    <div className="text-white/70 text-xs mt-0.5">
                      Edited {new Date(mostRecentPlaygroundFile.lastModified).toLocaleDateString()}
                    </div>
                  </button>
                )}
              </div>
            )}

            {/* Progress + stats — one compact card instead of four */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Course Progress</span>
                <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400">{completionPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-lg h-2.5 overflow-hidden mb-1">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                {completedLessons.size} of {totalLessons} lessons completed
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <Stat
                  value={completedLessons.size}
                  label="Lessons"
                  icon={<BookOpen className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />}
                  accent="bg-cyan-100 dark:bg-cyan-900/30"
                />
                <Stat
                  value={playgroundFiles.length}
                  label="Files"
                  icon={<Terminal className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                  accent="bg-purple-100 dark:bg-purple-900/30"
                />
                <Stat
                  value={formatCompactNumber(netWorth)}
                  label="Net Worth"
                  icon={<Trophy className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
                  accent="bg-amber-100 dark:bg-amber-900/30"
                />
                <Stat
                  value={currentStreak}
                  label="Day Streak"
                  icon={<Flame className={`w-4 h-4 ${currentStreak >= 7 ? 'text-orange-600' : 'text-orange-500'}`} />}
                  accent={currentStreak >= 7 ? 'bg-orange-200 dark:bg-orange-800/50' : 'bg-orange-100 dark:bg-orange-900/30'}
                />
              </div>
            </div>

            {/* Today's challenges */}
            {dailyChallenges.length > 0 && (
              <DailyChallengesWidget
                challenges={dailyChallenges}
                onClaimReward={onClaimChallengeReward || (() => {})}
              />
            )}
          </div>
        ) : activeTab === 'analytics' ? (
          <AnalyticsDashboard />
        ) : activeTab === 'review' ? (
          <ReviewTab onSelectLesson={onSelectLesson} />
        ) : (
          <AIChatPage />
        )}
      </div>
    </div>
  );
};

import React, { useMemo } from 'react';
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
  Lock,
  CheckCircle2,
} from 'lucide-react';

import { AnalyticsDashboard } from './AnalyticsDashboard';
import { ReviewTab } from './ReviewTab';
import { AssignmentsCard } from './AssignmentsCard';
import { useAuth } from '../contexts/AuthContext';
import { getDueReviews } from '../services/learningService';
import { formatCompactNumber } from '../utils/formatters';
import { COURSES, getCourseProgress, isCourseUnlocked } from '../data/coursesData';

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

type HomeTab = 'overview' | 'analytics' | 'review';

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
  const recentLesson = useMemo(() => {
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
  }, [modules, completedLessons]);

  // Per-course progress for the catalog mini-grid.
  const courseProgressRows = useMemo(() => {
    const ids = modules.map(m => m.id);
    const byId = new Map(modules.map(m => [m.id, m] as const));
    return COURSES.map(c => {
      const prog = getCourseProgress(c.id, ids, byId, completedLessons);
      const unlocked = isCourseUnlocked(c, ids, byId, completedLessons, user?.unlockedCourseIds ?? null);
      return { course: c, progress: prog, unlocked };
    });
  }, [modules, completedLessons, user?.unlockedCourseIds]);

  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const completionPercentage = totalLessons > 0 ? Math.round((completedLessons.size / totalLessons) * 100) : 0;
  const firstName = user?.name?.split(' ')[0] ?? 'there';

  // ─────────────────────────────────────────────────────────────────────────
  // Small component helpers
  // ─────────────────────────────────────────────────────────────────────────

  const TabButton: React.FC<{ tab: HomeTab; label: string; badge?: number }> = ({ tab, label, badge }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
        activeTab === tab
          ? 'text-gray-900 dark:text-white'
          : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
      }`}
    >
      {label}
      {badge !== undefined && badge > 0 && (
        <span className={`ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-semibold ${
          activeTab === tab ? 'bg-cyan-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
        }`}>{badge}</span>
      )}
      {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500" />}
    </button>
  );

  const TopStat: React.FC<{ label: string; value: React.ReactNode; accent?: string }> = ({ label, value, accent }) => (
    <div className="flex flex-col min-w-0">
      <div className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-[0.08em]">{label}</div>
      <div className={`text-xl font-semibold tabular-nums ${accent ?? 'text-gray-900 dark:text-white'}`}>{value}</div>
    </div>
  );

  const SectionLabel: React.FC<{ children: React.ReactNode; right?: React.ReactNode }> = ({ children, right }) => (
    <div className="flex items-center justify-between mb-2 px-1">
      <div className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-[0.08em]">{children}</div>
      {right}
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="h-full w-full bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 overflow-y-auto">
      <Helmet>
        <title>Dashboard</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 min-h-full flex flex-col">

        {/* ─── Top header: greeting + always-visible stats strip ─────────── */}
        <div className="flex items-end justify-between gap-6 flex-wrap mb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white">
              Hey {firstName}.
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {recentLesson?.status === 'start' ? "Let's start your first lesson." : 'Pick up where you left off.'}
            </p>
          </div>
          <div className="flex items-center gap-6">
            <TopStat label="Lessons" value={completedLessons.size} />
            <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
            <TopStat label="Files" value={playgroundFiles.length} />
            <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
            <TopStat
              label="Stars"
              value={
                <span className="inline-flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                  {starBalance !== undefined ? formatCompactNumber(starBalance) : '—'}
                </span>
              }
            />
            <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
            <TopStat
              label="Streak"
              value={
                <span className="inline-flex items-center gap-1">
                  <Flame className={`w-3.5 h-3.5 ${currentStreak >= 7 ? 'text-orange-600' : 'text-orange-500'}`} />
                  {currentStreak}d
                </span>
              }
            />
            <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
            <TopStat
              label="Net Worth"
              value={
                <span className="inline-flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  {formatCompactNumber(netWorth)}
                </span>
              }
            />
          </div>
        </div>

        {/* ─── Tabs ─────────────────────────────────────────────────────── */}
        <div className="flex gap-0 mb-5 border-b border-gray-200 dark:border-gray-800">
          <TabButton tab="overview" label="Overview" />
          <TabButton tab="analytics" label="Analytics" />
          <TabButton tab="review" label="Review" badge={dueReviewsCount} />
        </div>

        {/* ─── Overview: multi-column dashboard ─────────────────────────── */}
        {activeTab === 'overview' ? (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 flex-1">

            {/* LEFT COLUMN: Continue, Course Catalog, Progress strip */}
            <div className="space-y-6 min-w-0">

              {/* Continue cards */}
              {(recentLesson || mostRecentPlaygroundFile) && (
                <section>
                  <SectionLabel right={
                    <span className="text-xs text-gray-500 dark:text-gray-400">{completionPercentage}% of course</span>
                  }>Continue</SectionLabel>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {recentLesson && (
                      <button
                        onClick={() => {
                          onNavigate('classroom');
                          onSelectLesson(recentLesson.module.id, recentLesson.lesson.id);
                        }}
                        className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl p-5 shadow-sm hover:shadow-md transition-all text-left group"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <BookOpen className="w-4 h-4 text-white/85" />
                          <ArrowRight className="w-4 h-4 text-white/70 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                        </div>
                        <div className="text-[10px] font-semibold text-white/80 uppercase tracking-[0.08em]">
                          {recentLesson.status === 'start' ? 'Start learning' : 'Continue lesson'}
                        </div>
                        <div className="text-base font-semibold text-white mt-1 truncate">{recentLesson.lesson.title}</div>
                        <div className="text-white/75 text-xs truncate mt-0.5">{recentLesson.module.title}</div>
                      </button>
                    )}
                    {mostRecentPlaygroundFile && (
                      <button
                        onClick={() => {
                          onNavigate('playground');
                          onPlaygroundResume(mostRecentPlaygroundFile.id);
                        }}
                        className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-5 shadow-sm hover:shadow-md transition-all text-left group"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <Terminal className="w-4 h-4 text-white/85" />
                          <ArrowRight className="w-4 h-4 text-white/70 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                        </div>
                        <div className="text-[10px] font-semibold text-white/80 uppercase tracking-[0.08em]">Continue coding</div>
                        <div className="text-base font-semibold text-white mt-1 truncate">{mostRecentPlaygroundFile.name}</div>
                        <div className="text-white/75 text-xs mt-0.5">Edited {new Date(mostRecentPlaygroundFile.lastModified).toLocaleDateString()}</div>
                      </button>
                    )}
                  </div>
                </section>
              )}

              {/* Course catalog mini-grid: see progression at a glance */}
              <section>
                <SectionLabel right={
                  <button
                    onClick={() => onNavigate('classroom')}
                    className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
                  >
                    All courses →
                  </button>
                }>Course progression</SectionLabel>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden divide-y divide-gray-100 dark:divide-gray-700">
                  {courseProgressRows.map(({ course, progress, unlocked }) => {
                    const pct = progress.total > 0 ? Math.round(progress.fraction * 100) : 0;
                    const complete = progress.total > 0 && progress.completed === progress.total;
                    const interactive = unlocked && !course.comingSoon;
                    return (
                      <button
                        key={course.id}
                        onClick={() => interactive && onNavigate('classroom')}
                        disabled={!interactive}
                        className={`w-full grid grid-cols-[1fr_auto] items-center gap-4 px-5 py-3 text-left transition-colors ${
                          interactive ? 'hover:bg-gray-50 dark:hover:bg-gray-700/40' : 'opacity-60 cursor-not-allowed'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">{course.title}</span>
                            {complete && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-1.5 py-0.5 rounded">
                                <CheckCircle2 className="w-2.5 h-2.5" /> Done
                              </span>
                            )}
                            {!unlocked && !course.comingSoon && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-500 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                                <Lock className="w-2.5 h-2.5" /> Locked
                              </span>
                            )}
                            {course.comingSoon && (
                              <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded">
                                Coming Soon
                              </span>
                            )}
                          </div>
                          {course.comingSoon ? (
                            <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full" />
                          ) : (
                            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full bg-gradient-to-r ${course.accentColor} transition-all duration-500`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 tabular-nums whitespace-nowrap">
                          {course.comingSoon ? '—' : `${progress.completed} / ${progress.total}`}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

            </div>

            {/* RIGHT RAIL: Assignments + Daily Challenges + Quick actions */}
            <aside className="space-y-6 min-w-0">

              {user?.classId && (
                <section>
                  <SectionLabel>Assignments</SectionLabel>
                  <AssignmentsCard studentId={user.id} classroomId={user.classId} />
                </section>
              )}

              {dailyChallenges.length > 0 && (
                <section>
                  <SectionLabel>Today's challenges</SectionLabel>
                  <DailyChallengesWidget
                    challenges={dailyChallenges}
                    onClaimReward={onClaimChallengeReward || (() => {})}
                  />
                </section>
              )}

              {/* Mini links — secondary surfaces tucked into the right rail. */}
              <section>
                <SectionLabel>Jump to</SectionLabel>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden divide-y divide-gray-100 dark:divide-gray-700">
                  {([
                    { view: 'practice' as const, label: 'Practice', meta: 'Quizzes, problems, projects' },
                    { view: 'playground' as const, label: 'Playground', meta: `${playgroundFiles.length} ${playgroundFiles.length === 1 ? 'file' : 'files'}` },
                    { view: 'reference' as const, label: 'Reference', meta: 'Python syntax + tips' },
                    { view: 'marketplace' as const, label: 'Star Market', meta: starBalance !== undefined ? `${formatCompactNumber(starBalance)} stars` : 'Spend your stars' },
                    { view: 'leaderboard' as const, label: 'Leaderboard', meta: 'See how you rank' },
                  ]).map(item => (
                    <button
                      key={item.view}
                      onClick={() => onNavigate(item.view)}
                      className="w-full flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/40 text-left transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.meta}</div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </section>

            </aside>
          </div>
        ) : activeTab === 'analytics' ? (
          <AnalyticsDashboard />
        ) : (
          <ReviewTab onSelectLesson={onSelectLesson} />
        )}
      </div>
    </div>
  );
};

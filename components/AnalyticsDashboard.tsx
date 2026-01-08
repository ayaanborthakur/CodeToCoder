import React, { useEffect, useState } from 'react';
import { 
    XAxis, YAxis, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, AreaChart, Area, CartesianGrid,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { Clock, BookOpen, Target, Calendar, Award, Activity, RefreshCw, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getDailyActivityStats, getCategoryStats, getRecentActivity, getProductivityByHour, getAccuracyStats, getSkillRadarData, getActivityHeatmap } from '../services/analyticsDataService';
import { getDueReviews } from '../services/learningService';
import { ReviewHistory } from './ReviewHistory';
import { onSnapshot } from 'firebase/firestore';
import { userPaths } from '../services/firestorePathHelper';
import type { DailyActivitySummary, UserActivity, ReviewItem } from '../types';

const COLORS = ['#06b6d4', '#8b5cf6', '#f59e0b', '#10b981'];

type TimeRange = '7d' | '14d' | '30d' | '90d' | 'all';

// Custom theme-aware tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 z-50">
                {label && <p className="font-bold text-gray-900 dark:text-white mb-2 text-sm">{label}</p>}
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-sm py-0.5">
                        <div 
                            className="w-2.5 h-2.5 rounded-full" 
                            style={{ backgroundColor: entry.color || entry.payload.fill || '#06b6d4' }} 
                        />
                        <span className="text-gray-600 dark:text-gray-300 font-medium">
                            {entry.name}:
                        </span>
                        <span className="font-bold text-gray-900 dark:text-white">
                            {typeof entry.value === 'number' 
                                ? (entry.name === 'Time' || entry.unit === '%') ? `${entry.value}%` : entry.value
                                : entry.value}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export const AnalyticsDashboard: React.FC = () => {
    const { user } = useAuth();
    const [timeRange, setTimeRange] = useState<TimeRange>('14d');
    const [dailyStats, setDailyStats] = useState<DailyActivitySummary[]>([]);
    const [categoryStats, setCategoryStats] = useState<{name: string, value: number}[]>([]);
    const [recentActivity, setRecentActivity] = useState<UserActivity[]>([]);
    const [hourStats, setHourStats] = useState<{hour: number, count: number}[]>([]);
    const [accuracyStats, setAccuracyStats] = useState({ averageQuizScore: 0, perfectScores: 0, averageCodeRuns: 0 });
    const [radarData, setRadarData] = useState<{subject: string, A: number, fullMark: number}[]>([]);
    const [heatmapData, setHeatmapData] = useState<{date: string, count: number, level: number}[]>([]);
    const [dueReviews, setDueReviews] = useState<ReviewItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = async (isSilent = false) => {
        if (!user) return;
        if (!isSilent) setIsLoading(true);
        try {
            // Determine days based on range
            let days = 14;
            if (timeRange === '7d') days = 7;
            if (timeRange === '30d') days = 30;
            if (timeRange === '90d') days = 90;
            if (timeRange === 'all') days = 365;

            const [daily, category, recent, hours, accuracy, radar, heatmap, reviews] = await Promise.all([
                getDailyActivityStats(user.id, days),
                getCategoryStats(user.id),
                getRecentActivity(user.id, 5),
                getProductivityByHour(user.id),
                getAccuracyStats(user.id),
                getSkillRadarData(user.id),
                getActivityHeatmap(user.id),
                getDueReviews(user.id)
            ]);
            
            setDailyStats(daily);
            setCategoryStats(category);
            setRecentActivity(recent);
            setHourStats(hours);
            setAccuracyStats(accuracy);
            setRadarData(radar);
            setHeatmapData(heatmap);
            setDueReviews(reviews);
        } catch (error) {
            console.error("Failed to load analytics:", error);
        } finally {
            if (!isSilent) setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();

        if (!user) return;

        // 🟢 Real-time listener for "Instant Updates"
        const activityRef = userPaths.activity(user.id);
        const unsubscribe = onSnapshot(activityRef, () => {
             loadData(true);
        }, (error) => {
            console.error("Real-time listener failed:", error);
        });

        return () => unsubscribe();
    }, [user, timeRange]);

    if (isLoading) {
        return (
            <div className="w-full h-96 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
            </div>
        );
    }

    const totalTimeMinutes = Math.round(dailyStats.reduce((acc, curr) => acc + curr.timeSpentSeconds, 0) / 60);

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <TrendingUp className="w-8 h-8 text-blue-400" />
                    Personal Analytics
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">Track your progress and learning habits</p>
                </div>
                
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => loadData()}
                    disabled={isLoading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title="Refresh statistics"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                  
                  <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 border border-gray-200 dark:border-gray-700">
                    {(['7d', '14d', '30d'] as TimeRange[]).map((range) => (
                      <button
                        key={range}
                        onClick={() => setTimeRange(range)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          timeRange === range
                            ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        {range === '7d' ? 'Week' : range === '14d' ? '2 Weeks' : 'Month'}
                      </button>
                    ))}
                  </div>
                </div>
            </div>

            {/* SRS Review Due Alert */}
            {dueReviews.length > 0 && (
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg animate-fade-in relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Clock className="w-32 h-32" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-white/20 px-2 py-1 rounded text-xs font-bold uppercase tracking-wide">Memory Boost</span>
                        </div>
                        <h3 className="text-2xl font-black mb-1">Time to Review!</h3>
                        <p className="text-indigo-100 mb-4 max-w-lg">
                            The Spaced Repetition System has identified {dueReviews.length} topics you might be forgetting. Review them now to strengthen your long-term memory.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {dueReviews.slice(0, 3).map(review => (
                                <span key={review.id} className="bg-black/20 px-3 py-1.5 rounded-lg text-sm font-medium backdrop-blur-sm border border-white/10">
                                    {review.topic || review.itemTitle}
                                </span>
                            ))}
                            {dueReviews.length > 3 && (
                                <span className="bg-black/20 px-3 py-1.5 rounded-lg text-sm font-medium backdrop-blur-sm border border-white/10">
                                    +{dueReviews.length - 3} more
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Main Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Activity Heatmap */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-green-500" />
                        Activity Contribution
                    </h3>
                    <div className="w-full overflow-x-auto pb-2">
                         <div className="flex gap-1 min-w-[700px]">
                            {Array.from({ length: 53 }).map((_, weekIndex) => (
                                <div key={weekIndex} className="flex flex-col gap-1">
                                    {Array.from({ length: 7 }).map((_, dayIndex) => {
                                        const dataIndex = weekIndex * 7 + dayIndex;
                                        const dayData = heatmapData[dataIndex];
                                        const colorClass = !dayData || dayData.level === 0 
                                            ? 'bg-gray-100 dark:bg-gray-700' 
                                            : dayData.level === 1 ? 'bg-green-200 dark:bg-green-900/40'
                                            : dayData.level === 2 ? 'bg-green-300 dark:bg-green-800/60'
                                            : dayData.level === 3 ? 'bg-green-400 dark:bg-green-600'
                                            : 'bg-green-500 dark:bg-green-500';
                                            
                                        return (
                                            <div 
                                                key={dayIndex} 
                                                className={`w-3 h-3 rounded-sm ${colorClass}`}
                                                title={dayData ? `${dayData.date}: ${dayData.count} activities` : ''}
                                            />
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end items-center gap-2 mt-2 text-xs text-gray-400">
                            <span>Less</span>
                            <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-700"></div>
                            <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-900/40"></div>
                            <div className="w-3 h-3 rounded-sm bg-green-300 dark:bg-green-800/60"></div>
                            <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-600"></div>
                            <div className="w-3 h-3 rounded-sm bg-green-500 dark:bg-green-500"></div>
                            <span>More</span>
                        </div>
                    </div>
                </div>

                {/* Skill Radar */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <Target className="w-5 h-5 text-blue-500" />
                        Skill Analysis
                    </h3>
                    <div className="flex-1 min-h-[250px] w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                <PolarGrid stroke="#374151" strokeOpacity={0.2} />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar
                                    name="Skills"
                                    dataKey="A"
                                    stroke="#8b5cf6"
                                    strokeWidth={2}
                                    fill="#8b5cf6"
                                    fillOpacity={0.3}
                                />
                                <Tooltip content={<CustomTooltip />} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <Clock className="w-5 h-5 text-blue-500" />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-gray-900 dark:text-white mb-1">
                        {totalTimeMinutes}m
                    </div>
                    <p className="text-gray-500 text-sm">Time Spent Coding</p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                     <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                            <Target className="w-5 h-5 text-emerald-500" />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-gray-900 dark:text-white mb-1">
                        {accuracyStats.averageQuizScore}%
                    </div>
                    <p className="text-gray-500 text-sm">Avg. Quiz Accuracy</p>
                </div>
                
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                     <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <Activity className="w-5 h-5 text-purple-500" />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-gray-900 dark:text-white mb-1">
                        {accuracyStats.averageCodeRuns}
                    </div>
                    <p className="text-gray-500 text-sm">Avg. Runs / Lesson</p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                     <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                            <Award className="w-5 h-5 text-amber-500" />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-gray-900 dark:text-white mb-1">
                        {accuracyStats.perfectScores}
                    </div>
                    <p className="text-gray-500 text-sm">Perfect Scores</p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-cyan-500" />
                        Learning Velocity
                    </h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dailyStats}>
                                <defs>
                                    <linearGradient id="colorLessons" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorPractice" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
                                <XAxis 
                                    dataKey="date" 
                                    tickFormatter={(val) => val.slice(8)} 
                                    stroke="#9CA3AF" 
                                    fontSize={12}
                                />
                                <YAxis stroke="#9CA3AF" fontSize={12} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area 
                                    type="monotone" 
                                    dataKey="lessonsCompleted" 
                                    name="Lessons" 
                                    stroke="#06b6d4" 
                                    fillOpacity={1} 
                                    fill="url(#colorLessons)" 
                                    strokeWidth={3}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="practiceCompleted" 
                                    name="Practice" 
                                    stroke="#8b5cf6" 
                                    fillOpacity={1} 
                                    fill="url(#colorPractice)" 
                                    strokeWidth={3}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-purple-500" />
                        Time Distribution
                    </h3>
                    <div className="h-64 w-full relative">
                        {categoryStats.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryStats}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {categoryStats.map((_entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                                Not enough data yet
                            </div>
                        )}
                        <div className="absolute bottom-0 w-full flex justify-center gap-4 text-xs text-gray-500">
                             {categoryStats.map((entry, index) => (
                                <div key={entry.name} className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                    {entry.name}
                                </div>
                             ))}
                        </div>
                    </div>
                </div>

                 <div className="lg:col-span-3 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-orange-500" />
                        Peak Productivity Hours
                    </h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={hourStats}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
                                <XAxis 
                                    dataKey="hour" 
                                    tickFormatter={(val) => `${val}:00`}
                                    stroke="#9CA3AF" 
                                    fontSize={12}
                                />
                                <YAxis stroke="#9CA3AF" fontSize={12} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="count" stroke="#f59e0b" fillOpacity={1} fill="url(#colorCount)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recent Activity List */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <h3 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-orange-500" />
                    Recent Activity
                </h3>
                <div className="space-y-4">
                    {recentActivity.length > 0 ? (
                        recentActivity.map((activity, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-lg ${
                                        activity.type === 'lesson' ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600' :
                                        activity.type === 'quiz' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' :
                                        'bg-orange-100 dark:bg-orange-900/30 text-orange-600'
                                    }`}>
                                        {activity.type === 'lesson' ? <BookOpen className="w-5 h-5" /> : 
                                         activity.type === 'quiz' ? <Target className="w-5 h-5" /> : 
                                         <Award className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white">{activity.itemTitle}</h4>
                                        <p className="text-xs text-gray-500">
                                            {new Date(activity.timestamp).toLocaleDateString()} • {new Date(activity.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    {activity.score !== undefined && (
                                        <div className="font-bold text-green-500 mb-1">{activity.score}%</div>
                                    )}
                                    <div className="text-xs text-gray-500">{Math.round((activity.durationSeconds || 0) / 60)} min</div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-400">
                            No recent activity recorded.
                        </div>
                    )}
                </div>
            </div>

            <ReviewHistory />
        </div>
    );
};

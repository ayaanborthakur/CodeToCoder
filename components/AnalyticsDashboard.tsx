import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getDailyActivityStats, getRecentActivity } from '../services/analyticsDataService';
import type { DailyActivitySummary, UserActivity } from '../types';
import { BookOpen, Loader2, Target, Clock, Flame, CheckCircle2, ClipboardList } from 'lucide-react';

// ─── Constants ──────────────────────────────────────────────────────────
const DAYS = 30;

const formatMinutes = (seconds: number): string => {
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m === 0 ? `${h}h` : `${h}h ${m}m`;
};

const relativeTime = (ts: number): string => {
    const diff = Date.now() - ts;
    const m = Math.floor(diff / 60_000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d < 7) return `${d}d ago`;
    return new Date(ts).toLocaleDateString();
};

// Bucket minutes-per-day into 0-4 intensity levels for the heatmap.
const intensityBucket = (seconds: number): 0 | 1 | 2 | 3 | 4 => {
    const minutes = seconds / 60;
    if (minutes === 0) return 0;
    if (minutes < 5) return 1;
    if (minutes < 15) return 2;
    if (minutes < 30) return 3;
    return 4;
};

const intensityClass = (level: 0 | 1 | 2 | 3 | 4): string => {
    switch (level) {
        case 0: return 'bg-gray-100 dark:bg-gray-800';
        case 1: return 'bg-cyan-100 dark:bg-cyan-900/40';
        case 2: return 'bg-cyan-300 dark:bg-cyan-700/70';
        case 3: return 'bg-cyan-500 dark:bg-cyan-600';
        case 4: return 'bg-cyan-700 dark:bg-cyan-400';
    }
};

const formatDateLabel = (iso: string): string => {
    const [y, m, d] = iso.split('-');
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
};

const activityIcon = (type: string) => {
    switch (type) {
        case 'lesson': return <BookOpen className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />;
        case 'quiz': return <Target className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />;
        case 'practice':
        case 'problem':
        case 'project': return <ClipboardList className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />;
        default: return <CheckCircle2 className="w-3.5 h-3.5 text-gray-500" />;
    }
};

// ─── Component ──────────────────────────────────────────────────────────

export const AnalyticsDashboard: React.FC = () => {
    const { user } = useAuth();
    const [dailyStats, setDailyStats] = useState<DailyActivitySummary[] | null>(null);
    const [recentActivity, setRecentActivity] = useState<UserActivity[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;
        let cancelled = false;
        Promise.all([
            getDailyActivityStats(user.id, DAYS),
            getRecentActivity(user.id, 10),
        ])
            .then(([daily, recent]) => {
                if (cancelled) return;
                setDailyStats(daily);
                setRecentActivity(recent);
            })
            .catch(e => {
                if (cancelled) return;
                setError(e instanceof Error ? e.message : 'Failed to load analytics.');
            });
        return () => { cancelled = true; };
    }, [user]);

    // Derived stats — all computed from the last-30-days window.
    const stats = useMemo(() => {
        if (!dailyStats) return null;
        const totalSeconds = dailyStats.reduce((s, d) => s + d.timeSpentSeconds, 0);
        const totalLessons = dailyStats.reduce((s, d) => s + d.lessonsCompleted, 0);
        const totalPractice = dailyStats.reduce((s, d) => s + d.practiceCompleted, 0);
        const daysActive = dailyStats.filter(d => d.timeSpentSeconds > 0).length;

        // Current streak — consecutive days ending today with activity.
        let currentStreak = 0;
        for (let i = dailyStats.length - 1; i >= 0; i--) {
            if (dailyStats[i].timeSpentSeconds > 0) currentStreak++;
            else break;
        }

        const avgPerActiveDay = daysActive > 0 ? totalSeconds / daysActive : 0;

        const peakDay = dailyStats.reduce<DailyActivitySummary | null>((best, d) => {
            if (!best || d.timeSpentSeconds > best.timeSpentSeconds) return d;
            return best;
        }, null);

        return {
            totalSeconds, totalLessons, totalPractice,
            daysActive, currentStreak, avgPerActiveDay, peakDay,
        };
    }, [dailyStats]);

    if (error) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
        );
    }

    if (!dailyStats || !stats) {
        return (
            <div className="flex items-center justify-center py-20 text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* ─── Top stats strip ──────────────────────────────────── */}
            <section>
                <SectionLabel>Last 30 days</SectionLabel>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-6 py-5 grid grid-cols-2 sm:grid-cols-4 gap-6">
                    <Stat
                        label="Time studied"
                        value={formatMinutes(stats.totalSeconds)}
                        sub={stats.daysActive > 0 ? `${formatMinutes(stats.avgPerActiveDay)} / active day` : 'No sessions yet'}
                        icon={<Clock className="w-3.5 h-3.5" />}
                    />
                    <Stat
                        label="Lessons"
                        value={stats.totalLessons.toString()}
                        sub={`${stats.totalPractice} practice items`}
                        icon={<BookOpen className="w-3.5 h-3.5" />}
                    />
                    <Stat
                        label="Active days"
                        value={`${stats.daysActive}`}
                        sub={`of ${DAYS}`}
                        icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                    />
                    <Stat
                        label="Current streak"
                        value={`${stats.currentStreak}d`}
                        sub={stats.currentStreak >= 3 ? 'on fire' : 'keep going'}
                        icon={<Flame className="w-3.5 h-3.5" />}
                        accent={stats.currentStreak >= 3 ? 'text-orange-600 dark:text-orange-400' : undefined}
                    />
                </div>
            </section>

            {/* ─── 30-day activity heatmap ─────────────────────────── */}
            <section>
                <SectionLabel
                    right={
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                            <span>Less</span>
                            {[0, 1, 2, 3, 4].map(level => (
                                <span key={level} className={`w-2.5 h-2.5 rounded-sm ${intensityClass(level as 0 | 1 | 2 | 3 | 4)}`} />
                            ))}
                            <span>More</span>
                        </div>
                    }
                >
                    Activity heatmap
                </SectionLabel>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                    <div className="grid grid-cols-[repeat(31,minmax(0,1fr))] gap-1.5">
                        {dailyStats.map((d, idx) => (
                            <div
                                key={d.date}
                                className={`aspect-square rounded-sm ${intensityClass(intensityBucket(d.timeSpentSeconds))}`}
                                title={`${formatDateLabel(d.date)} — ${formatMinutes(d.timeSpentSeconds)}${
                                    d.lessonsCompleted + d.practiceCompleted > 0
                                        ? ` · ${d.lessonsCompleted + d.practiceCompleted} item${d.lessonsCompleted + d.practiceCompleted === 1 ? '' : 's'}`
                                        : ''
                                }${idx === dailyStats.length - 1 ? ' (today)' : ''}`}
                            />
                        ))}
                    </div>
                    {stats.peakDay && stats.peakDay.timeSpentSeconds > 0 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                            Peak day: <span className="font-semibold text-gray-700 dark:text-gray-200">{formatDateLabel(stats.peakDay.date)}</span> with{' '}
                            <span className="font-semibold text-gray-700 dark:text-gray-200">{formatMinutes(stats.peakDay.timeSpentSeconds)}</span> studied.
                        </div>
                    )}
                </div>
            </section>

            {/* ─── Recent activity ──────────────────────────────────── */}
            <section>
                <SectionLabel
                    right={recentActivity && recentActivity.length > 0 ? <span className="text-xs text-gray-400">{recentActivity.length} most recent</span> : null}
                >
                    Recent activity
                </SectionLabel>
                {recentActivity && recentActivity.length > 0 ? (
                    <ul className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden divide-y divide-gray-100 dark:divide-gray-700">
                        {recentActivity.map(a => (
                            <li key={a.id ?? `${a.itemId}-${a.timestamp}`} className="flex items-center gap-3 px-5 py-3">
                                <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                                    {activityIcon(a.type)}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{a.itemTitle ?? a.itemId}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {a.type[0].toUpperCase() + a.type.slice(1)}
                                        {typeof a.durationSeconds === 'number' && a.durationSeconds > 0 && (
                                            <span> · {formatMinutes(a.durationSeconds)}</span>
                                        )}
                                        {typeof a.score === 'number' && (
                                            <span> · {a.score}%</span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-xs text-gray-400 dark:text-gray-500 tabular-nums whitespace-nowrap">
                                    {relativeTime(a.timestamp)}
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-5 py-8 text-center">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">No activity yet.</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Finish a lesson or a practice item and it'll show up here.
                        </p>
                    </div>
                )}
            </section>
        </div>
    );
};

// ─── Sub-components ────────────────────────────────────────────────────

const SectionLabel: React.FC<{ children: React.ReactNode; right?: React.ReactNode }> = ({ children, right }) => (
    <div className="flex items-center justify-between mb-2 px-1">
        <div className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-[0.08em]">{children}</div>
        {right}
    </div>
);

const Stat: React.FC<{
    label: string;
    value: React.ReactNode;
    sub?: string;
    icon?: React.ReactNode;
    accent?: string;
}> = ({ label, value, sub, icon, accent }) => (
    <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-[0.08em]">
            {icon}
            {label}
        </div>
        <div className={`text-xl font-semibold tabular-nums mt-1 ${accent ?? 'text-gray-900 dark:text-white'}`}>{value}</div>
        {sub && <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{sub}</div>}
    </div>
);

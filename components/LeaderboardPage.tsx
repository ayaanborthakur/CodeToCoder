import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { getLeaderboardData, LeaderboardEntry } from '../services/leaderboardService';
import { useAuth } from '../contexts/AuthContext';
import { Medal, Star, BarChart3, User, Trophy } from 'lucide-react';

export const LeaderboardPage: React.FC = () => {
    const { user } = useAuth();
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const data = await getLeaderboardData(50);
                setEntries(data);
            } catch (error) {
                console.error("Failed to load leaderboard:", error);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    // Function to get rank badge or number
    // Function to get rank badge or number
    const getRankDisplay = (rank: number) => {
        if (rank === 1) return <Medal className="w-8 h-8 text-yellow-400 fill-yellow-400 drop-shadow-md" />;
        if (rank === 2) return <Medal className="w-8 h-8 text-slate-300 fill-slate-300 drop-shadow-md" />;
        if (rank === 3) return <Medal className="w-8 h-8 text-amber-700 fill-amber-700 drop-shadow-md" />;
        return <span className="text-slate-400 font-mono font-bold text-lg">#{rank}</span>;
    };

    // Get display name with fallback
    const getDisplayName = (entry: LeaderboardEntry) => {
        if (entry.name && entry.name !== 'Anonymous' && entry.name.trim() !== '') {
            return entry.name;
        }
        // Fallback to user ID prefix
        return `User-${entry.userId.slice(0, 6)}`;
    };

    return (
        <div className="h-full w-full bg-slate-900 text-white overflow-y-auto">
            <Helmet>
                <title>Leaderboard</title>
            </Helmet>

            <div className="max-w-6xl mx-auto p-4 md:p-6 min-h-full flex flex-col">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 mb-3">
                        Global Leaderboard
                    </h1>
                    <p className="text-slate-400 text-lg">Top coders ranked by Net Value</p>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-slate-800/50 rounded-lg p-4 text-center border border-slate-700/50">
                        <div className="text-2xl font-bold text-yellow-400">{entries.length}</div>
                        <div className="text-xs text-slate-400 uppercase tracking-wide">Total Coders</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-4 text-center border border-slate-700/50">
                        <div className="text-2xl font-bold text-green-400">
                            {entries.reduce((sum, e) => sum + e.net_value, 0).toLocaleString()}
                        </div>
                        <div className="text-xs text-slate-400 uppercase tracking-wide">Total Stars</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-4 text-center border border-slate-700/50">
                        <div className="text-2xl font-bold text-cyan-400">
                            {user ? entries.findIndex(e => e.userId === user.id) + 1 || '-' : '-'}
                        </div>
                        <div className="text-xs text-slate-400 uppercase tracking-wide">Your Rank</div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-500"></div>
                    </div>
                ) : (
                    <div className="bg-slate-800/40 backdrop-blur-xl rounded-xl border border-slate-700/50 shadow-2xl overflow-hidden flex-1">
                        {/* Header */}
                        <div className="grid grid-cols-12 gap-2 md:gap-4 p-4 bg-black/20 border-b border-slate-700/50 font-bold text-slate-300 uppercase tracking-wider text-xs sticky top-0">
                            <div className="col-span-2 text-center">Rank</div>
                            <div className="col-span-7">Coder</div>
                            <div className="col-span-3 text-right">Net Value</div>
                        </div>

                        {/* List */}
                        <div className="divide-y divide-slate-700/50">
                            {entries.length === 0 ? (
                                <div className="p-12 text-center flex flex-col items-center gap-4 text-slate-400">
                                    <BarChart3 className="w-16 h-16 opacity-50" />
                                    <div>No data available yet. Start earning stars to appear here!</div>
                                </div>
                            ) : (
                                entries.map((entry) => {
                                    const displayName = getDisplayName(entry);
                                    return (
                                        <div
                                            key={entry.userId}
                                            className={`grid grid-cols-12 gap-2 md:gap-4 p-3 md:p-4 items-center transition-all duration-200 hover:bg-white/5 ${user?.id === entry.userId
                                                    ? 'bg-yellow-500/10 border-l-4 border-yellow-400 shadow-[inset_0_0_20px_rgba(234,179,8,0.1)]'
                                                    : 'border-l-4 border-transparent'
                                                }`}
                                        >
                                            <div className="col-span-2 flex justify-center items-center">
                                                {getRankDisplay(entry.rank)}
                                            </div>

                                            <div className="col-span-7 flex items-center gap-3">
                                                <div className="relative">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center overflow-hidden ring-2 ring-slate-600 shadow-md">
                                                        {entry.avatar ? (
                                                            <img src={entry.avatar} alt={displayName} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-lg font-bold text-slate-300">
                                                                {displayName.charAt(0).toUpperCase()}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex flex-col min-w-0">
                                                    <span className={`font-bold text-sm md:text-base truncate ${user?.id === entry.userId ? 'text-yellow-400' : 'text-slate-100'}`}>
                                                        {displayName}
                                                    </span>
                                                    {user?.id === entry.userId && (
                                                        <span className="text-[10px] bg-yellow-500/20 text-yellow-300 px-1.5 py-0.5 rounded w-fit font-semibold uppercase tracking-wide">
                                                            You
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="col-span-3 text-right">
                                                <span className="font-mono text-yellow-400 font-bold text-base md:text-lg flex items-center justify-end gap-2">
                                                    <Star className="w-4 h-4 fill-yellow-400" /> {entry.net_value.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

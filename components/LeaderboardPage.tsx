import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { getLeaderboardData, LeaderboardEntry } from '../services/leaderboardService';
import { useAuth } from '../contexts/AuthContext';

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
    const getRankDisplay = (rank: number) => {
        if (rank === 1) return <span className="text-3xl filter drop-shadow-md">🥇</span>;
        if (rank === 2) return <span className="text-3xl filter drop-shadow-md">🥈</span>;
        if (rank === 3) return <span className="text-3xl filter drop-shadow-md">🥉</span>;
        return <span className="text-slate-400 font-mono font-bold text-lg">#{rank}</span>;
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8 pt-24 font-sans overflow-y-auto">
            <Helmet>
                <title>Leaderboard</title>
            </Helmet>
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 mb-4 animate-gradient-x">
                        Global Leaderboard
                    </h1>
                    <p className="text-slate-400 text-lg">Top coders recognized by Net Value</p>
                </div>

                {loading ? (
                    <div className="flex justify-center p-20">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-500"></div>
                    </div>
                ) : (
                    <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden ring-1 ring-white/5">
                        {/* Header */}
                        <div className="grid grid-cols-12 gap-2 md:gap-4 p-5 bg-black/20 border-b border-slate-700/50 font-bold text-slate-300 uppercase tracking-wider text-sm sticky top-0">
                            <div className="col-span-2 md:col-span-2 text-center">Rank</div>
                            <div className="col-span-7 md:col-span-7">Coder</div>
                            <div className="col-span-3 md:col-span-3 text-right">Net Value</div>
                        </div>

                        {/* List */}
                        <div className="divide-y divide-slate-700/50">
                            {entries.length === 0 ? (
                                <div className="p-12 text-center flex flex-col items-center gap-4 text-slate-400">
                                    <div className="text-6xl">📊</div>
                                    <div>No data available yet. Start earning stars to appear here!</div>
                                </div>
                            ) : (
                                entries.map((entry) => (
                                    <div
                                        key={entry.userId}
                                        className={`grid grid-cols-12 gap-2 md:gap-4 p-4 items-center transition-all duration-200 hover:bg-white/5 ${user?.id === entry.userId
                                                ? 'bg-yellow-500/10 border-l-4 border-yellow-400 shadow-[inset_0_0_20px_rgba(234,179,8,0.1)]'
                                                : 'border-l-4 border-transparent'
                                            }`}
                                    >
                                        <div className="col-span-2 md:col-span-2 flex justify-center items-center">
                                            {getRankDisplay(entry.rank)}
                                        </div>

                                        <div className="col-span-7 md:col-span-7 flex items-center gap-3 md:gap-4">
                                            <div className="relative">
                                                <div className="w-10 md:w-12 h-10 md:h-12 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden ring-2 ring-slate-600 shadow-md">
                                                    {entry.avatar ? (
                                                        <img src={entry.avatar} alt={entry.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-lg font-bold text-slate-300 bg-gradient-to-br from-slate-600 to-slate-800 w-full h-full flex items-center justify-center">
                                                            {entry.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                {/* Online/Verified indicator could go here */}
                                            </div>

                                            <div className="flex flex-col">
                                                <span className={`font-bold text-base md:text-lg truncate ${user?.id === entry.userId ? 'text-yellow-400' : 'text-slate-100'}`}>
                                                    {entry.name}
                                                </span>
                                                {user?.id === entry.userId && (
                                                    <span className="text-[10px] bg-yellow-500/20 text-yellow-300 px-1.5 py-0.5 rounded w-fit font-semibold uppercase tracking-wide">
                                                        You
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="col-span-3 md:col-span-3 text-right">
                                            <span className="font-mono text-yellow-400 font-bold text-lg md:text-xl drop-shadow-sm">
                                                {entry.net_value.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { getLeaderboardData, LeaderboardEntry } from '../services/leaderboardService';
import { useAuth } from '../contexts/AuthContext';
import { Medal, Star, Crown, Trophy, Calendar, Search } from 'lucide-react';

export const LeaderboardPage: React.FC = () => {
    const { user } = useAuth();
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const data = await getLeaderboardData(500); // Fetch more for better "Member Since" density
                setEntries(data);
            } catch (error) {
                console.error("Failed to load leaderboard:", error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const filteredEntries = entries.filter(e => 
        e.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const top3 = entries.slice(0, 3);
    const tableEntries = filteredEntries; // Show all entries in the table, including top 3

    // Format member since date
    const getMemberSince = (timestamp?: number) => {
        if (!timestamp) return 'Unknown';
        const date = new Date(timestamp);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 30) return `${diffDays} days`;
        return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
    };

    const RankBadge = ({ rank }: { rank: number }) => {
        if (rank === 1) return <Crown className="w-6 h-6 text-yellow-400 fill-yellow-400 animate-bounce-slow" />;
        if (rank === 2) return <Medal className="w-6 h-6 text-gray-300 fill-gray-300" />;
        if (rank === 3) return <Medal className="w-6 h-6 text-amber-700 fill-amber-700" />;
        return <span className="font-mono font-bold text-gray-400">#{rank}</span>;
    };

    return (
        <div className="h-full w-full bg-[#0B1120] text-white overflow-y-auto">
            <Helmet>
                <title>Leaderboard - Global Rankings</title>
            </Helmet>

            <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-12">
                {/* Header Section */}
                <div className="text-center space-y-4 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-cyan-500/20 blur-[100px] rounded-full pointer-events-none" />
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 relative z-10">
                        LEADERBOARD
                    </h1>
                    <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl mx-auto relative z-10">
                        Top masterminds competing for global dominance. <br/>
                        Ranked by <span className="text-cyan-400 font-bold">Net Worth</span>.
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-500"></div>
                    </div>
                ) : (
                    <>
                        {/* Podium Section */}
                        {top3.length > 0 && (
                            <div className="flex flex-col md:flex-row justify-center items-end gap-4 md:gap-8 pb-8 relative z-10">
                                {/* Rank 2 */}
                                {top3[1] && (
                                    <div className="order-2 md:order-1 flex flex-col items-center w-full md:w-1/3 max-w-[280px]">
                                        <div className="mb-4 relative">
                                            <div className="w-24 h-24 rounded-full border-4 border-gray-300 overflow-hidden shadow-[0_0_20px_rgba(209,213,219,0.3)] bg-gray-800">
                                                {top3[1].avatar ? (
                                                    <img src={top3[1].avatar} alt={top3[1].username} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-700 text-3xl font-bold text-gray-400">
                                                        {top3[1].username[0].toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gray-300 text-gray-900 font-black text-xs px-3 py-1 rounded-full shadow-lg">
                                                RANK 2
                                            </div>
                                        </div>
                                        <div className="w-full bg-gradient-to-t from-gray-900/80 to-gray-800/50 backdrop-blur-md rounded-t-2xl border-t border-gray-700 p-6 text-center h-[200px] flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300">
                                            <div>
                                                <h3 className="font-bold text-xl truncate text-gray-200">@{top3[1].username}</h3>
                                                <p className="text-gray-500 text-sm mt-1">{getMemberSince(top3[1].joinedAt)}</p>
                                            </div>
                                            <div className="flex items-center justify-center gap-2 text-gray-300 font-bold text-xl bg-gray-800/50 py-2 rounded-xl">
                                                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                                {top3[1].net_value.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Rank 1 */}
                                {top3[0] && (
                                    <div className="order-1 md:order-2 flex flex-col items-center w-full md:w-1/3 max-w-[320px] z-20 -mt-12 md:mt-0">
                                        <div className="mb-6 relative">
                                            <Crown className="absolute -top-10 left-1/2 -translate-x-1/2 w-10 h-10 text-yellow-400 fill-yellow-400 animate-bounce" />
                                            <div className="w-32 h-32 rounded-full border-4 border-yellow-400 overflow-hidden shadow-[0_0_40px_rgba(250,204,21,0.4)] bg-gray-800 relative z-10">
                                                {top3[0].avatar ? (
                                                    <img src={top3[0].avatar} alt={top3[0].username} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-yellow-500 text-4xl font-bold text-yellow-900">
                                                        {top3[0].username[0].toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-black text-sm px-4 py-1.5 rounded-full shadow-xl z-20">
                                                CHAMPION
                                            </div>
                                        </div>
                                        <div className="w-full bg-gradient-to-t from-yellow-900/40 to-yellow-600/20 backdrop-blur-xl rounded-t-3xl border-t border-yellow-500/50 p-8 text-center h-[240px] flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300 shadow-[0_10px_40px_-10px_rgba(234,179,8,0.2)]">
                                            <div>
                                                <h3 className="font-black text-2xl truncate text-yellow-100">@{top3[0].username}</h3>
                                                <p className="text-yellow-200/60 text-sm mt-1 font-medium">{getMemberSince(top3[0].joinedAt)}</p>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="text-yellow-500 text-xs font-bold uppercase tracking-widest">Net Worth</div>
                                                <div className="flex items-center justify-center gap-2 text-white font-black text-3xl bg-yellow-500/20 py-3 rounded-2xl border border-yellow-500/30">
                                                    <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                                                    {top3[0].net_value.toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Rank 3 */}
                                {top3[2] && (
                                    <div className="order-3 flex flex-col items-center w-full md:w-1/3 max-w-[280px]">
                                        <div className="mb-4 relative">
                                            <div className="w-24 h-24 rounded-full border-4 border-amber-700 overflow-hidden shadow-[0_0_20px_rgba(180,83,9,0.3)] bg-gray-800">
                                                {top3[2].avatar ? (
                                                    <img src={top3[2].avatar} alt={top3[2].username} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-700 text-3xl font-bold text-gray-400">
                                                        {top3[2].username[0].toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-700 text-white font-black text-xs px-3 py-1 rounded-full shadow-lg">
                                                RANK 3
                                            </div>
                                        </div>
                                        <div className="w-full bg-gradient-to-t from-gray-900/80 to-gray-800/50 backdrop-blur-md rounded-t-2xl border-t border-gray-700 p-6 text-center h-[180px] flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300">
                                            <div>
                                                <h3 className="font-bold text-xl truncate text-gray-200">@{top3[2].username}</h3>
                                                <p className="text-gray-500 text-sm mt-1">{getMemberSince(top3[2].joinedAt)}</p>
                                            </div>
                                            <div className="flex items-center justify-center gap-2 text-amber-500 font-bold text-xl bg-gray-800/50 py-2 rounded-xl">
                                                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                                                {top3[2].net_value.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Search & List Section */}
                        <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-slate-800 overflow-hidden shadow-2xl relative z-10">
                            {/* Toolbar */}
                            <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <Trophy className="w-5 h-5 text-cyan-500" />
                                    Global Rankings
                                </h3>
                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input 
                                        type="text" 
                                        placeholder="Search coders..." 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-slate-800 border-none rounded-xl py-2 pl-9 pr-4 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 transition-all"
                                    />
                                </div>
                            </div>
                            
                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-900/80 text-xs text-slate-400 uppercase tracking-wider font-bold">
                                        <tr>
                                            <th className="px-6 py-4 text-center w-24">Rank</th>
                                            <th className="px-6 py-4 text-left">Coder</th>
                                            <th className="px-6 py-4 text-right hidden md:table-cell">Member Since</th>
                                            <th className="px-6 py-4 text-right">Net Value</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800">
                                        {tableEntries.length === 0 && searchQuery ? (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                                    No results found for "{searchQuery}"
                                                </td>
                                            </tr>
                                        ) : (
                                            tableEntries.map((entry) => (
                                                <tr 
                                                    key={entry.userId} 
                                                    className={`
                                                        group transition-colors duration-200 hover:bg-white/5
                                                        ${user?.id === entry.userId ? 'bg-cyan-500/10 hover:bg-cyan-500/20' : ''}
                                                    `}
                                                >
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="inline-flex justify-center items-center w-8 h-8 rounded-lg bg-slate-800 text-slate-400 font-mono font-bold group-hover:bg-slate-700 transition-colors">
                                                            {entry.rank}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden ring-2 ring-transparent group-hover:ring-cyan-500/50 transition-all">
                                                                {entry.avatar ? (
                                                                    <img src={entry.avatar} alt={entry.username} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <span className="font-bold text-slate-300">{entry.username[0].toUpperCase()}</span>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className={`font-bold ${user?.id === entry.userId ? 'text-cyan-400' : 'text-white'}`}>
                                                                    @{entry.username}
                                                                </div>
                                                                <div className="md:hidden text-xs text-slate-500 mt-1">
                                                                    {getMemberSince(entry.joinedAt)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right hidden md:table-cell">
                                                        <div className="flex items-center justify-end gap-2 text-slate-400 text-sm font-medium bg-slate-800/30 py-1 px-3 rounded-full w-fit ml-auto">
                                                            <Calendar className="w-3.5 h-3.5" />
                                                            {getMemberSince(entry.joinedAt)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2 font-bold text-yellow-400">
                                                            <Star className="w-4 h-4 fill-yellow-400" />
                                                            {entry.net_value.toLocaleString()}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

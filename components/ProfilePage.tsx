import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useProgress } from '../hooks/useProgress';
import { getMarketplaceData, getOwnedCollectibles } from '../services/marketplaceService';
import { BADGES, getBadgeColor } from '../services/achievementService';
import { RARITY_COLORS, RARITY_BG_COLORS } from '../data/collectiblesData';
import type { User, UserAchievements, Collectible } from '../types';

interface ProfilePageProps {
    onNavigate: (view: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
    const { user, logout } = useAuth();
    const { achievements } = useProgress();
    const [collectibles, setCollectibles] = useState<Collectible[]>([]);
    const [activeTab, setActiveTab] = useState<'stats' | 'badges' | 'collection'>('stats');

    useEffect(() => {
        if (user) {
            setCollectibles(getOwnedCollectibles(user.id));
        }
    }, [user]);

    if (!user) return null;

    return (
        <div className="h-full w-full overflow-y-auto bg-slate-950 text-slate-100">
            <div className="max-w-4xl mx-auto p-6 md:p-8">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <button
                        onClick={() => onNavigate('home')}
                        className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                        </svg>
                        <span className="font-medium">Back</span>
                    </button>
                    <button
                        onClick={logout}
                        className="text-red-400 hover:text-red-300 font-medium"
                    >
                        Sign Out
                    </button>
                </div>

                {/* Profile Card */}
                <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 p-8 mb-8 flex flex-col md:flex-row items-center gap-8">
                    <div className="w-24 h-24 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-lg">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-center md:text-left flex-1">
                        <h1 className="text-3xl font-bold text-white mb-2">{user.name}</h1>
                        <p className="text-slate-400">{user.email}</p>
                        <div className="mt-4 flex flex-wrap gap-4 justify-center md:justify-start">
                            <div className="bg-slate-950 px-4 py-2 rounded-lg border border-slate-800">
                                <span className="text-slate-400 text-sm block">Joined</span>
                                <span className="font-mono">{new Date(user.joinedAt).toLocaleDateString()}</span>
                            </div>
                            <div className="bg-slate-950 px-4 py-2 rounded-lg border border-slate-800">
                                <span className="text-slate-400 text-sm block">Total Points</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-cyan-400 font-bold">{achievements?.totalPoints || 0}</span>
                                    <div className="group relative">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-500 cursor-help">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                                        </svg>
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-xs text-slate-200 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-slate-700 shadow-xl z-50">
                                            Earn points by completing lessons and challenges!
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-800" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-8 border-b border-slate-800 pb-1 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('stats')}
                        className={`pb-3 px-4 font-bold transition-colors relative whitespace-nowrap ${activeTab === 'stats' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'
                            }`}
                    >
                        Stats
                        {activeTab === 'stats' && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400 rounded-t-full" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('badges')}
                        className={`pb-3 px-4 font-bold transition-colors relative whitespace-nowrap ${activeTab === 'badges' ? 'text-yellow-400' : 'text-slate-500 hover:text-slate-300'
                            }`}
                    >
                        Badges ({achievements?.earnedBadgeIds?.length || 0})
                        {activeTab === 'badges' && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-yellow-400 rounded-t-full" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('collection')}
                        className={`pb-3 px-4 font-bold transition-colors relative whitespace-nowrap ${activeTab === 'collection' ? 'text-purple-400' : 'text-slate-500 hover:text-slate-300'
                            }`}
                    >
                        Collection ({collectibles.length})
                        {activeTab === 'collection' && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-400 rounded-t-full" />
                        )}
                    </button>
                </div>

                {/* Content */}
                {activeTab === 'stats' ? (
                    <div className="space-y-8">
                        {/* Stats Overview */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
                                <h3 className="text-slate-400 text-sm font-medium mb-2">Lessons Completed</h3>
                                <div className="text-3xl font-bold text-white">{achievements?.earnedBadgeIds.filter(id => id.startsWith('lesson')).length || 0}</div>
                            </div>
                            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
                                <h3 className="text-slate-400 text-sm font-medium mb-2">Badges Earned</h3>
                                <div className="text-3xl font-bold text-white">{achievements?.earnedBadgeIds.length || 0}</div>
                            </div>
                            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
                                <h3 className="text-slate-400 text-sm font-medium mb-2">Current Rank</h3>
                                <div className="text-3xl font-bold text-yellow-400">Novice</div>
                            </div>
                        </div>
                    </div>
                ) : activeTab === 'badges' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {BADGES.map(badge => {
                            const isUnlocked = achievements?.earnedBadgeIds.includes(badge.id);
                            const badgeColor = getBadgeColor(badge.tier);

                            return (
                                <div
                                    key={badge.id}
                                    className={`relative rounded-xl p-6 border-2 transition-all ${isUnlocked
                                        ? 'bg-slate-900 border-slate-700 hover:border-slate-600'
                                        : 'bg-slate-900/50 border-slate-800 opacity-60 grayscale'
                                        }`}
                                    style={isUnlocked ? { borderColor: `${badgeColor}40` } : {}}
                                >
                                    <div className="flex items-start gap-4">
                                        <div
                                            className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-lg shrink-0 ${isUnlocked ? 'bg-slate-800' : 'bg-slate-800/50'
                                                }`}
                                            style={isUnlocked ? { color: badgeColor, boxShadow: `0 0 15px ${badgeColor}20` } : {}}
                                        >
                                            {badge.type === 'lesson' ? '📚' :
                                                badge.type === 'practice' ? '💪' :
                                                    badge.type === 'quiz' ? '📝' : '🏆'}
                                        </div>
                                        <div>
                                            <h3 className={`font-bold mb-1 ${isUnlocked ? 'text-white' : 'text-slate-400'}`}>
                                                {badge.name}
                                            </h3>
                                            <p className="text-xs text-slate-500 mb-2">{badge.description}</p>
                                            <div className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-950 border border-slate-800"
                                                style={isUnlocked ? { color: badgeColor, borderColor: `${badgeColor}30` } : { color: '#64748b' }}>
                                                {badge.tier}
                                            </div>
                                        </div>
                                    </div>
                                    {!isUnlocked && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/20 backdrop-blur-[1px] rounded-xl">
                                            <div className="bg-slate-900/90 text-slate-400 text-xs font-bold px-3 py-1 rounded-full border border-slate-700 flex items-center gap-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                                                    <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                                                </svg>
                                                Locked
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {collectibles.length > 0 ? (
                            collectibles.map(item => (
                                <div
                                    key={item.id}
                                    className={`bg-slate-900 rounded-xl p-4 border-2 transition-all hover:scale-105 group relative overflow-hidden ${RARITY_COLORS[item.rarity].split(' ')[1]}`} // Extract border color
                                >
                                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity ${RARITY_BG_COLORS[item.rarity]}`} />

                                    <div className="relative z-10 text-center">
                                        <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform duration-300">{item.image}</div>
                                        <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${RARITY_COLORS[item.rarity]}`}>
                                            {item.rarity}
                                        </div>
                                        <h3 className="font-bold text-white text-sm mb-1">{item.name}</h3>
                                        <p className="text-xs text-slate-500 line-clamp-2">{item.description}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12 bg-slate-900 rounded-2xl border border-slate-800 border-dashed">
                                <div className="text-4xl mb-4">📦</div>
                                <h3 className="text-xl font-bold text-white mb-2">No Collectibles Yet</h3>
                                <p className="text-slate-400 mb-6">Visit the Token Market to buy packs and start your collection!</p>
                                <button
                                    onClick={() => onNavigate('marketplace')}
                                    className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                                >
                                    Go to Market
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

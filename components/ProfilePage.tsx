import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useProgress } from '../hooks/useProgress';
import { getMarketplaceData, getOwnedCollectibles } from '../services/marketplaceService';
import { BADGES, getBadgeColor } from '../services/achievementService';
import { RARITY_COLORS, RARITY_BG_COLORS } from '../data/collectiblesData';
import { resetTutorial } from '../services/tutorialService';
import type { User, UserAchievements, Collectible } from '../types';

interface ProfilePageProps {
    onNavigate: (view: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
    const { user, logout, deleteAccount } = useAuth();
    const { achievements } = useProgress();
    const [collectibles, setCollectibles] = useState<Collectible[]>([]);
    const [starBalance, setStarBalance] = useState(0);
    const [activeTab, setActiveTab] = useState<'stats' | 'badges' | 'collection'>('stats');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [isResetTutorialModalOpen, setIsResetTutorialModalOpen] = useState(false);

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== 'DELETE') return;

        setIsDeleting(true);
        try {
            await deleteAccount();
        } catch (error) {
            console.error("Failed to delete account:", error);
            alert("Failed to delete account. Please try again.");
            setIsDeleting(false);
        }
    };

    const handleResetTutorial = async () => {
        await resetTutorial(user?.id);
        setIsResetTutorialModalOpen(false);
        // Reload the page to trigger tutorial
        window.location.reload();
    };

    useEffect(() => {
        const loadData = async () => {
            if (user) {
                const data = await getMarketplaceData(user.id);
                setStarBalance(data.stars.balance);
                const owned = await getOwnedCollectibles(user.id);
                // Profile page just shows unique items, so we can use the array as is or filter duplicates if needed
                // Since getOwnedCollectibles returns unique items with counts, we can just use it directly
                setCollectibles(owned);
            }
        };
        loadData();
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
                                <span className="text-slate-400 text-sm block">Total Stars</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-yellow-400 font-bold">{starBalance} ★</span>
                                    <div className="group relative">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-500 cursor-help">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                                        </svg>
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-xs text-slate-200 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-slate-700 shadow-xl z-50">
                                            Earn stars by completing lessons and challenges!
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
                                <p className="text-slate-400 mb-6">Visit the Star Market to buy packs and start your collection!</p>
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

                {/* Settings Section */}
                <div className="mt-12 border-t border-slate-800 pt-8">
                    <h3 className="text-xl font-bold text-white mb-4">Settings</h3>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <h4 className="text-white font-bold mb-1">Reset Tutorial</h4>
                            <p className="text-slate-400 text-sm">Replay the interactive tutorial to learn about all features again.</p>
                        </div>
                        <button
                            onClick={() => setIsResetTutorialModalOpen(true)}
                            className="px-4 py-2 text-sm font-bold text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-lg transition-colors border border-cyan-200 dark:border-cyan-800"
                        >
                            Reset Tutorial
                        </button>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="mt-8 border-t border-slate-800 pt-8">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <h4 className="text-white font-bold mb-1">Delete Account</h4>
                            <p className="text-slate-400 text-sm">Permanently delete your account and all progress. This action cannot be undone.</p>
                        </div>
                        <button
                            onClick={() => setIsDeleteModalOpen(true)}
                            className="px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-red-200 dark:border-red-800"
                        >
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60]" onClick={() => !isDeleting && setIsDeleteModalOpen(false)}>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-sm w-full border border-red-500 dark:border-red-700 animate-scale-in" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-red-600 dark:text-red-400">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Delete Account?</h3>
                        </div>

                        <div className="mb-6 space-y-2">
                            <p className="text-gray-700 dark:text-gray-300 text-sm">
                                This action is <strong className="text-red-600 dark:text-red-400">permanent and cannot be undone</strong>.
                            </p>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                All your data will be deleted:
                            </p>
                            <ul className="text-gray-600 dark:text-gray-400 text-sm list-disc list-inside space-y-1 ml-2">
                                <li>Lesson progress ({achievements?.earnedBadgeIds.filter(id => id.startsWith('lesson')).length || 0} stars)</li>
                                <li>Badges earned ({achievements?.earnedBadgeIds.length || 0})</li>
                                <li>All playground files</li>
                                <li>Account credentials</li>
                            </ul>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Type <span className="text-red-600 dark:text-red-400">DELETE</span> to confirm:
                            </label>
                            <input
                                type="text"
                                value={deleteConfirmText}
                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                                placeholder="DELETE"
                                disabled={isDeleting}
                                className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-red-500 dark:focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setIsDeleteModalOpen(false);
                                    setDeleteConfirmText('');
                                }}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors border border-gray-200 dark:border-gray-600 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                                className="flex-1 px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isDeleting ? 'Deleting...' : 'Delete Account'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reset Tutorial Confirmation Modal */}
            {isResetTutorialModalOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60]" onClick={() => setIsResetTutorialModalOpen(false)}>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-sm w-full border border-cyan-500 dark:border-cyan-700 animate-scale-in" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-cyan-600 dark:text-cyan-400">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Reset Tutorial?</h3>
                        </div>

                        <div className="mb-6">
                            <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                                This will reset the tutorial and reload the page. You'll see the interactive tutorial again from the beginning.
                            </p>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                This won't affect your progress, badges, or any other data.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsResetTutorialModalOpen(false)}
                                className="flex-1 px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors border border-gray-200 dark:border-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleResetTutorial}
                                className="flex-1 px-4 py-2 text-sm font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors"
                            >
                                Reset & Reload
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <style>{`
        @keyframes scale-in {
            0% { transform: scale(0.95); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
            animation: scale-in 0.2s ease-out forwards;
        }
      `}</style>
        </div>
    );
};

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BadgeDisplay } from './BadgeDisplay';
import { getEarnedBadges, getBadgeProgress, BADGES } from '../services/achievementService';
import type { UserAchievements, Badge } from '../types';

interface ProfilePageProps {
    stats: {
        lessons: number;
        practice: number;
    };
    achievements?: UserAchievements;
    onNavigate: (view: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ stats, achievements, onNavigate }) => {
    const { user, logout, deleteAccount } = useAuth();
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        // Log analytics when profile is viewed
        import('../services/analyticsService').then(({ logProfileView }) => {
            logProfileView();
        });
    }, []);

    if (!user) {
        onNavigate('home');
        return null;
    }

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== 'DELETE') return;

        setIsDeleting(true);
        try {
            await deleteAccount();
        } catch (error) {
            console.error('Failed to delete account:', error);
            alert('Failed to delete account. Please try again or contact support.');
            setIsDeleting(false);
        }
    };

    const earnedBadges = getEarnedBadges(achievements);
    const earnedBadgeIds = achievements?.earnedBadgeIds || [];

    // Get all locked badges
    const lockedBadges = BADGES.filter(badge => !earnedBadgeIds.includes(badge.id));

    // Get progress for each locked badge
    const getBadgeProgressInfo = (badge: Badge) => {
        const progress = getBadgeProgress(badge.type,
            badge.type === 'lesson' ? stats.lessons :
                badge.type === 'practice' ? stats.practice : 0,
            earnedBadgeIds
        );
        return progress;
    };

    return (
        <div className="h-full w-full overflow-y-auto bg-gray-50 dark:bg-gray-900 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
            <div className="max-w-6xl mx-auto p-6 md:p-8">
                {/* Header with Back Button */}
                <div className="mb-6">
                    <button
                        onClick={() => onNavigate('home')}
                        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors mb-4"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                        </svg>
                        <span className="font-medium">Back</span>
                    </button>
                </div>

                {/* User Info Section */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-4xl font-bold text-white shadow-xl border-4 border-white dark:border-gray-800">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{user.name}</h1>
                            <p className="text-gray-600 dark:text-gray-400 mb-1">{user.email}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-500">
                                Member since {new Date(user.joinedAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    {/* Statistics Grid */}
                    <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 p-6 rounded-xl border border-cyan-200 dark:border-cyan-800">
                            <div className="text-4xl font-bold text-cyan-600 dark:text-cyan-400 mb-2">{stats.lessons}</div>
                            <div className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Lessons Completed</div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-xl border border-purple-200 dark:border-purple-800">
                            <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">{stats.practice}</div>
                            <div className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Practice Completed</div>
                        </div>
                    </div>
                </div>

                {/* Achievements Overview */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-6 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                        <span className="text-3xl">🏆</span>
                        Achievements ({earnedBadges.length}/{BADGES.length})
                    </h2>

                    {/* Earned Badges Section */}
                    {earnedBadges.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Earned Badges</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                {earnedBadges.map(badge => (
                                    <BadgeDisplay key={badge.id} badge={badge} earned={true} size="large" />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Locked Achievements Section */}
                    {lockedBadges.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Locked Achievements</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {lockedBadges.map(badge => {
                                    const progressInfo = getBadgeProgressInfo(badge);
                                    return (
                                        <div key={badge.id} className="flex items-center gap-4 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                                            <BadgeDisplay badge={badge} earned={false} size="medium" />
                                            <div className="flex-1">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">{badge.name}</div>
                                                <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">{badge.description}</div>
                                                <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                                                    {progressInfo.progress > 0 && (
                                                        <div
                                                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                                                            style={{ width: `${progressInfo.progress}%` }}
                                                        />
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    {progressInfo.current}/{progressInfo.required} {badge.type}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {earnedBadges.length === BADGES.length && (
                        <div className="text-center py-8">
                            <div className="text-6xl mb-4">🎉</div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">All Badges Earned!</h3>
                            <p className="text-gray-600 dark:text-gray-400">You're a master! You've unlocked every achievement.</p>
                        </div>
                    )}
                </div>

                {/* Account Actions */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Account Settings</h2>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={() => {
                                logout();
                                onNavigate('home');
                            }}
                            className="flex-1 px-6 py-3 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors border-2 border-gray-300 dark:border-gray-600"
                        >
                            Sign Out
                        </button>
                        <button
                            onClick={() => setIsDeleteConfirmOpen(true)}
                            className="flex-1 px-6 py-3 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border-2 border-red-300 dark:border-red-800"
                        >
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {isDeleteConfirmOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => !isDeleting && setIsDeleteConfirmOpen(false)}>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full border-2 border-red-500 dark:border-red-700 animate-scale-in" onClick={e => e.stopPropagation()}>
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
                                <li>Lesson progress ({stats.lessons} completed)</li>
                                <li>Practice progress ({stats.practice} completed)</li>
                                <li>All badges and achievements ({earnedBadges.length} earned)</li>
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
                                    setIsDeleteConfirmOpen(false);
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

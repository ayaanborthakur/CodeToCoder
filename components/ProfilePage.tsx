
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../contexts/AuthContext';
import { useProgress } from '../hooks/useProgress';
import { 
    ArrowLeft, HelpCircle, Lock, AlertTriangle, RotateCw, Pencil, 
    Settings, Shield, Bell, Globe, Moon, User as UserIcon, LogOut,
    Award, Layers, BarChart3, ChevronRight 
} from 'lucide-react';
import { getMarketplaceData, getOwnedCollectibles } from '../services/marketplaceService';
import { BADGES, getBadgeColor } from '../services/achievementService';
import { RARITY_COLORS, RARITY_BG_COLORS } from '../data/collectiblesData';
import { resetTutorial } from '../services/tutorialService';
import { getUserSettings, updateUserSettings } from '../services/userSettingsService';
import { ToggleSwitch } from './ToggleSwitch';
import { UsernameModal } from './UsernameModal';
import type { UserAchievements, Collectible } from '../types';

import { ViewState } from './Header';

interface ProfilePageProps {
    onNavigate: (view: ViewState) => void;
    stats?: { lessons: number; practice: number };
    achievements?: UserAchievements;
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate, theme, setTheme, stats }) => {
    const { user, logout, deleteAccount } = useAuth();
    const { achievements } = useProgress();
    const [collectibles, setCollectibles] = useState<Collectible[]>([]);
    const [starBalance, setStarBalance] = useState(0);
    const [activeTab, setActiveTab] = useState<'overview' | 'badges' | 'collection' | 'settings'>('overview');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [isResetTutorialModalOpen, setIsResetTutorialModalOpen] = useState(false);
    const [aiAssistanceLevel, setAiAssistanceLevel] = useState(7);
    const [isUsernameModalOpen, setIsUsernameModalOpen] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

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
        window.location.reload();
    };

    useEffect(() => {
        const loadData = async () => {
            if (user) {
                const data = await getMarketplaceData(user.id);
                setStarBalance(data.stars.balance);
                const owned = await getOwnedCollectibles(user.id);
                setCollectibles(owned);

                const settings = await getUserSettings(user.id);
                setAiAssistanceLevel(settings.aiAssistanceLevel);
            }
        };
        loadData();
    }, [user]);

    const handleThemeChange = async (newTheme: 'light' | 'dark') => {
        setTheme(newTheme);
        if (user) {
            await updateUserSettings(user.id, { theme: newTheme });
        }
    };

    const handleAiAssistanceChange = async (level: number) => {
        setAiAssistanceLevel(level);
        if (user) {
            await updateUserSettings(user.id, { aiAssistanceLevel: level });
        }
    };

    if (!user) return null;

    const navItems = [
        { id: 'overview', label: 'Overview', icon: BarChart3 },
        { id: 'badges', label: 'Badges', icon: Award },
        { id: 'collection', label: 'Collection', icon: Layers },
        { id: 'settings', label: 'Settings', icon: Settings },
    ] as const;

    return (
        <div className="h-full w-full overflow-y-auto bg-gray-50 dark:bg-black text-slate-800 dark:text-slate-200 font-sans">
            <Helmet>
                <title>Profile | {user.name}</title>
            </Helmet>
            
            {/* Top Navigation Bar */}
            <div className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => onNavigate('home')}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors group"
                        aria-label="Back to Home"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-500 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-white" />
                    </button>
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400">
                        Profile
                    </h1>
                </div>
                
                <button
                    onClick={logout}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                </button>
            </div>

            <div className="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Sidebar / User Info */}
                <div className="lg:col-span-4 space-y-6">
                    {/* User Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-slate-800 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 dark:from-cyan-900/40 dark:to-blue-900/40 z-0"></div>
                        
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-28 h-28 p-1 bg-white dark:bg-slate-900 rounded-full shadow-xl mb-4 group-hover:scale-105 transition-transform duration-300">
                                <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-5xl font-bold text-white">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                            </div>
                            
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{user.name}</h2>
                            <button 
                                onClick={() => setIsUsernameModalOpen(true)}
                                className="text-cyan-600 dark:text-cyan-400 font-medium text-sm flex items-center gap-1.5 hover:underline mb-4"
                            >
                                {user.username ? `@${user.username}` : 'Set Username'}
                                <Pencil className="w-3 h-3" />
                            </button>

                            <div className="flex flex-wrap justify-center gap-3 w-full">
                                <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50 flex flex-col items-center min-w-[100px]">
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Stars</span>
                                    <span className="text-lg font-bold text-yellow-500 dark:text-yellow-400 flex items-center gap-1">
                                        {starBalance} ★
                                    </span>
                                </div>
                                <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50 flex flex-col items-center min-w-[100px]">
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Joined</span>
                                    <span className="text-lg font-bold text-slate-700 dark:text-slate-300">
                                        {new Date(user.joinedAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs (Sidebar style for desktop, horizontal for mobile) */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 shadow-sm border border-gray-100 dark:border-slate-800 flex lg:flex-col overflow-x-auto lg:overflow-visible">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium whitespace-nowrap lg:whitespace-normal
                                    ${activeTab === item.id 
                                        ? 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 shadow-sm' 
                                        : 'text-slate-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span>{item.label}</span>
                                {item.id === 'badges' && (
                                    <span className="ml-auto bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs px-2 py-0.5 rounded-full">
                                        {achievements?.earnedBadgeIds?.length || 0}
                                    </span>
                                )}
                                {activeTab === item.id && (
                                    <ChevronRight className="w-4 h-4 ml-auto hidden lg:block opacity-50" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-8">
                    {activeTab === 'overview' && (
                        <div className="space-y-6 animate-fade-in">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Overview</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-3 mb-4 opacity-80">
                                            <div className="p-2 bg-white/10 rounded-lg"><BarChart3 className="w-6 h-6" /></div>
                                            <h3 className="font-semibold">Current Progress</h3>
                                        </div>
                                        <div className="flex items-end gap-2 mb-1">
                                            <span className="text-4xl font-bold">{stats?.lessons || 0}</span>
                                            <span className="text-lg opacity-80 mb-1">Lessons</span>
                                        </div>
                                        <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden mt-4">
                                            <div className="h-full bg-white/40 w-1/3 rounded-full"></div> 
                                        </div>
                                    </div>
                                    <Layers className="absolute -bottom-6 -right-6 w-32 h-32 text-white/5 rotate-12" />
                                </div>

                                <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-3 mb-4 opacity-80">
                                            <div className="p-2 bg-white/10 rounded-lg"><Award className="w-6 h-6" /></div>
                                            <h3 className="font-semibold">Achievements</h3>
                                        </div>
                                        <div className="flex items-end gap-2 mb-1">
                                            <span className="text-4xl font-bold">{achievements?.earnedBadgeIds.length || 0}</span>
                                            <span className="text-lg opacity-80 mb-1">Badges</span>
                                        </div>
                                        <p className="text-sm opacity-70 mt-4">Keep going to unlock more!</p>
                                    </div>
                                    <Award className="absolute -bottom-6 -right-6 w-32 h-32 text-white/5 rotate-12" />
                                </div>
                            </div>

                            {/* Recent Activity or Next Steps Placeholder */}
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800">
                                <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">Next Steps</h3>
                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-800 hover:border-cyan-200 dark:hover:border-cyan-800 transition-colors cursor-pointer" onClick={() => onNavigate('home')}>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                                            <RotateCw className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-white">Continue Leaning</h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Jump back into your last lesson</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-400" />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'badges' && (
                        <div className="space-y-6 animate-fade-in">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                Badges <span className="text-sm font-normal text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">{achievements?.earnedBadgeIds.length || 0} earned</span>
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {BADGES.map(badge => {
                                    const isUnlocked = achievements?.earnedBadgeIds.includes(badge.id);
                                    const badgeColor = getBadgeColor(badge.tier);

                                    return (
                                        <div
                                            key={badge.id}
                                            className={`relative rounded-2xl p-5 border-2 transition-all ${isUnlocked
                                                ? 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-md'
                                                : 'bg-gray-50 dark:bg-slate-900/30 border-dashed border-gray-200 dark:border-slate-800 opacity-60'
                                                }`}
                                        >
                                            <div className="flex items-start gap-4 mb-3">
                                                 <div
                                                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm ${isUnlocked ? 'bg-white dark:bg-slate-800' : 'bg-gray-200 dark:bg-slate-800 grayscale'}`}
                                                    style={isUnlocked ? { boxShadow: `0 4px 12px ${badgeColor}20`, color: badgeColor } : {}}
                                                >
                                                    {badge.type === 'lesson' ? '📚' : badge.type === 'practice' ? '💪' : badge.type === 'quiz' ? '📝' : '🏆'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className={`font-bold truncate ${isUnlocked ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                                                        {badge.name}
                                                    </h3>
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${isUnlocked ? 'bg-slate-100 dark:bg-slate-800' : 'bg-gray-200 dark:bg-slate-800/50'}`} style={isUnlocked ? { color: badgeColor } : {}}>
                                                        {badge.tier}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                                {badge.description}
                                            </p>
                                            
                                            {!isUnlocked && (
                                                <div className="absolute top-4 right-4">
                                                    <Lock className="w-4 h-4 text-slate-400" />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {activeTab === 'collection' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Your Collection</h2>
                                <button 
                                    onClick={() => onNavigate('marketplace')}
                                    className="text-sm font-bold text-cyan-600 hover:text-cyan-500 hover:underline"
                                >
                                    Visit Market
                                </button>
                            </div>

                            {collectibles.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {collectibles.map(item => (
                                        <div
                                            key={item.id}
                                            className={`bg-white dark:bg-slate-900 rounded-2xl p-4 border-2 transition-all hover:-translate-y-1 hover:shadow-lg relative overflow-hidden group ${RARITY_COLORS[item.rarity].split(' ')[1]}`}
                                        >
                                            <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity ${RARITY_BG_COLORS[item.rarity]}`} />
                                            <div className="relative z-10 text-center">
                                                <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">{item.image}</div>
                                                <div className={`text-[10px] font-bold uppercase tracking-wider mb-2 inline-block px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 ${RARITY_COLORS[item.rarity]}`}>
                                                    {item.rarity}
                                                </div>
                                                <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{item.name}</h3>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-gray-200 dark:border-slate-800">
                                    <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">📦</div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Items Found</h3>
                                    <p className="text-slate-500 max-w-xs mx-auto mb-6">You haven't collected any items yet. Unlock packs in the marketplace!</p>
                                    <button
                                        onClick={() => onNavigate('marketplace')}
                                        className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-cyan-500/20"
                                    >
                                        Go to Marketplace
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="space-y-8 animate-fade-in max-w-2xl">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Settings</h2>
                                
                                <div className="space-y-6">
                                    {/* Appearance */}
                                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                                                <Moon className="w-5 h-5" />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Appearance</h3>
                                        </div>
                                        
                                        <ToggleSwitch
                                            label="Dark Mode"
                                            isChecked={theme === 'dark'}
                                            onChange={(isChecked) => handleThemeChange(isChecked ? 'dark' : 'light')}
                                        />
                                    </div>

                                    {/* AI Settings */}
                                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg text-cyan-600 dark:text-cyan-400">
                                                <RotateCw className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI Tutor</h3>
                                                <p className="text-xs text-slate-500">Customize your learning assistant</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Assistance Level</label>
                                                <span className="text-xs font-bold px-2 py-1 rounded bg-gray-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                                    {aiAssistanceLevel}/10
                                                </span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="10"
                                                value={aiAssistanceLevel}
                                                onChange={(e) => handleAiAssistanceChange(parseInt(e.target.value))}
                                                className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer slider accent-cyan-500"
                                            />
                                            <p className="text-xs text-slate-500">
                                                {aiAssistanceLevel <= 3 ? 'Minimal help. You prefer to solve things on your own.' : 
                                                 aiAssistanceLevel <= 7 ? 'Balanced guidance. Hints when you get stuck.' : 
                                                 'High assistance. Detailed explanations and frequent tips.'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Account Actions */}
                                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
                                                <Shield className="w-5 h-5" />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Danger Zone</h3>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800/30 rounded-xl">
                                                <div>
                                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">Reset Tutorial</h4>
                                                    <p className="text-xs text-slate-500">Restart the onboarding guide</p>
                                                </div>
                                                <button
                                                    onClick={() => setIsResetTutorialModalOpen(true)}
                                                    className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors border border-gray-200 dark:border-slate-700 shadow-sm"
                                                >
                                                    Reset
                                                </button>
                                            </div>

                                            <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/20">
                                                <div>
                                                    <h4 className="font-bold text-red-700 dark:text-red-400 text-sm">Delete Account</h4>
                                                    <p className="text-xs text-red-600/70 dark:text-red-400/70">Permanently remove all data</p>
                                                </div>
                                                <button
                                                    onClick={() => setIsDeleteModalOpen(true)}
                                                    className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors shadow-sm shadow-red-500/20"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60]" onClick={() => !isDeleting && setIsDeleteModalOpen(false)}>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-sm w-full border border-red-500 dark:border-red-700 animate-scale-in" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Delete Account?</h3>
                        </div>

                        <div className="mb-6 space-y-2">
                            <p className="text-gray-700 dark:text-gray-300 text-sm">
                                This action is <strong className="text-red-600 dark:text-red-400">permanent</strong>. All your progress will be lost.
                            </p>
                            
                            <div className="mt-4">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                                    Type <span className="text-red-600">DELETE</span> to confirm
                                </label>
                                <input
                                    type="text"
                                    value={deleteConfirmText}
                                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                                    placeholder="DELETE"
                                    disabled={isDeleting}
                                    className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-red-500 dark:focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setIsDeleteModalOpen(false);
                                    setDeleteConfirmText('');
                                }}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
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

            {isResetTutorialModalOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60]" onClick={() => setIsResetTutorialModalOpen(false)}>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-sm w-full border border-cyan-500 dark:border-cyan-700 animate-scale-in" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                                <RotateCw className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Reset Tutorial?</h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
                            This will restart the interactive onboarding guide. Your progress won't be lost.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsResetTutorialModalOpen(false)}
                                className="flex-1 px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
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

            {user && (
                <UsernameModal
                    isOpen={isUsernameModalOpen}
                    userId={user.id}
                    currentUsername={user.username}
                    isNewUser={false}
                    onClose={() => setIsUsernameModalOpen(false)}
                    onSuccess={async () => {
                        setIsUsernameModalOpen(false);
                        window.location.reload(); // Reload to reflect changes if simple state update isn't enough (or use refreshUser context method if available)
                    }}
                />
            )}
            
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

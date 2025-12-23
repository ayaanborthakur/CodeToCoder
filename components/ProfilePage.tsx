
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../contexts/AuthContext';
import { useProgress } from '../hooks/useProgress';
import { 
    ArrowLeft, Lock, AlertTriangle, RotateCw, Pencil, 
    Settings, Shield, Moon, Award, Layers, BarChart3, Star, Trophy, Layout, Code, Mail, Calendar, LogOut, Zap, FileCode
} from 'lucide-react';
import { getMarketplaceData, getOwnedCollectibles } from '../services/marketplaceService';
import { usePlaygroundFiles } from '../hooks/usePlaygroundFiles';
import { getBadgeColor, getEarnedBadges } from '../services/achievementService';
import { RARITY_COLORS, RARITY_BG_COLORS } from '../data/collectiblesData';
import { resetTutorial } from '../services/tutorialService';
import { getUserSettings, updateUserSettings } from '../services/userSettingsService';
import { Collectible, UserAchievements, BadgeTier } from '../types';
import { ConfirmationModal } from './ConfirmationModal';
import { UsernameModal } from './UsernameModal';

interface ActivityItem {
    id: string;
    type: 'lesson' | 'quiz' | 'badge' | 'coding' | 'other';
    title: string;
    timestamp: number;
    icon: React.ElementType;
    color: string;
    bgColor: string;
}

interface ProfilePageProps {
    stats: { lessons: number; practice: number };
    achievements?: UserAchievements;
    onNavigate: (view: 'home' | 'classroom' | 'playground' | 'practice' | 'mission' | 'about' | 'profile' | 'marketplace' | 'leaderboard' | 'reference') => void;
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
    netWorth?: number;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate, theme, setTheme, stats, netWorth }) => {
    const { user, logout, deleteAccount } = useAuth();
    const { achievements } = useProgress();
    const [collectibles, setCollectibles] = useState<Collectible[]>([]);
    const [starBalance, setStarBalance] = useState(0);
    const [activeTab, setActiveTab] = useState<'stats' | 'badges' | 'collection' | 'settings'>('stats');
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [isResetTutorialModalOpen, setIsResetTutorialModalOpen] = useState(false);
    const [isUsernameModalOpen, setIsUsernameModalOpen] = useState(false);
    const [aiAssistanceLevel, setAiAssistanceLevel] = useState(7);
    const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([]);
    
    const { files: playgroundFiles } = usePlaygroundFiles();

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== 'DELETE') return;
        setIsDeleting(true);
        try {
            await deleteAccount();
            onNavigate('home');
        } catch (error) {
            console.error('Failed to delete account:', error);
            alert('Failed to delete account. You may need to re-authenticate.');
        } finally {
            setIsDeleting(false);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            if (user) {
                try {
                    const marketplaceData = await getMarketplaceData(user.id);
                    setStarBalance(marketplaceData.stars.balance);
                    
                    const owned = await getOwnedCollectibles(user.id);
                    setCollectibles(owned);

                    await getUserSettings(user.id).then(settings => {
                        setAiAssistanceLevel(settings.aiAssistanceLevel);
                    });

                    // Process Activity Feed
                    // Process Activity Feed
                    const transactions = marketplaceData.transactionHistory || [];
                    
                    // Filter and map transactions (Lessons, Quizzes, Badges)
                    const codingTransactions = transactions
                        .filter(t => t.type === 'earn' && (t.reason.startsWith('Completed') || t.reason.startsWith('Earned badge')))
                        .map(t => {
                            let type: ActivityItem['type'] = 'other';
                            let icon = Star;
                            let color = 'text-yellow-500';
                            let bgColor = 'bg-yellow-500/10';
                            
                            if (t.reason.includes('Lesson')) {
                                type = 'lesson';
                                icon = Code;
                                color = 'text-blue-500';
                                bgColor = 'bg-blue-500/10';
                            } else if (t.reason.includes('Quiz')) {
                                type = 'quiz';
                                icon = Zap;
                                color = 'text-purple-500';
                                bgColor = 'bg-purple-500/10';
                            } else if (t.reason.includes('badge')) {
                                type = 'badge';
                                icon = Award;
                                color = 'text-orange-500';
                                bgColor = 'bg-orange-500/10';
                            }

                            return {
                                id: t.id,
                                type,
                                title: t.reason,
                                timestamp: t.timestamp,
                                icon,
                                color,
                                bgColor
                            } as ActivityItem;
                        });

                    // Map Playground Files
                    const codingActivity = playgroundFiles.map(f => ({
                        id: `pg_${f.id}`,
                        type: 'coding' as const,
                        title: `Worked on ${f.name}`,
                        timestamp: f.lastModified,
                        icon: FileCode,
                        color: 'text-green-500',
                        bgColor: 'bg-green-500/10'
                    }));

                    // Merge and Sort
                    const allActivity = [...codingTransactions, ...codingActivity]
                        .sort((a, b) => b.timestamp - a.timestamp)
                        .slice(0, 5); // Show top 5

                    setActivityFeed(allActivity);

                } catch (error) {
                    console.error('Error loading profile data:', error);
                }
            }
        };
        loadData();
    }, [user, playgroundFiles]);

    const handleResetTutorial = async () => {
        if (user) {
            await resetTutorial(user.id);
            window.location.reload();
        }
    };

    if (!user) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-gray-50 dark:bg-gray-900">
                <Lock className="w-16 h-16 text-gray-400 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Sign in to view your profile</h2>
                <button
                    onClick={() => onNavigate('home')}
                    className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                >
                    Back to Home
                </button>
            </div>
        );
    }

    const earnedBadges = getEarnedBadges(achievements);

    return (
        <div className="h-full w-full bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 overflow-y-auto">
            <Helmet>
                <title>Profile - {user.username || user.name}</title>
            </Helmet>

            <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
                {/* Back Button */}
                <button
                    onClick={() => onNavigate('home')}
                    className="flex items-center gap-2 text-gray-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors group mb-4"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium">Back to Home</span>
                </button>

                <div className="grid lg:grid-cols-[380px_1fr] gap-8">
                    {/* Left Column: User Card */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-200 dark:border-gray-700 shadow-xl relative overflow-hidden">
                            {/* Accent Background */}
                            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-cyan-600 to-blue-700 opacity-10 dark:opacity-20" />
                            
                            <div className="relative flex flex-col items-center">
                                {/* Avatar */}
                                <div className="relative group">
                                    <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-5xl font-bold text-white shadow-2xl ring-4 ring-white dark:ring-gray-800 transition-all duration-300">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <button 
                                        onClick={() => setIsUsernameModalOpen(true)}
                                        className="absolute bottom-0 right-0 p-2 bg-white dark:bg-gray-700 rounded-xl shadow-lg border border-gray-100 dark:border-gray-600 hover:scale-110 transition-transform"
                                        style={{ position: 'absolute' }}
                                    >
                                        <Pencil className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                                    </button>
                                </div>

                                <div className="mt-6 text-center space-y-1">
                                    <h2 className="text-3xl font-black tracking-tight">{user.name}</h2>
                                    <p className="text-cyan-600 dark:text-cyan-400 font-bold">@{user.username || 'username'}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 flex items-center justify-center gap-2">
                                        <Mail className="w-3.5 h-3.5" />
                                        {user.email}
                                    </p>
                                </div>

                                {/* Stats Overview Cards */}
                                <div className="grid grid-cols-2 gap-3 w-full mt-8">
                                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700/50 text-center">
                                        <div className="flex items-center justify-center gap-1.5 mb-1">
                                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                            <span className="text-sm font-bold text-gray-500">Stars</span>
                                        </div>
                                        <div className="text-2xl font-black">{starBalance.toLocaleString()}</div>
                                    </div>
                                    <div className="bg-cyan-50 dark:bg-cyan-900/20 p-4 rounded-2xl border border-cyan-100 dark:border-cyan-800/50 text-center">
                                        <div className="flex items-center justify-center gap-1.5 mb-1">
                                            <Trophy className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                                            <span className="text-sm font-bold text-cyan-600/80">Net Worth</span>
                                        </div>
                                        <div className="text-2xl font-black text-cyan-600 dark:text-cyan-400">
                                            {netWorth !== undefined ? (netWorth >= 1000 ? `${(netWorth / 1000).toFixed(1)}k` : netWorth) : '...'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-lg text-center group hover:border-cyan-500/50 transition-colors">
                                <Layout className="w-6 h-6 text-gray-400 mb-3 mx-auto group-hover:text-cyan-500 transition-colors" />
                                <div className="text-2xl font-black">{stats.lessons}</div>
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Lessons</div>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-lg text-center group hover:border-purple-500/50 transition-colors">
                                <Code className="w-6 h-6 text-gray-400 mb-3 mx-auto group-hover:text-purple-500 transition-colors" />
                                <div className="text-2xl font-black">{stats.practice}</div>
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Projects</div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Dynamic Content Tabs */}
                    <div className="space-y-6">
                        {/* Tab Switcher */}
                        <div className="flex p-1.5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-md">
                            {[
                                { id: 'stats', label: 'Overview', icon: BarChart3 },
                                { id: 'badges', label: 'Badges', icon: Award },
                                { id: 'collection', label: 'Collection', icon: Layers },
                                { id: 'settings', label: 'Settings', icon: Settings }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`
                                        flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300
                                        ${activeTab === tab.id 
                                            ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20 translate-y-[-2px]' 
                                            : 'text-gray-500 hover:text-cyan-600 hover:bg-gray-50 dark:hover:bg-gray-700'}
                                    `}
                                >
                                    <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'animate-pulse' : ''}`} />
                                    <span className="hidden sm:inline">{tab.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden min-h-[500px]">
                            {activeTab === 'stats' && (
                                <div className="p-8 space-y-8 animate-fade-in">
                                    <div className="space-y-4">
                                        <h3 className="text-xl font-bold flex items-center gap-2">
                                            <Trophy className="w-5 h-5 text-yellow-500" />
                                            Active Goals
                                        </h3>
                                        <div className="grid gap-4">
                                            <div className="p-5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700 border-l-4 border-l-cyan-500">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <p className="font-bold">Module Master</p>
                                                        <p className="text-sm text-gray-500">Complete logic and loops</p>
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 px-2 py-1 rounded-md">In Progress</span>
                                                </div>
                                                <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <div className="h-full bg-cyan-500 w-[65%]" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recent Activity */}
                                    <div className="space-y-4">
                                        <h3 className="text-xl font-bold flex items-center gap-2 text-gray-400">
                                            <Calendar className="w-5 h-5" />
                                            Recent Activity
                                        </h3>
                                        <div className="space-y-3">
                                            {activityFeed.length > 0 ? (
                                                activityFeed.map((activity) => (
                                                    <div key={activity.id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                                                        <div className={`p-3 rounded-xl ${activity.bgColor}`}>
                                                            <activity.icon className={`w-5 h-5 ${activity.color}`} />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-bold text-gray-900 dark:text-white">{activity.title}</p>
                                                            <p className="text-xs text-gray-500">
                                                                {new Date(activity.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                            </p>
                                                        </div>
                                                        <div className="text-[10px] font-bold px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded text-gray-500 uppercase tracking-wider">
                                                            {activity.type}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-8 text-center bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                                                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                                                        <Code className="w-6 h-6 text-gray-400" />
                                                    </div>
                                                    <p className="text-gray-500 font-medium">No recent coding activity</p>
                                                    <p className="text-xs text-gray-400 mt-1">Complete lessons or write code to see updates here!</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'badges' && (
                                <div className="p-8 animate-fade-in">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                                        {earnedBadges.map((badge) => {
                                            const badgeColor = getBadgeColor(badge.tier as BadgeTier);
                                            return (
                                                <div 
                                                    key={badge.id} 
                                                    className="group relative flex flex-col items-center text-center p-4 rounded-2xl transition-all duration-300 bg-gray-50 dark:bg-gray-900/50 hover:scale-105"
                                                >
                                                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-sm mb-3 group-hover:rotate-12 transition-transform" style={{ backgroundColor: `${badgeColor}15`, color: badgeColor }}>
                                                        <Star className="w-8 h-8" />
                                                    </div>
                                                    <p className="font-bold text-sm truncate w-full">{badge.name}</p>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-1">Earned</span>
                                                </div>
                                            );
                                        })}
                                        {earnedBadges.length === 0 && (
                                            <div className="col-span-full py-20 text-center space-y-4">
                                                <Award className="w-16 h-16 text-gray-300 mx-auto" />
                                                <p className="text-gray-500 font-medium">No badges earned yet. Keep learning to unlock them!</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'collection' && (
                                <div className="p-8 animate-fade-in">
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                        {(collectibles || []).length === 0 ? (
                                            <div className="col-span-full py-20 text-center space-y-4">
                                                <Layers className="w-16 h-16 text-gray-300 mx-auto" />
                                                <p className="text-gray-500 font-medium">No collectibles yet. Grab your first pack in the Marketplace!</p>
                                                <button onClick={() => onNavigate('marketplace')} className="px-6 py-2 bg-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-purple-600/20 transition-all">Go to Marketplace</button>
                                            </div>
                                        ) : (
                                            collectibles.map((item) => (
                                                <div key={item.id} className="group relative rounded-2xl p-0.5 border border-transparent hover:border-cyan-500/30 transition-all hover:translate-y-[-4px] shadow-lg hover:shadow-cyan-500/10 overflow-hidden bg-white dark:bg-slate-800">
                                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300" style={{ backgroundColor: RARITY_COLORS[item.rarity] || '#ccc' }} />
                                                    <div className="relative p-3 space-y-3">
                                                        <div className="aspect-square rounded-xl relative flex items-center justify-center text-4xl shadow-sm transition-transform group-hover:scale-105 duration-300" style={{ backgroundColor: RARITY_BG_COLORS[item.rarity] || '#eee' }}>
                                                            {item.image}
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="font-bold text-sm truncate">{item.name}</p>
                                                            <div className="flex items-center justify-between">
                                                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider" style={{ color: RARITY_COLORS[item.rarity] || '#999', backgroundColor: RARITY_COLORS[item.rarity] ? `${RARITY_COLORS[item.rarity]}15` : '#eee' }}>
                                                                        {item.rarity}
                                                                    </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'settings' && (
                                <div className="p-8 space-y-10 animate-fade-in max-w-2xl">
                                    <div className="space-y-6">
                                        <h3 className="text-xl font-bold flex items-center gap-2">
                                            <Zap className="w-5 h-5 text-yellow-500" />
                                            AI Assistance
                                        </h3>
                                        <div className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-4">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-white">Assistance Level</p>
                                                    <p className="text-xs text-gray-500">
                                                        {aiAssistanceLevel <= 3 ? 'Minimal help, for experts' : 
                                                         aiAssistanceLevel <= 7 ? 'Balanced hints & guidance' : 
                                                         'Maximum support & auto-correction'}
                                                    </p>
                                                </div>
                                                <div className="text-2xl font-black text-cyan-600 dark:text-cyan-400">{aiAssistanceLevel}</div>
                                            </div>
                                            <input 
                                                type="range" 
                                                min="0" 
                                                max="10" 
                                                value={aiAssistanceLevel} 
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value);
                                                    setAiAssistanceLevel(val);
                                                    if (user) updateUserSettings(user.id, { aiAssistanceLevel: val });
                                                }}
                                                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                                            />
                                            <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
                                                <span>Manual</span>
                                                <span>Balanced</span>
                                                <span>Auto</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-6">
                                        <h3 className="text-xl font-bold flex items-center gap-2">
                                            <Layout className="w-5 h-5 text-purple-500" />
                                            Interface
                                        </h3>
                                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                                            <div className="flex items-center gap-3">
                                                <div className="p-3 shadow-md bg-white dark:bg-gray-800 rounded-xl">
                                                    {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Star className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <p className="font-bold">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</p>
                                                    <p className="text-xs text-gray-500">Smooth theme transition</p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                                className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 flex items-center ${theme === 'dark' ? 'bg-cyan-600' : 'bg-gray-300'}`}
                                            >
                                                <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h3 className="text-xl font-bold flex items-center gap-2">
                                            <Shield className="w-5 h-5 text-red-500" />
                                            Danger Zone
                                        </h3>
                                        <div className="space-y-3">
                                            <button
                                                onClick={() => setIsResetTutorialModalOpen(true)}
                                                className="w-full flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/10 rounded-2xl border border-orange-100 dark:border-orange-800/50 text-orange-700 dark:text-orange-400 font-bold hover:bg-orange-100 transition-colors"
                                            >
                                                <span>Restart App Tutorial</span>
                                                <RotateCw className="w-4 h-4" />
                                            </button>
                                            
                                            <div className="p-6 bg-red-50 dark:bg-red-900/10 rounded-3xl border border-red-100 dark:border-red-800/50 space-y-4">
                                                <div className="flex items-center gap-3 text-red-700 dark:text-red-400">
                                                    <AlertTriangle className="w-5 h-5" />
                                                    <span className="font-bold">Delete Account</span>
                                                </div>
                                                <p className="text-sm text-red-600/70 dark:text-red-400/70">Warning: This action is permanent and will delete all your progress, stars, and collectibles.</p>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={deleteConfirmText}
                                                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                                                        placeholder="Type DELETE to confirm"
                                                        className="flex-1 px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border-red-200 dark:border-red-900/30 text-red-900 dark:text-red-100 text-sm focus:ring-red-500 focus:border-red-500"
                                                    />
                                                    <button
                                                        onClick={handleDeleteAccount}
                                                        disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                                                        className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-red-700 transition-colors"
                                                    >
                                                        {isDeleting ? 'Deleting...' : 'Delete'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                                        <button
                                            onClick={() => logout()}
                                            className="flex items-center gap-2 px-6 py-3 text-gray-500 dark:text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl transition-all font-bold group"
                                        >
                                            <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <UsernameModal
                isOpen={isUsernameModalOpen}
                userId={user.id}
                onClose={() => setIsUsernameModalOpen(false)}
                onSuccess={() => {}}
            />

            <ConfirmationModal
                isOpen={isResetTutorialModalOpen}
                onClose={() => setIsResetTutorialModalOpen(false)}
                onConfirm={handleResetTutorial}
                title="Restart Tutorial?"
                message="This will guide you through the application again. Your progress will not be lost."
            />

            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.4s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

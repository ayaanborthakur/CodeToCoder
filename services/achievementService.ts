import type { Badge, BadgeType, BadgeTier, UserAchievements } from '../types';

// Badge icon mapping
export const BADGE_ICONS: Record<string, string> = {
    // Lesson badges
    'lesson_bronze': '📚',
    'lesson_silver': '📖',
    'lesson_gold': '🎓',
    'lesson_platinum': '👨‍🎓',
    // Practice badges
    'practice_bronze': '💪',
    'practice_silver': '🏋️',
    'practice_gold': '🏆',
    // Quiz badges
    'quiz_bronze': '❓',
    'quiz_silver': '🧠',
    'quiz_gold': '💡',
    // Project badges
    'project_bronze': '🔨',
    'project_silver': '🏗️',
    'project_gold': '🏛️',
    // Streak badges
    'streak_bronze': '🔥',
    'streak_silver': '🔥',
    'streak_gold': '🔥',
    'streak_platinum': '🔥',
    'streak_legend': '👑',
    // Collection badges
    'collection_bronze': '⭐',
    'collection_silver': '⭐',
    'collection_gold': '💰',
    'collection_platinum': '👑',
    // Special badges
    'early_bird': '🌅',
    'night_owl': '🦉',
    'perfect_score': '🎯',
    'speed_demon': '🚀',
    'module_graduate': '🎓',
    'python_master': '🐍',
    'code2code_master': '🌟',
};

// Define all available badges
export const BADGES: Badge[] = [
    // ============ LESSON BADGES ============
    {
        id: 'lesson_bronze',
        name: 'First Steps',
        description: 'Complete 5 lessons',
        type: 'lesson',
        tier: 'bronze',
        requirement: 5,
        icon: '📚'
    },
    {
        id: 'lesson_silver',
        name: 'Learning Path',
        description: 'Complete 15 lessons',
        type: 'lesson',
        tier: 'silver',
        requirement: 15,
        icon: '📖'
    },
    {
        id: 'lesson_gold',
        name: 'Knowledge Seeker',
        description: 'Complete 30 lessons',
        type: 'lesson',
        tier: 'gold',
        requirement: 30,
        icon: '🎓'
    },
    {
        id: 'lesson_platinum',
        name: 'Master Student',
        description: 'Complete all lessons',
        type: 'lesson',
        tier: 'platinum',
        requirement: 999, // Will be updated dynamically
        icon: '👨‍🎓'
    },

    // ============ PRACTICE BADGES ============
    {
        id: 'practice_bronze',
        name: 'Practice Starter',
        description: 'Complete 3 practice problems',
        type: 'practice',
        tier: 'bronze',
        requirement: 3,
        icon: '💪'
    },
    {
        id: 'practice_silver',
        name: 'Problem Solver',
        description: 'Complete 10 practice problems',
        type: 'practice',
        tier: 'silver',
        requirement: 10,
        icon: '🏋️'
    },
    {
        id: 'practice_gold',
        name: 'Practice Expert',
        description: 'Complete 25 practice problems',
        type: 'practice',
        tier: 'gold',
        requirement: 25,
        icon: '🏆'
    },

    // ============ QUIZ BADGES ============
    {
        id: 'quiz_bronze',
        name: 'Quiz Novice',
        description: 'Complete 3 quizzes',
        type: 'quiz',
        tier: 'bronze',
        requirement: 3,
        icon: '❓'
    },
    {
        id: 'quiz_silver',
        name: 'Quiz Master',
        description: 'Complete 10 quizzes',
        type: 'quiz',
        tier: 'silver',
        requirement: 10,
        icon: '🧠'
    },
    {
        id: 'quiz_gold',
        name: 'Quiz Champion',
        description: 'Complete 20 quizzes',
        type: 'quiz',
        tier: 'gold',
        requirement: 20,
        icon: '💡'
    },

    // ============ PROJECT BADGES ============
    {
        id: 'project_bronze',
        name: 'Project Starter',
        description: 'Complete 1 project',
        type: 'project',
        tier: 'bronze',
        requirement: 1,
        icon: '🔨'
    },
    {
        id: 'project_silver',
        name: 'Project Builder',
        description: 'Complete 3 projects',
        type: 'project',
        tier: 'silver',
        requirement: 3,
        icon: '🏗️'
    },
    {
        id: 'project_gold',
        name: 'Project Master',
        description: 'Complete 5 projects',
        type: 'project',
        tier: 'gold',
        requirement: 5,
        icon: '🏛️'
    },

    // ============ STREAK BADGES ============
    {
        id: 'streak_bronze',
        name: 'Hot Streak',
        description: 'Maintain a 3-day coding streak',
        type: 'streak',
        tier: 'bronze',
        requirement: 3,
        icon: '🔥'
    },
    {
        id: 'streak_silver',
        name: 'On Fire',
        description: 'Maintain a 7-day coding streak',
        type: 'streak',
        tier: 'silver',
        requirement: 7,
        icon: '🔥'
    },
    {
        id: 'streak_gold',
        name: 'Unstoppable',
        description: 'Maintain a 14-day coding streak',
        type: 'streak',
        tier: 'gold',
        requirement: 14,
        icon: '🔥'
    },
    {
        id: 'streak_platinum',
        name: 'Marathon Coder',
        description: 'Maintain a 30-day coding streak',
        type: 'streak',
        tier: 'platinum',
        requirement: 30,
        icon: '🔥'
    },
    {
        id: 'streak_legend',
        name: 'Coding Legend',
        description: 'Maintain a 100-day coding streak',
        type: 'streak',
        tier: 'platinum',
        requirement: 100,
        icon: '👑'
    },

    // ============ COLLECTION (STARS) BADGES ============
    {
        id: 'collection_bronze',
        name: 'Star Collector',
        description: 'Earn 100 total stars',
        type: 'collection',
        tier: 'bronze',
        requirement: 100,
        icon: '⭐'
    },
    {
        id: 'collection_silver',
        name: 'Star Hoarder',
        description: 'Earn 500 total stars',
        type: 'collection',
        tier: 'silver',
        requirement: 500,
        icon: '⭐'
    },
    {
        id: 'collection_gold',
        name: 'Star Millionaire',
        description: 'Earn 1,000 total stars',
        type: 'collection',
        tier: 'gold',
        requirement: 1000,
        icon: '💰'
    },
    {
        id: 'collection_platinum',
        name: 'Star Emperor',
        description: 'Earn 5,000 total stars',
        type: 'collection',
        tier: 'platinum',
        requirement: 5000,
        icon: '👑'
    },

    // ============ SPECIAL BADGES ============
    {
        id: 'module_graduate',
        name: 'Module Graduate',
        description: 'Complete all lessons in any module',
        type: 'special',
        tier: 'silver',
        requirement: 1,
        icon: '🎓'
    },
    {
        id: 'speed_demon',
        name: 'Speed Demon',
        description: 'Complete 5 lessons in a single day',
        type: 'special',
        tier: 'gold',
        requirement: 5,
        icon: '🚀'
    },
    {
        id: 'python_master',
        name: 'Python Master',
        description: 'Complete all 12 modules',
        type: 'special',
        tier: 'platinum',
        requirement: 12,
        icon: '🐍'
    },

    // ============ ULTIMATE BADGE ============
    {
        id: 'code2code_master',
        name: 'Code2Coder Master',
        description: 'Earn all other badges',
        type: 'special',
        tier: 'platinum',
        requirement: 0, // Handled programmatically
        icon: '🌟'
    }
];

// Get badge tier color
export const getBadgeColor = (tier: BadgeTier): string => {
    switch (tier) {
        case 'bronze': return '#CD7F32';
        case 'silver': return '#C0C0C0';
        case 'gold': return '#FFD700';
        case 'platinum': return '#E5E4E2';
    }
};

// Get badge tier gradient
export const getBadgeGradient = (tier: BadgeTier): string => {
    switch (tier) {
        case 'bronze': return 'linear-gradient(135deg, #CD7F32 0%, #A0522D 100%)';
        case 'silver': return 'linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%)';
        case 'gold': return 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)';
        case 'platinum': return 'linear-gradient(135deg, #E5E4E2 0%, #B8B8B8 100%)';
    }
};

// Get badge icon
export const getBadgeIcon = (badgeId: string): string => {
    return BADGE_ICONS[badgeId] || '🏅';
};

// Extended stats interface for badge checking
export interface BadgeCheckStats {
    lessonsCompleted: number;
    practiceCompleted: number;
    quizzesCompleted: number;
    projectsCompleted: number;
    totalLessons?: number;
    currentStreak?: number;
    longestStreak?: number;
    totalStarsEarned?: number;
    modulesCompleted?: number;
    lessonsCompletedToday?: number;
}

// Check for newly earned badges
export const checkAndAwardBadges = (
    currentAchievements: UserAchievements | undefined,
    stats: BadgeCheckStats
): { newBadges: Badge[]; updatedAchievements: UserAchievements } => {
    const earnedBadgeIds = currentAchievements?.earnedBadgeIds || (currentAchievements as any)?.earnedBadges || [];
    const newlyEarnedBadges: Badge[] = [];

    // Determine the actual platinum requirement - use a LOCAL variable, NOT mutation of global BADGES!
    let platinumRequirement = 999; // Default to very high
    if (stats.totalLessons && stats.totalLessons > 10) {
        platinumRequirement = stats.totalLessons;
    }
    
    console.log('[BadgeService] Badge check starting:', {
        lessonsCompleted: stats.lessonsCompleted,
        practiceCompleted: stats.practiceCompleted,
        quizzesCompleted: stats.quizzesCompleted,
        projectsCompleted: stats.projectsCompleted,
        currentStreak: stats.currentStreak,
        totalStarsEarned: stats.totalStarsEarned,
        totalLessons: stats.totalLessons,
        existingBadges: earnedBadgeIds.length
    });

    // Check each badge
    for (const badge of BADGES) {
        // Skip if already earned
        if (earnedBadgeIds.includes(badge.id)) continue;
        
        // Skip code2code_master - it has special logic handled separately below
        if (badge.id === 'code2code_master') continue;

        let count = 0;
        let requirement = badge.requirement;
        
        // Use dynamic local requirement for platinum lesson badge
        if (badge.id === 'lesson_platinum') {
            requirement = platinumRequirement;
        }
        
        switch (badge.type) {
            case 'lesson':
                count = stats.lessonsCompleted;
                break;
            case 'practice':
                count = stats.practiceCompleted;
                break;
            case 'quiz':
                count = stats.quizzesCompleted;
                break;
            case 'project':
                count = stats.projectsCompleted;
                break;
            case 'streak':
                // Use the higher of current or longest streak
                count = Math.max(stats.currentStreak || 0, stats.longestStreak || 0);
                break;
            case 'collection':
                count = stats.totalStarsEarned || 0;
                break;
            case 'special':
                // Special badges have custom logic
                if (badge.id === 'module_graduate') {
                    count = stats.modulesCompleted || 0;
                } else if (badge.id === 'speed_demon') {
                    count = stats.lessonsCompletedToday || 0;
                } else if (badge.id === 'python_master') {
                    count = stats.modulesCompleted || 0;
                }
                break;
        }

        // Award badge if requirement is met
        if (count >= requirement) {
            console.log(`[BadgeService] Awarding badge: ${badge.id} (count: ${count} >= requirement: ${requirement})`);
            newlyEarnedBadges.push(badge);
            earnedBadgeIds.push(badge.id);
        }
    }

    // After awarding regular badges, check for master badge
    const regularBadges = BADGES.filter(b => b.id !== 'code2code_master' && b.id !== 'streak_legend' && b.id !== 'python_master');
    const hasAllRegular = regularBadges.length > 0 &&
        regularBadges.every(b => earnedBadgeIds.includes(b.id));
    if (hasAllRegular && !earnedBadgeIds.includes('code2code_master')) {
        const masterBadge = BADGES.find(b => b.id === 'code2code_master');
        if (masterBadge) {
            newlyEarnedBadges.push(masterBadge);
            earnedBadgeIds.push(masterBadge.id);
        }
    }

    return {
        newBadges: newlyEarnedBadges,
        updatedAchievements: {
            earnedBadgeIds: earnedBadgeIds,
            totalPoints: currentAchievements?.totalPoints || 0,
            lastUpdated: Date.now()
        }
    };
};

// Get earned badges
export const getEarnedBadges = (achievements: UserAchievements | undefined): Badge[] => {
    if (!achievements) return [];
    // Handle both new and old property names for backward compatibility
    const earnedIds = achievements.earnedBadgeIds || (achievements as any).earnedBadges || [];
    return BADGES.filter(badge => earnedIds.includes(badge.id));
};

// Get all badges (for display, showing locked/unlocked state)
export const getAllBadges = (): Badge[] => {
    return BADGES;
};

// Get progress toward next badge for a specific type
export const getBadgeProgress = (
    badgeType: BadgeType,
    currentCount: number,
    earnedBadgeIds: string[]
): { nextBadge: Badge | null; progress: number; current: number; required: number } => {
    // Get all badges of this type, sorted by requirement
    const typeBadges = BADGES
        .filter(b => b.type === badgeType)
        .sort((a, b) => a.requirement - b.requirement);

    // Find the next unearned badge
    const nextBadge = typeBadges.find(badge => !earnedBadgeIds.includes(badge.id));

    if (!nextBadge) {
        return { nextBadge: null, progress: 100, current: currentCount, required: currentCount };
    }

    const progress = Math.min(100, (currentCount / nextBadge.requirement) * 100);

    return {
        nextBadge,
        progress,
        current: currentCount,
        required: nextBadge.requirement
    };
};

// Get all badges grouped by type
export const getBadgesByType = (): Record<BadgeType, Badge[]> => {
    return {
        lesson: BADGES.filter(b => b.type === 'lesson'),
        practice: BADGES.filter(b => b.type === 'practice'),
        quiz: BADGES.filter(b => b.type === 'quiz'),
        project: BADGES.filter(b => b.type === 'project'),
        streak: BADGES.filter(b => b.type === 'streak'),
        collection: BADGES.filter(b => b.type === 'collection'),
        special: BADGES.filter(b => b.type === 'special')
    };
};

// Get badge category display info
export const BADGE_CATEGORIES: Record<BadgeType, { label: string; icon: string; color: string }> = {
    lesson: { label: 'Learning', icon: '📚', color: '#3B82F6' },
    practice: { label: 'Practice', icon: '💪', color: '#10B981' },
    quiz: { label: 'Quizzes', icon: '🧠', color: '#8B5CF6' },
    project: { label: 'Projects', icon: '🏗️', color: '#F59E0B' },
    streak: { label: 'Streaks', icon: '🔥', color: '#EF4444' },
    collection: { label: 'Collection', icon: '⭐', color: '#FBBF24' },
    special: { label: 'Special', icon: '✨', color: '#EC4899' }
};

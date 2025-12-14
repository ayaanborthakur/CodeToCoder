import type { Badge, BadgeType, BadgeTier, UserAchievements } from '../types';

// Define all available badges
export const BADGES: Badge[] = [
    // Learn (Reading) Badges
    {
        id: 'learn_bronze',
        name: 'Curious Reader',
        description: 'Complete 3 learn lessons',
        type: 'learn',
        tier: 'bronze',
        requirement: 3
    },
    {
        id: 'learn_silver',
        name: 'Studious Reader',
        description: 'Complete 10 learn lessons',
        type: 'learn',
        tier: 'silver',
        requirement: 10
    },
    {
        id: 'learn_gold',
        name: 'Scholar',
        description: 'Complete 25 learn lessons',
        type: 'learn',
        tier: 'gold',
        requirement: 25
    },
    {
        id: 'learn_platinum',
        name: 'Grand Scholar',
        description: 'Complete all learn lessons',
        type: 'learn',
        tier: 'platinum',
        requirement: 999 
    },

    // Coding (Practice) Badges
    {
        id: 'coding_bronze',
        name: 'Code Explorer',
        description: 'Complete 3 coding lessons',
        type: 'coding',
        tier: 'bronze',
        requirement: 3
    },
    {
        id: 'coding_silver',
        name: 'Code Builder',
        description: 'Complete 10 coding lessons',
        type: 'coding',
        tier: 'silver',
        requirement: 10
    },
    {
        id: 'coding_gold',
        name: 'Code Architect',
        description: 'Complete 25 coding lessons',
        type: 'coding',
        tier: 'gold',
        requirement: 25
    },
    {
        id: 'coding_platinum',
        name: 'Code Master',
        description: 'Complete all coding lessons',
        type: 'coding',
        tier: 'platinum',
        requirement: 999 
    },

    // Practice Badges
    {
        id: 'practice_bronze',
        name: 'Practice Starter',
        description: 'Complete 3 practice problems',
        type: 'practice',
        tier: 'bronze',
        requirement: 3
    },
    {
        id: 'practice_silver',
        name: 'Problem Solver',
        description: 'Complete 10 practice problems',
        type: 'practice',
        tier: 'silver',
        requirement: 10
    },
    {
        id: 'practice_gold',
        name: 'Practice Expert',
        description: 'Complete 25 practice problems',
        type: 'practice',
        tier: 'gold',
        requirement: 25
    },

    // Quiz Badges
    {
        id: 'quiz_bronze',
        name: 'Quiz Novice',
        description: 'Complete 3 quizzes',
        type: 'quiz',
        tier: 'bronze',
        requirement: 3
    },
    {
        id: 'quiz_silver',
        name: 'Quiz Master',
        description: 'Complete 10 quizzes',
        type: 'quiz',
        tier: 'silver',
        requirement: 10
    },
    {
        id: 'quiz_gold',
        name: 'Quiz Champion',
        description: 'Complete 20 quizzes',
        type: 'quiz',
        tier: 'gold',
        requirement: 20
    },

    // Project Badges
    {
        id: 'project_bronze',
        name: 'Project Starter',
        description: 'Complete 1 project',
        type: 'project',
        tier: 'bronze',
        requirement: 1
    },
    {
        id: 'project_silver',
        name: 'Project Builder',
        description: 'Complete 3 projects',
        type: 'project',
        tier: 'silver',
        requirement: 3
    },
    {
        id: 'project_gold',
        name: 'Project Master',
        description: 'Complete 5 projects',
        type: 'project',
        tier: 'gold',
        requirement: 5
    },
    // Master badge – unlocked when all other badges are earned
    {
        id: 'code2code_master',
        name: 'Code2Code Master',
        description: 'Earn all other badges',
        type: 'project',
        tier: 'platinum',
        requirement: 0 // handled programmatically
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

// Check for newly earned badges
export const checkAndAwardBadges = (
    currentAchievements: UserAchievements | undefined,
    stats: {
        learnCompleted: number;
        codingCompleted: number;
        practiceCompleted: number;
        quizzesCompleted: number;
        projectsCompleted: number;
        totalLearn?: number;
        totalCoding?: number;
    }
): { newBadges: Badge[]; updatedAchievements: UserAchievements } => {
    const earnedBadgeIds = currentAchievements?.earnedBadgeIds || (currentAchievements as any)?.earnedBadges || [];
    const newlyEarnedBadges: Badge[] = [];

    // Check each badge
    for (const badge of BADGES) {
        // Skip if already earned
        if (earnedBadgeIds.includes(badge.id)) continue;

        // Skip legacy lesson badges to prevent confusion
        // Only new learn/coding badges should be awarded now
        if (badge.type === 'lesson') continue;

        let count = 0;
        let requirement = badge.requirement;

        switch (badge.type) {
            case 'learn':
                count = stats.learnCompleted;
                if (badge.tier === 'platinum') {
                    // Only use dynamic requirement if total count is valid and substantial
                    if (stats.totalLearn && stats.totalLearn > 5) {
                        requirement = stats.totalLearn;
                    } else {
                        // If total is unknown or small, fallback to a safe high number or don't award
                        requirement = 999;
                    }
                }
                break;
            case 'coding':
                count = stats.codingCompleted;
                if (badge.tier === 'platinum') {
                    if (stats.totalCoding && stats.totalCoding > 5) {
                        requirement = stats.totalCoding;
                    } else {
                        requirement = 999;
                    }
                }
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
        }

        // Fix: Ensure we don't mistakenly award platinum for 0/0 or 1/1 cases if totals are weird
        if (badge.tier === 'platinum' && count < 5) {
             // Hard fail for low counts on platinum
             continue;
        }

        // Award badge if requirement is met
        if (count >= requirement && requirement > 0) {
            console.log(`[Badges] Awarding badge: ${badge.name} (${badge.id}). Count: ${count}, Req: ${requirement}`);
            newlyEarnedBadges.push(badge);
            earnedBadgeIds.push(badge.id);
        }
    }

    // After awarding regular badges, check for Master badge ('code2code_master')
    // Logic: Must have all badges EXCEPT master, and at least one other badge
    // Filter out legacy 'lesson' badges from the requirement since they are no longer attainable or relevant
    const relevantBadges = BADGES.filter(b => b.id !== 'code2code_master' && b.type !== 'lesson');
    const relevantBadgeIds = relevantBadges.map(b => b.id);
    
    const hasAllRelevant = relevantBadgeIds.length > 0 &&
        relevantBadgeIds.every(id => earnedBadgeIds.includes(id));

    if (hasAllRelevant && !earnedBadgeIds.includes('code2code_master')) {
        const masterBadge = BADGES.find(b => b.id === 'code2code_master');
        if (masterBadge) {
             console.log(`[Badges] Awarding Master Badge!`);
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
        learn: BADGES.filter(b => b.type === 'learn'),
        coding: BADGES.filter(b => b.type === 'coding'),
        lesson: BADGES.filter(b => b.type === 'lesson'), // For legacy
        practice: BADGES.filter(b => b.type === 'practice'),
        quiz: BADGES.filter(b => b.type === 'quiz'),
        project: BADGES.filter(b => b.type === 'project')
    };
};

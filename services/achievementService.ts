import type { Badge, BadgeType, BadgeTier, UserAchievements } from '../types';

// Define all available badges
export const BADGES: Badge[] = [
    // Lesson Badges
    {
        id: 'lesson_bronze',
        name: 'First Steps',
        description: 'Complete 5 lessons',
        type: 'lesson',
        tier: 'bronze',
        requirement: 5
    },
    {
        id: 'lesson_silver',
        name: 'Learning Path',
        description: 'Complete 10 lessons',
        type: 'lesson',
        tier: 'silver',
        requirement: 10
    },
    {
        id: 'lesson_gold',
        name: 'Knowledge Seeker',
        description: 'Complete 20 lessons',
        type: 'lesson',
        tier: 'gold',
        requirement: 20
    },
    {
        id: 'lesson_platinum',
        name: 'Master Student',
        description: 'Complete all lessons',
        type: 'lesson',
        tier: 'platinum',
        requirement: 999 // Will be updated dynamically
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
        lessonsCompleted: number;
        practiceCompleted: number;
        quizzesCompleted: number;
        projectsCompleted: number;
        totalLessons?: number;
    }
): { newBadges: Badge[]; updatedAchievements: UserAchievements } => {
    const earnedBadgeIds = currentAchievements?.earnedBadgeIds || (currentAchievements as any)?.earnedBadges || [];
    const newlyEarnedBadges: Badge[] = [];

    // Update platinum lesson requirement if total lessons is known
    const lessonPlatinumBadge = BADGES.find(b => b.id === 'lesson_platinum');
    if (lessonPlatinumBadge && stats.totalLessons) {
        lessonPlatinumBadge.requirement = stats.totalLessons;
    }

    // Check each badge
    for (const badge of BADGES) {
        // Skip if already earned
        if (earnedBadgeIds.includes(badge.id)) continue;

        let count = 0;
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
        }

        // Award badge if requirement is met
        if (count >= badge.requirement) {
            newlyEarnedBadges.push(badge);
            earnedBadgeIds.push(badge.id);
        }
    }

    // After awarding regular badges, check for master badge
    const allOtherBadgeIds = BADGES.filter(b => b.id !== 'code2code_master').map(b => b.id);
    // Only award master badge if user has earned ALL other badges (and has at least one badge)
    const hasAllOthers = allOtherBadgeIds.length > 0 &&
        allOtherBadgeIds.every(id => earnedBadgeIds.includes(id));
    if (hasAllOthers && !earnedBadgeIds.includes('code2code_master')) {
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
        project: BADGES.filter(b => b.type === 'project')
    };
};

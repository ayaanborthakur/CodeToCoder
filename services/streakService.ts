/**
 * Streak Service
 * Tracks consecutive days of user activity for gamification
 */

import { getStarsData, saveStarsData } from './marketplaceService';

/**
 * Get today's date in YYYY-MM-DD format
 */
const getTodayString = (): string => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

/**
 * Get yesterday's date in YYYY-MM-DD format
 */
const getYesterdayString = (): string => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
};

/**
 * Update streak when user performs an activity
 * Should be called on lesson completion, quiz completion, etc.
 * @returns The updated streak count
 */
export const updateStreak = async (userId: string): Promise<{ currentStreak: number; longestStreak: number; isNewDay: boolean }> => {
    if (!userId) {
        return { currentStreak: 0, longestStreak: 0, isNewDay: false };
    }

    const starsData = await getStarsData(userId);
    const today = getTodayString();
    const yesterday = getYesterdayString();
    
    // Initialize streak fields if they don't exist
    if (!starsData.lastActiveDate) {
        starsData.lastActiveDate = '';
        starsData.currentStreak = 0;
        starsData.longestStreak = 0;
    }

    let isNewDay = false;

    // Already active today, no change needed
    if (starsData.lastActiveDate === today) {
        return { 
            currentStreak: starsData.currentStreak, 
            longestStreak: starsData.longestStreak,
            isNewDay: false 
        };
    }

    // Active yesterday, continue streak
    if (starsData.lastActiveDate === yesterday) {
        starsData.currentStreak += 1;
        isNewDay = true;
    } 
    // First activity ever or streak broken
    else {
        starsData.currentStreak = 1;
        isNewDay = starsData.lastActiveDate !== '';
    }

    // Update longest streak if needed
    if (starsData.currentStreak > starsData.longestStreak) {
        starsData.longestStreak = starsData.currentStreak;
    }

    starsData.lastActiveDate = today;
    await saveStarsData(userId, starsData);

    return { 
        currentStreak: starsData.currentStreak, 
        longestStreak: starsData.longestStreak,
        isNewDay 
    };
};

/**
 * Get current streak info without updating
 */
export const getStreakInfo = async (userId: string): Promise<{ currentStreak: number; longestStreak: number; isActiveToday: boolean }> => {
    if (!userId) {
        return { currentStreak: 0, longestStreak: 0, isActiveToday: false };
    }

    const starsData = await getStarsData(userId);
    const today = getTodayString();
    const yesterday = getYesterdayString();

    // Initialize defaults if not present
    const currentStreak = starsData.currentStreak || 0;
    const longestStreak = starsData.longestStreak || 0;
    const lastActiveDate = starsData.lastActiveDate || '';

    // Check if streak is still valid
    if (lastActiveDate === today) {
        return { currentStreak, longestStreak, isActiveToday: true };
    }
    
    if (lastActiveDate === yesterday) {
        // Streak continues if they act today
        return { currentStreak, longestStreak, isActiveToday: false };
    }

    // Streak is broken (more than 1 day since last activity)
    return { currentStreak: 0, longestStreak, isActiveToday: false };
};

/**
 * Award bonus stars for streak milestones
 * Call this after updateStreak to check for bonuses
 */
export const STREAK_MILESTONES = [
    { days: 3, bonus: 25, name: '3-Day Streak' },
    { days: 7, bonus: 75, name: 'Week Warrior' },
    { days: 14, bonus: 150, name: 'Two Week Titan' },
    { days: 30, bonus: 500, name: 'Monthly Master' },
    { days: 100, bonus: 2000, name: 'Century Coder' },
];

export const checkStreakMilestone = (currentStreak: number): { bonus: number; name: string } | null => {
    // Find the exact milestone hit (if any)
    const milestone = STREAK_MILESTONES.find(m => m.days === currentStreak);
    return milestone ? { bonus: milestone.bonus, name: milestone.name } : null;
};

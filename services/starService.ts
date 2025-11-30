import type { UserStars, StarTransaction, Difficulty } from '../types';
import { getMarketplaceData, addStars, spendStars } from './marketplaceService';

// Star reward base amounts (one-time only per activity)
const STAR_REWARDS = {
    lesson: 3,
    quiz: 7,
    practice: 5,
    project: 7,
    badge: 30,
    dailyChallenge: 25
};

/**
 * Calculate star reward based on activity type
 * Note: Difficulty multipliers removed - all rewards are flat amounts
 */
export const calculateStarReward = (
    activityType: keyof typeof STAR_REWARDS
): number => {
    return STAR_REWARDS[activityType];
};

/**
 * Get user's star data
 * @deprecated Use getMarketplaceData instead
 */
export const getStarData = async (userId: string): Promise<UserStars> => {
    const data = await getMarketplaceData(userId);
    return data.stars;
};

/**
 * Get transaction history
 */
export const getTransactionHistory = async (userId: string, limit: number = 50): Promise<StarTransaction[]> => {
    const data = await getMarketplaceData(userId);
    return data.transactionHistory.slice(0, limit);
};


/**
 * Award stars to user
 */
export const awardStars = async (
    userId: string,
    amount: number,
    reason: string
): Promise<UserStars> => {
    await addStars(userId, amount, reason);

    // Return updated data
    const data = await getMarketplaceData(userId);
    return data.stars;
};

/**
 * Award stars for completing an activity (one-time only)
 * Returns whether stars were awarded and the amount
 */
export const awardStarsForActivity = async (
    userId: string,
    activityType: 'lesson' | 'quiz' | 'practice',
    activityId: string
): Promise<{ awarded: boolean, amount: number, reason: string }> => {
    const data = await getMarketplaceData(userId);

    // Determine the correct array based on activity type
    const completedArray = activityType === 'lesson' ? data.completedActivities.lessons :
        activityType === 'quiz' ? data.completedActivities.quizzes :
            data.completedActivities.practice;

    // Check if already completed
    if (completedArray.includes(activityId)) {
        return {
            awarded: false,
            amount: 0,
            reason: `${activityType} already completed`
        };
    }

    // Calculate reward amount
    const amount = calculateStarReward(activityType);
    const reason = `Completed ${activityType}: ${activityId}`;

    // Award stars
    await addStars(userId, amount, reason);

    // Mark as completed
    completedArray.push(activityId);

    // Save updated data
    const updatedData = await getMarketplaceData(userId);
    updatedData.completedActivities = data.completedActivities;
    await import('./marketplaceService').then(m => m.saveMarketplaceData(userId, updatedData));

    return { awarded: true, amount, reason };
};

/** * Get star balance */
export const getStarBalance = async (userId: string): Promise<number> => {
    const data = await getMarketplaceData(userId);
    return data.stars.balance;
};

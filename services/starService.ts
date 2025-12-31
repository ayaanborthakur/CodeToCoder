import type { UserStars, StarTransaction } from '../types';
import { getMarketplaceData, addStars, getStarsData, calculateStarReward, STAR_REWARDS } from './marketplaceService';

/**
 * Get user's star data
 */
export const getStarData = async (userId: string): Promise<UserStars> => {
    const data = await getStarsData(userId);
    return {
        balance: data.balance,
        totalEarned: data.totalEarned,
        totalSpent: data.totalSpent,
        lastUpdated: data.lastUpdated
    };
};

/**
 * Get transaction history
 */
export const getTransactionHistory = async (userId: string, limit: number = 50): Promise<StarTransaction[]> => {
    const data = await getStarsData(userId);
    return (data.transactionHistory || []).slice(0, limit);
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
    return await getStarData(userId);
};

/**
 * Award stars for completing an activity (one-time only)
 * Returns whether stars were awarded and the amount
 */
export const awardStarsForActivity = async (
    userId: string,
    activityType: 'lesson' | 'quiz' | 'practice' | 'project',
    activityId: string
): Promise<{ awarded: boolean, amount: number, reason: string }> => {
    const { loadClassroomProgress, loadPracticeProgress, syncClassroomProgress, syncPracticeProgress, loadAchievements } = await import('./userDataService');

    let isAlreadyRewarded = false;
    let rewardType = activityType;

    // Quizzes in modules are often passed as 'lesson' type in App.tsx but should be rewarded as 'quiz'
    // However, for consistency with tracking, we follow the storage structure
    
    if (activityType === 'lesson' || activityType === 'quiz') {
        const classroomData = await loadClassroomProgress(userId);
        const rewardedLessons = classroomData?.rewardedLessons || [];
        if (rewardedLessons.includes(activityId)) {
            isAlreadyRewarded = true;
        } else {
            // Update rewarded set in classroom progress
            const achievements = await loadAchievements(userId);
            await syncClassroomProgress(
                userId, 
                classroomData?.completedLessons || [], 
                achievements || undefined, 
                [...rewardedLessons, activityId]
            );
        }
    } else {
        // Practice types (quiz, problem, project)
        // We need to determine the correct sub-category for storage
        const { contentService } = await import('./contentService');
        const practiceItem = await contentService.getPracticeItem(activityId);
        
        let category: 'PracticeQuizzes' | 'PracticeProblems' | 'PracticeProjects' = 'PracticeProblems';
        if (practiceItem?.type === 'quiz') category = 'PracticeQuizzes';
        if (practiceItem?.type === 'project') {
            category = 'PracticeProjects';
            rewardType = 'project'; // Higher reward for projects
        }

        const practiceData = await loadPracticeProgress(userId, category);
        const rewardedItems = practiceData?.rewardedItems || [];
        
        if (rewardedItems.includes(activityId)) {
            isAlreadyRewarded = true;
        } else {
            // Update rewarded set in practice progress
            await syncPracticeProgress(
                userId,
                category,
                practiceData?.completed || [],
                [...rewardedItems, activityId]
            );
        }
    }

    if (isAlreadyRewarded) {
        return {
            awarded: false,
            amount: 0,
            reason: `${activityType} already awarded stars`
        };
    }

    // Calculate reward amount
    const amount = calculateStarReward(rewardType as keyof typeof STAR_REWARDS);
    const reason = `Completed ${activityType}: ${activityId}`;

    // Award stars via marketplaceService
    await addStars(userId, amount, reason);

    return { awarded: true, amount, reason };
};

/** * Get star balance */
export const getStarBalance = async (userId: string): Promise<number> => {
    const data = await getMarketplaceData(userId);
    return data.stars.balance;
};

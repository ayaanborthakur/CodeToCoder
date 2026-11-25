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
    const { loadClassroomProgress, loadPracticeProgress } = await import('./userDataService');
    const { setDoc, arrayUnion } = await import('firebase/firestore');
    const { userPaths } = await import('./firestorePathHelper');

    let isAlreadyRewarded = false;
    let rewardType = activityType;

    // Only the "rewarded" marker is written, with arrayUnion. Writing the whole
    // progress document back (as this used to) raced with the lesson being
    // marked complete at the same moment and could erase that completion.
    if (activityType === 'lesson' || activityType === 'quiz') {
        const classroomData = await loadClassroomProgress(userId);
        if ((classroomData?.rewardedLessons || []).includes(activityId)) {
            isAlreadyRewarded = true;
        } else {
            await setDoc(userPaths.progress.classroom(userId), { rewardedLessons: arrayUnion(activityId) }, { merge: true });
        }
    } else {
        // Practice types (quiz, problem, project) are stored per category.
        const { contentService } = await import('./contentService');
        const practiceItem = await contentService.getPracticeItem(activityId);

        let category: 'PracticeQuizzes' | 'PracticeProblems' | 'PracticeProjects' = 'PracticeProblems';
        if (practiceItem?.type === 'quiz') category = 'PracticeQuizzes';
        if (practiceItem?.type === 'project') {
            category = 'PracticeProjects';
            rewardType = 'project'; // Higher reward for projects
        }

        const practiceData = await loadPracticeProgress(userId, category);
        if ((practiceData?.rewardedItems || []).includes(activityId)) {
            isAlreadyRewarded = true;
        } else {
            const ref = category === 'PracticeQuizzes' ? userPaths.progress.practiceQuizzes(userId)
                : category === 'PracticeProjects' ? userPaths.progress.practiceProjects(userId)
                : userPaths.progress.practiceProblems(userId);
            await setDoc(ref, { rewardedItems: arrayUnion(activityId) }, { merge: true });
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

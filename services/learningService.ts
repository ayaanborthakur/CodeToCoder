import {
    addDoc,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    collection,
    doc,
    updateDoc
} from 'firebase/firestore';
import { db } from './firebase';
import type { ReviewItem, CodeReviewLog } from '../types';

/**
 * PATH HELPERS (Local to this service for now, could be moved to firestorePathHelper)
 */
const getReviewCollection = (userId: string) => collection(db, `users/${userId}/Reviews`);
const getReviewLogCollection = (userId: string) => collection(db, `users/${userId}/ReviewLogs`);

/**
 * Calculate next review schedule using a simplified SuperMemo-2 algorithm
 * @param currentInterval - Days since last review (or 0 if new)
 * @param currentEase - Ease factor (default 2.5)
 * @param quality - Performance rating (0-5)
 *                  5: Perfect response
 *                  4: Correct response after hesitation
 *                  3: Correct response recalled with serious difficulty
 *                  2: Incorrect response; where the correct one seemed easy to recall
 *                  1: Incorrect response; the correct one remembered
 *                  0: Complete blackout
 */
export const calculateNextReview = (
    currentInterval: number, 
    currentEase: number, 
    quality: number
): { interval: number; easeFactor: number } => {
    // 1. Update Ease Factor
    // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    let newEase = currentEase + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (newEase < 1.3) newEase = 1.3; // Minimum ease cap

    // 2. Update Interval
    let newInterval = 1;

    if (quality < 3) {
        // If failed, reset interval
        newInterval = 1;
    } else {
        // Success
        if (currentInterval === 0) {
            newInterval = 1;
        } else if (currentInterval === 1) {
            newInterval = 6;
        } else {
            newInterval = Math.round(currentInterval * currentEase);
        }
    }

    return { interval: newInterval, easeFactor: newEase };
};

/**
 * Log a review attempt or add a new item to SRS
 */
export const logReviewAttempt = async (
    userId: string,
    itemId: string,
    itemTitle: string,
    topic: string,
    score: number, // 0-100
    location?: { moduleId?: string; category?: string }, // For navigation from the Review tab
): Promise<void> => {
    try {
        const reviewsRef = getReviewCollection(userId);

        // Check if item exists
        const q = query(reviewsRef, where('itemId', '==', itemId));
        const snapshot = await getDocs(q);

        // Map 0-100 score to 0-5 quality
        const quality = score >= 100 ? 5 : score >= 80 ? 4 : score >= 60 ? 3 : score >= 40 ? 2 : 1;

        if (!snapshot.empty) {
            const docSnap = snapshot.docs[0];
            const data = docSnap.data() as ReviewItem;

            const { interval, easeFactor } = calculateNextReview(data.interval, data.easeFactor, quality);

            const nextReviewDate = new Date();
            nextReviewDate.setDate(nextReviewDate.getDate() + interval);

            const update: Record<string, unknown> = {
                interval,
                easeFactor,
                lastReviewed: Date.now(),
                nextReviewDate: nextReviewDate.getTime(),
            };
            // Backfill navigation fields on existing rows if the caller has them
            // and we don't already.
            if (location?.moduleId && !data.moduleId) update.moduleId = location.moduleId;
            if (location?.category && !data.category) update.category = location.category;

            await updateDoc(doc(reviewsRef, docSnap.id), update);
        } else {
            const { interval, easeFactor } = calculateNextReview(0, 2.5, quality);

            const nextReviewDate = new Date();
            nextReviewDate.setDate(nextReviewDate.getDate() + interval);

            const newItem: ReviewItem = {
                userId,
                itemId,
                itemTitle,
                topic,
                nextReviewDate: nextReviewDate.getTime(),
                interval,
                easeFactor,
                lastReviewed: Date.now(),
                ...(location?.moduleId ? { moduleId: location.moduleId } : {}),
                ...(location?.category ? { category: location.category } : {}),
            };

            await addDoc(reviewsRef, newItem);
        }

    } catch (error) {
        console.error("Failed to log SRS review:", error);
    }
};

/**
 * Get items due for review
 */
export const getDueReviews = async (userId: string): Promise<ReviewItem[]> => {
    try {
        const reviewsRef = getReviewCollection(userId);
        const now = Date.now();
        
        const q = query(
            reviewsRef, 
            where('nextReviewDate', '<=', now),
            orderBy('nextReviewDate', 'asc'),
            limit(20) // Limit daily load
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ReviewItem));
    } catch (error) {
        console.error("Failed to fetch due reviews:", error);
        return [];
    }
};

/**
 * Log an AI Code Review Tip
 */
export const logCodeReview = async (
    userId: string,
    topic: string,
    mistake: string,
    aiTip: string,
    relatedLessonId?: string
): Promise<void> => {
    try {
        const logsRef = getReviewLogCollection(userId);
        await addDoc(logsRef, {
            userId,
            topic,
            mistake,
            aiTip,
            timestamp: Date.now(),
            relatedLessonId
        } as CodeReviewLog);
    } catch (error) {
        console.error("Failed to log code review:", error);
    }
};

/**
 * Get recent code review history
 */
export const getReviewHistory = async (userId: string, limitCount: number = 10): Promise<CodeReviewLog[]> => {
    try {
        const logsRef = getReviewLogCollection(userId);
        const q = query(logsRef, orderBy('timestamp', 'desc'), limit(limitCount));
        
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CodeReviewLog));
    } catch (error) {
        console.error("Failed to get review history:", error);
        return [];
    }
};

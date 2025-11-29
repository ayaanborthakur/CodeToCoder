
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { UserAchievements, Badge } from '../types';

const BASE_PROGRESS_KEY = 'codetocoder_progress';
const BASE_PRACTICE_KEY = 'codetocoder_practice_progress';

export const useProgress = () => {
    const { user, isLoading: isAuthLoading } = useAuth();
    const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
    const [completedPracticeItems, setCompletedPracticeItems] = useState<Set<string>>(new Set());
    const [achievements, setAchievements] = useState<UserAchievements | undefined>(undefined);
    const [newlyEarnedBadges, setNewlyEarnedBadges] = useState<Badge[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Key logic: If user is logged in, append userId to key. Else use base key (guest).
    const getProgressKey = useCallback(() => user ? `${BASE_PROGRESS_KEY}_${user.id}` : BASE_PROGRESS_KEY, [user]);
    const getPracticeKey = useCallback(() => user ? `${BASE_PRACTICE_KEY}_${user.id}` : BASE_PRACTICE_KEY, [user]);

    useEffect(() => {
        if (isAuthLoading) return;

        setIsLoaded(false);
        const loadProgressData = async () => {
            try {
                if (user) {
                    // Load from Firestore for logged-in users
                    const { loadProgress } = await import('../services/userDataService');
                    const firestoreData = await loadProgress(user.id);

                    if (firestoreData) {
                        setCompletedLessons(new Set(firestoreData.completedLessons || []));
                        setCompletedPracticeItems(new Set(firestoreData.completedPracticeItems || []));
                        setAchievements(firestoreData.achievements);

                        // Also save to localStorage as backup
                        if (typeof window !== 'undefined' && window.localStorage) {
                            window.localStorage.setItem(getProgressKey(), JSON.stringify(firestoreData.completedLessons));
                            window.localStorage.setItem(getPracticeKey(), JSON.stringify(firestoreData.completedPracticeItems));
                        }
                    } else {
                        // No Firestore data, check localStorage (migration case)
                        const savedProgress = window.localStorage?.getItem(getProgressKey());
                        const savedPractice = window.localStorage?.getItem(getPracticeKey());

                        const lessonsSet = savedProgress ? new Set(JSON.parse(savedProgress) as string[]) : new Set<string>();
                        const practiceSet = savedPractice ? new Set(JSON.parse(savedPractice) as string[]) : new Set<string>();

                        setCompletedLessons(lessonsSet);
                        setCompletedPracticeItems(practiceSet);
                        setAchievements(undefined);

                        // Migrate to Firestore
                        if (lessonsSet.size > 0 || practiceSet.size > 0) {
                            const { syncProgress } = await import('../services/userDataService');
                            await syncProgress(user.id, Array.from(lessonsSet) as string[], Array.from(practiceSet) as string[]);
                        }
                    }
                } else {
                    // Guest mode: use localStorage only
                    if (typeof window !== 'undefined' && window.localStorage) {
                        const savedProgress = window.localStorage.getItem(getProgressKey());
                        const savedPractice = window.localStorage.getItem(getPracticeKey());

                        setCompletedLessons(savedProgress ? new Set(JSON.parse(savedProgress) as string[]) : new Set());
                        setCompletedPracticeItems(savedPractice ? new Set(JSON.parse(savedPractice) as string[]) : new Set());
                    }
                }
            } catch (error) {
                console.error("Failed to load progress", error);
            } finally {
                setIsLoaded(true);
            }
        };

        loadProgressData();
    }, [user, isAuthLoading, getProgressKey, getPracticeKey]);

    const markLessonAsCompleted = useCallback(async (lessonId: string) => {
        // Prevent duplicate rewards
        if (completedLessons.has(lessonId)) return;

        setCompletedLessons(prev => {
            const newSet = new Set(prev);
            newSet.add(lessonId);

            // Save to localStorage
            try {
                if (typeof window !== 'undefined' && window.localStorage) {
                    window.localStorage.setItem(getProgressKey(), JSON.stringify(Array.from(newSet)));
                }
            } catch (error) {
                console.error("Failed to save progress to localStorage", error);
            }

            // Check for new badges (async)
            (async () => {
                try {
                    const { checkAndAwardBadges } = await import('../services/achievementService');
                    const { LESSON_PLAN } = await import('../constants');
                    const { calculateTokenReward, awardTokens } = await import('../services/tokenService');
                    const { updateChallengeProgress } = await import('../services/marketplaceService');

                    const totalLessons = LESSON_PLAN.reduce((sum, module) => sum + module.lessons.length, 0);

                    // Award tokens for lesson completion
                    if (user) {
                        const tokenReward = calculateTokenReward('lesson', undefined);
                        awardTokens(user.id, tokenReward, `Completed lesson`);

                        // Update daily challenges
                        updateChallengeProgress(user.id, 'lesson');
                    }

                    // Count practice items by type (for now, treat all as practice)
                    const result = checkAndAwardBadges(achievements, {
                        lessonsCompleted: newSet.size,
                        practiceCompleted: completedPracticeItems.size,
                        quizzesCompleted: 0, // TODO: Track separately
                        projectsCompleted: 0, // TODO: Track separately
                        totalLessons
                    });

                    if (result.newBadges.length > 0) {
                        setNewlyEarnedBadges(result.newBadges);

                        // Award tokens for new badges
                        if (user) {
                            result.newBadges.forEach(badge => {
                                awardTokens(user.id, 30, `Earned badge: ${badge.name}`);
                            });
                        }

                        // Log analytics for each new badge
                        const { logBadgeEarned } = await import('../services/analyticsService');
                        result.newBadges.forEach(badge => {
                            logBadgeEarned(badge.id, badge.name, badge.tier);
                        });
                    }

                    // Always update achievements state to keep in sync
                    setAchievements(result.updatedAchievements);

                    // Sync to Firestore for logged-in users
                    if (user) {
                        const { syncProgress } = await import('../services/userDataService');
                        await syncProgress(
                            user.id,
                            Array.from(newSet) as string[],
                            Array.from(completedPracticeItems) as string[],
                            result.updatedAchievements
                        );
                    }
                } catch (error) {
                    console.error("Failed to check badges or sync progress", error);
                }
            })();

            return newSet;
        });
    }, [getProgressKey, user, completedLessons, completedPracticeItems, achievements]);

    const markLessonAsIncomplete = useCallback(async (lessonId: string) => {
        setCompletedLessons(prev => {
            const newSet = new Set(prev);
            if (newSet.has(lessonId)) {
                newSet.delete(lessonId);

                // Save to localStorage
                try {
                    if (typeof window !== 'undefined' && window.localStorage) {
                        window.localStorage.setItem(getProgressKey(), JSON.stringify(Array.from(newSet)));
                    }
                } catch (error) {
                    console.error("Failed to save progress to localStorage", error);
                }

                // Sync to Firestore for logged-in users
                if (user) {
                    (async () => {
                        try {
                            const { syncProgress } = await import('../services/userDataService');
                            await syncProgress(user.id, Array.from(newSet) as string[], Array.from(completedPracticeItems) as string[], achievements);
                        } catch (error) {
                            console.error("Failed to sync progress to Firestore", error);
                        }
                    })();
                }
            }
            return newSet;
        });
    }, [getProgressKey, user, completedPracticeItems, achievements]);

    const markPracticeAsCompleted = useCallback(async (itemId: string) => {
        // Prevent duplicate rewards
        if (completedPracticeItems.has(itemId)) return;

        setCompletedPracticeItems(prev => {
            const newSet = new Set(prev);
            newSet.add(itemId);

            // Save to localStorage
            try {
                if (typeof window !== 'undefined' && window.localStorage) {
                    window.localStorage.setItem(getPracticeKey(), JSON.stringify(Array.from(newSet)));
                }
            } catch (error) {
                console.error("Failed to save practice progress to localStorage", error);
            }

            // Check for new badges (async)
            (async () => {
                try {
                    const { checkAndAwardBadges } = await import('../services/achievementService');
                    const { LESSON_PLAN } = await import('../constants');
                    const { calculateTokenReward, awardTokens } = await import('../services/tokenService');
                    const { updateChallengeProgress } = await import('../services/marketplaceService');

                    const totalLessons = LESSON_PLAN.reduce((sum, module) => sum + module.lessons.length, 0);

                    // Award tokens for practice completion
                    if (user) {
                        const tokenReward = calculateTokenReward('practice', undefined);
                        awardTokens(user.id, tokenReward, `Completed practice problem`);

                        // Update daily challenges
                        updateChallengeProgress(user.id, 'practice');
                    }

                    const result = checkAndAwardBadges(achievements, {
                        lessonsCompleted: completedLessons.size,
                        practiceCompleted: newSet.size,
                        quizzesCompleted: 0, // TODO: Track separately
                        projectsCompleted: 0, // TODO: Track separately
                        totalLessons
                    });

                    if (result.newBadges.length > 0) {
                        setNewlyEarnedBadges(result.newBadges);

                        // Award tokens for new badges
                        if (user) {
                            result.newBadges.forEach(badge => {
                                awardTokens(user.id, 30, `Earned badge: ${badge.name}`);
                            });
                        }

                        // Log analytics for each new badge
                        const { logBadgeEarned } = await import('../services/analyticsService');
                        result.newBadges.forEach(badge => {
                            logBadgeEarned(badge.id, badge.name, badge.tier);
                        });
                    }

                    // Always update achievements state to keep in sync
                    setAchievements(result.updatedAchievements);

                    // Sync to Firestore for logged-in users
                    if (user) {
                        const { syncProgress } = await import('../services/userDataService');
                        await syncProgress(user.id, Array.from(completedLessons) as string[], Array.from(newSet) as string[], result.updatedAchievements);
                    }
                } catch (error) {
                    console.error("Failed to check badges or sync progress", error);
                }
            })();

            return newSet;
        });
    }, [getPracticeKey, user, completedLessons, completedPracticeItems, achievements]);

    const clearNewBadges = useCallback(() => {
        setNewlyEarnedBadges([]);
    }, []);

    return {
        completedLessons,
        markLessonAsCompleted,
        markLessonAsIncomplete,
        completedPracticeItems,
        markPracticeAsCompleted,
        achievements,
        newlyEarnedBadges,
        clearNewBadges,
        isProgressLoaded: isLoaded && !isAuthLoading
    };
};

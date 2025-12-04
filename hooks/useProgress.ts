
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { UserAchievements, Badge } from '../types';

const BASE_PROGRESS_KEY = 'codetocoder_progress';
const BASE_PRACTICE_KEY = 'codetocoder_practice_progress';

export const useProgress = () => {
    const { user, isLoading: isAuthLoading } = useAuth();
    const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
    const [completedPracticeItems, setCompletedPracticeItems] = useState<Set<string>>(new Set());
    const [rewardedLessons, setRewardedLessons] = useState<Set<string>>(new Set());
    const [rewardedPracticeItems, setRewardedPracticeItems] = useState<Set<string>>(new Set());
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
                    console.log('[useProgress] Loading data for user:', user.id);

                    // Trigger migration first
                    const { migrateUserData } = await import('../services/migrationService');
                    try {
                        await migrateUserData(user.id);
                        console.log('[useProgress] Migration completed or already done');
                    } catch (migrationError) {
                        console.error('[useProgress] Migration failed, continuing with data load:', migrationError);
                    }

                    // Load from new Firestore structure
                    const { loadClassroomProgress, loadPracticeProgress, loadAchievements } = await import('../services/userDataService');

                    console.log('[useProgress] Loading classroom progress...');
                    const classroomData = await loadClassroomProgress(user.id);
                    console.log('[useProgress] Classroom data:', classroomData);

                    console.log('[useProgress] Loading practice progress...');
                    const practiceData = await loadPracticeProgress(user.id, 'PracticeProblems');
                    console.log('[useProgress] Practice data:', practiceData);

                    console.log('[useProgress] Loading achievements...');
                    const achievementsData = await loadAchievements(user.id);
                    console.log('[useProgress] Achievements data:', achievementsData);

                    if (classroomData && classroomData.completedLessons) {
                        console.log('[useProgress] Setting completed lessons:', classroomData.completedLessons.length);
                        setCompletedLessons(new Set(classroomData.completedLessons));
                        if (classroomData.rewardedLessons) {
                            setRewardedLessons(new Set(classroomData.rewardedLessons));
                        }
                    } else {
                        console.log('[useProgress] No classroom data found, checking localStorage...');
                        // Try localStorage as fallback
                        const savedProgress = window.localStorage?.getItem(getProgressKey());
                        if (savedProgress) {
                            const lessons = JSON.parse(savedProgress) as string[];
                            console.log('[useProgress] Found lessons in localStorage:', lessons.length);
                            setCompletedLessons(new Set(lessons));
                        } else {
                            console.log('[useProgress] No data in localStorage either, starting fresh');
                            setCompletedLessons(new Set());
                        }
                    }

                    if (practiceData && practiceData.completed) {
                        console.log('[useProgress] Setting completed practice items:', practiceData.completed.length);
                        setCompletedPracticeItems(new Set(practiceData.completed));
                        if (practiceData.rewardedItems) {
                            setRewardedPracticeItems(new Set(practiceData.rewardedItems));
                        }
                    } else {
                        console.log('[useProgress] No practice data found');
                        setCompletedPracticeItems(new Set());
                    }

                    if (achievementsData) {
                        console.log('[useProgress] Setting achievements');
                        setAchievements(achievementsData);
                    }

                    // Also save to localStorage as backup
                    if (typeof window !== 'undefined' && window.localStorage) {
                        if (classroomData && classroomData.completedLessons) {
                            window.localStorage.setItem(getProgressKey(), JSON.stringify(classroomData.completedLessons));
                        }
                        if (practiceData && practiceData.completed) {
                            window.localStorage.setItem(getPracticeKey(), JSON.stringify(practiceData.completed));
                        }
                    }
                } else {
                    console.log('[useProgress] Guest mode: loading from localStorage');
                    // Guest mode: use localStorage only
                    if (typeof window !== 'undefined' && window.localStorage) {
                        const savedProgress = window.localStorage.getItem(getProgressKey());
                        const savedPractice = window.localStorage.getItem(getPracticeKey());

                        setCompletedLessons(savedProgress ? new Set(JSON.parse(savedProgress) as string[]) : new Set());
                        setCompletedPracticeItems(savedPractice ? new Set(JSON.parse(savedPractice) as string[]) : new Set());
                    }
                }
            } catch (error) {
                console.error("[useProgress] Failed to load progress", error);
            } finally {
                setIsLoaded(true);
                console.log('[useProgress] Loading complete');
            }
        };

        loadProgressData();
    }, [user, isAuthLoading, getProgressKey, getPracticeKey]);

    const markLessonAsCompleted = useCallback(async (lessonId: string) => {
        console.log('[useProgress] markLessonAsCompleted called for:', lessonId);

        // Prevent duplicate rewards
        if (completedLessons.has(lessonId)) {
            console.log('[useProgress] Lesson already marked as completed, skipping');
            return;
        }

        setCompletedLessons(prev => {
            console.log('[useProgress] Updating completedLessons state with new lesson:', lessonId);
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
                    const { calculateStarReward, addStars, updateChallengeProgress } = await import('../services/marketplaceService');

                    const totalLessons = LESSON_PLAN.reduce((sum, module) => sum + module.lessons.length, 0);
                    console.log('[useProgress] Total lessons calculated:', totalLessons);

                    // Award stars for lesson completion (only if not already rewarded)
                    if (user && !rewardedLessons.has(lessonId)) {
                        const starReward = calculateStarReward('lesson', undefined);
                        addStars(user.id, starReward, `Completed lesson`);

                        // Update daily challenges
                        updateChallengeProgress(user.id, 'lesson');

                        // Update rewarded set
                        setRewardedLessons(prev => {
                            const newRewarded = new Set(prev);
                            newRewarded.add(lessonId);
                            return newRewarded;
                        });
                    }

                    // Count practice items by type
                    const result = checkAndAwardBadges(achievements, {
                        lessonsCompleted: newSet.size,
                        practiceCompleted: completedPracticeItems.size,
                        quizzesCompleted: 0,
                        projectsCompleted: 0,
                        totalLessons
                    });

                    if (result.newBadges.length > 0) {
                        setNewlyEarnedBadges(result.newBadges);

                        // Award stars for new badges
                        if (user) {
                            result.newBadges.forEach(badge => {
                                addStars(user.id, 30, `Earned badge: ${badge.name}`);
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

                    // Sync to Firestore for logged-in users (new structure)
                    if (user) {
                        const { syncClassroomProgress } = await import('../services/userDataService');
                        await syncClassroomProgress(
                            user.id,
                            Array.from(newSet) as string[],
                            result.updatedAchievements,
                            user && !rewardedLessons.has(lessonId) ? [...Array.from(rewardedLessons), lessonId] : Array.from(rewardedLessons)
                        );
                    }
                } catch (error) {
                    console.error("Failed to check badges or sync progress", error);
                }
            })();

            return newSet;
        });
    }, [getProgressKey, user, completedLessons, completedPracticeItems, achievements, rewardedLessons]);

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

                // Sync to Firestore for logged-in users (new structure)
                if (user) {
                    (async () => {
                        try {
                            const { syncClassroomProgress } = await import('../services/userDataService');
                            // Pass current rewarded lessons to persist them even if lesson is uncompleted
                            await syncClassroomProgress(user.id, Array.from(newSet) as string[], achievements, Array.from(rewardedLessons));
                        } catch (error) {
                            console.error("Failed to sync progress to Firestore", error);
                        }
                    })();
                }
            }
            return newSet;
        });
    }, [getProgressKey, user, achievements, rewardedLessons]);

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
                    const { calculateStarReward, addStars, updateChallengeProgress } = await import('../services/marketplaceService');

                    const totalLessons = LESSON_PLAN.reduce((sum, module) => sum + module.lessons.length, 0);

                    // Award stars for practice completion (only if not already rewarded)
                    if (user && !rewardedPracticeItems.has(itemId)) {
                        const starReward = calculateStarReward('practice', undefined);
                        addStars(user.id, starReward, `Completed practice problem`);

                        // Update daily challenges
                        updateChallengeProgress(user.id, 'practice');

                        // Update rewarded set
                        setRewardedPracticeItems(prev => {
                            const newRewarded = new Set(prev);
                            newRewarded.add(itemId);
                            return newRewarded;
                        });
                    }

                    const result = checkAndAwardBadges(achievements, {
                        lessonsCompleted: completedLessons.size,
                        practiceCompleted: newSet.size,
                        quizzesCompleted: 0,
                        projectsCompleted: 0,
                        totalLessons
                    });

                    if (result.newBadges.length > 0) {
                        setNewlyEarnedBadges(result.newBadges);

                        // Award stars for new badges
                        if (user) {
                            result.newBadges.forEach(badge => {
                                addStars(user.id, 30, `Earned badge: ${badge.name}`);
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

                    // Sync to Firestore for logged-in users (new structure)
                    if (user) {
                        const { syncPracticeProgress, syncClassroomProgress } = await import('../services/userDataService');
                        await syncPracticeProgress(
                            user.id,
                            'PracticeProblems',
                            Array.from(newSet) as string[],
                            user && !rewardedPracticeItems.has(itemId) ? [...Array.from(rewardedPracticeItems), itemId] : Array.from(rewardedPracticeItems)
                        );
                        // Also sync achievements
                        await syncClassroomProgress(user.id, Array.from(completedLessons) as string[], result.updatedAchievements, Array.from(rewardedLessons));
                    }
                } catch (error) {
                    console.error("Failed to check badges or sync progress", error);
                }
            })();

            return newSet;
        });
    }, [getPracticeKey, user, completedLessons, completedPracticeItems, achievements, rewardedPracticeItems, rewardedLessons]);

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

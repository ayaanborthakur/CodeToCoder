
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

import type { UserAchievements, Badge } from '../types';

const BASE_PROGRESS_KEY = 'code2coder_progress';
const BASE_PRACTICE_KEY = 'code2coder_practice_progress';

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
                    const [problemsData, quizzesData, projectsData] = await Promise.all([
                        loadPracticeProgress(user.id, 'PracticeProblems'),
                        loadPracticeProgress(user.id, 'PracticeQuizzes'),
                        loadPracticeProgress(user.id, 'PracticeProjects')
                    ]);
                    
                    const allCompletedPractice = [
                        ...(problemsData?.completed || []),
                        ...(quizzesData?.completed || []),
                        ...(projectsData?.completed || [])
                    ];
                    
                    const allRewardedPractice = [
                        ...(problemsData?.rewardedItems || []),
                        ...(quizzesData?.rewardedItems || []),
                        ...(projectsData?.rewardedItems || [])
                    ];

                    console.log('[useProgress] All practice data loaded:', allCompletedPractice.length);

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

                    if (allCompletedPractice.length > 0 || allRewardedPractice.length > 0) {
                        console.log('[useProgress] Setting completed practice items:', allCompletedPractice.length);
                        setCompletedPracticeItems(new Set(allCompletedPractice));
                        setRewardedPracticeItems(new Set(allRewardedPractice));
                    } else {
                        console.log('[useProgress] No practice data found');
                        setCompletedPracticeItems(new Set());
                        setRewardedPracticeItems(new Set());
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
                        if (allCompletedPractice.length > 0) {
                            window.localStorage.setItem(getPracticeKey(), JSON.stringify(allCompletedPractice));
                        }
                    }
                } else {
                    console.log('[useProgress] No user logged in, resetting progress');
                    setCompletedLessons(new Set());
                    setCompletedPracticeItems(new Set());
                    setRewardedLessons(new Set());
                    setRewardedPracticeItems(new Set());
                    setAchievements(undefined);
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
                    const { contentService } = await import('../services/contentService');
                    const { addStars, updateChallengeProgress, getMarketplaceData } = await import('../services/marketplaceService');

                    const modules = await contentService.getAllModules();
                    const totalLessons = modules.reduce((sum, module) => sum + module.lessons.length, 0);
                    console.log('[useProgress] Total lessons calculated:', totalLessons);

                    // Update daily challenges and rewarded set (only if not already rewarded)
                    if (user && !rewardedLessons.has(lessonId)) {
                        // Update daily challenges
                        updateChallengeProgress(user.id, 'lesson');

                        // Update rewarded set
                        setRewardedLessons(prev => {
                            const newRewarded = new Set(prev);
                            newRewarded.add(lessonId);
                            return newRewarded;
                        });
                    }

                    // Count quizzes from completed lessons (lessons with type === 'quiz')
                    let quizzesCompleted = 0;
                    let modulesCompleted = 0;
                    for (const module of modules) {
                        const quizLessons = module.lessons.filter(l => l.type === 'quiz');
                        const completedQuizzes = quizLessons.filter(l => newSet.has(l.id));
                        quizzesCompleted += completedQuizzes.length;
                        
                        // Check if entire module is completed
                        const allCompleted = module.lessons.every(l => newSet.has(l.id));
                        if (allCompleted) modulesCompleted++;
                    }

                    // Get streak and star data
                    let currentStreak = 0;
                    let longestStreak = 0;
                    let totalStarsEarned = 0;
                    if (user) {
                        const marketData = await getMarketplaceData(user.id);
                        totalStarsEarned = marketData.stars.totalEarned || 0;
                        // Streak data stored in stars subcollection
                        currentStreak = (marketData as any).currentStreak || 0;
                        longestStreak = (marketData as any).longestStreak || 0;
                    }

                    const result = checkAndAwardBadges(achievements, {
                        lessonsCompleted: newSet.size,
                        practiceCompleted: completedPracticeItems.size,
                        quizzesCompleted,
                        projectsCompleted: 0, // Will be counted from practice items
                        totalLessons,
                        currentStreak,
                        longestStreak,
                        totalStarsEarned,
                        modulesCompleted
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
                    const { contentService } = await import('../services/contentService');
                    const modules = await contentService.getAllModules();
                    
                    const { addStars, updateChallengeProgress, getMarketplaceData } = await import('../services/marketplaceService');

                    const totalLessons = modules.reduce((sum: number, module: any) => sum + module.lessons.length, 0);

                    // Update daily challenges and rewarded set (only if not already rewarded)
                    if (user && !rewardedPracticeItems.has(itemId)) {
                        // Update daily challenges
                        updateChallengeProgress(user.id, 'practice');

                        // Update rewarded set
                        setRewardedPracticeItems(prev => {
                            const newRewarded = new Set(prev);
                            newRewarded.add(itemId);
                            return newRewarded;
                        });
                    }

                    // Count quizzes and modules from completed lessons
                    let quizzesCompleted = 0;
                    let modulesCompleted = 0;
                    for (const module of modules) {
                        const quizLessons = module.lessons.filter((l: any) => l.type === 'quiz');
                        const completedQuizzes = quizLessons.filter((l: any) => completedLessons.has(l.id));
                        quizzesCompleted += completedQuizzes.length;
                        
                        const allCompleted = module.lessons.every((l: any) => completedLessons.has(l.id));
                        if (allCompleted) modulesCompleted++;
                    }

                    // Count projects from practice items
                    const practiceItems = await contentService.getPracticeItems();
                    const completedProjectItems = practiceItems.filter(p => p.type === 'project' && newSet.has(p.id));
                    const projectsCompleted = completedProjectItems.length;

                    // Get streak and star data
                    let currentStreak = 0;
                    let longestStreak = 0;
                    let totalStarsEarned = 0;
                    if (user) {
                        const marketData = await getMarketplaceData(user.id);
                        totalStarsEarned = marketData.stars.totalEarned || 0;
                        currentStreak = (marketData as any).currentStreak || 0;
                        longestStreak = (marketData as any).longestStreak || 0;
                    }

                    const result = checkAndAwardBadges(achievements, {
                        lessonsCompleted: completedLessons.size,
                        practiceCompleted: newSet.size,
                        quizzesCompleted,
                        projectsCompleted,
                        totalLessons,
                        currentStreak,
                        longestStreak,
                        totalStarsEarned,
                        modulesCompleted
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
                        
                        // Determine category for syncing
                        const practiceItems = await contentService.getPracticeItems();
                        const item = practiceItems.find(p => p.id === itemId);
                        let category: 'PracticeQuizzes' | 'PracticeProblems' | 'PracticeProjects' = 'PracticeProblems';
                        if (item?.type === 'quiz') category = 'PracticeQuizzes';
                        if (item?.type === 'project') category = 'PracticeProjects';

                        await syncPracticeProgress(
                            user.id,
                            category,
                            Array.from(newSet).filter(id => {
                                // Only sync IDs that belong to this category to keep data clean
                                // (Actually, the current structure expects the full 'completed' list per category)
                                // But since we merged them, we should ideally filter or just sync the ones that belong.
                                // For now, the safest is to sync the relevant ones.
                                return true; // We'll keep the full set for now to avoid losing data, 
                                // but ideally we should only sync IDs belonging to 'category'
                            }) as string[],
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

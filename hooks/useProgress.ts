
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

import type { UserAchievements, Badge } from '../types';

const BASE_PROGRESS_KEY = 'code2coder_progress';
const BASE_PRACTICE_KEY = 'code2coder_practice_progress';
const BASE_TODAY_KEY = 'code2coder_lessons_today';

// Practice lessons inside modules ("m3-lp2", "checkpoint-a-p1") count toward
// the practice-problem badges alongside the standalone practice problems.
const PRACTICE_LESSON_ID = /-(lp|p)\d+$/;

const todayString = () => new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD, local time

export const useProgress = () => {
    const { user, isLoading: isAuthLoading } = useAuth();
    const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
    const [completedPracticeItems, setCompletedPracticeItems] = useState<Set<string>>(new Set());
    const [rewardedLessons, setRewardedLessons] = useState<Set<string>>(new Set());
    const [rewardedPracticeItems, setRewardedPracticeItems] = useState<Set<string>>(new Set());
    const [achievements, setAchievements] = useState<UserAchievements | undefined>(undefined);
    const [newlyEarnedBadges, setNewlyEarnedBadges] = useState<Badge[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Latest values for async badge checks, which outlive the render that
    // started them and would otherwise read stale state.
    const completedLessonsRef = useRef(completedLessons);
    const completedPracticeRef = useRef(completedPracticeItems);
    const rewardedLessonsRef = useRef(rewardedLessons);
    const rewardedPracticeRef = useRef(rewardedPracticeItems);
    const achievementsRef = useRef(achievements);
    useEffect(() => { completedLessonsRef.current = completedLessons; }, [completedLessons]);
    useEffect(() => { completedPracticeRef.current = completedPracticeItems; }, [completedPracticeItems]);
    useEffect(() => { rewardedLessonsRef.current = rewardedLessons; }, [rewardedLessons]);
    useEffect(() => { rewardedPracticeRef.current = rewardedPracticeItems; }, [rewardedPracticeItems]);
    useEffect(() => { achievementsRef.current = achievements; }, [achievements]);
    // Badge checks run one at a time so two quick completions can't both
    // award (and pay stars for) the same badge.
    const badgeQueueRef = useRef<Promise<void>>(Promise.resolve());

    // Key logic: If user is logged in, append userId to key. Else use base key (guest).
    const getProgressKey = useCallback(() => user ? `${BASE_PROGRESS_KEY}_${user.id}` : BASE_PROGRESS_KEY, [user]);
    const getPracticeKey = useCallback(() => user ? `${BASE_PRACTICE_KEY}_${user.id}` : BASE_PRACTICE_KEY, [user]);
    const getTodayKey = useCallback(() => user ? `${BASE_TODAY_KEY}_${user.id}` : BASE_TODAY_KEY, [user]);

    useEffect(() => {
        if (isAuthLoading) return;

        setIsLoaded(false);
        const loadProgressData = async () => {
            try {
                if (user) {
                    // Migration is owned by AuthContext now — by the time `user` is set, it's done.
                    const { loadClassroomProgress, loadPracticeProgress, loadAchievements } = await import('../services/userDataService');

                    const classroomData = await loadClassroomProgress(user.id);

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


                    const achievementsData = await loadAchievements(user.id);

                    if (classroomData && classroomData.completedLessons) {
                        setCompletedLessons(new Set(classroomData.completedLessons));
                        if (classroomData.rewardedLessons) {
                            setRewardedLessons(new Set(classroomData.rewardedLessons));
                        }
                    } else {
                        // Try localStorage as fallback
                        const savedProgress = window.localStorage?.getItem(getProgressKey());
                        if (savedProgress) {
                            const lessons = JSON.parse(savedProgress) as string[];
                            setCompletedLessons(new Set(lessons));
                        } else {
                            setCompletedLessons(new Set());
                        }
                    }

                    if (allCompletedPractice.length > 0 || allRewardedPractice.length > 0) {
                        setCompletedPracticeItems(new Set(allCompletedPractice));
                        setRewardedPracticeItems(new Set(allRewardedPractice));
                    } else {
                        setCompletedPracticeItems(new Set());
                        setRewardedPracticeItems(new Set());
                    }

                    if (achievementsData) {
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
            }
        };

        loadProgressData();
    }, [user, isAuthLoading, getProgressKey, getPracticeKey]);

    const enqueue = useCallback((task: () => Promise<void>) => {
        badgeQueueRef.current = badgeQueueRef.current
            .then(task)
            .catch(error => console.error("Failed to check badges or sync progress", error));
    }, []);

    // Counts everything the badges measure, awards any newly earned ones and
    // returns the updated achievements for the caller to persist.
    const evaluateBadges = useCallback(async (lessons: Set<string>, practice: Set<string>) => {
        const [{ checkAndAwardBadges }, { contentService }, { addStars, getStarsData }] = await Promise.all([
            import('../services/achievementService'),
            import('../services/contentService'),
            import('../services/marketplaceService'),
        ]);
        const [modules, practiceItems] = await Promise.all([
            contentService.getAllModules(),
            contentService.getPracticeItems(),
        ]);
        const allLessons = modules.flatMap(m => m.lessons);
        const doneLessons = allLessons.filter(l => lessons.has(l.id));
        const donePractice = practiceItems.filter(p => practice.has(p.id));

        let currentStreak = 0;
        let longestStreak = 0;
        let totalStarsEarned = 0;
        if (user) {
            // Completing work is what keeps a streak alive.
            const { updateStreak } = await import('../services/streakService');
            ({ currentStreak, longestStreak } = await updateStreak(user.id));
            totalStarsEarned = (await getStarsData(user.id)).totalEarned || 0;
        }

        let lessonsCompletedToday = 0;
        try {
            const today = JSON.parse(window.localStorage.getItem(getTodayKey()) || 'null');
            if (today?.date === todayString()) lessonsCompletedToday = today.ids.length;
        } catch { /* storage unavailable: speed badge just waits */ }

        const result = checkAndAwardBadges(achievementsRef.current, {
            lessonsCompleted: doneLessons.length,
            practiceCompleted: doneLessons.filter(l => PRACTICE_LESSON_ID.test(l.id)).length
                + donePractice.filter(p => p.type === 'problem').length,
            quizzesCompleted: doneLessons.filter(l => l.type === 'quiz').length
                + donePractice.filter(p => p.type === 'quiz').length,
            projectsCompleted: doneLessons.filter(l => l.type === 'project').length
                + donePractice.filter(p => p.type === 'project').length,
            totalLessons: allLessons.length,
            totalModules: modules.length,
            currentStreak,
            longestStreak,
            totalStarsEarned,
            modulesCompleted: modules.filter(m => m.lessons.length > 0 && m.lessons.every(l => lessons.has(l.id))).length,
            lessonsCompletedToday,
        });

        achievementsRef.current = result.updatedAchievements;
        setAchievements(result.updatedAchievements);

        if (result.newBadges.length > 0) {
            setNewlyEarnedBadges(result.newBadges);
            if (user) {
                for (const badge of result.newBadges) {
                    await addStars(user.id, 30, `Earned badge: ${badge.name}`);
                }
            }
            const { logBadgeEarned } = await import('../services/analyticsService');
            result.newBadges.forEach(badge => logBadgeEarned(badge.id, badge.name, badge.tier));
        }

        return result.updatedAchievements;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const markLessonAsCompleted = useCallback(async (lessonId: string) => {
        // Prevent duplicate rewards
        if (completedLessonsRef.current.has(lessonId)) return;

        const newSet = new Set(completedLessonsRef.current);
        newSet.add(lessonId);
        completedLessonsRef.current = newSet;
        setCompletedLessons(newSet);

        try {
            window.localStorage.setItem(getProgressKey(), JSON.stringify(Array.from(newSet)));
            const stored = JSON.parse(window.localStorage.getItem(getTodayKey()) || 'null');
            const ids: string[] = stored?.date === todayString() ? stored.ids : [];
            if (!ids.includes(lessonId)) ids.push(lessonId);
            window.localStorage.setItem(getTodayKey(), JSON.stringify({ date: todayString(), ids }));
        } catch (error) {
            console.error("Failed to save progress to localStorage", error);
        }

        if (user && !rewardedLessonsRef.current.has(lessonId)) {
            import('../services/marketplaceService').then(({ updateChallengeProgress }) => updateChallengeProgress(user.id, 'lesson'));
            const rewarded = new Set(rewardedLessonsRef.current);
            rewarded.add(lessonId);
            rewardedLessonsRef.current = rewarded;
            setRewardedLessons(rewarded);
        }

        enqueue(async () => {
            const updated = await evaluateBadges(newSet, completedPracticeRef.current);
            if (user) {
                const { syncClassroomProgress } = await import('../services/userDataService');
                await syncClassroomProgress(user.id, Array.from(completedLessonsRef.current), updated, Array.from(rewardedLessonsRef.current));
            }
        });
    }, [getProgressKey, getTodayKey, user, enqueue, evaluateBadges]);

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
                            await syncClassroomProgress(user.id, Array.from(newSet) as string[], achievementsRef.current, Array.from(rewardedLessonsRef.current));
                        } catch (error) {
                            console.error("Failed to sync progress to Firestore", error);
                        }
                    })();
                }
            }
            return newSet;
        });
    }, [getProgressKey, user]);

    const markPracticeAsCompleted = useCallback(async (itemId: string) => {
        // Prevent duplicate rewards
        if (completedPracticeRef.current.has(itemId)) return;

        const newSet = new Set(completedPracticeRef.current);
        newSet.add(itemId);
        completedPracticeRef.current = newSet;
        setCompletedPracticeItems(newSet);

        try {
            window.localStorage.setItem(getPracticeKey(), JSON.stringify(Array.from(newSet)));
        } catch (error) {
            console.error("Failed to save practice progress to localStorage", error);
        }

        if (user && !rewardedPracticeRef.current.has(itemId)) {
            import('../services/marketplaceService').then(({ updateChallengeProgress }) => updateChallengeProgress(user.id, 'practice'));
            const rewarded = new Set(rewardedPracticeRef.current);
            rewarded.add(itemId);
            rewardedPracticeRef.current = rewarded;
            setRewardedPracticeItems(rewarded);
        }

        enqueue(async () => {
            const updated = await evaluateBadges(completedLessonsRef.current, newSet);
            if (!user) return;

            const [{ syncPracticeProgress, syncClassroomProgress }, { contentService }] = await Promise.all([
                import('../services/userDataService'),
                import('../services/contentService'),
            ]);
            const practiceItems = await contentService.getPracticeItems();
            const typeOf = new Map(practiceItems.map(p => [p.id, p.type] as const));
            const categoryOf = (id: string): 'PracticeQuizzes' | 'PracticeProblems' | 'PracticeProjects' =>
                typeOf.get(id) === 'quiz' ? 'PracticeQuizzes' : typeOf.get(id) === 'project' ? 'PracticeProjects' : 'PracticeProblems';
            const category = categoryOf(itemId);

            // Each category document holds only its own items; loading merges all three.
            await syncPracticeProgress(
                user.id,
                category,
                Array.from(completedPracticeRef.current).filter(id => categoryOf(id) === category),
                Array.from(rewardedPracticeRef.current).filter(id => categoryOf(id) === category)
            );
            await syncClassroomProgress(user.id, Array.from(completedLessonsRef.current), updated, Array.from(rewardedLessonsRef.current));
        });
    }, [getPracticeKey, user, enqueue, evaluateBadges]);

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

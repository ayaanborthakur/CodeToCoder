
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

const BASE_PROGRESS_KEY = 'codetocoder_progress';
const BASE_PRACTICE_KEY = 'codetocoder_practice_progress';

export const useProgress = () => {
    const { user, isLoading: isAuthLoading } = useAuth();
    const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
    const [completedPracticeItems, setCompletedPracticeItems] = useState<Set<string>>(new Set());
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
                        setCompletedLessons(new Set(firestoreData.completedLessons));
                        setCompletedPracticeItems(new Set(firestoreData.completedPracticeItems));

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

                        // Migrate to Firestore
                        if (lessonsSet.size > 0 || practiceSet.size > 0) {
                            const { syncProgress } = await import('../services/userDataService');
                            await syncProgress(user.id, Array.from(lessonsSet), Array.from(practiceSet));
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

            // Sync to Firestore for logged-in users
            if (user) {
                (async () => {
                    try {
                        const { syncProgress } = await import('../services/userDataService');
                        await syncProgress(user.id, Array.from(newSet) as string[], Array.from(completedPracticeItems) as string[]);
                    } catch (error) {
                        console.error("Failed to sync progress to Firestore", error);
                    }
                })();
            }

            return newSet;
        });
    }, [getProgressKey, user, completedPracticeItems]);

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
                            await syncProgress(user.id, Array.from(newSet) as string[], Array.from(completedPracticeItems) as string[]);
                        } catch (error) {
                            console.error("Failed to sync progress to Firestore", error);
                        }
                    })();
                }
            }
            return newSet;
        });
    }, [getProgressKey, user, completedPracticeItems]);

    const markPracticeAsCompleted = useCallback(async (itemId: string) => {
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

            // Sync to Firestore for logged-in users
            if (user) {
                (async () => {
                    try {
                        const { syncProgress } = await import('../services/userDataService');
                        await syncProgress(user.id, Array.from(completedLessons) as string[], Array.from(newSet) as string[]);
                    } catch (error) {
                        console.error("Failed to sync progress to Firestore", error);
                    }
                })();
            }

            return newSet;
        });
    }, [getPracticeKey, user, completedLessons]);

    return {
        completedLessons,
        markLessonAsCompleted,
        markLessonAsIncomplete,
        completedPracticeItems,
        markPracticeAsCompleted,
        isProgressLoaded: isLoaded && !isAuthLoading
    };
};

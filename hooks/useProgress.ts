
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
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                const progressKey = getProgressKey();
                const practiceKey = getPracticeKey();

                const savedProgress = window.localStorage.getItem(progressKey);
                if (savedProgress) {
                    const completedIds = JSON.parse(savedProgress) as string[];
                    setCompletedLessons(new Set(completedIds));
                } else {
                    setCompletedLessons(new Set());
                }

                const savedPractice = window.localStorage.getItem(practiceKey);
                if (savedPractice) {
                    const practiceIds = JSON.parse(savedPractice) as string[];
                    setCompletedPracticeItems(new Set(practiceIds));
                } else {
                    setCompletedPracticeItems(new Set());
                }
            }
        } catch (error) {
            console.error("Failed to load progress from localStorage", error);
        } finally {
            setIsLoaded(true);
        }
    }, [user, isAuthLoading, getProgressKey, getPracticeKey]);

    const markLessonAsCompleted = useCallback((lessonId: string) => {
        setCompletedLessons(prev => {
            const newSet = new Set(prev);
            newSet.add(lessonId);
            try {
                if (typeof window !== 'undefined' && window.localStorage) {
                    window.localStorage.setItem(getProgressKey(), JSON.stringify(Array.from(newSet)));
                }
            } catch (error) {
                console.error("Failed to save progress to localStorage", error);
            }
            return newSet;
        });
    }, [getProgressKey]);

    const markLessonAsIncomplete = useCallback((lessonId: string) => {
        setCompletedLessons(prev => {
            const newSet = new Set(prev);
            if (newSet.has(lessonId)) {
                newSet.delete(lessonId);
                try {
                    if (typeof window !== 'undefined' && window.localStorage) {
                        window.localStorage.setItem(getProgressKey(), JSON.stringify(Array.from(newSet)));
                    }
                } catch (error) {
                    console.error("Failed to save progress to localStorage", error);
                }
            }
            return newSet;
        });
    }, [getProgressKey]);

    const markPracticeAsCompleted = useCallback((itemId: string) => {
        setCompletedPracticeItems(prev => {
            const newSet = new Set(prev);
            newSet.add(itemId);
            try {
                if (typeof window !== 'undefined' && window.localStorage) {
                    window.localStorage.setItem(getPracticeKey(), JSON.stringify(Array.from(newSet)));
                }
            } catch (error) {
                console.error("Failed to save practice progress to localStorage", error);
            }
            return newSet;
        });
    }, [getPracticeKey]);

    return { 
        completedLessons, 
        markLessonAsCompleted, 
        markLessonAsIncomplete, 
        completedPracticeItems,
        markPracticeAsCompleted,
        isProgressLoaded: isLoaded && !isAuthLoading
    };
};

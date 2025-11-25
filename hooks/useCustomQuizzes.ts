
import { useState, useEffect, useCallback } from 'react';
import type { PracticeItem } from '../types';
import { useAuth } from '../contexts/AuthContext';

const BASE_QUIZ_KEY = 'codetocoder_custom_quizzes';

export const useCustomQuizzes = () => {
    const { user, isLoading: isAuthLoading } = useAuth();
    const [customQuizzes, setCustomQuizzes] = useState<PracticeItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    const getKey = useCallback(() => user ? `${BASE_QUIZ_KEY}_${user.id}` : BASE_QUIZ_KEY, [user]);

    const saveToStorage = useCallback((items: PracticeItem[]) => {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.setItem(getKey(), JSON.stringify(items));
            }
        } catch (error) {
            console.error("Failed to save custom quizzes", error);
        }
    }, [getKey]);

    useEffect(() => {
        if (isAuthLoading) return;
        
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                const saved = window.localStorage.getItem(getKey());
                if (saved) {
                    setCustomQuizzes(JSON.parse(saved));
                } else {
                    setCustomQuizzes([]);
                }
            }
        } catch (e) {
            console.error("Failed to load custom quizzes", e);
        } finally {
            setIsLoaded(true);
        }
    }, [user, isAuthLoading, getKey]);

    const addCustomQuiz = useCallback((quiz: PracticeItem) => {
        setCustomQuizzes(prev => {
            const updated = [quiz, ...prev];
            saveToStorage(updated);
            return updated;
        });
    }, [saveToStorage]);

    return { customQuizzes, addCustomQuiz, isLoaded: isLoaded && !isAuthLoading };
};

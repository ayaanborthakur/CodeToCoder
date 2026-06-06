
import { useState, useEffect, useCallback } from 'react';
import type { PracticeItem } from '../types';
import { useAuth } from '../contexts/AuthContext';

const BASE_QUIZ_KEY = 'code2coder_custom_quizzes';

export const useCustomQuizzes = () => {
    const { user, isLoading: isAuthLoading } = useAuth();
    const [customQuizzes, setCustomQuizzes] = useState<PracticeItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    const getKey = useCallback(() => user ? `${BASE_QUIZ_KEY}_${user.id}` : BASE_QUIZ_KEY, [user]);

    const saveToStorage = useCallback(async (items: PracticeItem[]) => {
        try {
            // Save to localStorage
            if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.setItem(getKey(), JSON.stringify(items));
            }

            // Sync to Firestore for logged-in users (new structure)
            if (user) {
                const { syncCustomQuizzes } = await import('../services/userDataService');
                await syncCustomQuizzes(user.id, items);
            }
        } catch (error) {
            console.error("Failed to save custom quizzes", error);
        }
    }, [getKey, user]);

    useEffect(() => {
        if (isAuthLoading) return;

        const loadQuizzes = async () => {
            try {
                if (user) {
                    const { loadCustomQuizzes } = await import('../services/userDataService');
                    const firestoreQuizzes = await loadCustomQuizzes(user.id);

                    if (firestoreQuizzes.length > 0) {
                        setCustomQuizzes(firestoreQuizzes);
                        // Also save to localStorage as backup
                        if (typeof window !== 'undefined' && window.localStorage) {
                            window.localStorage.setItem(getKey(), JSON.stringify(firestoreQuizzes));
                        }
                    } else {
                        // No Firestore data, check localStorage (migration case)
                        const saved = window.localStorage?.getItem(getKey());
                        if (saved) {
                            const parsedQuizzes = JSON.parse(saved) as PracticeItem[];
                            setCustomQuizzes(parsedQuizzes);
                            // Migrate to Firestore
                            const { syncCustomQuizzes } = await import('../services/userDataService');
                            await syncCustomQuizzes(user.id, parsedQuizzes);
                        } else {
                            setCustomQuizzes([]);
                        }
                    }
                } else {
                    // Guest mode: use localStorage only
                    if (typeof window !== 'undefined' && window.localStorage) {
                        const saved = window.localStorage.getItem(getKey());
                        setCustomQuizzes(saved ? JSON.parse(saved) : []);
                    }
                }
            } catch (e) {
                console.error("Failed to load custom quizzes", e);
                setCustomQuizzes([]);
            } finally {
                setIsLoaded(true);
            }
        };

        loadQuizzes();
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

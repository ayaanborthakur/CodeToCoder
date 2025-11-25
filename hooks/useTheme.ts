
import { useState, useLayoutEffect } from 'react';

type Theme = 'light' | 'dark';

export const useTheme = (): [Theme, (theme: Theme) => void] => {
    const [theme, setTheme] = useState<Theme>(
        // Initialize state from localStorage or default to 'dark'
        () => {
            try {
                if (typeof window !== 'undefined' && window.localStorage) {
                    return (window.localStorage.getItem('theme') as Theme) || 'dark';
                }
            } catch (error) {
                console.warn('LocalStorage access denied or unavailable:', error);
            }
            return 'dark';
        }
    );

    useLayoutEffect(() => {
        if (typeof window === 'undefined') return;
        const root = window.document.documentElement;
        // Apply theme on initial load to prevent FOUC (Flash of Unstyled Content)
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        try {
            if (window.localStorage) {
                window.localStorage.setItem('theme', theme);
            }
        } catch (error) {
            console.warn('Failed to save theme to localStorage:', error);
        }
    }, [theme]);

    return [theme, setTheme];
};

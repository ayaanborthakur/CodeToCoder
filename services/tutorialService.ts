import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

const TUTORIAL_STORAGE_KEY = 'codetocoder_tutorial_completed';

export interface TutorialStep {
    id: string;
    title: string;
    description: string;
    targetElement?: string; // CSS selector for the element to highlight
    position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
    route?: string; // Route to navigate to before showing this step
    action?: 'navigate' | 'highlight' | 'info'; // Type of action for this step
    nextRoute?: string; // Route to navigate to after this step
}

export const TUTORIAL_STEPS: TutorialStep[] = [
    // Home Screen
    {
        id: 'home-welcome',
        title: 'Welcome to CodeToCoder! 🎉',
        description: 'This is your home screen where you can continue your learning journey, view your recent activity, and see your progress. Let\'s take a quick tour!',
        route: '/dashboard',
        position: 'center',
        action: 'info'
    },

    // Navigation Bar - MOVED BEFORE CLASSROOM
    {
        id: 'nav-bar',
        title: 'Navigation Bar',
        description: 'Here is your main navigation bar. Use it to quickly access different sections: Home, Classroom, Practice, Playground, Marketplace, Collection, References, and your Profile.',
        route: '/dashboard',
        targetElement: 'header nav',
        position: 'bottom',
        action: 'highlight'
    },

    // Classroom Introduction
    {
        id: 'classroom-intro',
        title: 'The Classroom 📚',
        description: 'This is where you\'ll learn Python through interactive lessons. Let\'s check it out!',
        route: '/classroom',
        position: 'center',
        action: 'navigate'
    },

    // Lesson Navigation - Auto-navigate to first lesson
    {
        id: 'lesson-nav',
        title: 'Lesson Navigation',
        description: 'We\'ve opened the first lesson for you! This sidebar shows all available modules and lessons.',
        route: '/classroom/module-1/m1-l1',
        targetElement: 'aside',
        position: 'right',
        action: 'highlight'
    },

    // Code Editor
    {
        id: 'code-editor',
        title: 'Code Editor ⌨️',
        description: 'Write your Python code here! The editor features syntax highlighting and auto-completion. Try modifying the code!',
        route: '/classroom/module-1/m1-l1',
        targetElement: '.monaco-editor',
        position: 'top',
        action: 'highlight'
    },

    // Lesson Content
    {
        id: 'lesson-content',
        title: 'Lesson Content 📖',
        description: 'Read the lesson instructions here. Each lesson includes clear objectives and examples.',
        route: '/classroom/module-1/m1-l1',
        targetElement: 'button[data-tab="lesson"]',
        position: 'top',
        action: 'highlight'
    },

    // Terminal
    {
        id: 'terminal',
        title: 'Terminal Output 💻',
        description: 'Click "Run Code" to see your program\'s output here! The terminal displays results, errors, and print statements.',
        route: '/classroom/module-1/m1-l1',
        targetElement: 'button[data-tab="terminal"]',
        position: 'top',
        action: 'highlight'
    },

    // AI Chatbot
    {
        id: 'ai-chatbot',
        title: 'AI Tutor 🤖',
        description: 'Your personal AI tutor is here to help! Ask questions, get hints, or request explanations anytime.',
        route: '/classroom/module-1/m1-l1',
        targetElement: '.chat-panel',
        position: 'left',
        action: 'highlight'
    },

    // Playground Introduction
    {
        id: 'playground-intro',
        title: 'The Playground 🎮',
        description: 'Welcome to the Playground! This is your creative space to write any Python code you want and experiment freely.',
        route: '/playground',
        position: 'center',
        action: 'navigate'
    },

    // Practice Introduction
    {
        id: 'practice-intro',
        title: 'Practice Section 💪',
        description: 'Time to practice! Here you\'ll find quizzes, coding problems, and projects to test your skills.',
        route: '/practice',
        position: 'center',
        action: 'navigate'
    },

    // Practice Categories
    {
        id: 'practice-categories',
        title: 'Practice Categories',
        description: 'Choose from Quizzes, Problems, or Projects. Each category offers different challenges to reinforce your learning.',
        route: '/practice',
        targetElement: '.practice-dashboard',
        position: 'center',
        action: 'highlight'
    },

    // Marketplace Introduction
    {
        id: 'marketplace-intro',
        title: 'The Marketplace 🏪',
        description: 'Spend your hard-earned stars on collectible packs! Each pack contains random collectibles of varying rarity.',
        route: '/marketplace',
        position: 'center',
        action: 'navigate'
    },

    // Star Balance
    {
        id: 'star-balance',
        title: 'Your Stars ⭐',
        description: 'This is your star balance in the header. Earn stars by completing lessons and practice activities!',
        route: '/marketplace',
        targetElement: 'header div[class*="flex items-center gap-1.5"]',
        position: 'bottom',
        action: 'highlight'
    },

    // Marketplace Packs
    {
        id: 'marketplace-packs',
        title: 'Collectible Packs 📦',
        description: 'Browse and purchase different packs! Higher-tier packs have better chances of rare collectibles.',
        route: '/marketplace',
        targetElement: '.marketplace-content',
        position: 'center',
        action: 'highlight'
    },

    // Collection Introduction
    {
        id: 'collection-intro',
        title: 'Your Collection 🎨',
        description: 'View all your earned badges and collectibles here! Track your achievements and rare finds.',
        route: '/collection',
        position: 'center',
        action: 'navigate'
    },

    // Collection Content
    {
        id: 'collection-content',
        title: 'Badges & Collectibles',
        description: 'Earn badges by completing lessons and collect rare items from marketplace packs!',
        route: '/collection',
        targetElement: '.collection-page',
        position: 'center',
        action: 'highlight'
    },

    // References Introduction
    {
        id: 'references-intro',
        title: 'References 📚',
        description: 'Your personal Python reference library! Browse built-in references or generate custom ones using AI.',
        route: '/reference',
        position: 'center',
        action: 'navigate'
    },

    // Reference Panel
    {
        id: 'reference-panel',
        title: 'Reference Library',
        description: 'Search for Python topics, generate custom references with AI, and save them for later!',
        route: '/reference',
        targetElement: '.reference-panel',
        position: 'center',
        action: 'highlight'
    },

    // Profile Introduction
    {
        id: 'profile-intro',
        title: 'Your Profile 👤',
        description: 'View your stats, achievements, and customize your settings. Track your learning journey here!',
        route: '/profile',
        position: 'center',
        action: 'navigate'
    },

    // Tutorial Complete
    {
        id: 'tutorial-complete',
        title: 'Tutorial Complete! 🎉',
        description: 'You\'re all set! Start learning Python with interactive lessons, practice problems, and AI assistance. Happy coding!',
        route: '/dashboard',
        position: 'center',
        action: 'info'
    }
];

/**
 * Check if user has completed the tutorial
 */
export const hasTutorialCompleted = (userId?: string): boolean => {
    if (userId) {
        // For logged-in users, check localStorage with user ID
        return localStorage.getItem(`${TUTORIAL_STORAGE_KEY}_${userId}`) === 'true';
    } else {
        // For guest users, check generic key
        return localStorage.getItem(TUTORIAL_STORAGE_KEY) === 'true';
    }
};

/**
 * Mark tutorial as completed
 */
export const markTutorialCompleted = async (userId?: string): Promise<void> => {
    if (userId) {
        // Save to localStorage
        localStorage.setItem(`${TUTORIAL_STORAGE_KEY}_${userId}`, 'true');

        // Also save to Firestore for logged-in users
        try {
            const userRef = doc(db, 'users', userId);
            await setDoc(userRef, {
                tutorialCompleted: true,
                tutorialCompletedAt: Date.now()
            }, { merge: true });
        } catch (error) {
            console.error('Failed to save tutorial completion to Firestore:', error);
        }
    } else {
        // Guest user - only save to localStorage
        localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
    }
};

/**
 * Reset tutorial (for testing or if user wants to see it again)
 */
export const resetTutorial = async (userId?: string): Promise<void> => {
    // Clear progress
    localStorage.removeItem(TUTORIAL_PROGRESS_KEY);

    if (userId) {
        localStorage.removeItem(`${TUTORIAL_STORAGE_KEY}_${userId}`);

        try {
            const userRef = doc(db, 'users', userId);
            await setDoc(userRef, {
                tutorialCompleted: false
            }, { merge: true });
        } catch (error) {
            console.error('Failed to reset tutorial in Firestore:', error);
        }
    } else {
        localStorage.removeItem(TUTORIAL_STORAGE_KEY);
    }
};

export const TUTORIAL_PROGRESS_KEY = 'codetocoder_tutorial_step';

export const saveTutorialProgress = (stepIndex: number) => {
    localStorage.setItem(TUTORIAL_PROGRESS_KEY, stepIndex.toString());
};

export const getTutorialProgress = (): number => {
    const saved = localStorage.getItem(TUTORIAL_PROGRESS_KEY);
    return saved ? parseInt(saved, 10) : 0;
};

export const clearTutorialProgress = () => {
    localStorage.removeItem(TUTORIAL_PROGRESS_KEY);
};

/**
 * Load tutorial completion status from Firestore
 */
export const loadTutorialStatus = async (userId: string): Promise<boolean> => {
    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const data = userSnap.data();
            return data.tutorialCompleted === true;
        }
        return false;
    } catch (error) {
        console.error('Failed to load tutorial status from Firestore:', error);
        return false;
    }
};

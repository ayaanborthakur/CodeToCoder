import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, useMatch } from 'react-router-dom';
import { NavigationPanel } from './components/NavigationPanel';
import { BottomPanel } from './components/BottomPanel';
import { IdePanel } from './components/IdePanel';
import { QuizPanel } from './components/QuizPanel';
import { ChatPanel } from './components/ChatPanel';
import { Resizer } from './components/Resizer';
import { HamburgerIcon } from './components/HamburgerIcon';
import { CompletionModal } from './components/CompletionModal';
import { ModuleCompletionBanner } from './components/ModuleCompletionBanner';
import { ConfirmationModal } from './components/ConfirmationModal';
import { HomePage } from './components/HomePage';
import { MissionPage } from './components/MissionPage';
import { PlaygroundDashboard } from './components/PlaygroundDashboard';
import { PracticeDashboard } from './components/PracticeDashboard';
import { ReferencePanel } from './components/ReferencePanel';

import { Header, ViewState } from './components/Header';
import { FlyingStar } from './components/FlyingStar';
import { ProfilePage } from './components/ProfilePage';
import { AuthModal } from './components/AuthModal';
import { AboutTeam } from './components/AboutTeam';
import { BadgeNotification } from './components/BadgeNotification';
import { MarketplacePage } from './components/MarketplacePage';

import { StarNotification } from './components/StarNotification';
import { TutorialOverlay } from './components/TutorialOverlay';
import { LESSON_PLAN, PRACTICE_ITEMS } from './constants';
import type { Lesson, ChatMessage, LintIssue, PracticeItem, PracticeType } from './types';
import { getChatResponse, lintCodeWithAI } from './services/geminiService';
import { useProgress } from './hooks/useProgress';
import { useTheme } from './hooks/useTheme';
import { usePlaygroundFiles } from './hooks/usePlaygroundFiles';
import { useCustomQuizzes } from './hooks/useCustomQuizzes';
import { useAuth } from './contexts/AuthContext';
import { hasTutorialCompleted } from './services/tutorialService';
import { subscribeToUserSettings } from './services/userSettingsService';

const totalLessons = LESSON_PLAN.reduce((sum, module) => sum + module.lessons.length, 0);

declare global {
    interface Window {
        confetti: any;
    }
}

const LockIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
);

const triggerConfetti = () => {
    if (typeof window !== 'undefined' && typeof window.confetti !== 'function') return;

    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

    function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
    }

    const interval = window.setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        if (typeof window.confetti === 'function') {
            window.confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            window.confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }
    }, 250);
};


const App: React.FC = () => {
    const { user, isLoading: isAuthLoading } = useAuth();
    const { completedLessons, markLessonAsCompleted, markLessonAsIncomplete, isProgressLoaded, completedPracticeItems, markPracticeAsCompleted, achievements, newlyEarnedBadges, clearNewBadges } = useProgress();
    const { files: playgroundFiles, isLoaded: isPlaygroundLoaded, createFile, updateFile, deleteFile } = usePlaygroundFiles();
    const { customQuizzes, addCustomQuiz, isLoaded: isQuizzesLoaded } = useCustomQuizzes();
    const [theme, setTheme] = useTheme();

    const handleThemeChange = useCallback((newTheme: 'light' | 'dark') => {
        setTheme(newTheme);
        if (user) {
            import('./services/userSettingsService').then(({ updateUserSettings }) => {
                updateUserSettings(user.id, { theme: newTheme });
            });
        }
    }, [user, setTheme]);


    const navigate = useNavigate();
    const location = useLocation();

    const currentView = useMemo(() => {
        const path = location.pathname;
        if (path === '/') return 'mission';
        if (path === '/dashboard') return 'home';
        if (path.startsWith('/classroom')) return 'classroom';
        if (path.startsWith('/playground')) return 'playground';
        if (path.startsWith('/practice')) return 'practice';
        if (path.startsWith('/profile')) return 'profile';
        if (path.startsWith('/marketplace')) return 'marketplace';
        if (path.startsWith('/about')) return 'about';
        if (path.startsWith('/reference')) return 'reference';
        return 'mission';
    }, [location.pathname]);

    const [playgroundView, setPlaygroundView] = useState<'dashboard' | 'editor'>('dashboard');
    const [practiceCategory, setPracticeCategory] = useState<PracticeType | null>(null);

    const [starBalance, setStarBalance] = useState<number>(0);
    const [starNotification, setStarNotification] = useState<{ amount: number, reason: string } | null>(null);


    // Initialize Pyodide & Check Environment
    useEffect(() => {
        console.log("[Environment] Cross-Origin Isolated:", window.crossOriginIsolated);
        import('./services/pyodideService').then(({ initializePyodide }) => {
            initializePyodide().catch(console.error);
        });
    }, []);

    const [currentModuleId, setCurrentModuleId] = useState<string | null>(null);
    const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
    const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
    const [code, setCode] = useState<string>('');
    const loadedCodeRef = useRef<string | null>(null);
    const [terminalOutput, setTerminalOutput] = useState<string>('> Welcome to the CodeToCoder Terminal!\nClick "Run Code" to see your output here.');
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
        { role: 'model', content: "Hello! I'm your AI assistant. I'm here to help you learn Python. What's your first question?" }
    ]);
    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const [hasCelebrated, setHasCelebrated] = useState(false);
    const [completedModuleBannerInfo, setCompletedModuleBannerInfo] = useState<{ title: string } | null>(null);

    const [activePracticeItem, setActivePracticeItem] = useState<PracticeItem | null>(null);



    const [activePlaygroundFileId, setActivePlaygroundFileId] = useState<string | null>(null);
    const [playgroundEditorCode, setPlaygroundEditorCode] = useState<string>('');

    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    const [aiAssistanceLevel, setAiAssistanceLevel] = useState(7);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
    const [isTerminalLoading, setIsTerminalLoading] = useState<boolean>(false);
    const [isNavOpen, setIsNavOpen] = useState<boolean>(true);
    const [showTutorial, setShowTutorial] = useState<boolean>(false);

    const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
    const [lintIssues, setLintIssues] = useState<LintIssue[]>([]);


    // Playground autocomplete preference
    const [isPlaygroundAutocompleteEnabled, setIsPlaygroundAutocompleteEnabled] = useState(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
            const saved = window.localStorage.getItem('playgroundAutocomplete');
            return saved !== null ? saved === 'true' : true; // Default to true
        }
        return true;
    });

    const [isWaitingForInput, setIsWaitingForInput] = useState(false);
    const [inputPromiseResolve, setInputPromiseResolve] = useState<((val: string) => void) | null>(null);

    const handleInputSubmit = useCallback((value: string) => {
        // Optimistically update output to show what user typed
        setTerminalOutput(prev => prev + value + '\n');
        setIsWaitingForInput(false);
        if (inputPromiseResolve) {
            inputPromiseResolve(value);
            setInputPromiseResolve(null);
        }
    }, [inputPromiseResolve]);

    // Persist autocomplete preference
    useEffect(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem('playgroundAutocomplete', String(isPlaygroundAutocompleteEnabled));
        }
    }, [isPlaygroundAutocompleteEnabled]);

    // Mobile Detection
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        // Initial check
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [isMobile, setIsMobile] = useState(false);
    // On Mobile, default sidebars to closed
    useEffect(() => {
        if (isMobile) {
            setIsNavOpen(false);
            setPanelsCollapsed(prev => ({ ...prev, chat: true }));
        } else {
            setIsNavOpen(true);
            setPanelsCollapsed(prev => ({ ...prev, chat: false }));
        }
    }, [isMobile]);

    const isTerminalLoadingRef = useRef(isTerminalLoading);
    useEffect(() => { isTerminalLoadingRef.current = isTerminalLoading; }, [isTerminalLoading]);

    const [displayedStars, setDisplayedStars] = useState(0);
    const [flyingStar, setFlyingStar] = useState<{ start: { x: number, y: number }, end: { x: number, y: number } } | null>(null);
    const starTargetRef = useRef<HTMLDivElement>(null);

    const [panelSizes, setPanelSizes] = useState({
        nav: 20,
        chat: 25,
        ide: 65,
    });

    const [panelsCollapsed, setPanelsCollapsed] = useState({
        ide: false,
        bottom: false,
        chat: false,
    });

    const [activeBottomTab, setActiveBottomTab] = useState<'lesson' | 'terminal' | 'reference'>('lesson');

    const centerColumnRef = useRef<HTMLDivElement>(null);
    const prevCompletedLessonsRef = useRef<Set<string> | undefined>(undefined);
    const prevCompletedPracticeRef = useRef<Set<string> | undefined>(undefined);

    const totalStars = completedLessons.size + completedPracticeItems.size;

    useEffect(() => {
        prevCompletedLessonsRef.current = completedLessons;
        prevCompletedPracticeRef.current = completedPracticeItems;
    });

    const getStorageKey = useCallback((type: 'lesson' | 'practice', id: string) => {
        return user ? `codetocoder_autosave_${type}_${id}_${user.id} ` : `codetocoder_autosave_${type}_${id} `;
    }, [user]);

    // Reset/Reload state when user context changes (Login/Logout)
    useEffect(() => {
        setCurrentLessonId(null);
        setCurrentModuleId(null);

        setChatHistory([{ role: 'model', content: "Hello! I'm your AI assistant. I'm here to help you learn Python. What's your first question?" }]);
        setActivePlaygroundFileId(null);
        setPlaygroundView('dashboard');
    }, [user]);


    // Load user settings from Firebase
    useEffect(() => {
        if (user) {
            const unsubscribe = subscribeToUserSettings(user.id, (settings) => {
                setTheme(settings.theme);
                setAiAssistanceLevel(settings.aiAssistanceLevel);
            });
            return () => unsubscribe();
        }
    }, [user, setTheme, setAiAssistanceLevel]);

    const loadStarBalance = useCallback(async () => {
        if (!user) {
            setStarBalance(0);
            return;
        }
        const { getMarketplaceData } = await import('./services/marketplaceService');
        const data = await getMarketplaceData(user.id);
        setStarBalance(data.stars.balance);
    }, [user]);

    // Load star balance
    useEffect(() => {
        loadStarBalance();

        // Listen for star updates
        const handleStarUpdate = (event: CustomEvent) => {
            setStarBalance(event.detail.balance);
            if (event.detail.amount > 0) {
                setStarNotification({ amount: event.detail.amount, reason: event.detail.reason });
            }
        };

        window.addEventListener('starUpdate' as any, handleStarUpdate);
        return () => window.removeEventListener('starUpdate' as any, handleStarUpdate);
    }, [user]);

    // Auth-based Routing Logic

    // 1. Protect Dashboard from Guests
    useEffect(() => {
        if (isAuthLoading) return;
        if (!user && currentView === 'home') {
            navigate('/');
        }
    }, [user, isAuthLoading, currentView, navigate]);

    // 2. Redirect to Dashboard on Login (Only trigger on user change)
    useEffect(() => {
        if (isAuthLoading) return;
        if (user && currentView === 'mission') {
            navigate('/dashboard');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, isAuthLoading]);

    // 3. Check if tutorial should be shown for first-time users
    useEffect(() => {
        if (isAuthLoading || !isProgressLoaded) return;

        // Only show tutorial for logged-in users who haven't completed it
        if (user) {
            const checkTutorial = async () => {
                const tutorialCompleted = await hasTutorialCompleted(user.id);
                if (!tutorialCompleted) {
                    // Small delay to ensure the page has loaded
                    setTimeout(() => {
                        setShowTutorial(true);
                    }, 1000);
                }
            };

            checkTutorial();
        }
    }, [user, isAuthLoading, isProgressLoaded]);

    const handleOpenAuth = useCallback(() => {
        console.log("Opening Auth Modal");
        setIsAuthModalOpen(true);
    }, []);

    const prevCompletedLessons = prevCompletedLessonsRef.current;
    const prevCompletedPractice = prevCompletedPracticeRef.current;

    const activePlaygroundFile = useMemo(() =>
        playgroundFiles.find(f => f.id === activePlaygroundFileId),
        [playgroundFiles, activePlaygroundFileId]
    );

    const mostRecentPlaygroundFile = useMemo(() => {
        if (playgroundFiles.length === 0) return null;
        return [...playgroundFiles].sort((a, b) => b.lastModified - a.lastModified)[0];
    }, [playgroundFiles]);

    useEffect(() => {
        if (currentView !== 'playground') {
            setPlaygroundView('dashboard');
            setActivePlaygroundFileId(null);
        }
        if (currentView !== 'practice') {
            setActivePracticeItem(null);
            setPracticeCategory(null);
        }
    }, [currentView]);

    useEffect(() => {
        if (activePlaygroundFile) {
            setPlaygroundEditorCode(activePlaygroundFile.content);
            setSaveStatus('saved');
        } else {
            setPlaygroundEditorCode('');
        }
    }, [activePlaygroundFile]);

    // Load Practice Code or Reload Lesson Code on View Change
    useEffect(() => {
        if (currentView === 'practice' && activePracticeItem) {
            if (activePracticeItem.type !== 'quiz') {
                const key = getStorageKey('practice', activePracticeItem.id);
                const saved = localStorage.getItem(key);
                setCode(saved !== null ? saved : (activePracticeItem.startingCode || ''));
                setTerminalOutput('> Ready for practice.');
                setChatHistory([{ role: 'model', content: "I'm ready to help you with this practice problem!" }]);
            }
            setLintIssues([]);
        } else if (currentView === 'classroom' && currentLesson) {
            // Ensure lesson code is restored when navigating back to classroom
            const key = getStorageKey('lesson', currentLesson.id);
            const saved = localStorage.getItem(key);
            const codeToLoad = saved !== null ? saved : currentLesson.startingCode;
            setCode(codeToLoad);
            setLintIssues([]);
        }
    }, [activePracticeItem, currentView, user, getStorageKey]);

    // Unified Autosave for Classroom and Practice
    useEffect(() => {
        const isClassroom = currentView === 'classroom' && currentLessonId;
        const isPractice = currentView === 'practice' && activePracticeItem && activePracticeItem.type !== 'quiz';

        if (!isClassroom && !isPractice) return;

        setSaveStatus('unsaved');
        const timer = setTimeout(() => {
            setSaveStatus('saving');
            try {
                if (typeof window !== 'undefined' && window.localStorage) {
                    const id = isClassroom ? currentLessonId! : activePracticeItem!.id;
                    const type = isClassroom ? 'lesson' : 'practice';
                    const key = getStorageKey(type, id);
                    window.localStorage.setItem(key, code);
                }
            } catch (e) {
                console.warn('Failed to autosave', e);
            }
            setTimeout(() => setSaveStatus('saved'), 600);
        }, 1000);

        return () => clearTimeout(timer);
    }, [code, currentLessonId, currentView, user, activePracticeItem, getStorageKey]);

    useEffect(() => {
        if (currentView !== 'playground' || !activePlaygroundFileId || playgroundEditorCode === activePlaygroundFile?.content) return;

        setSaveStatus('unsaved');
        const timer = setTimeout(() => {
            setSaveStatus('saving');
            updateFile(activePlaygroundFileId, { content: playgroundEditorCode });
            setTimeout(() => setSaveStatus('saved'), 600);
        }, 1000);

        return () => clearTimeout(timer);
    }, [playgroundEditorCode, activePlaygroundFileId, currentView, updateFile, activePlaygroundFile?.content]);

    const activeCode = currentView === 'playground' ? playgroundEditorCode : code;

    useEffect(() => {
        if (currentView === 'home' || (currentView === 'playground' && playgroundView === 'dashboard') || (currentView === 'practice' && !activePracticeItem) || (currentView === 'practice' && activePracticeItem?.type === 'quiz')) return;

        // Increased debounce to 15000ms to enforce strict rate limit (6 requests/min = 10s/request + safety margin)
        const handler = setTimeout(async () => {
            if (!activeCode.trim()) {
                setLintIssues([]);
                return;
            }
            if (isTerminalLoadingRef.current) return;

            try {
                const issues = await lintCodeWithAI(activeCode);
                if (isTerminalLoadingRef.current) return;
                setLintIssues(issues);
            } catch (error) { /* Silently fail in background */ }
        }, 15000);

        return () => clearTimeout(handler);
    }, [activeCode, currentView, playgroundView, activePracticeItem]);

    useEffect(() => { setLintIssues([]); }, [currentView, currentLessonId, activePlaygroundFileId]);

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (currentView === 'classroom' && loadedCodeRef.current !== null && code !== loadedCodeRef.current) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [code, currentView]);

    useEffect(() => {
        if (!isProgressLoaded) return;

        if (displayedStars === 0 && totalStars > 0 && !flyingStar) {
            setDisplayedStars(totalStars);
            return;
        }

        const prevTotal = (prevCompletedLessons?.size || 0) + (prevCompletedPractice?.size || 0);

        if (completedLessons.size === totalLessons && completedLessons.size > (prevCompletedLessons?.size || 0) && !hasCelebrated) {
            setShowCompletionModal(true);
            triggerConfetti();
            setHasCelebrated(true);
        }

        // Module Completion Logic (Updated for Skip-Ahead Support)
        if (prevCompletedLessons && completedLessons.size > prevCompletedLessons.size) {
            const currentModule = LESSON_PLAN.find(m => m.id === currentModuleId);

            if (currentModule && currentModule.lessons.length > 0) {
                // Check if the FINAL lesson of the module (the gatekeeper) was just completed
                // This allows the banner to show even if the user skipped earlier lessons
                const finalLesson = currentModule.lessons[currentModule.lessons.length - 1];
                const isModuleUnlockedNow = completedLessons.has(finalLesson.id);
                const wasModuleUnlockedBefore = prevCompletedLessons.has(finalLesson.id);

                if (isModuleUnlockedNow && !wasModuleUnlockedBefore) {
                    triggerConfetti();
                    setCompletedModuleBannerInfo({ title: currentModule.title });
                }
            }
        }

        if (totalStars > prevTotal) {
            let sourceId = '';
            if (currentView === 'classroom' && currentLessonId) {
                sourceId = `nav - lesson - ${currentLessonId} `;
            }

            const sourceElement = sourceId ? document.getElementById(sourceId) : null;

            if (sourceElement && starTargetRef.current && totalStars === displayedStars + 1) {
                const startRect = sourceElement.getBoundingClientRect();
                const endRect = starTargetRef.current.getBoundingClientRect();

                if (startRect.width > 0 && startRect.height > 0) {
                    setFlyingStar({
                        start: { x: startRect.left + (startRect.width / 2), y: startRect.top + (startRect.height / 2) },
                        end: { x: endRect.left + (endRect.width / 2), y: endRect.top + (endRect.height / 2) }
                    });
                } else {
                    setDisplayedStars(totalStars);
                    triggerConfetti();
                }
            } else {
                setDisplayedStars(totalStars);
                if (currentView === 'practice') triggerConfetti();
            }
        } else {
            setDisplayedStars(totalStars);
        }

    }, [completedLessons, completedPracticeItems, isProgressLoaded, hasCelebrated, prevCompletedLessons, prevCompletedPractice, currentModuleId, currentLessonId, displayedStars, flyingStar, totalStars, currentView]);

    useEffect(() => {
        if (!currentModuleId || !currentLessonId) return;
        const module = LESSON_PLAN.find(m => m.id === currentModuleId);
        const lesson = module?.lessons.find(l => l.id === currentLessonId);
        if (lesson) {
            setCurrentLesson(lesson);
            if (lesson.id !== currentLesson?.id) {
                setTerminalOutput(`> Terminal ready for Lesson: ${lesson.title} `);
                setLintIssues([]);
            }
        }
    }, [currentLessonId, currentModuleId, currentLesson?.id]);

    useEffect(() => {
        if (currentView === 'playground') setActiveBottomTab('terminal');
        else if (currentView === 'classroom') setActiveBottomTab('lesson');
        else if (currentView === 'practice' && activePracticeItem) setActiveBottomTab('lesson');
    }, [currentView, activePracticeItem]);

    // URL Matchers
    const classroomMatch = useMatch('/classroom/:moduleId/:lessonId');
    const playgroundMatch = useMatch('/playground/:fileId');
    const practiceMatch = useMatch('/practice/:category/:itemId');

    // Sync Playground URL
    useEffect(() => {
        if (playgroundMatch) {
            const { fileId } = playgroundMatch.params;
            if (fileId && fileId !== activePlaygroundFileId) {
                setActivePlaygroundFileId(fileId);
                setPlaygroundView('editor');
            }
        } else if (location.pathname === '/playground') {
            setPlaygroundView('dashboard');
            setActivePlaygroundFileId(null);
        }
    }, [playgroundMatch, location.pathname, activePlaygroundFileId]);

    // Sync Practice URL
    useEffect(() => {
        if (practiceMatch) {
            const { category, itemId } = practiceMatch.params;
            if (category && itemId) {
                // Check if it's already active
                if (activePracticeItem?.id === itemId) return;

                // Find item in constants or custom items
                const item = PRACTICE_ITEMS.find(i => i.id === itemId) || customQuizzes.find(i => i.id === itemId);
                if (item) {
                    setActivePracticeItem(item);
                    setPracticeCategory(category as PracticeType);
                }
            }
        } else if (location.pathname === '/practice') {
            setActivePracticeItem(null);
            // Don't reset category here to allow browsing same category
        }
    }, [practiceMatch, location.pathname, activePracticeItem, customQuizzes]);

    const loadLesson = useCallback((moduleId: string, lessonId: string) => {
        const module = LESSON_PLAN.find(m => m.id === moduleId);
        const lesson = module?.lessons.find(l => l.id === lessonId);
        if (lesson) {
            let savedCode: string | null = null;
            try {
                if (typeof window !== 'undefined' && window.localStorage) {
                    const autosaveKey = user ? `codetocoder_autosave_lesson_${lessonId}_${user.id} ` : `codetocoder_autosave_lesson_${lessonId} `;
                    savedCode = window.localStorage.getItem(autosaveKey);
                }
            } catch (e) {
                console.warn('Failed to load saved lesson', e);
            }
            const finalCode = savedCode !== null ? savedCode : lesson.startingCode;
            setCode(finalCode);
            loadedCodeRef.current = finalCode;
            setLintIssues([]);
            setSaveStatus('saved');

            setCurrentModuleId(moduleId);
            setCurrentLessonId(lessonId);
        }
    }, [user]);

    // Sync URL to State
    useEffect(() => {
        if (classroomMatch) {
            const { moduleId, lessonId } = classroomMatch.params;
            if (moduleId && lessonId && (moduleId !== currentModuleId || lessonId !== currentLessonId)) {
                loadLesson(moduleId, lessonId);
            }
        }
    }, [classroomMatch, currentModuleId, currentLessonId, loadLesson]);

    // Update Document Title
    useEffect(() => {
        if (currentView === 'playground' && activePlaygroundFile) {
            document.title = `${activePlaygroundFile.name} - CodeToCoder`;
        } else if (currentView === 'classroom' && currentLesson) {
            document.title = `${currentLesson.title} - CodeToCoder`;
        } else if (currentView === 'practice' && activePracticeItem) {
            document.title = `${activePracticeItem.title} - CodeToCoder`;
        } else {
            document.title = 'CodeToCoder - Learn Python with AI';
        }
    }, [currentView, activePlaygroundFile, currentLesson, activePracticeItem]);

    const changeLesson = useCallback((moduleId: string, lessonId: string, force: boolean = false) => {
        if (!force && currentLessonId && loadedCodeRef.current !== null && code !== loadedCodeRef.current) {
            if (!window.confirm("You have unsaved changes. Do you want to save them and switch lessons?")) return;
        }

        // Save current lesson before switching
        if (currentLessonId) {
            try {
                if (typeof window !== 'undefined' && window.localStorage) {
                    const autosaveKey = getStorageKey('lesson', currentLessonId);
                    window.localStorage.setItem(autosaveKey, code);
                }
            } catch (e) {
                console.warn('Failed to save lesson progress', e);
            }
        }

        // Navigate to the new URL - the useEffect above will handle loading the data
        navigate(`/classroom/${moduleId}/${lessonId}`);

        // On mobile, close nav after selection
        if (isMobile) {
            setIsNavOpen(false);
        }
    }, [code, currentLessonId, user, isMobile, getStorageKey, navigate]);

    const handleNavigate = useCallback((view: ViewState) => {
        if (view === 'classroom') {
            // Reset to landing page state
            setCurrentLessonId(null);
            setCurrentLesson(null);
            navigate('/classroom');
            return;
        }

        // Only reset practice category when leaving practice entirely
        if (currentView === 'practice' && view !== 'practice') {
            setPracticeCategory(null);
        }

        if (view === 'home') navigate('/dashboard');
        else if (view === 'mission') navigate('/');
        else navigate(`/${view}`);

        // Log page view analytics
        import('./services/analyticsService').then(({ logPageView }) => {
            logPageView(view);
        });
    }, [currentView, navigate]);

    const handleSelectLesson = useCallback((moduleId: string, lessonId: string) => {
        if (!user) {
            handleOpenAuth();
            return;
        }
        changeLesson(moduleId, lessonId, false);
    }, [changeLesson, user, handleOpenAuth]);

    const advanceToNextLesson = useCallback(() => {
        const currentModule = LESSON_PLAN.find(m => m.id === currentModuleId);
        if (currentModule && currentLesson) {
            const currentIndex = currentModule.lessons.findIndex(l => l.id === currentLesson.id);
            if (currentIndex !== -1 && currentIndex < currentModule.lessons.length - 1) {
                const nextLesson = currentModule.lessons[currentIndex + 1];
                setTimeout(() => {
                    changeLesson(currentModule.id, nextLesson.id, true);
                    setActiveBottomTab('lesson');
                }, 2000);
            }
        }
    }, [currentModuleId, currentLesson, changeLesson]);

    const handleQuizComplete = useCallback(() => {
        if (currentView === 'practice' && activePracticeItem) {
            if (!completedPracticeItems.has(activePracticeItem.id)) {
                markPracticeAsCompleted(activePracticeItem.id);
                // Award stars (one-time only)
                if (user) {
                    import('./services/starService').then(({ awardStarsForActivity }) => {
                        awardStarsForActivity(user.id, 'practice', activePracticeItem.id).then(result => {
                            if (result.awarded) {
                                setStarNotification({
                                    amount: result.amount,
                                    reason: `Completed ${activePracticeItem.title}`
                                });
                            }
                        });
                    });
                }
                // Log analytics event
                import('./services/analyticsService').then(({ logPracticeComplete }) => {
                    logPracticeComplete(activePracticeItem.id, activePracticeItem.title, activePracticeItem.type);
                });
            }
            setTimeout(() => setActivePracticeItem(null), 2000);
        } else if (currentLesson) {
            if (!completedLessons.has(currentLesson.id)) {
                markLessonAsCompleted(currentLesson.id);
                // Award stars (one-time only)
                if (user) {
                    import('./services/starService').then(({ awardStarsForActivity }) => {
                        awardStarsForActivity(user.id, 'lesson', currentLesson.id).then(result => {
                            if (result.awarded) {
                                setStarNotification({
                                    amount: result.amount,
                                    reason: `Completed ${currentLesson.title}`
                                });
                            }
                        });
                    });
                }
                // Log analytics event
                import('./services/analyticsService').then(({ logLessonComplete }) => {
                    logLessonComplete(currentLesson.id, currentLesson.title);
                });
            }
            advanceToNextLesson();
        }
    }, [currentLesson, markLessonAsCompleted, advanceToNextLesson, currentView, activePracticeItem, markPracticeAsCompleted, user, completedLessons, completedPracticeItems]);


    const handleRunCode = useCallback(async () => {
        if (isTerminalLoading) return;

        const contextItem = currentView === 'practice' ? activePracticeItem : currentLesson;
        if (!contextItem && currentView !== 'practice') return;

        setIsTerminalLoading(true);
        setTerminalOutput('Running code...\n');
        setActiveBottomTab('terminal');
        setLintIssues([]);

        try {
            // 1. Run Code Locally (Pyodide)
            const { runPythonCode } = await import('./services/pyodideService');
            
            // We use callbacks to stream output and handle input
            const result = await runPythonCode(code, {
                onOutput: (text) => setTerminalOutput(prev => prev + text),
                onError: (err) => setTerminalOutput(prev => prev + '\nError: ' + err),
                onInput: (prompt, callback) => {
                    setTerminalOutput(prev => prev + prompt);
                    setIsWaitingForInput(true);
                    setInputPromiseResolve(() => callback);
                }
            });

            // 2. Get AI Feedback (Async, if assistance level > 5)
            if (aiAssistanceLevel > 5) {
                const objective = (contextItem as any).objective || contextItem?.objective;
                import('./services/geminiService').then(async ({ getFeedback }) => {
                    const feedback = await getFeedback(code, result.output, objective, aiAssistanceLevel <= 5);
                    if (feedback) {
                        setChatHistory(prev => [...prev, { role: 'model', content: feedback }]);
                        if (!isMobile) {
                            setPanelsCollapsed(prev => ({ ...prev, chat: false }));
                        }
                    }
                });
            }

            // 3. Check Success (Simple check based on stderr for now, can be enhanced)
            const success = true; // pyodideService wraps errors, but we can assume success if no 'Error:' string or similar, but simplified for now
            // Actually result.success is available if we use standard runPythonCode wrapper, 
            // but we might need to adjust logic since we stream output now.
            // But wait, runPythonCode DOES return a final object too.
            
            if (result.success && contextItem) {
                if (currentView === 'practice') {
                    if (!completedPracticeItems.has(contextItem.id)) {
                        markPracticeAsCompleted(contextItem.id);
                        if (user) {
                            import('./services/starService').then(({ awardStarsForActivity }) => {
                                awardStarsForActivity(user.id, 'practice', contextItem.id).then(result => {
                                    if (result.awarded) {
                                        setStarNotification({
                                            amount: result.amount,
                                            reason: `Completed ${contextItem.title}`
                                        });
                                    }
                                });
                            });
                        }
                    }
                } else {
                    // Validate lesson completion with dual check (output + methodology)
                    if (!completedLessons.has(contextItem.id)) {

                        // Type guard: Only validate if it's a Lesson (not PracticeItem)
                        // PracticeItems don't have 'goal' property required by validation
                        if ('goal' in contextItem) {
                            // Import validation service
                            const { validateLessonCompletion } = await import('./services/lessonValidationService');

                            console.log('[App] Validating lesson:', contextItem.id);
                            console.log('[App] Code length:', code.length);
                            console.log('[App] Output:', result.output.trim());

                            // Perform validation
                            const validation = await validateLessonCompletion(
                                code,
                                result.output,
                                contextItem
                            );

                            if (validation.passed) {
                                // Both output and methodology are correct
                                console.log('[App] Validation passed! Marking complete...');
                                triggerConfetti(); // Visual feedback
                                await markLessonAsCompleted(contextItem.id);

                                if (user) {
                                    import('./services/starService').then(({ awardStarsForActivity }) => {
                                        awardStarsForActivity(user.id, 'lesson', contextItem.id).then(result => {
                                            if (result.awarded) {
                                                setStarNotification({
                                                    amount: result.amount,
                                                    reason: `Completed ${contextItem.title}`
                                                });
                                            }
                                        });
                                    });
                                }

                                // Small delay to allow state to update before moving?
                                // await new Promise(r => setTimeout(r, 100));
                                advanceToNextLesson();
                            } else {
                                // Validation failed - log reason but don't show to user
                                console.log('[Lesson Validation Failed]', validation.reason);
                                // Code ran successfully but didn't meet requirements
                                // User sees the output but lesson doesn't complete
                            }
                        } else {
                            // This shouldn't happen in classroom view, but handle gracefully
                            markLessonAsCompleted(contextItem.id);
                            if (user) {
                                import('./services/starService').then(({ awardStarsForActivity }) => {
                                    awardStarsForActivity(user.id, 'lesson', contextItem.id).then(result => {
                                        if (result.awarded) {
                                            setStarNotification({
                                                amount: result.amount,
                                                reason: `Completed ${contextItem.title}`
                                            });
                                        }
                                    });
                                });
                            }
                            advanceToNextLesson();
                        }
                    } else {
                        // Already completed, just advance
                        advanceToNextLesson();
                    }
                }
            }
        } catch (error) {
            console.error("Error running code:", error);
            setTerminalOutput("An error occurred while running the code.");
        } finally {
            setIsTerminalLoading(false);
        }
    }, [code, currentLesson, isTerminalLoading, markLessonAsCompleted, aiAssistanceLevel, advanceToNextLesson, currentView, activePracticeItem, markPracticeAsCompleted, isMobile, user, completedPracticeItems, completedLessons]);

    const handleRunPlaygroundCode = useCallback(async () => {
        if (isTerminalLoading || !activePlaygroundFileId) return;

        setIsTerminalLoading(true);
        updateFile(activePlaygroundFileId, { terminalOutput: 'Running...' });
        setActiveBottomTab('terminal');
        setLintIssues([]);

        // Log analytics event
        import('./services/analyticsService').then(({ logPlaygroundRun }) => {
            logPlaygroundRun();
        });

        try {
            // 1. Run Code Locally
            const { runPythonCode } = await import('./services/pyodideService');
            const result = await runPythonCode(playgroundEditorCode);

            // 2. Update Output Immediately
            updateFile(activePlaygroundFileId, { terminalOutput: result.output });

            // 3. Get Feedback (Async)
            if (aiAssistanceLevel > 5) {
                import('./services/geminiService').then(async ({ getFeedback }) => {
                    const feedback = await getFeedback(playgroundEditorCode, result.output, undefined, aiAssistanceLevel <= 5);
                    if (feedback) {
                        const newChatHistory = activePlaygroundFile?.chatHistory ? [...activePlaygroundFile.chatHistory] : [];
                        newChatHistory.push({ role: 'model', content: feedback });
                        updateFile(activePlaygroundFileId, { chatHistory: newChatHistory });
                    }
                });
            }
        } catch (error) {
            updateFile(activePlaygroundFileId, { terminalOutput: "An error occurred while running the playground code." });
        } finally {
            setIsTerminalLoading(false);
        }
    }, [playgroundEditorCode, isTerminalLoading, aiAssistanceLevel, activePlaygroundFileId, updateFile, activePlaygroundFile?.chatHistory]);


    const handleSendMessage = useCallback(async (message: string) => {
        if (isChatLoading) return;

        const isPlayground = currentView === 'playground';
        let historyForAI: ChatMessage[] = [];

        // Optimistically update UI and local state with user message
        if (isPlayground) {
            if (!activePlaygroundFile) return;
            historyForAI = [...activePlaygroundFile.chatHistory, { role: 'user', content: message }];
            updateFile(activePlaygroundFile.id, { chatHistory: historyForAI });
        } else {
            historyForAI = [...chatHistory, { role: 'user', content: message }];
            setChatHistory(historyForAI);
        }

        setIsChatLoading(true);

        try {
            let lessonContext: Lesson | null = null;
            if (currentView === 'classroom') lessonContext = currentLesson;
            else if (currentView === 'practice' && activePracticeItem) {
                lessonContext = {
                    id: activePracticeItem.id,
                    title: activePracticeItem.title,
                    content: activePracticeItem.content || activePracticeItem.description,
                    objective: activePracticeItem.objective || '',
                    startingCode: activePracticeItem.startingCode || '',
                    goal: activePracticeItem.description,
                    commonMistakes: ''
                };
            }

            // Pass the *updated* history (local variable) to the AI service
            const response = await getChatResponse(historyForAI, isPlayground ? null : lessonContext, activeCode, aiAssistanceLevel <= 5);

            if (isPlayground && activePlaygroundFileId) {
                // Append model response to history
                updateFile(activePlaygroundFileId, { chatHistory: [...historyForAI, { role: 'model', content: response }] });
            } else {
                setChatHistory(prev => [...prev, { role: 'model', content: response }]);
            }
        } catch (error) {
            console.error("Error getting chat response:", error);
            const errorMsg = "Sorry, I encountered an error. Please try again.";
            if (isPlayground && activePlaygroundFileId) {
                updateFile(activePlaygroundFileId, { chatHistory: [...historyForAI, { role: 'model', content: errorMsg }] });
            } else {
                setChatHistory(prev => [...prev, { role: 'model', content: errorMsg }]);
            }
        } finally {
            setIsChatLoading(false);
        }
    }, [chatHistory, activePlaygroundFile, currentLesson, isChatLoading, aiAssistanceLevel, currentView, updateFile, activePracticeItem, activePlaygroundFileId]);

    const handleResetCode = useCallback(() => {
        setIsResetModalOpen(true);
    }, []);

    const handleConfirmReset = useCallback(() => {
        if (currentView === 'playground' && activePlaygroundFileId) {
            setPlaygroundEditorCode('');
            updateFile(activePlaygroundFileId, { content: '', terminalOutput: '> Playground cleared.' });
        } else if (currentView === 'classroom' && currentLesson) {
            const resetCode = currentLesson.startingCode;
            setCode(resetCode);
            setTerminalOutput(`> Code has been reset for Lesson: ${currentLesson.title}`);
            markLessonAsIncomplete(currentLesson.id);
            try {
                if (typeof window !== 'undefined' && window.localStorage) {
                    const autosaveKey = getStorageKey('lesson', currentLesson.id);
                    window.localStorage.setItem(autosaveKey, resetCode);
                }
            } catch (e) {
                console.warn('Failed to save reset code', e);
            }
            loadedCodeRef.current = resetCode;
        } else if (currentView === 'practice' && activePracticeItem) {
            const resetCode = activePracticeItem.startingCode || '';
            setCode(resetCode);
            setTerminalOutput(`> Code has been reset for Practice: ${activePracticeItem.title}`);
            try {
                if (typeof window !== 'undefined' && window.localStorage) {
                    const autosaveKey = getStorageKey('practice', activePracticeItem.id);
                    window.localStorage.setItem(autosaveKey, resetCode);
                }
            } catch (e) { console.warn(e) }
        }
        setLintIssues([]);
        setSaveStatus('saved');
        setIsResetModalOpen(false);
    }, [currentLesson, markLessonAsIncomplete, currentView, activePlaygroundFileId, updateFile, activePracticeItem, user, getStorageKey]);

    const handlePlaygroundNew = useCallback((name: string) => {
        if (!user) {
            handleOpenAuth();
            return;
        }
        const newFile = createFile(name);
        setActivePlaygroundFileId(newFile.id);
        setPlaygroundView('editor');
    }, [createFile, user, handleOpenAuth]);

    const handlePlaygroundOpen = useCallback((fileId: string) => {
        setActivePlaygroundFileId(fileId);
        setPlaygroundView('editor');
        navigate(`/playground/${fileId}`);
    }, [navigate]);

    const handlePlaygroundRename = useCallback((fileId: string, newName: string) => {
        updateFile(fileId, { name: newName });
    }, [updateFile]);

    const handlePlaygroundDelete = useCallback((fileId: string) => {
        deleteFile(fileId);
        if (activePlaygroundFileId === fileId) {
            setActivePlaygroundFileId(null);
            setPlaygroundView('dashboard');
        }
    }, [deleteFile, activePlaygroundFileId]);

    const handlePlaygroundResume = useCallback((fileId: string) => {
        setActivePlaygroundFileId(fileId);
        setPlaygroundView('editor');
        navigate(`/playground/${fileId}`);
    }, [navigate]);

    const handleExportCode = useCallback(() => {
        const codeToSave = (currentView === 'classroom' || currentView === 'practice') ? code : playgroundEditorCode;
        const blob = new Blob([codeToSave], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        let filename = 'code.py';
        if (currentView === 'classroom' && currentLesson) {
            filename = `${currentLesson.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.py`;
        } else if (currentView === 'practice' && activePracticeItem) {
            filename = `${activePracticeItem.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.py`;
        } else if (activePlaygroundFile) {
            filename = activePlaygroundFile.name;
        }

        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        const message = `\n> Exported to ${filename}`;
        if (currentView === 'classroom' || currentView === 'practice') setTerminalOutput(prev => prev + message);
        else if (activePlaygroundFileId) updateFile(activePlaygroundFileId, { terminalOutput: (activePlaygroundFile?.terminalOutput ?? '') + message });

    }, [code, playgroundEditorCode, currentView, currentLesson, activePlaygroundFile, activePlaygroundFileId, updateFile, activePracticeItem]);

    const handleImportCode = useCallback(() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.py,.txt';

        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                const content = event.target?.result as string;
                if (content) {
                    if ((currentView === 'classroom' && currentLessonId) || (currentView === 'practice' && activePracticeItem)) {
                        setCode(content);
                        setTerminalOutput(prev => prev + `\n> Loaded ${file.name}`);
                        if (currentView === 'classroom' && currentLessonId) {
                            try {
                                if (typeof window !== 'undefined' && window.localStorage) {
                                    const autosaveKey = getStorageKey('lesson', currentLessonId);
                                    window.localStorage.setItem(autosaveKey, content);
                                }
                            } catch (e) {
                                console.warn('Failed to save imported code', e);
                            }
                        } else if (currentView === 'practice' && activePracticeItem) {
                            try {
                                if (typeof window !== 'undefined' && window.localStorage) {
                                    const autosaveKey = getStorageKey('practice', activePracticeItem.id);
                                    window.localStorage.setItem(autosaveKey, content);
                                }
                            } catch (e) { console.warn(e) }
                        }
                    } else {
                        const newFile = createFile(file.name, content);
                        setActivePlaygroundFileId(newFile.id);
                        setPlaygroundView('editor');
                    }
                    setLintIssues([]);
                    setSaveStatus('saved');
                }
            };
            reader.readAsText(file);
        };

        input.click();
    }, [currentView, currentLessonId, createFile, activePracticeItem, user, getStorageKey]);

    const handleGetHelp = useCallback(async () => {
        const helpMessage = `I'm stuck. My current code is:\n\n\`\`\`python\n${activeCode}\n\`\`\`\n\nCan you give me a hint?`;
        // On mobile, ensure chat is open
        if (isMobile) setPanelsCollapsed(prev => ({ ...prev, chat: false }));
        handleSendMessage(helpMessage);
    }, [activeCode, handleSendMessage, isMobile]);




    const handleToggleCollapse = (panel: keyof typeof panelsCollapsed) => {
        setPanelsCollapsed(prev => ({ ...prev, [panel]: !prev[panel] }));
    };

    const handleMouseDown = useCallback((type: 'nav' | 'chat' | 'ide', e: React.MouseEvent) => {
        if (isMobile) return; // Disable resizing on mobile

        e.preventDefault();
        const startPos = (type === 'ide') ? e.clientY : e.clientX;
        const startSizes = { ...panelSizes };

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const currentPos = (type === 'ide') ? moveEvent.clientY : moveEvent.clientX;
            const delta = currentPos - startPos;

            setPanelSizes(prevSizes => {
                const newSizes = { ...prevSizes };
                switch (type) {
                    case 'nav': {
                        const dWidth = (delta / window.innerWidth) * 100;
                        newSizes.nav = Math.max(15, Math.min(startSizes.nav + dWidth, 40));
                        break;
                    }
                    case 'chat': {
                        const dWidth = (delta / window.innerWidth) * 100;
                        newSizes.chat = Math.max(15, Math.min(startSizes.chat - dWidth, 50));
                        break;
                    }
                    case 'ide': {
                        const containerHeight = centerColumnRef.current?.clientHeight ?? window.innerHeight;
                        const dHeight = (delta / containerHeight) * 100;
                        newSizes.ide = Math.max(20, Math.min(startSizes.ide + dHeight, 85));
                        break;
                    }
                }
                return newSizes;
            });
        };

        const handleMouseUp = () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    }, [panelSizes, isMobile]);

    if (!isProgressLoaded || !isPlaygroundLoaded || !isQuizzesLoaded || isAuthLoading || (currentView === 'classroom' && currentLessonId && !currentLesson)) {
        return <div className="bg-white dark:bg-gray-900 text-black dark:text-white h-screen flex items-center justify-center">Loading...</div>;
    }

    const isClassroom = currentView === 'classroom';
    const isPlayground = currentView === 'playground';
    const isPractice = currentView === 'practice';


    const activeSetCode = (isClassroom || isPractice) ? setCode : setPlaygroundEditorCode;
    const activeRunCode = (isClassroom || isPractice) ? handleRunCode : handleRunPlaygroundCode;
    const activeTerminalOutput = (isClassroom || isPractice) ? terminalOutput : activePlaygroundFile?.terminalOutput ?? '';
    const activeChatHistory = (isClassroom || isPractice) ? chatHistory : activePlaygroundFile?.chatHistory ?? [];
    const activeLesson = isClassroom ? currentLesson : null;

    let practiceLessonLike: Lesson | null = null;
    if (isPractice && activePracticeItem) {
        practiceLessonLike = {
            id: activePracticeItem.id,
            title: activePracticeItem.title,
            content: activePracticeItem.content || activePracticeItem.description,
            startingCode: activePracticeItem.startingCode || '',
            objective: activePracticeItem.objective || '',
            goal: activePracticeItem.description,
            quizQuestions: activePracticeItem.quizQuestions
        };
    }

    const activeContentItem = isClassroom ? activeLesson : practiceLessonLike;

    // Sidebar visibility logic for mobile vs desktop
    const showSidebar = isClassroom && isNavOpen;

    const isQuizMode = (isClassroom && activeLesson?.type === 'quiz') || (isPractice && activePracticeItem?.type === 'quiz');
    const isClassroomQuiz = isClassroom && activeLesson?.type === 'quiz';

    const isPracticeQuiz = isPractice && activePracticeItem?.type === 'quiz';


    const showChatPanel = !isPracticeQuiz && !(isClassroom && !currentLessonId) && currentView !== 'home';



    const renderIdeView = () => (
        <main className="flex flex-col md:flex-row h-full w-full bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 overflow-hidden relative">
            {isResetModalOpen && (
                <ConfirmationModal
                    isOpen={isResetModalOpen}
                    onClose={() => setIsResetModalOpen(false)}
                    onConfirm={handleConfirmReset}
                    title={currentView === 'playground' ? "Clear Code?" : "Are you sure you want to reset?"}
                    message={currentView === 'playground' ? "Your current code will be cleared." : "Your code will be lost. This will also remove your star for this lesson."}
                />
            )}
            {completedModuleBannerInfo && (
                <ModuleCompletionBanner
                    moduleTitle={completedModuleBannerInfo.title}
                    onClose={() => setCompletedModuleBannerInfo(null)}
                />
            )}
            {showCompletionModal && <CompletionModal onClose={() => setShowCompletionModal(false)} />}

            {(isClassroom) && (
                <>
                    {/* Mobile Navigation Overlay */}
                    {isMobile && isNavOpen && (
                        <div
                            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
                            onClick={() => setIsNavOpen(false)}
                        />
                    )}

                    <aside
                        style={{
                            width: isMobile ? '80%' : (showSidebar ? `${panelSizes.nav}%` : 'auto'),
                            maxWidth: isMobile ? '300px' : 'none',
                            // Update height and top to match new header height (5rem/80px)
                            height: isMobile ? 'calc(100% - 5rem)' : '100%',
                            top: isMobile ? '5rem' : '0'
                        }}
                        className={`
            bg-gray-50 dark:bg-gray-900 flex flex-col 
            transition-all duration-300 ease-in-out border-r border-gray-200 dark:border-gray-800
            ${isMobile
                                ? `fixed left-0 z-40 transform ${isNavOpen ? 'translate-x-0' : '-translate-x-full'}`
                                : 'relative h-full flex-shrink-0'
                            }
            ${!showSidebar && !isMobile ? 'hidden' : ''}
        `}
                    >
                        <div className={`h-12 px-4 flex items-center justify-between flex-shrink-0 border-b border-gray-200 dark:border-gray-800`}>
                            <div className="flex items-center gap-2">
                                <HamburgerIcon onClick={() => setIsNavOpen(!isNavOpen)} isOpen={isNavOpen} />
                                {showSidebar && (
                                    <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider animate-fade-in">Curriculum</h2>
                                )}
                            </div>
                        </div>
                        {showSidebar && (
                            <div className="flex-1 relative min-w-[200px] overflow-hidden flex flex-col">
                                <div className="flex-1 overflow-y-auto">
                                    <NavigationPanel
                                        modules={LESSON_PLAN}
                                        currentLessonId={currentLessonId || ''}
                                        onSelectLesson={handleSelectLesson}
                                        completedLessons={completedLessons}
                                    />
                                </div>
                            </div>
                        )}
                    </aside>
                </>
            )}

            {showSidebar && !isMobile && <Resizer direction="horizontal" onMouseDown={(e) => handleMouseDown('nav', e)} />}

            <div ref={centerColumnRef} className="flex-1 flex flex-col min-w-0 bg-white dark:bg-gray-900 transition-all duration-300 ease-in-out relative">
                {/* Mobile Curriculum Trigger (When Nav is hidden) */}
                {isClassroom && isMobile && !isNavOpen && (
                    <button
                        onClick={() => setIsNavOpen(true)}
                        className="absolute top-2 left-0 z-20 bg-cyan-600 text-white p-2 rounded-r-md shadow-lg opacity-90 hover:opacity-100 transition-opacity"
                        aria-label="Open Curriculum"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>
                    </button>
                )}

                {(isClassroom && !currentLessonId) ? (
                    <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 p-8 text-center animate-fade-in h-full">
                        <div className="max-w-md space-y-6">
                            <div className="w-24 h-24 bg-cyan-100 dark:bg-cyan-900/30 rounded-full flex items-center justify-center mx-auto text-cyan-600 dark:text-cyan-400 mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                                </svg>
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome to the Classroom</h2>
                            <p className="text-lg">
                                Select a module from the sidebar on the left to start your lesson.
                            </p>
                            <div className="flex justify-center gap-2 text-sm text-cyan-600 dark:text-cyan-400 font-medium items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 animate-bounce-x">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                                </svg>
                                <span>Pick a lesson</span>
                            </div>
                        </div>
                        <style>{`
            @keyframes bounce-x {
                0%, 100% { transform: translateX(0); }
                50% { transform: translateX(-25%); }
            }
            .animate-bounce-x {
                animation: bounce-x 1s infinite;
            }
        `}</style>
                    </div>
                ) : isLearnMode && activeLesson ? (
                    <LearnPanel
                        lesson={activeLesson}
                        onComplete={() => {
                            if (!completedLessons.has(activeLesson.id)) {
                                markLessonAsCompleted(activeLesson.id);
                                if (user) {
                                    import('./services/starService').then(({ awardStarsForActivity }) => {
                                        awardStarsForActivity(user.id, 'lesson', activeLesson.id).then(result => {
                                            if (result.awarded) {
                                                setStarNotification({
                                                    amount: result.amount,
                                                    reason: `Completed ${activeLesson.title}`
                                                });
                                            }
                                        });
                                    });
                                }
                            }
                            advanceToNextLesson();
                        }}
                        isCompleted={completedLessons.has(activeLesson.id)}
                        onPreviousLesson={handlePreviousLessonNav}
                        onNextLesson={handleNextLessonNav}
                        hasPreviousLesson={navigationState.hasPrevious}
                        hasNextLesson={navigationState.hasNext}
                    />
                ) : isQuizMode && activeContentItem ? (
                    <div className="h-full flex flex-col">
                        {isPracticeQuiz && (
                            <div className="h-14 flex-shrink-0 border-b border-gray-200 dark:border-gray-800 flex items-center px-4 bg-white dark:bg-gray-900 justify-between relative z-10">
                                <button
                                    onClick={() => {
                                        setActivePracticeItem(null);
                                        navigate('/practice');
                                    }}
                                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-cyan-600 dark:text-gray-400 dark:hover:text-cyan-400 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700 rounded-md"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                                    </svg>
                                    Back
                                </button>
                                <h2 className="font-bold text-gray-800 dark:text-gray-200 text-sm mr-4">{activeContentItem.title}</h2>
                            </div>
                        )}
                        <QuizPanel
                            questions={activeContentItem.quizQuestions || []}
                            onComplete={handleQuizComplete}
                            isCollapsed={false}
                            onToggleCollapse={() => { }}
                        />
                    </div>
                ) : (
                    <>
                        <div
                            style={{ height: isMobile ? '55%' : (panelsCollapsed.ide ? 'auto' : `${panelSizes.ide}%`) }}
                            className={`flex flex-col transition-all duration-300 ease-in-out ${!panelsCollapsed.ide && panelsCollapsed.bottom ? 'flex-1' : 'flex-shrink-0'}`}
                        >
                            <IdePanel
                                code={activeCode}
                                setCode={activeSetCode}
                                onRunCode={activeRunCode}
                                isLoading={isTerminalLoading}
                                onResetCode={handleResetCode}
                                onGetHelp={handleGetHelp}
                                isCollapsed={panelsCollapsed.ide}
                                onToggleCollapse={() => handleToggleCollapse('ide')}
                                onExportCode={(isPlayground || isPractice) ? handleExportCode : undefined}
                                onImportCode={(isPlayground || isPractice) ? handleImportCode : undefined}
                                resetButtonLabel={isPlayground ? "Clear" : "Reset"}
                                lintIssues={lintIssues}
                                saveStatus={saveStatus}
                                fileName={isPlayground ? activePlaygroundFile?.name : (isPractice ? activePracticeItem?.title : undefined)}
                                onFileNameChange={isPlayground && activePlaygroundFileId ? (newName) => updateFile(activePlaygroundFileId, { name: newName }) : undefined}
                                onBackToDashboard={isPlayground ? () => {
                                    setPlaygroundView('dashboard');
                                    navigate('/playground');
                                } : isPractice ? () => {
                                    setActivePracticeItem(null);
                                    navigate('/practice');
                                } : undefined}
                                backButtonLabel={isPlayground ? "Files" : (isPractice ? "Back" : undefined)}
                                enableAutocomplete={isPlayground && isPlaygroundAutocompleteEnabled}
                                onToggleAutocomplete={isPlayground ? () => setIsPlaygroundAutocompleteEnabled(prev => !prev) : undefined}
                            />
                        </div>

                        {!panelsCollapsed.ide && !panelsCollapsed.bottom && !isMobile && <Resizer direction="vertical" onMouseDown={(e) => handleMouseDown('ide', e)} />}

                        <div className={`flex flex-col min-h-0 transition-all duration-300 ease-in-out ${panelsCollapsed.bottom ? 'flex-shrink-0' : 'flex-1'}`}>
                            <BottomPanel
                                lesson={currentLesson}
                                isCompleted={currentLesson ? completedLessons.has(currentLesson.id) : false}
                                terminalOutput={terminalOutput}
                                isTerminalLoading={isTerminalLoading}
                                isCollapsed={panelsCollapsed.bottom}
                                onToggleCollapse={() => setPanelsCollapsed(prev => ({ ...prev, bottom: !prev.bottom }))}
                                activeTab={activeBottomTab}
                                onTabChange={setActiveBottomTab}
                                showReference={true}
                                isWaitingForInput={isWaitingForInput}
                                onInputSubmit={handleInputSubmit}
                            />
                        </div>
                    </>
                )}
            </div>

            {showChatPanel && (
                <>
                    {!panelsCollapsed.chat && !isMobile && <Resizer direction="horizontal" onMouseDown={(e) => handleMouseDown('chat', e)} />}

                    {/* Mobile Chat Overlay */}
                    {isMobile && !panelsCollapsed.chat && (
                        <div
                            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
                            onClick={() => handleToggleCollapse('chat')}
                        />
                    )}

                    <aside
                        style={{
                            width: isMobile ? '85%' : (panelsCollapsed.chat ? 'auto' : `${panelSizes.chat}%`),
                            maxWidth: isMobile ? '350px' : 'none',
                            // Update height and top to match new header height (5rem/80px)
                            height: isMobile ? 'calc(100% - 5rem)' : '100%',
                            top: isMobile ? '5rem' : '0'
                        }}
                        className={`
            bg-gray-50 dark:bg-gray-900 flex flex-col 
            transition-all duration-300 ease-in-out border-l border-gray-200 dark:border-gray-800
            ${!panelsCollapsed.chat ? 'min-w-[250px]' : ''}
            ${isMobile
                                ? `fixed right-0 z-40 transform ${!panelsCollapsed.chat ? 'translate-x-0' : 'translate-x-full'}`
                                : 'relative h-full flex-shrink-0'
                            }
        `}
                    >
                        {/* Mobile Chat Toggle */}
                        {isMobile && panelsCollapsed.chat && !isQuizMode && (
                            <button
                                onClick={() => handleToggleCollapse('chat')}
                                className="fixed bottom-20 right-4 z-20 bg-cyan-600 text-white p-3 rounded-full shadow-lg hover:bg-cyan-500 transition-colors"
                                aria-label="Open AI Chat"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
                                </svg>
                            </button>
                        )}

                        {isClassroomQuiz ? (
                            <div className="h-full w-full bg-black flex flex-col items-center justify-center text-gray-500 border-l border-gray-800">
                                <div className="p-6 rounded-full bg-gray-900 mb-4">
                                    <LockIcon className="w-12 h-12 text-gray-500" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-400">AI Locked</h3>
                                <p className="text-sm text-center px-6 mt-2">
                                    The AI assistant is disabled during classroom quizzes to test your knowledge.
                                </p>
                            </div>
                        ) : (
                            <ChatPanel
                                messages={activeChatHistory}
                                onSendMessage={handleSendMessage}
                                isLoading={isChatLoading}
                                isCollapsed={isMobile ? false : panelsCollapsed.chat} // Always show content if drawer is open on mobile
                                onToggleCollapse={() => handleToggleCollapse('chat')}
                            />
                        )}
                    </aside>
                </>
            )}
        </main>
    );



    return (
        <>
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
            <div className="h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans relative overflow-hidden">
                {flyingStar && (
                    <FlyingStar
                        start={flyingStar.start}
                        end={flyingStar.end}
                        onComplete={() => {
                            setDisplayedStars(totalStars);
                            setFlyingStar(null);
                        }}
                    />
                )}

                <Header
                    currentView={currentView}
                    onNavigate={handleNavigate}
                    theme={theme}
                    setTheme={handleThemeChange}

                    starTargetRef={starTargetRef}
                    onOpenAuth={handleOpenAuth}
                    starBalance={starBalance}
                />

                {/* Badge Notifications */}
                {newlyEarnedBadges.length > 0 && (
                    <BadgeNotification
                        badge={newlyEarnedBadges[0]}
                        onClose={() => {
                            clearNewBadges();
                        }}
                    />
                )}

                {/* Star Notifications */}
                {starNotification && (
                    <StarNotification
                        amount={starNotification.amount}
                        reason={starNotification.reason}
                        onClose={() => setStarNotification(null)}
                    />
                )}

                {/* Tutorial Overlay for first-time users */}
                {showTutorial && (
                    <TutorialOverlay
                        userId={user?.id}
                        onComplete={() => setShowTutorial(false)}
                        onSkip={() => setShowTutorial(false)}
                    />
                )}

                <div className="flex-1 flex overflow-hidden relative">
                    <Routes>
                        <Route path="/" element={
                            <div className="h-full w-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                                <MissionPage onStart={() => {
                                    if (user) {
                                        handleNavigate('classroom');
                                    } else {
                                        handleOpenAuth();
                                    }
                                }} onNavigate={handleNavigate} />
                            </div>
                        } />

                        <Route path="/dashboard" element={
                            <div className="h-full w-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                                <HomePage
                                    onNavigate={handleNavigate}
                                    onSelectLesson={handleSelectLesson}
                                    completedLessons={completedLessons}
                                    playgroundFiles={playgroundFiles}
                                    mostRecentPlaygroundFile={mostRecentPlaygroundFile}
                                    onPlaygroundResume={handlePlaygroundResume}
                                />
                            </div>
                        } />

                        <Route path="/about" element={<AboutTeam onBack={() => handleNavigate('home')} />} />

                        <Route path="/profile" element={
                            <ProfilePage
                                stats={{ lessons: completedLessons.size, practice: completedPracticeItems.size }}
                                achievements={achievements}
                                onNavigate={handleNavigate}
                                theme={theme}
                                setTheme={handleThemeChange}
                            />
                        } />

                        <Route path="/marketplace" element={<MarketplacePage onNavigate={handleNavigate} onOpenAuth={handleOpenAuth} />} />




                        <Route path="/playground" element={
                            <PlaygroundDashboard
                                files={playgroundFiles}
                                onNewFile={handlePlaygroundNew}
                                onOpenFile={handlePlaygroundOpen}
                                onDeleteFile={handlePlaygroundDelete}
                                onRenameFile={handlePlaygroundRename}
                                onImportFile={handleImportCode}
                                lastActiveFile={mostRecentPlaygroundFile}
                                onResume={handlePlaygroundResume}
                            />
                        } />

                        <Route path="/practice" element={
                            <PracticeDashboard
                                onSelectItem={(item) => {
                                    if (!user) {
                                        handleOpenAuth();
                                        return;
                                    }
                                    setActivePracticeItem(item);
                                    navigate(`/practice/${item.type}/${item.id}`);
                                }}
                                completedItems={completedPracticeItems}
                                currentType={practiceCategory}
                                onSelectType={setPracticeCategory}
                                customItems={customQuizzes}
                                onAddCustomItem={addCustomQuiz}
                                onNavigate={(path) => navigate(path)}
                            />
                        } />

                        {/* IDE Views */}
                        <Route path="/classroom/*" element={renderIdeView()} />
                        <Route path="/playground/:fileId" element={renderIdeView()} />
                        <Route path="/practice/:category/:itemId" element={renderIdeView()} />
                        <Route path="/reference" element={<ReferencePanel />} />
                        <Route path="/reference/:itemId" element={<ReferencePanel />} />

                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </div>
            </div>
        </>
    );
};
export default App;

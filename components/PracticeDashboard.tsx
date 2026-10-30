import React, { useState, useMemo } from 'react';
import type { PracticeItem, PracticeType, Difficulty } from '../types';
import { GenerateQuizModal } from './GenerateQuizModal';
import { generatePracticeQuiz } from '../services/geminiService';
import { Helmet } from 'react-helmet-async';
import { formatCompactNumber } from '../utils/formatters';



interface PracticeDashboardProps {
    practiceItems: PracticeItem[]; // Built-in items from GCS or fallback
    onSelectItem: (item: PracticeItem) => void;
    completedItems: Set<string>;
    currentType: PracticeType | null;
    onSelectType: (type: PracticeType | null) => void;
    customItems?: PracticeItem[]; // User-generated items from Firestore
    onAddCustomItem?: (item: PracticeItem) => void;
    onNavigate?: (path: string) => void;
    activities?: UserActivity[];
    /** Teachers: when provided, each practice card gets an Assign button. */
    onAssignItem?: (item: PracticeItem) => void;
}


import { 
    BrainCircuit, 
    Terminal, 
    Rocket, 
    BookOpen, 
    Sparkles, 
    Star,
    History,
    CheckCircle2
} from 'lucide-react';
import type { UserActivity } from '../types';


const DifficultyBadge: React.FC<{ difficulty: Difficulty }> = ({ difficulty }) => {
    let colorClass = "";
    switch (difficulty) {
        case 'Easy': colorClass = "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"; break;
        case 'Medium': colorClass = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"; break;
        case 'Hard': colorClass = "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"; break;
    }
    return (
        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${colorClass}`}>
            {difficulty}
        </span>
    );
};

export const PracticeDashboard: React.FC<PracticeDashboardProps> = ({
    practiceItems, // From GCS/fallback
    onSelectItem,
    completedItems,
    currentType,
    onSelectType,
    customItems = [], // From Firestore per-user
    onAddCustomItem,
    onNavigate,
    activities = [],
    onAssignItem,
}) => {

    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);

    // Combine built-in items (from GCS) with custom items (from Firestore)
    const allItems = useMemo(() => {
        return [...customItems, ...practiceItems];
    }, [customItems, practiceItems]);

    const filteredItems = useMemo(() => {
        if (!currentType) return [];

        const items = allItems.filter(item => item.type === currentType);

        // Sort order: Easy -> Medium -> Hard
        const difficultyOrder: Record<string, number> = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };

        return items.sort((a, b) => {
            const diffA = difficultyOrder[a.difficulty] || 99;
            const diffB = difficultyOrder[b.difficulty] || 99;
            if (diffA !== diffB) return diffA - diffB;

            // Secondary sort by title
            return a.title.localeCompare(b.title);
        });
    }, [currentType, allItems]);

    const handleBack = () => onSelectType(null);

    const handleGenerateQuiz = async (topic: string, difficulty: Difficulty) => {
        if (!onAddCustomItem) return;

        const newQuiz = await generatePracticeQuiz(topic, difficulty);
        if (newQuiz) {
            onAddCustomItem(newQuiz);
        } else {
            alert("Failed to generate quiz. Please try again.");
        }
    };

    if (currentType) {
        const typeLabel = currentType === 'quiz' ? 'Quizzes' : `${currentType}s`;

        return (
            <div className="p-4 max-w-5xl mx-auto h-full overflow-y-auto w-full">
            <Helmet>
              <title>Practice {typeLabel} - Code2Coder</title>
              <meta name="description" content={`Practice your Python skills with interactive ${typeLabel.toLowerCase()}. Get instant feedback and track your progress.`} />
            </Helmet>
                <GenerateQuizModal
                    isOpen={isGenerateModalOpen}
                    onClose={() => setIsGenerateModalOpen(false)}
                    onGenerate={handleGenerateQuiz}
                />

                <div className="mb-6 flex flex-wrap items-center gap-4">
                    <button
                        onClick={handleBack}
                        className="back-btn flex items-center gap-2 text-gray-500 hover:text-cyan-600 dark:text-gray-400 dark:hover:text-cyan-400 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                        </svg>
                        <span className="hidden sm:inline">Back</span>
                    </button>

                    <h2 className="text-xl font-bold text-gray-900 dark:text-white capitalize">
                        Practice {typeLabel}
                    </h2>
                    
                    <div className="flex-1" />
                    
                    {/* Stats */}
                    <div className="flex items-center gap-2 text-sm">
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg font-semibold">
                            {filteredItems.filter(i => completedItems.has(i.id)).length} done
                        </span>
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg">
                            {filteredItems.length} total
                        </span>
                    </div>
                </div>

                <div className="grid gap-3">
                    {/* Generator Card for Quizzes */}
                    {currentType === 'quiz' && onAddCustomItem && (
                        <button
                            onClick={() => setIsGenerateModalOpen(true)}
                            className="bg-cyan-600 p-5 rounded-xl hover:scale-[1.01] transition-all text-left flex justify-between items-center group text-white mb-6 shadow-md border border-cyan-400/30"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                                    <Sparkles className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-0.5">
                                        AI Quiz Generator
                                    </h3>
                                    <p className="text-sm text-cyan-50 opacity-90">
                                        Generate a custom quiz on any topic
                                    </p>
                                </div>
                            </div>
                            <div className="bg-white/20 p-2.5 rounded-xl text-white group-hover:bg-white group-hover:text-cyan-600 transition-all duration-300">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                            </div>
                        </button>
                    )}

                    {(() => {
                        const completedList = filteredItems.filter(i => 
                            completedItems.has(i.id) || 
                            activities.some(a => a.itemId === i.id)
                        );
                        const availableList = filteredItems.filter(i => 
                            !completedItems.has(i.id) && 
                            !activities.some(a => a.itemId === i.id)
                        );
                        
                        const renderItem = (item: PracticeItem, index: number) => {
                            const isCompleted = completedItems.has(item.id);
                            const isCustom = item.id.startsWith('custom-');
                            
                            // Calculate attempts and last score from activities
                            const itemActivities = activities.filter(a => a.itemId === item.id);
                            const attempts = itemActivities.length;
                            const lastAttempt = itemActivities.length > 0 
                                ? itemActivities.reduce((prev, curr) => prev.timestamp > curr.timestamp ? prev : curr)
                                : null;
                            const lastScore = lastAttempt?.score;

                            return (
                                <div
                                    key={item.id}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => onSelectItem(item)}
                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectItem(item); } }}
                                    style={{ animationDelay: `${index * 40}ms` }}
                                    className={`p-5 rounded-xl border-2 transition-all text-left flex justify-between items-center group animate-slide-up opacity-0 shadow-sm cursor-pointer ${isCustom
                                        ? 'bg-purple-50/50 dark:bg-purple-900/10 border-purple-200/60 dark:border-purple-800/50 hover:border-purple-400'
                                        : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700/50 hover:border-cyan-400 dark:hover:border-cyan-600'
                                        }`}
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center flex-wrap gap-3 mb-2">
                                            <h3 className="text-lg font-bold text-gray-800 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors truncate">
                                                {item.title}
                                            </h3>
                                            <DifficultyBadge difficulty={item.difficulty} />
                                            {isCustom && (
                                                <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 rounded-md">AI Generated</span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-1">
                                            {item.description}
                                        </p>
                                        
                                        {(attempts > 0 || lastScore !== undefined) && (
                                            <div className="flex items-center gap-4 text-xs font-bold ">
                                                {attempts > 0 && (
                                                    <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800/80 px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700">
                                                        <History className="w-3.5 h-3.5" />
                                                        <span>{attempts} {attempts === 1 ? 'Attempt' : 'Attempts'}</span>
                                                    </div>
                                                )}
                                                {lastScore !== undefined && (
                                                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md border ${
                                                        lastScore >= 100 
                                                            ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/50'
                                                            : lastScore >= 80 
                                                                ? 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800/50'
                                                                : 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800/50'
                                                    }`}>
                                                        <Star className={`w-3.5 h-3.5 ${lastScore >= 100 ? 'fill-current' : ''}`} />
                                                        <span>Score: {Math.round(lastScore)}%</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 ml-4">
                                        {onAssignItem && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onAssignItem(item); }}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
                                                title="Assign to a class"
                                            >
                                                Assign
                                            </button>
                                        )}
                                        {isCompleted ? (
                                            <div className="p-2.5 bg-green-50 dark:bg-green-900/30 rounded-xl border border-green-200 dark:border-green-800/50 text-green-600 dark:text-green-400 shadow-sm">
                                                <CheckCircle2 className="w-6 h-6" />
                                            </div>
                                        ) : (
                                            <div className="p-2.5 text-gray-300 dark:text-gray-600 group-hover:text-cyan-500 group-hover:bg-cyan-50 dark:group-hover:bg-cyan-900/20 rounded-xl transition-all">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        };

                        return (
                            <div className="space-y-10">
                                {availableList.length > 0 && (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 px-1">
                                            <div className="w-1.5 h-6 bg-cyan-500 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.4)]" />
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white ">Yet to Start</h3>
                                            <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20 px-2 py-0.5 rounded-md border border-cyan-100 dark:border-cyan-800/40">{availableList.length}</span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {availableList.map((item, idx) => renderItem(item, idx))}
                                        </div>
                                    </div>
                                )}


                                {completedList.length > 0 && (
                                    <div className="space-y-6 pt-4">
                                        <div className="flex items-center gap-3 px-1">
                                            <div className="w-1.5 h-6 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white ">Completed</h3>
                                            <span className="text-sm font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-md border border-green-100 dark:border-green-800/40">{completedList.length}</span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-90 transition-opacity hover:opacity-100">
                                            {completedList.map((item, idx) => renderItem(item, idx + availableList.length))}
                                        </div>
                                    </div>
                                )}

                                
                                {filteredItems.length === 0 && (
                                    <div className="py-20 text-center animate-fade-in">
                                        <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 text-gray-400">
                                            <Sparkles className="w-10 h-10" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No {typeLabel} found</h3>
                                        <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                                            Feel free to generate a new quiz or check back later for more content.
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                </div>

            </div>
        );
    }

    const modes: { type: PracticeType; title: string; blurb: string; icon: React.ReactNode }[] = [
        { type: 'quiz', title: 'Quizzes', blurb: 'Check you understand the ideas with short multiple-choice questions.', icon: <BrainCircuit className="w-5 h-5" aria-hidden="true" /> },
        { type: 'problem', title: 'Coding problems', blurb: 'Write small programs and get feedback on your solution.', icon: <Terminal className="w-5 h-5" aria-hidden="true" /> },
        { type: 'project', title: 'Mini projects', blurb: 'Build something bigger that uses everything so far.', icon: <Rocket className="w-5 h-5" aria-hidden="true" /> },
    ];
    const completedCount = allItems.filter(i => completedItems.has(i.id)).length;

    return (
        <div className="h-full w-full bg-gray-50 dark:bg-gray-950 overflow-y-auto">
            <Helmet>
                <title>Practice Dashboard</title>
                <meta name="description" content="Choose your practice mode: Quizzes, Problems, or Projects. Hone your Python skills." />
            </Helmet>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
                <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Practice</h1>
                        <p className="mt-1 text-gray-600 dark:text-gray-400">
                            {formatCompactNumber(completedCount)} of {formatCompactNumber(allItems.length)} done. Work through them in order, or jump in anywhere.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onNavigate?.('/reference')}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800"
                        >
                            <BookOpen className="w-4 h-4" aria-hidden="true" />
                            Reference
                        </button>
                        {onAddCustomItem && (
                            <button
                                onClick={() => { onSelectType('quiz'); setIsGenerateModalOpen(true); }}
                                className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-cyan-600 hover:bg-cyan-700 text-sm font-semibold text-white"
                            >
                                <Sparkles className="w-4 h-4" aria-hidden="true" />
                                Make a quiz with AI
                            </button>
                        )}
                    </div>
                </header>

                <ol className="mt-8 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800 overflow-hidden">
                    {modes.map((mode, index) => {
                        const items = allItems.filter(i => i.type === mode.type);
                        const done = items.filter(i => completedItems.has(i.id)).length;
                        const percent = items.length ? Math.round((done / items.length) * 100) : 0;
                        return (
                            <li key={mode.type}>
                                <button
                                    onClick={() => onSelectType(mode.type)}
                                    className="w-full flex items-center gap-4 sm:gap-5 px-4 sm:px-6 py-5 text-left hover:bg-gray-50 dark:hover:bg-gray-800/60 group"
                                >
                                    <span className="flex-shrink-0 w-9 h-9 rounded-full border border-gray-300 dark:border-gray-700 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-400" aria-hidden="true">
                                        {index + 1}
                                    </span>
                                    <span className="flex-shrink-0 hidden sm:flex w-10 h-10 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 items-center justify-center">
                                        {mode.icon}
                                    </span>
                                    <span className="flex-1 min-w-0">
                                        <span className="block text-lg font-bold text-gray-900 dark:text-white">{mode.title}</span>
                                        <span className="block text-sm text-gray-600 dark:text-gray-400">{mode.blurb}</span>
                                        <span className="mt-3 flex items-center gap-3">
                                            <span className="flex-1 max-w-xs h-1.5 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                                                <span className="block h-full rounded-full bg-cyan-500" style={{ width: `${percent}%` }} />
                                            </span>
                                            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 tabular-nums">{done} / {items.length}</span>
                                        </span>
                                    </span>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 flex-shrink-0 text-gray-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                                    </svg>
                                </button>
                            </li>
                        );
                    })}
                </ol>
            </div>
        </div>
    );
};

import React, { useState, useMemo } from 'react';
import type { PracticeItem, PracticeType, Difficulty } from '../types';
import { GenerateQuizModal } from './GenerateQuizModal';
import { generatePracticeQuiz } from '../services/geminiService';
import { Helmet } from 'react-helmet-async';



interface PracticeDashboardProps {
    practiceItems: PracticeItem[]; // Built-in items from GCS or fallback
    onSelectItem: (item: PracticeItem) => void;
    completedItems: Set<string>;
    currentType: PracticeType | null;
    onSelectType: (type: PracticeType | null) => void;
    customItems?: PracticeItem[]; // User-generated items from Firestore
    onAddCustomItem?: (item: PracticeItem) => void;
    onNavigate?: (path: string) => void;

}

import { 
    BrainCircuit, 
    Terminal, 
    Rocket, 
    BookOpen, 
    Sparkles, 
    Star 
} from 'lucide-react';

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
    onNavigate

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
                            className="bg-gradient-to-r from-cyan-600 to-cyan-500 p-4 rounded-lg hover:scale-[1.01] transition-all text-left flex justify-between items-center group text-white mb-3"
                        >
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="p-1.5 bg-white/20 rounded-lg">
                                        <Sparkles className="w-5 h-5 text-white" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white">
                                        Create New Quiz
                                    </h3>
                                </div>
                                <p className="text-sm text-cyan-50">
                                    Generate a custom quiz on any topic
                                </p>
                            </div>
                            <div className="bg-white/20 p-2 rounded-lg text-white group-hover:bg-white group-hover:text-cyan-600 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                            </div>
                        </button>
                    )}

                    {filteredItems.map((item, index) => {
                        const isCompleted = completedItems.has(item.id);
                        const isCustom = item.id.startsWith('custom-');

                        return (
                            <button
                                key={item.id}
                                onClick={() => onSelectItem(item)}
                                style={{ animationDelay: `${index * 30}ms` }}
                                className={`p-4 rounded-lg border-2 transition-all text-left flex justify-between items-center group animate-slide-up opacity-0 ${isCustom
                                    ? 'bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800 hover:border-purple-500'
                                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-cyan-500'
                                    }`}
                            >
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-bold text-gray-800 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                                            {item.title}
                                        </h3>
                                        <DifficultyBadge difficulty={item.difficulty} />
                                        {isCustom && (
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-500 border border-purple-200 dark:border-purple-800 px-1.5 py-0.5 rounded">AI Generated</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {item.description}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    {isCompleted && (
                                        <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-full border border-yellow-200 dark:border-yellow-700/50">
                                            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                        </div>
                                    )}
                                    <div className="p-2 text-gray-400 group-hover:text-cyan-500 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                        </svg>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }

    // Calculate stats for display
    const quizCount = allItems.filter(i => i.type === 'quiz').length;
    const problemCount = allItems.filter(i => i.type === 'problem').length;
    const projectCount = allItems.filter(i => i.type === 'project').length;
    const completedCount = allItems.filter(i => completedItems.has(i.id)).length;

    return (
        <div className="h-full w-full bg-gray-50 dark:bg-gray-900 overflow-y-auto">
            <Helmet>
                <title>Practice Dashboard</title>
                <meta name="description" content="Choose your practice mode: Quizzes, Problems, or Projects. Hone your Python skills." />
            </Helmet>
            
            <div className="max-w-6xl mx-auto p-4 space-y-6">
                {/* Header with Stats */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Practice Center</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Sharpen your Python skills</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-700">
                            <span className="text-sm font-bold text-green-700 dark:text-green-300">{completedCount} completed</span>
                        </div>
                        <div className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">{allItems.length} total</span>
                        </div>
                    </div>
                </div>

                {/* Featured: Create Quiz CTA */}
                {onAddCustomItem && (
                    <button
                        onClick={() => { onSelectType('quiz'); setIsGenerateModalOpen(true); }}
                        className="w-full bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 rounded-lg p-5 text-left group hover:shadow-lg transition-all"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/20 rounded-lg">
                                    <Sparkles className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Generate Custom Quiz</h3>
                                    <p className="text-sm text-white/80">Use AI to create a quiz on any Python topic</p>
                                </div>
                            </div>
                            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg text-white font-semibold group-hover:bg-white group-hover:text-purple-600 transition-colors">
                                Create
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                            </div>
                        </div>
                    </button>
                )}

                {/* Main Category Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Quizzes */}
                    <button
                        onClick={() => onSelectType('quiz')}
                        className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-5 text-left hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-md transition-all group"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg group-hover:scale-110 transition-transform">
                                <BrainCircuit className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                            </div>
                            <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-bold rounded-lg">
                                {quizCount} available
                            </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                            Practice Quizzes
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                            Test your knowledge with multiple-choice questions on Python concepts
                        </p>
                        <div className="flex items-center text-sm font-semibold text-purple-600 dark:text-purple-400">
                            Start Quiz
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                            </svg>
                        </div>
                    </button>

                    {/* Problems */}
                    <button
                        onClick={() => onSelectType('problem')}
                        className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-5 text-left hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all group"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:scale-110 transition-transform">
                                <Terminal className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-lg">
                                {problemCount} available
                            </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            Coding Problems
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                            Solve focused coding challenges with instant feedback and hints
                        </p>
                        <div className="flex items-center text-sm font-semibold text-blue-600 dark:text-blue-400">
                            Start Problem
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                            </svg>
                        </div>
                    </button>

                    {/* Projects */}
                    <button
                        onClick={() => onSelectType('project')}
                        className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-5 text-left hover:border-orange-500 dark:hover:border-orange-500 hover:shadow-md transition-all group"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg group-hover:scale-110 transition-transform">
                                <Rocket className="w-7 h-7 text-orange-600 dark:text-orange-400" />
                            </div>
                            <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-bold rounded-lg">
                                {projectCount} available
                            </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                            Mini Projects
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                            Build complete applications with open-ended creative challenges
                        </p>
                        <div className="flex items-center text-sm font-semibold text-orange-600 dark:text-orange-400">
                            Start Project
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                            </svg>
                        </div>
                    </button>
                </div>

                {/* Reference Section */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border-2 border-green-200 dark:border-green-800 p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-lg">
                                <BookOpen className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Reference Material</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Browse Python documentation, cheat sheets, and guides</p>
                            </div>
                        </div>
                        <button
                            onClick={() => onNavigate?.('/reference')}
                            className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg transition-colors"
                        >
                            Open Reference
                        </button>
                    </div>
                </div>

                {/* Tips Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-5">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">💡 Practice Tips</h3>
                    <div className="grid sm:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-start gap-2">
                            <span className="text-purple-500 font-bold">1.</span>
                            <span>Start with quizzes to test your understanding of concepts</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="text-blue-500 font-bold">2.</span>
                            <span>Move to problems for hands-on coding practice</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="text-orange-500 font-bold">3.</span>
                            <span>Tackle projects to apply everything you've learned</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

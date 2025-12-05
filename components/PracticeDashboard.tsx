
import React, { useState, useMemo } from 'react';
import type { PracticeItem, PracticeType, Difficulty } from '../types';
import { PRACTICE_ITEMS } from '../constants';
import { GenerateQuizModal } from './GenerateQuizModal';
import { generatePracticeQuiz } from '../services/geminiService';



interface PracticeDashboardProps {
    onSelectItem: (item: PracticeItem) => void;
    completedItems: Set<string>;
    currentType: PracticeType | null;
    onSelectType: (type: PracticeType | null) => void;
    customItems?: PracticeItem[];
    onAddCustomItem?: (item: PracticeItem) => void;
    onNavigate?: (path: string) => void;

}

import QuizIcon from '../assets/icons/QuizIcon.svg?react';
import ProblemIcon from '../assets/icons/ProblemIcon.svg?react';
import ProjectIcon from '../assets/icons/ProjectIcon.svg?react';
import BookIcon from '../assets/icons/BookIcon.svg?react';

import SparklesIcon from '../assets/icons/SparklesIcon.svg?react';
import StarFilled from '../assets/icons/StarIcon.svg?react';

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
    onSelectItem,
    completedItems,
    currentType,
    onSelectType,
    customItems = [],
    onAddCustomItem,
    onNavigate

}) => {
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);

    const allItems = useMemo(() => {
        return [...customItems, ...PRACTICE_ITEMS];
    }, [customItems]);

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
            <div className="p-8 max-w-5xl mx-auto h-full overflow-y-auto w-full">
                <GenerateQuizModal
                    isOpen={isGenerateModalOpen}
                    onClose={() => setIsGenerateModalOpen(false)}
                    onGenerate={handleGenerateQuiz}
                />

                <div className="mb-8 grid grid-cols-[auto_1fr_auto] sm:grid-cols-[1fr_auto_1fr] items-center gap-4">
                    <button
                        onClick={handleBack}
                        className="back-btn flex items-center gap-2 text-gray-500 hover:text-cyan-600 dark:text-gray-400 dark:hover:text-cyan-400 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                        </svg>
                        <span className="hidden sm:inline">Back to Categories</span>
                        <span className="sm:hidden">Back</span>
                    </button>

                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white capitalize animate-fade-in text-center">
                        Practice {typeLabel}
                    </h2>

                    <div className="hidden sm:block"></div> {/* Spacer for alignment */}
                </div>

                <div className="grid gap-4">
                    {/* Generator Card for Quizzes */}
                    {currentType === 'quiz' && onAddCustomItem && (
                        <button
                            onClick={() => setIsGenerateModalOpen(true)}
                            className="bg-gradient-to-r from-cyan-600 to-cyan-500 p-6 rounded-xl shadow-md hover:shadow-lg hover:scale-[1.01] transition-all text-left flex justify-between items-center group text-white mb-4 animate-slide-up"
                        >
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-white/20 rounded-full">
                                        <SparklesIcon className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white">
                                        Create New Quiz
                                    </h3>
                                </div>
                                <p className="text-sm text-cyan-50 max-w-lg">
                                    Use AI to generate a custom quiz on any Python topic you want to practice.
                                </p>
                            </div>
                            <div className="bg-white/20 p-2 rounded-full text-white group-hover:bg-white group-hover:text-cyan-600 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
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
                                style={{ animationDelay: `${index * 50}ms` }}
                                className={`p-6 rounded-xl border shadow-sm hover:shadow-md transition-all text-left flex justify-between items-center group animate-slide-up opacity-0 ${isCustom
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
                                            <StarFilled className="w-5 h-5 text-yellow-500" />
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

    return (
        <div className="flex flex-col items-center justify-center h-full w-full p-8 overflow-y-auto">
            <div className="w-full max-w-5xl mx-auto flex flex-col items-center animate-fade-in">
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-12 text-center">Choose Your Practice</h1>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
                    <button
                        onClick={() => onSelectType('quiz')}
                        style={{ animationDelay: '0ms' }}
                        className="neon-glow-purple flex flex-col items-center text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-transparent transform hover:-translate-y-1 transition-all group animate-slide-up opacity-0"
                    >
                        <div className="bg-purple-100 dark:bg-purple-900/30 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform">
                            <QuizIcon className="w-12 h-12 text-purple-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Practice Quizzes</h2>
                        <p className="text-gray-500 dark:text-gray-400">Test your knowledge with rapid-fire questions.</p>
                    </button>

                    <button
                        onClick={() => onSelectType('problem')}
                        style={{ animationDelay: '100ms' }}
                        className="neon-glow-blue flex flex-col items-center text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-transparent transform hover:-translate-y-1 transition-all group animate-slide-up opacity-0"
                    >
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform">
                            <ProblemIcon className="w-12 h-12 text-blue-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Practice Problems</h2>
                        <p className="text-gray-500 dark:text-gray-400">Solve specific coding challenges with focused goals.</p>
                    </button>

                    <button
                        onClick={() => onSelectType('project')}
                        style={{ animationDelay: '200ms' }}
                        className="neon-glow-orange flex flex-col items-center text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-transparent transform hover:-translate-y-1 transition-all group animate-slide-up opacity-0"
                    >
                        <div className="bg-orange-100 dark:bg-orange-900/30 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform">
                            <ProjectIcon className="w-12 h-12 text-orange-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Practice Projects</h2>
                        <p className="text-gray-500 dark:text-gray-400">Build complete, open-ended applications.</p>
                    </button>

                    <button
                        onClick={() => onNavigate?.('/reference')}
                        style={{ animationDelay: '300ms' }}
                        className="neon-glow-green flex flex-col items-center text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-transparent transform hover:-translate-y-1 transition-all group animate-slide-up opacity-0"
                    >
                        <div className="bg-green-100 dark:bg-green-900/30 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform">
                            <BookIcon className="w-12 h-12 text-green-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Reference Material</h2>
                        <p className="text-gray-500 dark:text-gray-400">Browse Python documentation and guides.</p>
                    </button>


                </div>
            </div>
        </div>
    );
};

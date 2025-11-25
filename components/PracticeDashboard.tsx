
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
}

const QuizIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-purple-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
    </svg>
);

const ProblemIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-blue-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
    </svg>
);

const ProjectIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-orange-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
    </svg>
);

const SparklesIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
    </svg>
);

const StarFilled = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-yellow-500">
        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
    </svg>
);

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
    onAddCustomItem
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

                <div className="relative mb-8 flex items-center justify-center">
                    <button 
                        onClick={handleBack}
                        className="absolute left-0 flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-cyan-600 font-semibold transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                        </svg>
                        Back to Categories
                    </button>
                    
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white capitalize animate-fade-in text-center">
                        Practice {typeLabel}
                    </h2>
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
                                className={`p-6 rounded-xl border shadow-sm hover:shadow-md transition-all text-left flex justify-between items-center group animate-slide-up opacity-0 ${
                                    isCustom 
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
                                            <StarFilled />
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
                
                <div className="grid md:grid-cols-3 gap-8 w-full">
                    <button 
                        onClick={() => onSelectType('quiz')}
                        style={{ animationDelay: '0ms' }}
                        className="flex flex-col items-center text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl border-2 border-transparent hover:border-purple-500 transition-all group animate-slide-up opacity-0"
                    >
                        <div className="bg-purple-100 dark:bg-purple-900/30 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform">
                            <QuizIcon />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Practice Quizzes</h2>
                        <p className="text-gray-500 dark:text-gray-400">Test your knowledge with rapid-fire questions.</p>
                    </button>

                    <button 
                        onClick={() => onSelectType('problem')}
                        style={{ animationDelay: '100ms' }}
                        className="flex flex-col items-center text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl border-2 border-transparent hover:border-blue-500 transition-all group animate-slide-up opacity-0"
                    >
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform">
                            <ProblemIcon />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Practice Problems</h2>
                        <p className="text-gray-500 dark:text-gray-400">Solve specific coding challenges with focused goals.</p>
                    </button>

                    <button 
                        onClick={() => onSelectType('project')}
                        style={{ animationDelay: '200ms' }}
                        className="flex flex-col items-center text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl border-2 border-transparent hover:border-orange-500 transition-all group animate-slide-up opacity-0"
                    >
                        <div className="bg-orange-100 dark:bg-orange-900/30 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform">
                            <ProjectIcon />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Practice Projects</h2>
                        <p className="text-gray-500 dark:text-gray-400">Build complete, open-ended applications.</p>
                    </button>
                </div>
            </div>
        </div>
    );
};

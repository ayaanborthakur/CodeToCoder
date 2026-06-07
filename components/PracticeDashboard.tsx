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
                            className="bg-gradient-to-r from-cyan-600 to-cyan-500 p-5 rounded-xl hover:scale-[1.01] transition-all text-left flex justify-between items-center group text-white mb-6 shadow-md border border-cyan-400/30"
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
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 rounded-md">AI Generated</span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-1">
                                            {item.description}
                                        </p>
                                        
                                        {(attempts > 0 || lastScore !== undefined) && (
                                            <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider">
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
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-widest">Yet to Start</h3>
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
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-widest">Completed</h3>
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Practice Center</h1>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Master Python through interactive challenges</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800/50 shadow-sm">
                            <span className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-widest block mb-0.5">Completed</span>
                            <span className="text-lg font-bold text-green-900 dark:text-green-100">{formatCompactNumber(completedCount)} <span className="text-xs opacity-60 font-medium">/{formatCompactNumber(allItems.length)}</span></span>
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
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Category Cards... (keeping same as before for brevity in chunking but applying better shadows/padding) */}
                    <button
                        onClick={() => onSelectType('quiz')}
                        className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-100 dark:border-gray-700/50 p-6 text-left hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-xl transition-all group relative overflow-hidden"
                    >
                        <div className="flex items-start justify-between mb-5">
                            <div className="p-3.5 bg-purple-100 dark:bg-purple-900/30 rounded-xl group-hover:scale-110 transition-transform">
                                <BrainCircuit className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                            </div>
                            <span className="px-2.5 py-1 bg-purple-100/60 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-purple-200/50 dark:border-purple-800/30">
                                {quizCount} QUIZZES
                            </span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                            Practice Quizzes
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 font-medium leading-relaxed">
                            Test your knowledge with conceptual multiple-choice questions
                        </p>
                        <div className="flex items-center text-sm font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest">
                            Browse
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4 ml-2 group-hover:translate-x-1.5 transition-transform">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                            </svg>
                        </div>
                    </button>

                    <button
                        onClick={() => onSelectType('problem')}
                        className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-100 dark:border-gray-700/50 p-6 text-left hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-xl transition-all group relative overflow-hidden"
                    >
                        <div className="flex items-start justify-between mb-5">
                            <div className="p-3.5 bg-blue-100 dark:bg-blue-900/30 rounded-xl group-hover:scale-110 transition-transform">
                                <Terminal className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="px-2.5 py-1 bg-blue-100/60 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-blue-200/50 dark:border-blue-800/30">
                                {problemCount} PROBLEMS
                            </span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            Coding Problems
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 font-medium leading-relaxed">
                            Solve focused coding challenges with instant AI feedback
                        </p>
                        <div className="flex items-center text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                            Browse
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4 ml-2 group-hover:translate-x-1.5 transition-transform">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                            </svg>
                        </div>
                    </button>

                    <button
                        onClick={() => onSelectType('project')}
                        className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-100 dark:border-gray-700/50 p-6 text-left hover:border-orange-500 dark:hover:border-orange-500 hover:shadow-xl transition-all group relative overflow-hidden"
                    >
                        <div className="flex items-start justify-between mb-5">
                            <div className="p-3.5 bg-orange-100 dark:bg-orange-900/30 rounded-xl group-hover:scale-110 transition-transform">
                                <Rocket className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                            </div>
                            <span className="px-2.5 py-1 bg-orange-100/60 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-orange-200/50 dark:border-orange-800/30">
                                {projectCount} PROJECTS
                            </span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                            Mini Projects
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 font-medium leading-relaxed">
                            Build real apps and apply everything you've learned
                        </p>
                        <div className="flex items-center text-sm font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest">
                            Browse
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4 ml-2 group-hover:translate-x-1.5 transition-transform">
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

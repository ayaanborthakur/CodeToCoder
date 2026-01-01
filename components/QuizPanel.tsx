
import React, { useState, useMemo } from 'react';
import type { QuizQuestion } from '../types';
import { CollapseIcon } from './CollapseIcon';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface QuizPanelProps {
    questions: QuizQuestion[];
    onComplete: () => void;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
    id?: string;
    title?: string;
}

import { CheckCircle2, XCircle } from 'lucide-react';

export const QuizPanel: React.FC<QuizPanelProps> = ({ questions, onComplete, isCollapsed, onToggleCollapse, id, title }) => {
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState<number | null>(null);
    const startTimeRef = React.useRef(Date.now());

    const handleOptionSelect = (questionId: string, optionIndex: number) => {
        if (submitted) return;
        setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
    };

    const handleSubmit = async () => {
        let correctCount = 0;
        questions.forEach(q => {
            if (answers[q.id] === q.correctAnswerIndex) {
                correctCount++;
            }
        });

        const finalScore = (correctCount / questions.length) * 100;
        setScore(finalScore);
        setSubmitted(true);

        // Log Activity
        try {
            const { logUserActivity } = await import('../services/analyticsDataService');
            const { auth } = await import('../services/firebase');
            if (auth.currentUser) {
                const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
                await logUserActivity(auth.currentUser.uid, {
                    type: 'quiz',
                    itemId: id || `quiz-${Date.now()}`,
                    itemTitle: title || `Quiz (${questions.length} questions)`,
                    timestamp: Date.now(),
                    durationSeconds,
                    score: finalScore,
                    completed: true
                });
            }
        } catch (error) {
            console.error("Failed to log quiz activity", error);
        }

        // Only mark complete and award stars if user gets 100%
        if (correctCount === questions.length) {
            onComplete();
        }

        // Scroll to top to see results
        const container = document.getElementById('quiz-container');
        if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleRetry = () => {
        setAnswers({});
        setSubmitted(false);
        setScore(null);
        const container = document.getElementById('quiz-container');
        if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const allAnswered = useMemo(() => {
        return questions.every(q => answers[q.id] !== undefined);
    }, [questions, answers]);

    const progressPercentage = useMemo(() => {
        const answeredCount = Object.keys(answers).length;
        return (answeredCount / questions.length) * 100;
    }, [answers, questions]);

    // Determine score visual characteristics
    let scoreColor = 'text-gray-900 dark:text-white'; // Default
    let circleColor = 'text-gray-500';
    let headerBadgeClass = 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';

    if (score !== null) {
        if (score >= 80) {
            scoreColor = 'text-green-600 dark:text-green-400';
            circleColor = 'text-green-500';
            headerBadgeClass = 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
        } else if (score >= 50) {
            scoreColor = 'text-yellow-600 dark:text-yellow-400';
            circleColor = 'text-yellow-500';
            headerBadgeClass = 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
        } else {
            scoreColor = 'text-red-600 dark:text-red-400';
            circleColor = 'text-red-500';
            headerBadgeClass = 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
        }
    }

    return (
        <div className="flex flex-col h-full w-full bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="h-16 px-6 flex justify-between items-center bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 shadow-sm z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onToggleCollapse}
                        className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                        aria-label={isCollapsed ? "Expand quiz panel" : "Collapse quiz panel"}
                    >
                        <CollapseIcon isCollapsed={isCollapsed} />
                    </button>
                    {!isCollapsed && (
                        <div className="flex flex-col">
                            <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight">Quiz Session</h3>
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{questions.length} Questions</span>
                        </div>
                    )}
                </div>

                {!isCollapsed && (
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:block w-48 h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 ease-out"
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                        {score !== null ? (
                            <div className={`text-sm font-bold px-4 py-1.5 rounded-full shadow-sm transition-colors duration-500 ${headerBadgeClass}`}>
                                {score.toFixed(0)}% Score
                            </div>
                        ) : (
                            <div className="text-xs font-bold text-gray-400 dark:text-gray-500 tabular-nums">
                                {Object.keys(answers).length} / {questions.length}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Content - 2 Column Layout */}
            {!isCollapsed && (
                <div className="flex-1 flex overflow-hidden">
                    {/* Question Sidebar */}
                    <div className="hidden lg:flex w-80 flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-col shadow-sm">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wider">Questions</h4>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500 dark:text-gray-400 font-medium">
                                    {Object.keys(answers).length} of {questions.length} answered
                                </span>
                                <span className="px-2 py-0.5 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 rounded-md font-bold">
                                    {Math.round(progressPercentage)}%
                                </span>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-gray-50/30 dark:bg-gray-900/30">

                            {questions.map((q, index) => {
                                const isAnswered = answers[q.id] !== undefined;
                                const isCorrect = submitted && answers[q.id] === q.correctAnswerIndex;
                                const isWrong = submitted && answers[q.id] !== q.correctAnswerIndex && isAnswered;
                                
                                return (
                                    <button
                                        key={q.id}
                                        onClick={() => {
                                            const el = document.getElementById(`question-${q.id}`);
                                            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                        }}
                                        className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-all ${
                                            submitted
                                                ? isCorrect
                                                    ? 'bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                                                    : isWrong
                                                        ? 'bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                                                        : 'bg-gray-100 dark:bg-gray-700 border border-transparent'
                                                : isAnswered
                                                    ? 'bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800'
                                                    : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:border-cyan-300'
                                        }`}
                                    >
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                            submitted
                                                ? isCorrect
                                                    ? 'bg-green-500 text-white'
                                                    : isWrong
                                                        ? 'bg-red-500 text-white'
                                                        : 'bg-gray-300 text-gray-600'
                                                : isAnswered
                                                    ? 'bg-cyan-500 text-white'
                                                    : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                                        }`}>
                                            {index + 1}
                                        </div>
                                        <span className={`text-sm truncate ${
                                            submitted
                                                ? isCorrect
                                                    ? 'text-green-700 dark:text-green-300'
                                                    : isWrong
                                                        ? 'text-red-700 dark:text-red-300'
                                                        : 'text-gray-600 dark:text-gray-400'
                                                : isAnswered
                                                    ? 'text-cyan-700 dark:text-cyan-300 font-medium'
                                                    : 'text-gray-600 dark:text-gray-400'
                                        }`}>
                                            Q{index + 1}
                                        </span>
                                        {submitted && (
                                            <span className="ml-auto">
                                                {isCorrect ? (
                                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                ) : isWrong ? (
                                                    <XCircle className="w-4 h-4 text-red-500" />
                                                ) : null}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        
                        {/* Submit Button in Sidebar */}
                        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                            {!submitted ? (
                                <button
                                    onClick={handleSubmit}
                                    disabled={!allAnswered}
                                    className="w-full py-4 bg-cyan-600 text-white font-bold rounded-xl hover:bg-cyan-500 hover:shadow-lg disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-600 disabled:cursor-not-allowed transition-all text-sm uppercase tracking-widest"
                                >
                                    Submit Quiz
                                </button>
                            ) : (
                                <button
                                    onClick={handleRetry}
                                    className="w-full py-4 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all text-sm uppercase tracking-widest border border-gray-200 dark:border-gray-600"
                                >
                                    Retake Quiz
                                </button>
                            )}
                        </div>
                    </div>


                    {/* Main Quiz Content */}
                    <div id="quiz-container" className="flex-1 overflow-y-auto p-4 sm:p-6 scroll-smooth">
                        <div className="max-w-3xl mx-auto space-y-6 pb-32">

                        {/* Result Summary Card - Shows at top when submitted */}
                        {submitted && (
                            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg text-center border border-gray-200 dark:border-gray-700 animate-slide-up mb-8 relative overflow-hidden">
                                <div className="relative z-10">
                                    <div className="flex justify-center mb-6">
                                        <div className="relative w-40 h-40 flex items-center justify-center">
                                            <svg className="w-full h-full transform -rotate-90 drop-shadow-md overflow-visible" viewBox="0 0 160 160">
                                                <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-100 dark:text-gray-700" />
                                                <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={439.8} strokeDashoffset={439.8 - (439.8 * (score || 0) / 100)} className={`${circleColor} transition-all duration-1000 ease-out`} strokeLinecap="round" />
                                            </svg>
                                            <div className="absolute flex flex-col items-center">
                                                <span className={`text-4xl font-black tracking-tight ${scoreColor}`}>{score?.toFixed(0)}%</span>
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Score</span>
                                            </div>
                                        </div>
                                    </div>

                                    <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3">
                                        {score === 100 ? "Perfect Score!" : (score && score >= 80 ? "Excellent Job!" : (score && score >= 50 ? "Good Effort!" : "Keep Practicing"))}
                                    </h3>

                                    <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto text-lg">
                                        {score === 100
                                            ? "You've mastered this topic. You are ready for the next challenge!"
                                            : `You answered ${questions.filter(q => answers[q.id] === q.correctAnswerIndex).length} out of ${questions.length} questions correctly.`}
                                    </p>

                                    <button
                                        onClick={handleRetry}
                                        className="px-8 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600"
                                    >
                                        Retake Quiz
                                    </button>
                                </div>
                            </div>
                        )}

                        {questions.map((q, index) => {
                            const isCorrect = submitted && answers[q.id] === q.correctAnswerIndex;
                            const isWrong = submitted && answers[q.id] !== q.correctAnswerIndex;
                            const userAnswer = answers[q.id];

                            return (
                                <div key={q.id} id={`question-${q.id}`} className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border overflow-hidden transition-all duration-300 ${submitted ? (isCorrect ? 'border-green-200 dark:border-green-900/50' : 'border-red-200 dark:border-red-900/50') : 'border-gray-200 dark:border-gray-700 hover:shadow-md'}`}>
                                    <div className="p-6 sm:p-8">
                                        <div className="flex gap-5 mb-6">
                                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-sm ${submitted ? (isCorrect ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400') : 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400'}`}>
                                                {index + 1}
                                            </div>
                                            <div className="flex-1 pt-1">
                                                <div className="text-xl font-bold text-gray-900 dark:text-white leading-relaxed prose dark:prose-invert max-w-none prose-p:my-0 prose-code:text-cyan-700 dark:prose-code:text-cyan-300 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-lg">
                                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                        {q.text}
                                                    </ReactMarkdown>
                                                </div>
                                            </div>
                                            {submitted && (
                                                <div className="flex-shrink-0 ml-2">
                                                    {isCorrect ? (
                                                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-bold text-sm bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full">
                                                            <CheckCircle2 className="w-5 h-5" />
                                                            <span>Correct</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-sm bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full">
                                                            <XCircle className="w-5 h-5" />
                                                            <span>Incorrect</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="w-full grid grid-cols-1 gap-3">
                                            {q.options.map((option, optIndex) => {
                                                const isSelected = userAnswer === optIndex;
                                                const isThisOptionCorrect = q.correctAnswerIndex === optIndex;
                                                const letter = String.fromCharCode(65 + optIndex);

                                                // Base Style
                                                let containerClass = "border-2 bg-white dark:bg-gray-800/50";
                                                let borderClass = "border-gray-200 dark:border-gray-700";
                                                let textClass = "text-gray-700 dark:text-gray-300";
                                                let badgeClass = "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-600";

                                                if (submitted) {
                                                    if (isThisOptionCorrect) {
                                                        // Highlight correct answer
                                                        containerClass = "bg-green-50 dark:bg-green-900/10 shadow-inner";
                                                        borderClass = "border-green-500 dark:border-green-500";
                                                        textClass = "text-green-900 dark:text-green-100 font-bold";
                                                        badgeClass = "bg-green-500 text-white border-green-500";
                                                    } else if (isSelected && !isThisOptionCorrect) {
                                                        // Highlight wrong selection
                                                        containerClass = "bg-red-50 dark:bg-red-900/10";
                                                        borderClass = "border-red-500 dark:border-red-500";
                                                        textClass = "text-red-900 dark:text-red-100 font-medium opacity-70";
                                                        badgeClass = "bg-red-500 text-white border-red-500";
                                                    } else {
                                                        // Dim others
                                                        containerClass = "bg-gray-50 dark:bg-gray-800/30 opacity-40";
                                                        borderClass = "border-transparent";
                                                    }
                                                } else {
                                                    if (isSelected) {
                                                        containerClass = "bg-cyan-50 dark:bg-cyan-900/10 ring-1 ring-cyan-500 ring-offset-2 dark:ring-offset-gray-800";
                                                        borderClass = "border-cyan-500";
                                                        textClass = "text-cyan-900 dark:text-white font-semibold";
                                                        badgeClass = "bg-cyan-500 text-white border-cyan-500";
                                                    } else {
                                                        // Default Hover
                                                        containerClass += " hover:bg-gray-50 dark:hover:bg-gray-700/30";
                                                        borderClass += " hover:border-cyan-300 dark:hover:border-gray-500";
                                                        textClass += " group-hover:text-gray-900 dark:group-hover:text-white";
                                                    }
                                                }

                                                return (
                                                    <button
                                                        key={optIndex}
                                                        onClick={() => handleOptionSelect(q.id, optIndex)}
                                                        disabled={submitted}
                                                        className={`relative w-full text-left p-4 rounded-xl transition-all duration-200 flex items-center gap-4 group ${containerClass} ${borderClass}`}
                                                    >
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors border border-transparent ${badgeClass}`}>
                                                            {letter}
                                                        </div>
                                                        <span className={`text-lg ${textClass} flex-1`}>{option}</span>

                                                        {/* Status Icons inside option */}
                                                        {submitted && isThisOptionCorrect && (
                                                            <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                                                        )}
                                                        {submitted && isSelected && !isThisOptionCorrect && (
                                                            <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* Explicit correction text if wrong */}
                                        {submitted && isWrong && (
                                            <div className="mt-6 w-full p-5 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl animate-fade-in">
                                                <p className="text-xs font-bold text-red-800 dark:text-red-300 uppercase tracking-widest mb-2 font-mono">Correction</p>
                                                <p className="text-gray-800 dark:text-gray-200 text-lg">
                                                    The correct answer is <span className="font-bold text-green-600 dark:text-green-400 border-b-2 border-green-200 dark:border-green-800/50">{String.fromCharCode(65 + q.correctAnswerIndex)}: {q.options[q.correctAnswerIndex]}</span>
                                                </p>
                                            </div>
                                        )}

                                        {/* Next Question Navigation */}
                                        {!submitted && index < questions.length - 1 && userAnswer !== undefined && (
                                            <div className="mt-8 flex justify-end animate-fade-in">
                                                <button
                                                    onClick={() => {
                                                        const el = document.getElementById(`question-${questions[index + 1].id}`);
                                                        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                    }}
                                                    className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-bold hover:gap-3 transition-all group"
                                                >
                                                    Next Question
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                                    </svg>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                            );
                        })}

                        {/* Footer Actions - Always visible submit button */}
                        <div className="pt-8 pb-16 flex justify-center sticky bottom-0 bg-gradient-to-t from-gray-50 dark:from-gray-900 via-gray-50 dark:via-gray-900 to-transparent py-6">
                            {!submitted ? (
                                <button
                                    onClick={handleSubmit}
                                    disabled={!allAnswered}
                                    className="px-12 py-4 bg-cyan-600 text-white font-bold text-xl rounded-full shadow-lg hover:bg-cyan-500 hover:shadow-xl disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200"
                                >
                                    Submit Answers
                                </button>
                            ) : (
                                <button
                                    onClick={handleRetry}
                                    className="px-12 py-4 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-bold text-xl rounded-full shadow-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
                                >
                                    Retake Quiz
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            )}
        </div>
    );
};


import React, { useState, useMemo, useEffect } from 'react';
import type { QuizQuestion } from '../types';
import { CollapseIcon } from './CollapseIcon';

interface QuizPanelProps {
  questions: QuizQuestion[];
  onComplete: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}>
        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
    </svg>
);

const XCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}>
        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0-1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z" clipRule="evenodd" />
    </svg>
);

const TrophyIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}>
        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z" clipRule="evenodd" /> 
        <path fillRule="evenodd" d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 0 0-.584.859 6.753 6.753 0 0 0 6.138 5.6 6.73 6.73 0 0 0 2.743 1.346A6.707 6.707 0 0 1 9.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a2.25 2.25 0 0 0-2.25 2.25c0 .414.336.75.75.75h15a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-2.25-2.25h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.706 6.706 0 0 1-1.112-3.173 6.73 6.73 0 0 0 2.743-1.347 6.753 6.753 0 0 0 6.139-5.6.75.75 0 0 0-.585-.858 47.077 47.077 0 0 0-3.07-.543V2.62a.75.75 0 0 0-.659-.744A49.963 49.963 0 0 0 12 1.5c-2.39 0-4.744.129-7.063.376a.75.75 0 0 0-.659.745Zm4.345 13.973a8.203 8.203 0 0 0-1.186-2.818.75.75 0 1 1 1.225-.828 6.7 6.7 0 0 1 1.08 2.557.75.75 0 0 1-1.12.989Z" clipRule="evenodd" />
    </svg>
);

export const QuizPanel: React.FC<QuizPanelProps> = ({ questions, onComplete, isCollapsed, onToggleCollapse }) => {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const handleOptionSelect = (questionId: string, optionIndex: number) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = () => {
    let correctCount = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correctAnswerIndex) {
        correctCount++;
      }
    });

    const finalScore = (correctCount / questions.length) * 100;
    setScore(finalScore);
    setSubmitted(true);

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

       {/* Content */}
       {!isCollapsed && (
         <div id="quiz-container" className="flex-1 overflow-y-auto p-4 sm:p-8 scroll-smooth">
           <div className="max-w-3xl mx-auto space-y-8 pb-20">
             
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
                 <div key={q.id} className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border overflow-hidden transition-all duration-300 ${submitted ? (isCorrect ? 'border-green-200 dark:border-green-900/50' : 'border-red-200 dark:border-red-900/50') : 'border-gray-200 dark:border-gray-700 hover:shadow-md'}`}>
                   <div className="p-6 sm:p-8">
                       <div className="flex gap-5 mb-6">
                           <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-sm ${submitted ? (isCorrect ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400') : 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400'}`}>
                               {index + 1}
                           </div>
                           <div className="flex-1 pt-1">
                               <h4 className="text-xl font-bold text-gray-900 dark:text-white leading-relaxed">
                                   {q.text}
                               </h4>
                           </div>
                           {submitted && (
                               <div className="flex-shrink-0 ml-2">
                                   {isCorrect ? (
                                       <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-bold text-sm bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full">
                                           <CheckCircleIcon className="w-5 h-5" />
                                           <span>Correct</span>
                                       </div>
                                   ) : (
                                       <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-sm bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full">
                                           <XCircleIcon className="w-5 h-5" />
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
                                     <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                                 )}
                                 {submitted && isSelected && !isThisOptionCorrect && (
                                     <XCircleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                                 )}
                               </button>
                            );
                         })}
                       </div>
                       
                       {/* Explicit correction text if wrong */}
                       {submitted && isWrong && (
                           <div className="mt-6 w-full p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl animate-fade-in">
                               <p className="text-sm font-bold text-red-800 dark:text-red-300 uppercase tracking-wide mb-1">Correction</p>
                               <p className="text-gray-800 dark:text-gray-200">
                                   The correct answer is <span className="font-bold text-green-600 dark:text-green-400">{String.fromCharCode(65 + q.correctAnswerIndex)}: {q.options[q.correctAnswerIndex]}</span>
                                </p>
                           </div>
                       )}
                   </div>
                 </div>
               );
             })}

             {/* Footer Actions */}
             <div className="pt-8 pb-12 flex justify-center">
                 {!submitted && (
                     <button
                        onClick={handleSubmit}
                        disabled={!allAnswered}
                        className="px-12 py-4 bg-cyan-600 text-white font-bold text-xl rounded-full shadow-xl shadow-cyan-500/20 hover:bg-cyan-500 hover:scale-105 hover:shadow-2xl disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:scale-100 disabled:cursor-not-allowed disabled:shadow-none transition-all transform"
                     >
                        Submit Answers
                     </button>
                 )}
             </div>
           </div>
         </div>
       )}
    </div>
  );
};

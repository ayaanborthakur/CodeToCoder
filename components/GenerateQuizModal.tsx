
import React, { useState } from 'react';
import type { Difficulty } from '../types';

interface GenerateQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (topic: string, difficulty: Difficulty) => Promise<void>;
}

const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
    </svg>
);

export const GenerateQuizModal: React.FC<GenerateQuizModalProps> = ({ isOpen, onClose, onGenerate }) => {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || isLoading) return;

    setIsLoading(true);
    try {
        await onGenerate(topic, difficulty);
        onClose();
        setTopic('');
        setDifficulty('Medium');
    } catch (error) {
        console.error(error);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full border border-gray-200 dark:border-gray-700 animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400">
                <SparklesIcon />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Generate AI Quiz</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quiz Topic</label>
                <input 
                    type="text" 
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 outline-none text-gray-900 dark:text-white transition-all"
                    placeholder="e.g., Python Lists, Recursion, Pandas..."
                    disabled={isLoading}
                    autoFocus
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Difficulty</label>
                <select 
                    value={difficulty}
                    onChange={e => setDifficulty(e.target.value as Difficulty)}
                    className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 outline-none text-gray-900 dark:text-white transition-all cursor-pointer"
                    disabled={isLoading}
                >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                </select>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={isLoading}
                    className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={!topic.trim() || isLoading}
                    className="px-6 py-2 text-sm font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Generating...
                        </>
                    ) : (
                        'Generate Quiz'
                    )}
                </button>
            </div>
        </form>
      </div>
      <style>{`
        @keyframes scale-in {
            0% { transform: scale(0.95); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
            animation: scale-in 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

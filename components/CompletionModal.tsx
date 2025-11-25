
import React from 'react';

interface CompletionModalProps {
  onClose: () => void;
}

import TrophyIcon from '../assets/icons/TrophyIcon.svg?react';


export const CompletionModal: React.FC<CompletionModalProps> = ({ onClose }) => {
  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      aria-labelledby="completion-modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 max-w-md w-full text-center border-2 border-gray-200 dark:border-cyan-500/50 transform transition-all animate-scale-in">
        <div className="flex justify-center mb-4">
          <TrophyIcon className="h-16 w-16 text-yellow-400" />
        </div>
        <h2 id="completion-modal-title" className="text-3xl font-bold text-cyan-500 dark:text-cyan-400 mb-2">Congratulations!</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          You've completed all the lessons! You're well on your way to becoming a Python pro.
        </p>
        <button
          onClick={onClose}
          className="bg-cyan-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-cyan-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500"
        >
          Keep Coding
        </button>
      </div>
      <style>{`
        @keyframes scale-in {
            0% { transform: scale(0.9); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
            animation: scale-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};


import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      role="dialog" 
      aria-modal="true"
    >
       <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-sm w-full border border-gray-200 dark:border-cyan-500/30 transform transition-all animate-scale-in">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-3">{title}</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
          
          <div className="flex justify-end gap-3">
              <button 
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                  Cancel
              </button>
              <button 
                  onClick={onConfirm}
                  className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors shadow-sm"
              >
                  Yes, Reset
              </button>
          </div>
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

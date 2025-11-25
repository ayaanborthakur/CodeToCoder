
import React, { useState, useEffect } from 'react';

interface RenameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newName: string) => void;
  currentName: string;
  title?: string;
}

export const RenameModal: React.FC<RenameModalProps> = ({ isOpen, onClose, onConfirm, currentName, title = "Rename File" }) => {
  const [name, setName] = useState(currentName);
  const inputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName(currentName);
      // Focus and select the text in the input
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
    }
  }, [isOpen, currentName]);

  const handleConfirm = () => {
    if (name.trim()) {
      onConfirm(name.trim());
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-sm w-full border border-gray-200 dark:border-cyan-500/30 transform transition-all animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">{title}</h2>
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
          className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!name.trim() || name.trim() === currentName}
            className="px-4 py-2 text-sm font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors shadow-sm disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            Save
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

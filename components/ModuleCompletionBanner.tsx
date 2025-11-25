
import React, { useEffect } from 'react';

interface ModuleCompletionBannerProps {
  moduleTitle: string;
  onClose: () => void;
}

const CheckIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}>
        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
    </svg>
);

export const ModuleCompletionBanner: React.FC<ModuleCompletionBannerProps> = ({ moduleTitle, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000); // Disappear after 5 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div 
      className="fixed top-5 right-5 bg-white dark:bg-gray-800 border-2 border-cyan-500 dark:border-cyan-500/80 rounded-lg shadow-lg p-4 z-50 animate-slide-in-right max-w-sm w-full"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 text-green-500 dark:text-green-400 mt-0.5">
          <CheckIcon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-cyan-600 dark:text-cyan-400">Module Complete!</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Great work on finishing "{moduleTitle}"!
          </p>
        </div>
      </div>
      <style>{`
        @keyframes slide-in-right {
            0% { transform: translateX(110%); opacity: 0; }
            100% { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in-right {
            animation: slide-in-right 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

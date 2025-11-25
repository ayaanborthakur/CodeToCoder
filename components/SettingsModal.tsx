import React from 'react';
import { ToggleSwitch } from './ToggleSwitch';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
    isHardMode: boolean;
    setIsHardMode: (isHardMode: boolean) => void;
}

import CloseIcon from '../assets/icons/CloseIcon.svg?react';

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, theme, setTheme, isHardMode, setIsHardMode }) => {
    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 z-20 bg-gray-50 dark:bg-gray-800 p-4 animate-fade-in border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-cyan-400">
                    Settings
                </h2>
                <button
                    onClick={onClose}
                    className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Close settings"
                >
                    <CloseIcon className="w-6 h-6" />
                </button>
            </div>

            <div className="space-y-4">
                <div className="p-4 rounded-lg bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 shadow-sm">
                    <ToggleSwitch
                        label="Dark Mode"
                        isChecked={theme === 'dark'}
                        onChange={(isChecked) => setTheme(isChecked ? 'dark' : 'light')}
                    />
                </div>

                <div className="p-4 rounded-lg bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 shadow-sm">
                    <ToggleSwitch
                        label="Hard Mode"
                        isChecked={isHardMode}
                        onChange={setIsHardMode}
                        tooltip="AI provides less help"
                    />
                </div>
            </div>
            <style>{`
          @keyframes fade-in {
              from { opacity: 0; }
              to { opacity: 1; }
          }
          .animate-fade-in {
              animation: fade-in 0.2s ease-out forwards;
          }
        `}</style>
        </div>
    );
};
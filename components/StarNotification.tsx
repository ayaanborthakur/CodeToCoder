import React, { useEffect, useState } from 'react';

interface StarNotificationProps {
    amount: number;
    reason: string;
    onClose: () => void;
}

export const StarNotification: React.FC<StarNotificationProps> = ({ amount, reason, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger animation
        setTimeout(() => setIsVisible(true), 10);

        // Auto-close after 3 seconds
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for fade-out animation
        }, 3000);

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div
            className={`fixed top-24 right-4 z-50 transition-all duration-300 transform ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
                }`}
        >
            <div className="bg-gradient-to-br from-cyan-500 to-purple-500 p-1 rounded-xl shadow-2xl">
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 min-w-[280px]">
                    <div className="flex items-center gap-3">
                        {/* Animated Token Icon */}
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                            <span className="text-2xl">⚡</span>
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                {reason}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-purple-600 dark:from-cyan-400 dark:to-purple-400">
                                    +{amount.toLocaleString()}
                                </span>
                                <span className="text-sm font-semibold text-cyan-600 dark:text-cyan-400">
                                    stars
                                </span>
                            </div>
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={() => {
                                setIsVisible(false);
                                setTimeout(onClose, 300);
                            }}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

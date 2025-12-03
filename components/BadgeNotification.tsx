import React, { useEffect, useState } from 'react';
import type { Badge } from '../types';
import { getBadgeGradient } from '../services/achievementService';
import { BadgeIcon } from './BadgeIcon';

interface BadgeNotificationProps {
    badge: Badge;
    onClose: () => void;
}

export const BadgeNotification: React.FC<BadgeNotificationProps> = ({ badge, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger animation
        setTimeout(() => setIsVisible(true), 100);

        // Auto-dismiss after 4 seconds
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
        }, 4000);

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed inset-0 flex items-center justify-center z-[100] pointer-events-none transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'
            }`}>
            {/* Backdrop */}
            <div className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-all duration-300 ${isVisible ? 'pointer-events-auto' : 'pointer-events-none'}`} onClick={() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
            }} />

            {/* Badge Card */}
            <div className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 border-2 pointer-events-auto transform transition-all duration-500 ${isVisible ? 'scale-100 translate-y-0' : 'scale-75 translate-y-8'
                }`}
                style={{ borderColor: getBadgeGradient(badge.tier).match(/#[A-Fa-f0-9]{6}/)?.[0] || '#FFD700' }}
            >
                {/* Celebration Icon */}
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                    <div className="text-6xl animate-bounce">🎉</div>
                </div>

                {/* Content */}
                <div className="flex flex-col items-center gap-4 mt-4">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
                        Badge Earned!
                    </h3>

                    {/* Badge Icon */}
                    <div
                        className="w-24 h-24 rounded-full flex items-center justify-center shadow-xl animate-pulse-slow border-4 bg-white"
                        style={{
                            borderColor: getBadgeGradient(badge.tier).match(/#[A-Fa-f0-9]{6}/)?.[0] || '#FFD700'
                        }}
                    >
                        <BadgeIcon type={badge.type} tier={badge.tier} size={64} />
                    </div>

                    {/* Badge Details */}
                    <div className="text-center">
                        <div className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                            {badge.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 capitalize mb-2">
                            {badge.tier} Badge
                        </div>
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                            {badge.description}
                        </div>
                    </div>

                    {/* Sparkles */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                        {[...Array(8)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-sparkle"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                    animationDelay: `${Math.random() * 2}s`
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
        }
        .animate-sparkle {
          animation: sparkle 2s infinite;
        }
        .animate-pulse-slow {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
        </div>
    );
};

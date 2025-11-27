import React from 'react';
import type { Badge, BadgeTier } from '../types';
import { getBadgeColor, getBadgeGradient } from '../services/achievementService';
import { BadgeIcon } from './BadgeIcon';

interface BadgeDisplayProps {
    badge: Badge;
    earned?: boolean;
    size?: 'small' | 'medium' | 'large';
    showProgress?: boolean;
    progress?: number;
}

export const BadgeDisplay: React.FC<BadgeDisplayProps> = ({
    badge,
    earned = false,
    size = 'medium',
    showProgress = false,
    progress = 0
}) => {
    const sizeClasses = {
        small: 'w-12 h-12 text-xl',
        medium: 'w-16 h-16 text-2xl',
        large: 'w-24 h-24 text-4xl'
    };

    const tierColor = getBadgeColor(badge.tier);
    const tierGradient = getBadgeGradient(badge.tier);

    return (
        <div className="flex flex-col items-center gap-2 group relative">
            {/* Badge Icon */}
            <div
                className={`${sizeClasses[size]} rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${earned
                    ? 'scale-100 opacity-100 group-hover:scale-110'
                    : 'scale-90 opacity-40 grayscale'
                    }`}
                style={{
                    background: earned ? 'white' : '#e5e7eb',
                    border: `3px solid ${earned ? tierColor : '#9ca3af'}`
                }}
            >
                <BadgeIcon
                    type={badge.type}
                    tier={badge.tier}
                    size={size === 'small' ? 32 : size === 'medium' ? 42 : 64}
                />
            </div>

            {/* Badge Name */}
            {size !== 'small' && (
                <div className="text-center">
                    <div className={`text-sm font-bold ${earned ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>
                        {badge.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {badge.tier}
                    </div>
                </div>
            )}

            {/* Progress Bar (if showing progress) */}
            {showProgress && !earned && (
                <div className="w-full max-w-[100px]">
                    <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                        {Math.round(progress)}%
                    </div>
                </div>
            )}

            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 hidden group-hover:block z-50 pointer-events-none">
                <div className="bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg py-2 px-3 shadow-xl max-w-[200px] text-center border border-gray-700">
                    <div className="font-bold mb-1">{badge.name}</div>
                    <div className="text-gray-300">{badge.description}</div>
                    {!earned && (
                        <div className="mt-1 text-gray-400 italic">
                            {showProgress ? `${Math.round(progress)}% complete` : 'Locked'}
                        </div>
                    )}
                </div>
            </div>

            {/* Lock Icon for Locked Badges */}
            {!earned && size !== 'small' && (
                <div className="absolute top-0 right-0 bg-gray-600 dark:bg-gray-700 rounded-full p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3 text-white">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                    </svg>
                </div>
            )}
        </div>
    );
};

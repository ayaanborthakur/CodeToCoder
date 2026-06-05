import React from 'react';
import type { BadgeType, BadgeTier } from '../types';

interface BadgeIconProps {
    type: BadgeType;
    tier: BadgeTier;
    size?: number;
    className?: string;
}

export const BadgeIcon: React.FC<BadgeIconProps> = ({ type, tier, size = 48, className = '' }) => {
    // Get gradient colors based on tier
    const getGradientId = () => `badge-gradient-${type}-${tier}-${Math.random().toString(36).substr(2, 9)}`;
    const gradientId = getGradientId();

    const getTierColors = (): { start: string; end: string; glow: string } => {
        switch (tier) {
            case 'bronze':
                return { start: '#CD7F32', end: '#A0522D', glow: '#CD7F32' };
            case 'silver':
                return { start: '#C0C0C0', end: '#A8A8A8', glow: '#C0C0C0' };
            case 'gold':
                return { start: '#FFD700', end: '#FFA500', glow: '#FFD700' };
            case 'platinum':
                return { start: '#E5E4E2', end: '#B8B8B8', glow: '#E5E4E2' };
        }
    };

    const colors = getTierColors();

    // Render different icons based on badge type
    const renderIcon = () => {
        switch (type) {
            case 'lesson':
                // Book icon
                return (
                    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
                        <defs>
                            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor={colors.start} />
                                <stop offset="100%" stopColor={colors.end} />
                            </linearGradient>
                            <filter id={`glow-${gradientId}`}>
                                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>
                        {/* Book base */}
                        <path d="M12 8 L12 56 L52 56 L52 8 Z" fill={`url(#${gradientId})`} filter={`url(#glow-${gradientId})`} />
                        {/* Book spine */}
                        <path d="M12 8 L16 12 L16 60 L12 56 Z" fill={colors.end} opacity="0.8" />
                        {/* Pages */}
                        <path d="M20 16 L44 16" stroke="white" strokeWidth="2" opacity="0.6" />
                        <path d="M20 24 L44 24" stroke="white" strokeWidth="2" opacity="0.6" />
                        <path d="M20 32 L44 32" stroke="white" strokeWidth="2" opacity="0.6" />
                        <path d="M20 40 L44 40" stroke="white" strokeWidth="2" opacity="0.6" />
                        {/* Bookmark */}
                        <path d="M38 8 L38 28 L42 24 L46 28 L46 8 Z" fill={colors.glow} opacity="0.9" />
                    </svg>
                );

            case 'practice':
                // Dumbbell icon
                return (
                    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
                        <defs>
                            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor={colors.start} />
                                <stop offset="100%" stopColor={colors.end} />
                            </linearGradient>
                            <filter id={`glow-${gradientId}`}>
                                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>
                        {/* Left weight */}
                        <rect x="4" y="20" width="12" height="24" rx="2" fill={`url(#${gradientId})`} filter={`url(#glow-${gradientId})`} />
                        {/* Left connector */}
                        <rect x="16" y="28" width="8" height="8" rx="1" fill={colors.end} />
                        {/* Bar */}
                        <rect x="24" y="30" width="16" height="4" rx="2" fill={`url(#${gradientId})`} />
                        {/* Right connector */}
                        <rect x="40" y="28" width="8" height="8" rx="1" fill={colors.end} />
                        {/* Right weight */}
                        <rect x="48" y="20" width="12" height="24" rx="2" fill={`url(#${gradientId})`} filter={`url(#glow-${gradientId})`} />
                        {/* Grip lines */}
                        <line x1="28" y1="30" x2="28" y2="34" stroke="white" strokeWidth="1" opacity="0.5" />
                        <line x1="32" y1="30" x2="32" y2="34" stroke="white" strokeWidth="1" opacity="0.5" />
                        <line x1="36" y1="30" x2="36" y2="34" stroke="white" strokeWidth="1" opacity="0.5" />
                    </svg>
                );

            case 'quiz':
                // Clipboard with checkmark icon
                return (
                    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
                        <defs>
                            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor={colors.start} />
                                <stop offset="100%" stopColor={colors.end} />
                            </linearGradient>
                            <filter id={`glow-${gradientId}`}>
                                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>
                        {/* Clipboard base */}
                        <rect x="12" y="8" width="40" height="52" rx="3" fill={`url(#${gradientId})`} filter={`url(#glow-${gradientId})`} />
                        {/* Clip */}
                        <rect x="24" y="4" width="16" height="8" rx="2" fill={colors.end} />
                        <rect x="26" y="6" width="12" height="4" rx="1" fill="white" opacity="0.3" />
                        {/* Checkmark circle */}
                        <circle cx="32" cy="32" r="12" fill="white" opacity="0.9" />
                        {/* Checkmark */}
                        <path d="M26 32 L30 36 L38 28" stroke={colors.glow} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        {/* Lines */}
                        <line x1="20" y1="48" x2="44" y2="48" stroke="white" strokeWidth="2" opacity="0.5" />
                        <line x1="20" y1="52" x2="38" y2="52" stroke="white" strokeWidth="2" opacity="0.5" />
                    </svg>
                );

            case 'project':
                // Rocket icon
                return (
                    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
                        <defs>
                            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor={colors.start} />
                                <stop offset="100%" stopColor={colors.end} />
                            </linearGradient>
                            <filter id={`glow-${gradientId}`}>
                                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>
                        {/* Rocket body */}
                        <path d="M32 4 L38 20 L38 44 L32 52 L26 44 L26 20 Z" fill={`url(#${gradientId})`} filter={`url(#glow-${gradientId})`} />
                        {/* Nose cone */}
                        <path d="M32 4 L38 20 L26 20 Z" fill={colors.glow} opacity="0.9" />
                        {/* Window */}
                        <circle cx="32" cy="28" r="6" fill="white" opacity="0.8" />
                        <circle cx="32" cy="28" r="4" fill={colors.end} opacity="0.6" />
                        {/* Left fin */}
                        <path d="M26 36 L18 48 L26 44 Z" fill={colors.end} opacity="0.8" />
                        {/* Right fin */}
                        <path d="M38 36 L46 48 L38 44 Z" fill={colors.end} opacity="0.8" />
                        {/* Flame */}
                        <ellipse cx="32" cy="54" rx="6" ry="8" fill="#FF6B35" opacity="0.7" />
                        <ellipse cx="32" cy="56" rx="4" ry="6" fill="#FFD700" opacity="0.8" />
                    </svg>
                );
        }
    };

    return renderIcon();
};

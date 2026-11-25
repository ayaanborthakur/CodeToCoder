import type { LatePolicy } from '../types';

export const DEFAULT_LATE_POLICY: LatePolicy = { accept: true, penaltyPercent: 0 };

/** The score after the class's late penalty, rounded to one decimal. */
export const latePenalized = (points: number, policy: LatePolicy | undefined): number => {
    const pct = policy?.penaltyPercent ?? 0;
    return Math.round(points * (1 - pct / 100) * 10) / 10;
};

const MIN = 60 * 1000;

/** "Just now", "5 min ago", "3 h ago", "Yesterday", "4 days ago". */
export const timeAgo = (t: number | null | undefined, now = Date.now()): string => {
    if (!t) return 'Never';
    const d = now - t;
    if (d < MIN) return 'Just now';
    if (d < 60 * MIN) return `${Math.floor(d / MIN)} min ago`;
    if (d < 24 * 60 * MIN) return `${Math.floor(d / (60 * MIN))} h ago`;
    const days = Math.floor(d / (24 * 60 * MIN));
    return days === 1 ? 'Yesterday' : `${days} days ago`;
};

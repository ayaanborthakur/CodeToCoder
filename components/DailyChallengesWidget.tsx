import React from 'react';
import type { DailyChallenge } from '../types';
import { Target, Gift, Clock, CheckCircle } from 'lucide-react';

interface DailyChallengesWidgetProps {
    challenges: DailyChallenge[];
    onClaimReward: (challengeId: string) => void;
    isLoading?: boolean;
}

/**
 * DailyChallengesWidget - Compact widget for HomePage sidebar showing today's challenges
 */
export const DailyChallengesWidget: React.FC<DailyChallengesWidgetProps> = ({
    challenges,
    onClaimReward,
    isLoading = false
}) => {
    // Calculate time until midnight for countdown
    const getTimeUntilReset = () => {
        const now = new Date();
        const midnight = new Date(now);
        midnight.setDate(midnight.getDate() + 1);
        midnight.setHours(0, 0, 0, 0);
        const diff = midnight.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    };

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-cyan-500" />
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">Today's Challenges</h3>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>{getTimeUntilReset()}</span>
                </div>
            </div>

            {/* Challenges List */}
            <div className="space-y-2">
                {challenges.length === 0 ? (
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-2">
                        No challenges available
                    </p>
                ) : (
                    challenges.slice(0, 3).map((challenge) => (
                        <div
                            key={challenge.id}
                            className={`p-2 rounded-lg border ${
                                challenge.completed
                                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                    : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
                            }`}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        {challenge.completed ? (
                                            <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                                        ) : (
                                            <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300 dark:border-gray-500 flex-shrink-0" />
                                        )}
                                        <span className={`text-xs font-medium truncate ${
                                            challenge.completed
                                                ? 'text-green-700 dark:text-green-400 line-through'
                                                : 'text-gray-700 dark:text-gray-300'
                                        }`}>
                                            {challenge.title}
                                        </span>
                                    </div>
                                    
                                    {/* Progress bar */}
                                    {!challenge.completed && (
                                        <div className="mt-1.5 ml-5">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-cyan-500 rounded-full transition-all duration-300"
                                                        style={{ width: `${(challenge.progress / challenge.requirement.count) * 100}%` }}
                                                    />
                                                </div>
                                                <span className="text-[10px] text-gray-500 dark:text-gray-400">
                                                    {challenge.progress}/{challenge.requirement.count}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Reward/Claim button */}
                                <div className="flex-shrink-0">
                                    {challenge.completed && !challenge.claimed ? (
                                        <button
                                            onClick={() => onClaimReward(challenge.id)}
                                            className="flex items-center gap-1 px-2 py-1 bg-yellow-400 hover:bg-yellow-300 text-yellow-900 rounded text-[10px] font-bold transition-colors"
                                        >
                                            <Gift className="w-3 h-3" />
                                            +{challenge.reward}⭐
                                        </button>
                                    ) : challenge.claimed ? (
                                        <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">
                                            ✓ Claimed
                                        </span>
                                    ) : (
                                        <span className="text-[10px] text-gray-400 dark:text-gray-500">
                                            +{challenge.reward}⭐
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default DailyChallengesWidget;

import type { UserTokens, TokenTransaction, Difficulty } from '../types';
import { getMarketplaceData, addTokens, spendTokens as spendMarketplaceTokens } from './marketplaceService';

// Token reward base amounts
const TOKEN_REWARDS = {
    lesson: 10,
    quiz: 15,
    practice: 20,
    project: 50,
    badge: 30,
    dailyChallenge: 25
};

// Difficulty multipliers
const DIFFICULTY_MULTIPLIERS: Record<Difficulty, number> = {
    'Easy': 1,
    'Medium': 1.5,
    'Hard': 2
};

/**
 * Calculate token reward based on activity type and difficulty
 */
export const calculateTokenReward = (
    activityType: keyof typeof TOKEN_REWARDS,
    difficulty?: Difficulty
): number => {
    let baseReward = TOKEN_REWARDS[activityType];

    // Apply difficulty multiplier
    if (difficulty && activityType !== 'badge' && activityType !== 'dailyChallenge') {
        baseReward *= DIFFICULTY_MULTIPLIERS[difficulty];
    }

    return Math.floor(baseReward);
};

/**
 * Get user's token data
 * @deprecated Use getMarketplaceData instead
 */
export const getTokenData = async (userId: string): Promise<UserTokens> => {
    const data = await getMarketplaceData(userId);
    return data.tokens;
};

/**
 * Get transaction history
 */
export const getTransactionHistory = async (userId: string, limit: number = 50): Promise<TokenTransaction[]> => {
    const data = await getMarketplaceData(userId);
    return data.transactionHistory.slice(0, limit);
};

/**
 * Award tokens to user
 */
export const awardTokens = async (
    userId: string,
    amount: number,
    reason: string
): Promise<UserTokens> => {
    await addTokens(userId, amount, reason);

    // Return updated data
    const data = await getMarketplaceData(userId);
    return data.tokens;
};

/**
 * Spend tokens
 */
export const spendTokens = async (
    userId: string,
    amount: number,
    reason: string
): Promise<UserTokens> => {
    await spendMarketplaceTokens(userId, amount, reason);

    // Return updated data
    const data = await getMarketplaceData(userId);
    return data.tokens;
};

/**
 * Get token balance
 */
export const getTokenBalance = async (userId: string): Promise<number> => {
    const data = await getMarketplaceData(userId);
    return data.tokens.balance;
};

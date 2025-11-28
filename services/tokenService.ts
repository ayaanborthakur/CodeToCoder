import type { UserTokens, TokenTransaction, Difficulty } from '../types';

const TOKEN_STORAGE_KEY = 'codetocoder_tokens';
const TRANSACTION_HISTORY_KEY = 'codetocoder_token_history';

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
 */
export const getTokenData = (userId: string): UserTokens => {
    const key = `${TOKEN_STORAGE_KEY}_${userId}`;
    const data = localStorage.getItem(key);

    if (data) {
        return JSON.parse(data);
    }

    // Return default token data
    return {
        balance: 0,
        totalEarned: 0,
        totalSpent: 0,
        lastUpdated: Date.now()
    };
};

/**
 * Save token data
 */
const saveTokenData = (userId: string, tokenData: UserTokens): void => {
    const key = `${TOKEN_STORAGE_KEY}_${userId}`;
    localStorage.setItem(key, JSON.stringify({
        ...tokenData,
        lastUpdated: Date.now()
    }));
};

/**
 * Get transaction history
 */
export const getTransactionHistory = (userId: string, limit: number = 50): TokenTransaction[] => {
    const key = `${TRANSACTION_HISTORY_KEY}_${userId}`;
    const data = localStorage.getItem(key);

    if (data) {
        const history: TokenTransaction[] = JSON.parse(data);
        return history.slice(0, limit);
    }

    return [];
};

/**
 * Add transaction to history
 */
const addTransaction = (userId: string, transaction: TokenTransaction): void => {
    const key = `${TRANSACTION_HISTORY_KEY}_${userId}`;
    const history = getTransactionHistory(userId, 100);

    history.unshift(transaction);
    localStorage.setItem(key, JSON.stringify(history));
};

/**
 * Award tokens to user
 */
export const awardTokens = (
    userId: string,
    amount: number,
    reason: string
): UserTokens => {
    const tokenData = getTokenData(userId);

    tokenData.balance += amount;
    tokenData.totalEarned += amount;

    saveTokenData(userId, tokenData);

    // Add to transaction history
    addTransaction(userId, {
        id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        amount,
        type: 'earn',
        reason,
        timestamp: Date.now()
    });

    // Dispatch custom event for UI notification
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tokenUpdate', {
            detail: { balance: tokenData.balance, amount, reason }
        }));
    }

    return tokenData;
};

/**
 * Spend tokens
 */
export const spendTokens = (
    userId: string,
    amount: number,
    reason: string
): UserTokens => {
    const tokenData = getTokenData(userId);

    if (tokenData.balance < amount) {
        throw new Error('Insufficient tokens');
    }

    tokenData.balance -= amount;
    tokenData.totalSpent += amount;

    saveTokenData(userId, tokenData);

    // Add to transaction history
    addTransaction(userId, {
        id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        amount,
        type: 'spend',
        reason,
        timestamp: Date.now()
    });

    return tokenData;
};

/**
 * Get token balance
 */
export const getTokenBalance = (userId: string): number => {
    return getTokenData(userId).balance;
};

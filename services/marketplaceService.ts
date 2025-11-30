import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import {
    MarketplaceData,
    UserStars,
    Pack,
    DailyChallenge,
    StarTransaction,
    Collectible,
    Rarity,
    Difficulty
} from '../types';

// Star reward base amounts
export const STAR_REWARDS = {
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
 * Calculate star reward based on activity type and difficulty
 */
export const calculateStarReward = (
    activityType: keyof typeof STAR_REWARDS,
    difficulty?: Difficulty
): number => {
    let baseReward = STAR_REWARDS[activityType];

    // Apply difficulty multiplier
    if (difficulty && activityType !== 'badge' && activityType !== 'dailyChallenge') {
        baseReward *= DIFFICULTY_MULTIPLIERS[difficulty];
    }

    return Math.floor(baseReward);
};
import { PACKS } from '../data/marketplaceData';
import { DAILY_CHALLENGES } from '../data/dailyChallengesData';
import { COLLECTIBLES } from '../data/collectiblesData';

const MARKETPLACE_COLLECTION = 'marketplace';
const CURRENT_MARKETPLACE_VERSION = 2;

// Helper to get initial state
const getInitialMarketplaceData = (): MarketplaceData => ({
    stars: {
        balance: 0,
        totalEarned: 0,
        totalSpent: 0,
        lastUpdated: Date.now()
    },
    ownedCollectibles: [],
    dailyPrizeClaimed: 0,
    dailyChallenges: [],
    transactionHistory: [],
    completedActivities: {
        lessons: [],
        quizzes: [],
        practice: []
    },
    version: CURRENT_MARKETPLACE_VERSION
});

// Helper to get random daily challenges
const getRandomDailyChallenges = (count: number): DailyChallenge[] => {
    const shuffled = [...DAILY_CHALLENGES].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count).map(template => ({
        ...template,
        progress: 0,
        completed: false,
        claimed: false
    }));
};

export const getMarketplaceData = async (userId: string): Promise<MarketplaceData> => {
    if (!userId) return getInitialMarketplaceData();

    try {
        const docRef = doc(db, MARKETPLACE_COLLECTION, userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data() as MarketplaceData;

            // Check version and reset if needed
            if (!data.version || data.version < CURRENT_MARKETPLACE_VERSION) {
                // Reset stars
                data.stars = {
                    balance: 0,
                    totalEarned: 0,
                    totalSpent: 0,
                    lastUpdated: Date.now()
                };
                // Clear history
                data.transactionHistory = [{
                    id: Date.now().toString(),
                    amount: 0,
                    type: 'earn',
                    reason: 'System Star Reset',
                    timestamp: Date.now()
                }];

                // Reset Daily Challenges
                data.dailyChallenges = getRandomDailyChallenges(3);
                data.dailyPrizeClaimed = 0;
                data.version = CURRENT_MARKETPLACE_VERSION;
                await saveMarketplaceData(userId, data);
            }

            // Migration: Initialize completedActivities if it doesn't exist
            if (!data.completedActivities) {
                data.completedActivities = {
                    lessons: [],
                    quizzes: [],
                    practice: []
                };
                await saveMarketplaceData(userId, data);
            }

            // Check if daily challenges need refresh (new day)
            const lastUpdated = new Date(data.stars.lastUpdated);
            const now = new Date();
            if (lastUpdated.getDate() !== now.getDate() || lastUpdated.getMonth() !== now.getMonth() || lastUpdated.getFullYear() !== now.getFullYear()) {
                data.dailyChallenges = getRandomDailyChallenges(3);
                data.dailyPrizeClaimed = 0; // Reset daily prize
                await saveMarketplaceData(userId, data);
            }

            return data;
        } else {
            // Create new data for user
            const initialData = getInitialMarketplaceData();
            initialData.dailyChallenges = getRandomDailyChallenges(3);
            await saveMarketplaceData(userId, initialData);
            return initialData;
        }
    } catch (error) {
        console.error('Error fetching marketplace data:', error);
        return getInitialMarketplaceData();
    }
};

export const saveMarketplaceData = async (userId: string, data: MarketplaceData) => {
    if (!userId) return;
    try {
        const docRef = doc(db, MARKETPLACE_COLLECTION, userId);
        data.stars.lastUpdated = Date.now();
        await setDoc(docRef, data);

        // Sync totalStars to user document
        try {
            const userRef = doc(db, 'users', userId);
            await setDoc(userRef, { totalStars: data.stars.balance }, { merge: true });
        } catch (err) {
            console.error('Error syncing totalStars to user document:', err);
            // Don't throw here, as the main save succeeded
        }
    } catch (error) {
        console.error('Error saving marketplace data:', error);
    }
};

// Helper to dispatch star update event
const dispatchStarUpdate = (balance: number, amount: number, reason: string) => {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('starUpdate', {
            detail: { balance, amount, reason }
        }));
    }
};

export const purchasePack = async (userId: string, packId: string): Promise<{ stars: number, collectible?: Collectible, collectibles?: Collectible[] }> => {
    if (!userId) throw new Error('You must be logged in to purchase packs');
    const data = await getMarketplaceData(userId);
    const pack = PACKS.find(p => p.id === packId);

    if (!pack) throw new Error('Pack not found');
    if (data.stars.balance < pack.cost) throw new Error('Insufficient stars');

    // Deduct cost (this is the only star change - no reward stars)
    data.stars.balance -= pack.cost;
    data.stars.totalSpent += pack.cost;

    // Record transaction
    const transaction: StarTransaction = {
        id: Date.now().toString(),
        amount: -pack.cost,
        type: 'spend',
        reason: `Purchased ${pack.name}`,
        timestamp: Date.now()
    };
    data.transactionHistory.unshift(transaction);

    // Handle Collectibles - can now get multiple
    const newCollectibles: Collectible[] = [];
    if (pack.rewards.collectibles) {
        const numDrops = pack.rewards.collectibles.minDrops || 1;
        const maxDrops = pack.rewards.collectibles.maxDrops || numDrops;
        const actualDrops = Math.floor(Math.random() * (maxDrops - numDrops + 1)) + numDrops;

        for (let i = 0; i < actualDrops; i++) {
            // Determine rarity based on pack tier with weighted probabilities
            let rarity: Rarity = 'common';
            const rarityRoll = Math.random();

            // Special case for Designer Pack - only Legendary, Mythic, or Divine
            if (pack.id === 'designer_pack') {
                // 40% Legendary, 30% Mythic, 30% Divine
                if (rarityRoll < 0.30) rarity = 'divine';
                else if (rarityRoll < 0.60) rarity = 'mythic';
                else rarity = 'legendary';
            } else if (pack.tier === 'elite') {
                // Elite Pack: Guaranteed Epic or better
                // 50% Epic, 30% Legendary, 15% Mythic, 5% Divine
                if (rarityRoll < 0.05) rarity = 'divine';
                else if (rarityRoll < 0.20) rarity = 'mythic';
                else if (rarityRoll < 0.50) rarity = 'legendary';
                else rarity = 'epic';
            } else if (pack.tier === 'premium') {
                // Premium Pack: Higher chance for rare/epic
                // 40% Common, 30% Uncommon, 15% Rare, 10% Epic, 4% Legendary, 0.5% Mythic, 0.5% Divine
                if (rarityRoll < 0.005) rarity = 'divine';
                else if (rarityRoll < 0.01) rarity = 'mythic';
                else if (rarityRoll < 0.05) rarity = 'legendary';
                else if (rarityRoll < 0.15) rarity = 'epic';
                else if (rarityRoll < 0.30) rarity = 'rare';
                else if (rarityRoll < 0.60) rarity = 'uncommon';
                else rarity = 'common';
            } else {
                // Starter Pack: Standard distribution
                // 50% Common, 30% Uncommon, 12% Rare, 5% Epic, 2% Legendary, 0.5% Mythic, 0.5% Divine
                if (rarityRoll < 0.005) rarity = 'divine';
                else if (rarityRoll < 0.01) rarity = 'mythic';
                else if (rarityRoll < 0.03) rarity = 'legendary';
                else if (rarityRoll < 0.08) rarity = 'epic';
                else if (rarityRoll < 0.20) rarity = 'rare';
                else if (rarityRoll < 0.50) rarity = 'uncommon';
                else rarity = 'common';
            }

            // Get random collectible of that rarity
            const availableCollectibles = COLLECTIBLES.filter(c => c.rarity === rarity);
            if (availableCollectibles.length > 0) {
                const newCollectible = availableCollectibles[Math.floor(Math.random() * availableCollectibles.length)];
                newCollectibles.push(newCollectible);

                // Add to owned (allow duplicates)
                data.ownedCollectibles.push(newCollectible.id);
            }
        }
    }

    await saveMarketplaceData(userId, data);

    // Dispatch update for the cost (negative amount)
    dispatchStarUpdate(data.stars.balance, -pack.cost, `Purchased ${pack.name}`);

    return {
        stars: data.stars.balance,
        collectible: newCollectibles[0], // For backwards compatibility
        collectibles: newCollectibles
    };
};

export const claimDailyPrize = async (userId: string): Promise<number> => {
    if (!userId) throw new Error('You must be logged in to claim the daily prize');
    const data = await getMarketplaceData(userId);

    if (!isDailyPrizeAvailable(userId, data)) {
        throw new Error('Daily prize not available yet');
    }

    const prizeAmount = Math.floor(Math.random() * 50) + 10; // 10-60 stars
    data.stars.balance += prizeAmount;
    data.stars.totalEarned += prizeAmount;
    data.dailyPrizeClaimed = Date.now();

    const transaction: StarTransaction = {
        id: Date.now().toString(),
        amount: prizeAmount,
        type: 'earn',
        reason: 'Daily Prize',
        timestamp: Date.now()
    };
    data.transactionHistory.unshift(transaction);

    await saveMarketplaceData(userId, data);
    dispatchStarUpdate(data.stars.balance, prizeAmount, 'Daily Prize');

    return prizeAmount;
};

export const isDailyPrizeAvailable = (userId: string, data?: MarketplaceData): boolean => {
    // We need data to check this properly, but for UI sync we might pass it in
    // If no data passed, we can't check accurately without async, so we assume false or handle in UI
    if (!data) return false;

    const lastClaimed = new Date(data.dailyPrizeClaimed);
    const now = new Date();

    // Check if it's a different day
    return lastClaimed.getDate() !== now.getDate() ||
        lastClaimed.getMonth() !== now.getMonth() ||
        lastClaimed.getFullYear() !== now.getFullYear();
};

export const getTimeUntilDailyPrize = (userId: string, data?: MarketplaceData): number => {
    if (!data) return 24;

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const diff = tomorrow.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60));
};

export const updateChallengeProgress = async (userId: string, type: 'lesson' | 'quiz' | 'practice', count: number = 1) => {
    const data = await getMarketplaceData(userId);
    let updated = false;

    data.dailyChallenges.forEach(challenge => {
        if (!challenge.completed && challenge.requirement.type === type) {
            challenge.progress += count;
            if (challenge.progress >= challenge.requirement.count) {
                challenge.progress = challenge.requirement.count;
                challenge.completed = true;
                // Note: We don't auto-claim anymore
            }
            updated = true;
        }
    });

    if (updated) {
        await saveMarketplaceData(userId, data);
    }
};

export const claimChallengeReward = async (userId: string, challengeId: string): Promise<number> => {
    const data = await getMarketplaceData(userId);
    const challenge = data.dailyChallenges.find(c => c.id === challengeId);

    if (!challenge) throw new Error('Challenge not found');
    if (!challenge.completed) throw new Error('Challenge not completed');
    if (challenge.claimed) throw new Error('Reward already claimed');

    challenge.claimed = true;
    data.stars.balance += challenge.reward;
    data.stars.totalEarned += challenge.reward;

    const transaction: StarTransaction = {
        id: Date.now().toString(),
        amount: challenge.reward,
        type: 'earn',
        reason: `Challenge: ${challenge.title}`,
        timestamp: Date.now()
    };
    data.transactionHistory.unshift(transaction);

    await saveMarketplaceData(userId, data);
    dispatchStarUpdate(data.stars.balance, challenge.reward, `Challenge: ${challenge.title}`);

    return challenge.reward;
};

export const getOwnedCollectibles = async (userId: string): Promise<(Collectible & { count: number })[]> => {
    const data = await getMarketplaceData(userId);
    const counts: Record<string, number> = {};

    data.ownedCollectibles.forEach(id => {
        counts[id] = (counts[id] || 0) + 1;
    });

    return COLLECTIBLES
        .filter(c => counts[c.id])
        .map(c => ({
            ...c,
            count: counts[c.id]
        }));
};

export const sellCollectible = async (userId: string, collectibleId: string, amount: number = 1): Promise<number> => {
    const data = await getMarketplaceData(userId);

    // Check if user has enough of the item
    const ownedCount = data.ownedCollectibles.filter(id => id === collectibleId).length;
    if (ownedCount < amount) throw new Error('Not enough items to sell');

    // Remove 'amount' instances
    let removedCount = 0;
    const newOwned: string[] = [];

    // Rebuild the array, skipping the first 'amount' matches
    for (const id of data.ownedCollectibles) {
        if (id === collectibleId && removedCount < amount) {
            removedCount++;
        } else {
            newOwned.push(id);
        }
    }

    data.ownedCollectibles = newOwned;

    // Calculate sell value based on rarity
    const collectible = COLLECTIBLES.find(c => c.id === collectibleId);
    let sellValuePerItem = 10; // Default common

    if (collectible) {
        switch (collectible.rarity) {
            case 'common': sellValuePerItem = 10; break;
            case 'uncommon': sellValuePerItem = 20; break;
            case 'rare': sellValuePerItem = 50; break;
            case 'epic': sellValuePerItem = 100; break;
            case 'legendary': sellValuePerItem = 250; break;
            case 'mythic': sellValuePerItem = 500; break;
            case 'divine': sellValuePerItem = 1000; break;
        }
    }

    const totalSellValue = sellValuePerItem * amount;

    data.stars.balance += totalSellValue;
    data.stars.totalEarned += totalSellValue;

    const transaction: StarTransaction = {
        id: Date.now().toString(),
        amount: totalSellValue,
        type: 'earn',
        reason: `Sold ${amount}x ${collectible?.name || 'Item'}`,
        timestamp: Date.now()
    };
    data.transactionHistory.unshift(transaction);

    await saveMarketplaceData(userId, data);
    dispatchStarUpdate(data.stars.balance, totalSellValue, `Sold ${amount}x ${collectible?.name || 'Item'}`);

    return totalSellValue;
};

export const addStars = async (userId: string, amount: number, reason: string): Promise<number> => {
    const data = await getMarketplaceData(userId);
    data.stars.balance += amount;
    data.stars.totalEarned += amount;

    const transaction: StarTransaction = {
        id: Date.now().toString(),
        amount,
        type: 'earn',
        reason,
        timestamp: Date.now()
    };
    data.transactionHistory.unshift(transaction);

    await saveMarketplaceData(userId, data);
    dispatchStarUpdate(data.stars.balance, amount, reason);

    return data.stars.balance;
};

export const spendStars = async (userId: string, amount: number, reason: string): Promise<number> => {
    const data = await getMarketplaceData(userId);
    if (data.stars.balance < amount) throw new Error('Insufficient stars');

    data.stars.balance -= amount;
    data.stars.totalSpent += amount;

    const transaction: StarTransaction = {
        id: Date.now().toString(),
        amount: -amount,
        type: 'spend',
        reason,
        timestamp: Date.now()
    };
    data.transactionHistory.unshift(transaction);

    await saveMarketplaceData(userId, data);
    dispatchStarUpdate(data.stars.balance, -amount, reason);

    return data.stars.balance;
};

import {
    MarketplaceData,
    UserTokens,
    Pack,
    DailyChallenge,
    TokenTransaction,
    Collectible,
    Rarity
} from '../types';
import { PACKS } from '../data/marketplaceData';
import { DAILY_CHALLENGES } from '../data/dailyChallengesData';
import { COLLECTIBLES } from '../data/collectiblesData';

const MARKETPLACE_STORAGE_KEY = 'codetocoder_marketplace';

// Helper to get initial state
const getInitialMarketplaceData = (): MarketplaceData => ({
    tokens: {
        balance: 0,
        totalEarned: 0,
        totalSpent: 0,
        lastUpdated: Date.now()
    },
    ownedCollectibles: [],
    dailyPrizeClaimed: 0,
    dailyChallenges: [],
    transactionHistory: []
});

export const getMarketplaceData = (userId: string): MarketplaceData => {
    const storageKey = `${MARKETPLACE_STORAGE_KEY}_${userId}`;
    const data = localStorage.getItem(storageKey);

    if (!data) {
        const initialData = getInitialMarketplaceData();
        // Initialize daily challenges
        initialData.dailyChallenges = getRandomDailyChallenges(3);
        saveMarketplaceData(userId, initialData);
        return initialData;
    }

    const parsedData = JSON.parse(data);

    // Migration: Ensure ownedCollectibles exists
    if (!parsedData.ownedCollectibles) {
        parsedData.ownedCollectibles = [];
    }

    // Check if daily challenges need refresh (new day)
    const lastUpdated = new Date(parsedData.tokens.lastUpdated);
    const now = new Date();
    if (lastUpdated.getDate() !== now.getDate() || lastUpdated.getMonth() !== now.getMonth()) {
        parsedData.dailyChallenges = getRandomDailyChallenges(3);
        parsedData.dailyPrizeClaimed = 0; // Reset daily prize
        saveMarketplaceData(userId, parsedData);
    }

    return parsedData;
};

export const saveMarketplaceData = (userId: string, data: MarketplaceData) => {
    const storageKey = `${MARKETPLACE_STORAGE_KEY}_${userId}`;
    data.tokens.lastUpdated = Date.now();
    localStorage.setItem(storageKey, JSON.stringify(data));
};

// ... (Token logic remains similar, but we need to remove boost logic)

export const purchasePack = (userId: string, packId: string): { tokens: number, collectible?: Collectible } => {
    const data = getMarketplaceData(userId);
    const pack = PACKS.find(p => p.id === packId);

    if (!pack) throw new Error('Pack not found');
    if (data.tokens.balance < pack.cost) throw new Error('Insufficient tokens');

    // Deduct cost
    data.tokens.balance -= pack.cost;
    data.tokens.totalSpent += pack.cost;

    // Generate rewards
    const tokenReward = Math.floor(Math.random() * (pack.rewards.maxTokens - pack.rewards.minTokens + 1)) + pack.rewards.minTokens;
    data.tokens.balance += tokenReward;
    data.tokens.totalEarned += tokenReward;

    // Collectible Drop Logic
    let droppedCollectible: Collectible | undefined;
    if (pack.rewards.collectibles) {
        if (Math.random() < pack.rewards.collectibles.dropRate) {
            droppedCollectible = rollForCollectible(pack.rewards.collectibles.guaranteedRarity);
            if (droppedCollectible && !data.ownedCollectibles.includes(droppedCollectible.id)) {
                data.ownedCollectibles.push(droppedCollectible.id);
            }
        }
    }

    // Record transaction
    const transaction: TokenTransaction = {
        id: crypto.randomUUID(),
        amount: -pack.cost,
        type: 'spend',
        reason: `Purchased ${pack.name}`,
        timestamp: Date.now()
    };
    data.transactionHistory.unshift(transaction);

    saveMarketplaceData(userId, data);
    return { tokens: tokenReward, collectible: droppedCollectible };
};

// Helper to roll for a collectible
const rollForCollectible = (minRarity?: Rarity): Collectible => {
    // Simplified rarity weights
    const weights = {
        common: 60,
        rare: 25,
        epic: 10,
        legendary: 4,
        mythic: 1
    };

    // Filter collectibles based on minRarity if needed (implementation detail: for now just roll)
    // For a better system, we'd adjust weights based on the pack tier.
    // Let's implement a simple weighted random selection from ALL collectibles for now, 
    // but boost the minimum rarity if specified.

    let availableCollectibles = COLLECTIBLES;

    // If guaranteed rarity is provided, we could filter, but usually it means "at least this rarity" 
    // or "higher chance". For simplicity in this v1, let's just pick a random one from the list 
    // but respecting the global rarity weights.

    const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;

    let selectedRarity: Rarity = 'common';
    for (const [rarity, weight] of Object.entries(weights)) {
        random -= weight;
        if (random <= 0) {
            selectedRarity = rarity as Rarity;
            break;
        }
    }

    // If we have a guaranteed rarity (e.g. Epic from Elite pack), force upgrade if roll was lower
    if (minRarity) {
        const rarityOrder = ['common', 'rare', 'epic', 'legendary', 'mythic'];
        if (rarityOrder.indexOf(selectedRarity) < rarityOrder.indexOf(minRarity)) {
            selectedRarity = minRarity;
        }
    }

    const candidates = COLLECTIBLES.filter(c => c.rarity === selectedRarity);
    return candidates[Math.floor(Math.random() * candidates.length)];
};

export const claimDailyPrize = (userId: string) => {
    const data = getMarketplaceData(userId);

    if (data.dailyPrizeClaimed > 0) {
        const lastClaim = new Date(data.dailyPrizeClaimed);
        const now = new Date();
        if (lastClaim.getDate() === now.getDate() && lastClaim.getMonth() === now.getMonth()) {
            throw new Error('Already claimed today');
        }
    }

    const reward = 50; // Fixed for now
    data.tokens.balance += reward;
    data.tokens.totalEarned += reward;
    data.dailyPrizeClaimed = Date.now();

    const transaction: TokenTransaction = {
        id: crypto.randomUUID(),
        amount: reward,
        type: 'earn',
        reason: 'Daily Prize',
        timestamp: Date.now()
    };
    data.transactionHistory.unshift(transaction);

    saveMarketplaceData(userId, data);
    return reward;
};

export const isDailyPrizeAvailable = (userId: string): boolean => {
    const data = getMarketplaceData(userId);
    if (data.dailyPrizeClaimed === 0) return true;

    const lastClaim = new Date(data.dailyPrizeClaimed);
    const now = new Date();
    return lastClaim.getDate() !== now.getDate() || lastClaim.getMonth() !== now.getMonth();
};

export const getTimeUntilDailyPrize = (userId: string): number => {
    if (isDailyPrizeAvailable(userId)) return 0;

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const diff = tomorrow.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60));
};

// Helper for daily challenges
const getRandomDailyChallenges = (count: number): DailyChallenge[] => {
    const shuffled = [...DAILY_CHALLENGES].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count).map(c => ({
        ...c,
        progress: 0,
        completed: false
    }));
};

export const getOwnedCollectibles = (userId: string): Collectible[] => {
    const data = getMarketplaceData(userId);
    return COLLECTIBLES.filter(c => data.ownedCollectibles.includes(c.id));
};

export const updateChallengeProgress = (userId: string, type: 'lesson' | 'quiz' | 'practice' | 'project', count: number = 1) => {
    const data = getMarketplaceData(userId);
    let updated = false;

    data.dailyChallenges.forEach(challenge => {
        if (!challenge.completed && challenge.requirement.type === type) {
            challenge.progress += count;
            if (challenge.progress >= challenge.requirement.count) {
                challenge.completed = true;
                challenge.progress = challenge.requirement.count;

                // Award reward
                data.tokens.balance += challenge.reward;
                data.tokens.totalEarned += challenge.reward;

                // Log transaction
                data.transactionHistory.unshift({
                    id: crypto.randomUUID(),
                    amount: challenge.reward,
                    type: 'earn',
                    reason: `Completed daily challenge: ${challenge.title}`,
                    timestamp: Date.now()
                });
            }
            updated = true;
        }
    });

    if (updated) {
        saveMarketplaceData(userId, data);
    }
};

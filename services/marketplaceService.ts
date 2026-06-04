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
    Difficulty,
    StarsData,
    DailyChallengesData,
    CollectionData
} from '../types';
import { userPaths } from './firestorePathHelper';

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

import { PACKS_DATA } from '../data/packsData';
import { DAILY_CHALLENGES } from '../data/dailyChallengesData';
import { COLLECTIBLES, COLLECTIBLE_SELL_RATES } from '../data/collectiblesData';

const CURRENT_MARKETPLACE_VERSION = 3; // Incremented for new structure

/**
 * Calculate the total value of owned collectibles by counting each rarity
 * and multiplying by the worth of that rarity
 * @param ownedCollectibleIds - Array of collectible IDs owned by the user
 * @returns Object with total value and breakdown by rarity
 */
const calculateCollectiblesValue = (ownedCollectibleIds: string[]): { totalValue: number, breakdown: Record<string, { count: number, value: number }> } => {
    // Count collectibles by rarity
    const rarityCounts: Record<string, number> = {
        common: 0,
        uncommon: 0,
        rare: 0,
        epic: 0,
        legendary: 0,
        mythic: 0,
        divine: 0
    };
    
    // Count each collectible by its rarity
    for (const id of ownedCollectibleIds) {
        const collectible = COLLECTIBLES.find(c => c.id === id);
        if (collectible && collectible.rarity in rarityCounts) {
            rarityCounts[collectible.rarity]++;
        }
    }
    
    // Calculate value for each rarity: count * worth per rarity
    let totalValue = 0;
    const breakdown: Record<string, { count: number, value: number }> = {};
    
    for (const [rarity, count] of Object.entries(rarityCounts)) {
        const worthPerItem = COLLECTIBLE_SELL_RATES[rarity as keyof typeof COLLECTIBLE_SELL_RATES] || 0;
        const value = count * worthPerItem;
        breakdown[rarity] = { count, value };
        totalValue += value;
    }
    
    return { totalValue, breakdown };
};

/**
 * Update net_value on the user's root document for leaderboard
 * Net Worth = Current Star Balance + Value of All Collectibles Owned
 */
const updateNetValue = async (userId: string, starsBalance: number, ownedCollectibleIds: string[]): Promise<void> => {
    const { totalValue: collectiblesValue } = calculateCollectiblesValue(ownedCollectibleIds);
    const netWorth = starsBalance + collectiblesValue;
    
    console.log(`[Net Worth] Updating for user ${userId}: Stars Balance = ${starsBalance}, Collectibles Value = ${collectiblesValue}, Net Worth = ${netWorth}`);
    
    const userRef = userPaths.root(userId);
    await setDoc(userRef, {
        net_value: netWorth,
        lastActive: Date.now()
    }, { merge: true });
};

/**
 * Ensure root user document exists
 * This is required before creating subcollections in Firestore
 */
const ensureUserDocument = async (userId: string): Promise<void> => {
    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            // Create minimal user document
            await setDoc(userRef, {
                createdAt: Date.now(),
                lastActive: Date.now()
            }, { merge: true });
        } else {
            // Update last active
            await setDoc(userRef, {
                lastActive: Date.now()
            }, { merge: true });
        }
    } catch (error) {
        console.error('Failed to ensure user document:', error);
    }
};

// ============================================================================
// NEW STRUCTURE - STARS DATA
// ============================================================================

/**
 * Get stars data from new structure
 */
export const getStarsData = async (userId: string): Promise<StarsData> => {
    if (!userId) {
        return {
            balance: 0,
            totalEarned: 0,
            totalSpent: 0,
            lastUpdated: Date.now(),
            transactionHistory: [],
            dailyPrizeClaimed: 0,
            currentStreak: 0,
            longestStreak: 0,
            lastActiveDate: ''
        };
    }

    try {
        const starsRef = userPaths.stars(userId);
        const starsSnap = await getDoc(starsRef);

        if (starsSnap.exists()) {
            return starsSnap.data() as StarsData;
        }

        // Initialize if doesn't exist
        const initialData: StarsData = {
            balance: 0,
            totalEarned: 0,
            totalSpent: 0,
            lastUpdated: Date.now(),
            transactionHistory: [],
            dailyPrizeClaimed: 0,
            currentStreak: 0,
            longestStreak: 0,
            lastActiveDate: ''
        };
        await setDoc(starsRef, initialData);
        return initialData;
    } catch (error) {
        console.error('Error fetching stars data:', error);
        return {
            balance: 0,
            totalEarned: 0,
            totalSpent: 0,
            lastUpdated: Date.now(),
            transactionHistory: [],
            dailyPrizeClaimed: 0,
            currentStreak: 0,
            longestStreak: 0,
            lastActiveDate: ''
        };
    }
};

/**
 * Save stars data to new structure
 */
export const saveStarsData = async (userId: string, data: StarsData): Promise<void> => {
    if (!userId) return;

    try {
        // Ensure root user document exists
        await ensureUserDocument(userId);

        const starsRef = userPaths.stars(userId);
        data.lastUpdated = Date.now();
        await setDoc(starsRef, data);

        // Fetch collection data to calculate net worth
        // Net Worth = Current Star Balance + Value of All Collectibles Owned
        const collectionRef = userPaths.collection(userId);
        const collectionSnap = await getDoc(collectionRef);
        const ownedCollectibleIds = collectionSnap.exists() 
            ? (collectionSnap.data() as CollectionData).collectibles.ownedCollectibleIds 
            : [];
        
        await updateNetValue(userId, data.balance, ownedCollectibleIds);

    } catch (error) {
        console.error('Error saving stars data:', error);
    }
};

// ============================================================================
// DAILY CHALLENGES
// ============================================================================

/**
 * Get random daily challenges
 */
const getRandomDailyChallenges = (count: number): DailyChallenge[] => {
    const shuffled = [...DAILY_CHALLENGES].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count).map(template => ({
        ...template,
        progress: 0,
        completed: false,
        claimed: false
    }));
};

/**
 * Get daily challenges from new structure
 */
export const getDailyChallenges = async (userId: string): Promise<DailyChallenge[]> => {
    if (!userId) return [];

    try {
        const challengesRef = userPaths.dailyChallenges.current(userId);
        const challengesSnap = await getDoc(challengesRef);

        if (challengesSnap.exists()) {
            const data = challengesSnap.data() as DailyChallengesData;

            // Check if challenges need refresh (new day)
            const lastRefreshed = new Date(data.lastRefreshed);
            const now = new Date();

            if (lastRefreshed.getDate() !== now.getDate() ||
                lastRefreshed.getMonth() !== now.getMonth() ||
                lastRefreshed.getFullYear() !== now.getFullYear()) {
                // New day, refresh challenges
                const newChallenges = getRandomDailyChallenges(3);
                await saveDailyChallenges(userId, newChallenges);
                return newChallenges;
            }

            return data.challenges;
        }

        // Initialize if doesn't exist
        const initialChallenges = getRandomDailyChallenges(3);
        await saveDailyChallenges(userId, initialChallenges);
        return initialChallenges;
    } catch (error) {
        console.error('Error fetching daily challenges:', error);
        return [];
    }
};

/**
 * Save daily challenges to new structure
 */
export const saveDailyChallenges = async (userId: string, challenges: DailyChallenge[]): Promise<void> => {
    if (!userId) return;

    try {
        // Ensure root user document exists
        await ensureUserDocument(userId);

        const challengesRef = userPaths.dailyChallenges.current(userId);
        const data: DailyChallengesData = {
            challenges,
            lastRefreshed: Date.now()
        };
        await setDoc(challengesRef, data);
    } catch (error) {
        console.error('Error saving daily challenges:', error);
    }
};

// ============================================================================
// COLLECTION DATA
// ============================================================================

/**
 * Get collection data from new structure
 */
export const getCollectionData = async (userId: string): Promise<CollectionData> => {
    if (!userId) {
        return {
            badges: {
                earnedBadgeIds: [],
                totalPoints: 0,
                lastUpdated: Date.now()
            },
            collectibles: {
                ownedCollectibleIds: []
            }
        };
    }

    try {
        const collectionRef = userPaths.collection(userId);
        const collectionSnap = await getDoc(collectionRef);

        if (collectionSnap.exists()) {
            return collectionSnap.data() as CollectionData;
        }

        // Initialize if doesn't exist
        const initialData: CollectionData = {
            badges: {
                earnedBadgeIds: [],
                totalPoints: 0,
                lastUpdated: Date.now()
            },
            collectibles: {
                ownedCollectibleIds: []
            }
        };
        await setDoc(collectionRef, initialData);
        return initialData;
    } catch (error) {
        console.error('Error fetching collection data:', error);
        return {
            badges: {
                earnedBadgeIds: [],
                totalPoints: 0,
                lastUpdated: Date.now()
            },
            collectibles: {
                ownedCollectibleIds: []
            }
        };
    }
};

/**
 * Save collection data to new structure
 */
export const saveCollectionData = async (userId: string, data: CollectionData): Promise<void> => {
    if (!userId) return;

    try {
        // Ensure root user document exists
        await ensureUserDocument(userId);

        const collectionRef = userPaths.collection(userId);
        await setDoc(collectionRef, data);

        // Update net_value when collectibles change
        // Net Worth = Current Star Balance + Value of All Collectibles Owned
        const starsRef = userPaths.stars(userId);
        const starsSnap = await getDoc(starsRef);
        const starsBalance = starsSnap.exists() 
            ? (starsSnap.data() as StarsData).balance 
            : 0;
        
        await updateNetValue(userId, starsBalance, data.collectibles.ownedCollectibleIds);
    } catch (error) {
        console.error('Error saving collection data:', error);
    }
};

// ============================================================================
// NET WORTH CALCULATION
// ============================================================================

/**
 * Recalculate and update net worth for a user
 * Call this on login or when you need to ensure net worth is up-to-date
 * Net Worth = Current Star Balance + Value of All Collectibles Owned
 */
// Optional pre-fetched values let callers (e.g. loadStarBalance in App.tsx)
// skip the two extra Firestore reads when they already pulled stars and
// collectibles via getMarketplaceData a moment earlier.
export const recalculateNetWorth = async (
    userId: string,
    prefetched?: { balance: number; ownedCollectibleIds: string[] }
): Promise<number> => {
    if (!userId) return 0;

    try {
        let balance: number;
        let ownedCollectibleIds: string[];

        if (prefetched) {
            balance = prefetched.balance;
            ownedCollectibleIds = prefetched.ownedCollectibleIds;
        } else {
            const starsData = await getStarsData(userId);
            const collectionData = await getCollectionData(userId);
            balance = starsData.balance;
            ownedCollectibleIds = collectionData.collectibles.ownedCollectibleIds || [];
        }

        const { totalValue: collectiblesValue } = calculateCollectiblesValue(ownedCollectibleIds);
        const netWorth = balance + collectiblesValue;

        const userRef = userPaths.root(userId);
        await setDoc(userRef, {
            net_value: netWorth,
            lastActive: Date.now()
        }, { merge: true });

        return netWorth;
    } catch (error) {
        console.error('[Net Worth] Error recalculating:', error);
        return 0;
    }
};

// ============================================================================
// COMBINED MARKETPLACE DATA (For backward compatibility)
// ============================================================================

/**
 * Get marketplace data (combines stars, challenges, and collection)
 * @deprecated Use getStarsData, getDailyChallenges, and getCollectionData instead
 */
export const getMarketplaceData = async (userId: string): Promise<MarketplaceData> => {
    const starsData = await getStarsData(userId);
    const challenges = await getDailyChallenges(userId);
    const collectionData = await getCollectionData(userId);

    return {
        stars: {
            balance: starsData.balance,
            totalEarned: starsData.totalEarned,
            totalSpent: starsData.totalSpent,
            lastUpdated: starsData.lastUpdated
        },
        ownedCollectibles: collectionData.collectibles.ownedCollectibleIds,
        dailyPrizeClaimed: starsData.dailyPrizeClaimed,
        dailyChallenges: challenges,
        transactionHistory: starsData.transactionHistory,
        completedActivities: {
            lessons: [],
            quizzes: [],
            practice: []
        },
        version: CURRENT_MARKETPLACE_VERSION
    };
};

/**
 * Save marketplace data (splits into stars, challenges, and collection)
 * @deprecated Use saveStarsData, saveDailyChallenges, and saveCollectionData instead
 */
export const saveMarketplaceData = async (userId: string, data: MarketplaceData): Promise<void> => {
    if (!userId) return;

    const starsData: StarsData = {
        balance: data.stars.balance,
        totalEarned: data.stars.totalEarned,
        totalSpent: data.stars.totalSpent,
        lastUpdated: data.stars.lastUpdated,
        transactionHistory: data.transactionHistory,
        dailyPrizeClaimed: data.dailyPrizeClaimed,
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: ''
    };

    const collectionData: CollectionData = {
        badges: {
            earnedBadgeIds: [],
            totalPoints: 0,
            lastUpdated: Date.now()
        },
        collectibles: {
            ownedCollectibleIds: data.ownedCollectibles
        }
    };

    await saveStarsData(userId, starsData);
    await saveDailyChallenges(userId, data.dailyChallenges);
    await saveCollectionData(userId, collectionData);
};

// ============================================================================
// STAR UPDATE EVENTS
// ============================================================================

/**
 * Dispatch star update event
 */
const dispatchStarUpdate = (balance: number, amount: number, reason: string) => {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('starUpdate', {
            detail: { balance, amount, reason }
        }));
    }
};

// ============================================================================
// PACK PURCHASING
// ============================================================================

export const purchasePack = async (userId: string, packId: string): Promise<{ stars: number, collectible?: Collectible, collectibles?: Collectible[] }> => {
    if (!userId) throw new Error('You must be logged in to purchase packs');

    const starsData = await getStarsData(userId);
    const collectionData = await getCollectionData(userId);
    const pack = PACKS_DATA.find(p => p.id === packId);

    if (!pack) throw new Error('Pack not found');
    if (starsData.balance < pack.cost) throw new Error('Insufficient stars');

    // Deduct cost
    starsData.balance -= pack.cost;
    starsData.totalSpent += pack.cost;

    // Record transaction
    const transaction: StarTransaction = {
        id: Date.now().toString(),
        amount: -pack.cost,
        type: 'spend',
        reason: `Purchased ${pack.name}`,
        timestamp: Date.now()
    };
    starsData.transactionHistory.unshift(transaction);

    // Handle Collectibles
    const newCollectibles: Collectible[] = [];
    if (pack.rewards.collectibles) {
        const numDrops = pack.rewards.collectibles.minDrops || 1;
        const maxDrops = pack.rewards.collectibles.maxDrops || numDrops;
        const actualDrops = Math.floor(Math.random() * (maxDrops - numDrops + 1)) + numDrops;

        for (let i = 0; i < actualDrops; i++) {
            let rarity: Rarity = 'common';
            const rarityRoll = Math.random();

            // Determine rarity based on pack drop rates
            const dropRates = pack.dropRates;
            
            // Calculate cumulative probabilities
            if (rarityRoll < dropRates.divine) {
                rarity = 'divine';
            } else if (rarityRoll < dropRates.divine + dropRates.mythic) {
                rarity = 'mythic';
            } else if (rarityRoll < dropRates.divine + dropRates.mythic + dropRates.legendary) {
                rarity = 'legendary';
            } else if (rarityRoll < dropRates.divine + dropRates.mythic + dropRates.legendary + dropRates.epic) {
                rarity = 'epic';
            } else if (rarityRoll < dropRates.divine + dropRates.mythic + dropRates.legendary + dropRates.epic + dropRates.rare) {
                rarity = 'rare';
            } else if (rarityRoll < dropRates.divine + dropRates.mythic + dropRates.legendary + dropRates.epic + dropRates.rare + dropRates.uncommon) {
                rarity = 'uncommon';
            } else {
                rarity = 'common';
            }

            const availableCollectibles = COLLECTIBLES.filter(c => c.rarity === rarity);
            if (availableCollectibles.length > 0) {
                const newCollectible = availableCollectibles[Math.floor(Math.random() * availableCollectibles.length)];
                newCollectibles.push(newCollectible);
                collectionData.collectibles.ownedCollectibleIds.push(newCollectible.id);
            }
        }
    }

    await saveStarsData(userId, starsData);
    await saveCollectionData(userId, collectionData);

    dispatchStarUpdate(starsData.balance, -pack.cost, `Purchased ${pack.name}`);

    return {
        stars: starsData.balance,
        collectible: newCollectibles[0],
        collectibles: newCollectibles
    };
};

// ============================================================================
// DAILY PRIZE
// ============================================================================

export const claimDailyPrize = async (userId: string): Promise<number> => {
    if (!userId) throw new Error('You must be logged in to claim the daily prize');

    const starsData = await getStarsData(userId);

    if (!isDailyPrizeAvailable(userId, starsData)) {
        throw new Error('Daily prize not available yet');
    }

    const prizeAmount = Math.floor(Math.random() * 50) + 10; // 10-60 stars
    starsData.balance += prizeAmount;
    starsData.totalEarned += prizeAmount;
    starsData.dailyPrizeClaimed = Date.now();

    const transaction: StarTransaction = {
        id: Date.now().toString(),
        amount: prizeAmount,
        type: 'earn',
        reason: 'Daily Prize',
        timestamp: Date.now()
    };
    starsData.transactionHistory.unshift(transaction);

    await saveStarsData(userId, starsData);
    dispatchStarUpdate(starsData.balance, prizeAmount, 'Daily Prize');

    return prizeAmount;
};

export const isDailyPrizeAvailable = (userId: string, starsData?: StarsData | MarketplaceData): boolean => {
    if (!starsData) return false;

    const lastClaimed = new Date(starsData.dailyPrizeClaimed);
    const now = new Date();

    return lastClaimed.getDate() !== now.getDate() ||
        lastClaimed.getMonth() !== now.getMonth() ||
        lastClaimed.getFullYear() !== now.getFullYear();
};

export const getTimeUntilDailyPrize = (userId: string, starsData?: StarsData | MarketplaceData): number => {
    if (!starsData) return 24;

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const diff = tomorrow.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60));
};

// ============================================================================
// CHALLENGE PROGRESS
// ============================================================================

export const updateChallengeProgress = async (userId: string, type: 'lesson' | 'quiz' | 'practice', count: number = 1) => {
    const challenges = await getDailyChallenges(userId);
    let updated = false;

    challenges.forEach(challenge => {
        if (!challenge.completed && challenge.requirement.type === type) {
            challenge.progress += count;
            if (challenge.progress >= challenge.requirement.count) {
                challenge.progress = challenge.requirement.count;
                challenge.completed = true;
            }
            updated = true;
        }
    });

    if (updated) {
        await saveDailyChallenges(userId, challenges);
    }
};

export const claimChallengeReward = async (userId: string, challengeId: string): Promise<number> => {
    const challenges = await getDailyChallenges(userId);
    const starsData = await getStarsData(userId);
    const challenge = challenges.find(c => c.id === challengeId);

    if (!challenge) throw new Error('Challenge not found');
    if (!challenge.completed) throw new Error('Challenge not completed');
    if (challenge.claimed) throw new Error('Reward already claimed');

    challenge.claimed = true;
    starsData.balance += challenge.reward;
    starsData.totalEarned += challenge.reward;

    const transaction: StarTransaction = {
        id: Date.now().toString(),
        amount: challenge.reward,
        type: 'earn',
        reason: `Challenge: ${challenge.title}`,
        timestamp: Date.now()
    };
    starsData.transactionHistory.unshift(transaction);

    await saveDailyChallenges(userId, challenges);
    await saveStarsData(userId, starsData);
    dispatchStarUpdate(starsData.balance, challenge.reward, `Challenge: ${challenge.title}`);

    return challenge.reward;
};

// ============================================================================
// COLLECTIBLES
// ============================================================================

export const getOwnedCollectibles = async (userId: string): Promise<(Collectible & { count: number })[]> => {
    const collectionData = await getCollectionData(userId);
    const counts: Record<string, number> = {};

    collectionData.collectibles.ownedCollectibleIds.forEach(id => {
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
    const collectionData = await getCollectionData(userId);
    const starsData = await getStarsData(userId);

    // Check if user has enough of the item
    const ownedCount = collectionData.collectibles.ownedCollectibleIds.filter(id => id === collectibleId).length;
    if (ownedCount < amount) throw new Error('Not enough items to sell');

    // Remove 'amount' instances
    let removedCount = 0;
    const newOwned: string[] = [];

    for (const id of collectionData.collectibles.ownedCollectibleIds) {
        if (id === collectibleId && removedCount < amount) {
            removedCount++;
        } else {
            newOwned.push(id);
        }
    }

    collectionData.collectibles.ownedCollectibleIds = newOwned;

    // Calculate sell value using COLLECTIBLE_SELL_RATES
    const collectible = COLLECTIBLES.find(c => c.id === collectibleId);
    let sellValuePerItem = COLLECTIBLE_SELL_RATES.common; // Default to common rarity value

    if (collectible) {
        sellValuePerItem = COLLECTIBLE_SELL_RATES[collectible.rarity];
    }

    const totalSellValue = sellValuePerItem * amount;

    starsData.balance += totalSellValue;
    starsData.totalEarned += totalSellValue;

    const transaction: StarTransaction = {
        id: Date.now().toString(),
        amount: totalSellValue,
        type: 'earn',
        reason: `Sold ${amount}x ${collectible?.name || 'Item'}`,
        timestamp: Date.now()
    };
    starsData.transactionHistory.unshift(transaction);

    await saveCollectionData(userId, collectionData);
    await saveStarsData(userId, starsData);
    dispatchStarUpdate(starsData.balance, totalSellValue, `Sold ${amount}x ${collectible?.name || 'Item'}`);

    return totalSellValue;
};

/**
 * Sell all duplicate collectibles (keeps one of each)
 * Returns the total number sold and total stars earned
 */
export const sellAllDuplicates = async (userId: string): Promise<{ totalSold: number, totalEarned: number }> => {
    const collectionData = await getCollectionData(userId);
    const starsData = await getStarsData(userId);

    // Count occurrences of each collectible
    const counts: Record<string, number> = {};
    collectionData.collectibles.ownedCollectibleIds.forEach(id => {
        counts[id] = (counts[id] || 0) + 1;
    });

    // Calculate duplicates to sell and total value
    let totalSold = 0;
    let totalEarned = 0;
    const newOwned: string[] = [];
    const soldItems: { name: string, count: number }[] = [];

    // Keep one of each, mark the rest for selling
    const processedIds = new Set<string>();
    
    for (const id of collectionData.collectibles.ownedCollectibleIds) {
        if (!processedIds.has(id)) {
            // First occurrence - keep it
            newOwned.push(id);
            processedIds.add(id);
        } else if (counts[id] > 1) {
            // Duplicate - sell it
            const collectible = COLLECTIBLES.find(c => c.id === id);
            if (collectible) {
                const sellValue = COLLECTIBLE_SELL_RATES[collectible.rarity];
                totalEarned += sellValue;
                totalSold++;
                
                // Track for transaction message
                const existingSoldItem = soldItems.find(item => item.name === collectible.name);
                if (existingSoldItem) {
                    existingSoldItem.count++;
                } else {
                    soldItems.push({ name: collectible.name, count: 1 });
                }
            }
            counts[id]--; // Decrease count so we sell one at a time
        }
    }

    if (totalSold === 0) {
        return { totalSold: 0, totalEarned: 0 };
    }

    // Update collection data
    collectionData.collectibles.ownedCollectibleIds = newOwned;

    // Update stars
    starsData.balance += totalEarned;
    starsData.totalEarned += totalEarned;

    // Record transaction
    const transaction: StarTransaction = {
        id: Date.now().toString(),
        amount: totalEarned,
        type: 'earn',
        reason: `Sold ${totalSold} duplicate item${totalSold > 1 ? 's' : ''}`,
        timestamp: Date.now()
    };
    starsData.transactionHistory.unshift(transaction);

    await saveCollectionData(userId, collectionData);
    await saveStarsData(userId, starsData);
    dispatchStarUpdate(starsData.balance, totalEarned, `Sold ${totalSold} duplicate item${totalSold > 1 ? 's' : ''}`);

    return { totalSold, totalEarned };
};

// ============================================================================
// STAR MANAGEMENT
// ============================================================================

export const addStars = async (userId: string, amount: number, reason: string): Promise<number> => {
    const starsData = await getStarsData(userId);
    starsData.balance += amount;
    starsData.totalEarned += amount;

    const transaction: StarTransaction = {
        id: Date.now().toString(),
        amount,
        type: 'earn',
        reason,
        timestamp: Date.now()
    };
    starsData.transactionHistory.unshift(transaction);

    await saveStarsData(userId, starsData);
    dispatchStarUpdate(starsData.balance, amount, reason);

    return starsData.balance;
};

export const spendStars = async (userId: string, amount: number, reason: string): Promise<number> => {
    const starsData = await getStarsData(userId);
    if (starsData.balance < amount) throw new Error('Insufficient stars');

    starsData.balance -= amount;
    starsData.totalSpent += amount;

    const transaction: StarTransaction = {
        id: Date.now().toString(),
        amount: -amount,
        type: 'spend',
        reason,
        timestamp: Date.now()
    };
    starsData.transactionHistory.unshift(transaction);

    await saveStarsData(userId, starsData);
    dispatchStarUpdate(starsData.balance, -amount, reason);

    return starsData.balance;
};

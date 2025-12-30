/**
 * Pack System Data
 * 
 * This file contains pack-related information including:
 * - Pack definitions with names, descriptions, costs, and icons
 * - Drop rate percentages for each rarity tier per pack
 * - Number of collectibles dropped per pack
 * 
 * Note: Collectibles and their sell rates are defined in collectiblesData.ts
 */

import { Pack } from '../types';

// ============================================================================
// PACK DEFINITIONS
// ============================================================================

export interface PackDropRates {
    common: number;
    uncommon: number;
    rare: number;
    epic: number;
    legendary: number;
    mythic: number;
    divine: number;
}

export interface PackData extends Pack {
    icon: string;
    dropRates: PackDropRates;
    collectibleCount: {
        min: number;
        max: number;
    };
}

export const PACKS_DATA: PackData[] = [
    {
        id: 'starter_pack',
        name: 'Starter Pack',
        tier: 'starter',
        cost: 40,
        description: 'Begin your journey with 1-2 guaranteed collectibles',
        icon: '📦',
        dropRates: {
            common: 0.50,      // 50%
            uncommon: 0.30,    // 30%
            rare: 0.15,        // 15%
            epic: 0.05,        // 5%
            legendary: 0.00,   // 0%
            mythic: 0.00,      // 0%
            divine: 0.00       // 0%
        },
        collectibleCount: {
            min: 1,
            max: 2
        },
        rewards: {
            minStars: 0,
            maxStars: 0,
            collectibles: {
                dropRate: 1.0,
                guaranteedRarity: 'common',
                minDrops: 1,
                maxDrops: 2
            }
        }
    },
    {
        id: 'premium_pack',
        name: 'Premium Pack',
        tier: 'premium',
        cost: 80,
        description: 'Unlock 2-3 rare items with higher quality',
        icon: '🎁',
        dropRates: {
            common: 0.10,      // 10%
            uncommon: 0.37,    // 37%
            rare: 0.40,        // 40%
            epic: 0.10,        // 10%
            legendary: 0.025,  // 2.5%
            mythic: 0.005,     // 0.5%
            divine: 0.00       // 0%
        },
        collectibleCount: {
            min: 2,
            max: 3
        },
        rewards: {
            minStars: 0,
            maxStars: 0,
            collectibles: {
                dropRate: 1.0,
                guaranteedRarity: 'rare',
                minDrops: 2,
                maxDrops: 3
            }
        }
    },
    {
        id: 'elite_pack',
        name: 'Elite Pack',
        tier: 'elite',
        cost: 250,
        description: 'Premium package with 2-3 Epic and Legendary collectibles',
        icon: '💎',
        dropRates: {
            common: 0.00,      // 0%
            uncommon: 0.00,    // 0%
            rare: 0.00,        // 0%
            epic: 0.80,        // 80%
            legendary: 0.15,   // 15%
            mythic: 0.045,     // 4.5%
            divine: 0.005      // 0.5%
        },
        collectibleCount: {
            min: 2,
            max: 3
        },
        rewards: {
            minStars: 0,
            maxStars: 0,
            collectibles: {
                dropRate: 1.0,
                guaranteedRarity: 'epic',
                minDrops: 2,
                maxDrops: 3
            }
        }
    },
    {
        id: 'developer_pack',
        name: 'Developer Pack',
        tier: 'developer',
        cost: 175,
        description: 'A balanced mix of collectibles for the aspiring developer',
        icon: '💻',
        dropRates: {
            common: 0.30,      // 30%
            uncommon: 0.30,    // 30%
            rare: 0.30,        // 30%
            epic: 0.10,        // 10%
            legendary: 0.00,   // 0%
            mythic: 0.00,      // 0%
            divine: 0.00       // 0%
        },
        collectibleCount: {
            min: 4,
            max: 8
        },
        rewards: {
            minStars: 0,
            maxStars: 0,
            collectibles: {
                dropRate: 1.0,
                guaranteedRarity: 'common',
                minDrops: 4,
                maxDrops: 8
            }
        }
    },
    {
        id: 'designer_pack',
        name: 'Designer Pack',
        tier: 'designer',
        cost: 350,
        description: 'Premium single item - guaranteed Legendary+ collectible',
        icon: '✨',
        dropRates: {
            common: 0.00,      // 0%
            uncommon: 0.00,    // 0%
            rare: 0.00,        // 0%
            epic: 0.00,        // 0%
            legendary: 0.50,   // 50%
            mythic: 0.47,      // 47%
            divine: 0.03       // 3%
        },
        collectibleCount: {
            min: 1,
            max: 1
        },
        rewards: {
            minStars: 0,
            maxStars: 0,
            collectibles: {
                dropRate: 1.0,
                guaranteedRarity: 'legendary',
                minDrops: 1,
                maxDrops: 1
            }
        }
    }
];

// Re-export collectibles and styling from collectiblesData for convenience
export { 
    COLLECTIBLES, 
    RARITY_COLORS, 
    RARITY_BG_COLORS, 
    RARITY_BORDER_COLORS, 
    RARITY_GLOW,
    COLLECTIBLE_SELL_RATES
} from './collectiblesData';

import { Pack } from '../types';

export const PACKS: Pack[] = [
    {
        id: 'starter_pack',
        name: 'Starter Pack',
        tier: 'starter',
        cost: 50,
        description: 'Begin your journey with 1-2 guaranteed collectibles',
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
        cost: 100,
        description: 'Unlock 2-3 rare items with higher quality',
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
        cost: 200,
        description: 'Premium package with 2-4 Epic and Legendary collectibles',
        rewards: {
            minStars: 0,
            maxStars: 0,
            collectibles: {
                dropRate: 1.0,
                guaranteedRarity: 'epic',
                minDrops: 2,
                maxDrops: 4
            }
        }
    },
    {
        id: 'developer_pack',
        name: 'Developer Pack',
        tier: 'starter',
        cost: 200,
        description: 'Bulk pack - 5-10 common items for building your collection',
        rewards: {
            minStars: 0,
            maxStars: 0,
            collectibles: {
                dropRate: 1.0,
                guaranteedRarity: 'common',
                minDrops: 5,
                maxDrops: 10
            }
        }
    },
    {
        id: 'designer_pack',
        name: 'Designer Pack',
        tier: 'elite',
        cost: 200,
        description: 'Premium single item - guaranteed Legendary or Mythic collectible',
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

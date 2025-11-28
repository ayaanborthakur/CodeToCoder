import { Pack } from '../types';

export const PACKS: Pack[] = [
    {
        id: 'starter_pack',
        name: 'Starter Pack',
        tier: 'starter',
        cost: 100,
        description: 'Begin your journey with bonus tokens and a chance for common collectibles',
        rewards: {
            minTokens: 50,
            maxTokens: 100,
            collectibles: {
                dropRate: 0.5, // 50% chance
                guaranteedRarity: 'common'
            }
        }
    },
    {
        id: 'premium_pack',
        name: 'Premium Pack',
        tier: 'premium',
        cost: 250,
        description: 'Unlock greater rewards with higher chances for rare items',
        rewards: {
            minTokens: 150,
            maxTokens: 300,
            collectibles: {
                dropRate: 0.8, // 80% chance
                guaranteedRarity: 'rare'
            }
        }
    },
    {
        id: 'elite_pack',
        name: 'Elite Pack',
        tier: 'elite',
        cost: 500,
        description: 'The ultimate package. High chance for Epic and Legendary collectibles',
        rewards: {
            minTokens: 400,
            maxTokens: 800,
            collectibles: {
                dropRate: 1.0, // 100% chance
                guaranteedRarity: 'epic'
            }
        }
    }
];

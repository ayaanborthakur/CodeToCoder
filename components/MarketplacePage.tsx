import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getTokenData } from '../services/tokenService';
import {
    getMarketplaceData,
    purchasePack,
    claimDailyPrize,
    isDailyPrizeAvailable,
    getTimeUntilDailyPrize
} from '../services/marketplaceService';
import { PACKS } from '../data/marketplaceData';
import { RARITY_COLORS, RARITY_BG_COLORS } from '../data/collectiblesData';
import type { UserTokens, DailyChallenge, Collectible } from '../types';

interface MarketplacePageProps {
    onNavigate: (view: string) => void;
}

export const MarketplacePage: React.FC<MarketplacePageProps> = ({ onNavigate }) => {
    const { user } = useAuth();
    const [tokens, setTokens] = useState<UserTokens | null>(null);
    const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>([]);
    const [dailyPrizeAvailable, setDailyPrizeAvailable] = useState(false);
    const [hoursUntilPrize, setHoursUntilPrize] = useState(0);
    const [purchasingPack, setPurchasingPack] = useState<string | null>(null);
    const [claimingPrize, setClaimingPrize] = useState(false);

    // New Collectible Modal State
    const [newCollectible, setNewCollectible] = useState<Collectible | null>(null);

    useEffect(() => {
        if (!user) return;

        const marketplaceData = getMarketplaceData(user.id);
        const tokenData = getTokenData(user.id);

        setTokens(tokenData);
        setDailyChallenges(marketplaceData.dailyChallenges);
        setDailyPrizeAvailable(isDailyPrizeAvailable(user.id));
        setHoursUntilPrize(getTimeUntilDailyPrize(user.id));
    }, [user]);

    const handlePurchasePack = async (packId: string) => {
        if (!user) return;

        setPurchasingPack(packId);
        try {
            const result = purchasePack(user.id, packId);

            setTokens(getTokenData(user.id));

            if (result.collectible) {
                setNewCollectible(result.collectible);
            }
        } catch (error) {
            console.error('Failed to purchase pack:', error);
        } finally {
            setPurchasingPack(null);
        }
    };

    const handleClaimDailyPrize = async () => {
        if (!user) return;

        setClaimingPrize(true);
        try {
            claimDailyPrize(user.id);

            setTokens(getTokenData(user.id));
            setDailyPrizeAvailable(false);
            setHoursUntilPrize(24);
        } catch (error) {
            console.error('Failed to claim prize:', error);
        } finally {
            setClaimingPrize(false);
        }
    };

    if (!user || !tokens) {
        return null;
    }

    return (
        <div className="h-full w-full overflow-y-auto bg-slate-950 text-slate-100 relative">
            {/* New Collectible Modal */}
            {newCollectible && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-slate-900 border-2 border-slate-700 rounded-2xl p-8 max-w-sm w-full text-center relative overflow-hidden shadow-2xl animate-in zoom-in-50 duration-300">
                        <div className={`absolute inset-0 opacity-20 ${RARITY_BG_COLORS[newCollectible.rarity]}`} />
                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold text-white mb-2">New Collectible!</h3>
                            <div className="text-6xl mb-4 animate-bounce">{newCollectible.image}</div>
                            <div className={`text-xl font-bold mb-2 uppercase tracking-wider ${RARITY_COLORS[newCollectible.rarity]}`}>
                                {newCollectible.rarity}
                            </div>
                            <h4 className="text-2xl font-bold text-white mb-2">{newCollectible.name}</h4>
                            <p className="text-slate-400 mb-6">{newCollectible.description}</p>
                            <button
                                onClick={() => setNewCollectible(null)}
                                className="bg-white text-slate-900 font-bold py-3 px-8 rounded-xl hover:scale-105 transition-transform"
                            >
                                Awesome!
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto p-6 md:p-8">
                {/* Header */}
                <div className="mb-12">
                    <button
                        onClick={() => onNavigate('home')}
                        className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors mb-8 group"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover:-translate-x-1 transition-transform">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                        </svg>
                        <span className="font-medium">Back</span>
                    </button>

                    <div className="text-center mb-10">
                        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 mb-4 tracking-tight">
                            Token Market
                        </h1>
                        <p className="text-slate-400 text-lg max-w-2xl mx-auto">Unlock rewards, collect rare items, and dominate challenges.</p>
                    </div>

                    {/* Token Balance */}
                    <div className="flex justify-center mb-12">
                        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-800 px-10 py-6 relative group overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative z-10">
                                <div className="text-xs text-cyan-400 font-bold mb-2 text-center uppercase tracking-[0.2em]">Your Balance</div>
                                <div className="text-5xl font-black text-white font-mono flex items-center gap-4 justify-center">
                                    <span className="text-4xl animate-pulse">⚡</span>
                                    <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">{tokens.balance.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Daily Prize */}
                <div className="mb-10">
                    <div className="bg-slate-900/80 rounded-2xl shadow-lg border border-slate-800 p-8 transition-all duration-300 hover:border-yellow-500/50 hover:shadow-yellow-500/20 group relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative z-10">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 justify-center">
                                <span className="text-3xl">🎁</span> Daily Prize
                            </h2>
                            {dailyPrizeAvailable ? (
                                <button
                                    onClick={handleClaimDailyPrize}
                                    disabled={claimingPrize}
                                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-white font-black text-xl py-6 px-8 rounded-xl transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-orange-500/30 transform hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    {claimingPrize ? 'Claiming...' : '✨ Claim Your Daily Prize! ✨'}
                                </button>
                            ) : (
                                <div className="text-center py-8 bg-slate-950/30 rounded-xl border border-slate-800/50">
                                    <div className="text-slate-400 mb-3 text-sm uppercase tracking-wider font-medium">Next prize available in</div>
                                    <div className="text-5xl font-black text-yellow-500 font-mono tracking-tight text-center">
                                        {hoursUntilPrize} <span className="text-2xl text-yellow-500/50">hours</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Daily Challenges */}
                <div className="mb-12">
                    <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                        <span className="text-cyan-400">⚔️</span> Daily Challenges
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {dailyChallenges.map(challenge => (
                            <div
                                key={challenge.id}
                                className={`relative bg-slate-900 rounded-2xl shadow-lg border-2 ${challenge.completed
                                        ? 'border-green-500/50 hover:border-green-400'
                                        : 'border-slate-800 hover:border-cyan-500/50'
                                    } p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group overflow-hidden`}
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${challenge.completed ? 'from-green-500/10' : 'from-cyan-500/10'
                                    } to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                                <div className="relative z-10">
                                    <div className="flex items-start justify-between mb-4">
                                        <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">{challenge.title}</h3>
                                        {challenge.completed && (
                                            <div className="bg-green-500/20 text-green-400 p-1 rounded-full">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-slate-400 text-sm mb-6 min-h-[40px]">{challenge.description}</p>

                                    {/* Progress Bar */}
                                    <div className="mb-4">
                                        <div className="flex justify-between text-xs text-slate-500 mb-1 font-mono">
                                            <span>Progress</span>
                                            <span>{challenge.progress}/{challenge.requirement.count}</span>
                                        </div>
                                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${challenge.completed
                                                        ? 'bg-green-500'
                                                        : 'bg-cyan-500'
                                                    } transition-all duration-500 relative`}
                                                style={{ width: `${Math.min(100, (challenge.progress / challenge.requirement.count) * 100)}%` }}
                                            >
                                                <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-yellow-400 font-bold bg-slate-950/50 py-2 px-3 rounded-lg border border-slate-800 w-fit">
                                        <span>⚡</span>
                                        <span>{challenge.reward} tokens</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Packs */}
                <div>
                    <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                        <span className="text-purple-400">📦</span> Token Packs
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {PACKS.map(pack => {
                            const canAfford = tokens.balance >= pack.cost;
                            const isPurchasing = purchasingPack === pack.id;

                            return (
                                <div
                                    key={pack.id}
                                    className={`relative bg-slate-900 rounded-2xl shadow-lg border-2 ${pack.tier === 'elite' ? 'border-purple-500/50 hover:border-purple-400 hover:shadow-purple-500/20' :
                                            pack.tier === 'premium' ? 'border-blue-500/50 hover:border-blue-400 hover:shadow-blue-500/20' :
                                                'border-slate-800 hover:border-cyan-400 hover:shadow-cyan-500/20'
                                        } p-8 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group overflow-hidden`}
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-br ${pack.tier === 'elite' ? 'from-purple-500/10' :
                                            pack.tier === 'premium' ? 'from-blue-500/10' :
                                                'from-cyan-500/10'
                                        } to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                                    <div className="relative z-10">
                                        {pack.tier === 'elite' && (
                                            <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                                                POPULAR
                                            </div>
                                        )}

                                        <h3 className="text-2xl font-black text-white mb-3 text-center tracking-tight">{pack.name}</h3>
                                        <p className="text-slate-400 text-sm mb-8 text-center min-h-[40px] leading-relaxed">{pack.description}</p>

                                        <div className="space-y-3 mb-8">
                                            <div className="flex items-center gap-3 text-cyan-300 bg-slate-950/50 rounded-xl p-4 border border-slate-800 group-hover:border-cyan-500/30 transition-colors">
                                                <span className="text-xl">💰</span>
                                                <span className="font-bold">{pack.rewards.minTokens}-{pack.rewards.maxTokens} tokens</span>
                                            </div>
                                            {pack.rewards.collectibles && (
                                                <div className={`flex items-center gap-3 bg-slate-950/50 rounded-xl p-4 border border-slate-800 transition-colors ${pack.tier === 'elite' ? 'text-purple-300 group-hover:border-purple-500/30' :
                                                        pack.tier === 'premium' ? 'text-blue-300 group-hover:border-blue-500/30' :
                                                            'text-slate-300 group-hover:border-slate-500/30'
                                                    }`}>
                                                    <span className="text-xl">�</span>
                                                    <span className="font-bold">
                                                        {pack.tier === 'elite' ? 'Guaranteed Epic+' :
                                                            pack.tier === 'premium' ? 'High Rare Chance' :
                                                                'Common Collectibles'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => handlePurchasePack(pack.id)}
                                            disabled={!canAfford || isPurchasing}
                                            className={`w-full font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${canAfford
                                                    ? 'bg-white text-slate-900 hover:bg-cyan-50 hover:scale-[1.02] shadow-lg'
                                                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                                                }`}
                                        >
                                            {isPurchasing ? (
                                                <>
                                                    <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    <span>Processing...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>{pack.cost}</span>
                                                    <span className="text-xl">⚡</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

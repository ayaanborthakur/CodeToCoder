import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CollectionPage } from './CollectionPage';
import {
    getMarketplaceData,
    purchasePack,
    claimDailyPrize,
    isDailyPrizeAvailable,
    getTimeUntilDailyPrize,
    claimChallengeReward
} from '../services/marketplaceService';
import { PACKS } from '../data/marketplaceData';
import { RARITY_COLORS, RARITY_BG_COLORS } from '../data/collectiblesData';
import type { UserStars, DailyChallenge, Collectible } from '../types';

import { ViewState } from './Header';
import { PackOpeningModal } from './PackOpeningModal';

interface MarketplacePageProps {
    onNavigate: (view: ViewState) => void;
    onOpenAuth: () => void;
}

export const MarketplacePage: React.FC<MarketplacePageProps> = ({ onNavigate, onOpenAuth }) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'market' | 'collection'>('market');
    const [stars, setStars] = useState<UserStars | null>(null);
    const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>([]);
    const [dailyPrizeAvailable, setDailyPrizeAvailable] = useState(false);
    const [hoursUntilPrize, setHoursUntilPrize] = useState(0);
    const [purchasingPack, setPurchasingPack] = useState<string | null>(null);
    const [claimingPrize, setClaimingPrize] = useState(false);
    const [claimingChallengeId, setClaimingChallengeId] = useState<string | null>(null);
    const [showRarityInfo, setShowRarityInfo] = useState(false);
    const [showPackDropRates, setShowPackDropRates] = useState<string | null>(null);

    // New Collectible Modal State
    const [newCollectibles, setNewCollectibles] = useState<Collectible[]>([]);
    const [openingPackId, setOpeningPackId] = useState<string | null>(null);
    const [pendingCollectibles, setPendingCollectibles] = useState<Collectible[]>([]);


    const loadData = async () => {
        if (!user) return;
        const data = await getMarketplaceData(user.id);
        setStars(data.stars);
        setDailyChallenges(data.dailyChallenges);

        setDailyPrizeAvailable(isDailyPrizeAvailable(user.id, data));
        setHoursUntilPrize(getTimeUntilDailyPrize(user.id, data));
    };

    useEffect(() => {
        loadData();
    }, [user]);

    const handlePurchasePack = async (packId: string) => {
        if (!user) return;

        setPurchasingPack(packId);
        try {
            const result = await purchasePack(user.id, packId);
            await loadData(); // Refresh data

            if (result.collectibles && result.collectibles.length > 0) {
                setPendingCollectibles(result.collectibles);
                setOpeningPackId(packId);
            }
        } catch (error) {
            console.error('Failed to purchase pack:', error);
            alert('Failed to purchase pack. Please try again.');
        } finally {
            setPurchasingPack(null);
        }
    };

    const handleClaimDailyPrize = async () => {
        if (!user) return;

        setClaimingPrize(true);
        try {
            await claimDailyPrize(user.id);
            await loadData(); // Refresh data
        } catch (error) {
            console.error('Failed to claim prize:', error);
        } finally {
            setClaimingPrize(false);
        }
    };

    const handleClaimChallenge = async (challengeId: string) => {
        if (!user) return;
        setClaimingChallengeId(challengeId);
        try {
            await claimChallengeReward(user.id, challengeId);
            await loadData();
        } catch (error) {
            console.error('Failed to claim challenge reward:', error);
        } finally {
            setClaimingChallengeId(null);
        }
    };

    if (!user) {
        return (

            <div className="h-full w-full flex flex-col items-center justify-center bg-background text-text-primary p-6">
                <div className="max-w-md text-center">
                    <div className="text-6xl mb-6">🔒</div>
                    <h2 className="text-3xl font-bold text-text-primary mb-4">Sign In Required</h2>
                    <p className="text-text-secondary mb-8">
                        You need to create an account to access the Star Market, purchase packs, and claim daily prizes.
                    </p>
                    <button
                        onClick={() => onNavigate('home')}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-lg"
                    >
                        Go to Home
                    </button>
                </div>
            </div>
        );

    }

    if (!stars) {
        return <div className="h-full w-full flex items-center justify-center bg-background text-text-secondary">Loading Market...</div>;
    }

    return (
        <div className="h-full w-full overflow-y-auto bg-background text-text-primary relative">
            {/* Pack Opening Animation */}
            {openingPackId && (
                <PackOpeningModal
                    packId={openingPackId}
                    onComplete={() => {
                        setOpeningPackId(null);
                        setNewCollectibles(pendingCollectibles);
                        setPendingCollectibles([]);
                    }}
                    onClose={() => {
                        // If closed prematurely, still give rewards but skip animation
                        setOpeningPackId(null);
                        setNewCollectibles(pendingCollectibles);
                        setPendingCollectibles([]);
                    }}
                />
            )}

            {/* Rarity Info Modal */}
            {showRarityInfo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setShowRarityInfo(false)}>
                    <div className="bg-surface border border-border-default rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-text-primary">Rarity Drop Rates</h3>
                            <button onClick={() => setShowRarityInfo(false)} className="text-text-secondary hover:text-text-primary">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-surface-highlight rounded-lg border border-border-default">
                                <span className="font-bold text-text-secondary">Common</span>
                                <span className="font-mono text-text-primary">50%</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-surface-highlight rounded-lg border border-green-900/30">
                                <span className="font-bold text-green-400">Uncommon</span>
                                <span className="font-mono text-text-primary">30%</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-surface-highlight rounded-lg border border-blue-900/30">
                                <span className="font-bold text-blue-400">Rare</span>
                                <span className="font-mono text-text-primary">12%</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-surface-highlight rounded-lg border border-purple-900/30">
                                <span className="font-bold text-purple-400">Epic</span>
                                <span className="font-mono text-text-primary">5%</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-surface-highlight rounded-lg border border-yellow-900/30">
                                <span className="font-bold text-yellow-400">Legendary</span>
                                <span className="font-mono text-text-primary">2%</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-surface-highlight rounded-lg border border-red-900/30">
                                <span className="font-bold text-red-500 animate-pulse">Mythic</span>
                                <span className="font-mono text-text-primary">0.5%</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-surface-highlight rounded-lg border border-cyan-900/30">
                                <span className="font-bold text-cyan-300 animate-pulse">Divine</span>
                                <span className="font-mono text-text-primary">0.1%</span>
                            </div>
                        </div>
                        <p className="mt-4 text-xs text-text-secondary text-center">
                            Higher tier packs increase your chances for rarer items!
                        </p>
                    </div>
                </div>
            )}

            {/* Pack-Specific Drop Rates Modal */}
            {showPackDropRates && (() => {
                const pack = PACKS.find(p => p.id === showPackDropRates);
                if (!pack) return null;

                const getPackDropRates = () => {
                    if (pack.tier === 'designer') {
                        return [
                            { rarity: 'Legendary', rate: '60%', color: 'text-yellow-400', border: 'border-yellow-900/30' },
                            { rarity: 'Mythic', rate: '35%', color: 'text-red-500', border: 'border-red-900/30' },
                            { rarity: 'Divine', rate: '5%', color: 'text-cyan-300', border: 'border-cyan-900/30' },
                        ];
                    } else if (pack.tier === 'developer') {
                        return [
                            { rarity: 'Common', rate: '30%', color: 'text-slate-400', border: 'border-slate-800' },
                            { rarity: 'Uncommon', rate: '30%', color: 'text-green-400', border: 'border-green-900/30' },
                            { rarity: 'Rare', rate: '25%', color: 'text-blue-400', border: 'border-blue-900/30' },
                            { rarity: 'Epic', rate: '10%', color: 'text-purple-400', border: 'border-purple-900/30' },
                            { rarity: 'Legendary', rate: '5%', color: 'text-yellow-400', border: 'border-yellow-900/30' },
                        ];
                    } else if (pack.tier === 'elite') {
                        return [
                            { rarity: 'Epic', rate: '50%', color: 'text-purple-400', border: 'border-purple-900/30' },
                            { rarity: 'Legendary', rate: '30%', color: 'text-yellow-400', border: 'border-yellow-900/30' },
                            { rarity: 'Mythic', rate: '15%', color: 'text-red-500', border: 'border-red-900/30' },
                            { rarity: 'Divine', rate: '5%', color: 'text-cyan-300', border: 'border-cyan-900/30' },
                        ];
                    } else if (pack.tier === 'premium') {
                        return [
                            { rarity: 'Common', rate: '50%', color: 'text-slate-400', border: 'border-slate-800' },
                            { rarity: 'Uncommon', rate: '5%', color: 'text-green-400', border: 'border-green-900/30' },
                            { rarity: 'Rare', rate: '25%', color: 'text-blue-400', border: 'border-blue-900/30' },
                            { rarity: 'Epic', rate: '15%', color: 'text-purple-400', border: 'border-purple-900/30' },
                            { rarity: 'Legendary', rate: '4%', color: 'text-yellow-400', border: 'border-yellow-900/30' },
                            { rarity: 'Mythic', rate: '1%', color: 'text-red-500', border: 'border-red-900/30' },
                        ];
                    } else {
                        return [
                            { rarity: 'Common', rate: '50%', color: 'text-slate-400', border: 'border-slate-800' },
                            { rarity: 'Uncommon', rate: '30%', color: 'text-green-400', border: 'border-green-900/30' },
                            { rarity: 'Rare', rate: '15%', color: 'text-blue-400', border: 'border-blue-900/30' },
                            { rarity: 'Epic', rate: '5%', color: 'text-purple-400', border: 'border-purple-900/30' },
                        ];
                    }
                };

                const rates = getPackDropRates();

                return (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setShowPackDropRates(null)}>
                        <div className="bg-surface border border-border-default rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-text-primary">{pack.name} Drop Rates</h3>
                                <button onClick={() => setShowPackDropRates(null)} className="text-text-secondary hover:text-text-primary">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="space-y-3">
                                {rates.map(({ rarity, rate, color, border }) => (
                                    <div key={rarity} className={`flex items-center justify-between p-3 bg-surface-highlight rounded-lg border ${border}`}>
                                        <span className={`font-bold ${color} ${(rarity === 'Mythic' || rarity === 'Divine') ? 'animate-pulse' : ''}`}>{rarity}</span>
                                        <span className="font-mono text-text-primary">{rate}</span>
                                    </div>
                                ))}
                            </div>
                            <p className="mt-4 text-xs text-text-secondary text-center">
                                {pack.id === 'designer_pack' ? 'Guaranteed premium collectibles!' : `${pack.name} specific drop rates`}
                            </p>
                        </div>
                    </div>
                );
            })()}

            {/* New Collectible Modal */}
            {newCollectibles.length > 0 && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-surface border-2 border-border-default rounded-2xl p-8 max-w-4xl w-full text-center relative overflow-hidden shadow-2xl animate-in zoom-in-50 duration-300 max-h-[90vh] overflow-y-auto">
                        <div className="relative z-10">
                            <h3 className="text-3xl font-bold text-text-primary mb-8">Pack Opened!</h3>

                            <div className="flex flex-wrap justify-center gap-6 mb-8">
                                {newCollectibles.map((collectible, index) => (
                                    <div key={`${collectible.id}-${index}`} className="bg-surface-highlight rounded-xl p-4 border border-border-default w-64 relative overflow-hidden group hover:scale-105 transition-transform">
                                        <div className={`absolute inset-0 opacity-20 ${RARITY_BG_COLORS[collectible.rarity]}`} />
                                        <div className="relative z-10">
                                            <div className="text-6xl mb-4 animate-bounce" style={{ animationDelay: `${index * 100}ms` }}>{collectible.image}</div>
                                            <div className={`text-sm font-bold mb-2 uppercase tracking-wider ${RARITY_COLORS[collectible.rarity]}`}>
                                                {collectible.rarity}
                                            </div>
                                            <h4 className="text-xl font-bold text-text-primary mb-2">{collectible.name}</h4>
                                            <p className="text-text-secondary text-sm">{collectible.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => setNewCollectibles([])}
                                className="bg-text-primary text-background font-bold py-3 px-12 rounded-xl hover:scale-105 transition-transform text-lg"
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
                            Star Market
                        </h1>
                        <p className="text-text-secondary text-lg max-w-2xl mx-auto">Unlock rewards, collect rare items, and dominate challenges.</p>
                    </div>

                    {/* Tab Toggle */}
                    <div className="flex justify-center gap-4 mb-8">
                        <button
                            onClick={() => setActiveTab('market')}
                            className={`px-8 py-3 rounded-xl font-bold text-lg transition-all ${activeTab === 'market'
                                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                                : 'bg-surface-highlight text-text-secondary hover:bg-border-default'
                                }`}
                        >
                            🛒 Market
                        </button>
                        <button
                            onClick={() => setActiveTab('collection')}
                            className={`px-8 py-3 rounded-xl font-bold text-lg transition-all ${activeTab === 'collection'
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                                : 'bg-surface-highlight text-text-secondary hover:bg-border-default'
                                }`}
                        >
                            💎 Collection
                        </button>
                    </div>
                </div>

                {/* Conditional Rendering */}
                {activeTab === 'collection' ? (
                    <CollectionPage onNavigate={onNavigate} onOpenAuth={onOpenAuth} isEmbedded={true} />
                ) : (
                    <>
                        {/* Star Balance */}
                        <div className="flex flex-col items-center gap-4 mb-12">
                            <div className="bg-surface/50 backdrop-blur-sm rounded-2xl shadow-xl border border-border-default px-10 py-6 relative group overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="relative z-10">
                                    <div className="text-xs text-cyan-400 font-bold mb-2 text-center uppercase tracking-[0.2em]">Your Balance</div>
                                    <div className="text-5xl font-black text-text-primary font-mono flex items-center gap-4 justify-center">
                                        <span className="text-4xl animate-pulse text-yellow-500">★</span>
                                        <span className="text-text-primary">{stars.balance.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Daily Prize */}
                        <div className="mb-10">
                            <div className="bg-surface/80 rounded-2xl shadow-lg border border-border-default p-8 transition-all duration-300 hover:border-yellow-500/50 hover:shadow-yellow-500/20 group relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="relative z-10">
                                    <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-3 justify-center">
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
                                        <div className="text-center py-8 bg-surface-highlight/30 rounded-xl border border-border-default/50">
                                            <div className="text-text-secondary mb-3 text-sm uppercase tracking-wider font-medium">Next prize available in</div>
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
                            <h2 className="text-3xl font-bold text-text-primary mb-8 flex items-center gap-3">
                                <span className="text-cyan-400">⚔️</span> Daily Challenges
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {dailyChallenges.map(challenge => (
                                    <div
                                        key={challenge.id}
                                        className={`relative bg-surface rounded-2xl shadow-lg border-2 ${challenge.completed
                                            ? 'border-green-500/50 hover:border-green-400'
                                            : 'border-border-default hover:border-cyan-500/50'
                                            } p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group overflow-hidden`}
                                    >
                                        <div className={`absolute inset-0 bg-gradient-to-br ${challenge.completed ? 'from-green-500/10' : 'from-cyan-500/10'
                                            } to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                                        <div className="relative z-10">
                                            <div className="flex items-start justify-between mb-4">
                                                <h3 className="text-lg font-bold text-text-primary group-hover:text-cyan-300 transition-colors">{challenge.title}</h3>
                                                {challenge.completed && (
                                                    <div className="bg-green-500/20 text-green-400 p-1 rounded-full">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-text-secondary text-sm mb-6 min-h-[40px]">{challenge.description}</p>

                                            {/* Progress Bar */}
                                            <div className="mb-4">
                                                <div className="flex justify-between text-xs text-text-secondary mb-1 font-mono">
                                                    <span>Progress</span>
                                                    <span>{challenge.progress}/{challenge.requirement.count}</span>
                                                </div>
                                                <div className="h-2 bg-surface-highlight rounded-full overflow-hidden">
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

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-yellow-400 font-bold bg-surface-highlight/50 py-2 px-3 rounded-lg border border-border-default w-fit">
                                                    <span>★</span>
                                                    <span>{challenge.reward} stars</span>
                                                </div>

                                                {challenge.completed && !challenge.claimed && (
                                                    <button
                                                        onClick={() => handleClaimChallenge(challenge.id)}
                                                        disabled={claimingChallengeId === challenge.id}
                                                        className="bg-green-600 hover:bg-green-500 text-white text-xs font-bold py-2 px-4 rounded-lg transition-colors shadow-lg shadow-green-900/20"
                                                    >
                                                        {claimingChallengeId === challenge.id ? '...' : 'CLAIM'}
                                                    </button>
                                                )}
                                                {challenge.claimed && (
                                                    <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Claimed</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Packs */}
                        <div>
                            <div className="flex items-center gap-4 mb-8">
                                <h2 className="text-3xl font-bold text-text-primary flex items-center gap-3">
                                    <span className="text-purple-400">📦</span> Star Packs
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {PACKS.map(pack => {
                                    const canAfford = stars.balance >= pack.cost;
                                    const isPurchasing = purchasingPack === pack.id;

                                    return (
                                        <div
                                            key={pack.id}
                                            className={`relative bg-surface rounded-2xl shadow-lg border-2 ${pack.tier === 'designer' ? 'border-yellow-500/50 hover:border-yellow-400 hover:shadow-yellow-500/20' :
                                                pack.tier === 'elite' ? 'border-purple-500/50 hover:border-purple-400 hover:shadow-purple-500/20' :
                                                    pack.tier === 'developer' ? 'border-green-500/50 hover:border-green-400 hover:shadow-green-500/20' :
                                                        pack.tier === 'premium' ? 'border-blue-500/50 hover:border-blue-400 hover:shadow-blue-500/20' :
                                                            'border-border-default hover:border-cyan-400 hover:shadow-cyan-500/20'
                                                } p-8 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group overflow-hidden`}
                                        >
                                            <div className={`absolute inset-0 bg-gradient-to-br ${pack.tier === 'designer' ? 'from-yellow-500/10' :
                                                pack.tier === 'elite' ? 'from-purple-500/10' :
                                                    pack.tier === 'developer' ? 'from-green-500/10' :
                                                        pack.tier === 'premium' ? 'from-blue-500/10' :
                                                            'from-cyan-500/10'
                                                } to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                                            <div className="relative z-10">
                                                <div className="flex justify-between items-start mb-3">
                                                    <h3 className="text-2xl font-black text-text-primary tracking-tight flex-1">{pack.name}</h3>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setShowPackDropRates(pack.id);
                                                        }}
                                                        className="w-6 h-6 rounded-full bg-surface-highlight/70 text-text-secondary flex items-center justify-center hover:bg-border-default hover:text-text-primary transition-colors border border-border-default flex-shrink-0 ml-2"
                                                        title="View Drop Rates"
                                                    >
                                                        <span className="font-serif font-bold italic text-xs">i</span>
                                                    </button>
                                                </div>
                                                <p className="text-text-secondary text-sm mb-8 text-center min-h-[40px] leading-relaxed">{pack.description}</p>

                                                <div className="space-y-3 mb-8">
                                                    {pack.rewards.collectibles && (
                                                        <div className={`flex items-center gap-3 bg-surface-highlight/50 rounded-xl p-4 border border-border-default transition-colors ${pack.tier === 'designer' ? 'text-yellow-300 group-hover:border-yellow-500/30' :
                                                            pack.tier === 'elite' ? 'text-purple-300 group-hover:border-purple-500/30' :
                                                                pack.tier === 'developer' ? 'text-green-300 group-hover:border-green-500/30' :
                                                                    pack.tier === 'premium' ? 'text-blue-300 group-hover:border-blue-500/30' :
                                                                        'text-text-secondary group-hover:border-border-default/30'
                                                            }`}>
                                                            <span className="text-xl">💎</span>
                                                            <span className="font-bold">
                                                                {pack.tier === 'designer' ? 'Guaranteed Legendary+' :
                                                                    pack.tier === 'elite' ? 'Guaranteed Epic+' :
                                                                        pack.tier === 'developer' ? 'Balanced Mix' :
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
                                                        ? 'bg-text-primary text-background hover:bg-cyan-50 hover:scale-[1.02] shadow-lg'
                                                        : 'bg-surface-highlight text-text-secondary cursor-not-allowed border border-border-default'
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
                                                            <span className="text-xl text-yellow-500">★</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getOwnedCollectibles, sellCollectible } from '../services/marketplaceService';
import { COLLECTIBLES, RARITY_COLORS, RARITY_BG_COLORS, RARITY_BORDER_COLORS, RARITY_GLOW } from '../data/collectiblesData';
import type { Collectible, Rarity } from '../types';

interface CollectionPageProps {
    onNavigate: (view: string) => void;
}

type OwnedCollectible = Collectible & { count: number };

export const CollectionPage: React.FC<CollectionPageProps> = ({ onNavigate }) => {
    const { user } = useAuth();
    const [ownedCollectibles, setOwnedCollectibles] = useState<OwnedCollectible[]>([]);
    const [selectedRarity, setSelectedRarity] = useState<Rarity | 'all'>('all');
    const [selectedCollectible, setSelectedCollectible] = useState<OwnedCollectible | null>(null);
    const [loading, setLoading] = useState(true);
    const [selling, setSelling] = useState(false);
    const [sellAmount, setSellAmount] = useState(1);

    useEffect(() => {
        loadCollection();
    }, [user]);

    const loadCollection = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const owned = await getOwnedCollectibles(user.id);
            setOwnedCollectibles(owned);
        } catch (error) {
            console.error('Failed to load collection:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSell = async (collectible: OwnedCollectible) => {
        if (!user || selling) return;

        if (!window.confirm(`Are you sure you want to sell ${sellAmount}x ${collectible.name}?`)) return;

        setSelling(true);
        try {
            await sellCollectible(user.id, collectible.id, sellAmount);
            await loadCollection(); // Refresh list
            setSelectedCollectible(null); // Close modal
            setSellAmount(1); // Reset amount
        } catch (error) {
            console.error('Failed to sell item:', error);
            alert('Failed to sell item. Please try again.');
        } finally {
            setSelling(false);
        }
    };

    const getSellValue = (rarity: Rarity) => {
        switch (rarity) {
            case 'common': return 10;
            case 'uncommon': return 20;
            case 'rare': return 50;
            case 'epic': return 100;
            case 'legendary': return 250;
            case 'mythic': return 500;
            case 'divine': return 1000;
            default: return 0;
        }
    };

    const rarities: (Rarity | 'all')[] = ['all', 'common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic', 'divine'];

    const filteredCollectibles = selectedRarity === 'all'
        ? COLLECTIBLES
        : COLLECTIBLES.filter(c => c.rarity === selectedRarity);

    const getCollectionStats = () => {
        const total = COLLECTIBLES.length;
        const owned = ownedCollectibles.length;
        const percentage = Math.round((owned / total) * 100);

        const byRarity = {
            common: { owned: 0, total: 0 },
            uncommon: { owned: 0, total: 0 },
            rare: { owned: 0, total: 0 },
            epic: { owned: 0, total: 0 },
            legendary: { owned: 0, total: 0 },
            mythic: { owned: 0, total: 0 },
            divine: { owned: 0, total: 0 }
        };

        COLLECTIBLES.forEach(c => {
            byRarity[c.rarity].total++;
            if (ownedCollectibles.some(owned => owned.id === c.id)) {
                byRarity[c.rarity].owned++;
            }
        });

        return { total, owned, percentage, byRarity };
    };

    const stats = getCollectionStats();

    if (loading) {
        return <div className="h-full w-full flex items-center justify-center bg-background text-text-secondary">Loading Collection...</div>;
    }

    return (
        <div className="h-full w-full overflow-y-auto bg-background text-text-primary">
            {/* Detail Modal */}
            {selectedCollectible && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setSelectedCollectible(null)}>
                    <div className={`bg-surface border-2 rounded-2xl p-8 max-w-md w-full text-center relative overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 ${RARITY_BORDER_COLORS[selectedCollectible.rarity]} ${RARITY_GLOW[selectedCollectible.rarity]}`} onClick={e => e.stopPropagation()}>
                        <div className={`absolute inset-0 opacity-20 ${RARITY_BG_COLORS[selectedCollectible.rarity]}`} />
                        <div className="relative z-10">
                            <div className="text-8xl mb-4">{selectedCollectible.image}</div>
                            <div className={`text-sm font-bold mb-2 uppercase tracking-wider ${RARITY_COLORS[selectedCollectible.rarity]}`}>
                                {selectedCollectible.rarity}
                            </div>
                            <h3 className="text-3xl font-bold text-text-primary mb-3">{selectedCollectible.name}</h3>
                            <p className="text-text-secondary mb-6 text-lg">{selectedCollectible.description}</p>

                            <div className="flex items-center justify-center gap-4 mb-6">
                                <div className="bg-surface-highlight px-4 py-2 rounded-lg border border-border-default">
                                    <span className="text-text-secondary text-xs uppercase block">Owned</span>
                                    <span className="text-xl font-mono font-bold text-text-primary">{selectedCollectible.count}</span>
                                </div>
                                <div className="bg-surface-highlight px-4 py-2 rounded-lg border border-border-default">
                                    <span className="text-text-secondary text-xs uppercase block">Sell Value</span>
                                    <span className="text-xl font-mono font-bold text-yellow-500 flex items-center gap-1">
                                        {getSellValue(selectedCollectible.rarity) * sellAmount} <span className="text-sm">★</span>
                                    </span>
                                </div>
                            </div>

                            {selectedCollectible.count > 1 && (
                                <div className="mb-6">
                                    <label className="block text-sm font-bold text-text-secondary mb-2">
                                        Sell Amount: {sellAmount}
                                    </label>
                                    <input
                                        type="range"
                                        min="1"
                                        max={selectedCollectible.count}
                                        value={sellAmount}
                                        onChange={(e) => setSellAmount(parseInt(e.target.value))}
                                        className="w-full h-2 bg-surface-highlight rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                    />
                                    <div className="flex justify-between text-xs text-text-secondary mt-1">
                                        <span>1</span>
                                        <span>{selectedCollectible.count}</span>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setSelectedCollectible(null)}
                                    className="flex-1 bg-surface-highlight hover:bg-border-default text-text-primary font-bold py-3 px-4 rounded-xl transition-colors"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => handleSell(selectedCollectible)}
                                    disabled={selling}
                                    className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-4 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {selling ? 'Selling...' : `Sell ${sellAmount} Item${sellAmount > 1 ? 's' : ''}`}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto p-6 md:p-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => onNavigate('home')}
                        className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors mb-6 group"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover:-translate-x-1 transition-transform">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                        </svg>
                        <span className="font-medium">Back</span>
                    </button>

                    <div className="text-center mb-8">
                        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 mb-4 tracking-tight">
                            My Collection
                        </h1>
                        <p className="text-text-secondary text-lg">Discover and collect unique programming treasures</p>
                    </div>

                    {/* Stats Overview */}
                    <div className="bg-surface/50 backdrop-blur-sm rounded-2xl shadow-xl border border-border-default p-6 mb-8">
                        <div className="text-center mb-6">
                            <div className="text-sm text-text-secondary mb-2 uppercase tracking-wider">Collection Progress</div>
                            <div className="text-5xl font-black text-text-primary mb-2">
                                {stats.owned} / {stats.total}
                            </div>
                            <div className="text-cyan-400 text-xl font-bold">{stats.percentage}% Complete</div>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-4 bg-surface-highlight rounded-full overflow-hidden mb-6">
                            <div
                                className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 transition-all duration-500 relative"
                                style={{ width: `${stats.percentage}%` }}
                            >
                                <div className="absolute inset-0 bg-white/20 animate-pulse" />
                            </div>
                        </div>

                        {/* Rarity Breakdown */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                            {(Object.keys(stats.byRarity) as Rarity[]).map(rarity => (
                                <div key={rarity} className={`bg-surface/50 rounded-lg p-3 border ${RARITY_BORDER_COLORS[rarity]}`}>
                                    <div className={`text-xs font-bold uppercase mb-1 ${RARITY_COLORS[rarity]}`}>
                                        {rarity}
                                    </div>
                                    <div className="text-text-primary font-mono text-sm">
                                        {stats.byRarity[rarity].owned}/{stats.byRarity[rarity].total}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Rarity Filter */}
                <div className="flex flex-wrap gap-2 mb-6 justify-center">
                    {rarities.map(rarity => (
                        <button
                            key={rarity}
                            onClick={() => setSelectedRarity(rarity)}
                            className={`px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-wider transition-all ${selectedRarity === rarity
                                ? rarity === 'all'
                                    ? 'bg-text-primary text-background'
                                    : `${RARITY_BG_COLORS[rarity as Rarity]} ${RARITY_COLORS[rarity as Rarity]} border-2 ${RARITY_BORDER_COLORS[rarity as Rarity]}`
                                : 'bg-surface-highlight text-text-secondary hover:bg-border-default'
                                }`}
                        >
                            {rarity}
                        </button>
                    ))}
                </div>

                {/* Collection Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {filteredCollectibles.map(collectible => {
                        const ownedItem = ownedCollectibles.find(c => c.id === collectible.id);
                        const isOwned = !!ownedItem;

                        return (
                            <div
                                key={collectible.id}
                                onClick={() => {
                                    if (isOwned) {
                                        setSelectedCollectible(ownedItem);
                                        setSellAmount(1);
                                    }
                                }}
                                className={`relative bg-surface rounded-xl p-4 border-2 transition-all duration-300 ${isOwned
                                    ? `${RARITY_BORDER_COLORS[collectible.rarity]} ${RARITY_GLOW[collectible.rarity]} cursor-pointer hover:scale-105 hover:-translate-y-1`
                                    : 'border-border-default opacity-40 grayscale'
                                    }`}
                            >
                                {isOwned && (
                                    <>
                                        <div className={`absolute inset-0 opacity-10 rounded-xl ${RARITY_BG_COLORS[collectible.rarity]}`} />
                                        {ownedItem.count > 1 && (
                                            <div className="absolute top-2 right-2 bg-surface text-text-primary text-xs font-bold px-2 py-1 rounded-full border border-border-default z-20">
                                                x{ownedItem.count}
                                            </div>
                                        )}
                                    </>
                                )}
                                <div className="relative z-10">
                                    <div className="text-5xl mb-2 text-center">
                                        {isOwned ? collectible.image : '❓'}
                                    </div>
                                    <div className={`text-xs font-bold uppercase text-center mb-1 ${isOwned ? RARITY_COLORS[collectible.rarity] : 'text-text-secondary'}`}>
                                        {collectible.rarity}
                                    </div>
                                    <div className={`text-sm font-bold text-center ${isOwned ? 'text-text-primary' : 'text-text-secondary'}`}>
                                        {isOwned ? collectible.name : '???'}
                                    </div>
                                </div>
                                {!isOwned && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-12 h-12 text-border-default">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {filteredCollectibles.length === 0 && (
                    <div className="text-center py-20 text-text-secondary">
                        <div className="text-6xl mb-4">📦</div>
                        <p className="text-xl">No collectibles in this category yet!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

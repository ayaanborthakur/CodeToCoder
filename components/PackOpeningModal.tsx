import React, { useState } from 'react';
import { PACKS } from '../data/marketplaceData';

interface PackOpeningModalProps {
    packId: string;
    onComplete: () => void;
    onClose: () => void;
}

export const PackOpeningModal: React.FC<PackOpeningModalProps> = ({ packId, onComplete, onClose }) => {
    const [cracks, setCracks] = useState(0);
    const [isShaking, setIsShaking] = useState(false);
    const [scale, setScale] = useState(1);

    const pack = PACKS.find(p => p.id === packId);

    // Determine max cracks based on tier
    const getMaxCracks = () => {
        if (!pack) return 3;
        switch (pack.tier) {
            case 'starter': return 2;
            case 'premium': return 3;
            case 'elite': return 4;
            case 'developer': return 5;
            case 'designer': return 6;
            default: return 3;
        }
    };

    const maxCracks = getMaxCracks();
    const progress = cracks / maxCracks;

    const handleTap = () => {
        if (cracks >= maxCracks) return;

        // Trigger shake animation
        setIsShaking(true);
        setScale(0.95);
        setTimeout(() => {
            setIsShaking(false);
            setScale(1);
        }, 150);

        const newCracks = cracks + 1;
        setCracks(newCracks);

        if (newCracks >= maxCracks) {
            // Delay completion slightly to show the final crack/break
            setTimeout(() => {
                onComplete();
            }, 500);
        }
    };

    if (!pack) return null;

    // Get pack color styles based on tier
    const getPackStyles = () => {
        switch (pack.tier) {
            case 'designer': return 'from-yellow-400 to-yellow-600 border-yellow-300 shadow-yellow-500/50';
            case 'elite': return 'from-purple-500 to-purple-700 border-purple-400 shadow-purple-500/50';
            case 'developer': return 'from-green-500 to-green-700 border-green-400 shadow-green-500/50';
            case 'premium': return 'from-blue-500 to-blue-700 border-blue-400 shadow-blue-500/50';
            default: return 'from-cyan-500 to-cyan-700 border-cyan-400 shadow-cyan-500/50';
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
            <div className="relative flex flex-col items-center">
                {/* Instructions */}
                <div className={`mb-12 text-center transition-opacity duration-300 ${cracks > 0 ? 'opacity-50' : 'opacity-100'}`}>
                    <h2 className="text-3xl font-black text-white mb-2 animate-pulse">
                        {cracks >= maxCracks ? 'OPENING!' : 'TAP TO OPEN!'}
                    </h2>
                    <p className="text-white/70">
                        {maxCracks - cracks} taps remaining
                    </p>
                </div>

                {/* Pack Container */}
                <div
                    onClick={handleTap}
                    className={`
                        relative w-64 h-80 cursor-pointer transition-all duration-150
                        ${isShaking ? 'translate-x-1 rotate-1' : ''}
                    `}
                    style={{ transform: `scale(${scale})` }}
                >
                    {/* Glow Effect */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${getPackStyles()} blur-3xl opacity-20 animate-pulse`} />

                    {/* The Pack */}
                    <div className={`
                        relative w-full h-full rounded-2xl border-4 
                        bg-gradient-to-br ${getPackStyles()}
                        flex items-center justify-center
                        shadow-2xl transition-all duration-300
                        hover:scale-105 active:scale-95
                    `}>
                        {/* Pack Pattern/Texture */}
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />

                        {/* Icon */}
                        <div className="text-6xl filter drop-shadow-lg z-10">
                            📦
                        </div>

                        {/* Cracks Overlay */}
                        {cracks > 0 && (
                            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                                {/* Generate cracks based on progress */}
                                {Array.from({ length: cracks }).map((_, i) => (
                                    <path
                                        key={i}
                                        d={`
                                            M ${50 + (Math.random() * 40 - 20)} ${50 + (Math.random() * 40 - 20)}
                                            L ${Math.random() * 100} ${Math.random() * 100}
                                            M ${50 + (Math.random() * 40 - 20)} ${50 + (Math.random() * 40 - 20)}
                                            L ${Math.random() * 100} ${Math.random() * 100}
                                        `}
                                        stroke="rgba(255, 255, 255, 0.8)"
                                        strokeWidth="2"
                                        fill="none"
                                        className="animate-in fade-in duration-75"
                                    />
                                ))}
                                {/* Central burst when near completion */}
                                {progress > 0.7 && (
                                    <circle cx="50" cy="50" r={progress * 20} fill="rgba(255,255,255,0.2)" className="animate-ping" />
                                )}
                            </svg>
                        )}
                    </div>
                </div>

                {/* Close button (only for safety/stuck state) */}
                <button
                    onClick={onClose}
                    className="mt-12 text-white/30 hover:text-white text-sm transition-colors"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

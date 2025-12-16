import React, { useState, useRef } from 'react';
import { PACKS_DATA } from '../data/packsData';

interface PackOpeningModalProps {
    packId: string;
    onComplete: () => void;
    onClose: () => void;
}

interface Crack {
    id: number;
    path: string;
    width: number;
    opacity: number;
}

export const PackOpeningModal: React.FC<PackOpeningModalProps> = ({ packId, onComplete, onClose }) => {
    const [tapCount, setTapCount] = useState(0);
    const [crackPaths, setCrackPaths] = useState<Crack[]>([]);
    const [isShaking, setIsShaking] = useState(false);
    const [scale, setScale] = useState(1);
    const [isExploding, setIsExploding] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const pack = PACKS_DATA.find(p => p.id === packId);

    const getMaxCracks = () => {
        if (!pack) return 3;
        switch (pack.tier) {
            case 'starter': return 3;
            case 'premium': return 4;
            case 'elite': return 5;
            case 'developer': return 6;
            case 'designer': return 6;
            default: return 5;
        }
    };

    const maxCracks = getMaxCracks();

    const generateRadialCracks = (startX: number, startY: number, width: number, height: number) => {
        const cracks: { path: string; width: number }[] = [];
        const numRadials = 3 + Math.floor(Math.random() * 2);
        const diagonal = Math.hypot(width, height);

        const generateJaggedLine = (x1: number, y1: number, x2: number, y2: number, roughness: number = 0.5) => {
            let path = `M ${x1} ${y1}`;
            const dist = Math.hypot(x2 - x1, y2 - y1);
            const steps = Math.max(5, Math.floor(dist / 20));

            for (let i = 1; i <= steps; i++) {
                const t = i / steps;
                const nx = x1 + (x2 - x1) * t;
                const ny = y1 + (y2 - y1) * t;
                const jitter = (Math.random() - 0.5) * 20 * roughness;
                const cx = nx + jitter;
                const cy = ny + jitter;
                path += ` L ${cx} ${cy}`;
            }
            return path;
        };

        for (let i = 0; i < numRadials; i++) {
            const angle = (i / numRadials) * Math.PI * 2 + (Math.random() - 0.5) * 0.8;
            const length = diagonal * (0.8 + Math.random() * 0.4);
            const endX = startX + Math.cos(angle) * length;
            const endY = startY + Math.sin(angle) * length;
            const thickness = 3 + Math.random() * 4;

            cracks.push({
                path: generateJaggedLine(startX, startY, endX, endY, 0.7),
                width: thickness
            });
        }

        return cracks;
    };

    const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
        if (tapCount >= maxCracks) return;

        setIsShaking(true);
        setScale(0.95);
        setTimeout(() => {
            setIsShaking(false);
            setScale(1);
        }, 150);

        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const crackData = generateRadialCracks(x, y, rect.width, rect.height);

        crackData.forEach((crackInfo) => {
            const newCrack: Crack = {
                id: Date.now() + Math.random(),
                path: crackInfo.path,
                width: crackInfo.width,
                opacity: 0.9 + Math.random() * 0.1
            };
            setCrackPaths(prev => [...prev, newCrack]);
        });

        const newTapCount = tapCount + 1;
        setTapCount(newTapCount);

        if (newTapCount >= maxCracks) {
            setTimeout(() => {
                setIsExploding(true);
                setTimeout(() => {
                    onComplete();
                }, 600);
            }, 200);
        }
    };

    if (!pack) return null;

    const getPackColor = () => {
        switch (pack.tier) {
            case 'designer': return { primary: '#fbbf24', secondary: '#f59e0b' };
            case 'elite': return { primary: '#a855f7', secondary: '#9333ea' };
            case 'developer': return { primary: '#10b981', secondary: '#059669' };
            case 'premium': return { primary: '#3b82f6', secondary: '#2563eb' };
            default: return { primary: '#06b6d4', secondary: '#0891b2' };
        }
    };

    const colors = getPackColor();

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/90 dark:bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
            <div className="relative flex flex-col items-center">
                <div className={`mb-12 text-center transition-opacity duration-300 ${tapCount > 0 ? 'opacity-50' : 'opacity-100'}`}>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2 animate-pulse">
                        {tapCount >= maxCracks ? 'OPENING!' : 'TAP TO OPEN!'}
                    </h2>
                    <p className="text-gray-700 dark:text-white/70">
                        {maxCracks - tapCount} taps remaining
                    </p>
                </div>

                <div
                    ref={containerRef}
                    onClick={handleTap}
                    className={`relative w-64 h-80 cursor-pointer transition-all duration-150 ${isShaking ? 'translate-x-1 rotate-1' : ''}`}
                    style={{ transform: `scale(${scale})` }}
                >
                    <div
                        className="absolute inset-0 blur-3xl opacity-20 animate-pulse"
                        style={{
                            background: `linear-gradient(to bottom right, ${colors.primary}, ${colors.secondary})`
                        }}
                    />

                    {/* Main Pack - Fades out when exploding */}
                    <div
                        className={`relative w-full h-full rounded-2xl border-4 flex items-center justify-center shadow-2xl overflow-hidden transition-opacity duration-100 ${isExploding ? 'opacity-0' : 'opacity-100'}`}
                        style={{
                            background: `linear-gradient(to bottom right, ${colors.primary}, ${colors.secondary})`,
                            borderColor: colors.primary
                        }}
                    >
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />

                        <svg className="w-32 h-32 z-0 pointer-events-none select-none opacity-90" viewBox="0 0 100 100" fill="none">
                            <path d="M20 35 L50 20 L80 35 L80 70 L50 85 L20 70 Z" stroke="white" strokeWidth="3" fill="white" fillOpacity="0.15" />
                            <path d="M50 20 L50 85" stroke="white" strokeWidth="2.5" opacity="0.7" />
                            <path d="M20 35 L50 50 L50 85" stroke="white" strokeWidth="2.5" opacity="0.5" />
                            <path d="M80 35 L50 50" stroke="white" strokeWidth="2.5" opacity="0.5" />
                        </svg>

                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                            <defs>
                                <linearGradient id="crackGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <animate attributeName="x1" values="0%;100%;0%" dur="3s" repeatCount="indefinite" />
                                    <animate attributeName="y1" values="0%;100%;0%" dur="3s" repeatCount="indefinite" />
                                    <stop offset="0%" stopColor="#ffffff" stopOpacity="1">
                                        <animate attributeName="stop-color" values="#ffffff;#f0f0f0;#ffffff" dur="2s" repeatCount="indefinite" />
                                    </stop>
                                    <stop offset="50%" stopColor="#f5f5f5" stopOpacity="0.95">
                                        <animate attributeName="stop-color" values="#f5f5f5;#ffffff;#f5f5f5" dur="2s" repeatCount="indefinite" />
                                    </stop>
                                    <stop offset="100%" stopColor="#ffffff" stopOpacity="1">
                                        <animate attributeName="stop-color" values="#ffffff;#f0f0f0;#ffffff" dur="2s" repeatCount="indefinite" />
                                    </stop>
                                </linearGradient>
                                <filter id="crackGlow">
                                    <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                                    <feMerge>
                                        <feMergeNode in="coloredBlur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>
                            {crackPaths.map((crack) => (
                                <path
                                    key={crack.id}
                                    d={crack.path}
                                    stroke="url(#crackGradient)"
                                    strokeWidth={crack.width}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    fill="none"
                                    opacity={crack.opacity}
                                    filter="url(#crackGlow)"
                                    className="animate-in fade-in duration-75"
                                />
                            ))}
                        </svg>

                        {isShaking && (
                            <div className="absolute inset-0 bg-white/30 animate-out fade-out duration-300 pointer-events-none z-20" />
                        )}
                    </div>

                    {/* Explosion Fragments - 8 pieces flying outward */}
                    {isExploding && [0, 1, 2, 3, 4, 5, 6, 7].map((idx) => (
                        <div
                            key={`fragment-${idx}`}
                            className="absolute w-20 h-20 rounded-lg border-2 overflow-hidden"
                            style={{
                                background: `linear-gradient(to bottom right, ${colors.primary}, ${colors.secondary})`,
                                borderColor: colors.primary,
                                left: '50%',
                                top: '50%',
                                marginLeft: '-40px',
                                marginTop: '-40px',
                                animation: `fragment${idx} 600ms ease-out forwards`
                            }}
                        >
                            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />

                            {/* Show cracks on fragments */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                                {crackPaths.slice(idx % crackPaths.length, (idx % crackPaths.length) + 1).map((crack) => (
                                    <path
                                        key={crack.id}
                                        d={crack.path}
                                        stroke="white"
                                        strokeWidth={crack.width * 1.5}
                                        strokeLinecap="round"
                                        fill="none"
                                        opacity="0.8"
                                        style={{
                                            transform: 'translate(-50%, -50%) scale(0.3)',
                                            transformOrigin: 'center'
                                        }}
                                    />
                                ))}
                            </svg>
                        </div>
                    ))}

                    {/* Light burst from center */}
                    {isExploding && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                            <div
                                className="w-32 h-32 bg-white rounded-full"
                                style={{
                                    boxShadow: '0 0 100px 50px rgba(255,255,255,0.9)',
                                    animation: 'burstExpand 400ms ease-out forwards'
                                }}
                            />
                        </div>
                    )}
                </div>

                <button onClick={onClose} className="mt-12 text-gray-500 dark:text-white/30 hover:text-gray-900 dark:hover:text-white text-sm transition-colors">
                    Cancel
                </button>
            </div>

            {/* Full-screen flash */}
            {isExploding && (
                <div className="fixed inset-0 bg-white pointer-events-none z-[100]" style={{ animation: 'fullScreenFlash 400ms ease-out forwards' }} />
            )}

            <style>{`
                @keyframes fullScreenFlash {
                    0% { opacity: 0; }
                    20% { opacity: 1; }
                    100% { opacity: 0; }
                }
                @keyframes burstExpand {
                    0% { transform: scale(0); opacity: 1; }
                    100% { transform: scale(20); opacity: 0; }
                }
                @keyframes fragment0 {
                    0% { transform: translate(0, 0) rotate(0deg) scale(1); opacity: 1; }
                    100% { transform: translate(150px, -150px) rotate(45deg) scale(0.5); opacity: 0; }
                }
                @keyframes fragment1 {
                    0% { transform: translate(0, 0) rotate(0deg) scale(1); opacity: 1; }
                    100% { transform: translate(200px, 0) rotate(30deg) scale(0.5); opacity: 0; }
                }
                @keyframes fragment2 {
                    0% { transform: translate(0, 0) rotate(0deg) scale(1); opacity: 1; }
                    100% { transform: translate(150px, 150px) rotate(-30deg) scale(0.5); opacity: 0; }
                }
                @keyframes fragment3 {
                    0% { transform: translate(0, 0) rotate(0deg) scale(1); opacity: 1; }
                    100% { transform: translate(0, 200px) rotate(-45deg) scale(0.5); opacity: 0; }
                }
                @keyframes fragment4 {
                    0% { transform: translate(0, 0) rotate(0deg) scale(1); opacity: 1; }
                    100% { transform: translate(-150px, 150px) rotate(-135deg) scale(0.5); opacity: 0; }
                }
                @keyframes fragment5 {
                    0% { transform: translate(0, 0) rotate(0deg) scale(1); opacity: 1; }
                    100% { transform: translate(-200px, 0) rotate(150deg) scale(0.5); opacity: 0; }
                }
                @keyframes fragment6 {
                    0% { transform: translate(0, 0) rotate(0deg) scale(1); opacity: 1; }
                    100% { transform: translate(-150px, -150px) rotate(-150deg) scale(0.5); opacity: 0; }
                }
                @keyframes fragment7 {
                    0% { transform: translate(0, 0) rotate(0deg) scale(1); opacity: 1; }
                    100% { transform: translate(0, -200px) rotate(135deg) scale(0.5); opacity: 0; }
                }
            `}</style>
        </div>
    );
};

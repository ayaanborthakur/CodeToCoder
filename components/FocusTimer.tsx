import React, { useState, useEffect, useRef } from 'react';
import { Timer, Play, Square, Award, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { addStars } from '../services/marketplaceService';

interface FocusTimerProps {
    onComplete?: (minutes: number) => void;
}

export const FocusTimer: React.FC<FocusTimerProps> = ({ onComplete }) => {
    const { user } = useAuth();
    const [isActive, setIsActive] = useState(false);
    const [timeLeft, setTimeLeft] = useState(25 * 60); // Default 25m in seconds
    const [durationMinutes, setDurationMinutes] = useState(25);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showAward, setShowAward] = useState(false);
    
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const handleComplete = React.useCallback(() => {
        setIsActive(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
        setShowAward(true);
        
        // Award stars: 3 stars per minute
        if (user) {
            addStars(user.id, durationMinutes * 3, "Focus Session");
        }

        if (onComplete) onComplete(durationMinutes);
        
        // Hide award after 5s
        setTimeout(() => setShowAward(false), 5000);
        
        // Reset
        setTimeLeft(durationMinutes * 60);
    }, [durationMinutes, onComplete, user]);

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            // Timer finished
            handleComplete();
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isActive, timeLeft, handleComplete]);

    const handleStart = () => {
        setIsActive(true);
        setIsMenuOpen(false);
        setShowAward(false);
    };

    const handleStop = () => {
        setIsActive(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
        // Reset to default or set duration
        setTimeLeft(durationMinutes * 60);
    };

    const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value);
        if (!isNaN(val) && val > 0 && val <= 120) {
            setDurationMinutes(val);
            if (!isActive) setTimeLeft(val * 60);
        }
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <div className="relative flex items-center">
            {/* Timer Display */}
            {!isActive && !showAward ? (
                <div className="flex items-center gap-2">
                     <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-200 transition-colors"
                    >
                        <Timer className="w-4 h-4 text-cyan-500" />
                        <span className="font-mono font-bold text-sm">{durationMinutes}:00</span>
                    </button>
                    <button
                        onClick={handleStart}
                        className="p-1.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50"
                        title="Start Focus Session"
                    >
                        <Play className="w-4 h-4 fill-current" />
                    </button>
                </div>
            ) : showAward ? (
                 <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-lg animate-pulse">
                    <Award className="w-4 h-4" />
                    <span className="font-bold text-sm">Focus Complete!</span>
                </div>
            ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-100 dark:border-cyan-800 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="font-mono font-bold text-cyan-700 dark:text-cyan-400">{formatTime(timeLeft)}</span>
                    <button 
                        onClick={handleStop}
                        className="ml-2 hover:text-red-500 transition-colors"
                        title="Stop"
                    >
                        <Square className="w-3 h-3 fill-current" />
                    </button>
                </div>
            )}

            {/* Config Menu */}
            {isMenuOpen && !isActive && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-4 z-50 animate-fade-in">
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                        <Settings className="w-3 h-3" />
                        Set Duration
                    </h4>
                    <div className="flex items-center gap-2 mb-4">
                        <input
                            type="number"
                            min="1"
                            max="120"
                            value={durationMinutes}
                            onChange={handleDurationChange}
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-center font-bold text-gray-900 dark:text-white"
                        />
                        <span className="text-sm text-gray-500">min</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {[15, 25, 45].map(m => (
                            <button
                                key={m}
                                onClick={() => {
                                    setDurationMinutes(m);
                                    setTimeLeft(m * 60);
                                }}
                                className={`px-2 py-1 text-xs font-bold rounded-md ${
                                    durationMinutes === m 
                                    ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400' 
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                            >
                                {m}m
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

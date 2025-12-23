import React, { useState, useEffect } from 'react';
import { AlertCircle, Loader2, Check, X, User } from 'lucide-react';
import { 
    validateUsername, 
    isUsernameAvailable, 
    claimUsername,
    generateDefaultUsername 
} from '../services/usernameService';

interface UsernameModalProps {
    isOpen: boolean;
    userId: string;
    currentUsername?: string;
    isNewUser?: boolean;
    onClose: () => void;
    onSuccess: (username: string) => void;
}

export const UsernameModal: React.FC<UsernameModalProps> = ({ 
    isOpen, 
    userId, 
    currentUsername,
    isNewUser = false,
    onClose, 
    onSuccess 
}) => {
    const [username, setUsername] = useState(currentUsername || '');
    const [isChecking, setIsChecking] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

    // Generate default username for new users
    useEffect(() => {
        if (isOpen && !currentUsername && !username) {
            setUsername(generateDefaultUsername());
        }
    }, [isOpen, currentUsername, username]);

    // Debounced availability check
    useEffect(() => {
        if (!username || username === currentUsername) {
            setIsAvailable(null);
            setError(null);
            return;
        }

        const validation = validateUsername(username);
        if (!validation.valid) {
            setError(validation.error || 'Invalid username');
            setIsAvailable(false);
            return;
        }

        setIsChecking(true);
        setError(null);

        const timeoutId = setTimeout(async () => {
            try {
                const available = await isUsernameAvailable(username);
                setIsAvailable(available);
                if (!available) {
                    setError('This username is already taken');
                }
            } catch (err) {
                setError('Failed to check availability');
                setIsAvailable(false);
            } finally {
                setIsChecking(false);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [username, currentUsername]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!isAvailable && username !== currentUsername) {
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            await claimUsername(userId, username);
            onSuccess(username.toLowerCase());
        } catch (err: any) {
            setError(err.message || 'Failed to set username');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const canSubmit = username && 
        (isAvailable === true || username.toLowerCase() === currentUsername?.toLowerCase()) && 
        !isChecking && 
        !isSubmitting;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999]" onClick={isNewUser ? undefined : onClose}>
            <div
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-md w-full border border-gray-200 dark:border-gray-800 animate-scale-in relative overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500"></div>
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-cyan-100 dark:bg-cyan-900/30 rounded-full">
                        <User className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                        {isNewUser ? 'Choose Your Username' : 'Change Username'}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-center mb-6 text-sm">
                        {isNewUser 
                            ? 'Pick a unique username for your profile and the leaderboard'
                            : 'Enter a new unique username'}
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Username
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={username}
                                    onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                    className={`w-full px-4 py-3 pr-12 rounded-xl bg-gray-50 dark:bg-gray-800/50 border-2 focus:ring-2 focus:ring-cyan-500/50 outline-none text-gray-900 dark:text-white transition-all ${
                                        error 
                                            ? 'border-red-300 dark:border-red-700' 
                                            : isAvailable 
                                                ? 'border-green-300 dark:border-green-700' 
                                                : 'border-gray-200 dark:border-gray-700 focus:border-cyan-500'
                                    }`}
                                    placeholder="your_username"
                                    autoFocus
                                    maxLength={20}
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    {isChecking && (
                                        <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                                    )}
                                    {!isChecking && isAvailable === true && (
                                        <Check className="w-5 h-5 text-green-500" />
                                    )}
                                    {!isChecking && isAvailable === false && (
                                        <X className="w-5 h-5 text-red-500" />
                                    )}
                                </div>
                            </div>
                            
                            {error && (
                                <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    {error}
                                </p>
                            )}
                            
                            {isAvailable && !error && (
                                <p className="mt-2 text-sm text-green-500 flex items-center gap-1">
                                    <Check className="w-4 h-4" />
                                    Username is available!
                                </p>
                            )}

                            <p className="mt-2 text-xs text-gray-400">
                                3-20 characters, letters, numbers, and underscores only
                            </p>
                        </div>

                        <div className="flex gap-3">
                            {!isNewUser && (
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={!canSubmit}
                                className={`flex-1 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-xl shadow-lg transition-all ${
                                    canSubmit 
                                        ? 'hover:from-cyan-500 hover:to-blue-500 cursor-pointer' 
                                        : 'opacity-50 cursor-not-allowed'
                                }`}
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Saving...
                                    </span>
                                ) : (
                                    isNewUser ? 'Continue' : 'Save Username'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <style>{`
                @keyframes scale-in {
                    0% { transform: scale(0.95); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
                .animate-scale-in {
                    animation: scale-in 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </div>
    );
};

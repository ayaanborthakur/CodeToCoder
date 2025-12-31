import React, { useEffect, useState } from 'react';
import { BookOpen, AlertTriangle, Lightbulb } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getReviewHistory } from '../services/learningService';
import type { CodeReviewLog } from '../types';

export const ReviewHistory: React.FC = () => {
    const { user } = useAuth();
    const [history, setHistory] = useState<CodeReviewLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadHistory = async () => {
            if (!user) return;
            try {
                const logs = await getReviewHistory(user.id, 10);
                setHistory(logs);
            } catch (error) {
                console.error("Failed to load review history:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadHistory();
    }, [user]);

    if (isLoading) {
        return <div className="p-4 text-center text-gray-400">Loading learning journal...</div>;
    }

    if (history.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm text-center">
                <div className="flex justify-center mb-3">
                    <BookOpen className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">Your Learning Journal is Empty</h3>
                <p className="text-sm text-gray-500">As you practice, AI tips and common mistakes will appear here.</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <h3 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-500" />
                Learning Journal (Recent Tips)
            </h3>
            
            <div className="space-y-4">
                {history.map((log, i) => (
                    <div key={i} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border-l-4 border-indigo-500">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                                {log.topic || 'General'}
                            </span>
                            <span className="text-xs text-gray-400">
                                {new Date(log.timestamp).toLocaleDateString()}
                            </span>
                        </div>
                        
                        <div className="flex gap-3 mb-3">
                            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                                "{log.mistake}"
                            </p>
                        </div>
                        
                        <div className="flex gap-3 bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg">
                            <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                                {log.aiTip}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

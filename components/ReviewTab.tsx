import React, { useEffect, useState } from 'react';
import { Clock, BookOpen, ArrowRight, Brain, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getDueReviews } from '../services/learningService';
import { ReviewHistory } from './ReviewHistory';
import type { ReviewItem } from '../types';

interface ReviewTabProps {
    onSelectLesson?: (moduleId: string, lessonId: string) => void;
}

export const ReviewTab: React.FC<ReviewTabProps> = ({ onSelectLesson }) => {
    const { user } = useAuth();
    const [dueReviews, setDueReviews] = useState<ReviewItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadReviews = async () => {
            if (!user) return;
            setIsLoading(true);
            try {
                const reviews = await getDueReviews(user.id);
                setDueReviews(reviews);
            } catch (error) {
                console.error("Failed to load reviews:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadReviews();
    }, [user]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">Preparing your memory boost...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Brain className="w-7 h-7 text-indigo-500" />
                        Memory Boost
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">Review topics identified by the Spaced Repetition System</p>
                </div>
            </div>

            {/* SRS Review List */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Clock className="w-5 h-5 text-amber-500" />
                                Due for Review
                            </h3>
                            <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full text-xs font-bold">
                                {dueReviews.length} Topics
                            </span>
                        </div>

                        {dueReviews.length > 0 ? (
                            <div className="space-y-3">
                                {dueReviews.map((review) => (
                                    <div 
                                        key={review.id}
                                        className="group flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-900 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                                                <BookOpen className="w-5 h-5 text-indigo-500" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                    {review.topic || review.itemTitle}
                                                </h4>
                                                <p className="text-xs text-gray-500">
                                                    Last reviewed: {new Date(review.lastReviewed).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        {/* Open button — lessons go to the curriculum IDE; practice items
                                            go to the practice IDE. Items missing routing metadata (legacy
                                            rows before this feature shipped) don't get a clickable target. */}
                                        {review.moduleId && onSelectLesson ? (
                                            <button
                                                onClick={() => onSelectLesson(review.moduleId!, review.itemId)}
                                                className="p-2 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Open lesson"
                                            >
                                                <ArrowRight className="w-5 h-5" />
                                            </button>
                                        ) : review.category ? (
                                            <a
                                                href={`/practice/${review.category}/${review.itemId}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Open practice item"
                                            >
                                                <ArrowRight className="w-5 h-5" />
                                            </a>
                                        ) : null}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-4">
                                    <Sparkles className="w-8 h-8 text-emerald-500" />
                                </div>
                                <h4 className="font-bold text-gray-900 dark:text-white mb-1">Your memory is sharp!</h4>
                                <p className="text-gray-500 text-sm max-w-xs">
                                    No reviews due today. Keep learning new things to fill your review queue!
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Pro Tip Card */}
                    <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg overflow-hidden relative">
                         <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Brain className="w-24 h-24" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertCircle className="w-5 h-5 text-indigo-200" />
                                <span className="text-xs font-bold uppercase tracking-wide text-indigo-200">Pro Tip</span>
                            </div>
                            <h3 className="text-xl font-bold mb-2">Why Spaced Repetition?</h3>
                            <p className="text-indigo-100 text-sm">
                                Reviewing information just as you're about to forget it is the most efficient way to commit it to long-term memory. We handle the scheduling; you just do the reviews!
                            </p>
                        </div>
                    </div>
                </div>

                {/* Vertical Journal on Desktop */}
                <div className="lg:col-span-1">
                    <ReviewHistory />
                </div>
            </div>
        </div>
    );
};

import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { CollapseIcon } from './CollapseIcon';
import { TypewriterText } from './TypewriterText';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

declare let marked: { parse: (markdown: string) => string } | undefined;

declare global {
    interface Window {
        Prism: any;
        marked: any;
    }
}

interface ChatPanelProps {
    messages: ChatMessage[];
    onSendMessage: (message: string) => void;
    isLoading: boolean;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
    onOpenFlowchart?: () => void;
    /** Called whenever the AI credits remaining changes — lets parent sync the hint button counter */
    onCreditsChange?: (creditsLeft: number) => void;
}

import { 
    Sparkles, 
    Send, 
    X, 
    Workflow, // For flowchart
    Lock
} from 'lucide-react';


const parseMarkdown = (content: string) => {
    if (typeof window !== 'undefined' && window.marked && window.marked.parse) {
        return window.marked.parse(content);
    }
    return content;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ messages, onSendMessage, isLoading, isCollapsed, onToggleCollapse, onOpenFlowchart, onCreditsChange }) => {
    const { user } = useAuth();
    const [requestTimestamps, setRequestTimestamps] = useState<number[]>([]);
    const [secondsUntilNext, setSecondsUntilNext] = useState<number>(0);
    const [isInputOpen, setIsInputOpen] = useState(false);
    const [input, setInput] = useState('');
    const [lastAnimatedIndex, setLastAnimatedIndex] = useState(-1);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const prevMessagesLengthRef = useRef(messages.length);

    // Subscribe to rate limit document in real time
    useEffect(() => {
        if (!user) return;
        const docRef = doc(db, 'users', user.id, 'stats', 'aiUsage');
        const unsubscribe = onSnapshot(docRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data();
                if (data && Array.isArray(data.requestTimestamps)) {
                    setRequestTimestamps(data.requestTimestamps);
                }
            } else {
                setRequestTimestamps([]);
            }
        }, (error) => {
            console.error("Error reading AI usage statistics:", error);
        });
        return () => unsubscribe();
    }, [user]);

    // Compute remaining requests and countdown
    const windowMs = 3600000;
    const maxRequests = 5;
    const activeTimestamps = requestTimestamps.filter(t => t > Date.now() - windowMs);
    const questionsLeft = Math.max(0, maxRequests - activeTimestamps.length);
    const isLocked = questionsLeft === 0;

    // Notify parent (App.tsx) whenever credits change so the hint button stays in sync
    useEffect(() => {
        onCreditsChange?.(questionsLeft);
    }, [questionsLeft, onCreditsChange]);

    useEffect(() => {
        if (!isLocked || activeTimestamps.length === 0) {
            setSecondsUntilNext(0);
            return;
        }

        // Close input field if rate limited
        setIsInputOpen(false);

        const oldest = activeTimestamps[0];
        const updateTimer = () => {
            const currentNow = Date.now();
            const remainingMs = oldest + windowMs - currentNow;
            if (remainingMs <= 0) {
                setSecondsUntilNext(0);
            } else {
                setSecondsUntilNext(Math.ceil(remainingMs / 1000));
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [isLocked, activeTimestamps]);

    const formatCountdown = (totalSeconds: number) => {
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        return `${m}m ${s.toString().padStart(2, '0')}s`;
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Track when new AI message arrives for typewriter effect
    useEffect(() => {
        if (messages.length > prevMessagesLengthRef.current) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.role === 'model') {
                // New AI message added, trigger typewriter for this index
                setLastAnimatedIndex(messages.length - 1);
            }
        }
        prevMessagesLengthRef.current = messages.length;
    }, [messages.length]);

    useEffect(() => {
        if (!isCollapsed) {
            scrollToBottom();
        }
        if (typeof window !== 'undefined' && window.Prism) {
            setTimeout(() => {
                window.Prism.highlightAll();
            }, 0);
        }
    }, [messages, isLoading, isCollapsed, isInputOpen]);

    useEffect(() => {
        if (isInputOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isInputOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            onSendMessage(input.trim());
            setInput('');
            setIsInputOpen(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    }

    const renderMarkdownContent = (content: string) => (
        <div dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }} />
    );

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
            {/* Header */}
            <div className={`h-12 px-4 flex items-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 ${isCollapsed ? 'justify-end' : 'justify-between'} flex-shrink-0 z-10`}>
                {!isCollapsed && (
                    <div className="flex items-center justify-between w-full pr-2">
                        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">AI Guidance</h3>
                        {user && (
                            <div className={`px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border flex items-center gap-1.5 transition-all ${
                                isLocked 
                                    ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/50' 
                                    : questionsLeft <= 2
                                        ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50'
                                        : 'bg-cyan-50 text-cyan-600 border-cyan-200 dark:bg-cyan-950/20 dark:text-cyan-400 dark:border-cyan-900/50'
                            }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                    isLocked 
                                        ? 'bg-red-500 animate-pulse' 
                                        : questionsLeft <= 2
                                            ? 'bg-amber-500 animate-pulse'
                                            : 'bg-cyan-500'
                                }`} />
                                {isLocked ? `Locked: ${formatCountdown(secondsUntilNext)}` : `${questionsLeft} / ${maxRequests} Left`}
                            </div>
                        )}
                    </div>
                )}
                <button
                    onClick={onToggleCollapse}
                    className="p-1 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-black dark:hover:text-white transition-colors"
                    aria-label={isCollapsed ? "Expand AI assistant panel" : "Collapse AI assistant panel"}
                >
                    <CollapseIcon isCollapsed={isCollapsed} />
                </button>
            </div>

            {!isCollapsed && (
                <>
                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-8">
                        {messages.map((msg, index) => (
                            <div key={index} className="animate-fade-in">
                                {msg.role === 'user' ? (
                                    <div className="mb-2 pb-2 border-b border-gray-200 dark:border-gray-800">
                                        <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 block mb-1">You Asked</span>
                                        <p className="text-gray-800 dark:text-gray-200 font-medium">{msg.content}</p>
                                    </div>
                                ) : (
                                    <div className="prose prose-sm max-w-none dark:prose-invert text-gray-600 dark:text-gray-300 leading-relaxed prose-code:text-cyan-600 dark:prose-code:text-cyan-400 prose-code:bg-white dark:prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-medium prose-code:before:content-none prose-code:after:content-none">
                                        {index === lastAnimatedIndex ? (
                                            <TypewriterText
                                                content={msg.content}
                                                speed={120}
                                                onComplete={() => {
                                                    // Re-highlight code blocks after typewriter completes
                                                    if (typeof window !== 'undefined' && window.Prism) {
                                                        setTimeout(() => window.Prism.highlightAll(), 0);
                                                    }
                                                }}
                                                renderContent={renderMarkdownContent}
                                            />
                                        ) : (
                                            renderMarkdownContent(msg.content)
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex items-center gap-3 text-gray-400 italic animate-pulse">
                                <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                                <span>Thinking...</span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Footer Action Area */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                        {isLocked ? (
                            <div className="p-4 bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/30 rounded-xl flex flex-col items-center justify-center text-center gap-2 shadow-inner">
                                <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full animate-bounce">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <div className="space-y-0.5">
                                    <h4 className="text-xs font-bold text-red-700 dark:text-red-400">AI Limit Reached</h4>
                                    <p className="text-[11px] text-gray-500 dark:text-gray-400 max-w-[260px]">
                                        You have asked 5 questions this hour. Your next question will unlock in <span className="font-bold text-gray-700 dark:text-gray-200">{formatCountdown(secondsUntilNext)}</span>.
                                    </p>
                                </div>
                            </div>
                        ) : !isInputOpen ? (
                            <div className="flex gap-2">
                                {onOpenFlowchart && (
                                    <button
                                        onClick={onOpenFlowchart}
                                        disabled={isLoading}
                                        className="p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm text-gray-700 dark:text-gray-200 hover:border-purple-500 dark:hover:border-purple-400 hover:text-purple-600 dark:hover:text-purple-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Build flowchart and generate code"
                                    >
                                        <Workflow className="w-5 h-5" />
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsInputOpen(true)}
                                    className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm text-gray-700 dark:text-gray-200 font-medium hover:border-cyan-500 dark:hover:border-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all group"
                                >
                                    <Sparkles className="w-4 h-4 text-gray-400 group-hover:text-cyan-500 transition-colors" />
                                    <span className="text-sm">Ask a Question</span>
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="flex flex-col gap-3 animate-slide-up">
                                <div className="relative">
                                    <textarea
                                        ref={inputRef}
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Type your question here..."
                                        className="w-full p-4 pr-12 bg-gray-50 dark:bg-gray-800 border border-cyan-500 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none shadow-md resize-none min-h-[100px]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setIsInputOpen(false)}
                                        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                                        aria-label="Cancel question"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-400 hidden sm:inline">Press Enter to send</span>
                                    <button
                                        type="submit"
                                        disabled={!input.trim() || isLoading}
                                        className="w-full sm:w-auto bg-cyan-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-cyan-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center gap-2"
                                    >
                                        <Send className="w-4 h-4" />
                                        <span>{isLoading ? 'Sending...' : 'Send'}</span>
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Sparkles, Lock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { getChatResponse } from '../services/geminiService';
import type { ChatMessage } from '../types';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';

// Same window + cap as ChatPanel — both surfaces hit the same server-side
// rate limit in the ai-proxy Cloud Function. Mirroring the constants on the
// client lets us preview the counter and gate sends before they fail.
const WINDOW_MS = 3600000;       // 1 hour
const MAX_REQUESTS = 5;

const formatCountdown = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}m ${s.toString().padStart(2, '0')}s`;
};

export const AIChatPage: React.FC = () => {
    const { user } = useAuth();
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'model', content: "Hello! I'm your AI Coding Mentor. \n\nI can help you understand concepts, debug code, or plan your next project. What's on your mind today?" }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [expandedMessages, setExpandedMessages] = useState<Set<number>>(new Set());
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // ─── Shared AI rate-limit subscription ───────────────────────────────
    const [requestTimestamps, setRequestTimestamps] = useState<number[]>([]);
    const [secondsUntilNext, setSecondsUntilNext] = useState<number>(0);

    // One-shot fetch instead of onSnapshot — we only need the counter on mount
    // and after each send (handled below). Avoids keeping a billable listener
    // open for the entire session.
    const refetchUsage = React.useCallback(async () => {
        if (!user) return;
        try {
            const docRef = doc(db, 'users', user.id, 'stats', 'aiUsage');
            const snap = await getDoc(docRef);
            if (snap.exists()) {
                const data = snap.data();
                setRequestTimestamps(Array.isArray(data?.requestTimestamps) ? data.requestTimestamps : []);
            } else {
                setRequestTimestamps([]);
            }
        } catch (e) {
            console.error('Failed to read AI usage:', e);
        }
    }, [user]);

    useEffect(() => { refetchUsage(); }, [refetchUsage]);

    const activeTimestamps = requestTimestamps.filter(t => t > Date.now() - WINDOW_MS);
    const questionsLeft = Math.max(0, MAX_REQUESTS - activeTimestamps.length);
    const isLocked = questionsLeft === 0;

    // Countdown — recomputed every second while locked.
    useEffect(() => {
        if (!isLocked || activeTimestamps.length === 0) {
            setSecondsUntilNext(0);
            return;
        }
        const oldest = activeTimestamps[0];
        const tick = () => {
            const remainingMs = oldest + WINDOW_MS - Date.now();
            setSecondsUntilNext(remainingMs <= 0 ? 0 : Math.ceil(remainingMs / 1000));
        };
        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [isLocked, activeTimestamps]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSend = async () => {
        if (!input.trim() || isLoading || isLocked) return;

        const userMessage: ChatMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Pass null for lesson to trigger "Playground/Mentor" mode in geminiService
            const response = await getChatResponse([...messages, userMessage], null, '');

            const botMessage: ChatMessage = { role: 'model', content: response };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error("Chat error:", error);
            const errorMessage: ChatMessage = {
                role: 'model',
                content: "I'm having trouble connecting right now. Please try again in a moment."
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
            // Sync counter with the server-side increment that just happened.
            refetchUsage();
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const toggleExpand = (idx: number) => {
        setExpandedMessages(prev => {
            const next = new Set(prev);
            if (next.has(idx)) next.delete(idx);
            else next.add(idx);
            return next;
        });
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden min-h-[600px]">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center gap-3 sticky top-0 z-10 backdrop-blur-md bg-opacity-80 dark:bg-opacity-80">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                    <Sparkles className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">AI Mentor</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Ask anything related to Python &amp; Coding</p>
                </div>
                {/* Rate-limit status — same cap as the lesson assistant */}
                {user && (
                    <div className="text-right">
                        <div className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-[0.08em]">Questions left</div>
                        <div className={`text-lg font-semibold tabular-nums ${
                            isLocked ? 'text-red-500' : questionsLeft <= 2 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-900 dark:text-white'
                        }`}>
                            {questionsLeft} <span className="text-xs font-normal text-gray-400">/ {MAX_REQUESTS}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                        {/* Avatar */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            msg.role === 'user'
                                ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
                                : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400'
                        }`}>
                            {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                        </div>

                        {/* Content */}
                        <div className={`flex flex-col max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                            <div className={`px-5 py-3 rounded-2xl shadow-sm prose dark:prose-invert max-w-none ${
                                msg.role === 'user'
                                    ? 'bg-indigo-600 text-white rounded-tr-none'
                                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-none border border-gray-100 dark:border-gray-700'
                            } ${!expandedMessages.has(idx) && msg.role === 'model' && msg.content.length > 400 ? 'max-h-60 overflow-hidden relative' : ''}`}>
                                <ReactMarkdown
                                    components={{
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        code({inline, className, children, ...props}: any) {
                                            const match = /language-(\w+)/.exec(className || '');
                                            return !inline && match ? (
                                                <div className="relative group my-2">
                                                    <div className="absolute top-0 right-0 px-2 py-1 text-xs text-gray-400 bg-gray-800 rounded-bl-lg rounded-tr-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {match[1]}
                                                    </div>
                                                    <code className={`${className} block bg-gray-900/90 text-gray-100 p-3 rounded-lg text-sm overflow-x-auto`} {...props}>
                                                        {children}
                                                    </code>
                                                </div>
                                            ) : (
                                                <code className={`${className} bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded text-sm`} {...props}>
                                                    {children}
                                                </code>
                                            );
                                        }
                                    }}
                                >
                                    {msg.content}
                                </ReactMarkdown>

                                {!expandedMessages.has(idx) && msg.role === 'model' && msg.content.length > 400 && (
                                    <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white dark:from-gray-800 to-transparent pointer-events-none" />
                                )}
                            </div>

                            {msg.role === 'model' && msg.content.length > 400 && (
                                <button
                                    onClick={() => toggleExpand(idx)}
                                    className="mt-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 flex items-center gap-1 self-start ml-2"
                                >
                                    {expandedMessages.has(idx) ? 'Show Less' : 'Read More...'}
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                            <Bot className="w-5 h-5" />
                        </div>
                        <div className="bg-white dark:bg-gray-800 px-5 py-4 rounded-2xl rounded-tl-none border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
                {isLocked ? (
                    <div className="max-w-4xl mx-auto flex items-center gap-3 px-4 py-3 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300">
                        <Lock className="w-4 h-4 flex-shrink-0" />
                        <div className="flex-1 text-sm">
                            <span className="font-semibold">Daily question limit reached.</span> Try again in <span className="font-mono font-semibold">{formatCountdown(secondsUntilNext)}</span>.
                        </div>
                    </div>
                ) : (
                    <div className="relative max-w-4xl mx-auto">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message to your mentor..."
                            className="w-full pl-4 pr-14 py-4 bg-gray-100 dark:bg-gray-800 border-0 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 resize-none max-h-40 shadow-inner"
                            rows={1}
                            style={{ minHeight: '60px' }}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-xl transition-all shadow-md disabled:shadow-none"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                )}
                <p className="text-center text-xs text-gray-400 mt-2">
                    AI can make mistakes. Verify important code.
                </p>
            </div>
        </div>
    );
};

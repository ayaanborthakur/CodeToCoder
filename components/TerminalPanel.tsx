import React, { useEffect, useRef, useState } from 'react';
import { Lightbulb, Loader2 } from 'lucide-react';

/** Returns true if the terminal output contains a Python error. */
function outputHasError(output: string): boolean {
    return /Traceback|Error:/i.test(output);
}

interface TerminalPanelProps {
    output: string;
    isLoading: boolean;
    isWaitingForInput: boolean;
    onInputSubmit: (text: string) => void;
    // Hint button
    onRequestHint?: () => void;
    isHintLoading?: boolean;
    hintFeedback?: string | null;
    aiCreditsLeft?: number;
}

export const TerminalPanel: React.FC<TerminalPanelProps> = ({
    output,
    isLoading,
    isWaitingForInput,
    onInputSubmit,
    onRequestHint,
    isHintLoading = false,
    hintFeedback = null,
    aiCreditsLeft = 5,
}) => {
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [inputValue, setInputValue] = useState('');

    // Auto-scroll to bottom
    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [output, isWaitingForInput]);

    // Focus input when waiting
    useEffect(() => {
        if (isWaitingForInput && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isWaitingForInput]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            onInputSubmit(inputValue);
            setInputValue('');
        }
    };

    return (
        <div className="p-4 h-full font-mono text-sm overflow-auto bg-gray-900 text-gray-300 flex flex-col rounded-2xl border border-gray-800 shadow-inner" onClick={() => isWaitingForInput && inputRef.current?.focus()}>
            {/* Loading Indicator */}
            {isLoading && !output.startsWith('Evaluating') && !output.startsWith('Running') && (
                <div className="flex items-center gap-2 text-gray-400 mb-2">
                    <div className="w-3 h-3 border-2 border-t-transparent border-gray-400 rounded-full animate-spin"></div>
                    <span>Initializing runtime...</span>
                </div>
            )}

            {/* Output Display */}
            <div className="whitespace-pre-wrap break-words flex-1">
                {output}

                {/* Input Field (Inline) */}
                {isWaitingForInput && (
                    <div className="inline-flex items-center ml-1 w-full max-w-md align-top">
                        <span className="text-cyan-400 mr-2">➜</span>
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="bg-transparent border-none outline-none text-white w-full font-mono p-0 m-0 focus:ring-0"
                            autoComplete="off"
                            spellCheck="false"
                        />
                    </div>
                )}

                {/* ── Hint Button ─────────────────────────────────────────── */}
                {!isLoading && !isWaitingForInput && onRequestHint && outputHasError(output) && (
                    <div className="mt-3 border-t border-gray-700 pt-3">
                        {/* Button row */}
                        {!hintFeedback && (
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={onRequestHint}
                                    disabled={isHintLoading || aiCreditsLeft <= 0}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                                        ${aiCreditsLeft <= 0
                                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                            : isHintLoading
                                                ? 'bg-yellow-500/20 text-yellow-400 cursor-wait'
                                                : 'bg-yellow-500/15 text-yellow-400 hover:bg-yellow-500/25 active:scale-95'
                                        }`}
                                    title={aiCreditsLeft <= 0 ? 'No AI hints left this hour' : 'Get an AI hint for this error'}
                                >
                                    {isHintLoading
                                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        : <Lightbulb className="w-3.5 h-3.5" />
                                    }
                                    {isHintLoading ? 'Getting hint…' : aiCreditsLeft <= 0 ? 'No hints left' : 'Get Hint'}
                                </button>
                                {/* Credit counter */}
                                <span className={`text-xs font-mono ${aiCreditsLeft <= 1 ? 'text-red-400' : 'text-gray-500'}`}>
                                    {aiCreditsLeft} / 5 hints left this hour
                                </span>
                            </div>
                        )}

                        {/* Hint response */}
                        {hintFeedback && (
                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-yellow-200 text-xs leading-relaxed font-sans">
                                <div className="flex items-center gap-1.5 mb-1.5 text-yellow-400 font-semibold">
                                    <Lightbulb className="w-3.5 h-3.5" />
                                    AI Hint
                                    <span className="ml-auto text-gray-500 font-normal">{aiCreditsLeft} / 5 left</span>
                                </div>
                                {hintFeedback}
                            </div>
                        )}
                    </div>
                )}
                {/* ─────────────────────────────────────────────────────────── */}

                <div ref={bottomRef} />
            </div>
        </div>
    );
};

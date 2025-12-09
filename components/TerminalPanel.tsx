import React, { useEffect, useRef, useState } from 'react';

interface TerminalPanelProps {
    output: string;
    isLoading: boolean;
    isWaitingForInput: boolean;
    onInputSubmit: (text: string) => void;
}

export const TerminalPanel: React.FC<TerminalPanelProps> = ({
    output,
    isLoading,
    isWaitingForInput,
    onInputSubmit
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
        <div className="p-4 h-full font-mono text-sm overflow-auto bg-gray-900 text-gray-300 flex flex-col" onClick={() => isWaitingForInput && inputRef.current?.focus()}>
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
                
                <div ref={bottomRef} />
            </div>
        </div>
    );
};

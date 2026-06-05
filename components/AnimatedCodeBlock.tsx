import React, { useState, useEffect } from 'react';

interface AnimatedCodeBlockProps {
    snippets?: string[];
    typingSpeed?: number; // ms per character
    pauseBetweenSnippets?: number; // ms to wait before next snippet
}

// Sample Python code snippets that demonstrate key concepts
const DEFAULT_SNIPPETS = [
    `# Hello, World!
print("Welcome to Code2Coder!")

name = input("What's your name? ")
print(f"Hello, {name}! Let's learn Python!")`,

    `# A simple loop
for i in range(5):
    print(f"Counting: {i + 1}")
    
print("Done counting!")`,

    `# Define a function
def greet(name):
    return f"Hello, {name}!"
    
message = greet("Developer")
print(message)`,
];

/**
 * AnimatedCodeBlock - Displays Python code snippets with typing animation
 * Cycles through multiple snippets, creating an infinite loop of coding demos
 */
export const AnimatedCodeBlock: React.FC<AnimatedCodeBlockProps> = ({
    snippets = DEFAULT_SNIPPETS,
    typingSpeed = 40,
    pauseBetweenSnippets = 3000
}) => {
    const [currentSnippetIndex, setCurrentSnippetIndex] = useState(0);
    const [displayedLength, setDisplayedLength] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const currentSnippet = snippets[currentSnippetIndex];

    useEffect(() => {
        if (isPaused) {
            // Wait before starting next snippet
            const pauseTimer = setTimeout(() => {
                setIsPaused(false);
                setDisplayedLength(0);
                setCurrentSnippetIndex((prev) => (prev + 1) % snippets.length);
            }, pauseBetweenSnippets);
            return () => clearTimeout(pauseTimer);
        }

        if (displayedLength >= currentSnippet.length) {
            // Snippet complete, pause before next
            setIsPaused(true);
            return;
        }

        // Type next character
        const timer = setTimeout(() => {
            setDisplayedLength((prev) => prev + 1);
        }, typingSpeed);

        return () => clearTimeout(timer);
    }, [displayedLength, currentSnippet, isPaused, snippets.length, typingSpeed, pauseBetweenSnippets]);

    const displayedCode = currentSnippet.slice(0, displayedLength);

    // Simple syntax highlighting
    // Simple syntax highlighting (Single-pass to avoid overlapping replacements)
    const highlightCode = (code: string) => {
        // Combined regex for all tokens
        // Groups:
        // 1. Comment
        // 2,3,4. String (Prefix, Quote, Content)
        // 5. Keyword
        // 6. Number
        // 7. Function call
        const tokenRegex = /(#.*)|((?:f|r)?)(["'])((?:\\.|(?!\3)[^\\])*)\3|\b(def|for|in|if|else|elif|return|import|from|class|while|try|except|with|as|not|and|or|True|False|None|range|print|input)\b|\b(\d+)\b|(\w+)(?=\()/g;

        return code.replace(tokenRegex, (match, comment, prefix, quote, _content, keyword, number, func) => {
            if (comment) {
                return `<span class="text-gray-400 dark:text-gray-500 italic">${comment}</span>`;
            }
            if (quote) {
                const str = match;
                // Handle f-strings highlighting if prefix is 'f'
                if (prefix === 'f') {
                     const rest = str.substring(1);
                     return `<span class="text-green-600 dark:text-green-400">f</span><span class="text-green-500 dark:text-green-400">${rest}</span>`;
                }
                return `<span class="text-green-500 dark:text-green-400">${str}</span>`;
            }
            if (keyword) {
                return `<span class="text-purple-500 dark:text-purple-400">${keyword}</span>`;
            }
            if (number) {
                return `<span class="text-orange-500 dark:text-orange-400">${number}</span>`;
            }
            if (func) {
                return `<span class="text-cyan-600 dark:text-cyan-400">${func}</span>`;
            }
            return match;
        });
    };

    return (
        <div className="relative w-full max-w-lg mx-auto">
            {/* Terminal window frame */}
            <div className="bg-gray-900 rounded-xl shadow-2xl overflow-hidden border border-gray-700">
                {/* Title bar */}
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-800 border-b border-gray-700">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <span className="text-gray-400 text-xs font-mono ml-2">main.py</span>
                </div>
                
                {/* Code content */}
                <div className="p-4 font-mono text-sm min-h-[200px] leading-relaxed">
                    <pre 
                        className="text-gray-100 whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ __html: highlightCode(displayedCode) }} 
                    />
                    {/* Blinking cursor */}
                    <span className="inline-block w-2 h-4 bg-cyan-400 animate-pulse ml-0.5 align-middle" />
                </div>
            </div>
            
            {/* Snippet indicator dots */}
            <div className="flex justify-center gap-2 mt-4">
                {snippets.map((_, index) => (
                    <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors ${
                            index === currentSnippetIndex
                                ? 'bg-cyan-500'
                                : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default AnimatedCodeBlock;

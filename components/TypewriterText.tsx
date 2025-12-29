import React, { useState, useEffect, useRef } from 'react';

interface TypewriterTextProps {
    content: string;
    speed?: number; // Characters per second (default 80)
    onComplete?: () => void;
    renderContent: (text: string) => React.ReactNode;
}

/**
 * TypewriterText component - animates text appearing character by character
 * Only animates the most recent message (when content changes)
 */
export const TypewriterText: React.FC<TypewriterTextProps> = ({
    content,
    speed = 80,
    onComplete,
    renderContent
}) => {
    const [displayedLength, setDisplayedLength] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const prevContentRef = useRef(content);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // If content changed, start typing animation
        if (content !== prevContentRef.current) {
            prevContentRef.current = content;
            setDisplayedLength(0);
            setIsComplete(false);
        }
    }, [content]);

    useEffect(() => {
        // If already complete or empty content, skip
        if (isComplete || displayedLength >= content.length) {
            if (!isComplete && displayedLength >= content.length) {
                setIsComplete(true);
                onComplete?.();
            }
            return;
        }

        const interval = 1000 / speed;
        
        intervalRef.current = setTimeout(() => {
            // Type multiple characters at once for faster perceived speed
            const charsToAdd = Math.min(3, content.length - displayedLength);
            setDisplayedLength(prev => Math.min(prev + charsToAdd, content.length));
        }, interval);

        return () => {
            if (intervalRef.current) {
                clearTimeout(intervalRef.current);
            }
        };
    }, [displayedLength, content, speed, isComplete, onComplete]);

    const displayedContent = isComplete ? content : content.slice(0, displayedLength);

    return (
        <div className="typewriter-container">
            {renderContent(displayedContent)}
            {!isComplete && (
                <span className="typewriter-cursor animate-pulse text-cyan-500 ml-0.5">▌</span>
            )}
        </div>
    );
};

export default TypewriterText;

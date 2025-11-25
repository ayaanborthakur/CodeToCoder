
import React, { useEffect, useState } from 'react';

interface Point {
    x: number;
    y: number;
}

interface FlyingStarProps {
    start: Point;
    end: Point;
    onComplete: () => void;
}

export const FlyingStar: React.FC<FlyingStarProps> = ({ start, end, onComplete }) => {
    const [style, setStyle] = useState<React.CSSProperties>({
        position: 'fixed',
        left: start.x,
        top: start.y,
        transform: 'translate(-50%, -50%) scale(1)',
        opacity: 1,
        zIndex: 9999,
        pointerEvents: 'none',
        transition: 'none',
    });

    useEffect(() => {
        // Trigger animation next frame to ensure transition occurs
        const frame = requestAnimationFrame(() => {
            setStyle({
                position: 'fixed',
                left: end.x,
                top: end.y,
                // Rotate and shrink slightly as it enters the counter
                transform: 'translate(-50%, -50%) scale(0.2) rotate(720deg)',
                opacity: 0, 
                zIndex: 9999,
                pointerEvents: 'none',
                // Movement takes 2s. Shrinking/Fading starts at 1.5s and takes 0.5s.
                transition: 'left 2s cubic-bezier(0.25, 1, 0.5, 1), top 2s cubic-bezier(0.25, 1, 0.5, 1), transform 0.5s ease-in 1.5s, opacity 0.5s ease-in 1.5s',
            });
        });

        const timer = setTimeout(onComplete, 2000);
        return () => {
            cancelAnimationFrame(frame);
            clearTimeout(timer);
        };
    }, [end.x, end.y, onComplete]);

    return (
        <div style={style}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 text-yellow-400 drop-shadow-2xl">
                <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
            </svg>
        </div>
    );
};

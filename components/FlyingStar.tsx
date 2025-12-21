
import React, { useEffect, useState } from 'react';

import { Star } from 'lucide-react';

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
            <Star className="w-16 h-16 text-yellow-400 drop-shadow-2xl fill-yellow-400" />
        </div>
    );
};

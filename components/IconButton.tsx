import React from 'react';

export interface IconButtonProps {
    onClick: () => void;
    disabled?: boolean;
    title?: string;
    icon: React.ReactNode;
    label: string;
    variant?: 'default' | 'primary' | 'secondary';
    className?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({ 
    onClick, 
    disabled, 
    title, 
    icon, 
    label, 
    variant = 'default',
    className = ''
}) => {
    const baseStyles = "flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-md disabled:opacity-50 disabled:cursor-not-allowed border";

    // One filled button per toolbar (primary = Run). Everything else is quiet.
    const variants = {
        default: "text-gray-700 bg-transparent hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700",
        primary: "text-white bg-green-700 hover:bg-green-800 border-transparent disabled:bg-gray-400 dark:disabled:bg-gray-600",
        secondary: "text-cyan-700 bg-cyan-50 hover:bg-cyan-100 border-cyan-200 dark:text-cyan-300 dark:bg-cyan-950/50 dark:hover:bg-cyan-900/60 dark:border-cyan-800"
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            title={title}
            aria-label={label ? undefined : title}
            className={`${baseStyles} ${variants[variant]} ${className}`}
        >
            {icon}
            {label}
        </button>
    );
};
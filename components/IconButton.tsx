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
    // Added transition, hover shadow, and active scale
    const baseStyles = "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border active:scale-95 hover:shadow-sm";
    
    const variants = {
        default: "text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700",
        primary: "text-white bg-green-600 hover:bg-green-500 border-transparent disabled:bg-gray-400 dark:disabled:bg-gray-500",
        secondary: "text-white bg-blue-600 hover:bg-blue-500 border-transparent disabled:bg-gray-400 dark:disabled:bg-gray-500"
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={`${baseStyles} ${variants[variant]} ${className}`}
        >
            {icon}
            {label}
        </button>
    );
};
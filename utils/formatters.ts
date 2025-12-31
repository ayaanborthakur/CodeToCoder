/**
 * Formats a large number into a compact string (e.g., 32.46M, 1.2K).
 * @param value The number to format
 * @returns A formatted string
 */
export const formatCompactNumber = (value: number | undefined): string => {
    if (value === undefined || value === null) return '0';
    
    const formatter = Intl.NumberFormat('en', { 
        notation: 'compact',
        maximumFractionDigits: 2 
    });
    
    return formatter.format(value);
};

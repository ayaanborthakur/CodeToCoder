/**
 * Development-only logging utility
 * Logs only run in development mode
 */
const isDev = import.meta.env.DEV;

export const devLog = {
    info: (...args: any[]) => {
        if (isDev) console.log(...args);
    },
    warn: (...args: any[]) => {
        if (isDev) console.warn(...args);
    },
    error: (...args: any[]) => {
        // Always log errors, even in production
        console.error(...args);
    }
};

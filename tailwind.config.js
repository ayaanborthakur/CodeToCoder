/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./index.tsx",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./App.tsx",
    ],
    safelist: [
        // AnimatedCodeBlock syntax highlighting classes
        'text-purple-500',
        'text-purple-400',
        'text-green-500',
        'text-green-400',
        'text-green-600',
        'text-gray-400',
        'text-gray-500',
        'text-orange-500',
        'text-orange-400',
        'text-cyan-600',
        'text-cyan-400',
        'italic',
        'dark:text-purple-400',
        'dark:text-green-400',
        'dark:text-gray-500',
        'dark:text-orange-400',
        'dark:text-cyan-400',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            borderRadius: {
                DEFAULT: '6px',
                sm: '4px',
                md: '6px',
                lg: '8px',
                xl: '10px',
                '2xl': '12px',
                '3xl': '14px',
            },
            colors: {
                background: 'var(--background)',
                surface: 'var(--surface)',
                'surface-highlight': 'var(--surface-highlight)',
                'text-primary': 'var(--text-primary)',
                'text-secondary': 'var(--text-secondary)',
                'border-default': 'var(--border-default)',
            },
            fontFamily: {
                sans: ['"Outfit"', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
                mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace'],
            },
            animation: {
                'slide-up': 'slideUp 0.4s ease-out forwards',
                'fade-in': 'fadeIn 0.4s ease-out forwards',
            },
        },
    },
    plugins: [],
}

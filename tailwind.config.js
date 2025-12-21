/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./index.tsx",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./App.tsx",
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

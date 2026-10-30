// Cool neutrals with a faint blue cast, tuned so 500 passes AA on white.
const ink = {
    50: '#f5f6fa',
    100: '#eceef5',
    200: '#dde1ec',
    300: '#c3c9d9',
    400: '#8d96ad',
    500: '#646e87',
    600: '#4a5470',
    700: '#343d57',
    800: '#232a41',
    900: '#151b2d',
    950: '#0e1322',
};

// Python's own blue. 500 and up carry white text at WCAG AA (4.6:1+);
// 300/400 are the accent on dark surfaces.
const python = {
    50: '#eef5fc',
    100: '#d9e8f7',
    200: '#b7d3ef',
    300: '#89b6e2',
    400: '#5c97d2',
    500: '#3a78b4',
    600: '#30689a',
    700: '#2a5a85',
    800: '#264c6e',
    900: '#22405a',
    950: '#172b3d',
};

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./index.tsx",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./data/**/*.{js,ts}",
        "./utils/**/*.{js,ts}",
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
                // Design system: "ink" neutrals and a single Python-blue
                // accent. Every gray-ish palette resolves to ink and every
                // cool accent (cyan, sky, blue, indigo, violet, purple, teal)
                // resolves to python, so screens can't drift into a rainbow.
                // green/red/amber/yellow/orange stay for status and rewards.
                gray: ink,
                slate: ink,
                zinc: ink,
                neutral: ink,
                cyan: python,
                sky: python,
                blue: python,
                indigo: python,
                violet: python,
                purple: python,
                teal: python,
                ink,
                python,
                background: 'var(--background)',
                surface: 'var(--surface)',
                'surface-highlight': 'var(--surface-highlight)',
                'text-primary': 'var(--text-primary)',
                'text-secondary': 'var(--text-secondary)',
                'border-default': 'var(--border-default)',
            },
            fontFamily: {
                sans: ['"Atkinson Hyperlegible Next"', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
                mono: ['"Atkinson Hyperlegible Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace'],
            },
            animation: {
                'slide-up': 'slideUp 0.4s ease-out forwards',
                'fade-in': 'fadeIn 0.4s ease-out forwards',
            },
        },
    },
    plugins: [],
}

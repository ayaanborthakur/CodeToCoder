import { Collectible } from '../types';

export const COLLECTIBLES: Collectible[] = [
    // Common
    { id: 'c_bug_squasher', name: 'Bug Squasher', description: 'A beginner coder\'s best friend.', rarity: 'common', image: '🐛' },
    { id: 'c_hello_world', name: 'Hello World', description: 'The first program everyone writes.', rarity: 'common', image: '👋' },
    { id: 'c_semicolon', name: 'Missing Semicolon', description: 'The cause of many headaches.', rarity: 'common', image: 'ERROR' },
    { id: 'c_coffee_mug', name: 'Empty Mug', description: 'Fuel for code.', rarity: 'common', image: '☕' },

    // Rare
    { id: 'r_clean_code', name: 'Clean Code', description: 'Easy to read, easy to maintain.', rarity: 'rare', image: '✨' },
    { id: 'r_git_commit', name: 'Perfect Commit', description: 'A commit message that actually makes sense.', rarity: 'rare', image: '📝' },
    { id: 'r_debugger', name: 'The Debugger', description: 'Finding bugs one step at a time.', rarity: 'rare', image: '🐞' },

    // Epic
    { id: 'e_algo_master', name: 'Algorithm Master', description: 'Sorting arrays in your sleep.', rarity: 'epic', image: '🧠' },
    { id: 'e_full_stack', name: 'Full Stack Hero', description: 'Frontend, backend, and everything in between.', rarity: 'epic', image: '🌐' },
    { id: 'e_dark_mode', name: 'Dark Mode', description: 'Protecting eyes since 1990.', rarity: 'epic', image: '🌙' },

    // Legendary
    { id: 'l_10x_dev', name: '10x Developer', description: 'A mythical creature of productivity.', rarity: 'legendary', image: '🚀' },
    { id: 'l_unicorn', name: 'Unicorn Startup', description: 'A billion dollar idea.', rarity: 'legendary', image: '🦄' },

    // Mythic
    { id: 'm_ai_overlord', name: 'AI Overlord', description: 'The code writes itself.', rarity: 'mythic', image: '🤖' },
    { id: 'm_quantum_pc', name: 'Quantum Computer', description: 'Solving problems before they exist.', rarity: 'mythic', image: '⚛️' }
];

export const RARITY_COLORS = {
    common: 'text-slate-400 border-slate-400',
    rare: 'text-blue-400 border-blue-400',
    epic: 'text-purple-400 border-purple-400',
    legendary: 'text-orange-400 border-orange-400',
    mythic: 'text-red-500 border-red-500 animate-pulse'
};

export const RARITY_BG_COLORS = {
    common: 'bg-slate-500/10',
    rare: 'bg-blue-500/10',
    epic: 'bg-purple-500/10',
    legendary: 'bg-orange-500/10',
    mythic: 'bg-red-500/10'
};

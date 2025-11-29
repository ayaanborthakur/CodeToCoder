import { Collectible } from '../types';

export const COLLECTIBLES: Collectible[] = [
    // ========== COMMON (60% drop rate) ==========
    // Basic Programming Concepts
    { id: 'c_hello_world', name: 'Hello World', description: 'The first program everyone writes.', rarity: 'common', image: '👋' },
    { id: 'c_semicolon', name: 'Missing Semicolon', description: 'The cause of many headaches.', rarity: 'common', image: ';' },
    { id: 'c_coffee_mug', name: 'Empty Coffee Mug', description: 'Fuel for late-night coding sessions.', rarity: 'common', image: '☕' },
    { id: 'c_bug_squasher', name: 'Bug Squasher', description: 'A beginner coder\'s best friend.', rarity: 'common', image: '🐛' },
    { id: 'c_keyboard', name: 'Worn Keyboard', description: 'The WASD keys are completely faded.', rarity: 'common', image: '⌨️' },
    { id: 'c_mouse', name: 'Basic Mouse', description: 'Click, click, click...', rarity: 'common', image: '🖱️' },
    { id: 'c_monitor', name: 'Old Monitor', description: 'Still works, but has a dead pixel.', rarity: 'common', image: '🖥️' },
    { id: 'c_usb_drive', name: 'USB Drive', description: 'Always gets plugged in wrong the first time.', rarity: 'common', image: '💾' },
    { id: 'c_notepad', name: 'Notepad', description: 'For jotting down quick ideas.', rarity: 'common', image: '📝' },
    { id: 'c_pencil', name: 'Pencil', description: 'Old school debugging tool.', rarity: 'common', image: '✏️' },
    { id: 'c_sticky_note', name: 'Sticky Note', description: 'Password reminder: "password123"', rarity: 'common', image: '📌' },
    { id: 'c_glasses', name: 'Reading Glasses', description: 'For reading tiny error messages.', rarity: 'common', image: '👓' },

    // ========== UNCOMMON (25% drop rate) ==========
    // Intermediate Tools & Concepts
    { id: 'u_git_branch', name: 'Git Branch', description: 'Branching out into new features.', rarity: 'uncommon', image: '🌿' },
    { id: 'u_stack_overflow', name: 'Stack Overflow Tab', description: 'The answer to all your questions.', rarity: 'uncommon', image: '📚' },
    { id: 'u_rubber_duck', name: 'Rubber Duck', description: 'Your debugging companion.', rarity: 'uncommon', image: '🦆' },
    { id: 'u_energy_drink', name: 'Energy Drink', description: 'Liquid motivation in a can.', rarity: 'uncommon', image: '🥤' },
    { id: 'u_headphones', name: 'Noise-Canceling Headphones', description: 'Enter the zone.', rarity: 'uncommon', image: '🎧' },
    { id: 'u_mechanical_keyboard', name: 'Mechanical Keyboard', description: 'Click-clack symphony.', rarity: 'uncommon', image: '⌨️' },
    { id: 'u_dual_monitor', name: 'Dual Monitor Setup', description: 'Twice the screen, twice the productivity.', rarity: 'uncommon', image: '🖥️🖥️' },
    { id: 'u_standing_desk', name: 'Standing Desk', description: 'Code while standing like a boss.', rarity: 'uncommon', image: '🪑' },
    { id: 'u_plant', name: 'Desk Plant', description: 'Adds life to your workspace.', rarity: 'uncommon', image: '🌱' },
    { id: 'u_pizza', name: 'Pizza Box', description: 'Dinner of champions.', rarity: 'uncommon', image: '🍕' },
    { id: 'u_whiteboard', name: 'Whiteboard', description: 'For sketching out algorithms.', rarity: 'uncommon', image: '📋' },
    { id: 'u_terminal', name: 'Terminal Window', description: 'The command line is your friend.', rarity: 'uncommon', image: '💻' },

    // ========== RARE (10% drop rate) ==========
    // Advanced Concepts & Skills
    { id: 'r_clean_code', name: 'Clean Code', description: 'Easy to read, easy to maintain.', rarity: 'rare', image: '✨' },
    { id: 'r_git_commit', name: 'Perfect Commit', description: 'A commit message that actually makes sense.', rarity: 'rare', image: '📝' },
    { id: 'r_debugger', name: 'The Debugger', description: 'Finding bugs one step at a time.', rarity: 'rare', image: '🐞' },
    { id: 'r_refactor', name: 'Successful Refactor', description: 'Made it better without breaking anything.', rarity: 'rare', image: '♻️' },
    { id: 'r_test_suite', name: 'Passing Test Suite', description: 'All green, all good.', rarity: 'rare', image: '✅' },
    { id: 'r_code_review', name: 'Approved Code Review', description: 'LGTM - Ship it!', rarity: 'rare', image: '👍' },
    { id: 'r_deployment', name: 'Successful Deployment', description: 'It works in production!', rarity: 'rare', image: '🚀' },
    { id: 'r_documentation', name: 'Complete Documentation', description: 'Future you will thank present you.', rarity: 'rare', image: '📖' },
    { id: 'r_ergonomic_chair', name: 'Ergonomic Chair', description: 'Your back will thank you.', rarity: 'rare', image: '💺' },
    { id: 'r_ultrawide', name: 'Ultrawide Monitor', description: 'See all the code at once.', rarity: 'rare', image: '🖥️' },
    { id: 'r_mechanical_numpad', name: 'Custom Numpad', description: 'For the true enthusiast.', rarity: 'rare', image: '🔢' },
    { id: 'r_rgb_lights', name: 'RGB Lighting', description: 'Makes your code run faster.', rarity: 'rare', image: '🌈' },

    // ========== EPIC (4% drop rate) ==========
    // Expert Level & Achievements
    { id: 'e_algo_master', name: 'Algorithm Master', description: 'Sorting arrays in your sleep.', rarity: 'epic', image: '🧠' },
    { id: 'e_full_stack', name: 'Full Stack Hero', description: 'Frontend, backend, and everything in between.', rarity: 'epic', image: '🌐' },
    { id: 'e_dark_mode', name: 'Dark Mode Enthusiast', description: 'Protecting eyes since 1990.', rarity: 'epic', image: '🌙' },
    { id: 'e_zero_bugs', name: 'Zero Bug Release', description: 'A mythical achievement.', rarity: 'epic', image: '🎯' },
    { id: 'e_optimization', name: 'Performance Wizard', description: 'Made it 10x faster.', rarity: 'epic', image: '⚡' },
    { id: 'e_security', name: 'Security Expert', description: 'Hacker-proof code.', rarity: 'epic', image: '🔒' },
    { id: 'e_architect', name: 'System Architect', description: 'Designing scalable systems.', rarity: 'epic', image: '🏗️' },
    { id: 'e_open_source', name: 'Open Source Contributor', description: 'Giving back to the community.', rarity: 'epic', image: '🤝' },
    { id: 'e_mentor', name: 'Code Mentor', description: 'Teaching the next generation.', rarity: 'epic', image: '👨‍🏫' },
    { id: 'e_hackathon', name: 'Hackathon Winner', description: '48 hours of pure coding.', rarity: 'epic', image: '🏆' },

    // ========== LEGENDARY (0.8% drop rate) ==========
    // Legendary Achievements
    { id: 'l_10x_dev', name: '10x Developer', description: 'A mythical creature of productivity.', rarity: 'legendary', image: '🚀' },
    { id: 'l_unicorn', name: 'Unicorn Startup', description: 'A billion dollar idea.', rarity: 'legendary', image: '🦄' },
    { id: 'l_tech_lead', name: 'Tech Lead', description: 'Leading the charge.', rarity: 'legendary', image: '👑' },
    { id: 'l_production_hero', name: 'Production Hero', description: 'Saved the day during an outage.', rarity: 'legendary', image: '🦸' },
    { id: 'l_legacy_code', name: 'Legacy Code Survivor', description: 'Understood code from 2005.', rarity: 'legendary', image: '📜' },
    { id: 'l_perfect_uptime', name: 'Perfect Uptime', description: '99.999% availability achieved.', rarity: 'legendary', image: '💯' },
    { id: 'l_viral_project', name: 'Viral Project', description: '10k+ GitHub stars.', rarity: 'legendary', image: '⭐' },

    // ========== MYTHIC (0.2% drop rate) ==========
    // Ultra Rare Mythical Items
    { id: 'm_ai_overlord', name: 'AI Overlord', description: 'The code writes itself.', rarity: 'mythic', image: '🤖' },
    { id: 'm_quantum_pc', name: 'Quantum Computer', description: 'Solving problems before they exist.', rarity: 'mythic', image: '⚛️' },
    { id: 'm_time_traveler', name: 'Time Traveling Debugger', description: 'Fix bugs before they happen.', rarity: 'mythic', image: '⏰' },
    { id: 'm_infinite_coffee', name: 'Infinite Coffee Machine', description: 'Never run out of fuel.', rarity: 'mythic', image: '☕' },
    { id: 'm_bug_free', name: 'Bug-Free Code Generator', description: 'Writes perfect code every time.', rarity: 'mythic', image: '✨' },
];

export const RARITY_COLORS = {
    common: 'text-slate-400',
    uncommon: 'text-green-400',
    rare: 'text-blue-400',
    epic: 'text-purple-400',
    legendary: 'text-yellow-400',
    mythic: 'text-red-500'
};

export const RARITY_BG_COLORS = {
    common: 'bg-slate-500/10',
    uncommon: 'bg-green-500/10',
    rare: 'bg-blue-500/10',
    epic: 'bg-purple-500/10',
    legendary: 'bg-yellow-500/10',
    mythic: 'bg-red-500/10'
};

export const RARITY_BORDER_COLORS = {
    common: 'border-slate-400',
    uncommon: 'border-green-400',
    rare: 'border-blue-400',
    epic: 'border-purple-400',
    legendary: 'border-yellow-400',
    mythic: 'border-red-500'
};

export const RARITY_GLOW = {
    common: 'shadow-slate-500/20',
    uncommon: 'shadow-green-500/30',
    rare: 'shadow-blue-500/40',
    epic: 'shadow-purple-500/50',
    legendary: 'shadow-yellow-500/60 animate-pulse',
    mythic: 'shadow-red-500/70 animate-pulse'
};

// Drop rate percentages for reference
export const RARITY_DROP_RATES = {
    common: 0.60,      // 60%
    uncommon: 0.25,    // 25%
    rare: 0.10,        // 10%
    epic: 0.04,        // 4%
    legendary: 0.008,  // 0.8%
    mythic: 0.002      // 0.2%
};

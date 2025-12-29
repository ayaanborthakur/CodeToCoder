import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { ContactModal } from './ContactModal';
import { AnimatedCodeBlock } from './AnimatedCodeBlock';
import { ViewState } from './Header';

interface MissionPageProps {
    onStart: () => void;
    onNavigate: (view: ViewState) => void;
}

import FooterLogo from '../assets/FooterLogo.svg?react';
import { 
    Check, 
    Zap, 
    Users, 
    Shield, 
    Wifi, 
    GraduationCap, 
    Code2, 
    Brain, 
    Rocket, 
    Target, 
    Trophy, 
    BookOpen, 
    Sparkles,
    ArrowRight,
    Star,
    Play,
    CheckCircle2,
    Globe,
    Clock,
    TrendingUp
} from 'lucide-react';

// Floating neon code symbol component
const FloatingCodeSymbol: React.FC<{
    symbol: string;
    x: number;
    y: number;
    size: number;
    color: string;
    speed: number;
    delay: number;
}> = ({ symbol, x, y, size, color, speed, delay }) => {
    return (
        <div
            className="floating-code-symbol absolute pointer-events-none font-mono font-bold select-none"
            style={{
                left: `${x}%`,
                top: `${y}px`,
                fontSize: `${size}px`,
                color: color,
                textShadow: `0 0 10px ${color}, 0 0 20px ${color}, 0 0 40px ${color}`,
                animationDuration: `${speed}s`,
                animationDelay: `${delay}s`,
                opacity: 0.5,
            }}
        >
            {symbol}
        </div>
    );
};

// Code symbols and colors for auto-generation
const CODE_SYMBOLS = [
    '{', '}', '()', '[]', 'def', 'if', 'for', 'while', 'class', 'return',
    ':', '->', '==', '!=', '+=', 'True', 'False', 'None', 'print', 'import',
    'from', 'in', 'not', 'and', 'or', 'try', 'except', 'with', 'as', 'lambda',
    '#', '**', '//', '%', '@', 'self', 'async', 'await', 'yield', 'pass'
];

const NEON_COLORS = [
    '#06b6d4', '#22d3ee', '#3b82f6', '#8b5cf6', '#a855f7', '#c084fc',
    '#ec4899', '#f472b6', '#10b981', '#34d399', '#14b8a6', '#f59e0b',
    '#fb923c', '#a3e635', '#84cc16'
];

// Type for generated symbol
interface GeneratedSymbol {
    id: number;
    symbol: string;
    x: number;
    y: number;
    size: number;
    color: string;
    speed: number;
    delay: number;
}

// Generate random symbols for the background with collision detection
const generateSymbols = (count: number, pageHeight: number): GeneratedSymbol[] => {
    const symbols: GeneratedSymbol[] = [];
    const minHorizontalDist = 12; // % distance
    const minVerticalDist = 180; // px distance
    const maxAttempts = 50; // Increased attempts to find non-overlapping space

    for (let i = 0; i < count; i++) {
        let x = 0, y = 0;
        let attempts = 0;
        let isValid = false;

        while (!isValid && attempts < maxAttempts) {
            x = Math.random() * 90 + 5; // 5-95% horizontal
            y = Math.random() * pageHeight;
            
            isValid = true;
            for (const existing of symbols) {
                const dx = Math.abs(existing.x - x);
                const dy = Math.abs(existing.y - y);
                if (dx < minHorizontalDist && dy < minVerticalDist) {
                    isValid = false;
                    break;
                }
            }
            attempts++;
        }

        symbols.push({
            id: i,
            symbol: CODE_SYMBOLS[Math.floor(Math.random() * CODE_SYMBOLS.length)],
            x,
            y,
            size: Math.random() * 30 + 18, // 18-48px
            color: NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)],
            speed: Math.random() * 15 + 15, // 15-30s animation duration
            delay: Math.random() * 10, // 0-10s delay
        });
    }
    return symbols;
};

// Animated counter component
const AnimatedCounter: React.FC<{ end: number; suffix?: string; duration?: number }> = ({ 
    end, 
    suffix = '', 
    duration = 2000 
}) => {
    const [count, setCount] = useState(0);
    const countRef = useRef<HTMLSpanElement>(null);
    const [hasAnimated, setHasAnimated] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !hasAnimated) {
                    setHasAnimated(true);
                    let startTime: number;
                    const animate = (currentTime: number) => {
                        if (!startTime) startTime = currentTime;
                        const progress = Math.min((currentTime - startTime) / duration, 1);
                        setCount(Math.floor(progress * end));
                        if (progress < 1) {
                            requestAnimationFrame(animate);
                        }
                    };
                    requestAnimationFrame(animate);
                }
            },
            { threshold: 0.5 }
        );

        if (countRef.current) {
            observer.observe(countRef.current);
        }

        return () => observer.disconnect();
    }, [end, duration, hasAnimated]);

    return <span ref={countRef}>{count}{suffix}</span>;
};

// Feature card with hover animation
const FeatureCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
    color: string;
    delay: number;
}> = ({ icon, title, description, color, delay }) => {
    return (
        <article
            className="feature-card group bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg p-8 rounded-3xl border border-gray-200/50 dark:border-gray-700/50 hover:border-transparent transition-all duration-500 relative overflow-hidden"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
            <div className={`relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                {icon}
            </div>
            <h3 className="relative z-10 text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                {title}
            </h3>
            <p className="relative z-10 text-gray-600 dark:text-gray-400 leading-relaxed">
                {description}
            </p>
        </article>
    );
};

export const MissionPage: React.FC<MissionPageProps> = ({ onStart, onNavigate }) => {
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [scrollY, setScrollY] = useState(0);
    const heroRef = useRef<HTMLElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Generate code symbols once - enough to cover a long page (150 symbols for denser background)
    const codeSymbols = useMemo(() => generateSymbols(150, 10000), []);

    // Parallax scroll effect - background scrolls at 30% of content speed
    useEffect(() => {
        const handleScroll = () => {
            if (containerRef.current) {
                setScrollY(containerRef.current.scrollTop);
            }
        };

        const container = containerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, []);

    const scrollToSection = (e: React.MouseEvent, sectionId: string) => {
        e.preventDefault();
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div ref={containerRef} className="mission-page min-h-full bg-slate-50 dark:bg-slate-950 text-gray-800 dark:text-gray-200 flex flex-col font-sans overflow-x-hidden overflow-y-auto">
            <Helmet>
                <title>Code2Coder | Learn Python Programming for Free with AI-Powered Tutoring</title>
                <meta name="description" content="Master Python programming with Code2Coder's free, AI-powered learning platform. Run code instantly in your browser with no setup required. Perfect for beginners and intermediate learners." />
                <meta name="keywords" content="learn python, python programming, coding tutorial, free coding course, AI tutor, python for beginners, learn to code, programming education, online coding, browser-based python" />
                <meta property="og:title" content="Code2Coder | Learn Python Programming for Free with AI-Powered Tutoring" />
                <meta property="og:description" content="Master Python programming with our free, AI-powered learning platform. No downloads, no servers, no barriers." />
                <meta property="og:type" content="website" />
                <link rel="canonical" href="https://code2coder.com" />
            </Helmet>

            {/* Animated Parallax Background with Auto-Generated Neon Code Symbols */}
            {/* Fixed background that moves at 50% scroll speed - always visible behind content */}
            <div 
                className="parallax-background fixed inset-0 overflow-hidden pointer-events-none"
                style={{ 
                    transform: `translateY(${-scrollY * 0.5}px)`,
                    height: '10000px',
                    zIndex: 0
                }}
            >
                {/* Main gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-cyan-50/30 to-purple-50/30 dark:from-slate-950 dark:via-cyan-950/20 dark:to-purple-950/20" />
                
                {/* Auto-generated floating neon code symbols */}
                {codeSymbols.map((sym) => (
                    <FloatingCodeSymbol
                        key={sym.id}
                        symbol={sym.symbol}
                        x={sym.x}
                        y={sym.y}
                        size={sym.size}
                        color={sym.color}
                        speed={sym.speed}
                        delay={sym.delay}
                    />
                ))}
                
                {/* Subtle grid pattern overlay */}
                <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h60v60H0z' fill='none'/%3E%3Cpath d='M0 0h1v60H0zM59 0h1v60h-1z' fill='%23000'/%3E%3Cpath d='M0 0h60v1H0zM0 59h60v1H0z' fill='%23000'/%3E%3C/svg%3E")`,
                }} />
            </div>

            {/* Hero Section */}
            <header ref={heroRef} className="hero-section relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 pt-24 pb-32 min-h-[90vh]">
                <div className="hero-content max-w-6xl mx-auto">
                    {/* Animated badge */}
                    <div className="hero-badge inline-flex items-center gap-2 mb-6 px-5 py-2 rounded-full bg-cyan-500/10 dark:bg-cyan-400/10 border border-cyan-500/20 dark:border-cyan-400/20 text-cyan-700 dark:text-cyan-300 text-sm font-semibold backdrop-blur-sm">
                        <Sparkles className="w-4 h-4 animate-pulse" />
                        <span>Zero Setup • Instant Execution • AI-Powered</span>
                        <Sparkles className="w-4 h-4 animate-pulse" />
                    </div>
                    
                    <h1 className="hero-title text-5xl md:text-7xl lg:text-8xl font-black mb-8 tracking-tight leading-[1.1]">
                        <span className="text-gray-900 dark:text-white">Master Python with</span>
                        <br />
                        <span className="hero-gradient-text inline-block mt-2">
                            AI-First Tutoring
                        </span>
                    </h1>
                    
                    <p className="hero-description text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
                        Run Python instantly in your browser with <strong>Pyodide</strong>. Get personalized guidance from <strong>Google Gemini AI</strong>. 
                        No downloads, no servers, no barriers—just pure learning.
                    </p>
                    
                    <div className="hero-buttons flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                        <button
                            onClick={onStart}
                            className="group flex items-center gap-3 px-10 py-5 text-lg font-bold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-2xl shadow-2xl shadow-cyan-500/25 transform transition-all hover:-translate-y-1 hover:shadow-cyan-500/40"
                        >
                            <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            Start Learning for Free
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button
                            type="button"
                            onClick={(e) => scrollToSection(e, 'mission')}
                            className="flex items-center gap-2 px-8 py-5 text-lg font-bold text-gray-700 dark:text-gray-200 bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg border-2 border-gray-200 dark:border-gray-700 rounded-2xl hover:border-cyan-500 dark:hover:border-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all"
                        >
                            Discover Our Mission
                        </button>
                    </div>

                    {/* Animated Code Demo */}
                    <div className="mb-12 hidden md:block">
                        <AnimatedCodeBlock />
                    </div>

                    {/* Stats row */}
                    <div className="hero-stats grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                        <div className="stat-card bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                            <div className="text-3xl md:text-4xl font-black text-cyan-600 dark:text-cyan-400">
                                <AnimatedCounter end={100} suffix="%" />
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Free Forever</p>
                        </div>
                        <div className="stat-card bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                            <div className="text-3xl md:text-4xl font-black text-purple-600 dark:text-purple-400">
                                <AnimatedCounter end={50} suffix="+" />
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Python Lessons</p>
                        </div>
                        <div className="stat-card bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                            <div className="text-3xl md:text-4xl font-black text-green-600 dark:text-green-400">
                                <AnimatedCounter end={24} suffix="/7" />
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">AI Support</p>
                        </div>
                        <div className="stat-card bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                            <div className="text-3xl md:text-4xl font-black text-orange-600 dark:text-orange-400">
                                <AnimatedCounter end={0} />
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Setup Required</p>
                        </div>
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="scroll-indicator absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-400 dark:text-gray-500">
                    <span className="text-xs uppercase tracking-widest">Scroll to explore</span>
                    <div className="w-6 h-10 rounded-full border-2 border-gray-300 dark:border-gray-600 flex justify-center pt-2">
                        <div className="w-1.5 h-3 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" />
                    </div>
                </div>
            </header>

            {/* Mission Section */}
            <section id="mission" className="relative z-10 py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
                        <div className="mission-text">
                            <span className="inline-block px-4 py-1.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-sm font-bold tracking-wider uppercase mb-4">
                                Our Purpose
                            </span>
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-8 leading-tight">
                                Why Choose <span className="text-cyan-600 dark:text-cyan-400">Code2Coder</span>?
                            </h2>
                            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                                In today's digital age, programming skills are a gateway to economic empowerment. However, quality education often comes with a high price tag.
                            </p>
                            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
                                <strong className="text-gray-900 dark:text-white">Code2Coder</strong> was built to dismantle these barriers. We provide a free, high-quality, AI-powered learning environment designed to guide you from your first line of code to building real-world applications. Our focus isn't just on syntax, but on community growth and individual potential.
                            </p>
                            <button
                                onClick={onStart}
                                className="inline-flex items-center gap-2 px-8 py-4 text-lg font-bold bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                            >
                                <GraduationCap className="w-5 h-5" />
                                Begin Your Journey
                            </button>
                        </div>
                        
                        <div className="mission-cards relative">
                            <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-3xl opacity-20 blur-2xl animate-pulse" />
                            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50">
                                <div className="space-y-8">
                                    <div className="flex gap-5 items-start">
                                        <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-500/25">
                                            <Check className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">100% Free Education</h3>
                                            <p className="text-gray-500 dark:text-gray-400">No paywalls, no subscriptions, no hidden fees. Just unlimited learning opportunities.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-5 items-start">
                                        <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-cyan-500/25">
                                            <Brain className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">AI-Powered Mentorship</h3>
                                            <p className="text-gray-500 dark:text-gray-400">Instant, personalized feedback and guidance powered by Google Gemini whenever you're stuck.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-5 items-start">
                                        <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-500/25">
                                            <Users className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">Community Impact</h3>
                                            <p className="text-gray-500 dark:text-gray-400">Designed to uplift and empower underrepresented groups in technology.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Technology Section - Why Client-Side */}
            <section id="technology" className="relative z-10 py-32 px-6 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <span className="inline-block px-4 py-1.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-sm font-bold tracking-wider uppercase mb-4">
                            Powered by WebAssembly
                        </span>
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6">
                            Why Client-Side Python?
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                            We use <strong>Pyodide</strong> to run Python directly in your browser. This isn't just a tech choice—it's a mission choice that makes coding accessible to everyone.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Zap className="w-8 h-8" />}
                            title="Lightning Fast Execution"
                            description="No server latency. Your code runs instantly on your device. Whether you're on a high-end laptop or a budget Chromebook, the experience is snappy and responsive."
                            color="from-cyan-500 to-blue-600"
                            delay={0}
                        />
                        <FeatureCard
                            icon={<Shield className="w-8 h-8" />}
                            title="Private & Secure"
                            description="Your code never leaves your browser. Experiment safely without worrying about data privacy or server-side vulnerabilities. It's your personal sandbox."
                            color="from-purple-500 to-pink-600"
                            delay={100}
                        />
                        <FeatureCard
                            icon={<Wifi className="w-8 h-8" />}
                            title="Works Offline"
                            description="Once loaded, Code2Coder works even with spotty internet. We believe access to education shouldn't be limited by bandwidth or location."
                            color="from-green-500 to-emerald-600"
                            delay={200}
                        />
                    </div>
                </div>
            </section>

            {/* Learning Path Section */}
            <section id="learning-path" className="relative z-10 py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <span className="inline-block px-4 py-1.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-sm font-bold tracking-wider uppercase mb-4">
                            Structured Curriculum
                        </span>
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6">
                            Your Path to Python Mastery
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                            From complete beginner to confident programmer, our structured curriculum guides you every step of the way with hands-on practice and real-world projects.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-6">
                        {[
                            { icon: <BookOpen className="w-6 h-6" />, title: "Fundamentals", desc: "Variables, data types, operators, and basic I/O", color: "cyan" },
                            { icon: <Code2 className="w-6 h-6" />, title: "Control Flow", desc: "Conditionals, loops, and logical thinking", color: "purple" },
                            { icon: <Target className="w-6 h-6" />, title: "Functions", desc: "Modular code, parameters, and return values", color: "green" },
                            { icon: <Rocket className="w-6 h-6" />, title: "Projects", desc: "Real-world applications and portfolio pieces", color: "orange" },
                        ].map((step, index) => (
                            <div key={index} className="learning-step relative group">
                                <div className={`bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg p-6 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 h-full transition-all group-hover:shadow-xl group-hover:-translate-y-1`}>
                                    <div className={`w-12 h-12 rounded-xl bg-${step.color}-100 dark:bg-${step.color}-900/30 text-${step.color}-600 dark:text-${step.color}-400 flex items-center justify-center mb-4`}>
                                        {step.icon}
                                    </div>
                                    <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-sm font-bold text-gray-500 dark:text-gray-400">
                                        {index + 1}
                                    </div>
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{step.title}</h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">{step.desc}</p>
                                </div>
                                {index < 3 && (
                                    <div className="hidden md:block absolute top-1/2 -right-3 z-10">
                                        <ArrowRight className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Grid - Why This Platform */}
            <section id="features" className="relative z-10 py-32 px-6 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <span className="inline-block px-4 py-1.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 text-sm font-bold tracking-wider uppercase mb-4">
                            Platform Benefits
                        </span>
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6">
                            Everything You Need to Succeed
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                            We've built the tools and features that make learning Python engaging, effective, and enjoyable.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Brain className="w-8 h-8" />}
                            title="AI-Powered Hints"
                            description="Get intelligent hints tailored to your specific code and learning style, helping you understand concepts without giving away the answer."
                            color="from-cyan-500 to-blue-600"
                            delay={0}
                        />
                        <FeatureCard
                            icon={<Code2 className="w-8 h-8" />}
                            title="Interactive Code Editor"
                            description="Write, run, and debug Python code directly in your browser with syntax highlighting, auto-completion, and real-time error detection."
                            color="from-purple-500 to-pink-600"
                            delay={50}
                        />
                        <FeatureCard
                            icon={<Trophy className="w-8 h-8" />}
                            title="Gamified Learning"
                            description="Earn stars, unlock achievements, and track your progress on leaderboards. Learning should be fun and rewarding."
                            color="from-yellow-500 to-orange-500"
                            delay={100}
                        />
                        <FeatureCard
                            icon={<Clock className="w-8 h-8" />}
                            title="Learn at Your Pace"
                            description="No deadlines, no pressure. Return to lessons anytime, practice as much as you need, and progress when you're ready."
                            color="from-green-500 to-emerald-600"
                            delay={150}
                        />
                        <FeatureCard
                            icon={<Globe className="w-8 h-8" />}
                            title="Access Anywhere"
                            description="Works on any device with a modern browser. Desktop, tablet, or phone—your learning goes where you go."
                            color="from-blue-500 to-indigo-600"
                            delay={200}
                        />
                        <FeatureCard
                            icon={<TrendingUp className="w-8 h-8" />}
                            title="Track Progress"
                            description="Detailed progress tracking helps you see how far you've come and identifies areas where you can improve."
                            color="from-pink-500 to-rose-600"
                            delay={250}
                        />
                    </div>
                </div>
            </section>

            {/* All Ages Section */}
            <section id="all-ages" className="relative z-10 py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <span className="inline-block px-4 py-1.5 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-400 text-sm font-bold tracking-wider uppercase mb-4">
                            Everyone Welcome
                        </span>
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6">
                            Perfect for All Ages
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                            Whether you're 8 or 80, Code2Coder adapts to your learning style. Programming is for everyone, and we've designed our platform with all ages in mind.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg p-8 rounded-3xl border border-gray-200/50 dark:border-gray-700/50 text-center hover:shadow-xl transition-all hover:-translate-y-1">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-4xl shadow-lg shadow-orange-500/25">
                                🧒
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Kids (8-12)</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                Fun, visual lessons that make coding feel like a game. Build confidence with instant feedback.
                            </p>
                        </div>
                        <div className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg p-8 rounded-3xl border border-gray-200/50 dark:border-gray-700/50 text-center hover:shadow-xl transition-all hover:-translate-y-1">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-4xl shadow-lg shadow-blue-500/25">
                                🎓
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Teens (13-19)</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                Level up with real-world projects. Perfect prep for AP Computer Science or just having fun.
                            </p>
                        </div>
                        <div className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg p-8 rounded-3xl border border-gray-200/50 dark:border-gray-700/50 text-center hover:shadow-xl transition-all hover:-translate-y-1">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-4xl shadow-lg shadow-purple-500/25">
                                💼
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Adults (20-59)</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                Career changers and skill builders welcome. Learn Python on your schedule, at your pace.
                            </p>
                        </div>
                        <div className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg p-8 rounded-3xl border border-gray-200/50 dark:border-gray-700/50 text-center hover:shadow-xl transition-all hover:-translate-y-1">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-4xl shadow-lg shadow-teal-500/25">
                                🧓
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Seniors (60+)</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                It's never too late to learn! Clear explanations and patient AI help at every step.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section id="faq" className="relative z-10 py-32 px-6 bg-gradient-to-b from-transparent via-green-500/5 to-transparent">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm font-bold tracking-wider uppercase mb-4">
                            Common Questions
                        </span>
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6">
                            Frequently Asked Questions
                        </h2>
                    </div>

                    <div className="space-y-6">
                        {[
                            {
                                q: "Is Code2Coder really 100% free?",
                                a: "Yes! Code2Coder is completely free to use. We believe quality education should be accessible to everyone, regardless of financial circumstances. There are no hidden fees, subscriptions, or premium tiers."
                            },
                            {
                                q: "Do I need to install anything to use Code2Coder?",
                                a: "No installation required! Code2Coder runs entirely in your web browser using Pyodide (WebAssembly-based Python). Just open the website and start coding immediately."
                            },
                            {
                                q: "What is Pyodide and how does it work?",
                                a: "Pyodide is a Python distribution that runs in your browser using WebAssembly. It provides a full Python environment, including popular libraries, without needing any server-side execution. Your code runs locally on your device."
                            },
                            {
                                q: "How does the AI tutor help me learn?",
                                a: "Our AI tutor, powered by Google Gemini, provides personalized hints, explanations, and feedback based on your specific code and questions. It helps you understand concepts without giving away answers, promoting genuine learning."
                            },
                            {
                                q: "Is my code private and secure?",
                                a: "Absolutely. Since your code runs locally in your browser (client-side), it never gets sent to any server. Your code stays on your device, ensuring complete privacy and security."
                            },
                            {
                                q: "Can I use Code2Coder on mobile devices?",
                                a: "Yes! Code2Coder is designed to work on any device with a modern web browser, including smartphones and tablets. While a larger screen provides a better coding experience, you can learn anywhere."
                            },
                        ].map((faq, index) => (
                            <details 
                                key={index}
                                className="faq-item group bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden"
                            >
                                <summary className="flex items-center justify-between p-6 cursor-pointer text-lg font-bold text-gray-900 dark:text-white hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors list-none">
                                    {faq.q}
                                    <span className="flex-shrink-0 ml-4 w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 group-open:bg-cyan-500 group-open:text-white transition-colors">
                                        <ArrowRight className="w-4 h-4 group-open:rotate-90 transition-transform" />
                                    </span>
                                </summary>
                                <div className="px-6 pb-6 text-gray-600 dark:text-gray-300 leading-relaxed">
                                    {faq.a}
                                </div>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="relative z-10 py-32 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-3xl blur-3xl opacity-20" />
                        <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 p-12 md:p-16 rounded-3xl overflow-hidden">
                            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%3E%3Cg%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23FFFFFF%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
                            
                            <div className="relative z-10">
                                <Star className="w-12 h-12 text-yellow-400 mx-auto mb-6 animate-pulse" />
                                <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                                    Ready to Start Your Coding Journey?
                                </h2>
                                <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                                    Join thousands of learners who are already mastering Python with Code2Coder. Your future in tech starts here.
                                </p>
                                <button
                                    onClick={onStart}
                                    className="group inline-flex items-center gap-3 px-12 py-5 text-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-2xl shadow-2xl shadow-cyan-500/30 transform transition-all hover:-translate-y-1 hover:shadow-cyan-500/50"
                                >
                                    <GraduationCap className="w-6 h-6" />
                                    Enter the Classroom
                                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Us Section */}
            <section className="relative z-10 px-6 pb-24">
                <div className="max-w-5xl mx-auto bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl overflow-hidden relative">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%3E%3Cg%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23FFFFFF%22%20fill-opacity%3D%220.02%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-100" />
                    <div className="text-left relative z-10">
                        <h2 className="text-3xl md:text-4xl font-bold text-yellow-300 mb-3">Need Help or Have Questions?</h2>
                        <p className="text-gray-400 text-lg">Contact our support team, report bugs, or suggest new features. We'd love to hear from you!</p>
                    </div>
                    <button
                        onClick={() => setIsContactModalOpen(true)}
                        className="relative z-10 flex items-center gap-2 px-10 py-4 text-lg font-bold bg-emerald-500 hover:bg-emerald-400 text-white rounded-full shadow-lg shadow-emerald-500/25 transition-all whitespace-nowrap"
                    >
                        <CheckCircle2 className="w-5 h-5" />
                        Contact Us
                    </button>
                </div>
            </section>

            <ContactModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} />

            {/* Footer */}
            <footer className="relative z-10 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 pt-20 pb-8 text-gray-500">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1 md:col-span-2 space-y-6">
                        <div className="flex items-center gap-3">
                            <FooterLogo className="h-12 w-auto" />
                            <span className="font-black text-2xl text-gray-800 dark:text-white tracking-tight">Code2Coder</span>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 max-w-sm text-lg">
                            Empowering the future, one line of code at a time. Free Python education for everyone.
                        </p>
                        <div className="pt-2 space-y-1">
                            <p className="font-semibold text-gray-900 dark:text-white">Bellarmine College Preparatory</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">960 W Hedding St, San Jose, CA 95126</p>
                        </div>
                    </div>

                    <nav>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-6">Connect</h3>
                        <ul className="space-y-4 text-gray-500 dark:text-gray-400">
                            <li>
                                <button 
                                    onClick={() => setIsContactModalOpen(true)} 
                                    className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                                >
                                    Contact Us
                                </button>
                            </li>
                            <li>
                                <button 
                                    onClick={() => onNavigate('about')} 
                                    className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors text-left"
                                >
                                    About the Team
                                </button>
                            </li>
                        </ul>
                    </nav>

                    <nav>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-6">Legal</h3>
                        <ul className="space-y-4 text-gray-500 dark:text-gray-400">
                            <li><a href="#" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Terms of Service</a></li>
                        </ul>
                    </nav>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-800 pt-8 text-center">
                    <p className="text-gray-400 dark:text-gray-500 text-sm">
                        © {new Date().getFullYear()} Code2Coder. All rights reserved. Built with ❤️ for learners worldwide.
                    </p>
                </div>
            </footer>

            {/* CSS Animations */}
            <style>{`
                /* Floating orb animation */
                @keyframes float {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    25% { transform: translate(30px, -30px) scale(1.05); }
                    50% { transform: translate(-20px, 20px) scale(0.95); }
                    75% { transform: translate(-30px, -20px) scale(1.02); }
                }
                
                .floating-orb {
                    animation: float var(--duration, 20s) ease-in-out infinite;
                    animation-delay: var(--delay, 0s);
                }
                
                /* Hero gradient text */
                .hero-gradient-text {
                    background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    animation: gradient-shift 5s ease-in-out infinite;
                    background-size: 200% 200%;
                }
                
                @keyframes gradient-shift {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                
                /* Stagger animations for hero elements */
                .hero-badge {
                    animation: slide-up 0.6s ease-out forwards;
                    opacity: 0;
                }
                
                .hero-title {
                    animation: slide-up 0.6s ease-out 0.1s forwards;
                    opacity: 0;
                }
                
                .hero-description {
                    animation: slide-up 0.6s ease-out 0.2s forwards;
                    opacity: 0;
                }
                
                .hero-buttons {
                    animation: slide-up 0.6s ease-out 0.3s forwards;
                    opacity: 0;
                }
                
                .hero-stats {
                    animation: slide-up 0.6s ease-out 0.4s forwards;
                    opacity: 0;
                }
                
                @keyframes slide-up {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                /* Scroll indicator animation */
                .scroll-indicator {
                    animation: fade-in 1s ease-out 1s forwards;
                    opacity: 0;
                }
                
                @keyframes fade-in {
                    to { opacity: 1; }
                }
                
                /* Feature cards entrance animation */
                .feature-card {
                    animation: card-entrance 0.6s ease-out forwards;
                    opacity: 0;
                    transform: translateY(20px);
                }
                
                @keyframes card-entrance {
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                /* Testimonial cards */
                .testimonial-card {
                    animation: card-entrance 0.6s ease-out forwards;
                    opacity: 0;
                    transform: translateY(20px);
                }
                
                /* Stat cards hover effect */
                .stat-card {
                    transition: all 0.3s ease;
                }
                
                .stat-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.15);
                }
                
                /* Learning step cards */
                .learning-step {
                    animation: card-entrance 0.6s ease-out forwards;
                    opacity: 0;
                }
                
                /* FAQ items */
                .faq-item summary::-webkit-details-marker {
                    display: none;
                }
                
                /* Smooth scrolling for the whole page */
                .mission-page {
                    scroll-behavior: smooth;
                }
                
                /* Parallax background layer */
                .parallax-layer {
                    will-change: transform;
                }
            `}</style>
        </div>
    );
};

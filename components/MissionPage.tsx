import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Zap, Brain, Shield } from 'lucide-react';
import { ContactModal } from './ContactModal';
import { AnimatedCodeBlock } from './AnimatedCodeBlock';
import { ViewState } from './Header';
import FooterLogo from '../assets/FooterLogo.svg?react';

interface MissionPageProps {
    onStart: () => void;
    onNavigate: (view: ViewState) => void;
}

const VALUE_PROPS = [
    {
        icon: <Zap className="w-5 h-5" strokeWidth={1.75} />,
        title: 'Runs in your browser',
        body: 'Pyodide compiles Python to WebAssembly so every lesson runs instantly. No installs, no setup, no servers.',
    },
    {
        icon: <Brain className="w-5 h-5" strokeWidth={1.75} />,
        title: 'AI tutor as you code',
        body: 'Stuck on a problem? Gemini gives you hints tuned to the exact code in your editor — never just the answer.',
    },
    {
        icon: <Shield className="w-5 h-5" strokeWidth={1.75} />,
        title: 'Your code stays yours',
        body: 'Everything executes on your device. Nothing leaves the browser. Experiment freely, fail safely.',
    },
];

const CURRICULUM = [
    { n: '01', title: 'Fundamentals', body: 'Variables, types, operators, I/O.' },
    { n: '02', title: 'Control flow', body: 'Conditionals, loops, logic.' },
    { n: '03', title: 'Functions', body: 'Reusable code with parameters and return values.' },
    { n: '04', title: 'Projects', body: 'Build small, real programs you can show off.' },
];

export const MissionPage: React.FC<MissionPageProps> = ({ onStart, onNavigate }) => {
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);

    return (
        <div className="mission-page min-h-full bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans antialiased">
            <Helmet>
                <title>Code2Coder — Learn Python in your browser, free</title>
                <meta name="description" content="Free, AI-guided Python lessons that run in your browser. No installs, no setup. Built for students, by students." />
                <meta property="og:title" content="Code2Coder — Learn Python in your browser, free" />
                <meta property="og:description" content="Free, AI-guided Python lessons that run in your browser. No installs, no setup." />
                <meta property="og:type" content="website" />
                <link rel="canonical" href="https://code2coder.com" />
            </Helmet>

            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_60%_at_50%_-5%,rgba(6,182,212,0.16),transparent_70%)] dark:bg-[radial-gradient(ellipse_75%_60%_at_50%_-5%,rgba(34,211,238,0.18),transparent_70%)]" />
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{
                    backgroundImage: `linear-gradient(rgba(148,163,184,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.6) 1px, transparent 1px)`,
                    backgroundSize: '64px 64px',
                    maskImage: 'radial-gradient(ellipse 80% 60% at 50% 30%, black, transparent)',
                    WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 30%, black, transparent)',
                }} />
            </div>

            <section className="relative z-10 px-6 pt-32 pb-32 md:pt-40 md:pb-40">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-[1.15fr_1fr] gap-20 lg:gap-24 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2.5 mb-10 px-3 py-1.5 rounded-full bg-cyan-500/10 dark:bg-cyan-400/10 border border-cyan-500/20 dark:border-cyan-400/20 text-xs font-semibold tracking-[0.08em] uppercase text-cyan-700 dark:text-cyan-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.7)]" />
                            Free forever · No installs · No accounts needed
                        </div>

                        <h1 className="text-6xl md:text-7xl lg:text-[5.5rem] font-semibold tracking-[-0.035em] leading-[1.02] text-gray-900 dark:text-white">
                            Learn Python.
                            <br />
                            Right in your{' '}
                            <span className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">browser.</span>
                        </h1>

                        <p className="mt-10 text-xl md:text-2xl text-gray-500 dark:text-gray-400 leading-relaxed max-w-xl">
                            A clean place to learn Python — with a real editor, an AI tutor that
                            gives hints instead of answers, and lessons that run the moment you press play.
                        </p>

                        <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                            <button
                                onClick={onStart}
                                className="group inline-flex items-center gap-2.5 px-7 py-4 text-base font-semibold bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all"
                            >
                                Start coding
                                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
                            </button>
                            <button
                                onClick={() => onNavigate('schools')}
                                className="text-base font-semibold text-gray-600 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                            >
                                For schools →
                            </button>
                            <button
                                onClick={() => onNavigate('about')}
                                className="text-base font-semibold text-gray-600 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                            >
                                About the project →
                            </button>
                        </div>
                    </div>

                    <div className="relative lg:pl-4">
                        <div className="absolute -inset-8 bg-cyan-500/[0.10] dark:bg-cyan-500/[0.14] rounded-3xl blur-3xl" />
                        <div className="relative">
                            <AnimatedCodeBlock />
                        </div>
                    </div>
                </div>
            </section>

            <section className="relative z-10 px-6 py-24 md:py-28 border-t border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-12 md:gap-14">
                        {VALUE_PROPS.map((p) => (
                            <div key={p.title} className="group">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-500/10 dark:bg-cyan-400/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 dark:border-cyan-400/20 mb-6 group-hover:scale-105 transition-transform">
                                    {p.icon}
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 tracking-tight">
                                    {p.title}
                                </h3>
                                <p className="text-base text-gray-500 dark:text-gray-400 leading-relaxed">
                                    {p.body}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="relative z-10 px-6 py-28 md:py-36 border-t border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto grid md:grid-cols-[1fr_1.4fr] gap-20 md:gap-28">
                    <div>
                        <div className="text-xs font-semibold tracking-[0.08em] uppercase text-cyan-600 dark:text-cyan-400 mb-5">
                            The path
                        </div>
                        <h2 className="text-4xl md:text-5xl font-semibold tracking-[-0.025em] text-gray-900 dark:text-white leading-[1.1]">
                            From your first line of code
                            <span className="text-gray-400 dark:text-gray-500"> to your first real project.</span>
                        </h2>
                        <p className="mt-7 text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
                            Lessons are short, hands-on, and ordered so each one builds on the last. Skip ahead any time — your progress saves automatically.
                        </p>
                    </div>

                    <div className="md:pt-2">
                        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                            {CURRICULUM.map((step) => (
                                <li key={step.n} className="flex items-baseline gap-8 py-7 first:pt-0 group">
                                    <span className="font-mono text-sm text-cyan-600 dark:text-cyan-400 tabular-nums font-semibold">
                                        {step.n}
                                    </span>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {step.title}
                                        </h3>
                                        <p className="text-base text-gray-500 dark:text-gray-400 mt-1">
                                            {step.body}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            <section className="relative z-10 px-6 py-32 md:py-40 border-t border-gray-200 dark:border-gray-700">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-4xl md:text-6xl font-semibold tracking-[-0.025em] text-gray-900 dark:text-white leading-[1.05]">
                        Open the editor.
                        <br />
                        <span className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">Write your first line.</span>
                    </h2>
                    <p className="mt-8 text-lg md:text-xl text-gray-500 dark:text-gray-400">
                        Free forever. No credit card. No download.
                    </p>
                    <div className="mt-12">
                        <button
                            onClick={onStart}
                            className="group inline-flex items-center gap-2.5 px-8 py-4 text-base font-semibold bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all"
                        >
                            Start coding
                            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
                        </button>
                    </div>
                </div>
            </section>

            <ContactModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} />

            <footer className="relative z-10 border-t border-gray-200 dark:border-gray-700 px-6 pt-20 pb-12">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-[1.8fr_1fr_1fr] gap-14 mb-16">
                        <div>
                            <div className="flex items-center gap-3 mb-5">
                                <FooterLogo className="h-8 w-auto" />
                                <span className="font-semibold text-lg tracking-tight text-gray-900 dark:text-white">Code2Coder</span>
                            </div>
                            <p className="text-base text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed">
                                Free Python education for everyone. Built by students at Bellarmine College Preparatory.
                            </p>
                        </div>

                        <nav>
                            <h4 className="text-[10px] font-semibold tracking-[0.08em] uppercase text-gray-400 dark:text-gray-500 mb-5">
                                Project
                            </h4>
                            <ul className="space-y-3.5 text-base">
                                <li>
                                    <button
                                        onClick={() => onNavigate('schools')}
                                        className="text-gray-600 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                                    >
                                        Schools using Code2Coder
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => onNavigate('schools')}
                                        className="text-gray-600 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                                    >
                                        Register your school
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => onNavigate('about')}
                                        className="text-gray-600 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                                    >
                                        About the team
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => setIsContactModalOpen(true)}
                                        className="text-gray-600 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                                    >
                                        Contact us
                                    </button>
                                </li>
                            </ul>
                        </nav>

                        <nav>
                            <h4 className="text-[10px] font-semibold tracking-[0.08em] uppercase text-gray-400 dark:text-gray-500 mb-5">
                                Legal
                            </h4>
                            <ul className="space-y-3.5 text-base">
                                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Privacy</a></li>
                                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Terms</a></li>
                            </ul>
                        </nav>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-8 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-500">
                            © {new Date().getFullYear()} Code2Coder
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">
                            Bellarmine College Preparatory · San Jose, CA
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

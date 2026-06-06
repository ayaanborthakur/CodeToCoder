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
        icon: <Zap className="w-4 h-4" strokeWidth={1.75} />,
        title: 'Runs in your browser',
        body: 'Pyodide compiles Python to WebAssembly so every lesson runs instantly. No installs, no setup, no servers.',
    },
    {
        icon: <Brain className="w-4 h-4" strokeWidth={1.75} />,
        title: 'AI tutor as you code',
        body: 'Stuck on a problem? Gemini gives you hints tuned to the exact code in your editor — never just the answer.',
    },
    {
        icon: <Shield className="w-4 h-4" strokeWidth={1.75} />,
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
        <div className="mission-page min-h-full bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-slate-100 font-sans antialiased">
            <Helmet>
                <title>Code2Coder — Learn Python in your browser, free</title>
                <meta name="description" content="Free, AI-guided Python lessons that run in your browser. No installs, no setup. Built for students, by students." />
                <meta property="og:title" content="Code2Coder — Learn Python in your browser, free" />
                <meta property="og:description" content="Free, AI-guided Python lessons that run in your browser. No installs, no setup." />
                <meta property="og:type" content="website" />
                <link rel="canonical" href="https://code2coder.com" />
            </Helmet>

            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(6,182,212,0.10),transparent_70%)] dark:bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(6,182,212,0.12),transparent_70%)]" />
                <div className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]" style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)`,
                    backgroundSize: '56px 56px',
                    maskImage: 'radial-gradient(ellipse 80% 60% at 50% 30%, black, transparent)',
                    WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 30%, black, transparent)',
                }} />
            </div>

            <section className="relative z-10 px-6 pt-28 pb-24 md:pt-36 md:pb-32">
                <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_1fr] gap-16 lg:gap-20 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 mb-8 text-xs font-medium tracking-wider uppercase text-slate-500 dark:text-slate-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                            Free forever · No installs · No accounts needed
                        </div>

                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-[-0.035em] leading-[1.02] text-slate-900 dark:text-white">
                            Learn Python.
                            <br />
                            Right in your
                            <br />
                            browser.
                        </h1>

                        <p className="mt-8 text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
                            A clean place to learn Python — with a real editor, an AI tutor that
                            gives hints instead of answers, and lessons that run the moment you press play.
                        </p>

                        <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                            <button
                                onClick={onStart}
                                className="group inline-flex items-center gap-2 px-5 py-3 text-sm font-medium bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
                            >
                                Start coding
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                            </button>
                            <button
                                onClick={() => onNavigate('about')}
                                className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                            >
                                About the project →
                            </button>
                        </div>
                    </div>

                    <div className="relative lg:pl-4">
                        <div className="absolute -inset-6 bg-cyan-500/[0.06] dark:bg-cyan-500/[0.08] rounded-3xl blur-2xl" />
                        <div className="relative">
                            <AnimatedCodeBlock />
                        </div>
                    </div>
                </div>
            </section>

            <section className="relative z-10 px-6 py-20 border-t border-slate-200/70 dark:border-slate-800/70">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-10 md:gap-12">
                        {VALUE_PROPS.map((p) => (
                            <div key={p.title}>
                                <div className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 mb-5">
                                    {p.icon}
                                </div>
                                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2 tracking-tight">
                                    {p.title}
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                    {p.body}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="relative z-10 px-6 py-24 md:py-32 border-t border-slate-200/70 dark:border-slate-800/70">
                <div className="max-w-6xl mx-auto grid md:grid-cols-[1fr_1.4fr] gap-16 md:gap-24">
                    <div>
                        <div className="text-xs font-medium tracking-wider uppercase text-slate-500 dark:text-slate-400 mb-4">
                            The path
                        </div>
                        <h2 className="text-3xl md:text-4xl font-semibold tracking-[-0.02em] text-slate-900 dark:text-white leading-tight">
                            From your first line of code
                            <span className="text-slate-400 dark:text-slate-500"> to your first real project.</span>
                        </h2>
                        <p className="mt-6 text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                            Lessons are short, hands-on, and ordered so each one builds on the last. Skip ahead any time — your progress saves automatically.
                        </p>
                    </div>

                    <div className="md:pt-2">
                        <ul className="divide-y divide-slate-200/70 dark:divide-slate-800/70">
                            {CURRICULUM.map((step) => (
                                <li key={step.n} className="flex items-baseline gap-6 py-5 first:pt-0">
                                    <span className="font-mono text-xs text-slate-400 dark:text-slate-600 tabular-nums">
                                        {step.n}
                                    </span>
                                    <div className="flex-1">
                                        <h3 className="text-base font-medium text-slate-900 dark:text-white">
                                            {step.title}
                                        </h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                            {step.body}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            <section className="relative z-10 px-6 py-24 md:py-32 border-t border-slate-200/70 dark:border-slate-800/70">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl md:text-5xl font-semibold tracking-[-0.025em] text-slate-900 dark:text-white leading-[1.05]">
                        Open the editor.
                        <br />
                        <span className="text-slate-400 dark:text-slate-500">Write your first line.</span>
                    </h2>
                    <p className="mt-6 text-base md:text-lg text-slate-600 dark:text-slate-400">
                        Free forever. No credit card. No download.
                    </p>
                    <div className="mt-10">
                        <button
                            onClick={onStart}
                            className="group inline-flex items-center gap-2 px-6 py-3.5 text-sm font-medium bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
                        >
                            Start coding
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                        </button>
                    </div>
                </div>
            </section>

            <ContactModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} />

            <footer className="relative z-10 border-t border-slate-200/70 dark:border-slate-800/70 px-6 pt-16 pb-10">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-[1.8fr_1fr_1fr] gap-12 mb-14">
                        <div>
                            <div className="flex items-center gap-2.5 mb-4">
                                <FooterLogo className="h-7 w-auto" />
                                <span className="font-semibold text-base tracking-tight text-slate-900 dark:text-white">Code2Coder</span>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
                                Free Python education for everyone. Built by students at Bellarmine College Preparatory.
                            </p>
                        </div>

                        <nav>
                            <h4 className="text-xs font-semibold tracking-wider uppercase text-slate-500 dark:text-slate-500 mb-4">
                                Project
                            </h4>
                            <ul className="space-y-3 text-sm">
                                <li>
                                    <button
                                        onClick={() => onNavigate('about')}
                                        className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                                    >
                                        About the team
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => setIsContactModalOpen(true)}
                                        className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                                    >
                                        Contact us
                                    </button>
                                </li>
                            </ul>
                        </nav>

                        <nav>
                            <h4 className="text-xs font-semibold tracking-wider uppercase text-slate-500 dark:text-slate-500 mb-4">
                                Legal
                            </h4>
                            <ul className="space-y-3 text-sm">
                                <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Privacy</a></li>
                                <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Terms</a></li>
                            </ul>
                        </nav>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-8 border-t border-slate-200/70 dark:border-slate-800/70">
                        <p className="text-xs text-slate-500 dark:text-slate-500">
                            © {new Date().getFullYear()} Code2Coder
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-500">
                            Bellarmine College Preparatory · San Jose, CA
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

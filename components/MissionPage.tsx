
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ContactModal } from './ContactModal';
import { ViewState } from './Header';

interface MissionPageProps {
    onStart: () => void;
    onNavigate: (view: ViewState) => void;
}

import FooterLogo from '../assets/FooterLogo.svg?react';
import { Check, Zap, Users, Shield, Wifi } from 'lucide-react';

export const MissionPage: React.FC<MissionPageProps> = ({ onStart, onNavigate }) => {
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);

    const scrollToMission = (e: React.MouseEvent) => {
        e.preventDefault();
        const missionSection = document.getElementById('mission');
        if (missionSection) {
            missionSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-full bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 flex flex-col font-sans transition-colors duration-300">
            <Helmet>
                <title>Learn Python with AI</title>
            </Helmet>
            {/* Hero Section */}
            <header className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-20 pb-32 animate-fade-in max-w-5xl mx-auto">
                <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 text-sm font-semibold tracking-wide">
                    Zero Setup • Instant Execution • AI-Powered
                </div>
                <h1 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tight text-gray-900 dark:text-white leading-tight">
                    Master Python with <br /> <span
                        className="text-cyan-600 dark:text-cyan-400 font-extrabold"
                        style={{
                            background: 'linear-gradient(to right, #06b6d4, #2563eb)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            display: 'inline-block',
                            paddingBottom: '0.15em',
                            overflow: 'visible',
                            backgroundImage: 'linear-gradient(to right, #06b6d4, #2563eb)',
                        }}
                    >AI-First Tutoring</span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-2xl mb-12 leading-relaxed">
                    Run Python instantly in your browser with Pyodide. Get personalized guidance from Google Gemini AI. 
                    No downloads, no servers, no barriers—just pure learning.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <button
                        onClick={onStart}
                        className="px-8 py-4 text-lg font-bold bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl shadow-lg shadow-cyan-500/30 transform transition-all hover:-translate-y-1"
                    >
                        Start Learning for Free
                    </button>
                    <button
                        type="button"
                        onClick={scrollToMission}
                        className="px-8 py-4 text-lg font-bold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                    >
                        Our Mission
                    </button>
                </div>
            </header>

            {/* Mission Section */}
            <section id="mission" className="bg-gray-50 dark:bg-gray-800/50 py-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-16 items-center mb-20">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                                Why CodeToCoder?
                            </h2>
                            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                                In today's digital age, programming skills are a gateway to economic empowerment. However, quality education often comes with a high price tag.
                            </p>
                            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                                **CodeToCoder** was built to dismantle these barriers. We provide a free, high-quality, AI-powered learning environment designed to guide you from your first line of code to building real-world applications. Our focus isn't just on syntax, but on community growth and individual potential.
                            </p>
                        </div>
                        <div className="relative">
                            <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl opacity-20 blur-xl"></div>
                            <div className="relative bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="mt-1 bg-green-100 dark:bg-green-900/30 p-2 rounded-lg h-fit text-green-600 dark:text-green-400">
                                            <Check className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">100% Free Education</h3>
                                            <p className="text-gray-500 dark:text-gray-400">No paywalls, no subscriptions. Just learning.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="mt-1 bg-cyan-100 dark:bg-cyan-900/30 p-2 rounded-lg h-fit text-cyan-600 dark:text-cyan-400">
                                            <Zap className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">AI-Powered Mentorship</h3>
                                            <p className="text-gray-500 dark:text-gray-400">Instant feedback and guidance whenever you're stuck.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="mt-1 bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg h-fit text-purple-600 dark:text-purple-400 flex items-center justify-center">
                                            <Users className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Community Impact</h3>
                                            <p className="text-gray-500 dark:text-gray-400">Designed to uplift and empower underrepresented groups.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Features Grid: The "How" */}
                    <div className="mb-20">
                        <div className="text-center mb-16">
                            <span className="text-cyan-600 dark:text-cyan-400 font-bold tracking-wider uppercase text-sm mb-2 block">Powered by WebAssembly</span>
                            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white">
                                Why Client-Side?
                            </h2>
                            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                                We use <strong>Pyodide</strong> to run Python directly in your browser. This isn't just a tech choice—it's a mission choice.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow">
                                <div className="w-14 h-14 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl flex items-center justify-center text-cyan-600 dark:text-cyan-400 mb-6">
                                    <Zap className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Lightning Fast</h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    No server latency. Your code runs instantly on your device. Whether you're on a high-end laptop or a budget Chromebook, the experience is snappy and responsive.
                                </p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow">
                                <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6">
                                    <Shield className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Private & Secure</h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    Your code never leaves your browser. You can experiment safely without worrying about data privacy or server-side vulnerabilities. It's your sandbox.
                                </p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow">
                                <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400 mb-6">
                                    <Wifi className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Offline Capable</h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    Once loaded, CodeToCoder works even with spotty internet. We believe access to education shouldn't be limited by bandwidth.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* Call to Action */}
            <section className="py-24 px-6 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8">Ready to start your journey?</h2>
                <button
                    onClick={onStart}
                    className="px-10 py-4 text-xl font-bold bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full shadow-xl hover:transform hover:scale-105 transition-all"
                >
                    Enter Classroom
                </button>
            </section>

            {/* Contact Us Section */}
            <section className="px-6 pb-24">
                <div className="max-w-5xl mx-auto bg-[#1e232f] rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
                    <div className="text-left">
                        <h2 className="text-3xl md:text-4xl font-bold text-[#fef08a] mb-2">Need Help?</h2>
                        <p className="text-gray-400 text-lg">Contact our support team or report an issue.</p>
                    </div>
                    <button
                        onClick={() => setIsContactModalOpen(true)}
                        className="px-8 py-3 text-lg font-bold bg-[#10b981] hover:bg-[#059669] text-white rounded-full shadow-lg transition-colors whitespace-nowrap"
                    >
                        Contact Us
                    </button>
                </div>
            </section>

            <ContactModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} />

            <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 pt-16 pb-8 text-gray-500">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-2 space-y-4">
                        <div className="flex items-center gap-3">
                            <FooterLogo className="h-10 w-auto" />
                            <span className="font-bold text-2xl text-gray-800 dark:text-white tracking-tight">CodeToCoder</span>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                            Empowering the future, one line of code at a time.
                        </p>
                        <div className="pt-2 space-y-1">
                            <p className="font-semibold text-gray-900 dark:text-white">Bellarmine College Preparatory</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">960 W Hedding St, San Jose, CA 95126</p>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Connect</h3>
                        <ul className="space-y-3 text-gray-500 dark:text-gray-400">
                            <li><a href="#" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Contact Us</a></li>
                            <li><button onClick={() => onNavigate('about')} className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors text-left">About the Team</button></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Legal</h3>
                        <ul className="space-y-3 text-gray-500 dark:text-gray-400">
                            <li><a href="#" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Terms of Service</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-800 pt-8 text-center">
                    <p className="text-gray-400 dark:text-gray-500 text-sm">{new Date().getFullYear()} CodeToCoder</p>
                </div>
            </footer>

            <style>{`
        @keyframes fade-in {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fade-in 0.8s ease-out forwards;
        }
      `}</style>
        </div>
    );
};

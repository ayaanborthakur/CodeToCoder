import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    Mail,
    Lock,
    User,
    ArrowRight,
    Check,
    Loader2,
    AlertCircle,
    Sparkles,
    Code2,
    Terminal,
    Cpu,
    GraduationCap,
    BookOpen,
    Copy,
    CheckCheck,
    Users,
} from 'lucide-react';
import { isUsernameAvailable, claimUsername, validateUsername } from '../services/usernameService';
import { createClassroom, joinClassroom } from '../services/classroomService';
import type { UserRole, Classroom } from '../types';
import { Helmet } from 'react-helmet-async';

type Step = 'method' | 'credentials' | 'username' | 'role' | 'setup';

export const SignupPage: React.FC = () => {
    const { loginWithGoogle, register, user, refreshUser } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState<Step>('method');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Role state
    const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

    // Form State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');

    // Username Validation State
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [usernameError, setUsernameError] = useState<string | null>(null);
    const [isUsernameValid, setIsUsernameValid] = useState(false);

    // Classroom setup state (teacher)
    const [className, setClassName] = useState('');
    const [createdClassroom, setCreatedClassroom] = useState<Classroom | null>(null);
    const [codeCopied, setCodeCopied] = useState(false);

    // Join code state (student)
    const [joinCode, setJoinCode] = useState('');
    const [joinError, setJoinError] = useState<string | null>(null);
    const [joinLoading, setJoinLoading] = useState(false);

    // Handle already-authenticated users landing on /signup.
    // We only auto-route from the 'method' step (the entry point). During the
    // active multi-step flow the individual step handlers drive navigation —
    // otherwise refreshUser() (which populates user.username after claimUsername)
    // would trip the dashboard redirect and bypass the role picker / setup steps.
    useEffect(() => {
        if (!user || step !== 'method') return;
        if (user.username) {
            // Fully onboarded already (e.g. restored session) — send to dashboard.
            navigate('/dashboard');
        } else {
            // Authenticated but no username yet (e.g. Google auth fired on the
            // method screen, or session restored mid-onboarding) — pick a username.
            setStep('username');
        }
    }, [user, step, navigate]);

    // ── Auth handlers ─────────────────────────────────────────────────────────

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError(null);
        try {
            await loginWithGoogle();
            setStep('username');
        } catch (err: any) {
            const code = err?.code;
            if (code === 'auth/account-exists-with-different-credential' || code === 'auth/email-already-in-use') {
                setError('An account already exists with this email. Redirecting to login...');
                setTimeout(() => navigate('/?login=1'), 2000);
            } else {
                setError(err.message || 'Failed to sign in with Google');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEmailSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await register(email, password, name);
            setStep('username');
        } catch (err: any) {
            const code = err?.code;
            if (code === 'auth/email-already-in-use') {
                setError('An account with this email already exists. Redirecting to login...');
                setTimeout(() => navigate('/?login=1'), 2000);
            } else {
                setError(err.message || 'Failed to create account');
            }
        } finally {
            setLoading(false);
        }
    };

    // ── Username submit ───────────────────────────────────────────────────────

    const handleUsernameSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !isUsernameValid) return;

        setLoading(true);
        setError(null);
        try {
            await claimUsername(user.id, username);
            await refreshUser();
            // Ask user what type of account they want next
            setStep('role');
        } catch (err: any) {
            setError(err.message || 'Failed to set username');
        } finally {
            setLoading(false);
        }
    };

    // ── Teacher: create classroom ─────────────────────────────────────────────

    const handleCreateClassroom = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !className.trim()) return;

        setLoading(true);
        setError(null);
        try {
            const classroom = await createClassroom(user.id, user.name, className.trim());
            setCreatedClassroom(classroom);
        } catch (err: any) {
            setError(err.message || 'Failed to create classroom');
        } finally {
            setLoading(false);
        }
    };

    const copyJoinCode = () => {
        if (!createdClassroom) return;
        navigator.clipboard.writeText(createdClassroom.joinCode).catch(() => {});
        setCodeCopied(true);
        setTimeout(() => setCodeCopied(false), 2000);
    };

    // ── Student: join classroom ───────────────────────────────────────────────

    const handleJoinClassroom = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !joinCode.trim()) return;

        setJoinLoading(true);
        setJoinError(null);
        try {
            await joinClassroom(user.id, joinCode.trim());
            await refreshUser();
            navigate('/dashboard');
        } catch (err: any) {
            setJoinError(err.message || 'Invalid join code');
        } finally {
            setJoinLoading(false);
        }
    };

    // ── Debounced username check ──────────────────────────────────────────────

    useEffect(() => {
        const check = async () => {
            if (!username) {
                setUsernameError(null);
                setIsUsernameValid(false);
                return;
            }
            const fmt = validateUsername(username);
            if (!fmt.valid) {
                setUsernameError(fmt.error || 'Invalid username');
                setIsUsernameValid(false);
                return;
            }
            setIsCheckingUsername(true);
            setUsernameError(null);
            try {
                const available = await isUsernameAvailable(username);
                if (!available) {
                    setUsernameError('Username is already taken');
                    setIsUsernameValid(false);
                } else {
                    setIsUsernameValid(true);
                }
            } catch {
                setUsernameError('Error checking availability');
                setIsUsernameValid(false);
            } finally {
                setIsCheckingUsername(false);
            }
        };
        const t = setTimeout(check, 500);
        return () => clearTimeout(t);
    }, [username]);

    // ── Progress bar ─────────────────────────────────────────────────────────

    // Map internal step names to progress-bar indices (0-3)
    const stepIndex = (() => {
        switch (step) {
            case 'method':
            case 'credentials': return 0;
            case 'username':    return 1;
            case 'role':        return 2;
            case 'setup':       return 3;
        }
    })();

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen w-full flex bg-white dark:bg-gray-950 text-gray-900 dark:text-white overflow-hidden font-sans">
            <Helmet>
                <title>Sign Up - Code2Coder</title>
            </Helmet>

            {/* ── Left panel ─────────────────────────────────────────── */}
            <div className="hidden lg:flex w-1/2 relative bg-gray-900 overflow-hidden items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-purple-900/40 to-cyan-900/40 z-0" />
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0 mix-blend-overlay" />
                <div className="absolute inset-0 z-0 overflow-hidden">
                    <div className="absolute top-1/4 left-1/4 animate-float-slow">
                        <Terminal className="w-24 h-24 text-cyan-500/20" />
                    </div>
                    <div className="absolute bottom-1/3 right-1/4 animate-float-delayed">
                        <Code2 className="w-32 h-32 text-purple-500/20" />
                    </div>
                    <div className="absolute top-1/3 right-1/3 animate-pulse-slow">
                        <Sparkles className="w-16 h-16 text-yellow-500/10" />
                    </div>
                    <div className="absolute bottom-1/4 left-1/3 animate-float-slow">
                        <Cpu className="w-20 h-20 text-blue-500/20" />
                    </div>
                </div>
                <div className="relative z-10 p-12 max-w-lg">
                    <h1 className="text-5xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 drop-shadow-sm">
                        Build your future in code.
                    </h1>
                    <p className="text-xl text-gray-300 leading-relaxed mb-8">
                        Join thousands of developers mastering Python through AI-powered interactive lessons and real-time feedback.
                    </p>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 text-gray-400">
                            <div className="w-12 h-12 rounded-full bg-cyan-900/30 flex items-center justify-center border border-cyan-800">
                                <Sparkles className="w-6 h-6 text-cyan-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white">AI-Powered Learning</h3>
                                <p className="text-sm">Get instant help and code reviews.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 text-gray-400">
                            <div className="w-12 h-12 rounded-full bg-purple-900/30 flex items-center justify-center border border-purple-800">
                                <Code2 className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white">Interactive Playground</h3>
                                <p className="text-sm">Run code directly in your browser.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 text-gray-400">
                            <div className="w-12 h-12 rounded-full bg-green-900/30 flex items-center justify-center border border-green-800">
                                <GraduationCap className="w-6 h-6 text-green-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white">Classroom Tools</h3>
                                <p className="text-sm">Teachers create classes. Students join with a code.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Right panel ────────────────────────────────────────── */}
            <div className="w-full lg:w-1/2 flex flex-col relative z-10 bg-white dark:bg-gray-950">
                <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 md:px-16 lg:px-24 max-w-2xl mx-auto w-full">

                    {/* Mobile header */}
                    <div className="lg:hidden mb-8 text-center">
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-purple-600">Code2Coder</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">Master Python with AI</p>
                    </div>

                    {/* Progress bar — 4 steps */}
                    <div className="flex gap-2 mb-10">
                        {[0, 1, 2, 3].map((i) => (
                            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                                i < stepIndex  ? 'bg-cyan-200 dark:bg-cyan-900' :
                                i === stepIndex ? 'bg-cyan-500' :
                                                  'bg-gray-100 dark:bg-gray-800'
                            }`} />
                        ))}
                    </div>

                    <div className="animate-fade-in-up">

                        {/* ── Step 1: Sign-up method ───────────────────────── */}
                        {step === 'method' && (
                            <div className="space-y-6">
                                <div className="text-center mb-8">
                                    <h2 className="text-3xl font-bold mb-2">Get Started</h2>
                                    <p className="text-gray-500 dark:text-gray-400">Create your free account</p>
                                </div>

                                <button
                                    onClick={handleGoogleSignIn}
                                    disabled={loading}
                                    className="w-full py-4 px-6 flex items-center justify-center gap-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-cyan-500 dark:hover:border-cyan-500 rounded-2xl text-lg font-semibold transition-all transform hover:-translate-y-1 hover:shadow-lg group"
                                >
                                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                    <span>Continue with Google</span>
                                    <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity text-cyan-500 ml-auto" />
                                </button>

                                <div className="relative py-4">
                                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-gray-800" /></div>
                                    <div className="relative flex justify-center"><span className="bg-white dark:bg-gray-950 px-4 text-sm text-gray-500">or</span></div>
                                </div>

                                <button
                                    onClick={() => setStep('credentials')}
                                    className="w-full py-4 px-6 flex items-center justify-center gap-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-700 dark:hover:to-gray-800 rounded-2xl text-lg font-semibold transition-all"
                                >
                                    <Mail className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                                    <span>Sign up with Email</span>
                                </button>

                                <p className="text-center text-sm text-gray-500 mt-4">
                                    Already have an account?{' '}
                                    <button onClick={() => navigate('/?login=1')} className="text-cyan-600 dark:text-cyan-400 font-bold hover:underline">
                                        Log in
                                    </button>
                                </p>
                            </div>
                        )}

                        {/* ── Step 2b: Email credentials ───────────────────── */}
                        {step === 'credentials' && (
                            <form onSubmit={handleEmailSignup} className="space-y-5">
                                <div className="mb-6">
                                    <button type="button" onClick={() => setStep('method')} className="text-sm text-gray-500 hover:text-cyan-500 flex items-center gap-1 mb-4">
                                        ← Back
                                    </button>
                                    <h2 className="text-3xl font-bold">Create Profile</h2>
                                    <p className="text-gray-500 dark:text-gray-400">Enter your details to create an account</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1.5 ml-1 text-gray-700 dark:text-gray-300">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                                            placeholder="John Doe" required />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1.5 ml-1 text-gray-700 dark:text-gray-300">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                                            placeholder="john@example.com" required />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1.5 ml-1 text-gray-700 dark:text-gray-300">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                                            placeholder="••••••••" required minLength={6} />
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-300 text-sm flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5 shrink-0" />{error}
                                    </div>
                                )}

                                <button type="submit" disabled={loading}
                                    className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 mt-4 disabled:opacity-70 flex items-center justify-center gap-2">
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Create Account</span>}
                                </button>
                            </form>
                        )}

                        {/* ── Step 3: Username ─────────────────────────────── */}
                        {step === 'username' && (
                            <div className="space-y-6 animate-fade-in-up">
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl rotate-3 flex items-center justify-center mx-auto mb-6 text-white shadow-xl shadow-purple-500/20">
                                        <Sparkles className="w-8 h-8" />
                                    </div>
                                    <h2 className="text-3xl font-bold">Choose your Identity</h2>
                                    <p className="text-gray-500 dark:text-gray-400">Pick a unique username for the leaderboard</p>
                                </div>

                                <form onSubmit={handleUsernameSubmit}>
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium mb-1.5 ml-1 text-gray-700 dark:text-gray-300">Username</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">@</span>
                                            <input
                                                type="text"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                                className={`w-full pl-10 pr-12 py-4 text-lg font-mono rounded-xl bg-gray-50 dark:bg-gray-900 border outline-none transition-all ${
                                                    usernameError ? 'focus:ring-red-500 focus:border-red-500 border-red-200' :
                                                    isUsernameValid ? 'focus:ring-green-500 focus:border-green-500 border-green-200 dark:border-green-800' :
                                                    'border-gray-200 dark:border-gray-800 focus:ring-cyan-500 focus:border-cyan-500'
                                                } focus:ring-2`}
                                                placeholder="python_wizard"
                                                maxLength={20}
                                                minLength={3}
                                                autoFocus
                                            />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                {isCheckingUsername ? <Loader2 className="w-5 h-5 text-gray-400 animate-spin" /> :
                                                 isUsernameValid  ? <Check className="w-5 h-5 text-green-500" /> :
                                                 usernameError    ? <AlertCircle className="w-5 h-5 text-red-500" /> : null}
                                            </div>
                                        </div>
                                        {usernameError && <p className="mt-2 text-sm text-red-500 ml-1">{usernameError}</p>}
                                        {isUsernameValid && (
                                            <p className="mt-2 text-sm text-green-600 dark:text-green-400 ml-1 flex items-center gap-1">
                                                <Sparkles className="w-3 h-3" /> Username available!
                                            </p>
                                        )}
                                    </div>

                                    {error && (
                                        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-300 text-sm">
                                            {error}
                                        </div>
                                    )}

                                    <button type="submit" disabled={loading || !isUsernameValid}
                                        className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/25 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Continue →'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* ── Step 4: Account type ─────────────────────────── */}
                        {step === 'role' && (
                            <div className="space-y-6 animate-fade-in-up">
                                <div className="text-center mb-8">
                                    <h2 className="text-3xl font-bold mb-2">What's your role?</h2>
                                    <p className="text-gray-500 dark:text-gray-400">This helps us personalise your experience</p>
                                </div>

                                <button
                                    onClick={() => { setSelectedRole('teacher'); setStep('setup'); }}
                                    className="w-full p-6 flex items-start gap-5 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 hover:border-cyan-500 dark:hover:border-cyan-500 rounded-2xl transition-all group text-left"
                                >
                                    <div className="w-14 h-14 rounded-xl bg-cyan-100 dark:bg-cyan-900/40 flex items-center justify-center shrink-0 group-hover:bg-cyan-200 dark:group-hover:bg-cyan-900/70 transition-colors">
                                        <GraduationCap className="w-7 h-7 text-cyan-600 dark:text-cyan-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-bold">I'm a Teacher</h3>
                                            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-cyan-500 transition-colors" />
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            Create a classroom and share a join code with your students. Track their progress.
                                        </p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => { setSelectedRole('student'); setStep('setup'); }}
                                    className="w-full p-6 flex items-start gap-5 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 rounded-2xl transition-all group text-left"
                                >
                                    <div className="w-14 h-14 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center shrink-0 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/70 transition-colors">
                                        <BookOpen className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-bold">I'm a Student</h3>
                                            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            Learn Python with AI-powered lessons. Join a classroom with a code from your teacher.
                                        </p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="w-full py-3 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors text-center"
                                >
                                    Skip for now
                                </button>
                            </div>
                        )}

                        {/* ── Step 5: Role-specific setup ──────────────────── */}
                        {step === 'setup' && selectedRole === 'teacher' && (
                            <div className="space-y-6 animate-fade-in-up">
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-xl shadow-cyan-500/20">
                                        <GraduationCap className="w-8 h-8" />
                                    </div>
                                    <h2 className="text-3xl font-bold">Create your Classroom</h2>
                                    <p className="text-gray-500 dark:text-gray-400">Give your class a name — we'll generate a join code your students can use</p>
                                </div>

                                {!createdClassroom ? (
                                    <form onSubmit={handleCreateClassroom} className="space-y-5">
                                        <div>
                                            <label className="block text-sm font-medium mb-1.5 ml-1 text-gray-700 dark:text-gray-300">Class Name</label>
                                            <div className="relative">
                                                <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={className}
                                                    onChange={(e) => setClassName(e.target.value)}
                                                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                                                    placeholder="e.g. Grade 8 Python, Period 3"
                                                    required
                                                    maxLength={60}
                                                    autoFocus
                                                />
                                            </div>
                                        </div>

                                        {error && (
                                            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-300 text-sm flex items-center gap-2">
                                                <AlertCircle className="w-5 h-5 shrink-0" />{error}
                                            </div>
                                        )}

                                        <button type="submit" disabled={loading || !className.trim()}
                                            className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2">
                                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Create Classroom <ArrowRight className="w-5 h-5" /></>}
                                        </button>

                                        <button type="button" onClick={() => navigate('/dashboard')}
                                            className="w-full py-3 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                                            Skip for now
                                        </button>
                                    </form>
                                ) : (
                                    /* ── Join code reveal ─── */
                                    <div className="space-y-6">
                                        <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 border border-cyan-200 dark:border-cyan-800 text-center">
                                            <p className="text-sm font-semibold text-cyan-700 dark:text-cyan-300 mb-3 uppercase tracking-wider">
                                                Class Join Code
                                            </p>
                                            <div className="flex items-center justify-center gap-3 mb-4">
                                                <span className="text-5xl font-black font-mono tracking-[0.3em] text-gray-900 dark:text-white">
                                                    {createdClassroom.joinCode}
                                                </span>
                                                <button
                                                    onClick={copyJoinCode}
                                                    className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-cyan-50 dark:hover:bg-cyan-900/30 transition-colors"
                                                    title="Copy code"
                                                >
                                                    {codeCopied ? <CheckCheck className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-gray-500" />}
                                                </button>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Share this code with your students. They'll enter it when they sign up.
                                            </p>
                                        </div>

                                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                <span className="font-semibold text-gray-900 dark:text-white">Class:</span> {createdClassroom.className}
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => navigate('/dashboard')}
                                            className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2">
                                            Go to Dashboard <ArrowRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {step === 'setup' && selectedRole === 'student' && (
                            <div className="space-y-6 animate-fade-in-up">
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-xl shadow-purple-500/20">
                                        <BookOpen className="w-8 h-8" />
                                    </div>
                                    <h2 className="text-3xl font-bold">Join a Classroom</h2>
                                    <p className="text-gray-500 dark:text-gray-400">Enter the 6-letter code your teacher gave you</p>
                                </div>

                                <form onSubmit={handleJoinClassroom} className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5 ml-1 text-gray-700 dark:text-gray-300">Join Code</label>
                                        <input
                                            type="text"
                                            value={joinCode}
                                            onChange={(e) => {
                                                setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''));
                                                setJoinError(null);
                                            }}
                                            className={`w-full px-4 py-4 text-3xl font-black font-mono tracking-[0.4em] text-center rounded-xl bg-gray-50 dark:bg-gray-900 border focus:ring-2 outline-none transition-all ${
                                                joinError
                                                    ? 'border-red-400 focus:ring-red-500'
                                                    : 'border-gray-200 dark:border-gray-800 focus:ring-purple-500 focus:border-purple-500'
                                            }`}
                                            placeholder="ABCDEF"
                                            maxLength={6}
                                            autoFocus
                                            autoCapitalize="characters"
                                        />
                                        {joinError && (
                                            <p className="mt-2 text-sm text-red-500 ml-1 flex items-center gap-1">
                                                <AlertCircle className="w-4 h-4" /> {joinError}
                                            </p>
                                        )}
                                    </div>

                                    <button type="submit" disabled={joinLoading || joinCode.length !== 6}
                                        className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/25 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2">
                                        {joinLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Join Classroom <ArrowRight className="w-5 h-5" /></>}
                                    </button>

                                    <button type="button" onClick={() => navigate('/dashboard')}
                                        className="w-full py-3 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                                        I don't have a code — skip for now
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* Fallback: setup reached without a role selected */}
                        {step === 'setup' && !selectedRole && (
                            <div className="text-center">
                                <p className="text-gray-500 mb-4">Something went wrong. Please pick your account type.</p>
                                <button onClick={() => setStep('role')} className="text-cyan-500 underline">Choose role</button>
                            </div>
                        )}

                    </div>
                </div>

                <div className="p-6 text-center text-xs text-gray-400 border-t border-gray-100 dark:border-gray-900">
                    &copy; 2024 Code2Coder. All rights reserved.
                </div>
            </div>

            <style>{`
                @keyframes float-slow {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                @keyframes float-delayed {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-15px); }
                }
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-float-slow { animation: float-slow 6s ease-in-out infinite; }
                .animate-float-delayed { animation: float-delayed 7s ease-in-out infinite 1s; }
                .animate-pulse-slow { animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
                .animate-fade-in-up { animation: fade-in-up 0.4s ease-out forwards; }
            `}</style>
        </div>
    );
};

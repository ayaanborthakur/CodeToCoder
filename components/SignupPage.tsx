import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, ArrowRight, BookOpen, Check, CheckCheck, Copy, GraduationCap, Loader2, Mail, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '../assets/logo.svg?react';
import { isUsernameAvailable, claimUsername, validateUsername } from '../services/usernameService';
import { createClassroom, joinClassroom, setUserRole } from '../services/classroomService';
import { listSchools, requestSchoolJoin, markSchoolPromptSeen } from '../services/schoolService';
import type { UserRole, Classroom, School } from '../types';
import { Helmet } from 'react-helmet-async';

type Step = 'method' | 'credentials' | 'username' | 'role' | 'school' | 'setup';

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

    // School-picker state (student step between role and setup).
    const [schools, setSchools] = useState<School[]>([]);
    const [schoolsLoading, setSchoolsLoading] = useState(false);
    const [schoolFilter, setSchoolFilter] = useState('');
    const [schoolSubmitting, setSchoolSubmitting] = useState(false);

    // Lazy-load the public school list the first time we enter the school step.
    useEffect(() => {
        if (step !== 'school' || schools.length > 0 || schoolsLoading) return;
        setSchoolsLoading(true);
        listSchools()
            .then(setSchools)
            .catch(() => { /* non-fatal — picker shows empty + skip option */ })
            .finally(() => setSchoolsLoading(false));
    }, [step, schools.length, schoolsLoading]);

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

    // ── Role pick ─────────────────────────────────────────────────────────────

    /**
     * Persist the chosen role to the user's Firestore doc *immediately* — not
     * just in local state. Previously the role was only written as a side-effect
     * of createClassroom / joinClassroom, so a teacher who skipped classroom
     * setup never got role:'teacher' on their doc. That left them unable to
     * register a school (the Firestore create rule requires role == 'teacher')
     * and hid the "Register your school" button. Writing it here fixes both.
     */
    const handlePickRole = async (role: UserRole) => {
        setSelectedRole(role);
        if (user) {
            try {
                await setUserRole(user.id, role);
                await refreshUser();
            } catch {
                /* non-fatal: role also gets written on classroom create/join */
            }
        }
        setStep(role === 'teacher' ? 'setup' : 'school');
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

    /**
     * Student-side school pick. Writes a pending join request to the user
     * doc and advances to the 'setup' step. The teacher who registered the
     * school approves the request in their dashboard's pending queue.
     */
    const handlePickSchool = async (school: School) => {
        if (!user) { setStep('setup'); return; }
        setSchoolSubmitting(true);
        setError(null);
        try {
            await requestSchoolJoin(user, school.id);
            // They've answered the "are you part of a school?" question, so the
            // one-time post-login prompt should never fire for them.
            await markSchoolPromptSeen(user.id);
            await refreshUser();
        } catch (err: any) {
            // Non-fatal — they can still complete signup without a school.
            setError(err?.message || 'Could not send the school join request. You can try again later from your profile.');
        } finally {
            setSchoolSubmitting(false);
            setStep('setup');
        }
    };

    // Skip the school step — record that they've seen the question so the
    // one-time post-login prompt doesn't ask again.
    const handleSkipSchool = async () => {
        if (user) {
            try { await markSchoolPromptSeen(user.id); await refreshUser(); } catch { /* non-fatal */ }
        }
        setStep('setup');
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

    // ── Step bookkeeping ──────────────────────────────────────────────────────

    // Four phases shown to the user. The student-only 'school' step belongs to
    // the last phase, along with joining a class.
    const phase = (() => {
        switch (step) {
            case 'method':
            case 'credentials': return { n: 1, label: 'Create your account' };
            case 'username':    return { n: 2, label: 'Choose a username' };
            case 'role':        return { n: 3, label: 'Tell us how you’ll use it' };
            case 'school':
            case 'setup':       return { n: 4, label: 'Set up your class' };
        }
    })();

    const input = 'w-full px-3.5 py-2.5 rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-600/40 focus:border-cyan-600';
    const label = 'block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1.5';
    const primary = 'no-hover w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-cyan-700 hover:bg-cyan-800 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed';
    const quiet = 'no-hover w-full py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-50';

    const ErrorNote: React.FC<{ children: React.ReactNode }> = ({ children }) => (
        <p role="alert" className="flex items-start gap-2 rounded-md border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 px-3 py-2.5 text-sm text-red-700 dark:text-red-300">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />{children}
        </p>
    );

    const Heading: React.FC<{ title: string; body?: React.ReactNode }> = ({ title, body }) => (
        <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h1>
            {body && <p className="mt-1.5 text-slate-600 dark:text-slate-400">{body}</p>}
        </div>
    );

    const RoleOption: React.FC<{ icon: React.ReactNode; title: string; body: string; onClick: () => void }> = ({ icon, title, body, onClick }) => (
        <button onClick={onClick} className="no-hover group w-full flex items-start gap-4 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-left hover:border-cyan-600 dark:hover:border-cyan-500">
            <span className="mt-0.5 text-slate-500 dark:text-slate-400 group-hover:text-cyan-700 dark:group-hover:text-cyan-400">{icon}</span>
            <span className="flex-1">
                <span className="block font-semibold text-slate-900 dark:text-white">{title}</span>
                <span className="block mt-0.5 text-sm text-slate-600 dark:text-slate-400">{body}</span>
            </span>
            <ArrowRight className="w-4 h-4 mt-1 text-slate-400 group-hover:text-cyan-700 dark:group-hover:text-cyan-400" />
        </button>
    );

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen w-full flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-sans">
            <Helmet>
                <title>Create an account | Code2Coder</title>
            </Helmet>

            <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                <Link to="/" className="no-hover flex items-center gap-2">
                    <Logo className="h-7 w-auto" />
                    <span className="font-semibold">Code2Coder</span>
                </Link>
                {step === 'method' || step === 'credentials' ? (
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                        Have an account?{' '}
                        <button onClick={() => navigate('/?login=1')} className="no-hover font-semibold text-cyan-700 dark:text-cyan-400 hover:underline underline-offset-2">Log in</button>
                    </span>
                ) : null}
            </header>

            <main className="flex-1 w-full max-w-md mx-auto px-6 py-10 sm:py-14">
                <div className="mb-8">
                    <div className="flex gap-1.5" aria-hidden="true">
                        {[1, 2, 3, 4].map(n => (
                            <span key={n} className={`h-1 flex-1 rounded-full ${n <= phase.n ? 'bg-cyan-700 dark:bg-cyan-500' : 'bg-slate-200 dark:bg-slate-800'}`} />
                        ))}
                    </div>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Step {phase.n} of 4 · {phase.label}</p>
                </div>

                {/* 1. Sign-up method */}
                {step === 'method' && (
                    <div>
                        <Heading title="Create your account" body="Free for students and teachers. No credit card, nothing to install." />
                        <div className="space-y-3">
                            <button onClick={handleGoogleSignIn} disabled={loading} className="no-hover w-full inline-flex items-center justify-center gap-3 px-4 py-2.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50">
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                )}
                                Continue with Google
                            </button>
                            <div className="flex items-center gap-3 py-1 text-sm text-slate-500"><span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />or<span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" /></div>
                            <button onClick={() => setStep('credentials')} className="no-hover w-full inline-flex items-center justify-center gap-3 px-4 py-2.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800">
                                <Mail className="w-5 h-5 text-slate-500" /> Sign up with email
                            </button>
                        </div>
                        {error && <div className="mt-4"><ErrorNote>{error}</ErrorNote></div>}
                        <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
                            By creating an account you agree to the <Link to="/terms" className="underline underline-offset-2">terms of use</Link> and <Link to="/privacy" className="underline underline-offset-2">privacy policy</Link>.
                        </p>
                    </div>
                )}

                {/* 1b. Email and password */}
                {step === 'credentials' && (
                    <form onSubmit={handleEmailSignup} className="space-y-5">
                        <button type="button" onClick={() => { setStep('method'); setError(null); }} className="no-hover inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                            <ArrowLeft className="w-4 h-4" /> Other ways to sign up
                        </button>
                        <Heading title="Sign up with email" />
                        <div>
                            <label htmlFor="su-name" className={label}>Full name</label>
                            <input id="su-name" type="text" value={name} onChange={(e) => setName(e.target.value)} className={input} autoComplete="name" required autoFocus />
                        </div>
                        <div>
                            <label htmlFor="su-email" className={label}>Email</label>
                            <input id="su-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={input} autoComplete="email" required />
                        </div>
                        <div>
                            <label htmlFor="su-password" className={label}>Password</label>
                            <input id="su-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={input} autoComplete="new-password" required minLength={6} aria-describedby="su-password-hint" />
                            <p id="su-password-hint" className="mt-1.5 text-sm text-slate-500">At least 6 characters.</p>
                        </div>
                        {error && <ErrorNote>{error}</ErrorNote>}
                        <button type="submit" disabled={loading} className={primary}>
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create account'}
                        </button>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            By creating an account you agree to the <Link to="/terms" className="underline underline-offset-2">terms of use</Link> and <Link to="/privacy" className="underline underline-offset-2">privacy policy</Link>.
                        </p>
                    </form>
                )}

                {/* 2. Username */}
                {step === 'username' && (
                    <form onSubmit={handleUsernameSubmit} className="space-y-5">
                        <Heading title="Choose a username" body="It’s shown on the leaderboard instead of your name. Use lowercase letters, numbers and underscores." />
                        <div>
                            <label htmlFor="su-username" className={label}>Username</label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">@</span>
                                <input
                                    id="su-username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                    className={`${input} pl-8 pr-10 font-mono ${usernameError ? '!border-red-400' : isUsernameValid ? '!border-emerald-500' : ''}`}
                                    placeholder="ada_codes"
                                    maxLength={20}
                                    minLength={3}
                                    autoFocus
                                    aria-describedby="su-username-status"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                                    {isCheckingUsername ? <Loader2 className="w-4 h-4 text-slate-400 animate-spin" /> : isUsernameValid ? <Check className="w-4 h-4 text-emerald-600" /> : null}
                                </span>
                            </div>
                            <p id="su-username-status" className={`mt-1.5 text-sm ${usernameError ? 'text-red-600 dark:text-red-400' : isUsernameValid ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500'}`}>
                                {usernameError ?? (isUsernameValid ? 'Available' : '3 to 20 characters.')}
                            </p>
                        </div>
                        {error && <ErrorNote>{error}</ErrorNote>}
                        <button type="submit" disabled={loading || !isUsernameValid} className={primary}>
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Continue'}
                        </button>
                    </form>
                )}

                {/* 3. Role */}
                {step === 'role' && (
                    <div>
                        <Heading title="How will you use Code2Coder?" body="You can change this later from your profile." />
                        <div className="space-y-3">
                            <RoleOption icon={<BookOpen className="w-5 h-5" />} title="I’m learning" body="Work through the Python course, practice and build projects. Join your teacher’s class with a code if you have one." onClick={() => handlePickRole('student')} />
                            <RoleOption icon={<GraduationCap className="w-5 h-5" />} title="I’m teaching" body="Create classes, assign lessons and grade students’ work from a gradebook." onClick={() => handlePickRole('teacher')} />
                        </div>
                        <button onClick={() => navigate('/dashboard')} className={`${quiet} mt-4`}>Skip for now</button>
                    </div>
                )}

                {/* 3b. Students: school */}
                {step === 'school' && (
                    <div>
                        <Heading title="Find your school" body="If your school uses Code2Coder, pick it so your teacher can confirm you. Learning on your own? Skip this." />
                        <label htmlFor="su-school" className="sr-only">Search schools</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input id="su-school" type="search" value={schoolFilter} onChange={(e) => setSchoolFilter(e.target.value)} className={`${input} pl-9`} placeholder="School name or city" disabled={schoolSubmitting} autoFocus />
                        </div>
                        <div className="mt-3 max-h-64 overflow-y-auto rounded-md border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
                            {schoolsLoading && <p className="px-4 py-5 text-sm text-slate-500">Loading schools…</p>}
                            {!schoolsLoading && schools.length === 0 && <p className="px-4 py-5 text-sm text-slate-500">No schools are registered yet.</p>}
                            {!schoolsLoading && schools.length > 0 && (() => {
                                const q = schoolFilter.trim().toLowerCase();
                                const matches = q
                                    ? schools.filter(s => [s.name, s.city, s.state, s.country].some(v => v?.toLowerCase().includes(q)))
                                    : schools;
                                if (matches.length === 0) return <p className="px-4 py-5 text-sm text-slate-500">No schools match “{schoolFilter}”.</p>;
                                return matches.map(s => (
                                    <button key={s.id} onClick={() => handlePickSchool(s)} disabled={schoolSubmitting} className="no-hover w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-900 disabled:opacity-50 flex items-center justify-between gap-3">
                                        <span className="min-w-0">
                                            <span className="block font-medium text-slate-900 dark:text-white truncate">{s.name}</span>
                                            {(s.city || s.state || s.country) && <span className="block text-sm text-slate-500 truncate">{[s.city, s.state, s.country].filter(Boolean).join(', ')}</span>}
                                        </span>
                                        <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                    </button>
                                ));
                            })()}
                        </div>
                        {error && <div className="mt-4"><ErrorNote>{error}</ErrorNote></div>}
                        <button onClick={handleSkipSchool} disabled={schoolSubmitting} className={`${quiet} mt-3`}>Skip, I’m not part of a school</button>
                    </div>
                )}

                {/* 4. Teachers: first class */}
                {step === 'setup' && selectedRole === 'teacher' && (
                    !createdClassroom ? (
                        <form onSubmit={handleCreateClassroom} className="space-y-5">
                            <Heading title="Name your first class" body="Students join with a six-letter code we’ll create for it. You can add more classes later." />
                            <div>
                                <label htmlFor="su-class" className={label}>Class name</label>
                                <input id="su-class" type="text" value={className} onChange={(e) => setClassName(e.target.value)} className={input} placeholder="e.g. Intro to Python, Period 3" required maxLength={60} autoFocus />
                            </div>
                            {error && <ErrorNote>{error}</ErrorNote>}
                            <button type="submit" disabled={loading || !className.trim()} className={primary}>
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create class'}
                            </button>
                            <button type="button" onClick={() => navigate('/dashboard')} className={quiet}>Skip for now</button>
                        </form>
                    ) : (
                        <div>
                            <Heading title="Your class is ready" body={<>Share this code with the students in <span className="font-semibold text-slate-900 dark:text-white">{createdClassroom.className}</span>. They enter it when they sign up.</>} />
                            <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-6 text-center">
                                <div className="text-sm font-medium text-slate-500">Join code</div>
                                <div className="mt-2 flex items-center justify-center gap-3">
                                    <span className="text-4xl font-bold font-mono tracking-[0.25em]">{createdClassroom.joinCode}</span>
                                    <button onClick={copyJoinCode} className="no-hover p-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-800" aria-label="Copy join code">
                                        {codeCopied ? <CheckCheck className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5 text-slate-500" />}
                                    </button>
                                </div>
                            </div>
                            <button onClick={() => navigate('/dashboard')} className={`${primary} mt-6`}>Go to your dashboard <ArrowRight className="w-4 h-4" /></button>
                        </div>
                    )
                )}

                {/* 4. Students: join a class */}
                {step === 'setup' && selectedRole === 'student' && (
                    <form onSubmit={handleJoinClassroom} className="space-y-5">
                        <Heading title="Join your class" body="Enter the six-letter code from your teacher." />
                        <div>
                            <label htmlFor="su-join" className={label}>Join code</label>
                            <input
                                id="su-join"
                                type="text"
                                value={joinCode}
                                onChange={(e) => { setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z]/g, '')); setJoinError(null); }}
                                className={`${input} text-2xl font-bold font-mono tracking-[0.4em] text-center ${joinError ? '!border-red-400' : ''}`}
                                placeholder="ABCDEF"
                                maxLength={6}
                                autoFocus
                                autoCapitalize="characters"
                            />
                            {joinError && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{joinError}</p>}
                        </div>
                        <button type="submit" disabled={joinLoading || joinCode.length !== 6} className={primary}>
                            {joinLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Join class'}
                        </button>
                        <button type="button" onClick={() => navigate('/dashboard')} className={quiet}>I don’t have a code yet</button>
                    </form>
                )}

                {step === 'setup' && !selectedRole && (
                    <div>
                        <Heading title="Choose how you’ll use Code2Coder" />
                        <button onClick={() => setStep('role')} className={primary}>Continue</button>
                    </div>
                )}
            </main>

            <footer className="px-6 py-5 border-t border-slate-200 dark:border-slate-800 text-sm text-slate-500 flex flex-wrap justify-center gap-x-5 gap-y-1">
                <span>© {new Date().getFullYear()} Code2Coder</span>
                <Link to="/privacy" className="hover:text-slate-800 dark:hover:text-slate-200">Privacy</Link>
                <Link to="/terms" className="hover:text-slate-800 dark:hover:text-slate-200">Terms</Link>
            </footer>
        </div>
    );
};

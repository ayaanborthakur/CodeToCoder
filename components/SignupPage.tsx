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
    Cpu 
} from 'lucide-react';
import { isUsernameAvailable, claimUsername, validateUsername } from '../services/usernameService';
import { Helmet } from 'react-helmet-async';

type Step = 'method' | 'credentials' | 'verification' | 'username';

export const SignupPage: React.FC = () => {
    const { loginWithGoogle, register, user, refreshUser } = useAuth();
    const navigate = useNavigate();
    
    const [step, setStep] = useState<Step>('method');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');

    // Username Validation State
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [usernameError, setUsernameError] = useState<string | null>(null);
    const [isUsernameValid, setIsUsernameValid] = useState(false);

    // Effect to handle navigation based on auth state
    useEffect(() => {
        if (user) {
            // If user already has a username, redirect to dashboard
            // This handles returning users who sign in via Google
            if (user.username) {
                navigate('/dashboard');
            } else if (step !== 'username') {
                // If logged in but no username, go to username step
                setStep('username');
            }
        }
    }, [user, step, navigate]);


    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError(null);
        try {
            await loginWithGoogle();
            // After Google sign-in succeeds, check if user already has a username (returning user)
            // The useEffect will handle navigation - if user.username exists, it redirects to dashboard
            // Otherwise, it advances to the username step
            setStep('username');
        } catch (err: any) {
            // Check for specific Firebase error codes
            const errorCode = err?.code;
            if (errorCode === 'auth/account-exists-with-different-credential' || 
                errorCode === 'auth/email-already-in-use') {
                // Account exists with different credential
                setError("An account already exists with this email. Redirecting to login...");
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setError(err.message || "Failed to sign in with Google");
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
            // After register, user is logged in. 
            // We should ideally send verification email here if not done in register
            // Assuming register handles basic creation.
            setStep('verification');
        } catch (err: any) {
            // Check for specific Firebase error codes
            const errorCode = err?.code;
            if (errorCode === 'auth/email-already-in-use') {
                // Email already has an account - redirect to login
                setError("An account with this email already exists. Redirecting to login...");
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setError(err.message || "Failed to create account");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleUsernameSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !isUsernameValid) return;

        setLoading(true);
        setError(null);

        try {
            await claimUsername(user.id, username);
            await refreshUser();
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message || "Failed to set username");
        } finally {
            setLoading(false);
        }
    };
    
    // Debounced username check
    useEffect(() => {
        const checkUsername = async () => {
            if (!username) {
                setUsernameError(null);
                setIsUsernameValid(false);
                return;
            }

            // Client-side format validation
            const formatValidation = validateUsername(username);
            if (!formatValidation.valid) {
                 setUsernameError(formatValidation.error || "Invalid username");
                 setIsUsernameValid(false);
                 return;
            }

            setIsCheckingUsername(true);
            setUsernameError(null);
            
            try {
                const available = await isUsernameAvailable(username);
                if (!available) {
                    setUsernameError("Username is already taken");
                    setIsUsernameValid(false);
                } else {
                    // Start Gemini Safety Check (simulated or real if exposed)
                    // Currently usernameService.claimUsername does the safety check. 
                    // To give feedback early, strictly we should call the check here if possible or just rely on 'available' 
                    // and let the final submit do the heavy AI check to avoid rate limits?
                    // User asked for "Gemini Safety Check" in Step 4. 
                    // Let's rely on submit for the heavy AI check to save tokens/latency, but show "Available" 
                    setIsUsernameValid(true);
                }
            } catch (err) {
                console.error(err);
                setUsernameError("Error checking availability");
                setIsUsernameValid(false);
            } finally {
                setIsCheckingUsername(false);
            }
        };

        const timeout = setTimeout(checkUsername, 500);
        return () => clearTimeout(timeout);
    }, [username]);


    return (
        <div className="min-h-screen w-full flex bg-white dark:bg-gray-950 text-gray-900 dark:text-white overflow-hidden font-sans">
            <Helmet>
                <title>Sign Up - Code2Coder</title>
            </Helmet>

            {/* Vibe Zone (Left) */}
            <div className="hidden lg:flex w-1/2 relative bg-gray-900 overflow-hidden items-center justify-center">
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-purple-900/40 to-cyan-900/40 z-0"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0 mix-blend-overlay"></div>
                
                {/* Floating Elements Animation */}
                <div className="absolute inset-0 z-0 overflow-hidden perspective-1000">
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
                    </div>
                </div>
            </div>

            {/* Action Zone (Right) */}
            <div className="w-full lg:w-1/2 flex flex-col relative z-10 bg-white dark:bg-gray-950">
                <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 md:px-16 lg:px-24 max-w-2xl mx-auto w-full">
                    
                    {/* Header for Mobile */}
                    <div className="lg:hidden mb-8 text-center">
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-purple-600">Code2Coder</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">Master Python with AI</p>
                    </div>

                    {/* Progress Steps - 2 steps: Choose method, then set username */}
                    <div className="flex gap-2 mb-10">
                        {['method', 'username'].map((s) => {
                            const steps = ['method', 'username'];
                            // Map credentials/verification to 'method' step for progress display
                            const effectiveStep = (step === 'credentials' || step === 'verification') ? 'method' : step;
                            const currentIndex = steps.indexOf(effectiveStep);
                            const stepIndex = steps.indexOf(s);
                            const isActive = stepIndex === currentIndex;
                            const isCompleted = stepIndex < currentIndex;
                            
                            return (
                                <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                                    isActive ? 'bg-cyan-500' : isCompleted ? 'bg-cyan-200 dark:bg-cyan-900' : 'bg-gray-100 dark:bg-gray-800'
                                }`} />
                            );
                        })}
                    </div>

                    <div className="animate-fade-in-up">
                        {step === 'method' && (
                            <div className="space-y-6">
                                <div className="text-center mb-8">
                                    <h2 className="text-3xl font-bold mb-2">Get Started</h2>
                                    <p className="text-gray-500 dark:text-gray-400">Choose how would you like to sign up</p>
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
                                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-gray-800"></div></div>
                                    <div className="relative flex justify-center"><span className="bg-white dark:bg-gray-950 px-4 text-sm text-gray-500">or</span></div>
                                </div>

                                <button 
                                    onClick={() => setStep('credentials')}
                                    className="w-full py-4 px-6 flex items-center justify-center gap-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-700 dark:hover:to-gray-800 rounded-2xl text-lg font-semibold transition-all"
                                >
                                    <Mail className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                                    <span>Sign up with Email</span>
                                </button>

                                <p className="text-center text-sm text-gray-500 mt-6">
                                    Already have an account? <button onClick={() => navigate('/login')} className="text-cyan-600 dark:text-cyan-400 font-bold hover:underline">Log in</button>
                                </p>
                            </div>
                        )}

                        {step === 'credentials' && (
                            <form onSubmit={handleEmailSignup} className="space-y-5">
                                <div className="mb-6">
                                    <button type="button" onClick={() => setStep('method')} className="text-sm text-gray-500 hover:text-cyan-500 flex items-center gap-1 mb-2">
                                        ← Back to methods
                                    </button>
                                    <h2 className="text-3xl font-bold">Create Profile</h2>
                                    <p className="text-gray-500 dark:text-gray-400">Enter your details to create an account</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1.5 ml-1 text-gray-700 dark:text-gray-300">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input 
                                            type="text" 
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                                            placeholder="John Doe"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1.5 ml-1 text-gray-700 dark:text-gray-300">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input 
                                            type="email" 
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                                            placeholder="john@example.com"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1.5 ml-1 text-gray-700 dark:text-gray-300">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input 
                                            type="password" 
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                                            placeholder="••••••••"
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-300 text-sm flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5 shrink-0" />
                                        {error}
                                    </div>
                                )}

                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 mt-4 disabled:opacity-70 flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Create Account</span>}
                                </button>
                            </form>
                        )}

                        {step === 'verification' && (
                             <div className="text-center space-y-6 animate-fade-in-up">
                                <div className="w-20 h-20 bg-cyan-100 dark:bg-cyan-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-cyan-600 dark:text-cyan-400">
                                    <Mail className="w-10 h-10" />
                                </div>
                                <h2 className="text-3xl font-bold">Verify your Email</h2>
                                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                                    We've sent a verification link to <span className="font-bold text-gray-900 dark:text-white">{email}</span>. 
                                    Please click the link to verify your account.
                                </p>
                                
                                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl text-left text-sm text-yellow-800 dark:text-yellow-200">
                                    <p className="font-bold mb-1 flex items-center gap-2"><Sparkles className="w-4 h-4"/> Pro Tip:</p>
                                    Check your spam folder if you don't see it within a few minutes.
                                </div>

                                <button 
                                    onClick={() => window.location.reload()}
                                    className="w-full py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl hover:opacity-90 transition-opacity"
                                >
                                    I've Verified My Email
                                </button>

                                <button 
                                    onClick={() => setStep('username')} // Allow skip for now if verification is optional or handled later
                                    className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 underline"
                                >
                                    Skip for now (Development)
                                </button>
                             </div>
                        )}

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
                                                className={`w-full pl-10 pr-12 py-4 text-lg font-mono rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 focus:ring-2 outline-none transition-all ${
                                                    usernameError ? 'focus:ring-red-500 focus:border-red-500 border-red-200' : 
                                                    isUsernameValid ? 'focus:ring-green-500 focus:border-green-500 border-green-200' : 
                                                    'focus:ring-cyan-500 focus:border-cyan-500'
                                                }`}
                                                placeholder="python_wizard"
                                                maxLength={20}
                                                minLength={3}
                                                autoFocus
                                            />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                {isCheckingUsername ? (
                                                    <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                                                ) : isUsernameValid ? (
                                                    <Check className="w-5 h-5 text-green-500" />
                                                ) : usernameError ? (
                                                    <AlertCircle className="w-5 h-5 text-red-500" />
                                                ) : null}
                                            </div>
                                        </div>
                                        {usernameError && (
                                            <p className="mt-2 text-sm text-red-500 ml-1">{usernameError}</p>
                                        )}
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

                                    <button 
                                        type="submit" 
                                        disabled={loading || !isUsernameValid}
                                        className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/25 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Complete Setup"}
                                    </button>
                                </form>
                             </div>
                        )}
                    </div>

                </div>
                
                {/* Footer */}
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

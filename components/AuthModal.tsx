
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
        if (mode === 'login') {
            await login(email, password);
        } else {
            if (!name.trim()) throw new Error("Name is required");
            await register(email, password, name);
        }
        onClose();
    } catch (err: any) {
        setError(err.message || "Authentication failed");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 max-w-md w-full border border-gray-200 dark:border-gray-700 animate-scale-in" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </h2>

        {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 rounded-lg text-sm font-medium">
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
             <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
               <input 
                 type="text" 
                 value={name}
                 onChange={e => setName(e.target.value)}
                 className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-cyan-500 outline-none text-gray-900 dark:text-white transition-all"
                 placeholder="Your Name"
               />
             </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-cyan-500 outline-none text-gray-900 dark:text-white transition-all"
                placeholder="hello@example.com"
                required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-cyan-500 outline-none text-gray-900 dark:text-white transition-all"
                placeholder="••••••••"
                required
                minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg shadow-lg shadow-cyan-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          >
            {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Processing...
                </span>
            ) : (
                mode === 'login' ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
                {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
                <button 
                    onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); }}
                    className="ml-2 font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
                >
                    {mode === 'login' ? 'Sign Up' : 'Sign In'}
                </button>
            </p>
        </div>
      </div>
       <style>{`
        @keyframes scale-in {
            0% { transform: scale(0.95); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
            animation: scale-in 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

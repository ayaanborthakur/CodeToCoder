
import React, { useEffect, useState } from 'react';

interface LoadingScreenProps {
  status?: {
    auth: boolean;
    progress: boolean;
    playground: boolean;
    quizzes: boolean;
    lesson: boolean;
  };
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ status }) => {
  const [showSlowMessage, setShowSlowMessage] = useState(false);

  useEffect(() => {
    // Show slow network message after 8 seconds
    const timer = setTimeout(() => setShowSlowMessage(true), 8000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center z-[9999] transition-colors duration-300">
      
      {/* Animated Logo Container */}
      <div className="relative w-24 h-24 mb-12">
        {/* Pulsing Glow */}
        <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-2xl animate-pulse-slow"></div>
        
        {/* Rotating Outer Ring */}
        <div className="absolute inset-0 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
        
        {/* Inner Static/Logo Element */}
        <div className="absolute inset-4 bg-white dark:bg-gray-900 rounded-full shadow-lg flex items-center justify-center p-4 border border-gray-100 dark:border-gray-800 z-10">
           <svg 
             viewBox="0 0 24 24" 
             className="w-full h-full text-transparent bg-clip-text bg-gradient-to-br from-cyan-500 to-blue-600 animate-gradient-xy fill-current"
           >
             <path fill="currentColor" d="M14.25 2.25H9.75v3.75h4.5v-3.75zM5.63 4.88L2.25 8.25l2.65 2.65 3.38-3.37-2.65-2.65zM18.37 4.88l-2.65 2.65 3.38 3.37 2.65-2.65-3.38-3.37zM2.25 15.75l3.38 3.38 2.65-2.65-3.38-3.38-2.65 2.65zM18.37 19.13l3.38-3.38-2.65-2.65-3.38 3.38 2.65 2.65zM12 9c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
           </svg>
        </div>
      </div>

      {/* Loading Text */}
      <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent mb-6 tracking-tight">
        Code2Coder
      </h2>

      {/* Status Indicators */}
      {status && (
        <div className="flex gap-2 mb-8">
          <StatusDot active={!status.auth} label="Auth" />
          <StatusDot active={!status.progress} label="Data" />
          <StatusDot active={!status.playground || !status.quizzes} label="Assets" />
        </div>
      )}

      {/* Slow Message (Conditional) */}
      <div className={`transition-all duration-500 overflow-hidden ${showSlowMessage ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
        <p className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800/50 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-800">
          Taking longer than usual... hang tight! 🚀
        </p>
      </div>

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

const StatusDot: React.FC<{ active: boolean; label: string }> = ({ active, label }) => (
  <div className="flex flex-col items-center gap-2 w-16">
    <div className={`w-2 h-2 rounded-full transition-all duration-500 ${active ? 'bg-cyan-500 animate-ping' : 'bg-green-500'}`}></div>
    <span className={`text-[10px] font-medium uppercase tracking-wider transition-colors duration-300 ${active ? 'text-cyan-600 dark:text-cyan-400' : 'text-green-600 dark:text-green-400'}`}>
      {label}
    </span>
  </div>
);

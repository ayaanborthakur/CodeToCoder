
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export type ViewState = 'home' | 'classroom' | 'playground' | 'practice' | 'reference';

interface HeaderProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  stars: number;
  starTargetRef?: React.RefObject<HTMLDivElement | null>;
  onOpenAuth: () => void;
}
import Logo from '../assets/logo.svg?react';

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.75 9.75 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
  </svg>
);

const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-yellow-500">
    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
  </svg>
);

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
);

const MenuIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, theme, setTheme, stars, starTargetRef, onOpenAuth }) => {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const NavLink: React.FC<{ view: ViewState; label: string }> = ({ view, label }) => (
    <button
      onClick={() => {
        onNavigate(view);
        setIsMobileMenuOpen(false);
      }}
      className={`px-3 py-2 rounded-md text-sm font-semibold transition-colors ${
        currentView === view
          ? 'bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400'
          : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
      }`}
    >
      {label}
    </button>
  );

  const handleOpenProfile = () => {
    // Dispatch a custom event to be caught by App.tsx
    window.dispatchEvent(new CustomEvent('openProfile'));
  };

  const scrollToMission = () => {
      onNavigate('home');
      setIsMobileMenuOpen(false);
      setTimeout(() => {
          const missionSection = document.getElementById('mission');
          if (missionSection) {
              missionSection.scrollIntoView({ behavior: 'smooth' });
          }
      }, 100);
  };

  return (
    <>
      <header className="h-20 flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 sm:px-6 relative z-50 transition-all duration-300">
        <div className="flex items-center gap-4">
          <button onClick={() => onNavigate('home')} className="flex items-center gap-3">
            <Logo className="h-10 w-auto" />
            <span className="font-bold text-2xl text-gray-800 dark:text-white hidden sm:inline tracking-tight">CodeToCoder</span>
          </button>
          
          <nav className="hidden md:flex items-center gap-2 ml-4">
            <NavLink view="home" label="Home" />
            <button
                onClick={scrollToMission}
                className="px-3 py-2 rounded-md text-sm font-semibold transition-colors text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            >
                Mission
            </button>
            <NavLink view="classroom" label="Classroom" />
            <NavLink view="practice" label="Practice" />
            <NavLink view="playground" label="Playground" />
            <NavLink view="reference" label="Reference" />
          </nav>
        </div>

        <div className="flex items-center gap-3">
            {user && (
                <div ref={starTargetRef as React.RefObject<HTMLDivElement>} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                    <StarIcon />
                    <span className="font-bold text-sm text-gray-800 dark:text-gray-200">{stars}</span>
                </div>
            )}
            
            <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Toggle theme"
            >
                {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>

            {user ? (
                <button
                    onClick={handleOpenProfile}
                    className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                    aria-label="Open profile"
                >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-sm font-bold text-white">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                </button>
            ) : (
                <button
                    onClick={onOpenAuth}
                    className="hidden md:flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all"
                >
                    <UserIcon />
                    Sign In
                </button>
            )}

            <div className="md:hidden">
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-md text-gray-500">
                    {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
                </button>
            </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
            <div className="md:hidden absolute top-20 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 space-y-2 shadow-lg animate-slide-up">
                <NavLink view="home" label="Home" />
                <button
                    onClick={scrollToMission}
                    className="w-full text-left px-3 py-2 rounded-md text-sm font-semibold transition-colors text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                >
                    Mission
                </button>
                <NavLink view="classroom" label="Classroom" />
                <NavLink view="practice" label="Practice" />
                <NavLink view="playground" label="Playground" />
                <NavLink view="reference" label="Reference" />
                {!user && (
                    <button
                        onClick={() => { onOpenAuth(); setIsMobileMenuOpen(false); }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-bold mt-2"
                    >
                        <UserIcon />
                        Sign In
                    </button>
                )}
            </div>
        )}
      </header>
    </>
  );
};


import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export type ViewState = 'home' | 'classroom' | 'playground' | 'practice' | 'reference' | 'about' | 'mission' | 'profile' | 'marketplace' | 'collection';

interface HeaderProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  starTargetRef?: React.RefObject<HTMLDivElement | null>;
  onOpenAuth: () => void;
  starBalance?: number;
}
import Logo from '../assets/logo.svg?react';
import SunIcon from '../assets/icons/SunIcon.svg?react';
import MoonIcon from '../assets/icons/MoonIcon.svg?react';
import StarIcon from '../assets/icons/StarIcon.svg?react';
import UserIcon from '../assets/icons/UserIcon.svg?react';
import MenuIcon from '../assets/icons/MenuIcon.svg?react';
import CloseIcon from '../assets/icons/CloseIcon.svg?react';



export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, theme, setTheme, starTargetRef, onOpenAuth, starBalance }) => {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const NavLink: React.FC<{ view: ViewState; label: string }> = ({ view, label }) => (
    <button
      onClick={() => {
        onNavigate(view);
        setIsMobileMenuOpen(false);
      }}
      className={`px-3 py-2 rounded-md text-sm font-semibold transition-colors ${currentView === view
        ? 'bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400'
        : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
        }`}
    >
      {label}
    </button>
  );

  const handleOpenProfile = () => {
    onNavigate('profile');
    setIsMobileMenuOpen(false);
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
            {user && <NavLink view="home" label="Home" />}
            <NavLink view="classroom" label="Classroom" />
            <NavLink view="practice" label="Practice" />
            <NavLink view="playground" label="Playground" />
            <NavLink view="marketplace" label="Market" />
            <NavLink view="collection" label="Collection" />
            <NavLink view="reference" label="Reference" />
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {user && starBalance !== undefined && (
            <div ref={starTargetRef as React.RefObject<HTMLDivElement>} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full border border-yellow-400/30">
              <StarIcon className="w-5 h-5 text-yellow-500" />
              <span className="font-bold text-sm text-gray-800 dark:text-gray-200">{starBalance.toLocaleString()}</span>
            </div>
          )}

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
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
              <UserIcon className="w-5 h-5" />
              Sign In
            </button>
          )}

          <div className="md:hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-md text-gray-500">
              {isMobileMenuOpen ? <CloseIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 space-y-2 shadow-lg animate-slide-up">
            {user && <NavLink view="home" label="Home" />}
            <NavLink view="classroom" label="Classroom" />
            <NavLink view="practice" label="Practice" />
            <NavLink view="playground" label="Playground" />
            <NavLink view="marketplace" label="Market" />
            <NavLink view="collection" label="Collection" />
            <NavLink view="reference" label="Reference" />
            {!user && (
              <button
                onClick={() => { onOpenAuth(); setIsMobileMenuOpen(false); }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-bold mt-2"
              >
                <UserIcon className="w-5 h-5" />
                Sign In
              </button>
            )}
          </div>
        )}
      </header>
    </>
  );
};

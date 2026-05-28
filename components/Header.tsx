import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { formatCompactNumber } from '../utils/formatters';

// 'classroom' = curriculum/IDE (URL /lessons, labelled "Lessons").
// 'classhub' = classroom-management tab (URL /classroom, labelled "Classroom").
export type ViewState = 'home' | 'classroom' | 'classhub' | 'playground' | 'practice' | 'about' | 'mission' | 'profile' | 'marketplace' | 'reference' | 'leaderboard' | 'teacher';

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
import {
  Sun,
  Moon,
  Star,
  User,
  Menu,
  X,
  GraduationCap,
  ShoppingBag,
  Trophy,
  BookOpen,
  Info,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { FocusTimer } from './FocusTimer';

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, theme, setTheme, starTargetRef, onOpenAuth, starBalance }) => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu on outside click or Escape
  useEffect(() => {
    if (!isUserMenuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isUserMenuOpen]);

  const go = (view: ViewState) => {
    onNavigate(view);
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  const NavLink: React.FC<{ view: ViewState; label: string; icon?: React.ReactNode }> = ({ view, label, icon }) => (
    <button
      onClick={() => go(view)}
      className={`nav-tab inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold border transition-colors ${
        currentView === view
          ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border-cyan-500/30'
          : 'text-gray-600 dark:text-gray-300 border-transparent hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  // The Classroom-area tab swaps between teacher dashboard and student/role hub.
  const classroomTab = user?.role === 'teacher'
    ? { view: 'teacher' as ViewState, label: 'My Class', icon: <GraduationCap className="w-4 h-4" /> }
    : { view: 'classhub' as ViewState, label: 'Classroom', icon: null };

  const MenuItem: React.FC<{
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    danger?: boolean;
  }> = ({ onClick, icon, label, active, danger }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-md transition-colors ${
        danger
          ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
          : active
            ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-400'
            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
    >
      <span className="w-4 h-4 flex-shrink-0">{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <header className="h-16 flex-shrink-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 sm:px-6 relative z-50">
      {/* Left: logo + primary nav */}
      <div className="flex items-center gap-4 min-w-0">
        <button onClick={() => go('home')} className="no-hover flex items-center gap-2 flex-shrink-0" aria-label="Go to home">
          <Logo className="h-8 w-auto" />
          <span className="font-bold text-xl text-gray-800 dark:text-white hidden sm:inline tracking-tight">Code2Coder</span>
        </button>

        <nav className="hidden md:flex items-center gap-0.5">
          <NavLink view="classroom" label="Lessons" />
          <NavLink view="practice" label="Practice" />
          <NavLink view="playground" label="Playground" />
          <NavLink view={classroomTab.view} label={classroomTab.label} icon={classroomTab.icon} />
        </nav>
      </div>

      {/* Right: status + account */}
      <div className="flex items-center gap-2">
        {user && starBalance !== undefined && (
          <div
            ref={starTargetRef as React.RefObject<HTMLDivElement>}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-400/30"
            title={`${starBalance} stars`}
          >
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="font-bold text-sm text-gray-800 dark:text-gray-200">{formatCompactNumber(starBalance)}</span>
          </div>
        )}

        {user && <div className="hidden sm:flex"><FocusTimer /></div>}

        {user ? (
          <div ref={userMenuRef} className="relative">
            <button
              onClick={() => setIsUserMenuOpen(v => !v)}
              className="flex items-center gap-1 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Open account menu"
              aria-expanded={isUserMenuOpen}
            >
              <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-sm font-bold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-60 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl p-2 animate-fade-in">
                <div className="px-3 py-2 mb-1 border-b border-gray-100 dark:border-gray-800">
                  <div className="font-semibold text-gray-900 dark:text-white truncate">{user.name}</div>
                  {user.role && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</div>
                  )}
                </div>
                <MenuItem onClick={() => go('profile')} icon={<User className="w-4 h-4" />} label="Profile" active={currentView === 'profile'} />
                <MenuItem onClick={() => go('marketplace')} icon={<ShoppingBag className="w-4 h-4" />} label="Star Market" active={currentView === 'marketplace'} />
                <MenuItem onClick={() => go('leaderboard')} icon={<Trophy className="w-4 h-4" />} label="Leaderboard" active={currentView === 'leaderboard'} />
                <MenuItem onClick={() => go('reference')} icon={<BookOpen className="w-4 h-4" />} label="Reference" active={currentView === 'reference'} />
                <MenuItem onClick={() => go('mission')} icon={<Info className="w-4 h-4" />} label="About" active={currentView === 'mission' || currentView === 'about'} />
                <div className="my-1 border-t border-gray-100 dark:border-gray-800" />
                <MenuItem
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  icon={theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  label={theme === 'dark' ? 'Light mode' : 'Dark mode'}
                />
                <MenuItem
                  onClick={async () => {
                    setIsUserMenuOpen(false);
                    await logout();
                  }}
                  icon={<LogOut className="w-4 h-4" />}
                  label="Sign out"
                  danger
                />
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Theme toggle for signed-out users (no avatar menu to host it) */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={onOpenAuth}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-bold shadow-sm transition-colors"
            >
              <User className="w-4 h-4" />
              Sign In
            </button>
          </>
        )}

        {/* Mobile menu trigger */}
        <button
          onClick={() => setIsMobileMenuOpen(v => !v)}
          className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-3 space-y-1 shadow-lg animate-slide-up">
          <NavLink view="classroom" label="Lessons" />
          <NavLink view="practice" label="Practice" />
          <NavLink view="playground" label="Playground" />
          <NavLink view={classroomTab.view} label={classroomTab.label} icon={classroomTab.icon} />
          {user && (
            <>
              <div className="my-2 border-t border-gray-100 dark:border-gray-800" />
              <MenuItem onClick={() => go('profile')} icon={<User className="w-4 h-4" />} label="Profile" />
              <MenuItem onClick={() => go('marketplace')} icon={<ShoppingBag className="w-4 h-4" />} label="Star Market" />
              <MenuItem onClick={() => go('leaderboard')} icon={<Trophy className="w-4 h-4" />} label="Leaderboard" />
              <MenuItem onClick={() => go('reference')} icon={<BookOpen className="w-4 h-4" />} label="Reference" />
              <MenuItem onClick={() => go('mission')} icon={<Info className="w-4 h-4" />} label="About" />
            </>
          )}
          {!user && (
            <button
              onClick={() => { onOpenAuth(); setIsMobileMenuOpen(false); }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-bold mt-2"
            >
              <User className="w-4 h-4" />
              Sign In
            </button>
          )}
        </div>
      )}
    </header>
  );
};

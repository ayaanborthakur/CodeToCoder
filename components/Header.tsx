import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { formatCompactNumber } from '../utils/formatters';

export type ViewState = 'home' | 'classroom' | 'playground' | 'practice' | 'about' | 'mission' | 'profile' | 'marketplace' | 'reference' | 'leaderboard';

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
  Search,
  HelpCircle
} from 'lucide-react';
import { FocusTimer } from './FocusTimer';


export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, theme, setTheme, starTargetRef, onOpenAuth, starBalance }) => {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const NavLink: React.FC<{ view: ViewState; label: string }> = ({ view, label }) => (
    <button
      onClick={() => {
        onNavigate(view);
        setIsMobileMenuOpen(false);
      }}
      className={`nav-tab px-3 py-1.5 rounded-md text-sm font-semibold border ${currentView === view
        ? 'bg-cyan-500/20 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400 border-cyan-500/30'
        : 'text-gray-600 dark:text-gray-300 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
        }`}
    >
      {label}
    </button>
  );

  const handleOpenProfile = () => {
    onNavigate('profile');
    setIsMobileMenuOpen(false);
  };



  return (
    <>
      <header className="h-16 flex-shrink-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 sm:px-6 relative z-50 transition-all duration-200">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate('home')} className="no-hover flex items-center gap-2">
            <Logo className="h-8 w-auto" />
            <span className="font-bold text-xl text-gray-800 dark:text-white hidden sm:inline tracking-tight">Code2Coder</span>
          </button>

          {/* Search Bar with Dropdown - Hidden on small screens */}
          <div className="hidden lg:flex items-center ml-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchQuery(searchQuery)}
                onBlur={() => setTimeout(() => setSearchQuery(''), 200)}
                className="w-48 pl-9 pr-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-800 dark:text-gray-200 placeholder-gray-400"
              />
              {/* Search Dropdown */}
              {searchQuery.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden z-50">
                  {[
                    { view: 'classroom' as ViewState, label: 'Classroom', icon: '📚', keywords: ['learn', 'lesson', 'module', 'classroom', 'course'] },
                    { view: 'practice' as ViewState, label: 'Practice', icon: '🎯', keywords: ['quiz', 'problem', 'project', 'practice', 'exercise'] },
                    { view: 'playground' as ViewState, label: 'Playground', icon: '🎮', keywords: ['code', 'playground', 'editor', 'python', 'run'] },
                    { view: 'reference' as ViewState, label: 'Reference', icon: '📖', keywords: ['docs', 'reference', 'guide', 'help', 'documentation'] },
                    { view: 'marketplace' as ViewState, label: 'Star Market', icon: '⭐', keywords: ['market', 'star', 'pack', 'buy', 'collection'] },
                    { view: 'leaderboard' as ViewState, label: 'Leaderboard', icon: '🏆', keywords: ['rank', 'leaderboard', 'top', 'score'] },
                    { view: 'profile' as ViewState, label: 'Profile', icon: '👤', keywords: ['profile', 'account', 'settings', 'badge'] },
                    { view: 'mentor' as ViewState, label: 'Mentor', icon: '💬', keywords: ['mentor', 'help', 'guidance', 'chat', 'support'] },
                  ]
                    .filter(item =>
                      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      item.keywords.some(kw => kw.includes(searchQuery.toLowerCase()))
                    )
                    .slice(0, 5)
                    .map(item => (
                      <button
                        key={item.view}
                        onMouseDown={() => { onNavigate(item.view); setSearchQuery(''); }}
                        className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                      >
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </button>
                    ))}
                  {searchQuery.length > 0 && [
                    { view: 'classroom' as ViewState, label: 'Classroom', icon: '📚', keywords: ['learn', 'lesson', 'module', 'classroom', 'course'] },
                    { view: 'practice' as ViewState, label: 'Practice', icon: '🎯', keywords: ['quiz', 'problem', 'project', 'practice', 'exercise'] },
                    { view: 'playground' as ViewState, label: 'Playground', icon: '🎮', keywords: ['code', 'playground', 'editor', 'python', 'run'] },
                    { view: 'reference' as ViewState, label: 'Reference', icon: '📖', keywords: ['docs', 'reference', 'guide', 'help', 'documentation'] },
                    { view: 'marketplace' as ViewState, label: 'Star Market', icon: '⭐', keywords: ['market', 'star', 'pack', 'buy', 'collection'] },
                    { view: 'leaderboard' as ViewState, label: 'Leaderboard', icon: '🏆', keywords: ['rank', 'leaderboard', 'top', 'score'] },
                    { view: 'profile' as ViewState, label: 'Profile', icon: '👤', keywords: ['profile', 'account', 'settings', 'badge'] },
                    { view: 'mentor' as ViewState, label: 'Mentor', icon: '💬', keywords: ['mentor', 'help', 'guidance', 'chat', 'support'] },
                  ].filter(item => 
                    item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.keywords.some(kw => kw.includes(searchQuery.toLowerCase()))
                  ).length === 0 && (
                    <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                      No results found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1 ml-3">
            {user && <NavLink view="home" label="Home" />}
            <NavLink view="classroom" label="Classroom" />
            <NavLink view="practice" label="Practice" />
            <NavLink view="playground" label="Playground" />
            <NavLink view="marketplace" label="Market" />
            <NavLink view="leaderboard" label="Leaderboard" />
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {user && starBalance !== undefined && (
            <div ref={starTargetRef as React.RefObject<HTMLDivElement>} className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg border border-yellow-400/30">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="font-bold text-sm text-gray-800 dark:text-gray-200">{formatCompactNumber(starBalance)}</span>
            </div>
          )}

          {/* Focus Timer */}
          {user && <FocusTimer />}

          {/* Help button */}
          <button
            onClick={() => onNavigate('mission')}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
            aria-label="Help & About"
            title="Help & About"
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {user ? (
            <button
              onClick={handleOpenProfile}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
              aria-label="Open profile"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm relative">
                 {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      className="w-full h-full object-cover"
                    />
                 ) : (
                    <div className="w-full h-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-sm font-bold text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                 )}
              </div>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all"
            >
              <User className="w-4 h-4" />
              Sign In
            </button>
          )}

          <div className="md:hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-lg text-gray-500 border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white dark:bg-gray-900 border-b-2 border-gray-200 dark:border-gray-800 p-3 space-y-1 shadow-lg animate-slide-up">
            {user && <NavLink view="home" label="Home" />}
            <NavLink view="classroom" label="Classroom" />
            <NavLink view="practice" label="Practice" />
            <NavLink view="playground" label="Playground" />
            <NavLink view="marketplace" label="Market" />
            <NavLink view="leaderboard" label="Leaderboard" />

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
    </>
  );
};

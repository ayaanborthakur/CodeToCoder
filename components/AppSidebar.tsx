import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Home, BookOpen, CheckSquare, Code2, Users, Calendar, GraduationCap, ClipboardCheck,
    Star, Sun, Moon, User as UserIcon, ShoppingBag, Trophy, Info, LogOut, ChevronsLeft, ChevronsRight, Library,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { formatCompactNumber } from '../utils/formatters';
import type { Classroom } from '../types';
import Logo from '../assets/logo.svg?react';

export interface SidebarProps {
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
    starTargetRef?: React.RefObject<HTMLDivElement | null>;
    starBalance?: number;
    /** Student: assignments still to hand in. */
    todoCount: number;
    /** Teacher: their active classes and submissions waiting for a grade. */
    teacherClasses: Classroom[];
    toGradeCount: number;
    /** Icons only, to give a code editor more room. */
    collapsed: boolean;
    onToggleCollapsed: () => void;
    /** Called after a link is followed (closes the phone drawer). */
    onNavigated?: () => void;
}

interface NavItem { to: string; label: string; icon: React.ReactNode; badge?: number; badgeTone?: 'alert' | 'info'; match: (path: string) => boolean }

const iconClass = 'w-5 h-5 flex-shrink-0';

/**
 * The app's main navigation: where you are and where you can go, always in
 * the same place on the left (as in Canvas, CodeHS and Khan Academy).
 */
export const AppSidebar: React.FC<SidebarProps> = ({
    theme, setTheme, starTargetRef, starBalance, todoCount, teacherClasses, toGradeCount, collapsed, onToggleCollapsed, onNavigated,
}) => {
    const { user, logout } = useAuth();
    const { pathname } = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const isTeacher = user?.role === 'teacher';

    useEffect(() => {
        if (!menuOpen) return;
        const onDown = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false); };
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
        document.addEventListener('mousedown', onDown);
        document.addEventListener('keydown', onKey);
        return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
    }, [menuOpen]);

    if (!user) return null;

    const items: NavItem[] = isTeacher
        ? [
            { to: '/dashboard', label: 'Home', icon: <Home className={iconClass} />, match: p => p === '/dashboard' },
            { to: '/teacher', label: 'Classes', icon: <GraduationCap className={iconClass} />, match: p => p === '/teacher' || (p.startsWith('/teacher/') && !p.startsWith('/teacher/grading')) },
            { to: '/grading', label: 'To grade', icon: <ClipboardCheck className={iconClass} />, badge: toGradeCount, badgeTone: 'info', match: p => p.startsWith('/grading') },
            { to: '/lessons', label: 'Curriculum', icon: <BookOpen className={iconClass} />, match: p => p.startsWith('/lessons') || p.startsWith('/courses') },
            { to: '/practice', label: 'Practice', icon: <CheckSquare className={iconClass} />, match: p => p.startsWith('/practice') },
            { to: '/playground', label: 'Playground', icon: <Code2 className={iconClass} />, match: p => p.startsWith('/playground') },
            { to: '/calendar', label: 'Calendar', icon: <Calendar className={iconClass} />, match: p => p.startsWith('/calendar') },
        ]
        : [
            { to: '/dashboard', label: 'Home', icon: <Home className={iconClass} />, match: p => p === '/dashboard' },
            { to: '/lessons', label: 'Courses', icon: <BookOpen className={iconClass} />, match: p => p.startsWith('/lessons') || p.startsWith('/courses') },
            { to: '/practice', label: 'Practice', icon: <CheckSquare className={iconClass} />, match: p => p.startsWith('/practice') },
            { to: '/playground', label: 'Playground', icon: <Code2 className={iconClass} />, match: p => p.startsWith('/playground') },
            { to: '/classroom', label: 'My class', icon: <Users className={iconClass} />, badge: todoCount, badgeTone: 'alert', match: p => p.startsWith('/classroom') },
            { to: '/calendar', label: 'Calendar', icon: <Calendar className={iconClass} />, match: p => p.startsWith('/calendar') },
        ];

    const linkClass = (active: boolean) =>
        `no-hover group relative flex items-center gap-3 rounded-xl ${collapsed ? 'justify-center px-0 py-3' : 'px-3 py-2.5'} font-medium ${active
            ? 'bg-cyan-50 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300 font-semibold'
            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'}`;

    return (
        <nav
            aria-label="Main"
            data-tour="sidebar"
            className={`h-full flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 ${collapsed ? 'w-[76px] px-2' : 'w-64 px-3'} py-4 flex-shrink-0 overflow-y-auto overflow-x-hidden`}
        >
            <Link to="/dashboard" onClick={onNavigated} className={`no-hover flex items-center gap-2.5 mb-6 ${collapsed ? 'justify-center' : 'px-2'}`} aria-label="Code2Coder home">
                <Logo className="h-9 w-auto flex-shrink-0" />
                {!collapsed && <span className="font-bold text-xl text-gray-900 dark:text-white">Code2Coder</span>}
            </Link>

            <ul className="flex flex-col gap-1">
                {items.map(item => {
                    const active = item.match(pathname);
                    return (
                        <li key={item.to}>
                            <Link to={item.to} onClick={onNavigated} className={linkClass(active)} aria-current={active ? 'page' : undefined} title={collapsed ? item.label : undefined}>
                                {item.icon}
                                {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                                {!!item.badge && item.badge > 0 && (
                                    <span
                                        className={`${collapsed ? 'absolute top-1 right-2' : ''} min-w-[1.5rem] h-6 px-1.5 rounded-full text-xs font-bold flex items-center justify-center text-white ${item.badgeTone === 'alert' ? 'bg-red-600' : 'bg-cyan-700'}`}
                                        aria-label={`${item.badge} ${item.badgeTone === 'alert' ? 'to do' : 'to grade'}`}
                                    >
                                        {item.badge > 99 ? '99+' : item.badge}
                                    </span>
                                )}
                            </Link>
                            {/* Teachers jump straight into a class from the sidebar. */}
                            {isTeacher && item.to === '/teacher' && !collapsed && teacherClasses.length > 0 && (
                                <ul className="mt-1 mb-1 ml-8 flex flex-col gap-0.5 border-l border-gray-200 dark:border-gray-700 pl-2">
                                    {teacherClasses.map(c => {
                                        const on = pathname.startsWith(`/teacher/${c.classId}`);
                                        return (
                                            <li key={c.classId}>
                                                <Link
                                                    to={`/teacher/${c.classId}/overview`}
                                                    onClick={onNavigated}
                                                    className={`no-hover block truncate rounded-lg px-3 py-1.5 text-sm ${on ? 'bg-gray-100 dark:bg-gray-800 font-semibold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/60'}`}
                                                    title={c.className}
                                                >
                                                    {c.className}
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </li>
                    );
                })}
            </ul>

            <div className="flex-1" />

            <div className="flex flex-col gap-1 pt-4 border-t border-gray-200 dark:border-gray-800">
                {starBalance !== undefined && (
                    <Link to="/marketplace" onClick={onNavigated} className={linkClass(pathname.startsWith('/marketplace'))} title={collapsed ? `${starBalance} stars` : undefined}>
                        <div ref={starTargetRef as React.RefObject<HTMLDivElement>} className="flex-shrink-0">
                            <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
                        </div>
                        {!collapsed && <span className="flex-1">Stars</span>}
                        {!collapsed && <span className="font-bold tabular-nums">{formatCompactNumber(starBalance)}</span>}
                    </Link>
                )}

                <div ref={menuRef} className="relative">
                    <button
                        onClick={() => setMenuOpen(v => !v)}
                        className={`no-hover w-full flex items-center gap-3 rounded-xl ${collapsed ? 'justify-center py-2' : 'px-3 py-2'} hover:bg-gray-100 dark:hover:bg-gray-800 text-left`}
                        aria-haspopup="menu"
                        aria-expanded={menuOpen}
                        aria-label="Account menu"
                    >
                        {user.avatar
                            ? <img src={user.avatar} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                            : <span className="w-9 h-9 rounded-full bg-cyan-700 text-white font-bold flex items-center justify-center flex-shrink-0" aria-hidden="true">{user.name.charAt(0).toUpperCase()}</span>}
                        {!collapsed && (
                            <span className="min-w-0 flex-1">
                                <span className="block font-semibold text-gray-900 dark:text-white truncate leading-tight">{user.name}</span>
                                <span className="block text-sm text-gray-500 dark:text-gray-400 capitalize leading-tight">{user.role ?? 'Student'}</span>
                            </span>
                        )}
                    </button>
                    {menuOpen && (
                        <div role="menu" className={`absolute bottom-full mb-2 ${collapsed ? 'left-0' : 'left-0 right-0'} w-60 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-1.5 z-50`}>
                            {([
                                ['/profile', 'Profile', <UserIcon key="p" className="w-4 h-4" />],
                                ['/marketplace', 'Star Market', <ShoppingBag key="m" className="w-4 h-4" />],
                                ['/leaderboard', 'Leaderboard', <Trophy key="l" className="w-4 h-4" />],
                                ['/reference', 'Python reference', <Library key="r" className="w-4 h-4" />],
                                ['/about', 'About Code2Coder', <Info key="a" className="w-4 h-4" />],
                            ] as const).map(([to, label, icon]) => (
                                <Link key={to} role="menuitem" to={to} onClick={() => { setMenuOpen(false); onNavigated?.(); }} className="no-hover flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
                                    {icon}{label}
                                </Link>
                            ))}
                            <div className="my-1 border-t border-gray-100 dark:border-gray-800" />
                            <button role="menuitem" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="no-hover w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
                                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                                {theme === 'dark' ? 'Light mode' : 'Dark mode'}
                            </button>
                            <button role="menuitem" onClick={async () => { setMenuOpen(false); await logout(); }} className="no-hover w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                                <LogOut className="w-4 h-4" />Sign out
                            </button>
                        </div>
                    )}
                </div>

                <button
                    onClick={onToggleCollapsed}
                    className={`no-hover hidden md:flex items-center gap-3 rounded-xl ${collapsed ? 'justify-center py-2.5' : 'px-3 py-2.5'} text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800`}
                    aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    title={collapsed ? 'Expand sidebar' : undefined}
                >
                    {collapsed ? <ChevronsRight className="w-5 h-5" /> : <><ChevronsLeft className="w-5 h-5" />Collapse</>}
                </button>
            </div>
        </nav>
    );
};

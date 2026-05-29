import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    ArrowRight,
    Loader2,
    AlertCircle,
    Copy,
    CheckCheck,
    LogOut,
} from 'lucide-react';
import {
    joinClassroom,
    getClassroom,
    setUserRole,
    leaveClassroom,
} from '../services/classroomService';
import type { Classroom } from '../types';
import type { ViewState } from './Header';

interface ClassroomHubProps {
    onNavigate: (view: ViewState) => void;
}

// Module-level so its identity is stable across renders — defining this inside
// the component would remount its children on every keystroke (losing input focus).
const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">{children}</div>
    </div>
);

export const ClassroomHub: React.FC<ClassroomHubProps> = ({ onNavigate }) => {
    const { user, refreshUser } = useAuth();

    const [settingRole, setSettingRole] = useState(false);
    const [joinCode, setJoinCode] = useState('');
    const [joinError, setJoinError] = useState<string | null>(null);
    const [joinLoading, setJoinLoading] = useState(false);
    const [classroom, setClassroom] = useState<Classroom | null>(null);
    const [classLoading, setClassLoading] = useState(false);
    const [codeCopied, setCodeCopied] = useState(false);
    const [leaving, setLeaving] = useState(false);

    const loadClassroom = useCallback(async () => {
        if (!user?.classId) { setClassroom(null); return; }
        setClassLoading(true);
        try {
            const cls = await getClassroom(user.classId);
            setClassroom(cls);
        } catch {
            setClassroom(null);
        } finally {
            setClassLoading(false);
        }
    }, [user?.classId]);

    useEffect(() => { loadClassroom(); }, [loadClassroom]);

    if (!user) return null;

    const chooseTeacher = async () => {
        setSettingRole(true);
        try {
            await setUserRole(user.id, 'teacher');
            await refreshUser();
            onNavigate('teacher');
        } finally {
            setSettingRole(false);
        }
    };

    const chooseStudent = async () => {
        setSettingRole(true);
        try {
            await setUserRole(user.id, 'student');
            await refreshUser();
        } finally {
            setSettingRole(false);
        }
    };

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (joinCode.length !== 6) return;
        setJoinLoading(true);
        setJoinError(null);
        try {
            await joinClassroom(user.id, joinCode.trim());
            await refreshUser();
            await loadClassroom();
        } catch (err: unknown) {
            setJoinError(err instanceof Error ? err.message : 'Invalid join code');
        } finally {
            setJoinLoading(false);
        }
    };

    const copyJoinCode = () => {
        if (!classroom) return;
        navigator.clipboard.writeText(classroom.joinCode).catch(() => {});
        setCodeCopied(true);
        setTimeout(() => setCodeCopied(false), 2000);
    };

    const handleLeave = async () => {
        if (!classroom) return;
        setLeaving(true);
        try {
            await leaveClassroom(user.id, classroom.classId);
            await refreshUser();
            setClassroom(null);
            setJoinCode('');
        } finally {
            setLeaving(false);
        }
    };

    // ── No role yet → compact chooser ──────────────────────────────────────────
    if (!user.role) {
        return (
            <Shell>
                <header className="mb-5">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Classroom</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Are you a teacher or a student? This sets up the right classroom tools for you.
                    </p>
                </header>

                <div className="grid sm:grid-cols-2 gap-3">
                    <button
                        onClick={chooseTeacher}
                        disabled={settingRole}
                        className="text-left rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-cyan-500 dark:hover:border-cyan-500 hover:shadow-md p-4 transition-all disabled:opacity-60 group"
                    >
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wide">Teacher</span>
                            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-cyan-500 transition-colors" />
                        </div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">I'm a teacher</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Create a class, share a join code, and track student progress.
                        </p>
                    </button>

                    <button
                        onClick={chooseStudent}
                        disabled={settingRole}
                        className="text-left rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-md p-4 transition-all disabled:opacity-60 group"
                    >
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide">Student</span>
                            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-purple-500 transition-colors" />
                        </div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">I'm a student</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Join your teacher's class with a 6-letter code.
                        </p>
                    </button>
                </div>

                {settingRole && (
                    <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-500">
                        <Loader2 className="w-4 h-4 animate-spin" /> Setting up…
                    </div>
                )}
            </Shell>
        );
    }

    // ── Teacher → compact pointer to My Class ──────────────────────────────────
    if (user.role === 'teacher') {
        return (
            <Shell>
                <header className="mb-5">
                    <div className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wide">Teacher</div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Classroom</h1>
                </header>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            Manage your class, share your join code, and track student progress from <span className="font-semibold">My Class</span>.
                        </p>
                    </div>
                    <button
                        onClick={() => onNavigate('teacher')}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold rounded-md transition-colors flex-shrink-0"
                    >
                        Open <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </Shell>
        );
    }

    // ── Student: already in a classroom ────────────────────────────────────────
    if (user.classId) {
        if (classLoading) {
            return <Shell><div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-purple-500 animate-spin" /></div></Shell>;
        }
        if (classroom) {
            return (
                <Shell>
                    <header className="mb-5">
                        <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide">Your Classroom</div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white truncate">{classroom.className}</h1>
                    </header>

                    <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
                        <div className="flex items-center justify-between px-5 py-3">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Teacher</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">{classroom.teacherName}</span>
                        </div>
                        <div className="flex items-center justify-between px-5 py-3">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Classmates</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">{classroom.studentIds.length}</span>
                        </div>
                        <div className="flex items-center justify-between px-5 py-3">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Join code</span>
                            <button
                                onClick={copyJoinCode}
                                className="flex items-center gap-1.5 font-mono font-bold tracking-widest text-sm text-gray-900 dark:text-white hover:text-purple-500"
                            >
                                {classroom.joinCode}
                                {codeCopied ? <CheckCheck className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={handleLeave}
                        disabled={leaving}
                        className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 text-sm font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors disabled:opacity-60"
                    >
                        {leaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                        Leave classroom
                    </button>
                </Shell>
            );
        }
        // classId set but classroom doc missing → fall through to the join form.
    }

    // ── Student: not in a classroom → compact join form ────────────────────────
    return (
        <Shell>
            <header className="mb-5">
                <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide">Student</div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Join a classroom</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Enter the 6-letter code your teacher gave you.
                </p>
            </header>

            <form onSubmit={handleJoin} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-3">
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Join code</label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={joinCode}
                        onChange={(e) => { setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z]/g, '')); setJoinError(null); }}
                        className={`flex-1 px-3 py-2 text-lg font-bold font-mono tracking-[0.3em] text-center rounded-lg bg-gray-50 dark:bg-gray-900 border outline-none transition-all ${
                            joinError ? 'border-red-400 focus:ring-2 focus:ring-red-500' : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
                        }`}
                        placeholder="ABCDEF"
                        maxLength={6}
                        autoFocus
                        autoCapitalize="characters"
                    />
                    <button
                        type="submit"
                        disabled={joinLoading || joinCode.length !== 6}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {joinLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Join <ArrowRight className="w-4 h-4" /></>}
                    </button>
                </div>
                {joinError && (
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4" /> {joinError}
                    </p>
                )}
            </form>
        </Shell>
    );
};

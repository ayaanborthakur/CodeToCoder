import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    GraduationCap,
    BookOpen,
    Users,
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
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">{children}</div>
    </div>
);

export const ClassroomHub: React.FC<ClassroomHubProps> = ({ onNavigate }) => {
    const { user, refreshUser } = useAuth();

    // Role-selection state
    const [settingRole, setSettingRole] = useState(false);

    // Join state
    const [joinCode, setJoinCode] = useState('');
    const [joinError, setJoinError] = useState<string | null>(null);
    const [joinLoading, setJoinLoading] = useState(false);

    // Joined-classroom state
    const [classroom, setClassroom] = useState<Classroom | null>(null);
    const [classLoading, setClassLoading] = useState(false);
    const [codeCopied, setCodeCopied] = useState(false);
    const [leaving, setLeaving] = useState(false);

    // ── Load the student's classroom when they have one ─────────────────────────
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

    // ── Role handlers ───────────────────────────────────────────────────────────
    const chooseTeacher = async () => {
        setSettingRole(true);
        try {
            await setUserRole(user.id, 'teacher');
            await refreshUser();
            // Teachers manage their class from the "My Class" dashboard.
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
            // Stay here — the join form will render now that role === 'student'.
        } finally {
            setSettingRole(false);
        }
    };

    // ── Join handler ────────────────────────────────────────────────────────────
    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (joinCode.length !== 6) return;
        setJoinLoading(true);
        setJoinError(null);
        try {
            await joinClassroom(user.id, joinCode.trim());
            await refreshUser();
            await loadClassroom();
        } catch (err: any) {
            setJoinError(err.message || 'Invalid join code');
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

    // ── No role yet → chooser ─────────────────────────────────────────────────
    if (!user.role) {
        return (
            <Shell>
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Join the Classroom</h1>
                    <p className="text-gray-500 dark:text-gray-400">Are you a teacher or a student? This sets up your classroom tools.</p>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={chooseTeacher}
                        disabled={settingRole}
                        className="w-full p-6 flex items-start gap-5 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 hover:border-cyan-500 dark:hover:border-cyan-500 rounded-2xl transition-all group text-left disabled:opacity-60"
                    >
                        <div className="w-14 h-14 rounded-xl bg-cyan-100 dark:bg-cyan-900/40 flex items-center justify-center shrink-0">
                            <GraduationCap className="w-7 h-7 text-cyan-600 dark:text-cyan-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">I'm a Teacher</h3>
                                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-cyan-500 transition-colors" />
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Create a classroom, get a join code to share, and track your students' progress.
                            </p>
                        </div>
                    </button>

                    <button
                        onClick={chooseStudent}
                        disabled={settingRole}
                        className="w-full p-6 flex items-start gap-5 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 rounded-2xl transition-all group text-left disabled:opacity-60"
                    >
                        <div className="w-14 h-14 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center shrink-0">
                            <BookOpen className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">I'm a Student</h3>
                                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Join your teacher's classroom with a 6-letter code.
                            </p>
                        </div>
                    </button>
                </div>

                {settingRole && (
                    <div className="flex items-center justify-center gap-2 mt-6 text-gray-500">
                        <Loader2 className="w-4 h-4 animate-spin" /> Setting up…
                    </div>
                )}
            </Shell>
        );
    }

    // ── Teacher → point to the My Class dashboard ──────────────────────────────
    if (user.role === 'teacher') {
        return (
            <Shell>
                <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-8 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center mx-auto mb-5">
                        <GraduationCap className="w-8 h-8 text-cyan-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">You're a Teacher</h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                        Manage your classroom, share your join code, and track student progress from the <span className="font-semibold">My Class</span> dashboard.
                    </p>
                    <button
                        onClick={() => onNavigate('teacher')}
                        className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/25 transition-all"
                    >
                        Go to My Class <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </Shell>
        );
    }

    // ── Student: already in a classroom ────────────────────────────────────────
    if (user.classId) {
        if (classLoading) {
            return <Shell><div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-purple-500 animate-spin" /></div></Shell>;
        }
        if (classroom) {
            return (
                <Shell>
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-4">
                            <BookOpen className="w-8 h-8 text-purple-500" />
                        </div>
                        <p className="text-sm font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Your Classroom</p>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{classroom.className}</h1>
                    </div>

                    <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
                        <div className="flex items-center justify-between p-5">
                            <div className="flex items-center gap-3">
                                <GraduationCap className="w-5 h-5 text-cyan-500" />
                                <span className="text-gray-500 dark:text-gray-400">Teacher</span>
                            </div>
                            <span className="font-semibold text-gray-900 dark:text-white">{classroom.teacherName}</span>
                        </div>
                        <div className="flex items-center justify-between p-5">
                            <div className="flex items-center gap-3">
                                <Users className="w-5 h-5 text-purple-500" />
                                <span className="text-gray-500 dark:text-gray-400">Classmates</span>
                            </div>
                            <span className="font-semibold text-gray-900 dark:text-white">{classroom.studentIds.length}</span>
                        </div>
                        <div className="flex items-center justify-between p-5">
                            <div className="flex items-center gap-3">
                                <span className="text-gray-500 dark:text-gray-400 font-mono">#</span>
                                <span className="text-gray-500 dark:text-gray-400">Join code</span>
                            </div>
                            <button onClick={copyJoinCode} className="flex items-center gap-2 font-mono font-bold tracking-widest text-gray-900 dark:text-white hover:text-purple-500">
                                {classroom.joinCode}
                                {codeCopied ? <CheckCheck className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={handleLeave}
                        disabled={leaving}
                        className="mt-4 w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors disabled:opacity-60"
                    >
                        {leaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                        Leave classroom
                    </button>
                </Shell>
            );
        }
        // classId set but classroom doc missing — fall through to the join form.
    }

    // ── Student: not in a classroom → join form ────────────────────────────────
    return (
        <Shell>
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-5 text-white shadow-xl shadow-purple-500/20">
                    <BookOpen className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Join a Classroom</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Enter the 6-letter code your teacher gave you</p>
            </div>

            <form onSubmit={handleJoin} className="space-y-5">
                <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => { setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z]/g, '')); setJoinError(null); }}
                    className={`w-full px-4 py-4 text-3xl font-black font-mono tracking-[0.4em] text-center rounded-xl bg-white dark:bg-gray-900 border focus:ring-2 outline-none transition-all ${
                        joinError ? 'border-red-400 focus:ring-red-500' : 'border-gray-200 dark:border-gray-800 focus:ring-purple-500 focus:border-purple-500'
                    }`}
                    placeholder="ABCDEF"
                    maxLength={6}
                    autoFocus
                    autoCapitalize="characters"
                />
                {joinError && (
                    <p className="text-sm text-red-500 flex items-center gap-1 justify-center">
                        <AlertCircle className="w-4 h-4" /> {joinError}
                    </p>
                )}
                <button
                    type="submit"
                    disabled={joinLoading || joinCode.length !== 6}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {joinLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Join Classroom <ArrowRight className="w-5 h-5" /></>}
                </button>
            </form>
        </Shell>
    );
};

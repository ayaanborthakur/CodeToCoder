import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    GraduationCap,
    Users,
    Copy,
    CheckCheck,
    BookOpen,
    CheckCircle2,
    RefreshCw,
    Loader2,
    AlertCircle,
    ChevronDown,
    ChevronUp,
    Trophy,
    Star,
} from 'lucide-react';
import { getClassroom, createClassroom } from '../services/classroomService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import type { Classroom } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface StudentProgress {
    uid: string;
    username: string;
    name: string;
    completedLessons: string[];
    totalStars: number;
    currentStreak: number;
    lastActive: number | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const timeAgo = (ts: number | null): string => {
    if (!ts) return 'Never';
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
};

// ─── Component ────────────────────────────────────────────────────────────────

export const TeacherDashboard: React.FC = () => {
    const { user, refreshUser } = useAuth();

    const [classroom, setClassroom] = useState<Classroom | null>(null);
    const [newClassName, setNewClassName] = useState('');
    const [creating, setCreating] = useState(false);
    const [students, setStudents] = useState<StudentProgress[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [codeCopied, setCodeCopied] = useState(false);
    const [expandedStudent, setExpandedStudent] = useState<string | null>(null);

    // ── Data fetching ─────────────────────────────────────────────────────────

    const fetchStudentData = useCallback(async (classroom: Classroom): Promise<StudentProgress[]> => {
        if (classroom.studentIds.length === 0) return [];

        const results = await Promise.all(
            classroom.studentIds.map(async (uid): Promise<StudentProgress> => {
                try {
                    // Fetch user profile
                    const userSnap = await getDoc(doc(db, 'users', uid));
                    const userData = userSnap.exists() ? userSnap.data() : {};

                    // Fetch lesson progress
                    const progressSnap = await getDoc(doc(db, 'users', uid, 'progress', 'classroom'));
                    const completedLessons: string[] = progressSnap.exists()
                        ? (progressSnap.data().completedLessons ?? [])
                        : [];

                    // Fetch stars
                    const starsSnap = await getDoc(doc(db, 'users', uid, 'economy', 'stars'));
                    const totalStars: number = starsSnap.exists() ? (starsSnap.data().totalEarned ?? 0) : 0;

                    // Fetch streak
                    const streakSnap = await getDoc(doc(db, 'users', uid, 'economy', 'stars'));
                    const currentStreak: number = streakSnap.exists() ? (streakSnap.data().currentStreak ?? 0) : 0;

                    return {
                        uid,
                        username: userData.username ?? uid.slice(0, 8),
                        name: userData.name ?? 'Unknown',
                        completedLessons,
                        totalStars,
                        currentStreak,
                        lastActive: userData.lastActive ?? null,
                    };
                } catch {
                    return {
                        uid,
                        username: uid.slice(0, 8),
                        name: 'Unknown',
                        completedLessons: [],
                        totalStars: 0,
                        currentStreak: 0,
                        lastActive: null,
                    };
                }
            })
        );

        // Sort by lessons completed desc
        return results.sort((a, b) => b.completedLessons.length - a.completedLessons.length);
    }, []);

    const loadData = useCallback(async (showSpinner = false) => {
        if (!user?.classId) { setLoading(false); return; }
        if (showSpinner) setRefreshing(true);

        try {
            const cls = await getClassroom(user.classId);
            if (!cls) { setError('Classroom not found.'); return; }
            setClassroom(cls);
            const studentData = await fetchStudentData(cls);
            setStudents(studentData);
            setError(null);
        } catch (e: any) {
            setError(e.message ?? 'Failed to load classroom data.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user?.classId, fetchStudentData]);

    useEffect(() => { loadData(); }, [loadData]);

    // ── Actions ───────────────────────────────────────────────────────────────

    const copyJoinCode = () => {
        if (!classroom) return;
        navigator.clipboard.writeText(classroom.joinCode).catch(() => {});
        setCodeCopied(true);
        setTimeout(() => setCodeCopied(false), 2000);
    };

    // ── No classroom yet ──────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
            </div>
        );
    }

    if (!user?.classId || !classroom) {
        const handleCreate = async (e: React.FormEvent) => {
            e.preventDefault();
            if (!user || !newClassName.trim()) return;
            setCreating(true);
            setError(null);
            try {
                await createClassroom(user.id, user.name, newClassName.trim());
                await refreshUser();
                await loadData();
            } catch (err: any) {
                setError(err.message ?? 'Failed to create classroom.');
            } finally {
                setCreating(false);
            }
        };

        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-5 p-8">
                <div className="w-16 h-16 rounded-2xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                    <GraduationCap className="w-8 h-8 text-cyan-500" />
                </div>
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create your Classroom</h2>
                    <p className="text-gray-500 dark:text-gray-400 max-w-sm mt-1">
                        Give your class a name — we'll generate a join code you can share with your students.
                    </p>
                </div>

                <form onSubmit={handleCreate} className="w-full max-w-sm space-y-4">
                    <input
                        type="text"
                        value={newClassName}
                        onChange={(e) => setNewClassName(e.target.value)}
                        className="w-full px-4 py-3.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all text-gray-900 dark:text-white"
                        placeholder="e.g. Grade 8 Python, Period 3"
                        maxLength={60}
                        autoFocus
                    />
                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-300 text-sm flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 shrink-0" />{error}
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={creating || !newClassName.trim()}
                        className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Classroom'}
                    </button>
                </form>
            </div>
        );
    }

    const topStudents = [...students].slice(0, 3);
    const avgLessons = students.length
        ? Math.round(students.reduce((sum, s) => sum + s.completedLessons.length, 0) / students.length)
        : 0;

    // ── Main render ───────────────────────────────────────────────────────────

    return (
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 p-4 sm:p-6 lg:p-8">
            <div className="max-w-5xl mx-auto space-y-6">

                {/* ── Header ─────────────────────────────────────────── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-cyan-600 dark:text-cyan-400 font-semibold mb-1">
                            <GraduationCap className="w-4 h-4" />
                            Teacher Dashboard
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{classroom.className}</h1>
                    </div>
                    <button
                        onClick={() => loadData(true)}
                        disabled={refreshing}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 self-start sm:self-auto"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-300 text-sm flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 shrink-0" /> {error}
                    </div>
                )}

                {/* ── Join code card ──────────────────────────────────── */}
                <div className="rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 p-6 text-white shadow-lg shadow-cyan-500/20">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <p className="text-cyan-100 text-sm font-medium mb-1">Class Join Code</p>
                            <p className="text-5xl font-black font-mono tracking-[0.35em]">{classroom.joinCode}</p>
                            <p className="text-cyan-100 text-sm mt-2">Share this with your students so they can join</p>
                        </div>
                        <button
                            onClick={copyJoinCode}
                            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 font-semibold transition-colors self-start sm:self-auto"
                        >
                            {codeCopied ? <><CheckCheck className="w-5 h-5" /> Copied!</> : <><Copy className="w-5 h-5" /> Copy Code</>}
                        </button>
                    </div>
                </div>

                {/* ── Stats row ───────────────────────────────────────── */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5">
                        <div className="flex items-center gap-3 mb-1">
                            <Users className="w-5 h-5 text-cyan-500" />
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Students</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{students.length}</p>
                    </div>
                    <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5">
                        <div className="flex items-center gap-3 mb-1">
                            <BookOpen className="w-5 h-5 text-purple-500" />
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Lessons</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{avgLessons}</p>
                    </div>
                    <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 col-span-2 sm:col-span-1">
                        <div className="flex items-center gap-3 mb-1">
                            <Trophy className="w-5 h-5 text-yellow-500" />
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Top Student</span>
                        </div>
                        <p className="text-xl font-bold text-gray-900 dark:text-white truncate">
                            {topStudents[0] ? `@${topStudents[0].username}` : '—'}
                        </p>
                    </div>
                </div>

                {/* ── Podium (top 3) ──────────────────────────────────── */}
                {topStudents.length > 0 && (
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Top of the Class</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {topStudents.map((s, i) => (
                                <div key={s.uid} className={`rounded-2xl p-4 border flex items-center gap-3 ${
                                    i === 0
                                        ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                                        : i === 1
                                        ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                                        : 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-900'
                                }`}>
                                    <span className="text-2xl font-black text-gray-400">{['🥇','🥈','🥉'][i]}</span>
                                    <div className="min-w-0">
                                        <p className="font-bold text-gray-900 dark:text-white truncate">@{s.username}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{s.completedLessons.length} lessons · {s.totalStars} ⭐</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Student list ────────────────────────────────────── */}
                <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                        All Students
                        <span className="ml-2 text-sm font-normal text-gray-400">({students.length})</span>
                    </h2>

                    {students.length === 0 ? (
                        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-10 text-center">
                            <Users className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                            <p className="font-semibold text-gray-600 dark:text-gray-400">No students yet</p>
                            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                                Share the join code above and students will appear here when they sign up.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {students.map((s, idx) => {
                                const isExpanded = expandedStudent === s.uid;
                                return (
                                    <div key={s.uid}
                                        className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden">
                                        {/* Row */}
                                        <button
                                            onClick={() => setExpandedStudent(isExpanded ? null : s.uid)}
                                            className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
                                        >
                                            {/* Rank */}
                                            <span className="w-7 text-center text-sm font-bold text-gray-400">
                                                #{idx + 1}
                                            </span>

                                            {/* Avatar */}
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                                {s.name.charAt(0).toUpperCase()}
                                            </div>

                                            {/* Name + username */}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-gray-900 dark:text-white truncate">{s.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">@{s.username}</p>
                                            </div>

                                            {/* Stats */}
                                            <div className="hidden sm:flex items-center gap-4 text-sm">
                                                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                                                    <BookOpen className="w-4 h-4 text-purple-400" />
                                                    <span className="font-semibold">{s.completedLessons.length}</span>
                                                    <span className="text-gray-400">lessons</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                                                    <Star className="w-4 h-4 text-yellow-400" />
                                                    <span className="font-semibold">{s.totalStars}</span>
                                                </div>
                                                <div className="text-xs text-gray-400 w-16 text-right">
                                                    {timeAgo(s.lastActive)}
                                                </div>
                                            </div>

                                            {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
                                        </button>

                                        {/* Expanded detail */}
                                        {isExpanded && (
                                            <div className="px-4 pb-4 pt-0 border-t border-gray-100 dark:border-gray-800">
                                                {/* Mobile stats */}
                                                <div className="sm:hidden flex items-center gap-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                                                    <div className="flex items-center gap-1">
                                                        <BookOpen className="w-4 h-4 text-purple-400" />
                                                        <span className="font-semibold">{s.completedLessons.length}</span> lessons
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Star className="w-4 h-4 text-yellow-400" />
                                                        <span className="font-semibold">{s.totalStars}</span>
                                                    </div>
                                                    <span className="text-gray-400 text-xs">{timeAgo(s.lastActive)}</span>
                                                </div>

                                                {/* Completed lessons list */}
                                                <div className="mt-3">
                                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                                        Completed Lessons
                                                    </p>
                                                    {s.completedLessons.length === 0 ? (
                                                        <p className="text-sm text-gray-400">No lessons completed yet.</p>
                                                    ) : (
                                                        <div className="flex flex-wrap gap-2">
                                                            {s.completedLessons.slice(0, 20).map(id => (
                                                                <span key={id}
                                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium">
                                                                    <CheckCircle2 className="w-3 h-3" />
                                                                    {id}
                                                                </span>
                                                            ))}
                                                            {s.completedLessons.length > 20 && (
                                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 text-xs">
                                                                    +{s.completedLessons.length - 20} more
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Streak */}
                                                {s.currentStreak > 0 && (
                                                    <div className="mt-3 flex items-center gap-1.5 text-sm text-orange-500 dark:text-orange-400 font-semibold">
                                                        🔥 {s.currentStreak}-day streak
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

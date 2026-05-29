import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
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
                    const userSnap = await getDoc(doc(db, 'users', uid));
                    const userData = userSnap.exists() ? userSnap.data() : {};

                    const progressSnap = await getDoc(doc(db, 'users', uid, 'progress', 'classroom'));
                    const completedLessons: string[] = progressSnap.exists()
                        ? (progressSnap.data().completedLessons ?? [])
                        : [];

                    const starsSnap = await getDoc(doc(db, 'users', uid, 'economy', 'stars'));
                    const totalStars: number = starsSnap.exists() ? (starsSnap.data().totalEarned ?? 0) : 0;
                    const currentStreak: number = starsSnap.exists() ? (starsSnap.data().currentStreak ?? 0) : 0;

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
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Failed to load classroom data.');
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

    // ── Loading ───────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-cyan-500 animate-spin" />
            </div>
        );
    }

    // ── No classroom yet — compact inline form, not a hero ────────────────────

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
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : 'Failed to create classroom.');
            } finally {
                setCreating(false);
            }
        };

        return (
            <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
                    <header className="mb-6">
                        <div className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wide mb-1">Teacher</div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Class</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            You don't have a classroom yet. Create one to get a join code for your students.
                        </p>
                    </header>

                    <form onSubmit={handleCreate} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-2">
                            Class name
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newClassName}
                                onChange={(e) => setNewClassName(e.target.value)}
                                className="flex-1 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-gray-900 dark:text-white text-sm"
                                placeholder="e.g. Grade 8 Python, Period 3"
                                maxLength={60}
                                autoFocus
                            />
                            <button
                                type="submit"
                                disabled={creating || !newClassName.trim()}
                                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
                            </button>
                        </div>
                        {error && (
                            <div className="mt-3 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />{error}
                            </div>
                        )}
                    </form>
                </div>
            </div>
        );
    }

    // ── Main render ───────────────────────────────────────────────────────────

    const avgLessons = students.length
        ? Math.round(students.reduce((sum, s) => sum + s.completedLessons.length, 0) / students.length)
        : 0;
    const topStudent = students[0];

    return (
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                        <div className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wide">Teacher</div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white truncate">{classroom.className}</h1>
                    </div>
                    <button
                        onClick={() => loadData(true)}
                        disabled={refreshing}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>

                {error && (
                    <div className="px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-300 text-sm flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                    </div>
                )}

                {/* Join code — compact inline row, not a hero */}
                <div className="flex items-center gap-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-5 py-4">
                    <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Join Code</div>
                        <div className="font-mono font-black text-2xl tracking-[0.3em] text-gray-900 dark:text-white mt-0.5">
                            {classroom.joinCode}
                        </div>
                    </div>
                    <button
                        onClick={copyJoinCode}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold transition-colors flex-shrink-0"
                    >
                        {codeCopied ? <><CheckCheck className="w-4 h-4" /> Copied</> : <><Copy className="w-4 h-4" /> Copy</>}
                    </button>
                </div>

                {/* Stats — inline strip inside one card, not a 3-col grid of boxes */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-5 py-4 grid grid-cols-3 gap-4">
                    <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Students</div>
                        <div className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{students.length}</div>
                    </div>
                    <div className="border-l border-gray-100 dark:border-gray-700 pl-4">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Avg. Lessons</div>
                        <div className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{avgLessons}</div>
                    </div>
                    <div className="border-l border-gray-100 dark:border-gray-700 pl-4 min-w-0">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Top Student</div>
                        <div className="text-sm font-bold text-gray-900 dark:text-white mt-0.5 truncate">
                            {topStudent ? `@${topStudent.username}` : '—'}
                        </div>
                    </div>
                </div>

                {/* Student list */}
                <div>
                    <div className="flex items-baseline justify-between mb-3">
                        <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">All Students</h2>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{students.length} total</span>
                    </div>

                    {students.length === 0 ? (
                        <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-5 py-8 text-center">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">No students yet.</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Share the join code above; students appear here once they join.
                            </p>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden divide-y divide-gray-100 dark:divide-gray-700">
                            {students.map((s, idx) => {
                                const isExpanded = expandedStudent === s.uid;
                                return (
                                    <div key={s.uid}>
                                        <button
                                            onClick={() => setExpandedStudent(isExpanded ? null : s.uid)}
                                            className="w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors text-left"
                                        >
                                            <span className="w-5 text-xs font-bold text-gray-400 flex-shrink-0">
                                                {idx + 1}
                                            </span>
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                                {s.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold text-sm text-gray-900 dark:text-white truncate">{s.name}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">@{s.username}</div>
                                            </div>
                                            <div className="hidden sm:flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                                                <div className="flex items-center gap-1">
                                                    <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                                                    <span className="font-semibold">{s.completedLessons.length}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-3.5 h-3.5 text-yellow-400" />
                                                    <span className="font-semibold">{s.totalStars}</span>
                                                </div>
                                                <div className="text-xs text-gray-400 w-14 text-right">
                                                    {timeAgo(s.lastActive)}
                                                </div>
                                            </div>
                                            {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                                        </button>

                                        {isExpanded && (
                                            <div className="px-5 pb-4 pt-1 bg-gray-50/60 dark:bg-gray-900/30">
                                                <div className="sm:hidden flex items-center gap-4 py-2 text-xs text-gray-600 dark:text-gray-300">
                                                    <span><BookOpen className="inline w-3 h-3 mr-1 text-purple-400" /><span className="font-semibold">{s.completedLessons.length}</span> lessons</span>
                                                    <span><Star className="inline w-3 h-3 mr-1 text-yellow-400" /><span className="font-semibold">{s.totalStars}</span></span>
                                                    <span className="text-gray-400">{timeAgo(s.lastActive)}</span>
                                                </div>
                                                <div className="mt-2">
                                                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                                                        Completed Lessons
                                                    </div>
                                                    {s.completedLessons.length === 0 ? (
                                                        <p className="text-sm text-gray-400">None yet.</p>
                                                    ) : (
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {s.completedLessons.slice(0, 20).map(id => (
                                                                <span key={id}
                                                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs">
                                                                    <CheckCircle2 className="w-3 h-3" />
                                                                    {id}
                                                                </span>
                                                            ))}
                                                            {s.completedLessons.length > 20 && (
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 text-xs">
                                                                    +{s.completedLessons.length - 20} more
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                {s.currentStreak > 0 && (
                                                    <div className="mt-2 text-xs text-orange-600 dark:text-orange-400 font-medium">
                                                        {s.currentStreak}-day streak
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

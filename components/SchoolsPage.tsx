import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
    ArrowLeft, GraduationCap, MapPin, Search, Plus,
    Clock, Check, X, ShieldCheck, Loader2,
} from 'lucide-react';
import {
    listSchools,
    listPendingSchools,
    listSchoolsForRegistrar,
    approveSchool,
    rejectSchool,
} from '../services/schoolService';
import { useAuth } from '../contexts/AuthContext';
import { RegisterSchoolModal } from './RegisterSchoolModal';
import type { School } from '../types';

interface SchoolsPageProps {
    onBack: () => void;
}

const locationLine = (s: School) =>
    [s.city, s.state, s.country].filter(Boolean).join(', ');

export const SchoolsPage: React.FC<SchoolsPageProps> = ({ onBack }) => {
    const { user } = useAuth();
    const [schools, setSchools] = useState<School[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState('');
    const [registerOpen, setRegisterOpen] = useState(false);

    // Admin review queue (only fetched/shown for platform admins).
    const [pending, setPending] = useState<School[]>([]);
    // Schools this teacher registered that aren't approved yet — drives the
    // "awaiting review" banner so the registrar isn't confused by their school
    // not showing in the public list.
    const [myPending, setMyPending] = useState<School[]>([]);
    // Per-school in-flight flag so approve/reject buttons disable individually.
    const [reviewing, setReviewing] = useState<Record<string, boolean>>({});

    const isTeacher = user?.role === 'teacher';
    const isAdmin = !!user?.isAdmin;

    useEffect(() => {
        let cancelled = false;
        listSchools()
            .then(list => { if (!cancelled) setSchools(list); })
            .catch(e => { if (!cancelled) setError(e?.message ?? 'Failed to load schools.'); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, []);

    // Admin: load the pending-review queue.
    useEffect(() => {
        if (!isAdmin) { setPending([]); return; }
        let cancelled = false;
        listPendingSchools()
            .then(list => { if (!cancelled) setPending(list); })
            .catch(() => { /* non-fatal: queue just stays empty */ });
        return () => { cancelled = true; };
    }, [isAdmin]);

    // Registrar: figure out which of my schools are still awaiting approval.
    useEffect(() => {
        if (!isTeacher || !user) { setMyPending([]); return; }
        let cancelled = false;
        listSchoolsForRegistrar(user.id)
            .then(list => {
                if (!cancelled) setMyPending(list.filter(s => s.status && s.status !== 'approved'));
            })
            .catch(() => { /* non-fatal */ });
        return () => { cancelled = true; };
    }, [isTeacher, user]);

    const filtered = useMemo(() => {
        const q = filter.trim().toLowerCase();
        if (!q) return schools;
        return schools.filter(s =>
            s.name.toLowerCase().includes(q)
            || s.city?.toLowerCase().includes(q)
            || s.state?.toLowerCase().includes(q)
            || s.country?.toLowerCase().includes(q),
        );
    }, [schools, filter]);

    const handleApprove = async (school: School) => {
        if (!user) return;
        setReviewing(prev => ({ ...prev, [school.id]: true }));
        try {
            await approveSchool(school.id, user.id);
            setPending(prev => prev.filter(s => s.id !== school.id));
            // Surface it in the public list immediately, sorted by name.
            setSchools(prev =>
                [{ ...school, status: 'approved' as const }, ...prev.filter(p => p.id !== school.id)]
                    .sort((a, b) => a.name.localeCompare(b.name)),
            );
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to approve school.');
        } finally {
            setReviewing(prev => ({ ...prev, [school.id]: false }));
        }
    };

    const handleReject = async (school: School) => {
        if (!user) return;
        setReviewing(prev => ({ ...prev, [school.id]: true }));
        try {
            await rejectSchool(school.id, user.id);
            setPending(prev => prev.filter(s => s.id !== school.id));
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to reject school.');
        } finally {
            setReviewing(prev => ({ ...prev, [school.id]: false }));
        }
    };

    return (
        <div className="min-h-full bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans">
            <Helmet>
                <title>Schools on Code2Coder</title>
                <meta name="description" content="All schools registered on Code2Coder, the free in-browser Python learning platform." />
            </Helmet>

            <div className="max-w-5xl mx-auto px-6 py-14 md:py-20 text-center">
                <div className="text-left">
                    <button
                        onClick={onBack}
                        className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 mb-8 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>
                </div>

                <header className="mb-10 flex flex-col items-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 dark:bg-cyan-400/10 border border-cyan-500/20 dark:border-cyan-400/20 text-xs font-semibold tracking-[0.08em] uppercase text-cyan-700 dark:text-cyan-300 mb-4">
                        <GraduationCap className="w-3.5 h-3.5" />
                        Registered schools
                    </div>
                    <h1 className="text-4xl md:text-5xl font-semibold tracking-[-0.025em] text-gray-900 dark:text-white">
                        Schools using Code2Coder
                    </h1>
                    <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-2xl leading-relaxed">
                        Every school below has a verified teacher running classrooms on Code2Coder. If your school isn't here yet, ask a teacher to register it.
                    </p>

                    {/* Register-your-school CTA. Registration lives here, separate
                        from the classroom dashboard. Only teacher accounts can act. */}
                    <div className="mt-6">
                        {isTeacher ? (
                            <button
                                onClick={() => setRegisterOpen(true)}
                                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl shadow-md shadow-cyan-500/25 transition-all"
                            >
                                <Plus className="w-4 h-4" />
                                Register your school
                            </button>
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {user
                                    ? 'Only teacher accounts can register a school.'
                                    : 'Are you a teacher? Sign in with a teacher account to register your school here.'}
                            </p>
                        )}
                    </div>
                </header>

                {/* Registrar's pending schools — awaiting platform-admin review. */}
                {myPending.length > 0 && (
                    <div className="mb-8 text-left space-y-2">
                        {myPending.map(s => (
                            <div
                                key={s.id}
                                className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 text-sm text-amber-800 dark:text-amber-200"
                            >
                                <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                <span>
                                    {s.status === 'rejected' ? (
                                        <><strong>{s.name}</strong> wasn't approved. Reach out if you think this is a mistake.</>
                                    ) : (
                                        <><strong>{s.name}</strong> is awaiting review by a Code2Coder admin. It'll appear in the list below once approved.</>
                                    )}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Admin review queue. Only platform admins see this. */}
                {isAdmin && (
                    <section className="mb-10 text-left">
                        <div className="flex items-center gap-2 mb-3">
                            <ShieldCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                            <h2 className="text-sm font-semibold tracking-[0.08em] uppercase text-gray-700 dark:text-gray-300">
                                Pending review {pending.length > 0 && `(${pending.length})`}
                            </h2>
                        </div>
                        {pending.length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400 px-1">Nothing awaiting review.</p>
                        ) : (
                            <ul className="space-y-3">
                                {pending.map(s => {
                                    const busy = !!reviewing[s.id];
                                    const loc = locationLine(s);
                                    return (
                                        <li
                                            key={s.id}
                                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
                                        >
                                            <div className="min-w-0">
                                                <h3 className="text-base font-semibold text-gray-900 dark:text-white">{s.name}</h3>
                                                {loc && (
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        <MapPin className="w-3 h-3 flex-shrink-0" />
                                                        <span className="truncate">{loc}</span>
                                                    </div>
                                                )}
                                                {s.notes && (
                                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">{s.notes}</p>
                                                )}
                                                {s.registrarName && (
                                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
                                                        Registered by {s.registrarName}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <button
                                                    onClick={() => handleApprove(s)}
                                                    disabled={busy}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                                >
                                                    {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleReject(s)}
                                                    disabled={busy}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold bg-gray-100 dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-300 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                                >
                                                    <X className="w-4 h-4" />
                                                    Reject
                                                </button>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </section>
                )}

                <div className="relative mb-8 max-w-xl mx-auto">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                        placeholder="Search by school name, city, or country..."
                        className="w-full pl-11 pr-4 py-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40 transition-colors text-left"
                    />
                </div>

                {loading && (
                    <div className="text-center py-16 text-gray-400">Loading schools…</div>
                )}

                {error && !loading && (
                    <div className="text-center py-16 text-red-500">{error}</div>
                )}

                {!loading && !error && filtered.length === 0 && (
                    <div className="text-center py-16">
                        <p className="text-gray-500 dark:text-gray-400">
                            {schools.length === 0
                                ? 'No schools registered yet — be the first.'
                                : `No schools match "${filter}".`}
                        </p>
                    </div>
                )}

                {!loading && !error && filtered.length > 0 && (
                    <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
                        {filtered.map(s => (
                            <li
                                key={s.id}
                                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:border-cyan-500/40 dark:hover:border-cyan-400/40 transition-colors"
                            >
                                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                                    {s.name}
                                </h3>
                                {locationLine(s) && (
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-2">
                                        <MapPin className="w-3 h-3 flex-shrink-0" />
                                        <span className="truncate">{locationLine(s)}</span>
                                    </div>
                                )}
                                {s.registrarName && (
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
                                        Registered by {s.registrarName}
                                    </p>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {isTeacher && user && (
                <RegisterSchoolModal
                    isOpen={registerOpen}
                    onClose={() => setRegisterOpen(false)}
                    teacherId={user.id}
                    teacherName={user.name}
                    onRegistered={(s) =>
                        // New schools start pending → don't add to the public list;
                        // surface them in the registrar's "awaiting review" banner.
                        setMyPending(prev => [s, ...prev.filter(p => p.id !== s.id)])
                    }
                />
            )}
        </div>
    );
};

import React, { useEffect, useMemo, useState } from 'react';
import { GraduationCap, Search, Loader2, MapPin, Check } from 'lucide-react';
import { listSchools, requestSchoolJoin, markSchoolPromptSeen } from '../services/schoolService';
import type { School, User } from '../types';

interface SchoolPromptModalProps {
    user: User;
    /** Called after the prompt resolves (joined or skipped). Parent should
     *  refresh the user and stop rendering this modal. */
    onDone: () => void;
}

/**
 * One-time "Are you part of a school?" prompt for existing users who signed up
 * before schools existed. Parent decides whether to render it (based on
 * !schoolId && !schoolJoinPending && !schoolPromptSeen && role !== 'teacher').
 * Either choice flips schoolPromptSeen so it never shows again.
 */
export const SchoolPromptModal: React.FC<SchoolPromptModalProps> = ({ user, onDone }) => {
    const [schools, setSchools] = useState<School[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        let cancelled = false;
        listSchools()
            .then(list => { if (!cancelled) setSchools(list); })
            .catch(() => { /* non-fatal — empty list shows the skip path */ })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, []);

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

    const handlePick = async (school: School) => {
        if (submitting) return;
        setSubmitting(true);
        try {
            await requestSchoolJoin(user, school.id);
            await markSchoolPromptSeen(user.id);
        } catch {
            // Best-effort; still mark seen so we don't nag on every login.
            try { await markSchoolPromptSeen(user.id); } catch { /* ignore */ }
        } finally {
            setSubmitting(false);
            onDone();
        }
    };

    const handleSkip = async () => {
        if (submitting) return;
        setSubmitting(true);
        try {
            await markSchoolPromptSeen(user.id);
        } catch {
            /* ignore — worst case it shows once more */
        } finally {
            setSubmitting(false);
            onDone();
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 w-full max-w-lg max-h-[90vh] flex flex-col">
                <div className="flex items-start gap-3 p-5 border-b border-gray-200 dark:border-gray-800">
                    <div className="w-9 h-9 rounded-lg bg-cyan-500/10 dark:bg-cyan-400/10 border border-cyan-500/20 dark:border-cyan-400/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400 flex-shrink-0">
                        <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Are you part of a school?</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Join your school to appear on its leaderboard and let your teacher add you to classes. Totally optional.
                        </p>
                    </div>
                </div>

                <div className="p-5 flex-1 overflow-y-auto">
                    <div className="relative mb-4">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={filter}
                            onChange={e => setFilter(e.target.value)}
                            placeholder="Search for your school..."
                            disabled={submitting}
                            autoFocus
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40 transition-colors disabled:opacity-50"
                        />
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-12 text-gray-400">
                            <Loader2 className="w-5 h-5 animate-spin" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-10 text-sm text-gray-500 dark:text-gray-400">
                            {filter
                                ? `No schools match "${filter}".`
                                : 'No schools registered yet. You can join one later from the Schools page.'}
                        </div>
                    ) : (
                        <ul className="space-y-2">
                            {filtered.map(s => (
                                <li key={s.id}>
                                    <button
                                        onClick={() => handlePick(s)}
                                        disabled={submitting}
                                        className="w-full flex items-center justify-between gap-3 text-left px-4 py-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-cyan-500/50 dark:hover:border-cyan-400/50 hover:bg-cyan-50/50 dark:hover:bg-cyan-900/10 transition-colors disabled:opacity-50 group"
                                    >
                                        <div className="min-w-0">
                                            <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">{s.name}</div>
                                            {(s.city || s.state || s.country) && (
                                                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                    <MapPin className="w-3 h-3 flex-shrink-0" />
                                                    <span className="truncate">{[s.city, s.state, s.country].filter(Boolean).join(', ')}</span>
                                                </div>
                                            )}
                                        </div>
                                        <Check className="w-4 h-4 text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="flex items-center justify-end gap-2 p-5 border-t border-gray-200 dark:border-gray-800">
                    <button
                        onClick={handleSkip}
                        disabled={submitting}
                        className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50"
                    >
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Not now'}
                    </button>
                </div>
            </div>
        </div>
    );
};

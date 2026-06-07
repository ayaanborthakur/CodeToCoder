import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, GraduationCap, MapPin, Search } from 'lucide-react';
import { listSchools } from '../services/schoolService';
import type { School } from '../types';

interface SchoolsPageProps {
    onBack: () => void;
}

export const SchoolsPage: React.FC<SchoolsPageProps> = ({ onBack }) => {
    const [schools, setSchools] = useState<School[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        let cancelled = false;
        listSchools()
            .then(list => { if (!cancelled) setSchools(list); })
            .catch(e => { if (!cancelled) setError(e?.message ?? 'Failed to load schools.'); })
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

    return (
        <div className="min-h-full bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans">
            <Helmet>
                <title>Schools on Code2Coder</title>
                <meta name="description" content="All schools registered on Code2Coder, the free in-browser Python learning platform." />
            </Helmet>

            <div className="max-w-5xl mx-auto px-6 py-14 md:py-20">
                <button
                    onClick={onBack}
                    className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>

                <header className="mb-10">
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
                </header>

                <div className="relative mb-8">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                        placeholder="Search by school name, city, or country..."
                        className="w-full pl-11 pr-4 py-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40 transition-colors"
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
                            {filter ? `No schools match "${filter}".` : 'No schools registered yet — be the first.'}
                        </p>
                    </div>
                )}

                {!loading && !error && filtered.length > 0 && (
                    <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map(s => (
                            <li
                                key={s.id}
                                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:border-cyan-500/40 dark:hover:border-cyan-400/40 transition-colors"
                            >
                                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                                    {s.name}
                                </h3>
                                {(s.city || s.state || s.country) && (
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-2">
                                        <MapPin className="w-3 h-3 flex-shrink-0" />
                                        <span className="truncate">
                                            {[s.city, s.state, s.country].filter(Boolean).join(', ')}
                                        </span>
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
        </div>
    );
};

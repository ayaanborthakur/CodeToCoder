import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Assignment, Classroom } from '../types';
import { assignmentOpenPath, assignmentTitle } from '../utils/assignmentDisplay';
import { Button, Card, Page, PageHeader } from './ui';

export interface CalendarEntry {
    assignment: Assignment;
    /** Teachers see which class an assignment belongs to. */
    classroom?: Classroom;
    done?: boolean;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

/**
 * Due dates by month, for students (their assignments) and teachers (every
 * class's assignments). Phones get the same dates as a list.
 */
export const CalendarPage: React.FC<{ entries: CalendarEntry[]; isTeacher: boolean }> = ({ entries, isTeacher }) => {
    const [month, setMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
    const today = dayKey(new Date());

    const byDay = useMemo(() => {
        const map = new Map<string, CalendarEntry[]>();
        entries.filter(e => e.assignment.dueAt !== null).forEach(e => {
            const k = dayKey(new Date(e.assignment.dueAt!));
            map.set(k, [...(map.get(k) ?? []), e]);
        });
        map.forEach(list => list.sort((a, b) => a.assignment.dueAt! - b.assignment.dueAt!));
        return map;
    }, [entries]);

    // Six weeks starting on the Sunday on or before the 1st.
    const days = useMemo(() => {
        const start = new Date(month);
        start.setDate(1 - start.getDay());
        return Array.from({ length: 42 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d; });
    }, [month]);

    const inMonth = entries
        .filter(e => e.assignment.dueAt !== null && new Date(e.assignment.dueAt).getMonth() === month.getMonth() && new Date(e.assignment.dueAt).getFullYear() === month.getFullYear())
        .sort((a, b) => a.assignment.dueAt! - b.assignment.dueAt!);

    const href = (e: CalendarEntry) => isTeacher && e.classroom
        ? `/teacher/${e.classroom.classId}/assignments/${e.assignment.id}`
        : assignmentOpenPath(e.assignment);
    const shift = (n: number) => setMonth(m => new Date(m.getFullYear(), m.getMonth() + n, 1));
    const label = month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

    const chip = (e: CalendarEntry) => {
        const past = e.assignment.dueAt! < Date.now();
        const tone = e.done ? 'bg-green-50 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
            : past && !isTeacher ? 'bg-red-50 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
            : 'bg-cyan-50 text-cyan-900 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-200 dark:border-cyan-800';
        return (
            <Link key={`${e.classroom?.classId ?? ''}${e.assignment.id}`} to={href(e)} className={`no-hover block truncate rounded-md border px-1.5 py-0.5 text-xs font-medium ${tone}`} title={`${assignmentTitle(e.assignment)}${e.classroom ? ` · ${e.classroom.className}` : ''}`}>
                {assignmentTitle(e.assignment)}
            </Link>
        );
    };

    return (
        <Page width="wide">
            <PageHeader
                title="Calendar"
                description={isTeacher ? 'Due dates across all your classes.' : 'When your assignments are due.'}
                actions={
                    <div className="flex items-center gap-2">
                        <Button onClick={() => shift(-1)} icon={<ChevronLeft className="w-4 h-4" />} aria-label="Previous month" />
                        <span className="min-w-[10rem] text-center text-lg font-semibold text-gray-900 dark:text-white">{label}</span>
                        <Button onClick={() => shift(1)} icon={<ChevronRight className="w-4 h-4" />} aria-label="Next month" />
                        <Button onClick={() => { const d = new Date(); setMonth(new Date(d.getFullYear(), d.getMonth(), 1)); }}>Today</Button>
                    </div>
                }
            />

            {entries.length === 0 && (
                <p className="mb-4 text-gray-600 dark:text-gray-400">{isTeacher ? 'Assignments you give with a due date appear here.' : 'No due dates yet. When your teacher sets them, they appear here.'}</p>
            )}
                <>
                    <Card padded={false} className="hidden md:block overflow-hidden">
                        <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                            {WEEKDAYS.map(d => <div key={d} className="px-3 py-2 text-sm font-semibold text-gray-600 dark:text-gray-400">{d}</div>)}
                        </div>
                        <div className="grid grid-cols-7">
                            {days.map((d, i) => {
                                const k = dayKey(d);
                                const list = byDay.get(k) ?? [];
                                const other = d.getMonth() !== month.getMonth();
                                return (
                                    <div key={i} className={`min-h-[7.5rem] p-2 border-b border-r border-gray-100 dark:border-gray-700/60 ${(i + 1) % 7 === 0 ? 'border-r-0' : ''} ${other ? 'bg-gray-50/70 dark:bg-gray-900/40' : ''}`}>
                                        <div className={`mb-1 text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full ${k === today ? 'bg-cyan-700 text-white' : other ? 'text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>{d.getDate()}</div>
                                        <div className="space-y-1">{list.slice(0, 3).map(chip)}{list.length > 3 && <div className="text-xs text-gray-500">+{list.length - 3} more</div>}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>

                    <div className="md:hidden">
                        {inMonth.length === 0 ? (
                            <p className="text-gray-600 dark:text-gray-400">Nothing due in {label}.</p>
                        ) : (
                            <ul className="space-y-2">
                                {inMonth.map(e => (
                                    <li key={`${e.classroom?.classId ?? ''}${e.assignment.id}`}>
                                        <Link to={href(e)} className="no-hover flex items-center gap-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-3">
                                            <span className="w-12 text-center">
                                                <span className="block text-xs font-semibold text-gray-500">{new Date(e.assignment.dueAt!).toLocaleDateString(undefined, { weekday: 'short' })}</span>
                                                <span className="block text-xl font-bold text-gray-900 dark:text-white">{new Date(e.assignment.dueAt!).getDate()}</span>
                                            </span>
                                            <span className="min-w-0">
                                                <span className="block font-semibold text-gray-900 dark:text-white truncate">{assignmentTitle(e.assignment)}</span>
                                                <span className="block text-sm text-gray-600 dark:text-gray-400">{e.classroom ? `${e.classroom.className} · ` : ''}{new Date(e.assignment.dueAt!).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}{e.done ? ' · Done' : ''}</span>
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </>
        </Page>
    );
};

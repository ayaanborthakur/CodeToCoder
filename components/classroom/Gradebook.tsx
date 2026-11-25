import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download } from 'lucide-react';
import type { Assignment, Module, Submission } from '../../types';
import type { AssignmentState, StudentProgress } from '../../services/classroomProgressService';
import { assignmentState, assignmentTargets, isAssignmentDone } from '../../services/classroomProgressService';
import { assignmentPoints } from '../../services/assignmentsService';
import { submissionId } from '../../services/submissionsService';
import { assignmentTitle } from '../../utils/assignmentDisplay';
import { Button, EmptyState } from '../ui';

interface Cell { state: AssignmentState | 'not-assigned'; score: number | null }

// CodeHS-style status colours, so a teacher can read the grid at a glance.
const CELL_TONE: Record<Cell['state'], string> = {
    graded: 'bg-green-50 dark:bg-green-900/25',
    submitted: 'bg-cyan-50 dark:bg-cyan-900/30',
    late: 'bg-amber-50 dark:bg-amber-900/25',
    missing: 'bg-red-50 dark:bg-red-900/25',
    todo: '',
    'not-assigned': 'bg-gray-50 dark:bg-gray-900/40',
};
const LEGEND: { state: Cell['state']; label: string; swatch: string }[] = [
    { state: 'graded', label: 'Graded', swatch: 'bg-green-100 border-green-300 dark:bg-green-900/50 dark:border-green-700' },
    { state: 'submitted', label: 'To grade', swatch: 'bg-cyan-100 border-cyan-300 dark:bg-cyan-900/50 dark:border-cyan-700' },
    { state: 'late', label: 'Late', swatch: 'bg-amber-100 border-amber-300 dark:bg-amber-900/50 dark:border-amber-700' },
    { state: 'missing', label: 'Missing', swatch: 'bg-red-100 border-red-300 dark:bg-red-900/50 dark:border-red-700' },
    { state: 'todo', label: 'Not started', swatch: 'bg-white border-gray-300 dark:bg-gray-800 dark:border-gray-600' },
];
const PRACTICE = '__practice';

const pct = (earned: number, possible: number) => (possible > 0 ? Math.round((earned / possible) * 100) : null);

/**
 * Students down the side, assignments across the top. Each cell shows the
 * score, or where the student is if it isn't graded; clicking opens grading.
 */
export const Gradebook: React.FC<{
    base: string;
    className: string;
    assignments: Assignment[];
    students: StudentProgress[];
    submissions: Map<string, Submission>;
    modules?: Module[];
}> = ({ base, className, assignments, students, submissions, modules = [] }) => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('');
    const moduleOf = (a: Assignment) => (a.kind === 'practice' ? PRACTICE : a.moduleId ?? modules.find(m => m.lessons.some(l => l.id === a.lessonId))?.id ?? '');
    const filters = useMemo(() => {
        const used = new Set(assignments.map(moduleOf));
        const list = modules.filter(m => used.has(m.id)).map(m => ({ id: m.id, title: m.title }));
        if (used.has(PRACTICE)) list.push({ id: PRACTICE, title: 'Practice' });
        return list;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [assignments, modules]);
    const columns = useMemo(
        () => [...assignments]
            .filter(a => !filter || moduleOf(a) === filter)
            .sort((a, b) => (a.dueAt ?? a.assignedAt) - (b.dueAt ?? b.assignedAt)),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [assignments, filter, modules],
    );

    const grid = useMemo(() => students.map(s => {
        const cells: Cell[] = columns.map(a => {
            if (!assignmentTargets(a, s.uid)) return { state: 'not-assigned', score: null };
            const sub = submissions.get(submissionId(a.id, s.uid));
            const finished = isAssignmentDone(a, s.completedLessons, s.completedPractice);
            return { state: assignmentState(a, sub, finished), score: typeof sub?.score === 'number' ? sub.score : null };
        });
        // Total counts graded work plus missing work (as zero), like most gradebooks.
        let earned = 0;
        let possible = 0;
        cells.forEach((c, i) => {
            if (c.score !== null) { earned += c.score; possible += assignmentPoints(columns[i]); }
            else if (c.state === 'missing') { possible += assignmentPoints(columns[i]); }
        });
        return { student: s, cells, total: pct(earned, possible) };
    }), [students, columns, submissions]);

    const columnAverage = (i: number) => {
        const scores = grid.map(r => r.cells[i].score).filter((x): x is number => x !== null);
        if (!scores.length) return null;
        return pct(scores.reduce((a, b) => a + b, 0), scores.length * assignmentPoints(columns[i]));
    };

    const exportCsv = () => {
        const quote = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
        const header = ['Student', 'Username', ...columns.map(a => `${assignmentTitle(a)} (${assignmentPoints(a)})`), 'Total %'];
        const lines = grid.map(r => [
            r.student.name,
            r.student.username,
            ...r.cells.map(c => (c.score !== null ? c.score : c.state === 'missing' ? 'Missing' : c.state === 'not-assigned' ? '' : c.state === 'todo' ? '' : 'Submitted')),
            r.total ?? '',
        ]);
        const csv = [header, ...lines].map(row => row.map(quote).join(',')).join('\n');
        const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = `${className.replace(/[^\w-]+/g, '_')}_grades.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    if (assignments.length === 0 || students.length === 0) {
        return (
            <EmptyState
                title={assignments.length === 0 ? 'No assignments yet' : 'No students yet'}
                description="The gradebook fills in as you assign work and students hand it in."
            />
        );
    }

    return (
        <>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div className="flex flex-wrap items-center gap-3">
                    {filters.length > 1 && (
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Show
                            <select value={filter} onChange={e => setFilter(e.target.value)} className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-900 dark:text-white">
                                <option value="">All assignments</option>
                                {filters.map(f => <option key={f.id} value={f.id}>{f.title}</option>)}
                            </select>
                        </label>
                    )}
                    <ul className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600 dark:text-gray-400" aria-label="Key">
                        {LEGEND.map(l => (
                            <li key={l.state} className="flex items-center gap-1.5"><span className={`w-3.5 h-3.5 rounded border ${l.swatch}`} aria-hidden="true" />{l.label}</li>
                        ))}
                    </ul>
                </div>
                <Button size="sm" icon={<Download className="w-3.5 h-3.5" />} onClick={exportCsv}>Export CSV</Button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Click a cell to grade it. Missing work counts as zero in the total.</p>
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <table className="min-w-full text-sm border-separate border-spacing-0">
                    <thead>
                        <tr>
                            <th scope="col" className="sticky left-0 z-10 bg-gray-50 dark:bg-gray-900 text-left px-4 py-2.5 font-semibold text-gray-700 dark:text-gray-300 border-b border-r border-gray-200 dark:border-gray-700 min-w-[180px]">Student</th>
                            {columns.map(a => (
                                <th key={a.id} scope="col" className="bg-gray-50 dark:bg-gray-900 px-3 py-2.5 font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 min-w-[110px] max-w-[160px] text-left align-bottom">
                                    <button onClick={() => navigate(`${base}/assignments/${a.id}`)} className="no-hover block w-full text-left hover:text-cyan-600 dark:hover:text-cyan-400">
                                        <span className="block truncate" title={assignmentTitle(a)}>{assignmentTitle(a)}</span>
                                        <span className="block text-xs font-normal text-gray-500 dark:text-gray-400">
                                            {a.dueAt ? new Date(a.dueAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'No due date'} · {assignmentPoints(a)} pts
                                        </span>
                                    </button>
                                </th>
                            ))}
                            <th scope="col" className="bg-gray-50 dark:bg-gray-900 px-4 py-2.5 font-semibold text-gray-700 dark:text-gray-300 border-b border-l border-gray-200 dark:border-gray-700 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {grid.map(r => (
                            <tr key={r.student.uid} className="group">
                                <th scope="row" className="sticky left-0 z-10 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/60 text-left px-4 py-2 font-medium text-gray-900 dark:text-white border-b border-r border-gray-100 dark:border-gray-700 whitespace-nowrap">
                                    {r.student.name}
                                </th>
                                {r.cells.map((c, i) => (
                                    <td key={columns[i].id} className={`border-b border-r border-white dark:border-gray-800 p-0 ${CELL_TONE[c.score !== null ? 'graded' : c.state]}`}>
                                        {c.state === 'not-assigned' ? (
                                            <span className="block px-3 py-2 text-gray-300 dark:text-gray-600" aria-label="Not assigned">·</span>
                                        ) : (
                                            <button
                                                onClick={() => navigate(`${base}/assignments/${columns[i].id}?student=${r.student.uid}`)}
                                                className="no-hover block w-full px-3 py-2 text-left hover:ring-2 hover:ring-inset hover:ring-cyan-500"
                                            >
                                                <CellLabel cell={c} points={assignmentPoints(columns[i])} />
                                            </button>
                                        )}
                                    </td>
                                ))}
                                <td className="border-b border-l border-gray-100 dark:border-gray-700 px-4 py-2 text-right font-semibold tabular-nums text-gray-900 dark:text-white group-hover:bg-gray-50 dark:group-hover:bg-gray-700/60">
                                    {r.total === null ? '—' : `${r.total}%`}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <th scope="row" className="sticky left-0 z-10 bg-gray-50 dark:bg-gray-900 text-left px-4 py-2 font-semibold text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700">Class average</th>
                            {columns.map((a, i) => {
                                const avg = columnAverage(i);
                                return <td key={a.id} className="bg-gray-50 dark:bg-gray-900 px-3 py-2 font-semibold tabular-nums text-gray-600 dark:text-gray-400">{avg === null ? '—' : `${avg}%`}</td>;
                            })}
                            <td className="bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700" />
                        </tr>
                    </tfoot>
                </table>
            </div>
        </>
    );
};

const CellLabel: React.FC<{ cell: Cell; points: number }> = ({ cell, points }) => {
    if (cell.score !== null) return <span className="font-semibold tabular-nums text-gray-900 dark:text-white">{cell.score}<span className="text-gray-400 font-normal">/{points}</span></span>;
    switch (cell.state) {
        case 'submitted': return <span className="text-cyan-700 dark:text-cyan-400 font-medium">To grade</span>;
        case 'late': return <span className="text-amber-700 dark:text-amber-400 font-medium">Late</span>;
        case 'missing': return <span className="text-red-600 dark:text-red-400 font-medium">Missing</span>;
        default: return <span className="text-gray-400">—</span>;
    }
};

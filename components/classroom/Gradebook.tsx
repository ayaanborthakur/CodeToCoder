import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download } from 'lucide-react';
import type { Assignment, Submission } from '../../types';
import type { AssignmentState, StudentProgress } from '../../services/classroomProgressService';
import { assignmentState, assignmentTargets, isAssignmentDone } from '../../services/classroomProgressService';
import { assignmentPoints } from '../../services/assignmentsService';
import { submissionId } from '../../services/submissionsService';
import { assignmentTitle } from '../../utils/assignmentDisplay';
import { Button, EmptyState } from '../ui';

interface Cell { state: AssignmentState | 'not-assigned'; score: number | null }

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
}> = ({ base, className, assignments, students, submissions }) => {
    const navigate = useNavigate();
    const columns = useMemo(
        () => [...assignments].sort((a, b) => (a.dueAt ?? a.assignedAt) - (b.dueAt ?? b.assignedAt)),
        [assignments],
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

    if (columns.length === 0 || students.length === 0) {
        return (
            <EmptyState
                title={columns.length === 0 ? 'No assignments yet' : 'No students yet'}
                description="The gradebook fills in as you assign work and students hand it in."
            />
        );
    }

    return (
        <>
            <div className="flex items-center justify-between gap-3 mb-3">
                <p className="text-sm text-gray-500 dark:text-gray-400">Click a cell to grade it. Missing work counts as zero in the total.</p>
                <Button size="sm" icon={<Download className="w-3.5 h-3.5" />} onClick={exportCsv}>Export CSV</Button>
            </div>
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
                                    <td key={columns[i].id} className="border-b border-gray-100 dark:border-gray-700 p-0 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/60">
                                        {c.state === 'not-assigned' ? (
                                            <span className="block px-3 py-2 text-gray-300 dark:text-gray-600" aria-label="Not assigned">·</span>
                                        ) : (
                                            <button
                                                onClick={() => navigate(`${base}/assignments/${columns[i].id}?student=${r.student.uid}`)}
                                                className="no-hover block w-full px-3 py-2 text-left hover:bg-cyan-50 dark:hover:bg-cyan-900/20"
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

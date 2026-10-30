import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { Assignment } from '../types';
import { listAssignmentsForStudent } from '../services/assignmentsService';
import { isAssignmentDone } from '../services/classroomProgressService';
import { assignmentTitle, assignmentSubtitle, assignmentOpenPath, dueLabel } from '../utils/assignmentDisplay';
import { Pill } from './ui';

interface AssignmentsCardProps {
    studentId: string;
    classroomId: string;
    completedLessons: Set<string>;
    completedPracticeItems: Set<string>;
}

const MAX_SHOWN = 4;

/** The student's unfinished assignments, soonest due first. Hidden when there are none. */
export const AssignmentsCard: React.FC<AssignmentsCardProps> = ({ studentId, classroomId, completedLessons, completedPracticeItems }) => {
    const [assignments, setAssignments] = useState<Assignment[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        listAssignmentsForStudent(studentId, classroomId)
            .then(list => { if (!cancelled) setAssignments(list); })
            .catch(e => { if (!cancelled) setError(e instanceof Error ? e.message : 'Could not load assignments.'); });
        return () => { cancelled = true; };
    }, [studentId, classroomId]);

    const todo = (assignments ?? [])
        .filter(a => !isAssignmentDone(a, completedLessons, completedPracticeItems))
        .sort((a, b) => (a.dueAt ?? Infinity) - (b.dueAt ?? Infinity));

    if (!error && assignments && todo.length === 0) return null;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {error && <div className="px-5 py-4 text-sm text-red-600 dark:text-red-400">{error}</div>}
            {!error && assignments === null && <div className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">Loading…</div>}
            {todo.length > 0 && (
                <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                    {todo.slice(0, MAX_SHOWN).map(a => {
                        const due = dueLabel(a.dueAt);
                        return (
                            <li key={a.id}>
                                <Link to={assignmentOpenPath(a)} className="no-hover flex items-center gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/40 group">
                                    <div className="min-w-0 flex-1">
                                        <div className="font-semibold text-sm text-gray-900 dark:text-white truncate">{assignmentTitle(a)}</div>
                                        {assignmentSubtitle(a) && <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{assignmentSubtitle(a)}</div>}
                                    </div>
                                    <Pill tone={due.tone}>{due.text}</Pill>
                                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-cyan-500" aria-hidden="true" />
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            )}
            {todo.length > 0 && (
                <Link to="/classroom" className="no-hover block px-5 py-2.5 border-t border-gray-100 dark:border-gray-700 text-sm font-semibold text-cyan-600 dark:text-cyan-400 hover:bg-gray-50 dark:hover:bg-gray-700/40">
                    {todo.length > MAX_SHOWN ? `See all ${todo.length} in your class` : 'Open your class'}
                </Link>
            )}
        </div>
    );
};

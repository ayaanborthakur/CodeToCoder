import React, { useEffect, useState } from 'react';
import { ClipboardList, Calendar, ExternalLink } from 'lucide-react';
import type { Assignment } from '../types';
import { listAssignmentsForStudent } from '../services/assignmentsService';

interface AssignmentsCardProps {
    studentId: string;
    classroomId: string;
}

const formatDue = (dueAt: number | null): { label: string; tone: 'overdue' | 'soon' | 'later' | 'none' } => {
    if (dueAt === null) return { label: 'No due date', tone: 'none' };
    const now = Date.now();
    const diffMs = dueAt - now;
    const dayMs = 24 * 60 * 60 * 1000;
    if (diffMs < 0) return { label: 'Overdue', tone: 'overdue' };
    if (diffMs < dayMs) return { label: 'Due today', tone: 'soon' };
    if (diffMs < 3 * dayMs) return { label: `Due in ${Math.ceil(diffMs / dayMs)} days`, tone: 'soon' };
    return { label: `Due ${new Date(dueAt).toLocaleDateString()}`, tone: 'later' };
};

export const AssignmentsCard: React.FC<AssignmentsCardProps> = ({ studentId, classroomId }) => {
    const [assignments, setAssignments] = useState<Assignment[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        listAssignmentsForStudent(studentId, classroomId)
            .then(list => { if (!cancelled) setAssignments(list); })
            .catch(e => { if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load assignments.'); });
        return () => { cancelled = true; };
    }, [studentId, classroomId]);

    // Hide the card entirely when there are no assignments and no error — keeps home clean.
    if (!error && assignments && assignments.length === 0) return null;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <ClipboardList className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Your Assignments</h2>
                {assignments && assignments.length > 0 && (
                    <span className="ml-auto text-xs font-semibold px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full">
                        {assignments.length}
                    </span>
                )}
            </div>

            {error && <div className="text-sm text-red-600 dark:text-red-400">{error}</div>}

            {!error && assignments === null && (
                <div className="text-sm text-gray-500 dark:text-gray-400">Loading…</div>
            )}

            {!error && assignments && assignments.length > 0 && (
                <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                    {assignments.map(a => {
                        const due = formatDue(a.dueAt);
                        const toneClasses =
                            due.tone === 'overdue' ? 'text-red-600 dark:text-red-400' :
                            due.tone === 'soon' ? 'text-amber-700 dark:text-amber-400' :
                            'text-gray-500 dark:text-gray-400';
                        return (
                            <li key={a.id} className="py-3 flex items-center gap-3">
                                <div className="min-w-0 flex-1">
                                    <div className="font-semibold text-sm text-gray-900 dark:text-white truncate">{a.lessonTitle}</div>
                                    <div className="flex items-center gap-3 mt-0.5">
                                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{a.courseTitle}</span>
                                        <span className={`text-xs font-medium flex items-center gap-1 ${toneClasses}`}>
                                            <Calendar className="w-3 h-3" />
                                            {due.label}
                                        </span>
                                    </div>
                                </div>
                                <a
                                    href={`/lessons/${a.moduleId}/${a.lessonId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-md flex-shrink-0"
                                >
                                    Open
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

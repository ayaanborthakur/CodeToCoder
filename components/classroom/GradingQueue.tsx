import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ClipboardCheck } from 'lucide-react';
import type { TeacherClassData } from '../../hooks/useTeacherClasses';
import { assignmentPoints } from '../../services/assignmentsService';
import { assignmentSubtitle, assignmentTitle } from '../../utils/assignmentDisplay';
import { EmptyState, List, Page, PageHeader, Pill, Spinner } from '../ui';

/**
 * Everything handed in and waiting for a grade, across all of a teacher's
 * classes, grouped by assignment (CodeHS calls this the grading queue).
 */
export const GradingQueue: React.FC<{ classes: TeacherClassData[]; loaded: boolean }> = ({ classes, loaded }) => {
    const groups = classes.flatMap(({ classroom, assignments, submissions }) =>
        assignments
            .map(a => ({
                classroom,
                assignment: a,
                waiting: submissions
                    .filter(s => s.assignmentId === a.id && s.status === 'submitted' && s.submittedAt > 0)
                    .sort((x, y) => x.submittedAt - y.submittedAt),
            }))
            .filter(g => g.waiting.length > 0),
    ).sort((x, y) => x.waiting[0].submittedAt - y.waiting[0].submittedAt);

    const total = groups.reduce((n, g) => n + g.waiting.length, 0);

    return (
        <Page width="default">
            <PageHeader title="To grade" description={total ? `${total} ${total === 1 ? 'submission is' : 'submissions are'} waiting, oldest first.` : undefined} />
            {!loaded ? <Spinner label="Loading submissions" /> : groups.length === 0 ? (
                <EmptyState icon={<ClipboardCheck className="w-5 h-5" />} title="Nothing to grade" description="When students hand in work, it shows up here." />
            ) : (
                <div className="space-y-6">
                    {groups.map(({ classroom, assignment: a, waiting }) => (
                        <section key={`${classroom.classId}-${a.id}`}>
                            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                    <Link to={`/teacher/${classroom.classId}/assignments/${a.id}`} className="no-hover hover:text-cyan-700 dark:hover:text-cyan-400">{assignmentTitle(a)}</Link>
                                </h2>
                                <span className="text-gray-600 dark:text-gray-400">{classroom.className} · {assignmentSubtitle(a)} · {assignmentPoints(a)} pts</span>
                            </div>
                            <List>
                                {waiting.map(s => (
                                    <li key={s.id}>
                                        <Link to={`/teacher/${classroom.classId}/assignments/${a.id}?student=${s.studentId}`} className="no-hover flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/40">
                                            <span className="flex-1 min-w-0">
                                                <span className="block font-semibold text-gray-900 dark:text-white truncate">{s.studentName}</span>
                                                <span className="block text-sm text-gray-600 dark:text-gray-400">Handed in {new Date(s.submittedAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}{s.attempts > 1 ? ` · ${s.attempts} tries` : ''}</span>
                                            </span>
                                            {s.gradedAt !== undefined && <Pill tone="warning">Resubmitted</Pill>}
                                            {s.late && <Pill tone="warning">Late</Pill>}
                                            <Pill tone={s.passed ? 'success' : 'neutral'}>{s.passed ? 'Passed check' : 'Check not passed'}</Pill>
                                            <ChevronRight className="w-5 h-5 text-gray-400" aria-hidden="true" />
                                        </Link>
                                    </li>
                                ))}
                            </List>
                        </section>
                    ))}
                </div>
            )}
        </Page>
    );
};

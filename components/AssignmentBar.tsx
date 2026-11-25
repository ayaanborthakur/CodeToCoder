import React, { useState } from 'react';
import { ClipboardList, Send, CheckCircle2, MessageSquare } from 'lucide-react';
import type { Assignment, Submission } from '../types';
import { assignmentPoints } from '../services/assignmentsService';
import { assignmentState, STATE_LABEL, STATE_TONE } from '../services/classroomProgressService';
import { dueLabel } from '../utils/assignmentDisplay';
import { Button, Pill } from './ui';

/**
 * Shown above the editor when the open lesson or practice item is assigned:
 * due date, where the student is with it, the teacher's grade and feedback,
 * and a button to hand the current code in.
 */
export const AssignmentBar: React.FC<{
    assignment: Assignment;
    submission: Submission | undefined;
    finished: boolean;
    onSubmit: () => Promise<void>;
}> = ({ assignment, submission, finished, onSubmit }) => {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showFeedback, setShowFeedback] = useState(true);
    const state = assignmentState(assignment, submission, finished);
    const due = dueLabel(assignment.dueAt);
    const points = assignmentPoints(assignment);
    const graded = submission?.gradedAt !== undefined && typeof submission.score === 'number';

    const handleSubmit = async () => {
        setError(null);
        setSubmitting(true);
        try {
            await onSubmit();
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Couldn't submit. Check your connection and try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-800 bg-cyan-50/70 dark:bg-cyan-950/30">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2">
                <ClipboardList className="w-4 h-4 text-cyan-600 dark:text-cyan-400 flex-shrink-0" aria-hidden="true" />
                <span className="text-sm font-semibold text-gray-900 dark:text-white">Assignment</span>
                {state === 'todo' && <Pill tone={due.tone}>{due.text}</Pill>}
                <Pill tone={STATE_TONE[state]}>{STATE_LABEL[state]}</Pill>
                {graded && (
                    <span className="text-sm font-bold tabular-nums text-gray-900 dark:text-white">{submission!.score} / {points}</span>
                )}
                {!graded && <span className="text-xs text-gray-500 dark:text-gray-400">{points} points</span>}
                <div className="ml-auto flex items-center gap-2">
                    {error && <span className="text-xs text-red-600 dark:text-red-400" role="alert">{error}</span>}
                    {submission?.feedback && (
                        <Button size="sm" variant="ghost" icon={<MessageSquare className="w-3.5 h-3.5" />} onClick={() => setShowFeedback(v => !v)} aria-expanded={showFeedback}>
                            Feedback
                        </Button>
                    )}
                    <Button
                        size="sm"
                        variant={state === 'todo' || state === 'missing' ? 'primary' : 'secondary'}
                        icon={submission && submission.submittedAt > 0 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                        onClick={handleSubmit}
                        loading={submitting}
                        title="Hand in the code that's in the editor now"
                    >
                        {submission && submission.submittedAt > 0 ? 'Resubmit' : 'Submit'}
                    </Button>
                </div>
            </div>
            {submission?.feedback && showFeedback && (
                <div className="px-4 pb-3">
                    <div className="rounded-lg bg-white dark:bg-gray-900 border border-cyan-200 dark:border-cyan-900 px-3 py-2 text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                        <span className="font-semibold text-cyan-700 dark:text-cyan-300">Teacher feedback: </span>{submission.feedback}
                    </div>
                </div>
            )}
        </div>
    );
};

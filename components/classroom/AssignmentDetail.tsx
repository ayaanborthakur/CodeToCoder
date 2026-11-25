import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight, Clock, Pencil, Trash2, XCircle } from 'lucide-react';
import type { Assignment, LatePolicy, Submission } from '../../types';
import { latePenalized } from '../../utils/classroomTime';
import type { StudentProgress } from '../../services/classroomProgressService';
import { assignmentState, assignmentTargets, isAssignmentDone, STATE_LABEL, STATE_TONE } from '../../services/classroomProgressService';
import { assignmentPoints } from '../../services/assignmentsService';
import { gradeSubmission, submissionId } from '../../services/submissionsService';
import { assignmentSubtitle, assignmentTitle, dueLabel } from '../../utils/assignmentDisplay';
import { Avatar, Button, Card, EmptyState, Field, Pill, inputClass } from '../ui';

const toLocalInput = (ms: number | null) => {
    if (ms === null) return { date: '', time: '23:59' };
    const d = new Date(ms);
    const pad = (n: number) => String(n).padStart(2, '0');
    return { date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`, time: `${pad(d.getHours())}:${pad(d.getMinutes())}` };
};

/**
 * One assignment for the teacher: who has handed it in, and a grader that
 * shows each student's code next to the score and feedback boxes.
 */
export const AssignmentDetail: React.FC<{
    base: string;
    assignment: Assignment;
    students: StudentProgress[];
    submissions: Map<string, Submission>;
    onGraded: (s: Submission) => void;
    onUpdate: (patch: { dueAt?: number | null; points?: number }) => Promise<void>;
    onDelete: () => void;
    latePolicy?: LatePolicy;
}> = ({ base, assignment: a, students, submissions, onGraded, onUpdate, onDelete, latePolicy }) => {
    const [params, setParams] = useSearchParams();
    const points = assignmentPoints(a);
    const roster = useMemo(() => students.filter(s => assignmentTargets(a, s.uid)), [students, a]);

    const rows = useMemo(() => roster.map(s => {
        const sub = submissions.get(submissionId(a.id, s.uid));
        const finished = isAssignmentDone(a, s.completedLessons, s.completedPractice);
        return { student: s, sub, state: assignmentState(a, sub, finished) };
    }), [roster, submissions, a]);

    // Open the student from the URL, else the first one waiting to be graded.
    const selectedId = params.get('student')
        ?? rows.find(r => r.state === 'submitted' || r.state === 'late')?.student.uid
        ?? rows[0]?.student.uid
        ?? null;
    const index = rows.findIndex(r => r.student.uid === selectedId);
    const selected = index >= 0 ? rows[index] : null;
    const select = (uid: string) => setParams({ student: uid }, { replace: true });

    const counts = {
        handedIn: rows.filter(r => r.state === 'submitted' || r.state === 'late' || r.state === 'graded').length,
        toGrade: rows.filter(r => r.state === 'submitted' || r.state === 'late').length,
        missing: rows.filter(r => r.state === 'missing').length,
    };
    const graded = rows.filter(r => typeof r.sub?.score === 'number');
    const average = graded.length ? graded.reduce((sum, r) => sum + (r.sub!.score as number), 0) / graded.length : null;
    const due = dueLabel(a.dueAt);

    return (
        <>
            <Link to={`${base}/assignments`} className="no-hover inline-flex items-center gap-1.5 mb-4 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                <ArrowLeft className="w-4 h-4" aria-hidden="true" /> All assignments
            </Link>

            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
                <div className="min-w-0">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{assignmentTitle(a)}</h2>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        {assignmentSubtitle(a) && <span>{assignmentSubtitle(a)}</span>}
                        <Pill tone={due.tone}>{due.text}</Pill>
                        <span>{points} points</span>
                        <span>{a.studentIds === null ? 'Whole class' : `${a.studentIds.length} selected`}</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <EditAssignment assignment={a} onSave={onUpdate} />
                    <Button variant="danger" size="sm" icon={<Trash2 className="w-3.5 h-3.5" />} onClick={onDelete}>Delete</Button>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <MiniStat label="Handed in" value={`${counts.handedIn} / ${rows.length}`} />
                <MiniStat label="To grade" value={counts.toGrade} accent={counts.toGrade > 0} />
                <MiniStat label="Missing" value={counts.missing} danger={counts.missing > 0} />
                <MiniStat label="Average" value={average === null ? '—' : `${Math.round(average * 10) / 10} / ${points}`} />
            </div>

            <BulkGrade assignment={a} points={points} rows={rows} onGraded={onGraded} latePolicy={latePolicy} />

            {rows.length === 0 ? (
                <EmptyState title="No students to grade yet" description="Students appear here once they join the class." />
            ) : (
                <div className="grid lg:grid-cols-[280px_minmax(0,1fr)] gap-4 items-start">
                    <Card padded={false} className="overflow-hidden">
                        <ul className="divide-y divide-gray-100 dark:divide-gray-700 max-h-[70vh] overflow-y-auto">
                            {rows.map(r => (
                                <li key={r.student.uid}>
                                    <button
                                        onClick={() => select(r.student.uid)}
                                        aria-current={r.student.uid === selectedId}
                                        className={`no-hover w-full flex items-center gap-3 px-4 py-3 text-left ${r.student.uid === selectedId ? 'bg-cyan-50 dark:bg-cyan-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/40'}`}
                                    >
                                        <Avatar name={r.student.name} src={r.student.avatar} size="sm" />
                                        <span className="min-w-0 flex-1">
                                            <span className="block text-sm font-semibold text-gray-900 dark:text-white truncate">{r.student.name}</span>
                                            <Pill tone={STATE_TONE[r.state]} className="mt-0.5">{STATE_LABEL[r.state]}</Pill>
                                        </span>
                                        {typeof r.sub?.score === 'number' && (
                                            <span className="text-sm font-semibold tabular-nums text-gray-700 dark:text-gray-300">{r.sub.score}/{points}</span>
                                        )}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </Card>

                    {selected && (
                        <Grader
                            key={selected.student.uid}
                            assignment={a}
                            points={points}
                            student={selected.student}
                            submission={selected.sub}
                            state={selected.state}
                            onPrev={index > 0 ? () => select(rows[index - 1].student.uid) : undefined}
                            onNext={index < rows.length - 1 ? () => select(rows[index + 1].student.uid) : undefined}
                            onGraded={onGraded}
                            latePolicy={latePolicy}
                        />
                    )}
                </div>
            )}
        </>
    );
};

/**
 * Grade many students at once: full credit for handed-in work that passed the
 * automatic check, or zero for everyone whose work is missing.
 */
const BulkGrade: React.FC<{
    assignment: Assignment;
    points: number;
    rows: { student: StudentProgress; sub: Submission | undefined; state: ReturnType<typeof assignmentState> }[];
    onGraded: (s: Submission) => void;
    latePolicy?: LatePolicy;
}> = ({ assignment: a, points, rows, onGraded, latePolicy }) => {
    const [busy, setBusy] = useState<'pass' | 'missing' | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const passing = rows.filter(r => (r.state === 'submitted' || r.state === 'late') && r.sub?.passed && r.sub.submittedAt > 0);
    const missing = rows.filter(r => r.state === 'missing');
    if (!passing.length && !missing.length && !message) return null;

    const run = async (kind: 'pass' | 'missing') => {
        const list = kind === 'pass' ? passing : missing;
        const scoreFor = (late: boolean) => (kind === 'pass' ? (late ? latePenalized(points, latePolicy) : points) : 0);
        const what = kind === 'pass'
            ? `Give ${list.length} ${list.length === 1 ? 'student' : 'students'} full credit (${points}/${points}) for work that passed the check?${latePolicy?.penaltyPercent && list.some(r => r.sub?.late) ? ` Late work gets ${latePenalized(points, latePolicy)} after the ${latePolicy.penaltyPercent}% late penalty.` : ''}`
            : `Give ${list.length} ${list.length === 1 ? 'student' : 'students'} a zero for missing work? You can change any grade later.`;
        if (!window.confirm(what)) return;
        setBusy(kind);
        setMessage(null);
        let done = 0;
        for (const r of list) {
            const score = scoreFor(!!r.sub?.late);
            try {
                const feedback = r.sub?.feedback ?? (kind === 'missing' ? 'Missing' : '');
                await gradeSubmission({
                    classroomId: a.classroomId, assignmentId: a.id, studentId: r.student.uid, studentName: r.student.name,
                    existing: !!r.sub, score, feedback,
                });
                onGraded({
                    ...(r.sub ?? {
                        id: submissionId(a.id, r.student.uid), classroomId: a.classroomId, assignmentId: a.id,
                        studentId: r.student.uid, studentName: r.student.name, code: '', output: '',
                        passed: false, late: false, attempts: 0, submittedAt: 0,
                    }),
                    score, feedback, gradedAt: Date.now(), status: 'graded',
                });
                done++;
            } catch { /* keep going; reported below */ }
        }
        setBusy(null);
        setMessage(done === list.length ? `Graded ${done}.` : `Graded ${done} of ${list.length}. Try again for the rest.`);
    };

    return (
        <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 mr-1">Quick grade:</span>
            {passing.length > 0 && (
                <Button size="sm" icon={<CheckCircle2 className="w-4 h-4" />} loading={busy === 'pass'} disabled={!!busy} onClick={() => run('pass')}>
                    Full credit for passed work ({passing.length})
                </Button>
            )}
            {missing.length > 0 && (
                <Button size="sm" icon={<XCircle className="w-4 h-4" />} loading={busy === 'missing'} disabled={!!busy} onClick={() => run('missing')}>
                    Zero for missing ({missing.length})
                </Button>
            )}
            {message && <span className="text-sm text-gray-600 dark:text-gray-400" role="status">{message}</span>}
        </div>
    );
};

const MiniStat: React.FC<{ label: string; value: React.ReactNode; accent?: boolean; danger?: boolean }> = ({ label, value, accent, danger }) => (
    <Card className="!p-3">
        <div className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</div>
        <div className={`mt-0.5 text-lg font-bold tabular-nums ${danger ? 'text-red-600 dark:text-red-400' : accent ? 'text-cyan-600 dark:text-cyan-400' : 'text-gray-900 dark:text-white'}`}>{value}</div>
    </Card>
);

const Grader: React.FC<{
    assignment: Assignment;
    points: number;
    student: StudentProgress;
    submission: Submission | undefined;
    state: ReturnType<typeof assignmentState>;
    onPrev?: () => void;
    onNext?: () => void;
    onGraded: (s: Submission) => void;
    latePolicy?: LatePolicy;
}> = ({ assignment: a, points, student, submission: sub, state, onPrev, onNext, onGraded, latePolicy }) => {
    const [score, setScore] = useState(typeof sub?.score === 'number' ? String(sub.score) : '');
    const [feedback, setFeedback] = useState(sub?.feedback ?? '');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);
    const hasCode = !!sub && sub.submittedAt > 0;
    const regraded = sub?.status === 'submitted' && sub.gradedAt !== undefined;

    const save = async (thenNext: boolean) => {
        setError(null);
        const value = score.trim() === '' ? null : Number(score);
        if (value !== null && (!Number.isFinite(value) || value < 0 || value > points * 2)) {
            setError(`Enter a score from 0 to ${points} (extra credit up to ${points * 2}).`);
            return;
        }
        setSaving(true);
        try {
            await gradeSubmission({
                classroomId: a.classroomId,
                assignmentId: a.id,
                studentId: student.uid,
                studentName: student.name,
                existing: !!sub,
                score: value,
                feedback: feedback.trim(),
            });
            onGraded({
                ...(sub ?? {
                    id: submissionId(a.id, student.uid), classroomId: a.classroomId, assignmentId: a.id,
                    studentId: student.uid, studentName: student.name, code: '', output: '',
                    passed: false, late: false, attempts: 0, submittedAt: 0,
                }),
                score: value, feedback: feedback.trim(), gradedAt: Date.now(), status: 'graded',
            });
            setSaved(true);
            if (thenNext && onNext) onNext();
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Could not save the grade.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card padded={false} className="overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 dark:border-gray-700">
                <Avatar name={student.name} src={student.avatar} />
                <div className="min-w-0 flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white truncate">{student.name}</div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                        <Pill tone={STATE_TONE[state]}>{STATE_LABEL[state]}</Pill>
                        {hasCode && <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(sub!.submittedAt).toLocaleString()}</span>}
                        {hasCode && <span>{sub!.attempts} {sub!.attempts === 1 ? 'submission' : 'submissions'}</span>}
                    </div>
                </div>
                <div className="flex gap-1">
                    <Button size="sm" variant="ghost" icon={<ChevronLeft className="w-4 h-4" />} onClick={onPrev} disabled={!onPrev} aria-label="Previous student" />
                    <Button size="sm" variant="ghost" icon={<ChevronRight className="w-4 h-4" />} onClick={onNext} disabled={!onNext} aria-label="Next student" />
                </div>
            </div>

            <div className="p-5 space-y-4">
                {regraded && (
                    <p className="text-sm text-amber-700 dark:text-amber-400">Resubmitted after you graded it. The earlier grade is shown below.</p>
                )}
                {hasCode ? (
                    <>
                        <div className={`flex items-center gap-2 text-sm font-semibold ${sub!.passed ? 'text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                            {sub!.passed ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                            {sub!.passed ? 'Passed the automatic check' : "Didn't pass the automatic check"}
                        </div>
                        <CodeBlock label="Code" text={sub!.code} numbered />
                        <CodeBlock label="Output" text={sub!.output || '(no output)'} />
                    </>
                ) : state === 'submitted' ? (
                    <p className="text-sm text-gray-600 dark:text-gray-400">Finished in the lesson before submissions were collected, so there's no code to show.</p>
                ) : (
                    <p className="text-sm text-gray-600 dark:text-gray-400">Nothing handed in yet{state === 'missing' ? ', and it is past due' : ''}.</p>
                )}

                <div className="grid sm:grid-cols-[140px_minmax(0,1fr)] gap-4 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <Field label="Score" htmlFor="grade-score">
                        <div className="flex items-center gap-2">
                            <input id="grade-score" type="number" min={0} className={inputClass} value={score} onChange={e => { setScore(e.target.value); setSaved(false); }} />
                            <span className="text-sm text-gray-500 whitespace-nowrap">/ {points}</span>
                        </div>
                    </Field>
                    <Field label="Feedback for the student" htmlFor="grade-feedback">
                        <textarea id="grade-feedback" className={`${inputClass} min-h-[80px]`} value={feedback} onChange={e => { setFeedback(e.target.value); setSaved(false); }} placeholder="What went well, and what to try next" />
                    </Field>
                </div>
                {sub?.late && !!latePolicy?.penaltyPercent && (
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                        Handed in late. With this class's {latePolicy.penaltyPercent}% penalty, full credit is {latePenalized(points, latePolicy)}.{' '}
                        <button className="font-semibold underline" onClick={() => { setScore(String(latePenalized(Number(score || points), latePolicy))); setSaved(false); }}>Apply penalty to {score || points}</button>
                    </p>
                )}
                {error && <p className="text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>}
                <div className="flex flex-wrap items-center justify-end gap-2">
                    {saved && <span className="text-sm text-green-700 dark:text-green-400 mr-auto">Saved. The student can see it now.</span>}
                    {!hasCode && state !== 'submitted' && (
                        <Button size="sm" variant="ghost" onClick={() => { setScore('0'); setSaved(false); }}>Mark as 0</Button>
                    )}
                    <Button onClick={() => save(false)} loading={saving}>Save</Button>
                    <Button variant="primary" onClick={() => save(true)} loading={saving} disabled={!onNext}>Save &amp; next</Button>
                </div>
            </div>
        </Card>
    );
};

const CodeBlock: React.FC<{ label: string; text: string; numbered?: boolean }> = ({ label, text, numbered }) => (
    <div>
        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">{label}</div>
        <pre className="max-h-80 overflow-auto rounded-lg bg-gray-900 text-gray-100 text-sm font-mono p-3 leading-6">
            {numbered
                ? text.split('\n').map((line, i) => (
                    <div key={i} className="flex">
                        <span className="select-none w-8 flex-shrink-0 pr-3 text-right text-gray-500">{i + 1}</span>
                        <span className="whitespace-pre">{line || ' '}</span>
                    </div>
                ))
                : <span className="whitespace-pre-wrap">{text}</span>}
        </pre>
    </div>
);

const EditAssignment: React.FC<{ assignment: Assignment; onSave: (patch: { dueAt?: number | null; points?: number }) => Promise<void> }> = ({ assignment: a, onSave }) => {
    const [open, setOpen] = useState(false);
    const initial = toLocalInput(a.dueAt);
    const [date, setDate] = useState(initial.date);
    const [time, setTime] = useState(initial.time);
    const [points, setPoints] = useState(String(assignmentPoints(a)));
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) return;
        const i = toLocalInput(a.dueAt);
        setDate(i.date); setTime(i.time); setPoints(String(assignmentPoints(a))); setError(null);
    }, [open, a]);

    if (!open) return <Button size="sm" icon={<Pencil className="w-3.5 h-3.5" />} onClick={() => setOpen(true)}>Edit</Button>;

    const save = async () => {
        const pts = Number(points);
        if (!Number.isFinite(pts) || pts < 0 || pts > 1000) { setError('Points must be 0 to 1000.'); return; }
        setSaving(true);
        try {
            await onSave({ dueAt: date ? new Date(`${date}T${time || '23:59'}:00`).getTime() : null, points: pts });
            setOpen(false);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Could not save.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onMouseDown={e => { if (e.target === e.currentTarget) setOpen(false); }}>
            <Card className="w-full max-w-sm space-y-4">
                <h3 className="font-bold text-gray-900 dark:text-white">Edit assignment</h3>
                <div className="grid grid-cols-[1fr_auto] gap-3">
                    <Field label="Due date" htmlFor="ed-date"><input id="ed-date" type="date" className={inputClass} value={date} onChange={e => setDate(e.target.value)} /></Field>
                    <Field label="Time" htmlFor="ed-time"><input id="ed-time" type="time" className={inputClass} value={time} onChange={e => setTime(e.target.value)} disabled={!date} /></Field>
                </div>
                <Field label="Points" htmlFor="ed-points"><input id="ed-points" type="number" min={0} max={1000} className={inputClass} value={points} onChange={e => setPoints(e.target.value)} /></Field>
                {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button variant="primary" onClick={save} loading={saving}>Save</Button>
                </div>
            </Card>
        </div>
    );
};

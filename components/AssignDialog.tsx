import React, { useEffect, useMemo, useState } from 'react';
import { X, Users, User as UserIcon, Check, BookOpen, Dumbbell, PencilLine } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { createAssignment, createPracticeAssignment, DEFAULT_POINTS } from '../services/assignmentsService';
import { listTeacherClassrooms } from '../services/classroomService';
import { endOfLocalDay } from '../services/submissionsService';
import type { Assignment, Classroom, PracticeItem } from '../types';
import { Button, Field, inputClass } from './ui';

export type AssignTarget =
    | { kind: 'lesson'; courseId: string; courseTitle: string; moduleId: string; lessonId: string; lessonTitle: string }
    | { kind: 'practice'; practiceItem: PracticeItem }
    | { kind: 'custom' };

interface StudentInfo { uid: string; name: string; username: string }

interface AssignDialogProps {
    teacherId: string;
    target: AssignTarget;
    /** The class to assign to. Omit to let the teacher pick one of theirs. */
    classroom?: Classroom;
    /** Already-loaded roster for `classroom`, to skip fetching names. */
    students?: StudentInfo[];
    onClose: () => void;
    onAssigned: (assignment: Assignment) => void;
}

const loadRoster = async (classroom: Classroom): Promise<StudentInfo[]> => {
    const ids = Array.isArray(classroom.studentIds) ? classroom.studentIds : [];
    const list = await Promise.all(ids.map(async (uid): Promise<StudentInfo> => {
        try {
            const snap = await getDoc(doc(db, 'users', uid));
            if (snap.exists()) {
                const d = snap.data();
                return { uid, name: d.name ?? 'Unknown student', username: d.username ?? uid.slice(0, 8) };
            }
        } catch { /* fall through to a placeholder */ }
        return { uid, name: 'Unknown student', username: uid.slice(0, 8) };
    }));
    return list.sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Assign a curriculum lesson, a practice item, or a coding assignment the
 * teacher writes here, with due date, points and who it's for.
 */
export const AssignDialog: React.FC<AssignDialogProps> = ({ teacherId, target, classroom, students: studentsProp, onClose, onAssigned }) => {
    const [classrooms, setClassrooms] = useState<Classroom[]>(classroom ? [classroom] : []);
    const [classId, setClassId] = useState<string | null>(classroom?.classId ?? null);
    const [students, setStudents] = useState<StudentInfo[] | null>(studentsProp ?? null);
    const [everyone, setEveryone] = useState(true);
    const [picked, setPicked] = useState<Set<string>>(new Set());
    const [dueDate, setDueDate] = useState('');
    const [dueTime, setDueTime] = useState('23:59');
    const [points, setPoints] = useState(String(DEFAULT_POINTS));
    const [title, setTitle] = useState('');
    const [instructions, setInstructions] = useState('');
    const [starterCode, setStarterCode] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const active = useMemo(() => classrooms.find(c => c.classId === classId) ?? null, [classrooms, classId]);

    useEffect(() => {
        if (classroom) return;
        let cancelled = false;
        listTeacherClassrooms(teacherId)
            .then(list => {
                if (cancelled) return;
                const open = list.filter(c => !c.archived);
                setClassrooms(open);
                setClassId(open[0]?.classId ?? null);
            })
            .catch(e => { if (!cancelled) setError(e instanceof Error ? e.message : 'Could not load your classes.'); });
        return () => { cancelled = true; };
    }, [classroom, teacherId]);

    // The roster is needed only when assigning to some students.
    useEffect(() => {
        if (everyone || !active || (students && classId === classroom?.classId)) return;
        let cancelled = false;
        setStudents(null);
        loadRoster(active).then(list => { if (!cancelled) setStudents(list); });
        return () => { cancelled = true; };
    }, [everyone, active]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !saving) onClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose, saving]);

    const heading = target.kind === 'lesson' ? target.lessonTitle : target.kind === 'practice' ? target.practiceItem.title : 'New coding assignment';
    const icon = target.kind === 'lesson' ? <BookOpen className="w-4 h-4" /> : target.kind === 'practice' ? <Dumbbell className="w-4 h-4" /> : <PencilLine className="w-4 h-4" />;

    const handleAssign = async () => {
        setError(null);
        if (!active) { setError('Choose a class.'); return; }
        if (!everyone && picked.size === 0) { setError('Choose at least one student, or assign to the whole class.'); return; }
        const pts = Number(points);
        if (!Number.isFinite(pts) || pts < 0 || pts > 1000) { setError('Points must be a number from 0 to 1000.'); return; }
        if (target.kind === 'custom' && (!title.trim() || !instructions.trim())) { setError('Give the assignment a title and instructions.'); return; }
        if (dueDate && dueTime && new Date(`${dueDate}T${dueTime}`).getTime() < Date.now()) {
            if (!window.confirm('That due date has already passed, so students will see this as late. Assign anyway?')) return;
        }

        const dueAt = dueDate ? (dueTime ? new Date(`${dueDate}T${dueTime}:00`).getTime() : endOfLocalDay(dueDate)) : null;
        const studentIds = everyone ? null : Array.from(picked);
        setSaving(true);
        try {
            let created: Assignment;
            if (target.kind === 'lesson') {
                created = await createAssignment({
                    classroomId: active.classId, teacherId,
                    courseId: target.courseId, courseTitle: target.courseTitle,
                    moduleId: target.moduleId, lessonId: target.lessonId, lessonTitle: target.lessonTitle,
                    dueAt, studentIds, points: pts,
                });
            } else {
                const practiceItem: PracticeItem = target.kind === 'practice'
                    ? target.practiceItem
                    : {
                        id: `custom-${Date.now().toString(36)}`,
                        title: title.trim(),
                        description: instructions.trim().split('\n')[0].slice(0, 200),
                        content: instructions.trim(),
                        startingCode: starterCode,
                        type: 'problem',
                        difficulty: 'Medium',
                    };
                created = await createPracticeAssignment({
                    classroomId: active.classId, teacherId, practiceItem, dueAt, studentIds, points: pts, custom: target.kind === 'custom',
                });
            }
            onAssigned(created);
            onClose();
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Could not create the assignment.');
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onMouseDown={(e) => { if (e.target === e.currentTarget && !saving) onClose(); }}>
            <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-lg border border-gray-200 dark:border-gray-800 shadow-xl flex flex-col max-h-[92vh]" role="dialog" aria-modal="true" aria-labelledby="assign-title">
                <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-600 dark:text-cyan-400">
                            {icon} {target.kind === 'lesson' ? 'Assign lesson' : target.kind === 'practice' ? 'Assign practice' : 'Create assignment'}
                        </div>
                        <h2 id="assign-title" className="font-bold text-gray-900 dark:text-white truncate">{heading}</h2>
                        {target.kind === 'lesson' && <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{target.courseTitle}</p>}
                    </div>
                    <button onClick={onClose} className="no-hover p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Close"><X className="w-4 h-4 text-gray-500" /></button>
                </div>

                <div className="overflow-y-auto p-5 space-y-5">
                    {target.kind === 'custom' && (
                        <>
                            <Field label="Title" htmlFor="as-title">
                                <input id="as-title" className={inputClass} value={title} onChange={e => setTitle(e.target.value)} maxLength={100} placeholder="e.g. FizzBuzz" autoFocus />
                            </Field>
                            <Field label="Instructions" htmlFor="as-instr" hint="Markdown works. The automatic check grades the student's code against these instructions.">
                                <textarea id="as-instr" className={`${inputClass} min-h-[120px]`} value={instructions} onChange={e => setInstructions(e.target.value)} placeholder={'Print the numbers 1 to 30. For multiples of 3 print "Fizz"…'} />
                            </Field>
                            <Field label="Starter code (optional)" htmlFor="as-code">
                                <textarea id="as-code" className={`${inputClass} font-mono min-h-[90px]`} value={starterCode} onChange={e => setStarterCode(e.target.value)} spellCheck={false} placeholder="# Write your code here" />
                            </Field>
                        </>
                    )}

                    {!classroom && (
                        <Field label="Class" htmlFor="as-class">
                            <select id="as-class" className={inputClass} value={classId ?? ''} onChange={e => { setClassId(e.target.value); setPicked(new Set()); setStudents(null); }}>
                                {classrooms.length === 0 && <option value="">No classes yet</option>}
                                {classrooms.map(c => <option key={c.classId} value={c.classId}>{c.className}</option>)}
                            </select>
                        </Field>
                    )}

                    <div>
                        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Assign to</div>
                        <div className="grid grid-cols-2 gap-2">
                            {([[true, 'Whole class', <Users key="u" className="w-4 h-4" />], [false, 'Some students', <UserIcon key="s" className="w-4 h-4" />]] as const).map(([value, label, ic]) => (
                                <button
                                    key={label}
                                    onClick={() => setEveryone(value)}
                                    aria-pressed={everyone === value}
                                    className={`no-hover flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm font-semibold ${everyone === value
                                        ? 'border-cyan-500 bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300'
                                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300'}`}
                                >
                                    {ic}{label}
                                </button>
                            ))}
                        </div>
                        {!everyone && (
                            <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-800">
                                {students === null && <p className="px-3 py-2 text-sm text-gray-500">Loading students…</p>}
                                {students?.length === 0 && <p className="px-3 py-2 text-sm text-gray-500">No students in this class yet.</p>}
                                {students?.map(st => {
                                    const on = picked.has(st.uid);
                                    return (
                                        <label key={st.uid} className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                                            <input type="checkbox" className="sr-only" checked={on} onChange={() => setPicked(prev => { const n = new Set(prev); if (n.has(st.uid)) n.delete(st.uid); else n.add(st.uid); return n; })} />
                                            <span className={`w-4 h-4 rounded border flex items-center justify-center ${on ? 'bg-cyan-600 border-cyan-600 text-white' : 'border-gray-300 dark:border-gray-600'}`} aria-hidden="true">{on && <Check className="w-3 h-3" />}</span>
                                            <span className="text-sm text-gray-900 dark:text-white">{st.name}</span>
                                            <span className="text-xs text-gray-500">@{st.username}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-[1fr_auto_90px] gap-3 items-end">
                        <Field label="Due date" htmlFor="as-due">
                            <input id="as-due" type="date" className={inputClass} value={dueDate} onChange={e => setDueDate(e.target.value)} />
                        </Field>
                        <Field label="Time" htmlFor="as-time">
                            <input id="as-time" type="time" className={inputClass} value={dueTime} onChange={e => setDueTime(e.target.value)} disabled={!dueDate} />
                        </Field>
                        <Field label="Points" htmlFor="as-points">
                            <input id="as-points" type="number" min={0} max={1000} className={inputClass} value={points} onChange={e => setPoints(e.target.value)} />
                        </Field>
                    </div>

                    {error && <p className="text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>}
                </div>

                <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100 dark:border-gray-800">
                    <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
                    <Button variant="primary" onClick={handleAssign} loading={saving} disabled={!active}>Assign</Button>
                </div>
            </div>
        </div>
    );
};

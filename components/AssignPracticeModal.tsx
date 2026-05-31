import React, { useEffect, useState } from 'react';
import { X, Users, User as UserIcon, Check, Loader2 } from 'lucide-react';
import { createPracticeAssignment } from '../services/assignmentsService';
import { listTeacherClassrooms } from '../services/classroomService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import type { Classroom, PracticeItem } from '../types';

interface StudentInfo {
    uid: string;
    name: string;
    username: string;
}

interface AssignPracticeModalProps {
    teacherId: string;
    /** Pre-loaded classrooms. If omitted, fetched on mount. */
    classrooms?: Classroom[];
    practiceItem: PracticeItem;
    onClose: () => void;
    onAssigned: () => void;
}

const PRACTICE_LABEL: Record<string, string> = {
    quiz: 'Quiz',
    problem: 'Problem',
    project: 'Project',
};

export const AssignPracticeModal: React.FC<AssignPracticeModalProps> = ({
    teacherId,
    classrooms: classroomsProp,
    practiceItem,
    onClose,
    onAssigned,
}) => {
    const [classrooms, setClassrooms] = useState<Classroom[]>(classroomsProp ?? []);
    const [classroomsLoading, setClassroomsLoading] = useState(!classroomsProp);
    const [selectedClassId, setSelectedClassId] = useState<string | null>(classroomsProp?.[0]?.classId ?? null);

    const [target, setTarget] = useState<'whole-class' | 'pick'>('whole-class');
    const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
    const [dueDate, setDueDate] = useState<string>('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [students, setStudents] = useState<StudentInfo[] | null>(null);
    const [studentsLoading, setStudentsLoading] = useState(false);

    // Load teacher's classrooms when caller didn't pre-supply them.
    useEffect(() => {
        if (classroomsProp) return;
        let cancelled = false;
        listTeacherClassrooms(teacherId)
            .then(list => {
                if (cancelled) return;
                setClassrooms(list);
                setSelectedClassId(list[0]?.classId ?? null);
            })
            .catch(e => { if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load classrooms.'); })
            .finally(() => { if (!cancelled) setClassroomsLoading(false); });
        return () => { cancelled = true; };
    }, [teacherId, classroomsProp]);

    // Reset students lookup when classroom changes or 'pick' opens.
    const activeClassroom = classrooms.find(c => c.classId === selectedClassId) ?? null;
    useEffect(() => {
        setStudents(null);
        setSelectedStudentIds(new Set());
    }, [selectedClassId]);

    useEffect(() => {
        if (target !== 'pick' || students !== null || studentsLoading || !activeClassroom) return;
        if (activeClassroom.studentIds.length === 0) { setStudents([]); return; }
        let cancelled = false;
        setStudentsLoading(true);
        Promise.all(
            activeClassroom.studentIds.map(async (uid): Promise<StudentInfo> => {
                try {
                    const snap = await getDoc(doc(db, 'users', uid));
                    if (snap.exists()) {
                        const data = snap.data();
                        return {
                            uid,
                            name: data.name ?? 'Unknown',
                            username: data.username ?? uid.slice(0, 8),
                        };
                    }
                } catch { /* fall through */ }
                return { uid, name: 'Unknown', username: uid.slice(0, 8) };
            })
        )
            .then(list => {
                if (cancelled) return;
                setStudents(list.sort((a, b) => a.name.localeCompare(b.name)));
            })
            .finally(() => { if (!cancelled) setStudentsLoading(false); });
        return () => { cancelled = true; };
    }, [target, activeClassroom, students, studentsLoading]);

    const toggleStudent = (id: string) => {
        setSelectedStudentIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const handleSubmit = async () => {
        setError(null);
        if (!activeClassroom) { setError('Pick a classroom.'); return; }
        if (target === 'pick' && selectedStudentIds.size === 0) {
            setError('Pick at least one student, or switch to "Whole class".');
            return;
        }
        setSubmitting(true);
        try {
            await createPracticeAssignment({
                classroomId: activeClassroom.classId,
                teacherId,
                practiceItem,
                dueAt: dueDate ? new Date(dueDate).getTime() : null,
                studentIds: target === 'whole-class' ? null : Array.from(selectedStudentIds),
            });
            onAssigned();
            onClose();
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Failed to create assignment.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-md border border-gray-200 dark:border-gray-800 shadow-xl">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="font-semibold text-sm text-gray-900 dark:text-white">Assign to class</h2>
                    <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Close">
                        <X className="w-4 h-4 text-gray-500" />
                    </button>
                </div>

                <div className="p-5 space-y-4">
                    {/* Item summary */}
                    <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold mb-1">
                            {PRACTICE_LABEL[practiceItem.type] ?? 'Practice'} · {practiceItem.difficulty}
                        </div>
                        <div className="font-semibold text-sm text-gray-900 dark:text-white">{practiceItem.title}</div>
                        {practiceItem.description && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{practiceItem.description}</div>
                        )}
                    </div>

                    {/* Classroom picker (only shown when multiple) */}
                    {classroomsLoading ? (
                        <div className="text-sm text-gray-500 flex items-center gap-2">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading classrooms…
                        </div>
                    ) : classrooms.length === 0 ? (
                        <div className="text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md p-3">
                            You don't have a classroom yet. Create one from My Class first.
                        </div>
                    ) : classrooms.length > 1 ? (
                        <div>
                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide block mb-2">Classroom</label>
                            <select
                                value={selectedClassId ?? ''}
                                onChange={(e) => setSelectedClassId(e.target.value)}
                                className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            >
                                {classrooms.map(c => (
                                    <option key={c.classId} value={c.classId}>{c.className}</option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            Classroom: <span className="font-semibold text-gray-900 dark:text-white">{classrooms[0].className}</span>
                        </div>
                    )}

                    {/* Target selector */}
                    {classrooms.length > 0 && (
                        <>
                            <div>
                                <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide block mb-2">Assign to</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setTarget('whole-class')}
                                        className={`flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-semibold border transition-colors ${
                                            target === 'whole-class'
                                                ? 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/30'
                                                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                        }`}
                                    >
                                        <Users className="w-3.5 h-3.5" />
                                        Whole class
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setTarget('pick')}
                                        className={`flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-semibold border transition-colors ${
                                            target === 'pick'
                                                ? 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/30'
                                                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                        }`}
                                    >
                                        <UserIcon className="w-3.5 h-3.5" />
                                        Pick students
                                    </button>
                                </div>
                            </div>

                            {target === 'pick' && activeClassroom && (
                                <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md">
                                    {studentsLoading ? (
                                        <div className="flex items-center justify-center gap-2 px-2 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading students…
                                        </div>
                                    ) : students && students.length === 0 ? (
                                        <div className="text-sm text-gray-500 dark:text-gray-400 px-3 py-4 text-center">
                                            No students have joined this class yet.
                                        </div>
                                    ) : (
                                        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                                            {(students ?? []).map(s => {
                                                const selected = selectedStudentIds.has(s.uid);
                                                return (
                                                    <li key={s.uid}>
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleStudent(s.uid)}
                                                            className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                                                                selected
                                                                    ? 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400'
                                                                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-200'
                                                            }`}
                                                        >
                                                            <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                                {s.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <div className="text-sm font-medium truncate">{s.name}</div>
                                                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">@{s.username}</div>
                                                            </div>
                                                            {selected && <Check className="w-4 h-4 flex-shrink-0" />}
                                                        </button>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}
                                </div>
                            )}

                            <div>
                                <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide block mb-2">Due date (optional)</label>
                                <input
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                />
                            </div>
                        </>
                    )}

                    {error && <div className="text-sm text-red-600 dark:text-red-400">{error}</div>}
                </div>

                <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-gray-100 dark:border-gray-800">
                    <button
                        onClick={onClose}
                        disabled={submitting}
                        className="px-3 py-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || classrooms.length === 0}
                        className="px-4 py-1.5 text-sm font-bold text-white bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 rounded-md"
                    >
                        {submitting ? 'Assigning…' : 'Assign'}
                    </button>
                </div>
            </div>
        </div>
    );
};

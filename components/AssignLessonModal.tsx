import React, { useState } from 'react';
import { X, Users, User as UserIcon, Check } from 'lucide-react';
import { createAssignment } from '../services/assignmentsService';
import type { Classroom } from '../types';

interface AssignLessonModalProps {
    classroom: Classroom;
    teacherId: string;
    courseId: string;
    courseTitle: string;
    moduleId: string;
    lessonId: string;
    lessonTitle: string;
    onClose: () => void;
    onAssigned: () => void;
}

export const AssignLessonModal: React.FC<AssignLessonModalProps> = ({
    classroom,
    teacherId,
    courseId,
    courseTitle,
    moduleId,
    lessonId,
    lessonTitle,
    onClose,
    onAssigned,
}) => {
    const [target, setTarget] = useState<'whole-class' | 'pick'>('whole-class');
    const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
    const [dueDate, setDueDate] = useState<string>('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const toggleStudent = (id: string) => {
        setSelectedStudentIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const handleSubmit = async () => {
        setError(null);
        if (target === 'pick' && selectedStudentIds.size === 0) {
            setError('Pick at least one student, or switch to "Whole class".');
            return;
        }
        setSubmitting(true);
        try {
            await createAssignment({
                classroomId: classroom.classId,
                teacherId,
                courseId,
                courseTitle,
                moduleId,
                lessonId,
                lessonTitle,
                dueAt: dueDate ? new Date(dueDate).getTime() : null,
                studentIds: target === 'whole-class' ? null : Array.from(selectedStudentIds),
            });
            onAssigned();
            onClose();
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Failed to create assignment.';
            setError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md border border-gray-200 dark:border-gray-800 shadow-2xl">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="font-bold text-gray-900 dark:text-white">Assign lesson</h2>
                    <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Close">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-5 space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                        <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold">Lesson</div>
                        <div className="font-semibold text-gray-900 dark:text-white">{lessonTitle}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{courseTitle}</div>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide block mb-2">Assign to</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setTarget('whole-class')}
                                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold border transition-colors ${
                                    target === 'whole-class'
                                        ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border-cyan-500/40'
                                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                }`}
                            >
                                <Users className="w-4 h-4" />
                                Whole class
                            </button>
                            <button
                                type="button"
                                onClick={() => setTarget('pick')}
                                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold border transition-colors ${
                                    target === 'pick'
                                        ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border-cyan-500/40'
                                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                }`}
                            >
                                <UserIcon className="w-4 h-4" />
                                Pick students
                            </button>
                        </div>
                    </div>

                    {target === 'pick' && (
                        <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2 space-y-1">
                            {classroom.studentIds.length === 0 ? (
                                <div className="text-sm text-gray-500 dark:text-gray-400 px-2 py-3 text-center">
                                    No students have joined the class yet.
                                </div>
                            ) : (
                                classroom.studentIds.map(sid => {
                                    const selected = selectedStudentIds.has(sid);
                                    return (
                                        <button
                                            key={sid}
                                            type="button"
                                            onClick={() => toggleStudent(sid)}
                                            className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                                                selected
                                                    ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-400'
                                                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200'
                                            }`}
                                        >
                                            <span className="truncate font-mono text-xs">{sid}</span>
                                            {selected && <Check className="w-4 h-4 flex-shrink-0" />}
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    )}

                    <div>
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide block mb-2">Due date (optional)</label>
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                    </div>

                    {error && <div className="text-sm text-red-600 dark:text-red-400">{error}</div>}
                </div>

                <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100 dark:border-gray-800">
                    <button
                        onClick={onClose}
                        disabled={submitting}
                        className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="px-4 py-2 text-sm font-bold text-white bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 rounded-lg"
                    >
                        {submitting ? 'Assigning…' : 'Assign'}
                    </button>
                </div>
            </div>
        </div>
    );
};

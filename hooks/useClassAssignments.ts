import { useCallback, useEffect, useState } from 'react';
import type { Assignment, Classroom, Submission, User } from '../types';

/** Past due in a class that doesn't take late work. */
export const isClosed = (a: Assignment, classroom: Classroom | null | undefined, now = Date.now()): boolean =>
    a.dueAt !== null && now > a.dueAt && classroom?.latePolicy?.accept === false;

/**
 * A student's class assignments and their own submissions, so any lesson or
 * practice item that is assigned can show its due date, status and grade, and
 * hand work in. Teachers and students without a class get empty lists.
 */
export const useClassAssignments = (user: User | null) => {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [submissions, setSubmissions] = useState<Map<string, Submission>>(new Map());
    // The student's class: the teacher's module locks and late-work policy.
    const [classroom, setClassroom] = useState<Classroom | null>(null);
    const classId = user && user.role !== 'teacher' ? user.classId ?? null : null;
    const userId = user?.id ?? null;

    const reload = useCallback(async () => {
        if (!classId || !userId) { setAssignments([]); setSubmissions(new Map()); setClassroom(null); return; }
        const [{ listAssignmentsForStudent }, { listMySubmissions }, { getClassroom }] = await Promise.all([
            import('../services/assignmentsService'),
            import('../services/submissionsService'),
            import('../services/classroomService'),
        ]);
        const [list, mine, room] = await Promise.all([
            listAssignmentsForStudent(userId, classId).catch(() => [] as Assignment[]),
            listMySubmissions(classId, userId).catch(() => [] as Submission[]),
            getClassroom(classId).catch(() => null),
        ]);
        setClassroom(room);
        setAssignments(list);
        setSubmissions(new Map(mine.map(s => [s.assignmentId, s])));
    }, [classId, userId]);

    useEffect(() => { reload(); }, [reload]);

    /** The assignment for a lesson or practice item, if the student has one. */
    const assignmentFor = useCallback((kind: 'lesson' | 'practice', itemId: string | undefined): Assignment | undefined => {
        if (!itemId) return undefined;
        return assignments.find(a => kind === 'lesson'
            ? (a.kind ?? 'lesson') === 'lesson' && a.lessonId === itemId
            // Opened from the assignment link the id is prefixed (see App).
            : a.kind === 'practice' && !!a.practiceItem && (itemId === a.practiceItem.id || itemId === `assignment:${a.id}:${a.practiceItem.id}`));
    }, [assignments]);

    const submit = useCallback(async (assignment: Assignment, work: { code: string; output: string; passed: boolean }) => {
        if (!user) return;
        if (isClosed(assignment, classroom)) throw new Error("It's past the due date and your teacher isn't accepting late work.");
        const { submitWork } = await import('../services/submissionsService');
        await submitWork({ assignment, studentId: user.id, studentName: user.name, ...work });
        const now = Date.now();
        setSubmissions(prev => {
            const before = prev.get(assignment.id);
            const next = new Map(prev);
            next.set(assignment.id, {
                ...(before ?? {
                    id: `${assignment.id}_${user.id}`, classroomId: assignment.classroomId, assignmentId: assignment.id,
                    studentId: user.id, studentName: user.name, attempts: 0,
                }),
                code: work.code, output: work.output, passed: work.passed,
                status: 'submitted',
                late: assignment.dueAt !== null && now > assignment.dueAt,
                attempts: (before?.attempts ?? 0) + 1,
                submittedAt: now,
            } as Submission);
            return next;
        });
    }, [user, classroom]);

    const lockedModuleIds = classroom?.lockedModuleIds ?? [];
    return { assignments, submissions, assignmentFor, submit, reload, classroom, lockedModuleIds };
};

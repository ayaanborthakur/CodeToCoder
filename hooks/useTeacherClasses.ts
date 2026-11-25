import { useCallback, useEffect, useState } from 'react';
import type { Assignment, Classroom, Submission, User } from '../types';

export interface TeacherClassData {
    classroom: Classroom;
    assignments: Assignment[];
    submissions: Submission[];
}

/**
 * A teacher's active classes with their assignments and submissions, for the
 * sidebar's class list and "To grade" count, the grading queue and the
 * calendar. Students and signed-out users get empty data.
 */
export const useTeacherClasses = (user: User | null) => {
    const [classes, setClasses] = useState<TeacherClassData[]>([]);
    const [loaded, setLoaded] = useState(false);
    const teacherId = user?.role === 'teacher' ? user.id : null;

    const reload = useCallback(async () => {
        if (!teacherId) { setClasses([]); setLoaded(true); return; }
        const [{ listTeacherClassrooms }, { listAssignmentsForClassroom }, { listSubmissionsForClassroom }] = await Promise.all([
            import('../services/classroomService'),
            import('../services/assignmentsService'),
            import('../services/submissionsService'),
        ]);
        try {
            const list = (await listTeacherClassrooms(teacherId)).filter(c => !c.archived);
            const data = await Promise.all(list.map(async classroom => ({
                classroom,
                assignments: await listAssignmentsForClassroom(classroom.classId).catch(() => [] as Assignment[]),
                submissions: await listSubmissionsForClassroom(classroom.classId).catch(() => [] as Submission[]),
            })));
            setClasses(data);
        } catch {
            setClasses([]);
        } finally {
            setLoaded(true);
        }
    }, [teacherId]);

    useEffect(() => { reload(); }, [reload]);

    // Archiving, restoring or deleting a class elsewhere in the app.
    useEffect(() => {
        const onChange = () => { reload(); };
        window.addEventListener('c2c:classes-changed', onChange);
        return () => window.removeEventListener('c2c:classes-changed', onChange);
    }, [reload]);

    // Handed in and not graded yet (including resubmissions after a grade).
    // Work on deleted assignments doesn't count.
    const toGrade = classes.reduce((n, c) => {
        const live = new Set(c.assignments.map(a => a.id));
        return n + c.submissions.filter(s => s.status === 'submitted' && s.submittedAt > 0 && live.has(s.assignmentId)).length;
    }, 0);

    return { classes, loaded, toGrade, reload };
};

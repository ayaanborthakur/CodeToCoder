import {
    doc,
    setDoc,
    deleteDoc,
    collection,
    query,
    where,
    getDocs,
    orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Assignment } from '../types';

// Assignments live as a subcollection under each classroom:
//   classrooms/{classroomId}/assignments/{assignmentId}
const ASSIGNMENTS_SUBCOLLECTION = 'assignments';

const assignmentsRef = (classroomId: string) =>
    collection(db, 'classrooms', classroomId, ASSIGNMENTS_SUBCOLLECTION);

/**
 * Teacher creates a new assignment for their classroom.
 * Pass studentIds=null to assign to the whole class.
 */
export const createAssignment = async (input: {
    classroomId: string;
    teacherId: string;
    courseId: string;
    courseTitle: string;
    moduleId: string;
    lessonId: string;
    lessonTitle: string;
    dueAt: number | null;
    studentIds: string[] | null;
}): Promise<Assignment> => {
    const ref = doc(assignmentsRef(input.classroomId));
    const assignment: Assignment = {
        id: ref.id,
        classroomId: input.classroomId,
        teacherId: input.teacherId,
        courseId: input.courseId,
        courseTitle: input.courseTitle,
        moduleId: input.moduleId,
        lessonId: input.lessonId,
        lessonTitle: input.lessonTitle,
        assignedAt: Date.now(),
        dueAt: input.dueAt,
        studentIds: input.studentIds,
    };
    await setDoc(ref, assignment);
    return assignment;
};

/**
 * All assignments in a classroom, newest first. Used by teachers in My Class.
 */
export const listAssignmentsForClassroom = async (classroomId: string): Promise<Assignment[]> => {
    const q = query(assignmentsRef(classroomId), orderBy('assignedAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as Assignment);
};

/**
 * Assignments a specific student should see: those targeted to them personally
 * OR to the whole class (studentIds === null). Firestore doesn't support OR in a
 * single query for this pattern, so we run both reads and merge.
 */
export const listAssignmentsForStudent = async (
    studentId: string,
    classroomId: string,
): Promise<Assignment[]> => {
    const wholeClassQ = query(assignmentsRef(classroomId), where('studentIds', '==', null));
    const targetedQ = query(assignmentsRef(classroomId), where('studentIds', 'array-contains', studentId));

    const [wholeClass, targeted] = await Promise.all([getDocs(wholeClassQ), getDocs(targetedQ)]);
    const byId = new Map<string, Assignment>();
    for (const d of wholeClass.docs) byId.set(d.id, d.data() as Assignment);
    for (const d of targeted.docs) byId.set(d.id, d.data() as Assignment);

    return Array.from(byId.values()).sort((a, b) => b.assignedAt - a.assignedAt);
};

/**
 * Teacher removes an assignment.
 */
export const deleteAssignment = async (classroomId: string, assignmentId: string): Promise<void> => {
    await deleteDoc(doc(db, 'classrooms', classroomId, ASSIGNMENTS_SUBCOLLECTION, assignmentId));
};

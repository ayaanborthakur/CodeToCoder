import {
    doc,
    getDoc,
    setDoc,
    deleteDoc,
    collection,
    query,
    where,
    getDocs,
    orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Assignment, PracticeItem } from '../types';

// Assignments live as a subcollection under each classroom:
//   classrooms/{classroomId}/assignments/{assignmentId}
const ASSIGNMENTS_SUBCOLLECTION = 'assignments';

const assignmentsRef = (classroomId: string) =>
    collection(db, 'classrooms', classroomId, ASSIGNMENTS_SUBCOLLECTION);

/**
 * Teacher creates a new LESSON assignment for their classroom.
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
        kind: 'lesson',
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
 * Teacher creates a PRACTICE assignment for their classroom.
 * The full PracticeItem (quiz questions, starting code, etc.) is denormalised
 * inline so students can render it without access to the teacher's per-user
 * custom-quiz collection.
 */
export const createPracticeAssignment = async (input: {
    classroomId: string;
    teacherId: string;
    practiceItem: PracticeItem;
    dueAt: number | null;
    studentIds: string[] | null;
}): Promise<Assignment> => {
    const ref = doc(assignmentsRef(input.classroomId));
    const assignment: Assignment = {
        id: ref.id,
        classroomId: input.classroomId,
        teacherId: input.teacherId,
        kind: 'practice',
        practiceItem: input.practiceItem,
        assignedAt: Date.now(),
        dueAt: input.dueAt,
        studentIds: input.studentIds,
    };
    await setDoc(ref, assignment);
    return assignment;
};

/**
 * Read a single assignment by ID. Used by the student route that opens an
 * assigned practice item (the inline PracticeItem lives on this doc).
 */
export const getAssignment = async (classroomId: string, assignmentId: string): Promise<Assignment | null> => {
    const snap = await getDoc(doc(db, 'classrooms', classroomId, ASSIGNMENTS_SUBCOLLECTION, assignmentId));
    if (!snap.exists()) return null;
    return snap.data() as Assignment;
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

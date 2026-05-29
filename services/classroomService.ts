import {
    doc,
    setDoc,
    getDoc,
    updateDoc,
    arrayUnion,
    arrayRemove,
    collection,
    query,
    where,
    getDocs,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Classroom, UserRole } from '../types';

const CLASSROOMS_COLLECTION = 'classrooms';

/**
 * Set (or change) a user's role. Used by the in-app role chooser for accounts
 * that never picked a role at signup. Does not touch classId.
 */
export const setUserRole = async (userId: string, role: UserRole): Promise<void> => {
    await setDoc(doc(db, 'users', userId), { role }, { merge: true });
};

/**
 * Generate a random 6-letter uppercase join code.
 * Retries until it finds one not already in use.
 */
const generateJoinCode = (): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // skip I and O to avoid confusion
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
};

/**
 * Verify a join code isn't already taken, generating new ones until unique.
 */
const getUniqueJoinCode = async (): Promise<string> => {
    for (let attempts = 0; attempts < 10; attempts++) {
        const code = generateJoinCode();
        const q = query(
            collection(db, CLASSROOMS_COLLECTION),
            where('joinCode', '==', code)
        );
        const snap = await getDocs(q);
        if (snap.empty) return code;
    }
    // Fallback: extremely unlikely to hit this
    throw new Error('Could not generate a unique join code. Please try again.');
};

/**
 * Create a new classroom for a teacher. Appends to the teacher's classIds
 * array so a single teacher can manage multiple sections. Sets classId to
 * this new room only if the teacher didn't already have one (keeps the
 * legacy single-class field pointing at *something* sensible).
 */
export const createClassroom = async (
    teacherId: string,
    teacherName: string,
    className: string
): Promise<Classroom> => {
    const joinCode = await getUniqueJoinCode();
    const classRef = doc(collection(db, CLASSROOMS_COLLECTION));
    const classroom: Classroom = {
        classId: classRef.id,
        className: className.trim(),
        teacherId,
        teacherName,
        joinCode,
        studentIds: [],
        createdAt: Date.now(),
    };
    await setDoc(classRef, classroom);

    // Append to teacher's classIds. Also set classId if absent (back-compat
    // for any code still reading the single-classroom field).
    const teacherSnap = await getDoc(doc(db, 'users', teacherId));
    const existingClassId = teacherSnap.exists() ? (teacherSnap.data().classId as string | undefined) : undefined;
    const update: Record<string, unknown> = {
        role: 'teacher',
        classIds: arrayUnion(classRef.id),
    };
    if (!existingClassId) update.classId = classRef.id;
    await setDoc(doc(db, 'users', teacherId), update, { merge: true });

    return classroom;
};

/**
 * All classrooms owned by a teacher, oldest first. Used to populate the
 * teacher's classroom switcher. Sort happens client-side so this needs no
 * composite Firestore index (which a where+orderBy combo would require).
 */
export const listTeacherClassrooms = async (teacherId: string): Promise<Classroom[]> => {
    const q = query(
        collection(db, CLASSROOMS_COLLECTION),
        where('teacherId', '==', teacherId)
    );
    const snap = await getDocs(q);
    return snap.docs
        .map(d => d.data() as Classroom)
        .sort((a, b) => a.createdAt - b.createdAt);
};

/**
 * Teacher grants/revokes course access for a single student in their class.
 * Stored on the student's user doc as unlockedCourseIds.
 */
export const setStudentUnlockedCourses = async (
    studentId: string,
    unlockedCourseIds: string[]
): Promise<void> => {
    await setDoc(doc(db, 'users', studentId), { unlockedCourseIds }, { merge: true });
};

/**
 * Find a classroom by its join code.
 * Returns null if the code doesn't match any classroom.
 */
export const getClassroomByJoinCode = async (joinCode: string): Promise<Classroom | null> => {
    const normalised = joinCode.trim().toUpperCase();
    const q = query(
        collection(db, CLASSROOMS_COLLECTION),
        where('joinCode', '==', normalised)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return snap.docs[0].data() as Classroom;
};

/**
 * Add a student to a classroom using a join code.
 * Updates both the classroom document and the student's user doc.
 */
export const joinClassroom = async (studentId: string, joinCode: string): Promise<Classroom> => {
    const classroom = await getClassroomByJoinCode(joinCode);
    if (!classroom) {
        throw new Error('Invalid join code. Please check with your teacher and try again.');
    }

    const classRef = doc(db, CLASSROOMS_COLLECTION, classroom.classId);

    // Add student to the classroom's studentIds array (arrayUnion = idempotent)
    await updateDoc(classRef, {
        studentIds: arrayUnion(studentId),
    });

    // Write classId + role onto the student's user doc
    await setDoc(doc(db, 'users', studentId), { classId: classroom.classId, role: 'student' }, { merge: true });

    return { ...classroom, studentIds: [...classroom.studentIds, studentId] };
};

/**
 * Remove a student from a classroom and clear the classId on their user doc.
 */
export const leaveClassroom = async (studentId: string, classId: string): Promise<void> => {
    await updateDoc(doc(db, CLASSROOMS_COLLECTION, classId), {
        studentIds: arrayRemove(studentId),
    });
    await setDoc(doc(db, 'users', studentId), { classId: '' }, { merge: true });
};

/**
 * Fetch a classroom by its classId.
 */
export const getClassroom = async (classId: string): Promise<Classroom | null> => {
    const snap = await getDoc(doc(db, CLASSROOMS_COLLECTION, classId));
    if (!snap.exists()) return null;
    return snap.data() as Classroom;
};

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
    deleteDoc,
    writeBatch,
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
 * Teacher removes a student from the classroom. Updates the classroom doc
 * (allowed under the existing teacher full-update rule) AND clears classId
 * on the student's user doc (allowed under the new teacher-clears-classId
 * rule). The student must be in the classroom's studentIds when this is
 * called; rule enforces the relationship.
 */
export const removeStudentFromClassroom = async (
    classId: string,
    studentId: string,
): Promise<void> => {
    // Clear classId on the student first (rule checks current classroom membership).
    await updateDoc(doc(db, 'users', studentId), { classId: '' });
    // Then drop them from the classroom's studentIds list.
    await updateDoc(doc(db, CLASSROOMS_COLLECTION, classId), {
        studentIds: arrayRemove(studentId),
    });
};

/**
 * Fetch a classroom by its classId.
 */
export const getClassroom = async (classId: string): Promise<Classroom | null> => {
    const snap = await getDoc(doc(db, CLASSROOMS_COLLECTION, classId));
    if (!snap.exists()) return null;
    return snap.data() as Classroom;
};

// ─── Settings: rename / description / archive / regenerate / delete ────────

type ClassroomSettingsPatch = Partial<Pick<Classroom, 'className' | 'description' | 'archived' | 'archivedAt'>>;

/**
 * Apply a settings patch to a classroom. The caller is responsible for
 * preparing the diff (e.g. setting archivedAt alongside archived).
 */
export const updateClassroomSettings = async (
    classId: string,
    patch: ClassroomSettingsPatch
): Promise<void> => {
    const cleaned: Record<string, unknown> = {};
    if (patch.className !== undefined) cleaned.className = patch.className.trim();
    if (patch.description !== undefined) cleaned.description = patch.description.trim();
    if (patch.archived !== undefined) cleaned.archived = patch.archived;
    if (patch.archivedAt !== undefined) cleaned.archivedAt = patch.archivedAt;
    if (Object.keys(cleaned).length === 0) return;
    await updateDoc(doc(db, CLASSROOMS_COLLECTION, classId), cleaned);
};

/**
 * Replace the classroom's join code with a freshly-generated unique one.
 * Useful if the old code leaked / went around the wrong audience.
 */
export const regenerateJoinCode = async (classId: string): Promise<string> => {
    const newCode = await getUniqueJoinCode();
    await updateDoc(doc(db, CLASSROOMS_COLLECTION, classId), { joinCode: newCode });
    return newCode;
};

/**
 * Permanently delete a classroom and all of its subcollections (posts,
 * assignments). Also removes the classroom from the teacher's classIds array.
 * Note: does NOT clear classId on student user docs — those rules don't allow
 * teacher writes to that field. Students whose classId now points at a
 * deleted classroom will see a "classroom not found" state and can rejoin
 * with another code, or leave to clear their stale pointer.
 */
export const deleteClassroomAndCascade = async (
    classId: string,
    teacherId: string,
): Promise<void> => {
    // 1) Delete all subcollection docs first. Firestore doesn't cascade.
    const subcollections = ['posts', 'assignments'] as const;
    for (const sub of subcollections) {
        const snap = await getDocs(collection(db, CLASSROOMS_COLLECTION, classId, sub));
        // Batched delete (Firestore caps a batch at 500 writes — chunk if needed)
        const docs = snap.docs;
        for (let i = 0; i < docs.length; i += 400) {
            const batch = writeBatch(db);
            for (const d of docs.slice(i, i + 400)) batch.delete(d.ref);
            await batch.commit();
        }
    }

    // 2) Delete the classroom doc itself.
    await deleteDoc(doc(db, CLASSROOMS_COLLECTION, classId));

    // 3) Remove from the teacher's classIds. Also clear classId if it was
    //    pointing at the deleted room (back-compat field).
    const teacherSnap = await getDoc(doc(db, 'users', teacherId));
    if (teacherSnap.exists()) {
        const data = teacherSnap.data();
        const update: Record<string, unknown> = {
            classIds: arrayRemove(classId),
        };
        if (data.classId === classId) update.classId = '';
        await setDoc(doc(db, 'users', teacherId), update, { merge: true });
    }
};

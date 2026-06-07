import {
    doc,
    setDoc,
    getDoc,
    collection,
    query,
    where,
    getDocs,
    orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import type { School, User } from '../types';

const SCHOOLS_COLLECTION = 'schools';

/**
 * Register a new school. Only signed-in teachers should call this — the
 * caller is responsible for the role check. The teacher becomes the
 * registrar (and de-facto admin) of the school.
 *
 * Returns the created School. Throws if a school with the same name (case-
 * insensitive) already exists, so we don't accidentally create duplicate
 * entries that confuse the public footer list.
 */
export const registerSchool = async (
    registrarId: string,
    registrarName: string,
    input: {
        name: string;
        city?: string;
        state?: string;
        country?: string;
        notes?: string;
    },
): Promise<School> => {
    const trimmedName = input.name.trim();
    if (!trimmedName) {
        throw new Error('School name is required.');
    }

    // Cheap dup-check: scan existing schools for a case-insensitive match.
    // At low cardinality (schools are admin-curated) this is fine.
    const existing = await getDocs(collection(db, SCHOOLS_COLLECTION));
    const lower = trimmedName.toLowerCase();
    if (existing.docs.some(d => (d.data() as School).name?.trim().toLowerCase() === lower)) {
        throw new Error(`A school named "${trimmedName}" is already registered.`);
    }

    const ref = doc(collection(db, SCHOOLS_COLLECTION));
    const school: School = {
        id: ref.id,
        name: trimmedName,
        registrarId,
        registrarName,
        city: input.city?.trim() || undefined,
        state: input.state?.trim() || undefined,
        country: input.country?.trim() || undefined,
        notes: input.notes?.trim() || undefined,
        createdAt: Date.now(),
    };
    await setDoc(ref, school);

    // Associate the registrar with their own school (no pending — they're the
    // admin). Idempotent merge.
    await setDoc(
        doc(db, 'users', registrarId),
        { schoolId: ref.id, schoolJoinPending: false },
        { merge: true },
    );

    return school;
};

/**
 * All schools registered on the platform, sorted alphabetically.
 * Public — used by the footer-linked /schools list page.
 */
export const listSchools = async (): Promise<School[]> => {
    const snap = await getDocs(
        query(collection(db, SCHOOLS_COLLECTION), orderBy('name', 'asc')),
    );
    return snap.docs.map(d => d.data() as School);
};

/** Fetch a single school by id. Returns null if not found. */
export const getSchool = async (schoolId: string): Promise<School | null> => {
    const snap = await getDoc(doc(db, SCHOOLS_COLLECTION, schoolId));
    if (!snap.exists()) return null;
    return snap.data() as School;
};

/**
 * List all schools a given teacher is the registrar of. A teacher can only
 * register one school today, but the schema supports more.
 */
export const listSchoolsForRegistrar = async (registrarId: string): Promise<School[]> => {
    const snap = await getDocs(
        query(collection(db, SCHOOLS_COLLECTION), where('registrarId', '==', registrarId)),
    );
    return snap.docs.map(d => d.data() as School);
};

/**
 * Student-facing: request to join a school. Sets schoolJoinPending=true
 * and schoolId=schoolId on the student's user doc. The school's registrar
 * sees this in their pending list and approves/rejects in Phase B.
 *
 * No-op if the user is already a member or has a pending request for the
 * same school.
 */
export const requestSchoolJoin = async (
    user: User,
    schoolId: string,
): Promise<void> => {
    if (user.schoolId === schoolId && !user.schoolJoinPending) return;
    if (user.schoolId === schoolId && user.schoolJoinPending) return;
    await setDoc(
        doc(db, 'users', user.id),
        { schoolId, schoolJoinPending: true },
        { merge: true },
    );
};

/** Mark that the user has seen the "pick a school?" prompt at least once. */
export const markSchoolPromptSeen = async (userId: string): Promise<void> => {
    await setDoc(
        doc(db, 'users', userId),
        { schoolPromptSeen: true },
        { merge: true },
    );
};

// ─── Registrar (teacher who owns a school) flows ──────────────────────────────

/** A pending school-join request, denormalised to display fields needed by the
 *  teacher dashboard. We deliberately don't expose the full User doc here. */
export interface PendingSchoolJoin {
    userId: string;
    name: string;
    username?: string;
    email?: string;
    avatar?: string;
    requestedSchoolId: string;
}

/**
 * All users with a pending join request for the given school. Caller is
 * responsible for verifying the caller is that school's registrar — the
 * Firestore rule will deny otherwise. Returns an empty list if nothing pending.
 */
export const listPendingJoinRequests = async (schoolId: string): Promise<PendingSchoolJoin[]> => {
    const q = query(
        collection(db, 'users'),
        where('schoolId', '==', schoolId),
        where('schoolJoinPending', '==', true),
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => {
        const data = d.data() as User;
        return {
            userId: d.id,
            name: data.name || 'Unknown',
            username: data.username,
            email: data.email,
            avatar: data.avatar,
            requestedSchoolId: schoolId,
        };
    });
};

/**
 * Approve a pending join: clears schoolJoinPending. Student keeps the
 * schoolId they requested.
 * Rule enforces: caller must be the registrar of the user's current schoolId.
 */
export const approveSchoolJoin = async (studentId: string): Promise<void> => {
    await setDoc(
        doc(db, 'users', studentId),
        { schoolJoinPending: false },
        { merge: true },
    );
};

/**
 * Reject a pending join: clears schoolJoinPending AND schoolId. Student is no
 * longer associated with any school.
 * Rule enforces: caller must be the registrar of the user's current schoolId
 * (i.e. you can only reject join requests directed at your own school).
 */
export const rejectSchoolJoin = async (studentId: string): Promise<void> => {
    await setDoc(
        doc(db, 'users', studentId),
        { schoolJoinPending: false, schoolId: '' },
        { merge: true },
    );
};

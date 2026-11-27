import { collection, deleteDoc, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Every sub-collection the app writes under users/{uid}. Firestore can't list
 * sub-collections from the browser, so this list must grow with the app.
 */
const USER_SUBCOLLECTIONS = [
    'Progress', 'Stars', 'Collection', 'DailyChallenges', 'PlaygroundFiles', 'CustomQuizzes',
    'CustomReferences', 'Activity', 'Migration', 'Reviews', 'ReviewLogs',
    // Older lower-case paths still read and written by a few services.
    'progress', 'userSettings', 'customQuizzes', 'playgroundFiles',
    // Written by the AI proxy (daily tutor usage).
    'stats',
];

/**
 * Remove everything a user owns in Firestore before their sign-in is deleted:
 * their sub-collections, profile document and leaderboard entry, their place
 * in a class, and, for teachers, the classes they run. Runs while the user is
 * still signed in, because the security rules only allow owners to delete.
 *
 * Work a student handed in to a class stays with that class until the teacher
 * deletes it, like a paper handed in at school.
 */
export const deleteUserData = async (userId: string): Promise<void> => {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef).catch(() => null);
    const data = snap?.exists() ? snap.data() : {};

    const { leaveClassroom, listTeacherClassrooms, deleteClassroomAndCascade } = await import('./classroomService');
    if (data.role === 'teacher') {
        const owned = await listTeacherClassrooms(userId).catch(() => []);
        for (const c of owned) await deleteClassroomAndCascade(c.classId, userId).catch(() => { /* keep going */ });
    } else if (typeof data.classId === 'string' && data.classId) {
        await leaveClassroom(userId, data.classId).catch(() => { /* class may already be gone */ });
    }

    if (typeof data.avatar === 'string' && data.avatar) {
        const { deleteProfilePicture } = await import('./profilePictureService');
        await deleteProfilePicture(userId).catch(() => { /* no stored picture */ });
    }

    for (const name of USER_SUBCOLLECTIONS) {
        const docs = await getDocs(collection(db, 'users', userId, name)).catch(() => null);
        if (!docs) continue;
        await Promise.all(docs.docs.map(d => deleteDoc(d.ref).catch(() => { /* best effort */ })));
    }

    await deleteDoc(doc(db, 'leaderboard', userId)).catch(() => { /* may not exist */ });
    await deleteDoc(userRef);
};

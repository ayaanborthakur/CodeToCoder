import {
    doc,
    setDoc,
    deleteDoc,
    updateDoc,
    collection,
    query,
    getDocs,
    orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Post } from '../types';

// Teacher announcements live as a subcollection under each classroom:
//   classrooms/{classroomId}/posts/{postId}
const POSTS_SUBCOLLECTION = 'posts';

const postsRef = (classroomId: string) =>
    collection(db, 'classrooms', classroomId, POSTS_SUBCOLLECTION);

/**
 * Teacher creates a new post in their classroom's stream.
 */
export const createPost = async (input: {
    classroomId: string;
    teacherId: string;
    teacherName: string;
    content: string;
}): Promise<Post> => {
    const ref = doc(postsRef(input.classroomId));
    const post: Post = {
        id: ref.id,
        classroomId: input.classroomId,
        teacherId: input.teacherId,
        teacherName: input.teacherName,
        content: input.content,
        createdAt: Date.now(),
    };
    await setDoc(ref, post);
    return post;
};

/**
 * All posts in a classroom, newest first. Used by the stream for both
 * teachers and students.
 */
export const listPostsForClassroom = async (classroomId: string): Promise<Post[]> => {
    const q = query(postsRef(classroomId), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as Post);
};

/**
 * Teacher deletes a post from their classroom.
 */
export const deletePost = async (classroomId: string, postId: string): Promise<void> => {
    await deleteDoc(doc(db, 'classrooms', classroomId, POSTS_SUBCOLLECTION, postId));
};

/**
 * Teacher toggles the pinned state of a post. Pinned posts sort to the top
 * of every class member's stream.
 */
export const setPostPinned = async (
    classroomId: string,
    postId: string,
    pinned: boolean,
): Promise<void> => {
    await updateDoc(doc(db, 'classrooms', classroomId, POSTS_SUBCOLLECTION, postId), { pinned });
};

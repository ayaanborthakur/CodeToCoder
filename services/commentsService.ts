import {
    doc,
    setDoc,
    deleteDoc,
    collection,
    query,
    getDocs,
    orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Comment } from '../types';

// Comments live as a subcollection under the parent post or assignment:
//   classrooms/{classId}/posts/{postId}/comments/{commentId}
//   classrooms/{classId}/assignments/{assignmentId}/comments/{commentId}

type ParentKind = 'post' | 'assignment';

const parentCollectionName = (kind: ParentKind): 'posts' | 'assignments' =>
    kind === 'post' ? 'posts' : 'assignments';

const commentsRef = (classroomId: string, kind: ParentKind, parentId: string) =>
    collection(db, 'classrooms', classroomId, parentCollectionName(kind), parentId, 'comments');

/**
 * Any class member can post a comment on a post or assignment within
 * their classroom.
 */
export const createComment = async (input: {
    classroomId: string;
    parentKind: ParentKind;
    parentId: string;
    authorId: string;
    authorName: string;
    authorRole: 'teacher' | 'student';
    content: string;
}): Promise<Comment> => {
    const ref = doc(commentsRef(input.classroomId, input.parentKind, input.parentId));
    const comment: Comment = {
        id: ref.id,
        classroomId: input.classroomId,
        parentKind: input.parentKind,
        parentId: input.parentId,
        authorId: input.authorId,
        authorName: input.authorName,
        authorRole: input.authorRole,
        content: input.content.trim(),
        createdAt: Date.now(),
    };
    await setDoc(ref, comment);
    return comment;
};

/**
 * List all comments on a parent (post or assignment), oldest first
 * so the conversation reads naturally top-to-bottom.
 */
export const listComments = async (
    classroomId: string,
    parentKind: ParentKind,
    parentId: string,
): Promise<Comment[]> => {
    const q = query(commentsRef(classroomId, parentKind, parentId), orderBy('createdAt', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as Comment);
};

/**
 * Authors delete their own comment; the classroom's teacher can delete any.
 */
export const deleteComment = async (
    classroomId: string,
    parentKind: ParentKind,
    parentId: string,
    commentId: string,
): Promise<void> => {
    await deleteDoc(doc(db, 'classrooms', classroomId, parentCollectionName(parentKind), parentId, 'comments', commentId));
};

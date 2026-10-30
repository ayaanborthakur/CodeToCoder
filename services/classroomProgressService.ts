/**
 * Reads what a teacher needs to know about each student in a classroom.
 *
 * Paths come from userPaths — the same helpers the student app writes with —
 * so the teacher view can't drift from where progress is actually stored.
 */
import { getDoc } from 'firebase/firestore';
import { userPaths } from './firestorePathHelper';
import type { Assignment, Classroom } from '../types';

export interface StudentProgress {
    uid: string;
    username: string;
    name: string;
    avatar?: string;
    completedLessons: string[];
    /** Every completed practice item: problems, quizzes and projects. */
    completedPractice: string[];
    totalStars: number;
    currentStreak: number;
    /** Most recent time any of the student's progress was saved. */
    lastActive: number | null;
    unlockedCourseIds: string[];
}

const newest = (...times: unknown[]): number | null => {
    const nums = times.filter((t): t is number => typeof t === 'number' && t > 0);
    return nums.length ? Math.max(...nums) : null;
};

const loadOne = async (uid: string): Promise<StudentProgress> => {
    const [userSnap, lessonsSnap, starsSnap, problemsSnap, quizzesSnap, projectsSnap] = await Promise.all([
        getDoc(userPaths.root(uid)),
        getDoc(userPaths.progress.classroom(uid)),
        getDoc(userPaths.stars(uid)),
        getDoc(userPaths.progress.practiceProblems(uid)),
        getDoc(userPaths.progress.practiceQuizzes(uid)),
        getDoc(userPaths.progress.practiceProjects(uid)),
    ]);
    const user = userSnap.exists() ? userSnap.data() : {};
    const lessons = lessonsSnap.exists() ? lessonsSnap.data() : {};
    const stars = starsSnap.exists() ? starsSnap.data() : {};
    const practiceDocs = [problemsSnap, quizzesSnap, projectsSnap].map(s => (s.exists() ? s.data() : {}));

    return {
        uid,
        username: user.username ?? uid.slice(0, 8),
        name: user.name ?? 'Unknown student',
        avatar: typeof user.avatar === 'string' ? user.avatar : undefined,
        completedLessons: Array.isArray(lessons.completedLessons) ? lessons.completedLessons : [],
        completedPractice: Array.from(new Set(practiceDocs.flatMap(d => (Array.isArray(d.completed) ? d.completed : [])))),
        totalStars: stars.totalEarned ?? 0,
        currentStreak: stars.currentStreak ?? 0,
        lastActive: newest(lessons.lastUpdated, stars.lastUpdated, ...practiceDocs.map(d => d.lastUpdated)),
        unlockedCourseIds: Array.isArray(user.unlockedCourseIds) ? user.unlockedCourseIds : [],
    };
};

const placeholder = (uid: string): StudentProgress => ({
    uid,
    username: uid.slice(0, 8),
    name: 'Unknown student',
    completedLessons: [],
    completedPractice: [],
    totalStars: 0,
    currentStreak: 0,
    lastActive: null,
    unlockedCourseIds: [],
});

/** Progress for every student in the classroom, most lessons first. */
export const loadClassroomStudents = async (classroom: Classroom): Promise<StudentProgress[]> => {
    // Older classroom docs may lack studentIds entirely.
    const ids = Array.isArray(classroom.studentIds) ? classroom.studentIds : [];
    const results = await Promise.all(ids.map(uid => loadOne(uid).catch(() => placeholder(uid))));
    return results.sort((a, b) => b.completedLessons.length - a.completedLessons.length);
};

/** Class-wide assignments target everyone; others list their students. */
export const assignmentTargets = (a: Assignment, studentId: string): boolean =>
    a.studentIds === null || a.studentIds.includes(studentId);

/** Whether a student has finished an assignment, for lesson and practice kinds alike. */
export const isAssignmentDone = (
    a: Assignment,
    completedLessons: Iterable<string>,
    completedPractice: Iterable<string>,
): boolean => {
    if (a.kind === 'practice') {
        const id = a.practiceItem?.id;
        return !!id && new Set(completedPractice).has(id);
    }
    return !!a.lessonId && new Set(completedLessons).has(a.lessonId);
};

export const DAY_MS = 24 * 60 * 60 * 1000;

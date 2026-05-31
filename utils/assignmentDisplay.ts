import type { Assignment } from '../types';

// Display helpers for assignment cards. Both lesson and practice kinds get
// rendered through the same UI; these functions pull the right primary +
// secondary label and the right "Open" URL out of either shape.

const capitalize = (s?: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');

export const assignmentTitle = (a: Assignment): string => {
    if (a.kind === 'practice') return a.practiceItem?.title ?? 'Practice item';
    return a.lessonTitle ?? 'Lesson';
};

export const assignmentSubtitle = (a: Assignment): string => {
    if (a.kind === 'practice' && a.practiceItem) {
        return `${capitalize(a.practiceItem.type)} · ${a.practiceItem.difficulty}`;
    }
    return a.courseTitle ?? '';
};

/**
 * Path the student should navigate to in order to open an assignment.
 * Lesson assignments → the existing curriculum IDE.
 * Practice assignments → the assignment-scoped route that loads the inline
 * PracticeItem out of the Firestore doc.
 */
export const assignmentOpenPath = (a: Assignment): string => {
    if (a.kind === 'practice') return `/practice/assignment/${a.classroomId}/${a.id}`;
    return `/lessons/${a.moduleId}/${a.lessonId}`;
};

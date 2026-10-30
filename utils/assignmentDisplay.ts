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

const DAY_MS = 24 * 60 * 60 * 1000;

/** Short due-date label plus how urgent it is, shared by teacher and student views. */
export const dueLabel = (dueAt: number | null): { text: string; tone: 'neutral' | 'warning' | 'danger' } => {
    if (dueAt === null) return { text: 'No due date', tone: 'neutral' };
    const d = dueAt - Date.now();
    if (d < 0) return { text: 'Overdue', tone: 'danger' };
    if (d < DAY_MS) return { text: 'Due today', tone: 'warning' };
    if (d < 3 * DAY_MS) return { text: `Due in ${Math.ceil(d / DAY_MS)} days`, tone: 'warning' };
    return { text: `Due ${new Date(dueAt).toLocaleDateString()}`, tone: 'neutral' };
};

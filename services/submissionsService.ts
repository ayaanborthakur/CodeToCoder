/**
 * Student submissions and teacher grades for classroom assignments.
 *
 * One document per student per assignment, at
 * classrooms/{classroomId}/submissions/{assignmentId}_{studentId}. Students
 * write their code and output; teachers write the score and feedback
 * (enforced by firestore.rules).
 */
import { collection, doc, getDocs, increment, query, setDoc, where } from 'firebase/firestore';
import { db } from './firebase';
import type { Assignment, Submission } from '../types';

const submissionsRef = (classroomId: string) => collection(db, 'classrooms', classroomId, 'submissions');

export const submissionId = (assignmentId: string, studentId: string) => `${assignmentId}_${studentId}`;

/**
 * Hand in work for an assignment. Resubmitting replaces the code but keeps
 * any existing grade until the teacher regrades.
 */
export const submitWork = async (input: {
    assignment: Assignment;
    studentId: string;
    studentName: string;
    code: string;
    output: string;
    passed: boolean;
}): Promise<void> => {
    const { assignment: a } = input;
    const now = Date.now();
    await setDoc(
        doc(submissionsRef(a.classroomId), submissionId(a.id, input.studentId)),
        {
            id: submissionId(a.id, input.studentId),
            classroomId: a.classroomId,
            assignmentId: a.id,
            studentId: input.studentId,
            studentName: input.studentName,
            // Firestore documents cap at 1 MiB; student code never gets close,
            // but runaway output (an infinite print loop) can.
            code: input.code.slice(0, 100_000),
            output: input.output.slice(-20_000),
            passed: input.passed,
            status: 'submitted',
            late: a.dueAt !== null && now > a.dueAt,
            attempts: increment(1),
            submittedAt: now,
        },
        { merge: true },
    );
};

/** Every submission in a class (teacher view). */
export const listSubmissionsForClassroom = async (classroomId: string): Promise<Submission[]> => {
    const snap = await getDocs(submissionsRef(classroomId));
    return snap.docs.map(d => d.data() as Submission);
};

/** A student's own submissions in a class. */
export const listMySubmissions = async (classroomId: string, studentId: string): Promise<Submission[]> => {
    const snap = await getDocs(query(submissionsRef(classroomId), where('studentId', '==', studentId)));
    return snap.docs.map(d => d.data() as Submission);
};

/**
 * Teacher grades a student's work. Works whether or not the student has
 * submitted (e.g. to record a zero for missing work).
 */
export const gradeSubmission = async (input: {
    classroomId: string;
    assignmentId: string;
    studentId: string;
    studentName: string;
    existing: boolean;
    score: number | null;
    feedback: string;
}): Promise<void> => {
    const id = submissionId(input.assignmentId, input.studentId);
    const grade = { score: input.score, feedback: input.feedback, gradedAt: Date.now(), status: 'graded' as const };
    await setDoc(
        doc(submissionsRef(input.classroomId), id),
        input.existing
            ? grade
            : {
                ...grade,
                id,
                classroomId: input.classroomId,
                assignmentId: input.assignmentId,
                studentId: input.studentId,
                studentName: input.studentName,
                code: '',
                output: '',
                passed: false,
                late: false,
                attempts: 0,
                submittedAt: 0,
            },
        { merge: true },
    );
};

/** Due at the end of the chosen day in the teacher's time zone (not midnight UTC). */
export const endOfLocalDay = (yyyyMmDd: string): number => new Date(`${yyyyMmDd}T23:59:00`).getTime();

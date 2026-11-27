import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Award, BookOpen, ChevronDown, ClipboardCheck, Lock } from 'lucide-react';
import type { Assignment, Lesson, Module, Submission } from '../types';
import { COURSES, resolveCourseModuleIds, getCourseProgress, isCourseUnlocked } from '../data/coursesData';
import { AssignDialog } from './AssignDialog';
import { assignmentPoints } from '../services/assignmentsService';
import { dueLabel } from '../utils/assignmentDisplay';
import { Card, EmptyState, Page, Pill, ProgressBar } from './ui';

interface CoursePageProps {
    courseId: string;
    modules: Module[];
    completedLessons: Set<string>;
    onBackToCatalog: () => void;
    // Teacher-only: each lesson row gets an "Assign" button.
    teacherId?: string;
    unlockedCourseIds?: string[] | null;
    /** Teachers bypass the locked / module-progression checks. */
    isTeacher?: boolean;
    /** Student: their class assignments and own submissions. */
    assignments?: Assignment[];
    submissions?: Map<string, Submission>;
    /** Student: modules their teacher has locked for the class. */
    lockedModuleIds?: string[];
}

const LESSON_KIND: Record<string, string> = { learn: 'Read', quiz: 'Quiz', project: 'Project' };
const kindOf = (l: Lesson) => LESSON_KIND[l.type ?? ''] ?? 'Code';

const StatusIcon: React.FC<{ state: 'done' | 'current' | 'todo' }> = ({ state }) => state === 'done' ? (
    <svg width="26" height="26" viewBox="0 0 24 24" role="img" aria-label="Done" className="flex-shrink-0"><circle cx="12" cy="12" r="11" fill="#067647" /><path d="m7 12.5 3.2 3L17 9" fill="none" stroke="#fff" strokeWidth="2.4" /></svg>
) : state === 'current' ? (
    <svg width="26" height="26" viewBox="0 0 24 24" role="img" aria-label="Up next" className="flex-shrink-0 text-cyan-700 dark:text-cyan-400"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2.4" /><path d="M12 2a10 10 0 0 1 0 20z" fill="currentColor" /></svg>
) : (
    <svg width="26" height="26" viewBox="0 0 24 24" role="img" aria-label="Not started" className="flex-shrink-0 text-gray-400 dark:text-gray-500"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2.4" /></svg>
);

/**
 * A course as a list of modules, each a checklist of lessons with what's done,
 * what's next and what's assigned (the layout Canvas and Khan Academy use).
 */
export const CoursePage: React.FC<CoursePageProps> = ({
    courseId, modules, completedLessons, onBackToCatalog, teacherId, unlockedCourseIds, isTeacher = false, assignments = [], submissions = new Map(), lockedModuleIds = [],
}) => {
    const course = COURSES.find(c => c.id === courseId);
    const [assignTarget, setAssignTarget] = useState<{ moduleId: string; lessonId: string; lessonTitle: string } | null>(null);
    const [recentlyAssigned, setRecentlyAssigned] = useState<Set<string>>(new Set());
    const [openOverride, setOpenOverride] = useState<Record<string, boolean>>({});

    const { courseModules, progress, unlocked } = useMemo(() => {
        const allIds = modules.map(m => m.id);
        const byId = new Map(modules.map(m => [m.id, m] as const));
        const courseMods = resolveCourseModuleIds(courseId, allIds).map(id => byId.get(id)).filter((m): m is Module => !!m);
        return {
            courseModules: courseMods,
            progress: getCourseProgress(courseId, allIds, byId, completedLessons),
            unlocked: course ? (isTeacher || isCourseUnlocked(course, allIds, byId, completedLessons, unlockedCourseIds)) : false,
        };
    }, [courseId, modules, completedLessons, course, isTeacher, unlockedCourseIds]);

    // The first lesson not done yet is "up next".
    const next = useMemo(() => {
        for (const m of courseModules) {
            const l = m.lessons.find(x => !completedLessons.has(x.id));
            if (l) return { module: m, lesson: l };
        }
        return null;
    }, [courseModules, completedLessons]);

    const assignedByLesson = useMemo(() => new Map(
        assignments.filter(a => (a.kind ?? 'lesson') === 'lesson' && a.lessonId).map(a => [a.lessonId!, a] as const),
    ), [assignments]);
    const assignedHere = courseModules.flatMap(m => m.lessons).map(l => assignedByLesson.get(l.id)).filter((a): a is Assignment => !!a);

    if (!course) {
        return <Page><EmptyState title="Course not found" action={<button onClick={onBackToCatalog} className="font-semibold text-cyan-700">All courses</button>} /></Page>;
    }

    const teacherLocked = (index: number) => !isTeacher && lockedModuleIds.includes(courseModules[index].id);
    const isModuleLocked = (index: number) => {
        // A module opens once the previous module's final lesson is done, unless
        // the teacher has locked it for the class. Teachers see everything.
        if (isTeacher) return false;
        if (teacherLocked(index)) return true;
        if (index === 0) return false;
        const prev = courseModules[index - 1];
        return prev.lessons.length > 0 && !completedLessons.has(prev.lessons[prev.lessons.length - 1].id);
    };

    return (
        <Page width="wide">
            <nav aria-label="Breadcrumb" className="mb-4 text-gray-600 dark:text-gray-400">
                <button onClick={onBackToCatalog} className="no-hover font-medium text-cyan-700 dark:text-cyan-400 hover:underline">Courses</button>
                <span className="mx-2" aria-hidden="true">/</span>{course.title}
            </nav>

            <header className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 sm:p-8 flex flex-wrap items-center gap-6 mb-8">
                <div className="flex-1 min-w-[18rem]">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">{course.title}</h1>
                    <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">{course.description}</p>
                    {unlocked && !course.comingSoon && progress.total > 0 && (
                        <div className="mt-5 flex items-center gap-3 max-w-xl">
                            <ProgressBar value={progress.completed} max={progress.total} className="flex-1 !h-2.5" label="Course progress" />
                            <span className="font-medium text-gray-600 dark:text-gray-400 tabular-nums">{progress.completed} of {progress.total} lessons</span>
                        </div>
                    )}
                </div>
                {unlocked && next && !isTeacher && (
                    <Link to={`/lessons/${next.module.id}/${next.lesson.id}`} className="no-hover inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white text-lg font-semibold">
                        {progress.completed > 0 ? 'Continue' : 'Start'}: {next.lesson.title} <ArrowRight className="w-5 h-5" />
                    </Link>
                )}
                {unlocked && !isTeacher && progress.total > 0 && progress.completed === progress.total && (
                    <Link to={`/certificate/${course.id}`} className="no-hover inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white text-lg font-semibold">
                        <Award className="w-5 h-5" /> Get your certificate
                    </Link>
                )}
            </header>

            {!unlocked && (
                <EmptyState icon={<Lock className="w-5 h-5" />} title="This course is locked" description={<>Finish <span className="font-semibold">{COURSES.find(c => c.id === course.prerequisiteCourseId)?.title}</span> to unlock it.</>} />
            )}
            {unlocked && course.comingSoon && (
                <EmptyState icon={<BookOpen className="w-5 h-5" />} title="Lessons coming soon" description="We're writing this course now. Check back later." />
            )}

            {unlocked && !course.comingSoon && courseModules.length > 0 && (
                <div className={assignedHere.length > 0 ? 'grid lg:grid-cols-[minmax(0,1fr)_340px] gap-8 items-start' : ''}>
                    <div className="space-y-4 min-w-0">
                        {courseModules.map((module, index) => {
                            const locked = isModuleLocked(index);
                            const done = module.lessons.filter(l => completedLessons.has(l.id)).length;
                            const containsNext = next?.module.id === module.id;
                            const open = !locked && (openOverride[module.id] ?? (containsNext || (isTeacher && index === 0)));
                            return (
                                <section key={module.id} className={`rounded-2xl border overflow-hidden ${locked ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
                                    <button
                                        onClick={() => !locked && setOpenOverride(prev => ({ ...prev, [module.id]: !open }))}
                                        disabled={locked}
                                        aria-expanded={open}
                                        className="no-hover w-full flex items-center gap-4 px-5 sm:px-6 py-5 text-left disabled:cursor-not-allowed"
                                    >
                                        <span className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold flex-shrink-0 ${done === module.lessons.length && module.lessons.length > 0 ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : containsNext ? 'bg-cyan-50 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                                            {locked ? <Lock className="w-5 h-5" /> : index + 1}
                                        </span>
                                        <span className="flex-1 min-w-0">
                                            <span className="block text-xl font-bold text-gray-900 dark:text-white">{module.title}</span>
                                            <span className="block text-gray-600 dark:text-gray-400">
                                                {locked ? (teacherLocked(index) ? "Your teacher hasn't opened this module yet" : "Opens when you finish the previous module's project") : `${done} of ${module.lessons.length} lessons done`}
                                            </span>
                                        </span>
                                        {!locked && <ChevronDown className={`w-6 h-6 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />}
                                    </button>
                                    {open && (
                                        <ol className="border-t border-gray-100 dark:border-gray-700">
                                            {module.lessons.map(lesson => {
                                                const isDone = completedLessons.has(lesson.id);
                                                const isNext = next?.lesson.id === lesson.id;
                                                const a = assignedByLesson.get(lesson.id);
                                                const sub = a ? submissions.get(a.id) : undefined;
                                                return (
                                                    <li key={lesson.id} className={`flex items-center gap-4 px-5 sm:px-6 py-3.5 border-b last:border-b-0 border-gray-100 dark:border-gray-700/60 ${isNext ? 'bg-cyan-50/60 dark:bg-cyan-900/10' : ''}`}>
                                                        <StatusIcon state={isDone ? 'done' : isNext ? 'current' : 'todo'} />
                                                        <Link to={`/lessons/${module.id}/${lesson.id}`} className={`no-hover flex-1 min-w-0 truncate hover:text-cyan-700 dark:hover:text-cyan-400 ${isNext ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-800 dark:text-gray-200'}`}>
                                                            {lesson.title}
                                                        </Link>
                                                        {a && !isTeacher && (
                                                            typeof sub?.score === 'number'
                                                                ? <Pill tone="success">Graded {sub.score}/{assignmentPoints(a)}</Pill>
                                                                : sub && sub.submittedAt > 0
                                                                    ? <Pill tone="info">Submitted</Pill>
                                                                    : <Pill tone={dueLabel(a.dueAt).tone === 'neutral' ? 'warning' : dueLabel(a.dueAt).tone}>Assigned · {dueLabel(a.dueAt).text.toLowerCase()}</Pill>
                                                        )}
                                                        <span className="hidden sm:inline text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2.5 py-0.5 rounded-full">{kindOf(lesson)}</span>
                                                        {teacherId && (
                                                            <button
                                                                onClick={() => setAssignTarget({ moduleId: module.id, lessonId: lesson.id, lessonTitle: lesson.title })}
                                                                className={`no-hover inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border ${recentlyAssigned.has(lesson.id) ? 'border-green-300 text-green-800 bg-green-50 dark:bg-green-900/30 dark:text-green-300' : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-cyan-600'}`}
                                                            >
                                                                <ClipboardCheck className="w-4 h-4" />{recentlyAssigned.has(lesson.id) ? 'Assigned' : 'Assign'}
                                                            </button>
                                                        )}
                                                    </li>
                                                );
                                            })}
                                        </ol>
                                    )}
                                </section>
                            );
                        })}
                    </div>

                    {assignedHere.length > 0 && !isTeacher && (
                        <aside>
                            <Card>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Assigned in this course</h2>
                                <ul className="space-y-4">
                                    {assignedHere.map(a => {
                                        const sub = submissions.get(a.id);
                                        const due = dueLabel(a.dueAt);
                                        return (
                                            <li key={a.id}>
                                                <Link to={`/lessons/${a.moduleId}/${a.lessonId}`} className="font-semibold text-gray-900 dark:text-white hover:text-cyan-700">{a.lessonTitle}</Link>
                                                <div className={`text-sm ${typeof sub?.score === 'number' ? 'text-green-700 dark:text-green-400' : due.tone === 'danger' ? 'text-red-700 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                                    {typeof sub?.score === 'number' ? `Graded · ${sub.score} / ${assignmentPoints(a)}` : sub && sub.submittedAt > 0 ? 'Submitted' : `${due.text} · ${assignmentPoints(a)} pts`}
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </Card>
                        </aside>
                    )}
                </div>
            )}

            {assignTarget && teacherId && (
                <AssignDialog
                    teacherId={teacherId}
                    target={{ kind: 'lesson', courseId, courseTitle: course.title, moduleId: assignTarget.moduleId, lessonId: assignTarget.lessonId, lessonTitle: assignTarget.lessonTitle }}
                    onClose={() => setAssignTarget(null)}
                    onAssigned={() => {
                        const lessonId = assignTarget.lessonId;
                        setRecentlyAssigned(prev => new Set(prev).add(lessonId));
                    }}
                />
            )}
        </Page>
    );
};

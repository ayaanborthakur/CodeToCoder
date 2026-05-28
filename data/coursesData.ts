import type { Course } from '../types';

// The course catalog. "Python Basics" wraps the existing remote-manifest modules:
// its moduleIds is intentionally `null`-ish (computed at runtime as "all modules
// from the manifest"). Other courses start as placeholders until their material
// is added to the remote bundle and listed here.
//
// To add real content to a placeholder: drop comingSoon:true and populate
// moduleIds with the module IDs from the remote manifest.
export const COURSES: Course[] = [
  {
    id: 'python-basics',
    title: 'Python Basics',
    description: 'Variables, loops, functions, and your first programs.',
    icon: '🐍',
    accentColor: 'from-cyan-500 to-blue-600',
    order: 1,
    comingSoon: false,
    moduleIds: [],                // Special: resolved at runtime as "all current modules"
    prerequisiteCourseId: null,
    unlockThreshold: 0,
  },
  {
    id: 'data-structures',
    title: 'Data Structures',
    description: 'Lists, dictionaries, tuples, sets, and strings in depth.',
    icon: '📦',
    accentColor: 'from-purple-500 to-pink-600',
    order: 2,
    comingSoon: true,
    moduleIds: [],
    prerequisiteCourseId: 'python-basics',
    unlockThreshold: 0.8,
  },
  {
    id: 'oop',
    title: 'Object-Oriented Programming',
    description: 'Classes, inheritance, and building reusable code.',
    icon: '🧱',
    accentColor: 'from-amber-500 to-orange-600',
    order: 3,
    comingSoon: true,
    moduleIds: [],
    prerequisiteCourseId: 'data-structures',
    unlockThreshold: 0.8,
  },
  {
    id: 'files-databases',
    title: 'File Handling & Databases',
    description: 'Read and write files, and store data with SQL.',
    icon: '🗄️',
    accentColor: 'from-emerald-500 to-teal-600',
    order: 4,
    comingSoon: true,
    moduleIds: [],
    prerequisiteCourseId: 'oop',
    unlockThreshold: 0.8,
  },
  {
    id: 'algorithms',
    title: 'Algorithms & Recursion',
    description: 'Sorting, searching, and thinking recursively.',
    icon: '🧮',
    accentColor: 'from-rose-500 to-red-600',
    order: 5,
    comingSoon: true,
    moduleIds: [],
    prerequisiteCourseId: 'files-databases',
    unlockThreshold: 0.8,
  },
];

export const PYTHON_BASICS_COURSE_ID = 'python-basics';

// Resolves a course's actual module IDs. Python Basics absorbs every module
// from the remote manifest; other courses use their explicit moduleIds list.
export function resolveCourseModuleIds(courseId: string, allModuleIds: string[]): string[] {
  if (courseId === PYTHON_BASICS_COURSE_ID) return allModuleIds;
  const course = COURSES.find(c => c.id === courseId);
  return course?.moduleIds ?? [];
}

// Which course owns this module? Used to derive the active course from a /lessons/:moduleId/:lessonId URL.
export function findCourseIdForModule(moduleId: string, allModuleIds: string[]): string {
  for (const course of COURSES) {
    if (course.id === PYTHON_BASICS_COURSE_ID) {
      if (allModuleIds.includes(moduleId)) return course.id;
    } else if (course.moduleIds.includes(moduleId)) {
      return course.id;
    }
  }
  return PYTHON_BASICS_COURSE_ID;
}

// Course-level progress (completed lessons / total) for unlock checks and UI.
export function getCourseProgress(
  courseId: string,
  allModuleIds: string[],
  modulesById: Map<string, { lessons: { id: string }[] }>,
  completedLessons: Set<string>,
): { completed: number; total: number; fraction: number } {
  const moduleIds = resolveCourseModuleIds(courseId, allModuleIds);
  let completed = 0;
  let total = 0;
  for (const mid of moduleIds) {
    const module = modulesById.get(mid);
    if (!module) continue;
    total += module.lessons.length;
    for (const lesson of module.lessons) {
      if (completedLessons.has(lesson.id)) completed += 1;
    }
  }
  return { completed, total, fraction: total === 0 ? 0 : completed / total };
}

// Is a course unlocked? Always true for Python Basics; for others, requires
// the prerequisite course to be ≥ unlockThreshold complete.
export function isCourseUnlocked(
  course: Course,
  allModuleIds: string[],
  modulesById: Map<string, { lessons: { id: string }[] }>,
  completedLessons: Set<string>,
): boolean {
  if (!course.prerequisiteCourseId) return true;
  const prereq = getCourseProgress(course.prerequisiteCourseId, allModuleIds, modulesById, completedLessons);
  return prereq.fraction >= course.unlockThreshold;
}

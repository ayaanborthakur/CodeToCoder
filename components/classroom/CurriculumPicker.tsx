import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Check, CheckCircle2, ChevronDown, Code2, HelpCircle, Rocket, X } from 'lucide-react';
import type { Assignment, Lesson, Module } from '../../types';
import type { LessonTarget } from '../AssignDialog';
import { COURSES, resolveCourseModuleIds } from '../../data/coursesData';
import { Button } from '../ui';

const KIND: Record<string, { label: string; icon: React.ReactNode; tone: string }> = {
    learn: { label: 'Read', icon: <BookOpen className="w-3.5 h-3.5" />, tone: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300' },
    quiz: { label: 'Quiz', icon: <HelpCircle className="w-3.5 h-3.5" />, tone: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' },
    project: { label: 'Project', icon: <Rocket className="w-3.5 h-3.5" />, tone: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300' },
    code: { label: 'Code', icon: <Code2 className="w-3.5 h-3.5" />, tone: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' },
};
const kindOf = (l: Lesson) => KIND[l.type ?? ''] ?? KIND.code;

/**
 * Pick lessons from the curriculum to assign: tick as many as you like across
 * modules, then assign them together from the bar at the bottom.
 */
export const CurriculumPicker: React.FC<{
    base: string;
    modules: Module[];
    assignments: Assignment[];
    onAssign: (items: LessonTarget[]) => void;
}> = ({ base, modules, assignments, onAssign }) => {
    const allIds = modules.map(m => m.id);
    const courses = useMemo(() => COURSES.map(course => ({
        course,
        mods: resolveCourseModuleIds(course.id, allIds).map(id => modules.find(m => m.id === id)).filter((m): m is Module => !!m),
    })), [modules]); // eslint-disable-line react-hooks/exhaustive-deps
    const firstOpen = courses.find(c => !c.course.comingSoon && c.mods.length > 0)?.course.id ?? null;
    const [courseId, setCourseId] = useState<string | null>(firstOpen);
    const [openModules, setOpenModules] = useState<Set<string>>(() => new Set(courses.find(c => c.course.id === firstOpen)?.mods.slice(0, 1).map(m => m.id) ?? []));
    // Ordered selection, keyed by lesson id.
    const [selected, setSelected] = useState<Map<string, LessonTarget>>(new Map());

    const assigned = useMemo(() => new Set(assignments.filter(a => (a.kind ?? 'lesson') === 'lesson').map(a => a.lessonId)), [assignments]);
    const current = courses.find(c => c.course.id === courseId);

    const target = (module: Module, lesson: Lesson): LessonTarget => ({
        courseId: current!.course.id, courseTitle: current!.course.title, moduleId: module.id, lessonId: lesson.id, lessonTitle: lesson.title,
    });
    const toggle = (module: Module, lesson: Lesson) => setSelected(prev => {
        const next = new Map(prev);
        if (next.has(lesson.id)) next.delete(lesson.id); else next.set(lesson.id, target(module, lesson));
        return next;
    });
    const toggleModule = (module: Module) => setSelected(prev => {
        const next = new Map(prev);
        const all = module.lessons.every(l => next.has(l.id));
        module.lessons.forEach(l => { if (all) next.delete(l.id); else next.set(l.id, target(module, l)); });
        return next;
    });
    const toggleOpen = (id: string) => setOpenModules(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });

    // Keep the curriculum order no matter what order lessons were ticked in.
    const ordered = () => {
        const order = new Map(modules.flatMap(m => m.lessons.map(l => l.id)).map((id, i) => [id, i]));
        return [...selected.values()].sort((a, b) => (order.get(a.lessonId) ?? 0) - (order.get(b.lessonId) ?? 0));
    };

    return (
        <div className="pb-24">
            <Link to={`${base}/assignments`} className="no-hover inline-flex items-center gap-1.5 mb-4 font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Back to assignments
            </Link>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Assign from the curriculum</h2>
            <p className="mt-1 mb-5 text-gray-600 dark:text-gray-400">Tick as many lessons as you want, then assign them together. You set one due date, or space them out.</p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6" role="tablist" aria-label="Courses">
                {courses.map(({ course, mods }) => {
                    const usable = !course.comingSoon && mods.length > 0;
                    const active = course.id === courseId;
                    const count = mods.flatMap(m => m.lessons).filter(l => selected.has(l.id)).length;
                    return (
                        <button
                            key={course.id}
                            role="tab"
                            aria-selected={active}
                            disabled={!usable}
                            onClick={() => { setCourseId(course.id); setOpenModules(new Set(mods.slice(0, 1).map(m => m.id))); }}
                            className={`no-hover relative overflow-hidden text-left rounded-2xl border p-4 pt-5 flex items-center gap-3 ${active
                                ? 'border-cyan-500 ring-2 ring-cyan-500/30 bg-white dark:bg-gray-800'
                                : usable ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40 opacity-60 cursor-not-allowed'}`}
                        >
                            <span className={`absolute inset-x-0 top-0 h-1.5 ${course.accentColor}`} aria-hidden="true" />
                            <span className="text-2xl" aria-hidden="true">{course.icon}</span>
                            <span className="min-w-0 flex-1">
                                <span className="block font-bold text-gray-900 dark:text-white truncate">{course.title}</span>
                                <span className="block text-sm text-gray-600 dark:text-gray-400">{usable ? `${mods.length} modules · ${mods.reduce((n, m) => n + m.lessons.length, 0)} lessons` : 'Coming soon'}</span>
                            </span>
                            {count > 0 && <span className="min-w-[1.75rem] h-7 px-2 rounded-full bg-cyan-700 text-white text-sm font-bold flex items-center justify-center">{count}</span>}
                        </button>
                    );
                })}
            </div>

            {current && (
                <div className="space-y-3">
                    {current.mods.map((module, mi) => {
                        const open = openModules.has(module.id);
                        const picked = module.lessons.filter(l => selected.has(l.id)).length;
                        const all = picked === module.lessons.length && picked > 0;
                        const some = picked > 0 && !all;
                        const doneAssigning = module.lessons.filter(l => assigned.has(l.id)).length;
                        return (
                            <section key={module.id} className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
                                <div className="flex items-center gap-3 px-4 sm:px-5 py-4">
                                    <Checkbox checked={all} mixed={some} onChange={() => toggleModule(module)} label={`Select every lesson in ${module.title}`} />
                                    <button onClick={() => toggleOpen(module.id)} aria-expanded={open} className="no-hover flex-1 min-w-0 flex items-center gap-3 text-left">
                                        <span className={`w-10 h-10 rounded-xl ${current.course.accentColor} text-white font-bold flex items-center justify-center flex-shrink-0`}>{mi + 1}</span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block text-lg font-bold text-gray-900 dark:text-white truncate">{module.title}</span>
                                            <span className="block text-sm text-gray-600 dark:text-gray-400">
                                                {module.lessons.length} lessons{doneAssigning ? ` · ${doneAssigning} already assigned` : ''}{picked ? ` · ${picked} selected` : ''}
                                            </span>
                                        </span>
                                        <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
                                    </button>
                                </div>
                                {open && (
                                    <ul className="border-t border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700/60">
                                        {module.lessons.map((lesson, i) => {
                                            const on = selected.has(lesson.id);
                                            const k = kindOf(lesson);
                                            return (
                                                <li key={lesson.id}>
                                                    <label className={`flex items-center gap-3 px-4 sm:px-5 py-3 cursor-pointer ${on ? 'bg-cyan-50/70 dark:bg-cyan-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'}`}>
                                                        <Checkbox checked={on} onChange={() => toggle(module, lesson)} label={lesson.title} />
                                                        <span className="w-6 text-right text-sm font-semibold text-gray-400 tabular-nums">{i + 1}</span>
                                                        <span className="flex-1 min-w-0 font-medium text-gray-900 dark:text-white truncate">{lesson.title}</span>
                                                        {assigned.has(lesson.id) && (
                                                            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-green-700 dark:text-green-400"><CheckCircle2 className="w-3.5 h-3.5" />Assigned</span>
                                                        )}
                                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${k.tone}`}>{k.icon}{k.label}</span>
                                                    </label>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </section>
                        );
                    })}
                </div>
            )}

            {selected.size > 0 && (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 md:left-[calc(50%+8rem)] z-40 w-[calc(100%-2rem)] max-w-2xl rounded-2xl bg-gray-900 dark:bg-gray-950 text-white shadow-2xl border border-gray-700 px-4 sm:px-5 py-3 flex items-center gap-3">
                    <span className="w-9 h-9 rounded-full bg-cyan-500 text-gray-900 font-bold flex items-center justify-center flex-shrink-0">{selected.size}</span>
                    <span className="flex-1 min-w-0 font-semibold truncate">{selected.size === 1 ? '1 lesson selected' : `${selected.size} lessons selected`}</span>
                    <button onClick={() => setSelected(new Map())} className="no-hover inline-flex items-center gap-1 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 font-medium"><X className="w-4 h-4" />Clear</button>
                    <Button variant="primary" onClick={() => onAssign(ordered())}>Assign {selected.size}</Button>
                </div>
            )}
        </div>
    );
};

const Checkbox: React.FC<{ checked: boolean; mixed?: boolean; onChange: () => void; label: string }> = ({ checked, mixed, onChange, label }) => (
    <span className="relative flex-shrink-0">
        <input type="checkbox" className="peer sr-only" checked={checked} onChange={onChange} aria-label={label} aria-checked={mixed ? 'mixed' : checked} />
        <span
            aria-hidden="true"
            onClick={(e) => { e.preventDefault(); onChange(); }}
            className={`w-6 h-6 rounded-md border-2 flex items-center justify-center cursor-pointer peer-focus-visible:ring-2 peer-focus-visible:ring-cyan-500 ${checked || mixed ? 'bg-cyan-600 border-cyan-600 text-white' : 'border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-800'}`}
        >
            {checked ? <Check className="w-4 h-4" strokeWidth={3} /> : mixed ? <span className="w-2.5 h-0.5 bg-white rounded" /> : null}
        </span>
    </span>
);

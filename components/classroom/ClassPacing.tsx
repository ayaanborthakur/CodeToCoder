import React, { useState } from 'react';
import { Lock, Unlock } from 'lucide-react';
import type { Classroom, LatePolicy, Module } from '../../types';
import { COURSES, resolveCourseModuleIds } from '../../data/coursesData';
import { updateClassroomSettings } from '../../services/classroomService';
import { DEFAULT_LATE_POLICY } from '../../utils/classroomTime';
import { Alert, Button, Card } from '../ui';

/**
 * Class-wide pacing: which modules students can open, and how late work is
 * handled. Saved on the classroom doc, which every student in it can read.
 */
export const ClassPacing: React.FC<{
    classroom: Classroom;
    modules: Module[];
    onChange: (patch: Partial<Classroom>) => void;
}> = ({ classroom, modules, onChange }) => {
    const [error, setError] = useState<string | null>(null);
    const locked = new Set(classroom.lockedModuleIds ?? []);
    const policy = classroom.latePolicy ?? DEFAULT_LATE_POLICY;
    const [penalty, setPenalty] = useState(String(policy.penaltyPercent));
    const allIds = modules.map(m => m.id);

    const save = async (patch: Partial<Classroom>, rollback: Partial<Classroom>) => {
        setError(null);
        onChange(patch);
        try {
            await updateClassroomSettings(classroom.classId, patch);
        } catch (e: unknown) {
            onChange(rollback);
            setError(e instanceof Error ? e.message : 'Could not save.');
        }
    };

    const setLocked = (ids: string[]) => save({ lockedModuleIds: ids }, { lockedModuleIds: classroom.lockedModuleIds ?? [] });
    const toggle = (id: string) => setLocked(locked.has(id) ? [...locked].filter(x => x !== id) : [...locked, id]);
    const setPolicy = (next: LatePolicy) => save({ latePolicy: next }, { latePolicy: classroom.latePolicy });

    const courses = COURSES.filter(c => !c.comingSoon)
        .map(c => ({ course: c, mods: resolveCourseModuleIds(c.id, allIds).map(id => modules.find(m => m.id === id)).filter((m): m is Module => !!m) }))
        .filter(c => c.mods.length > 0);

    return (
        <div className="space-y-6">
            {error && <Alert tone="danger">{error}</Alert>}

            <Card>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Module access</h2>
                <p className="mt-1 mb-4 text-gray-600 dark:text-gray-400">Lock modules your class hasn't reached yet. Students see them but can't open them until you unlock them.</p>
                <div className="space-y-5">
                    {courses.map(({ course, mods }) => (
                        <div key={course.id}>
                            <div className="flex items-center justify-between gap-3 mb-2">
                                <h3 className="font-semibold text-gray-900 dark:text-white">{course.title}</h3>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="ghost" onClick={() => setLocked([...locked].filter(id => !mods.some(m => m.id === id)))}>Unlock all</Button>
                                    <Button size="sm" variant="ghost" onClick={() => setLocked(Array.from(new Set([...locked, ...mods.map(m => m.id)])))}>Lock all</Button>
                                </div>
                            </div>
                            <ul className="divide-y divide-gray-100 dark:divide-gray-700 rounded-xl border border-gray-200 dark:border-gray-700">
                                {mods.map((m, i) => {
                                    const isLocked = locked.has(m.id);
                                    return (
                                        <li key={m.id} className="flex items-center gap-3 px-4 py-2.5">
                                            <span className="w-6 text-sm font-semibold text-gray-500 tabular-nums">{i + 1}</span>
                                            <span className="flex-1 min-w-0 truncate text-gray-900 dark:text-white">{m.title}</span>
                                            <button
                                                onClick={() => toggle(m.id)}
                                                aria-pressed={isLocked}
                                                className={`no-hover inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border ${isLocked
                                                    ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800'
                                                    : 'bg-green-50 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'}`}
                                            >
                                                {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                                                {isLocked ? 'Locked' : 'Open'}
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </div>
            </Card>

            <Card>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Late work</h2>
                <p className="mt-1 mb-4 text-gray-600 dark:text-gray-400">Applies to every assignment in this class with a due date.</p>
                <label className="flex items-start gap-3 mb-4 cursor-pointer">
                    <input type="checkbox" className="mt-1 w-4 h-4 accent-cyan-700" checked={policy.accept} onChange={e => setPolicy({ ...policy, accept: e.target.checked })} />
                    <span>
                        <span className="block font-semibold text-gray-900 dark:text-white">Accept late work</span>
                        <span className="block text-sm text-gray-600 dark:text-gray-400">If off, students can't hand in after the due date.</span>
                    </span>
                </label>
                {policy.accept && (
                    <div className="flex flex-wrap items-center gap-3">
                        <label htmlFor="late-penalty" className="font-semibold text-gray-900 dark:text-white">Late penalty</label>
                        <input
                            id="late-penalty"
                            type="number"
                            min={0}
                            max={100}
                            value={penalty}
                            onChange={e => setPenalty(e.target.value)}
                            onBlur={() => { const n = Math.min(100, Math.max(0, Math.round(Number(penalty) || 0))); setPenalty(String(n)); if (n !== policy.penaltyPercent) setPolicy({ ...policy, penaltyPercent: n }); }}
                            className="w-24 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-gray-900 dark:text-white"
                        />
                        <span className="text-gray-600 dark:text-gray-400">% off the score. The grader suggests the reduced score; you can still change it.</span>
                    </div>
                )}
            </Card>
        </div>
    );
};

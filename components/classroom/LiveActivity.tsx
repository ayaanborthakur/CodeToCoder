import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Radio } from 'lucide-react';
import type { Assignment, Module, Submission } from '../../types';
import type { StudentProgress } from '../../services/classroomProgressService';
import { assignmentTitle } from '../../utils/assignmentDisplay';
import { timeAgo } from '../../utils/classroomTime';
import { Avatar, Card, EmptyState } from '../ui';

const MIN = 60 * 1000;
const ACTIVE_NOW = 10 * MIN;


/**
 * Who is working right now and what was handed in most recently. Refreshes
 * itself every 30 seconds while open.
 */
export const LiveActivity: React.FC<{
    base: string;
    students: StudentProgress[];
    assignments: Assignment[];
    submissions: Map<string, Submission>;
    modules: Module[];
    onRefresh: () => void;
}> = ({ base, students, assignments, submissions, modules, onRefresh }) => {
    const [now, setNow] = useState(Date.now());
    useEffect(() => {
        const id = window.setInterval(() => { setNow(Date.now()); onRefresh(); }, 30_000);
        return () => window.clearInterval(id);
    }, [onRefresh]);

    const lessonTitle = new Map(modules.flatMap(m => m.lessons.map(l => [l.id, l.title] as const)));
    const latestBy = new Map<string, Submission>();
    submissions.forEach(s => {
        if (s.submittedAt > 0 && (latestBy.get(s.studentId)?.submittedAt ?? 0) < s.submittedAt) latestBy.set(s.studentId, s);
    });
    const byActivity = [...students].sort((a, b) => (b.lastActive ?? 0) - (a.lastActive ?? 0));
    const activeNow = byActivity.filter(s => s.lastActive && now - s.lastActive < ACTIVE_NOW).length;
    const feed = [...submissions.values()]
        .filter(s => s.submittedAt > 0 && assignments.some(a => a.id === s.assignmentId))
        .sort((a, b) => b.submittedAt - a.submittedAt)
        .slice(0, 12);

    if (students.length === 0) return <EmptyState title="No students yet" description="Activity shows up once students join and start working." />;

    return (
        <div className="grid lg:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start">
            <Card padded={false} className="overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                    <Radio className="w-5 h-5 text-green-600" aria-hidden="true" />
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Students</h2>
                    <span className="ml-auto text-sm text-gray-600 dark:text-gray-400">{activeNow} working now · updates every 30 s</span>
                </div>
                <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                    {byActivity.map(s => {
                        const live = !!s.lastActive && now - s.lastActive < ACTIVE_NOW;
                        const last = s.completedLessons[s.completedLessons.length - 1];
                        const sub = latestBy.get(s.uid);
                        return (
                            <li key={s.uid} className="flex items-center gap-3 px-5 py-3">
                                <span className="relative">
                                    <Avatar name={s.name} src={s.avatar} size="sm" />
                                    <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-white dark:ring-gray-800 ${live ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} aria-label={live ? 'Working now' : 'Not active'} />
                                </span>
                                <span className="flex-1 min-w-0">
                                    <span className="block font-semibold text-gray-900 dark:text-white truncate">{s.name}</span>
                                    <span className="block text-sm text-gray-600 dark:text-gray-400 truncate">
                                        {last ? `Last finished: ${lessonTitle.get(last) ?? last}` : 'No lessons finished yet'}
                                        {sub ? ` · Handed in ${assignmentTitle(assignments.find(a => a.id === sub.assignmentId) ?? ({} as Assignment))}` : ''}
                                    </span>
                                </span>
                                <span className={`text-sm whitespace-nowrap ${live ? 'font-semibold text-green-700 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>{live ? 'Active now' : timeAgo(s.lastActive, now)}</span>
                            </li>
                        );
                    })}
                </ul>
            </Card>

            <Card padded={false} className="overflow-hidden">
                <h2 className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 text-lg font-bold text-gray-900 dark:text-white">Recently handed in</h2>
                {feed.length === 0 ? (
                    <p className="px-5 py-5 text-gray-600 dark:text-gray-400">Nothing handed in yet.</p>
                ) : (
                    <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                        {feed.map(s => {
                            const a = assignments.find(x => x.id === s.assignmentId)!;
                            return (
                                <li key={s.id}>
                                    <Link to={`${base}/assignments/${a.id}?student=${s.studentId}`} className="no-hover block px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/40">
                                        <span className="block font-semibold text-gray-900 dark:text-white truncate">{s.studentName}</span>
                                        <span className="block text-sm text-gray-600 dark:text-gray-400 truncate">{assignmentTitle(a)} · {timeAgo(s.submittedAt, now)}{s.status === 'graded' ? ' · Graded' : ''}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </Card>
        </div>
    );
};

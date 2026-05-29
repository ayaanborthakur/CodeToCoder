import React, { useMemo, useState } from 'react';
import {
    Megaphone,
    ClipboardList,
    Calendar,
    Trash2,
    Loader2,
    ExternalLink,
} from 'lucide-react';
import type { Post, Assignment } from '../types';

interface StreamViewProps {
    posts: Post[];
    assignments: Assignment[];
    /** When true, render the post composer at the top. */
    canPost: boolean;
    /** Called when the teacher submits a new post. Returns when persisted. */
    onCreatePost?: (content: string) => Promise<void>;
    /** Teacher-only — delete a post. */
    onDeletePost?: (post: Post) => Promise<void>;
    /** Teacher-only — delete an assignment. */
    onDeleteAssignment?: (assignment: Assignment) => Promise<void>;
    /** Called when a student clicks "Open" on an assignment lesson. */
    onOpenLesson?: (moduleId: string, lessonId: string) => void;
}

type StreamItem =
    | { kind: 'post'; createdAt: number; post: Post }
    | { kind: 'assignment'; createdAt: number; assignment: Assignment };

const relativeTime = (ts: number): string => {
    const diff = Date.now() - ts;
    const m = Math.floor(diff / 60_000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d < 7) return `${d}d ago`;
    return new Date(ts).toLocaleDateString();
};

const formatDue = (dueAt: number | null): string => {
    if (dueAt === null) return 'No due date';
    const diff = dueAt - Date.now();
    const day = 24 * 60 * 60 * 1000;
    if (diff < 0) return 'Overdue';
    if (diff < day) return 'Due today';
    if (diff < 3 * day) return `Due in ${Math.ceil(diff / day)} days`;
    return `Due ${new Date(dueAt).toLocaleDateString()}`;
};

export const StreamView: React.FC<StreamViewProps> = ({
    posts,
    assignments,
    canPost,
    onCreatePost,
    onDeletePost,
    onDeleteAssignment,
    onOpenLesson,
}) => {
    const [draft, setDraft] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const items = useMemo<StreamItem[]>(() => {
        const merged: StreamItem[] = [
            ...posts.map(p => ({ kind: 'post' as const, createdAt: p.createdAt, post: p })),
            ...assignments.map(a => ({ kind: 'assignment' as const, createdAt: a.assignedAt, assignment: a })),
        ];
        return merged.sort((a, b) => b.createdAt - a.createdAt);
    }, [posts, assignments]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!onCreatePost || !draft.trim()) return;
        setSubmitting(true);
        setError(null);
        try {
            await onCreatePost(draft.trim());
            setDraft('');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to post.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-4">
            {canPost && (
                <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-2">
                        Announce to class
                    </label>
                    <textarea
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder="Share an update with your class…"
                        rows={3}
                        className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-sm text-gray-900 dark:text-white resize-y"
                    />
                    {error && (
                        <div className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</div>
                    )}
                    <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400">
                            Posts appear in every student's stream.
                        </span>
                        <button
                            type="submit"
                            disabled={submitting || !draft.trim()}
                            className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Post'}
                        </button>
                    </div>
                </form>
            )}

            {items.length === 0 ? (
                <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-5 py-10 text-center">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {canPost ? 'Nothing in the stream yet.' : 'Your teacher hasn\'t posted anything yet.'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {canPost
                            ? 'Post an announcement or assign a lesson — it will appear here.'
                            : 'Check back later for announcements and assignments.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {items.map(item => (
                        item.kind === 'post' ? (
                            <PostCard
                                key={`p-${item.post.id}`}
                                post={item.post}
                                canDelete={canPost}
                                onDelete={onDeletePost}
                            />
                        ) : (
                            <AssignmentCard
                                key={`a-${item.assignment.id}`}
                                assignment={item.assignment}
                                canDelete={canPost}
                                onDelete={onDeleteAssignment}
                                onOpen={onOpenLesson}
                            />
                        )
                    ))}
                </div>
            )}
        </div>
    );
};

const PostCard: React.FC<{
    post: Post;
    canDelete: boolean;
    onDelete?: (p: Post) => Promise<void>;
}> = ({ post, canDelete, onDelete }) => (
    <article className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-cyan-500 to-blue-600" />
        <div className="p-4">
            <header className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center flex-shrink-0">
                        <Megaphone className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">{post.teacherName}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{relativeTime(post.createdAt)}</div>
                    </div>
                </div>
                {canDelete && onDelete && (
                    <button
                        onClick={() => onDelete(post)}
                        className="p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Delete post"
                        aria-label="Delete post"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            </header>
            <div className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{post.content}</div>
        </div>
    </article>
);

const AssignmentCard: React.FC<{
    assignment: Assignment;
    canDelete: boolean;
    onDelete?: (a: Assignment) => Promise<void>;
    onOpen?: (moduleId: string, lessonId: string) => void;
}> = ({ assignment, canDelete, onDelete, onOpen }) => (
    <article className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-600" />
        <div className="p-4">
            <header className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                        <ClipboardList className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="min-w-0">
                        <div className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide">Assignment</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{relativeTime(assignment.assignedAt)}</div>
                    </div>
                </div>
                {canDelete && onDelete && (
                    <button
                        onClick={() => onDelete(assignment)}
                        className="p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Delete assignment"
                        aria-label="Delete assignment"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            </header>
            <div className="font-semibold text-sm text-gray-900 dark:text-white">{assignment.lessonTitle}</div>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                <span>{assignment.courseTitle}</span>
                <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDue(assignment.dueAt)}
                </span>
                <span>
                    {assignment.studentIds === null ? 'Whole class' : `${assignment.studentIds.length} student${assignment.studentIds.length === 1 ? '' : 's'}`}
                </span>
            </div>
            {onOpen && (
                <button
                    onClick={() => onOpen(assignment.moduleId, assignment.lessonId)}
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-md"
                >
                    Open lesson
                    <ExternalLink className="w-3 h-3" />
                </button>
            )}
        </div>
    </article>
);

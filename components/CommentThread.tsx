import React, { useEffect, useState } from 'react';
import { MessageSquare, Loader2, Send, Trash2 } from 'lucide-react';
import type { Comment } from '../types';
import { createComment, listComments, deleteComment } from '../services/commentsService';
import { useAuth } from '../contexts/AuthContext';

interface CommentThreadProps {
    classroomId: string;
    parentKind: 'post' | 'assignment';
    parentId: string;
    /** Whether the current viewer is the classroom teacher (can delete any comment). */
    isClassTeacher: boolean;
}

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

export const CommentThread: React.FC<CommentThreadProps> = ({
    classroomId,
    parentKind,
    parentId,
    isClassTeacher,
}) => {
    const { user } = useAuth();
    const [comments, setComments] = useState<Comment[] | null>(null);
    const [expanded, setExpanded] = useState(false);
    const [draft, setDraft] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!expanded || comments !== null) return;
        let cancelled = false;
        listComments(classroomId, parentKind, parentId)
            .then(list => { if (!cancelled) setComments(list); })
            .catch(e => { if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load comments.'); });
        return () => { cancelled = true; };
    }, [expanded, comments, classroomId, parentKind, parentId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !draft.trim()) return;
        setSubmitting(true);
        setError(null);
        try {
            const created = await createComment({
                classroomId,
                parentKind,
                parentId,
                authorId: user.id,
                authorName: user.name,
                authorRole: user.role === 'teacher' ? 'teacher' : 'student',
                content: draft,
            });
            setComments(prev => [...(prev ?? []), created]);
            setDraft('');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to post comment.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (c: Comment) => {
        try {
            await deleteComment(classroomId, parentKind, parentId, c.id);
            setComments(prev => (prev ?? []).filter(x => x.id !== c.id));
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to delete comment.');
        }
    };

    // Always show the count + composer toggle. Lazy-load the list when opened.
    const count = comments?.length;

    return (
        <div className="mt-3 border-t border-gray-100 dark:border-gray-700 pt-3">
            <button
                onClick={() => setExpanded(e => !e)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
                <MessageSquare className="w-3.5 h-3.5" />
                {count !== undefined
                    ? (count === 0 ? 'Add a comment' : `${count} comment${count === 1 ? '' : 's'}`)
                    : 'Comments'}
            </button>

            {expanded && (
                <div className="mt-3 space-y-3">
                    {comments === null && !error && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <Loader2 className="w-3 h-3 animate-spin" /> Loading comments…
                        </div>
                    )}

                    {comments && comments.length > 0 && (
                        <ul className="space-y-2">
                            {comments.map(c => {
                                const canDelete = !!user && (c.authorId === user.id || isClassTeacher);
                                return (
                                    <li key={c.id} className="flex items-start gap-2 group">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${
                                            c.authorRole === 'teacher' ? 'bg-cyan-500' : 'bg-purple-500'
                                        }`}>
                                            {c.authorName.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0 flex-1 bg-gray-50 dark:bg-gray-800/70 rounded-lg px-3 py-1.5">
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-xs font-semibold text-gray-900 dark:text-white truncate">{c.authorName}</span>
                                                {c.authorRole === 'teacher' && (
                                                    <span className="text-[9px] font-bold text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/30 px-1 py-0.5 rounded uppercase tracking-[0.05em]">Teacher</span>
                                                )}
                                                <span className="text-[10px] text-gray-400">{relativeTime(c.createdAt)}</span>
                                            </div>
                                            <div className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap mt-0.5">{c.content}</div>
                                        </div>
                                        {canDelete && (
                                            <button
                                                onClick={() => handleDelete(c)}
                                                className="p-1 rounded text-gray-300 dark:text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Delete comment"
                                                aria-label="Delete comment"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    )}

                    {error && <div className="text-xs text-red-600 dark:text-red-400">{error}</div>}

                    {user && (
                        <form onSubmit={handleSubmit} className="flex items-start gap-2">
                            <input
                                type="text"
                                value={draft}
                                onChange={(e) => setDraft(e.target.value)}
                                placeholder="Write a comment…"
                                className="flex-1 px-3 py-1.5 rounded-md bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            />
                            <button
                                type="submit"
                                disabled={submitting || !draft.trim()}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-md disabled:opacity-50"
                            >
                                {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                                Post
                            </button>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
};

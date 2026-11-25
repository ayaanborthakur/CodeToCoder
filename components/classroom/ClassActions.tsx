import React, { useEffect, useRef, useState } from 'react';
import { Archive, ArchiveRestore, MoreVertical, Trash2 } from 'lucide-react';
import type { Classroom } from '../../types';
import { deleteClassroomAndCascade, updateClassroomSettings } from '../../services/classroomService';
import { Button, inputClass } from '../ui';

/**
 * A "⋮" menu to archive, restore or delete a class, for the class list and
 * the class header. Deleting asks for the class name, since it can't be undone.
 */
export const ClassActions: React.FC<{
    classroom: Classroom;
    teacherId: string;
    onChanged: (patch: Partial<Classroom>) => void;
    onDeleted: () => void;
    /** Show "Archive" / "Delete" as labelled buttons instead of a menu. */
    inline?: boolean;
}> = ({ classroom, teacherId, onChanged, onDeleted, inline = false }) => {
    const [open, setOpen] = useState(false);
    // Fixed position so the menu isn't clipped by a scrolling or rounded parent.
    const [pos, setPos] = useState<{ top: number; right: number } | null>(null);
    const [confirming, setConfirming] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const close = (e: MouseEvent) => { if (!menuRef.current?.contains(e.target as Node)) setOpen(false); };
        const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
        const hide = () => setOpen(false);
        document.addEventListener('mousedown', close);
        document.addEventListener('keydown', esc);
        window.addEventListener('resize', hide);
        window.addEventListener('scroll', hide, true);
        return () => {
            document.removeEventListener('mousedown', close);
            document.removeEventListener('keydown', esc);
            window.removeEventListener('resize', hide);
            window.removeEventListener('scroll', hide, true);
        };
    }, [open]);

    const toggleArchive = async () => {
        setOpen(false);
        const next = !classroom.archived;
        const patch = { archived: next, archivedAt: next ? Date.now() : undefined };
        onChanged(patch);
        try {
            await updateClassroomSettings(classroom.classId, patch);
        } catch (e: unknown) {
            onChanged({ archived: !next, archivedAt: classroom.archivedAt });
            window.alert(e instanceof Error ? e.message : 'Could not update the class.');
        }
    };

    const archiveLabel = classroom.archived ? 'Restore class' : 'Archive class';
    const ArchiveIcon = classroom.archived ? ArchiveRestore : Archive;

    return (
        <>
            {inline ? (
                <div className="flex flex-wrap gap-2">
                    <Button icon={<ArchiveIcon className="w-4 h-4" />} onClick={toggleArchive}>{archiveLabel}</Button>
                    <Button variant="danger" icon={<Trash2 className="w-4 h-4" />} onClick={() => setConfirming(true)}>Delete class</Button>
                </div>
            ) : (
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const r = e.currentTarget.getBoundingClientRect();
                            setPos({ top: r.bottom + 4, right: window.innerWidth - r.right });
                            setOpen(o => !o);
                        }}
                        className="no-hover w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-white"
                        aria-label={`Options for ${classroom.className}`}
                        aria-haspopup="menu"
                        aria-expanded={open}
                    >
                        <MoreVertical className="w-5 h-5" />
                    </button>
                    {open && pos && (
                        <div role="menu" style={{ top: pos.top, right: pos.right }} className="fixed z-50 w-48 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg py-1">
                            <button role="menuitem" onClick={toggleArchive} className="no-hover w-full flex items-center gap-2 px-4 py-2 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                                <ArchiveIcon className="w-4 h-4" />{archiveLabel}
                            </button>
                            <button role="menuitem" onClick={() => { setOpen(false); setConfirming(true); }} className="no-hover w-full flex items-center gap-2 px-4 py-2 text-left text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                                <Trash2 className="w-4 h-4" />Delete class
                            </button>
                        </div>
                    )}
                </div>
            )}

            {confirming && (
                <DeleteClassDialog
                    classroom={classroom}
                    busy={busy}
                    error={error}
                    onCancel={() => { setConfirming(false); setError(null); }}
                    onConfirm={async () => {
                        setBusy(true);
                        setError(null);
                        try {
                            await deleteClassroomAndCascade(classroom.classId, teacherId);
                            setConfirming(false);
                            onDeleted();
                        } catch (e: unknown) {
                            setError(e instanceof Error ? e.message : 'Could not delete the class.');
                        } finally {
                            setBusy(false);
                        }
                    }}
                />
            )}
        </>
    );
};

const DeleteClassDialog: React.FC<{
    classroom: Classroom;
    busy: boolean;
    error: string | null;
    onCancel: () => void;
    onConfirm: () => void;
}> = ({ classroom, busy, error, onCancel, onConfirm }) => {
    const [typed, setTyped] = useState('');
    const count = classroom.studentIds?.length ?? 0;
    const matches = typed.trim() === classroom.className.trim();
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) onCancel(); }}>
            <div role="dialog" aria-modal="true" aria-labelledby="delete-class-title" className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl">
                <h2 id="delete-class-title" className="text-xl font-bold text-gray-900 dark:text-white">Delete {classroom.className}?</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    This permanently deletes the class with its assignments, grades and announcements, and removes {count} {count === 1 ? 'student' : 'students'} from it. Students keep their own lesson progress. This can't be undone.
                </p>
                {!classroom.archived && <p className="mt-2 text-gray-600 dark:text-gray-400">To keep the grades, archive the class instead.</p>}
                <label htmlFor="delete-class-name" className="block mt-4 mb-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300">Type <span className="font-mono">{classroom.className}</span> to confirm</label>
                <input id="delete-class-name" className={inputClass} value={typed} onChange={e => setTyped(e.target.value)} autoFocus autoComplete="off" />
                {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>}
                <div className="mt-5 flex justify-end gap-2">
                    <Button variant="ghost" onClick={onCancel} disabled={busy}>Cancel</Button>
                    <Button variant="danger" icon={<Trash2 className="w-4 h-4" />} onClick={onConfirm} disabled={!matches} loading={busy}>Delete forever</Button>
                </div>
            </div>
        </div>
    );
};

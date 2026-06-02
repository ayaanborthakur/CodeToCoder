import React, { useState } from 'react';
import {
    X,
    Loader2,
    AlertCircle,
    RefreshCw,
    Archive,
    ArchiveRestore,
    Trash2,
    CheckCheck,
    Copy,
} from 'lucide-react';
import {
    updateClassroomSettings,
    regenerateJoinCode,
    deleteClassroomAndCascade,
} from '../services/classroomService';
import type { Classroom } from '../types';

interface ClassroomSettingsModalProps {
    classroom: Classroom;
    teacherId: string;
    onClose: () => void;
    /** Called after a non-destructive change so the parent can refresh. */
    onUpdated: (patch: Partial<Classroom>) => void;
    /** Called after archive flag flips. */
    onArchived?: (archived: boolean) => void;
    /** Called after a successful delete. The modal closes itself first. */
    onDeleted?: () => void;
}

export const ClassroomSettingsModal: React.FC<ClassroomSettingsModalProps> = ({
    classroom,
    teacherId,
    onClose,
    onUpdated,
    onArchived,
    onDeleted,
}) => {
    const [name, setName] = useState(classroom.className);
    const [description, setDescription] = useState(classroom.description ?? '');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [regenerating, setRegenerating] = useState(false);
    const [confirmRegen, setConfirmRegen] = useState(false);

    const [archiving, setArchiving] = useState(false);

    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleteText, setDeleteText] = useState('');
    const [deleting, setDeleting] = useState(false);

    const [codeCopied, setCodeCopied] = useState(false);

    const nameDirty = name.trim() !== classroom.className && name.trim().length > 0;
    const descriptionDirty = (description.trim() || '') !== (classroom.description ?? '');
    const dirty = nameDirty || descriptionDirty;
    const isArchived = !!classroom.archived;

    const handleSave = async () => {
        setError(null);
        setSaving(true);
        try {
            const patch: Partial<Classroom> = {};
            if (nameDirty) patch.className = name.trim();
            if (descriptionDirty) patch.description = description.trim();
            await updateClassroomSettings(classroom.classId, patch);
            onUpdated(patch);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Failed to save settings.');
        } finally {
            setSaving(false);
        }
    };

    const handleRegenerate = async () => {
        setError(null);
        setRegenerating(true);
        try {
            const next = await regenerateJoinCode(classroom.classId);
            onUpdated({ joinCode: next });
            setConfirmRegen(false);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Failed to regenerate join code.');
        } finally {
            setRegenerating(false);
        }
    };

    const handleToggleArchive = async () => {
        setError(null);
        setArchiving(true);
        try {
            const next = !isArchived;
            await updateClassroomSettings(classroom.classId, {
                archived: next,
                archivedAt: next ? Date.now() : undefined,
            });
            onUpdated({ archived: next, archivedAt: next ? Date.now() : undefined });
            onArchived?.(next);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Failed to update archive state.');
        } finally {
            setArchiving(false);
        }
    };

    const handleDelete = async () => {
        if (deleteText.trim() !== classroom.className) {
            setError(`Type the class name exactly to confirm: "${classroom.className}"`);
            return;
        }
        setError(null);
        setDeleting(true);
        try {
            await deleteClassroomAndCascade(classroom.classId, teacherId);
            onDeleted?.();
            onClose();
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Failed to delete classroom.');
            setDeleting(false);
        }
    };

    const copyJoinCode = () => {
        navigator.clipboard.writeText(classroom.joinCode).catch(() => {});
        setCodeCopied(true);
        setTimeout(() => setCodeCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-lg border border-gray-200 dark:border-gray-800 shadow-xl flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
                    <div>
                        <h2 className="font-semibold text-sm text-gray-900 dark:text-white">Classroom settings</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{classroom.className}</p>
                    </div>
                    <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Close">
                        <X className="w-4 h-4 text-gray-500" />
                    </button>
                </div>

                <div className="overflow-y-auto p-5 space-y-6">
                    {/* ─── Name + description ──────────────────────────────── */}
                    <section className="space-y-3">
                        <SectionHeader>Details</SectionHeader>
                        <div>
                            <label htmlFor="cls-name" className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-[0.08em] block mb-1.5">Name</label>
                            <input
                                id="cls-name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                maxLength={60}
                                className="w-full px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="cls-desc" className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-[0.08em] block mb-1.5">Description (optional)</label>
                            <textarea
                                id="cls-desc"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                maxLength={200}
                                rows={2}
                                placeholder="Grade level, subject, schedule..."
                                className="w-full px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                            />
                            <div className="text-[10px] text-gray-400 mt-0.5 text-right">{description.length} / 200</div>
                        </div>
                    </section>

                    {/* ─── Join code ───────────────────────────────────────── */}
                    <section className="space-y-2">
                        <SectionHeader right={
                            <button
                                onClick={copyJoinCode}
                                className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 inline-flex items-center gap-1"
                            >
                                {codeCopied ? <CheckCheck className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                                {codeCopied ? 'Copied' : 'Copy'}
                            </button>
                        }>Join code</SectionHeader>
                        <div className="flex items-center justify-between gap-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-3 py-2">
                            <span className="font-mono font-bold text-base text-gray-900 dark:text-white tracking-[0.25em]">{classroom.joinCode}</span>
                            {!confirmRegen ? (
                                <button
                                    onClick={() => setConfirmRegen(true)}
                                    className="text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400 inline-flex items-center gap-1"
                                >
                                    <RefreshCw className="w-3 h-3" />
                                    Regenerate
                                </button>
                            ) : (
                                <div className="flex items-center gap-1.5">
                                    <button
                                        onClick={() => setConfirmRegen(false)}
                                        className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleRegenerate}
                                        disabled={regenerating}
                                        className="text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 disabled:opacity-50 px-2 py-1 rounded-md inline-flex items-center gap-1"
                                    >
                                        {regenerating && <Loader2 className="w-3 h-3 animate-spin" />}
                                        Replace
                                    </button>
                                </div>
                            )}
                        </div>
                        {confirmRegen && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Anyone with the old code won't be able to join anymore. Existing students stay in the class.
                            </p>
                        )}
                    </section>

                    {/* ─── Archive ─────────────────────────────────────────── */}
                    <section className="space-y-2">
                        <SectionHeader>Archive</SectionHeader>
                        <div className="flex items-start justify-between gap-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-3 py-2.5">
                            <div className="min-w-0">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {isArchived ? 'Class is archived' : 'Class is active'}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    {isArchived
                                        ? 'Hidden from your switcher. Data is preserved; you can unarchive anytime.'
                                        : 'Archive a class when the term ends. It hides from your switcher without deleting anything.'}
                                </div>
                            </div>
                            <button
                                onClick={handleToggleArchive}
                                disabled={archiving}
                                className={`text-xs font-bold px-3 py-1.5 rounded-md inline-flex items-center gap-1.5 flex-shrink-0 ${
                                    isArchived
                                        ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                                        : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                                }`}
                            >
                                {archiving
                                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    : isArchived
                                        ? <><ArchiveRestore className="w-3.5 h-3.5" /> Unarchive</>
                                        : <><Archive className="w-3.5 h-3.5" /> Archive</>}
                            </button>
                        </div>
                    </section>

                    {/* ─── Delete (danger) ─────────────────────────────────── */}
                    <section className="space-y-2">
                        <SectionHeader>Danger zone</SectionHeader>
                        {!confirmDelete ? (
                            <button
                                onClick={() => setConfirmDelete(true)}
                                className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-md border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                                <div className="text-left">
                                    <div className="text-sm font-semibold">Delete this classroom</div>
                                    <div className="text-xs text-red-500/80 dark:text-red-400/70">Removes the class, all posts, and all assignments. Cannot be undone.</div>
                                </div>
                                <Trash2 className="w-4 h-4 flex-shrink-0" />
                            </button>
                        ) : (
                            <div className="space-y-2 px-3 py-3 rounded-md border border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-900/10">
                                <p className="text-sm text-red-700 dark:text-red-300 font-semibold">
                                    Type <span className="font-mono">{classroom.className}</span> to confirm.
                                </p>
                                <input
                                    type="text"
                                    value={deleteText}
                                    onChange={(e) => setDeleteText(e.target.value)}
                                    placeholder={classroom.className}
                                    className="w-full px-3 py-1.5 text-sm rounded-md bg-white dark:bg-gray-900 border border-red-300 dark:border-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 dark:text-white"
                                />
                                <div className="flex items-center justify-end gap-2 pt-1">
                                    <button
                                        onClick={() => { setConfirmDelete(false); setDeleteText(''); }}
                                        disabled={deleting}
                                        className="px-3 py-1 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        disabled={deleting || deleteText.trim() !== classroom.className}
                                        className="px-3 py-1 text-xs font-bold text-white bg-red-600 hover:bg-red-500 disabled:opacity-50 rounded-md inline-flex items-center gap-1"
                                    >
                                        {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                                        Delete permanently
                                    </button>
                                </div>
                            </div>
                        )}
                    </section>

                    {error && (
                        <div className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
                        </div>
                    )}
                </div>

                {/* Sticky footer with the primary save action */}
                <div className="flex items-center justify-between gap-2 px-5 py-3 border-t border-gray-100 dark:border-gray-800 flex-shrink-0 bg-gray-50/60 dark:bg-gray-900/60">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        {dirty ? 'Unsaved changes' : 'All changes saved'}
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onClose}
                            disabled={saving || deleting}
                            className="px-3 py-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md disabled:opacity-50"
                        >
                            Close
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!dirty || saving}
                            className="px-4 py-1.5 text-sm font-bold text-white bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 rounded-md inline-flex items-center gap-1.5"
                        >
                            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            Save changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SectionHeader: React.FC<{ children: React.ReactNode; right?: React.ReactNode }> = ({ children, right }) => (
    <div className="flex items-center justify-between mb-0.5">
        <h3 className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-[0.08em]">{children}</h3>
        {right}
    </div>
);

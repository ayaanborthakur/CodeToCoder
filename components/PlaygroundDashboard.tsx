import React, { useState } from 'react';
import type { PlaygroundFile } from '../types';
import { toPng } from 'html-to-image';
import { ConfirmationModal } from './ConfirmationModal';
import { RenameModal } from './RenameModal';

interface PlaygroundDashboardProps {
    files: PlaygroundFile[];
    onNewFile: (name: string) => void;
    onOpenFile: (fileId: string) => void;
    onDeleteFile: (fileId: string) => void;
    onRenameFile: (fileId: string, newName: string) => void;
    onImportFile: () => void;
    lastActiveFile?: PlaygroundFile | null;
    onResume?: (fileId: string) => void;
}

import DocumentIcon from '../assets/icons/DocumentIcon.svg?react';
import PencilIcon from '../assets/icons/PencilIcon.svg?react';
import TrashIcon from '../assets/icons/TrashIcon.svg?react';
import ImportIcon from '../assets/icons/ImportIcon.svg?react';
import PlusIcon from '../assets/icons/PlusIcon.svg?react';
import PlayIcon from '../assets/icons/PlayIcon.svg?react';
import ShareIcon from '../assets/icons/ShareIcon.svg?react';

const timeAgo = (timestamp: number) => {
    const now = Date.now();
    const seconds = Math.floor((now - timestamp) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return "just now";
};

export const PlaygroundDashboard: React.FC<PlaygroundDashboardProps> = ({
    files,
    onNewFile,
    onOpenFile,
    onDeleteFile,
    onRenameFile,
    onImportFile,
    lastActiveFile,
    onResume
}) => {
    const [fileToDelete, setFileToDelete] = useState<PlaygroundFile | null>(null);
    const [fileToRename, setFileToRename] = useState<PlaygroundFile | null>(null);
    const [isNewFileModalOpen, setIsNewFileModalOpen] = useState(false);
    const [isSharing, setIsSharing] = useState<string | null>(null);

    const shareRef = React.useRef<HTMLDivElement>(null);
    const [shareData, setShareData] = useState<{ name: string; content: string } | null>(null);

    const handleShare = async (file: PlaygroundFile) => {
        setIsSharing(file.id);
        setShareData({ name: file.name, content: file.content || "# No content" });
        
        // Wait longer for render to ensure fonts/layout are stable
        await new Promise(resolve => setTimeout(resolve, 500));

        if (!shareRef.current) {
            console.error("Share ref not found after wait");
            setIsSharing(null);
            return;
        }

        try {
            // optimized options to prevent hanging and CORS errors
            const dataUrl = await toPng(shareRef.current, { 
                cacheBust: true, 
                backgroundColor: '#0f172a',
                fontEmbedCSS: '',
                pixelRatio: 1, 
                skipAutoScale: true
            });

            const blob = await (await fetch(dataUrl)).blob();
            const imageFile = new File([blob], `${file.name}.png`, { type: 'image/png' });

            if (navigator.share) {
                await navigator.share({
                    title: `CodeToCoder: ${file.name}`,
                    text: `Check out my python code "${file.name}" on CodeToCoder! 🐍`,
                    files: [imageFile],
                });
            } else {
                // Fallback to download
                const link = document.createElement('a');
                link.download = `${file.name}.png`;
                link.href = dataUrl;
                link.click();
            }
        } catch (error) {
            // Ignore errors (like user cancelling share) to prevent annoying popups
            console.error("Failed to generate share image:", error);
        } finally {
            setIsSharing(null);
            setShareData(null);
        }
    };

    const handleCreateNew = () => {
        setIsNewFileModalOpen(true);
    };

    const handleNewFileConfirm = (name: string) => {
        let fileName = name.trim();
        if (!fileName) fileName = "Untitled.py";

        // Auto-append extension if missing
        if (!fileName.endsWith('.py') && !fileName.endsWith('.txt')) {
            fileName += '.py';
        }

        onNewFile(fileName);
        setIsNewFileModalOpen(false);
    };

    const handleConfirmDelete = () => {
        if (fileToDelete) {
            onDeleteFile(fileToDelete.id);
            setFileToDelete(null);
        }
    };

    const handleConfirmRename = (newName: string) => {
        if (fileToRename) {
            onRenameFile(fileToRename.id, newName);
            setFileToRename(null);
        }
    };


    return (
        <div className="h-full w-full bg-gray-50 dark:bg-gray-900 flex flex-col p-6 animate-fade-in overflow-y-auto">
            {fileToDelete && (
                <ConfirmationModal
                    isOpen={!!fileToDelete}
                    onClose={() => setFileToDelete(null)}
                    onConfirm={handleConfirmDelete}
                    title="Delete File?"
                    message={`Are you sure you want to permanently delete "${fileToDelete.name}"? This action cannot be undone.`}
                />
            )}
            {fileToRename && (
                <RenameModal
                    isOpen={!!fileToRename}
                    onClose={() => setFileToRename(null)}
                    onConfirm={handleConfirmRename}
                    currentName={fileToRename.name}
                />
            )}
            {isNewFileModalOpen && (
                <RenameModal
                    isOpen={isNewFileModalOpen}
                    onClose={() => setIsNewFileModalOpen(false)}
                    onConfirm={handleNewFileConfirm}
                    currentName=""
                    title="Create New File"
                />
            )}

            <div className="max-w-6xl w-full mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white animate-slide-up" style={{ animationDelay: '0ms' }}>Playground</h1>
                    <p className="text-md text-gray-500 dark:text-gray-400 mt-1 animate-slide-up" style={{ animationDelay: '50ms' }}>Your personal space to code and create.</p>
                </div>

                {/* Main Action Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up opacity-0" style={{ animationDelay: '100ms' }}>
                    {/* Resume Card */}
                    {lastActiveFile && onResume && (
                        <button
                            onClick={() => onResume(lastActiveFile.id)}
                            className="bg-gradient-to-br from-cyan-600 to-blue-600 text-white rounded-xl p-6 shadow-lg shadow-cyan-500/20 hover:shadow-xl hover:scale-[1.02] transition-all text-left flex flex-col justify-between min-h-[160px]"
                        >
                            <div className="bg-white/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                                <PlayIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-1">Resume Session</h3>
                                <p className="text-cyan-100 text-sm truncate">Continue editing {lastActiveFile.name}</p>
                            </div>
                        </button>
                    )}

                    {/* New File Card */}
                    <button
                        onClick={handleCreateNew}
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm hover:shadow-md hover:border-cyan-500 hover:scale-[1.02] transition-all text-left flex flex-col justify-between min-h-[160px] group"
                    >
                        <div className="bg-cyan-100 dark:bg-cyan-900/30 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-cyan-600 dark:text-cyan-400 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                            <PlusIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">New File</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Start a fresh Python script</p>
                        </div>
                    </button>

                    {/* Import File Card */}
                    <button
                        onClick={onImportFile}
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm hover:shadow-md hover:border-cyan-500 hover:scale-[1.02] transition-all text-left flex flex-col justify-between min-h-[160px] group"
                    >
                        <div className="bg-purple-100 dark:bg-purple-900/30 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                            <ImportIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Open File</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Upload .py or .txt file</p>
                        </div>
                    </button>
                </div>

                {/* Recent Files List */}
                <div className="animate-slide-up opacity-0" style={{ animationDelay: '200ms' }}>
                    <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">Your Files</h2>
                    {files.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {[...files].sort((a, b) => b.lastModified - a.lastModified).map((file, idx) => (
                                <div 
                                    key={file.id} 
                                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 transition-all shadow-sm hover:shadow-md hover:border-cyan-500/50 dark:hover:border-cyan-500/50 flex flex-col group animate-slide-up opacity-0" 
                                    style={{ animationDelay: `${200 + (idx * 50)}ms` }}
                                >
                                    <div className="flex-grow p-4 flex flex-col h-full relative">
                                        <div className="flex justify-between items-start mb-2">
                                            <div 
                                                onClick={() => onOpenFile(file.id)} 
                                                className="cursor-pointer hover:scale-110 transition-transform"
                                            >
                                                <DocumentIcon className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
                                            </div>
                                            
                                            {/* Actions always visible */}
                                            <div className="flex gap-1 z-20">
                                                <div
                                                    onClick={(e) => { e.stopPropagation(); setFileToRename(file); }}
                                                    className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white cursor-pointer hover:scale-110 transition-transform"
                                                    title="Rename File"
                                                >
                                                    <PencilIcon className="w-4 h-4" />
                                                </div>
                                                <div
                                                    onClick={(e) => { e.stopPropagation(); setFileToDelete(file); }}
                                                    className="p-1.5 rounded-md text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 cursor-pointer hover:scale-110 transition-transform"
                                                    title="Delete File"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </div>
                                                <div
                                                    onClick={(e) => { e.stopPropagation(); handleShare(file); }}
                                                    className="p-1.5 rounded-md text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-500 cursor-pointer hover:scale-110 transition-transform"
                                                    title="Share on Twitter"
                                                >
                                                    {isSharing === file.id ? (
                                                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <ShareIcon className="w-4 h-4" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div 
                                            onClick={() => onOpenFile(file.id)}
                                            className="cursor-pointer flex-grow"
                                        >
                                            <h3 className="font-bold text-gray-800 dark:text-gray-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors truncate">{file.name}</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                Edited {timeAgo(file.lastModified)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-800/50">
                            <p className="text-gray-500 dark:text-gray-400">No files yet. Create one to get started!</p>
                        </div>
                    )}
                </div>
            </div>

             {/* Hidden Share Container - Rendered Offscreen */}
            {shareData && (
                <div 
                    ref={shareRef} 
                    className="fixed top-0 left-0 w-[800px] p-8 bg-slate-900 text-white font-mono rounded-lg z-[-10]"
                    style={{ opacity: 0, pointerEvents: 'none' }} 
                >
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-700">
                        <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center text-cyan-400">
                            <DocumentIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">{shareData.name}</h2>
                            <p className="text-slate-400 text-sm">Created with CodeToCoder</p>
                        </div>
                    </div>
                    <div className="bg-slate-950 p-6 rounded-lg border border-slate-800 shadow-2xl">
                        <pre className="text-sm leading-relaxed overflow-hidden whitespace-pre-wrap break-words text-slate-300">
                            {shareData.content}
                        </pre>
                    </div>
                    <div className="mt-6 flex justify-between items-center text-slate-500 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"/>
                            <div className="w-3 h-3 rounded-full bg-yellow-500"/>
                            <div className="w-3 h-3 rounded-full bg-green-500"/>
                        </div>
                        <span>codetocoder.com</span>
                    </div>
                </div>
            )}
        </div>
    );
};
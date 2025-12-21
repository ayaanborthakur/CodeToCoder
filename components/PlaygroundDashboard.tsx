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
    lastActiveFileId?: string | null;
    onResume?: (fileId: string) => void;
}

export const PlaygroundDashboard: React.FC<PlaygroundDashboardProps> = ({
    files,
    onNewFile,
    onOpenFile,
    onDeleteFile,
    onRenameFile,
    lastActiveFileId,
    onResume,
    onImportFile
}) => {
    // Local processing of files to handle renaming
    const [fileToRename, setFileToRename] = useState<PlaygroundFile | null>(null);
    const [newFileName, setNewFileName] = useState('');
    const [fileToDelete, setFileToDelete] = useState<PlaygroundFile | null>(null);
    const [isSharing, setIsSharing] = useState<string | null>(null);

    useEffect(() => {
        if (fileToRename) {
            setNewFileName(fileToRename.name);
        }
    }, [fileToRename]);

    const handleRename = useCallback(() => {
        if (fileToRename && newFileName.trim() !== '') {
            onRenameFile(fileToRename.id, newFileName.trim());
            setFileToRename(null);
            setNewFileName('');
        }
    }, [fileToRename, newFileName, onRenameFile]);

    const handleCreateNew = useCallback(() => {
        // Generate a simple default name
        const baseName = "Untitled";
        let name = `${baseName}.py`;
        let counter = 1;
        
        // Simple client-side check to avoid immediate duplicate names if possible
        // though the real check should happen in onNewFile or backend
        while (files.some(f => f.name === name)) {
            name = `${baseName} ${counter}.py`;
            counter++;
        }
        
        onNewFile(name);
    }, [onNewFile, files]);

    const lastActiveFile = useMemo(() =>
        files.find(f => f.id === lastActiveFileId),
        [files, lastActiveFileId]
    );

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

    return (
        <div className="h-full w-full bg-gray-50 dark:bg-gray-900 flex flex-col p-4 animate-fade-in overflow-y-auto">
            {fileToDelete && (
                <ConfirmationModal
                    isOpen={!!fileToDelete}
                    onClose={() => setFileToDelete(null)}
                    onConfirm={() => {
                        onDeleteFile(fileToDelete.id);
                        setFileToDelete(null);
                    }}
                    title="Delete File"
                    message={`Are you sure you want to delete "${fileToDelete.name}"? This cannot be undone.`}
                />
            )}

            {fileToRename && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-2xl animate-scale-in border border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Rename File</h3>
                        <input
                            type="text"
                            value={newFileName}
                            onChange={(e) => setNewFileName(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none mb-6"
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleRename();
                                }
                            }}
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setFileToRename(null)}
                                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRename}
                                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors font-semibold"
                            >
                                Rename
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-6xl w-full mx-auto space-y-5">
                {/* Header with stats */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Playground</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Your personal space to code and create</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-700">
                            <span className="text-sm font-bold text-purple-700 dark:text-purple-300">{files.length} files</span>
                        </div>
                    </div>
                </div>

                {/* Main Action Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Resume Card */}
                    {lastActiveFile && onResume && (
                        <button
                            onClick={() => onResume(lastActiveFile.id)}
                            className="bg-gradient-to-br from-cyan-600 to-blue-600 text-white rounded-lg p-4 shadow-lg hover:shadow-xl transition-all text-left flex flex-col justify-between min-h-[120px]"
                        >
                            <div className="bg-white/20 w-10 h-10 rounded-lg flex items-center justify-center mb-2">
                                <Play className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold mb-0.5">Resume Session</h3>
                                <p className="text-cyan-100 text-xs truncate">{lastActiveFile.name}</p>
                            </div>
                        </button>
                    )}

                    {/* New File Card */}
                    <button
                        onClick={handleCreateNew}
                        className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-cyan-500 transition-all text-left flex flex-col justify-between min-h-[120px] group"
                    >
                        <div className="bg-cyan-100 dark:bg-cyan-900/30 w-10 h-10 rounded-lg flex items-center justify-center mb-2 text-cyan-600 dark:text-cyan-400 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                            <Plus className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">New File</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-xs">Create Python script</p>
                        </div>
                    </button>

                    {/* Open File / Import Card */}
                    <button
                        onClick={onImportFile}
                        className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-purple-500 transition-all text-left flex flex-col justify-between min-h-[120px] group"
                    >
                        <div className="bg-purple-100 dark:bg-purple-900/30 w-10 h-10 rounded-lg flex items-center justify-center mb-2 text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                            <Upload className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Import</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-xs">Upload .py or .txt</p>
                        </div>
                    </button>

                    {/* Templates Card */}
                    <div className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border-2 border-orange-200 dark:border-orange-700 rounded-lg p-4 text-left flex flex-col justify-between min-h-[120px]">
                        <div className="bg-orange-100 dark:bg-orange-900/30 w-10 h-10 rounded-lg flex items-center justify-center mb-2 text-orange-600 dark:text-orange-400">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-gray-900 dark:text-white">Templates</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-xs">Coming soon...</p>
                        </div>
                    </div>
                </div>

                {/* Recent Files List */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">Your Files</h2>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Sorted by last edited</span>
                    </div>
                    {files.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                            {[...files].sort((a, b) => b.lastModified - a.lastModified).map((file, idx) => (
                                <div 
                                    key={file.id} 
                                    className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 transition-all hover:border-cyan-500/50 dark:hover:border-cyan-500/50 flex flex-col group animate-slide-up opacity-0" 
                                    style={{ animationDelay: `${100 + (idx * 30)}ms` }}
                                >
                                    <div className="flex-grow p-3 flex flex-col h-full relative">
                                        <div className="flex justify-between items-start mb-2">
                                            <div 
                                                onClick={() => onOpenFile(file.id)} 
                                                className="cursor-pointer hover:scale-105 transition-transform"
                                            >
                                                <FileText className="w-7 h-7 text-cyan-600 dark:text-cyan-400" />
                                            </div>
                                            
                                            {/* Actions */}
                                            <div className="flex gap-0.5 z-20">
                                                <div
                                                    onClick={(e) => { e.stopPropagation(); setFileToRename(file); }}
                                                    className="p-1 rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white cursor-pointer"
                                                    title="Rename"
                                                >
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </div>
                                                <div
                                                    onClick={(e) => { e.stopPropagation(); setFileToDelete(file); }}
                                                    className="p-1 rounded-md text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 cursor-pointer"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </div>
                                                <div
                                                    onClick={(e) => { e.stopPropagation(); handleShare(file); }}
                                                    className="p-1 rounded-md text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-500 cursor-pointer"
                                                    title="Share"
                                                >
                                                    {isSharing === file.id ? (
                                                        <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />
                                                    ) : (
                                                        <Share2 className="w-3.5 h-3.5" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div 
                                            onClick={() => onOpenFile(file.id)}
                                            className="cursor-pointer flex-grow"
                                        >
                                            <h3 className="font-bold text-sm text-gray-800 dark:text-gray-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors truncate">{file.name}</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {timeAgo(file.lastModified)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50/50 dark:bg-gray-800/50">
                            <p className="text-gray-500 dark:text-gray-400 text-sm">No files yet. Create one to get started!</p>
                        </div>
                    )}
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
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                                    {shareData.name}
                                </h1>
                                <p className="text-slate-400 text-sm flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    CodeToCoder Playground
                                </p>
                            </div>
                        </div>
                        
                        <div className="relative">
                            {/* Line numbers column */}
                            <div className="absolute left-0 top-0 bottom-0 w-8 text-slate-600 text-right pr-3 select-none text-sm font-mono leading-6">
                                {shareData.content.split('\n').map((_, i) => (
                                    <div key={i}>{i + 1}</div>
                                ))}
                            </div>
                            
                            {/* Code content */}
                            <pre className="pl-10 text-sm font-mono leading-6 text-slate-300 overflow-x-hidden whitespace-pre-wrap">
                                {shareData.content}
                            </pre>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-700 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="text-xs text-slate-500">Generated with</div>
                                <div className="text-sm font-bold text-cyan-400">CodeToCoder</div>
                            </div>
                            <div className="text-xs text-slate-600">code2coder.com</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
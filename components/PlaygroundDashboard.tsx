import React, { useState } from 'react';
import type { PlaygroundFile } from '../types';
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

const DocumentIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-cyan-600 dark:text-cyan-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
);

const PencilIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
    </svg>
);

const TrashIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
);

const ImportIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
    </svg>
);

const PlusIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
        <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
    </svg>
);

const PlayIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
    </svg>
);

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
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white animate-slide-up" style={{animationDelay: '0ms'}}>Playground</h1>
                    <p className="text-md text-gray-500 dark:text-gray-400 mt-1 animate-slide-up" style={{animationDelay: '50ms'}}>Your personal space to code and create.</p>
                </div>

                {/* Main Action Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up opacity-0" style={{animationDelay: '100ms'}}>
                    {/* Resume Card */}
                    {lastActiveFile && onResume && (
                        <button 
                            onClick={() => onResume(lastActiveFile.id)}
                            className="bg-gradient-to-br from-cyan-600 to-blue-600 text-white rounded-xl p-6 shadow-lg shadow-cyan-500/20 hover:shadow-xl hover:scale-[1.02] transition-all text-left flex flex-col justify-between min-h-[160px]"
                        >
                            <div className="bg-white/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                                <PlayIcon />
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
                            <PlusIcon />
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
                            <ImportIcon />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Open File</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Upload .py or .txt file</p>
                        </div>
                    </button>
                </div>
                
                {/* Recent Files List */}
                <div className="animate-slide-up opacity-0" style={{animationDelay: '200ms'}}>
                    <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">Your Files</h2>
                    {files.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {[...files].sort((a, b) => b.lastModified - a.lastModified).map((file, idx) => (
                                <div key={file.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 transition-all shadow-sm hover:shadow-md hover:border-cyan-500/50 dark:hover:border-cyan-500/50 flex flex-col group animate-slide-up opacity-0" style={{animationDelay: `${200 + (idx * 50)}ms`}}>
                                    <button onClick={() => onOpenFile(file.id)} className="flex-grow p-4 text-left">
                                        <div className="flex justify-between items-start mb-2">
                                            <DocumentIcon />
                                            {/* Actions visible on group hover */}
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div 
                                                    onClick={(e) => { e.stopPropagation(); setFileToRename(file); }}
                                                    className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white cursor-pointer hover:scale-110 transition-transform"
                                                >
                                                    <PencilIcon />
                                                </div>
                                                <div 
                                                    onClick={(e) => { e.stopPropagation(); setFileToDelete(file); }}
                                                    className="p-1.5 rounded-md text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 cursor-pointer hover:scale-110 transition-transform"
                                                >
                                                    <TrashIcon />
                                                </div>
                                            </div>
                                        </div>
                                        <h3 className="font-bold text-gray-800 dark:text-gray-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors truncate">{file.name}</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            Edited {timeAgo(file.lastModified)}
                                        </p>
                                    </button>
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
        </div>
    );
};

import { useState, useEffect, useCallback } from 'react';
import type { PlaygroundFile, ChatMessage } from '../types';
import { useAuth } from '../contexts/AuthContext';

const BASE_FILES_KEY = 'codetocoder_playground_files';
const OLD_CODE_KEY = 'codetocoder_playground_code';

const DEFAULT_PLAYGROUND_CHAT: ChatMessage[] = [
    { role: 'model', content: "Welcome to the Playground! I'm here to help you experiment with Python code. Ask me anything!" }
];
const DEFAULT_PLAYGROUND_CODE = '# Welcome to the Playground!\n# Experiment with Python code here.\n\nprint("Hello, Playground!")';

export const usePlaygroundFiles = () => {
    const { user, isLoading: isAuthLoading } = useAuth();
    const [files, setFiles] = useState<PlaygroundFile[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    const getFilesKey = useCallback(() => user ? `${BASE_FILES_KEY}_${user.id}` : BASE_FILES_KEY, [user]);

    const saveFilesToStorage = useCallback((currentFiles: PlaygroundFile[]) => {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.setItem(getFilesKey(), JSON.stringify(currentFiles));
            }
        } catch (error) {
            console.error("Failed to save playground files to localStorage", error);
        }
    }, [getFilesKey]);

    useEffect(() => {
        if (isAuthLoading) return;
        setIsLoaded(false);

        const loadFiles = () => {
            try {
                if (typeof window !== 'undefined' && window.localStorage) {
                    const key = getFilesKey();
                    const savedFiles = window.localStorage.getItem(key);
                    
                    if (savedFiles) {
                        return JSON.parse(savedFiles) as PlaygroundFile[];
                    }

                    // Migration logic only for guest mode
                    if (!user) {
                        const oldCode = window.localStorage.getItem(OLD_CODE_KEY);
                        if (oldCode) {
                            const migratedFile: PlaygroundFile = {
                                id: `file_${Date.now()}`,
                                name: 'My Playground.py',
                                content: oldCode,
                                terminalOutput: '> Playground Terminal Ready.',
                                chatHistory: DEFAULT_PLAYGROUND_CHAT,
                                lastModified: Date.now()
                            };
                            saveFilesToStorage([migratedFile]);
                            window.localStorage.removeItem(OLD_CODE_KEY);
                            return [migratedFile];
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to load playground files", error);
            }
            return [];
        };

        setFiles(loadFiles());
        setIsLoaded(true);
    }, [user, isAuthLoading, getFilesKey, saveFilesToStorage]);

    const createFile = useCallback((name: string, content: string = DEFAULT_PLAYGROUND_CODE) => {
        const newFile: PlaygroundFile = {
            id: `file_${Date.now()}`,
            name,
            content,
            terminalOutput: '> Playground Terminal Ready.',
            chatHistory: DEFAULT_PLAYGROUND_CHAT,
            lastModified: Date.now(),
        };

        setFiles(prevFiles => {
            const updatedFiles = [...prevFiles, newFile];
            saveFilesToStorage(updatedFiles);
            return updatedFiles;
        });
        return newFile;
    }, [saveFilesToStorage]);

    const updateFile = useCallback((id: string, updates: Partial<Pick<PlaygroundFile, 'name' | 'content' | 'terminalOutput' | 'chatHistory'>>) => {
        setFiles(prevFiles => {
            let fileUpdated = false;
            const updatedFiles = prevFiles.map(file => {
                if (file.id === id) {
                    fileUpdated = true;
                    return {
                        ...file,
                        ...updates,
                        lastModified: Date.now(),
                    };
                }
                return file;
            });
            if (fileUpdated) {
                saveFilesToStorage(updatedFiles);
            }
            return updatedFiles;
        });
    }, [saveFilesToStorage]);

    const deleteFile = useCallback((id: string) => {
        setFiles(prevFiles => {
            const updatedFiles = prevFiles.filter(file => file.id !== id);
            saveFilesToStorage(updatedFiles);
            return updatedFiles;
        });
    }, [saveFilesToStorage]);

    return { files, isLoaded: isLoaded && !isAuthLoading, createFile, updateFile, deleteFile };
};

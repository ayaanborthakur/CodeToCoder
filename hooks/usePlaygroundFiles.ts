
import { useState, useEffect, useCallback } from 'react';
import type { PlaygroundFile, ChatMessage } from '../types';
import { useAuth } from '../contexts/AuthContext';

const BASE_FILES_KEY = 'code2coder_playground_files';

const DEFAULT_PLAYGROUND_CHAT: ChatMessage[] = [
    { role: 'model', content: "Welcome to the Playground! I'm here to help you experiment with Python code. Ask me anything!" }
];
const DEFAULT_PLAYGROUND_CODE = '# Welcome to the Playground!\n# Experiment with Python code here.\n\nprint("Hello, Playground!")';

export const usePlaygroundFiles = () => {
    const { user, isLoading: isAuthLoading } = useAuth();
    const [files, setFiles] = useState<PlaygroundFile[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    const getFilesKey = useCallback(() => user ? `${BASE_FILES_KEY}_${user.id}` : BASE_FILES_KEY, [user]);

    const saveFilesToStorage = useCallback(async (currentFiles: PlaygroundFile[]) => {
        try {
            // Save to localStorage
            if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.setItem(getFilesKey(), JSON.stringify(currentFiles));
            }

            // Sync to Firestore for logged-in users (new structure)
            if (user) {
                const { syncPlaygroundFiles } = await import('../services/userDataService');
                await syncPlaygroundFiles(user.id, currentFiles);
            }
        } catch (error) {
            console.error("Failed to save playground files", error);
        }
    }, [getFilesKey, user]);

    useEffect(() => {
        if (isAuthLoading) return;
        setIsLoaded(false);

        const loadFiles = async () => {
            try {
                if (user) {
                    const { loadPlaygroundFiles } = await import('../services/userDataService');
                    const firestoreFiles = await loadPlaygroundFiles(user.id);

                    if (firestoreFiles.length > 0) {
                        setFiles(firestoreFiles);
                        // Also save to localStorage as backup
                        if (typeof window !== 'undefined' && window.localStorage) {
                            window.localStorage.setItem(getFilesKey(), JSON.stringify(firestoreFiles));
                        }
                    } else {
                        // No Firestore data, check localStorage (migration case)
                        const key = getFilesKey();
                        const savedFiles = window.localStorage?.getItem(key);

                        if (savedFiles) {
                            const parsedFiles = JSON.parse(savedFiles) as PlaygroundFile[];
                            setFiles(parsedFiles);
                            // Migrate to Firestore
                            const { syncPlaygroundFiles } = await import('../services/userDataService');
                            await syncPlaygroundFiles(user.id, parsedFiles);
                        } else {
                            setFiles([]);
                        }
                    }
                } else {
                    // Not logged in: no files
                    setFiles([]);
                }
            } catch (error) {
                console.error("Failed to load playground files", error);
                setFiles([]);
            } finally {
                setIsLoaded(true);
            }
        };

        loadFiles();
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

        // Log analytics event
        import('../services/analyticsService').then(({ logPlaygroundCreate }) => {
            logPlaygroundCreate(name);
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

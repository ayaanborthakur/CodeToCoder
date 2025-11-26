import {
    doc,
    setDoc,
    getDoc,
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import type { PlaygroundFile, PracticeItem, ChatMessage } from '../types';

// Progress Data
export interface ProgressData {
    completedLessons: string[];
    completedPracticeItems: string[];
    lastUpdated: Timestamp;
}

// Sync progress to Firestore
export const syncProgress = async (
    userId: string,
    completedLessons: string[],
    completedPracticeItems: string[]
): Promise<void> => {
    try {
        const progressRef = doc(db, 'users', userId, 'progress', 'data');
        await setDoc(progressRef, {
            completedLessons,
            completedPracticeItems,
            lastUpdated: serverTimestamp()
        });
    } catch (error) {
        console.error('Failed to sync progress to Firestore:', error);
        throw error;
    }
};

// Load progress from Firestore
export const loadProgress = async (userId: string): Promise<ProgressData | null> => {
    try {
        const progressRef = doc(db, 'users', userId, 'progress', 'data');
        const progressSnap = await getDoc(progressRef);

        if (progressSnap.exists()) {
            return progressSnap.data() as ProgressData;
        }
        return null;
    } catch (error) {
        console.error('Failed to load progress from Firestore:', error);
        return null;
    }
};

// Sync playground files to Firestore
export const syncPlaygroundFiles = async (userId: string, files: PlaygroundFile[]): Promise<void> => {
    try {
        const filesCollectionRef = collection(db, 'users', userId, 'playgroundFiles');

        // Get existing files to determine which to delete
        const existingSnap = await getDocs(filesCollectionRef);
        const existingIds = new Set(existingSnap.docs.map(doc => doc.id));
        const currentIds = new Set(files.map(f => f.id));

        // Delete files that no longer exist
        for (const existingId of existingIds) {
            if (!currentIds.has(existingId)) {
                await deleteDoc(doc(filesCollectionRef, existingId));
            }
        }

        // Update or create files
        for (const file of files) {
            const fileRef = doc(filesCollectionRef, file.id);
            await setDoc(fileRef, {
                name: file.name,
                content: file.content,
                terminalOutput: file.terminalOutput,
                chatHistory: file.chatHistory,
                lastModified: file.lastModified
            });
        }
    } catch (error) {
        console.error('Failed to sync playground files to Firestore:', error);
        throw error;
    }
};

// Load playground files from Firestore
export const loadPlaygroundFiles = async (userId: string): Promise<PlaygroundFile[]> => {
    try {
        const filesCollectionRef = collection(db, 'users', userId, 'playgroundFiles');
        const filesSnap = await getDocs(filesCollectionRef);

        return filesSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as PlaygroundFile));
    } catch (error) {
        console.error('Failed to load playground files from Firestore:', error);
        return [];
    }
};

// Sync custom quizzes to Firestore
export const syncCustomQuizzes = async (userId: string, quizzes: PracticeItem[]): Promise<void> => {
    try {
        const quizzesCollectionRef = collection(db, 'users', userId, 'customQuizzes');

        // Get existing quizzes
        const existingSnap = await getDocs(quizzesCollectionRef);
        const existingIds = new Set(existingSnap.docs.map(doc => doc.id));
        const currentIds = new Set(quizzes.map(q => q.id));

        // Delete quizzes that no longer exist
        for (const existingId of existingIds) {
            if (!currentIds.has(existingId)) {
                await deleteDoc(doc(quizzesCollectionRef, existingId));
            }
        }

        // Update or create quizzes
        for (const quiz of quizzes) {
            const quizRef = doc(quizzesCollectionRef, quiz.id);
            await setDoc(quizRef, quiz);
        }
    } catch (error) {
        console.error('Failed to sync custom quizzes to Firestore:', error);
        throw error;
    }
};

// Load custom quizzes from Firestore
export const loadCustomQuizzes = async (userId: string): Promise<PracticeItem[]> => {
    try {
        const quizzesCollectionRef = collection(db, 'users', userId, 'customQuizzes');
        const quizzesSnap = await getDocs(quizzesCollectionRef);

        return quizzesSnap.docs.map(doc => doc.data() as PracticeItem);
    } catch (error) {
        console.error('Failed to load custom quizzes from Firestore:', error);
        return [];
    }
};

import { doc, collection, CollectionReference, DocumentReference } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Firestore Path Helper - Segment Counting Method
 * 
 * Counts path segments to determine collection vs document:
 * - EVEN number of segments (2, 4, 6...) = DOCUMENT
 * - ODD number of segments (1, 3, 5...) = COLLECTION
 * 
 * Examples:
 * - "users" = 1 segment (odd) → collection
 * - "users/abc123" = 2 segments (even) → document
 * - "users/abc123/Progress" = 3 segments (odd) → collection
 * - "users/abc123/Progress/Classroom" = 4 segments (even) → document
 * - "users/abc123/Progress/Classroom/data" = 5 segments (odd) → INCORRECT! (should be 4 for document)
 */

/**
 * Get Firestore reference (collection or document) based on path string
 * Automatically determines type by counting path segments
 */
export function getFirestoreRef(path: string): CollectionReference | DocumentReference {
    // Count segments in the path (split by /)
    const segments = path.split('/').filter(s => s.length > 0);
    const segmentCount = segments.length;

    // Even segments = document, Odd segments = collection
    if (segmentCount % 2 === 0) {
        // DOCUMENT (even segments)
        return doc(db, path);
    } else {
        // COLLECTION (odd segments)
        return collection(db, path);
    }
}

/**
 * Smart wrapper that automatically chooses the correct Firestore call
 * This is the main function you should use - it handles everything automatically
 */
export function getRef(path: string): CollectionReference | DocumentReference {
    const segments = path.split('/').filter(s => s.length > 0);
    const segmentCount = segments.length;

    if (segmentCount % 2 === 0) {
        // Even segments = document
        return getDocFromPath(path);
    } else {
        // Odd segments = collection
        return getCollectionFromPath(path);
    }
}

/**
 * Get a collection reference from path string
 * Trusts caller to use this for collection paths (odd number of segments)
 */
export function getCollectionFromPath(path: string): CollectionReference {
    return collection(db, path);
}

/**
 * Get a document reference from path string  
 * Trusts caller to use this for document paths (even number of segments)
 */
export function getDocFromPath(path: string): DocumentReference {
    return doc(db, path);
}

/**
 * Helper to build user-specific paths
 * Uses specific getDocFromPath/getCollectionFromPath for proper typing
 * 
 * Segment counting rules:
 * - 2 segments (users/userId) = Document
 * - 3 segments (users/userId/Progress) = Collection  
 * - 4 segments (users/userId/Progress/Classroom) = Document
 */
export const userPaths = {
    /**
     * Get user root document (2 segments = document)
     */
    root: (userId: string) => getDocFromPath(`users/${userId}`),

    /**
     * Progress paths - 4 segments = document
     */
    progress: {
        classroom: (userId: string) => getDocFromPath(`users/${userId}/Progress/Classroom`),
        practiceQuizzes: (userId: string) => getDocFromPath(`users/${userId}/Progress/PracticeQuizzes`),
        practiceProblems: (userId: string) => getDocFromPath(`users/${userId}/Progress/PracticeProblems`),
        practiceProjects: (userId: string) => getDocFromPath(`users/${userId}/Progress/PracticeProjects`),
    },

    /**
     * Stars paths - 4 segments = document
     */
    stars: (userId: string) => getDocFromPath(`users/${userId}/Stars/data`),
    dailyChallenges: {
        current: (userId: string) => getDocFromPath(`users/${userId}/DailyChallenges/current`),
    },

    /**
     * Collection paths - 4 segments = document
     */
    collection: (userId: string) => getDocFromPath(`users/${userId}/Collection/data`),

    /**
     * Practice data paths - 3 segments = collection
     */
    practiceData: {
        playgroundFiles: (userId: string) => getCollectionFromPath(`users/${userId}/PlaygroundFiles`),
        customQuizzes: (userId: string) => getCollectionFromPath(`users/${userId}/CustomQuizzes`),
        referenceMaterial: (userId: string) => getCollectionFromPath(`users/${userId}/CustomReferences`),
    },
    
    /**
     * Activity log path - 3 segments = collection
     */
     activity: (userId: string) => getCollectionFromPath(`users/${userId}/Activity`),

    /**
     * Migration paths - 4 segments = document
     */
    migration: {
        status: (userId: string) => getDocFromPath(`users/${userId}/Migration/status`),
    },
};

/**
 * Validate a path and return whether it should be a collection or document
 */
export function validatePath(path: string): { type: 'collection' | 'document'; segmentCount: number } {
    const segments = path.split('/').filter(s => s.length > 0);
    const segmentCount = segments.length;

    return {
        type: segmentCount % 2 === 0 ? 'document' : 'collection',
        segmentCount
    };
}

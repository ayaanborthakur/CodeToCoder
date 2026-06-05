import {
    doc,
    setDoc,
    getDoc,
    getDocs,
    deleteDoc,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import type {
    ClassroomProgressData,
    ProgressCategoryData,
    UserAchievements,
    PlaygroundFile,
    PracticeItem,
    ReferenceMaterial
} from '../types';
import { userPaths } from './firestorePathHelper';
import { devLog } from '../utils/devLog';

// Progress Data (Old structure - kept for backward compatibility during migration)
export interface ProgressData {
    completedLessons: string[];
    completedPracticeItems: string[];
    achievements?: UserAchievements;
    lastUpdated: Timestamp;
}

/**
 * Ensure root user document exists
 * This is required before creating subcollections in Firestore
 */
const ensureUserDocument = async (userId: string): Promise<void> => {
    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            // Create minimal user document
            await setDoc(userRef, {
                createdAt: Date.now(),
                joinedAt: Date.now(), // For leaderboard "Member Since"
                lastActive: Date.now()
            }, { merge: true });
        } else {
            // Update last active
            await setDoc(userRef, {
                lastActive: Date.now()
            }, { merge: true });
        }
    } catch (error) {
        console.error('Failed to ensure user document:', error);
    }
};

// ============================================================================
// CLASSROOM PROGRESS (New Structure)
// ============================================================================

/**
 * Sync classroom progress to new Firestore structure
 */
export const syncClassroomProgress = async (
    userId: string,
    completedLessons: string[],
    achievements?: UserAchievements,
    rewardedLessons?: string[]
): Promise<void> => {
    try {
        devLog.info('[syncClassroomProgress] Syncing for user:', userId);
        devLog.info('[syncClassroomProgress] Completed lessons:', completedLessons.length);

        // Ensure root user document exists
        await ensureUserDocument(userId);

        const progressRef = userPaths.progress.classroom(userId);
        devLog.info('[syncClassroomProgress] Path:', progressRef.path);
        const data: ClassroomProgressData = {
            completedLessons,
            lastUpdated: Date.now()
        };

        if (rewardedLessons) {
            data.rewardedLessons = rewardedLessons;
        }

        await setDoc(progressRef, data, { merge: true });
        devLog.info('[syncClassroomProgress] Saved successfully');

        // Also sync achievements to Collection
        if (achievements) {
            devLog.info('[syncClassroomProgress] Syncing achievements');
            const collectionRef = userPaths.collection(userId);
            await setDoc(collectionRef, {
                badges: {
                    earnedBadgeIds: achievements.earnedBadgeIds,
                    totalPoints: achievements.totalPoints,
                    lastUpdated: achievements.lastUpdated
                }
            }, { merge: true });
            devLog.info('[syncClassroomProgress] Achievements saved');
        }
    } catch (error) {
        console.error('[syncClassroomProgress] Failed to sync classroom progress to Firestore:', error);
        throw error;
    }
};

/**
 * Load classroom progress from new Firestore structure
 */
export const loadClassroomProgress = async (userId: string): Promise<ClassroomProgressData | null> => {
    try {
        const progressRef = userPaths.progress.classroom(userId);
        const progressSnap = await getDoc(progressRef);

        if (progressSnap.exists()) {
            const data = progressSnap.data() as ClassroomProgressData;
            return data;
        }
        return null;
    } catch (error) {
        console.error('[loadClassroomProgress] Failed to load classroom progress from Firestore:', error);
        return null;
    }
};

// ============================================================================
// PRACTICE PROGRESS (New Structure)
// ============================================================================

/**
 * Sync practice progress to new Firestore structure
 * @param category - 'PracticeQuizzes', 'PracticeProblems', or 'PracticeProjects'
 */
export const syncPracticeProgress = async (
    userId: string,
    category: 'PracticeQuizzes' | 'PracticeProblems' | 'PracticeProjects',
    completed: string[],
    rewardedItems?: string[]
): Promise<void> => {
    try {
        // Ensure root user document exists
        await ensureUserDocument(userId);

        // Map category to path helper function
        const pathMap = {
            'PracticeQuizzes': userPaths.progress.practiceQuizzes,
            'PracticeProblems': userPaths.progress.practiceProblems,
            'PracticeProjects': userPaths.progress.practiceProjects
        };

        const progressRef = pathMap[category](userId);
        const data: ProgressCategoryData = {
            completed,
            lastUpdated: Date.now()
        };

        if (rewardedItems) {
            data.rewardedItems = rewardedItems;
        }

        await setDoc(progressRef, data, { merge: true });
    } catch (error) {
        console.error(`Failed to sync ${category} progress to Firestore:`, error);
        throw error;
    }
};

/**
 * Load practice progress from new Firestore structure
 */
export const loadPracticeProgress = async (
    userId: string,
    category: 'PracticeQuizzes' | 'PracticeProblems' | 'PracticeProjects'
): Promise<ProgressCategoryData | null> => {
    try {

        const pathMap = {
            'PracticeQuizzes': userPaths.progress.practiceQuizzes,
            'PracticeProblems': userPaths.progress.practiceProblems,
            'PracticeProjects': userPaths.progress.practiceProjects
        };

        const progressRef = pathMap[category](userId);
        const progressSnap = await getDoc(progressRef);

        if (progressSnap.exists()) {
            const data = progressSnap.data() as ProgressCategoryData;
            return data;
        }
        return null;
    } catch (error) {
        console.error(`[loadPracticeProgress] Failed to load ${category} progress from Firestore:`, error);
        return null;
    }
};

/**
 * Load achievements from Collection
 */
export const loadAchievements = async (userId: string): Promise<UserAchievements | null> => {
    try {
        const collectionRef = userPaths.collection(userId);
        const collectionSnap = await getDoc(collectionRef);

        if (collectionSnap.exists()) {
            const data = collectionSnap.data();
            if (data.badges) {
                return {
                    earnedBadgeIds: data.badges.earnedBadgeIds || [],
                    totalPoints: data.badges.totalPoints || 0,
                    lastUpdated: data.badges.lastUpdated || Date.now()
                };
            }
        }
        return null;
    } catch (error) {
        console.error('Failed to load achievements from Firestore:', error);
        return null;
    }
};

// ============================================================================
// OLD PROGRESS FUNCTIONS (Kept for backward compatibility)
// ============================================================================

/**
 * @deprecated Use syncClassroomProgress and syncPracticeProgress instead
 */
export const syncProgress = async (
    userId: string,
    completedLessons: string[],
    completedPracticeItems: string[],
    achievements?: UserAchievements
): Promise<void> => {
    try {
        const progressRef = doc(db, 'users', userId, 'progress', 'data');
        const data: any = {
            completedLessons,
            completedPracticeItems,
            lastUpdated: serverTimestamp()
        };

        if (achievements) {
            data.achievements = achievements;
        }

        await setDoc(progressRef, data, { merge: true });
    } catch (error) {
        console.error('Failed to sync progress to Firestore:', error);
        throw error;
    }
};

/**
 * @deprecated Use loadClassroomProgress and loadPracticeProgress instead
 */
export const loadProgress = async (userId: string): Promise<ProgressData | null> => {
    try {
        const progressRef = doc(db, 'users', userId, 'progress', 'data');
        const progressSnap = await getDoc(progressRef);

        if (progressSnap.exists()) {
            const data = progressSnap.data() as ProgressData;

            // Migration: Check for old achievements structure
            if (data.achievements && !data.achievements.earnedBadgeIds && (data.achievements as any).earnedBadges) {
                data.achievements.earnedBadgeIds = (data.achievements as any).earnedBadges;
            }

            return data;
        }
        return null;
    } catch (error) {
        console.error('Failed to load progress from Firestore:', error);
        return null;
    }
};

// ============================================================================
// PLAYGROUND FILES (New Structure)
// ============================================================================

/**
 * Sync playground files to new Firestore structure
 */
export const syncPlaygroundFiles = async (userId: string, files: PlaygroundFile[]): Promise<void> => {
    try {
        // Ensure root user document exists
        await ensureUserDocument(userId);

        // PracticeData is a document, PlaygroundFiles is a subcollection under it
        const filesCollectionRef = userPaths.practiceData.playgroundFiles(userId);

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

/**
 * Load playground files from new Firestore structure
 */
export const loadPlaygroundFiles = async (userId: string): Promise<PlaygroundFile[]> => {
    try {
        const filesCollectionRef = userPaths.practiceData.playgroundFiles(userId);
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

// ============================================================================
// CUSTOM QUIZZES (New Structure)
// ============================================================================

/**
 * Sync custom quizzes to new Firestore structure
 */
export const syncCustomQuizzes = async (userId: string, quizzes: PracticeItem[]): Promise<void> => {
    try {
        // Ensure root user document exists
        await ensureUserDocument(userId);

        // PracticeData is a document, CustomQuizzes is a subcollection under it
        const quizzesCollectionRef = userPaths.practiceData.customQuizzes(userId);

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

/**
 * Load custom quizzes from new Firestore structure
 */
export const loadCustomQuizzes = async (userId: string): Promise<PracticeItem[]> => {
    try {
        const quizzesCollectionRef = userPaths.practiceData.customQuizzes(userId);
        const quizzesSnap = await getDocs(quizzesCollectionRef);

        return quizzesSnap.docs.map(doc => doc.data() as PracticeItem);
    } catch (error) {
        console.error('Failed to load custom quizzes from Firestore:', error);
        return [];
    }
};

// ============================================================================
// REFERENCE MATERIAL (New Feature)
// ============================================================================

/**
 * Save AI-generated reference material
 */
export const saveReferenceMaterial = async (userId: string, material: ReferenceMaterial): Promise<void> => {
    try {
        const materialsCollectionRef = userPaths.practiceData.referenceMaterial(userId);
        const materialRef = doc(materialsCollectionRef, material.id);
        await setDoc(materialRef, material);
    } catch (error) {
        console.error('Failed to save reference material to Firestore:', error);
        throw error;
    }
};

/**
 * Load all reference materials for a user
 */
export const loadReferenceMaterials = async (userId: string): Promise<ReferenceMaterial[]> => {
    try {
        const materialsCollectionRef = userPaths.practiceData.referenceMaterial(userId);
        const materialsSnap = await getDocs(materialsCollectionRef);

        return materialsSnap.docs.map(doc => doc.data() as ReferenceMaterial);
    } catch (error) {
        console.error('Failed to load reference materials from Firestore:', error);
        return [];
    }
};

/**
 * Delete a reference material
 */
export const deleteReferenceMaterial = async (userId: string, materialId: string): Promise<void> => {
    try {
        const materialsCollectionRef = userPaths.practiceData.referenceMaterial(userId);
        const materialRef = doc(materialsCollectionRef, materialId);
        await deleteDoc(materialRef);
    } catch (error) {
        console.error('Failed to delete reference material from Firestore:', error);
        throw error;
    }
};

// ============================================================================
// PROFILE PICTURE MANAGEMENT
// ============================================================================

const PROFILE_PICTURE_KEY = 'code2coder_profile_picture';
const SUPPORTED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Upload and save profile picture
 * Converts image to base64 and stores in localStorage
 */
export const uploadProfilePicture = async (file: File, userId: string): Promise<string> => {
    // Validate file type
    if (!SUPPORTED_FORMATS.includes(file.type)) {
        throw new Error(
            `Unsupported image format. Please use one of the following: JPEG, PNG, GIF, or WebP.`
        );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
        throw new Error(
            `File size too large. Please use an image smaller than 5MB.`
        );
    }

    // Convert to base64
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            const base64String = reader.result as string;

            // Save to localStorage
            try {
                localStorage.setItem(`${PROFILE_PICTURE_KEY}_${userId}`, base64String);
                resolve(base64String);
            } catch (error) {
                reject(new Error('Failed to save profile picture. Storage might be full.'));
            }
        };

        reader.onerror = () => {
            reject(new Error('Failed to read the image file.'));
        };

        reader.readAsDataURL(file);
    });
};

/**
 * Get saved profile picture for a user
 */
export const getProfilePicture = (userId: string): string | null => {
    return localStorage.getItem(`${PROFILE_PICTURE_KEY}_${userId}`);
};

/**
 * Remove profile picture
 */
export const removeProfilePicture = (userId: string): void => {
    localStorage.removeItem(`${PROFILE_PICTURE_KEY}_${userId}`);
};


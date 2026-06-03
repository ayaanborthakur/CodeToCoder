import {
    doc,
    getDoc,
    setDoc,
    collection,
    getDocs,
    deleteDoc,
    writeBatch,
    Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import type {
    ProgressCategoryData,
    ClassroomProgressData,
    StarsData,
    DailyChallengesData,
    CollectionData,
    PracticeItem
} from '../types';
import { userPaths } from './firestorePathHelper';

const MIGRATION_VERSION = 1;

interface MigrationStatus {
    version: number;
    migratedAt: number;
    completed: boolean;
}

/**
 * Check if user has already been migrated to new structure
 */
export const checkMigrationStatus = async (userId: string): Promise<MigrationStatus | null> => {
    try {
        const migrationRef = userPaths.migration.status(userId);
        const migrationSnap = await getDoc(migrationRef);

        if (migrationSnap.exists()) {
            return migrationSnap.data() as MigrationStatus;
        }
        return null;
    } catch (error) {
        console.error('Error checking migration status:', error);
        return null;
    }
};

/**
 * Mark migration as complete
 */
const markMigrationComplete = async (userId: string): Promise<void> => {
    const migrationRef = userPaths.migration.status(userId);
    await setDoc(migrationRef, {
        version: MIGRATION_VERSION,
        migratedAt: Date.now(),
        completed: true
    });
};

/**
 * Migrate progress data to new structure
 */
const migrateProgressData = async (userId: string): Promise<void> => {
    try {
        // Load old progress data
        const oldProgressRef = doc(db, 'users', userId, 'progress', 'data');
        const oldProgressSnap = await getDoc(oldProgressRef);

        if (!oldProgressSnap.exists()) {
            return;
        }

        const oldData = oldProgressSnap.data();
        const completedLessons = oldData.completedLessons || [];
        const completedPracticeItems = oldData.completedPracticeItems || [];
        const achievements = oldData.achievements;

        // Migrate classroom progress
        const classroomRef = userPaths.progress.classroom(userId);
        const classroomData: ClassroomProgressData = {
            completedLessons,
            lastUpdated: Date.now()
        };
        await setDoc(classroomRef, classroomData);

        // Categorize practice items by type
        // Since we don't have the full practice item data here, we'll store them all in a general category
        // The actual categorization will happen when new items are completed
        const practiceQuizzesRef = userPaths.progress.practiceQuizzes(userId);
        const practiceProblemsRef = userPaths.progress.practiceProblems(userId);
        const practiceProjectsRef = userPaths.progress.practiceProjects(userId);

        // For migration, we'll put all practice items in problems category
        // Users can recomplete quizzes/projects if needed
        const practiceData: ProgressCategoryData = {
            completed: completedPracticeItems,
            lastUpdated: Date.now()
        };

        await setDoc(practiceQuizzesRef, { completed: [], lastUpdated: Date.now() });
        await setDoc(practiceProblemsRef, practiceData);
        await setDoc(practiceProjectsRef, { completed: [], lastUpdated: Date.now() });

        // Migrate achievements to Collection
        if (achievements) {
            const collectionRef = userPaths.collection(userId);
            const collectionData: CollectionData = {
                badges: {
                    earnedBadgeIds: achievements.earnedBadgeIds || [],
                    totalPoints: achievements.totalPoints || 0,
                    lastUpdated: achievements.lastUpdated || Date.now()
                },
                collectibles: {
                    ownedCollectibleIds: []
                }
            };
            await setDoc(collectionRef, collectionData, { merge: true });
        }

    } catch (error) {
        console.error('Error migrating progress data:', error);
        throw error;
    }
};

/**
 * Migrate marketplace data to new structure
 */
const migrateMarketplaceData = async (userId: string): Promise<void> => {
    try {
        // Load old marketplace data
        const oldMarketplaceRef = doc(db, 'marketplace', userId);
        const oldMarketplaceSnap = await getDoc(oldMarketplaceRef);

        if (!oldMarketplaceSnap.exists()) {
            return;
        }

        const oldData = oldMarketplaceSnap.data();

        // Migrate stars data
        const starsRef = userPaths.stars(userId);
        const starsData: StarsData = {
            balance: oldData.stars?.balance || 0,
            totalEarned: oldData.stars?.totalEarned || 0,
            totalSpent: oldData.stars?.totalSpent || 0,
            lastUpdated: oldData.stars?.lastUpdated || Date.now(),
            transactionHistory: oldData.transactionHistory || [],
            dailyPrizeClaimed: oldData.dailyPrizeClaimed || 0
        };
        await setDoc(starsRef, starsData);

        // Migrate daily challenges
        if (oldData.dailyChallenges && oldData.dailyChallenges.length > 0) {
            const challengesRef = userPaths.dailyChallenges.current(userId);
            const challengesData: DailyChallengesData = {
                challenges: oldData.dailyChallenges,
                lastRefreshed: Date.now()
            };
            await setDoc(challengesRef, challengesData);
        }

        // Migrate collectibles to Collection
        const collectionRef = userPaths.collection(userId);
        const collectionData: Partial<CollectionData> = {
            collectibles: {
                ownedCollectibleIds: oldData.ownedCollectibles || []
            }
        };
        await setDoc(collectionRef, collectionData, { merge: true });

    } catch (error) {
        console.error('Error migrating marketplace data:', error);
        throw error;
    }
};

/**
 * Migrate playground files to new structure
 */
const migratePlaygroundFiles = async (userId: string): Promise<void> => {
    try {
        // Load old playground files
        const oldFilesRef = collection(db, 'users', userId, 'playgroundFiles');
        const oldFilesSnap = await getDocs(oldFilesRef);

        if (oldFilesSnap.empty) {
            return;
        }

        // Copy to new location - PracticeData is a document, PlaygroundFiles is a subcollection
        const batch = writeBatch(db);
        const filesCollectionRef = userPaths.practiceData.playgroundFiles(userId);

        oldFilesSnap.docs.forEach(fileDoc => {
            const newFileRef = doc(filesCollectionRef, fileDoc.id);
            batch.set(newFileRef, fileDoc.data());
        });

        await batch.commit();
    } catch (error) {
        console.error('Error migrating playground files:', error);
        throw error;
    }
};

/**
 * Migrate custom quizzes to new structure
 */
const migrateCustomQuizzes = async (userId: string): Promise<void> => {
    try {
        // Load old custom quizzes
        const oldQuizzesRef = collection(db, 'users', userId, 'customQuizzes');
        const oldQuizzesSnap = await getDocs(oldQuizzesRef);

        if (oldQuizzesSnap.empty) {
            return;
        }

        // Copy to new location - PracticeData is a document, CustomQuizzes is a subcollection
        const batch = writeBatch(db);
        const quizzesCollectionRef = userPaths.practiceData.customQuizzes(userId);

        oldQuizzesSnap.docs.forEach(quizDoc => {
            const newQuizRef = doc(quizzesCollectionRef, quizDoc.id);
            batch.set(newQuizRef, quizDoc.data());
        });

        await batch.commit();
    } catch (error) {
        console.error('Error migrating custom quizzes:', error);
        throw error;
    }
};

/**
 * Main migration function - migrates all user data to new structure
 */
export const migrateUserData = async (userId: string): Promise<void> => {
    try {
        // Fast path: localStorage remembers users who've finished the current
        // migration. Avoids reading the migration/status doc on every login.
        const cacheKey = `migration:${userId}:v${MIGRATION_VERSION}`;
        try {
            if (typeof window !== 'undefined' && window.localStorage?.getItem(cacheKey) === '1') {
                return;
            }
        } catch { /* sessionStorage / localStorage unavailable — fall through */ }

        // Check if already migrated (server source of truth)
        const migrationStatus = await checkMigrationStatus(userId);
        if (migrationStatus && migrationStatus.completed && migrationStatus.version >= MIGRATION_VERSION) {
            try { window.localStorage?.setItem(cacheKey, '1'); } catch { /* ignore */ }
            return;
        }

        // Run all migrations
        await migrateProgressData(userId);
        await migrateMarketplaceData(userId);
        await migratePlaygroundFiles(userId);
        await migrateCustomQuizzes(userId);

        // Mark migration as complete (server + cache)
        await markMigrationComplete(userId);
        try { window.localStorage?.setItem(cacheKey, '1'); } catch { /* ignore */ }

    } catch (error) {
        console.error('Migration failed:', error);
        throw error;
    }
};

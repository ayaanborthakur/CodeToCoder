/**
 * Firestore Cleanup Script
 * 
 * This script helps clean up the old 'marketplace' collection from Firestore.
 * The new structure stores all data under the 'users' collection.
 * 
 * IMPORTANT: Only run this script AFTER you've verified that:
 * 1. All users have been migrated to the new structure
 * 2. The migration has been running successfully for at least a week
 * 3. You have a backup of your Firestore database
 * 
 * To run this script:
 * 1. Uncomment the code at the bottom
 * 2. Run: npx tsx scripts/cleanupOldMarketplace.ts
 * 3. Re-comment the code after running
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

// Firebase configuration (use your actual config)
const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
    measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Delete all documents in the old marketplace collection
 */
async function cleanupOldMarketplace() {
    console.log('Starting cleanup of old marketplace collection...');

    try {
        const marketplaceRef = collection(db, 'marketplace');
        const snapshot = await getDocs(marketplaceRef);

        console.log(`Found ${snapshot.size} documents in marketplace collection`);

        if (snapshot.size === 0) {
            console.log('No documents to delete. Collection is already clean.');
            return;
        }

        // Ask for confirmation
        console.log('\n⚠️  WARNING: This will permanently delete all documents in the marketplace collection.');
        console.log('Make sure you have:');
        console.log('1. Verified all users have been migrated');
        console.log('2. Backed up your Firestore database');
        console.log('3. Tested the new structure thoroughly\n');

        // In a real script, you'd want to add a confirmation prompt here
        // For safety, we'll just log what would be deleted

        let deletedCount = 0;
        for (const docSnapshot of snapshot.docs) {
            console.log(`Would delete: marketplace/${docSnapshot.id}`);
            // Uncomment the line below to actually delete:
            // await deleteDoc(doc(db, 'marketplace', docSnapshot.id));
            deletedCount++;
        }

        console.log(`\n✅ Would delete ${deletedCount} documents`);
        console.log('\nTo actually delete, uncomment the deleteDoc line in the code.');

    } catch (error) {
        console.error('Error during cleanup:', error);
        throw error;
    }
}

/**
 * Verify migration status for all users
 */
async function verifyMigration() {
    console.log('Verifying migration status...\n');

    try {
        const usersRef = collection(db, 'users');
        const snapshot = await getDocs(usersRef);

        console.log(`Found ${snapshot.size} users`);

        let migratedCount = 0;
        let notMigratedCount = 0;

        for (const userDoc of snapshot.docs) {
            const userId = userDoc.id;

            // Check if migration status exists
            const migrationRef = doc(db, 'users', userId, 'Migration', 'status');
            const migrationSnap = await getDocs(collection(db, 'users', userId, 'Migration'));

            if (migrationSnap.size > 0) {
                migratedCount++;
                console.log(`✅ User ${userId}: Migrated`);
            } else {
                notMigratedCount++;
                console.log(`❌ User ${userId}: Not migrated`);
            }
        }

        console.log(`\nMigration Summary:`);
        console.log(`Total users: ${snapshot.size}`);
        console.log(`Migrated: ${migratedCount}`);
        console.log(`Not migrated: ${notMigratedCount}`);

        if (notMigratedCount > 0) {
            console.log('\n⚠️  WARNING: Some users have not been migrated yet.');
            console.log('Do NOT delete the marketplace collection until all users are migrated.');
        } else {
            console.log('\n✅ All users have been migrated!');
            console.log('It is safe to clean up the old marketplace collection.');
        }

    } catch (error) {
        console.error('Error verifying migration:', error);
        throw error;
    }
}

// Main execution
// UNCOMMENT THE LINES BELOW TO RUN THE SCRIPT:

// (async () => {
//     console.log('='.repeat(60));
//     console.log('Firestore Cleanup Script');
//     console.log('='.repeat(60) + '\n');
//     
//     // First, verify migration status
//     await verifyMigration();
//     
//     console.log('\n' + '='.repeat(60) + '\n');
//     
//     // Then, optionally clean up old marketplace collection
//     // Only uncomment this if verification shows all users are migrated
//     // await cleanupOldMarketplace();
//     
//     console.log('\n' + '='.repeat(60));
//     console.log('Script completed');
//     console.log('='.repeat(60));
//     
//     process.exit(0);
// })();

console.log('Cleanup script loaded. Uncomment the main execution block to run.');

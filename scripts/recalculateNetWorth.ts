/**
 * Recalculate Net Worth Script
 * 
 * This script iterates through all users in Firestore and recalculates their net_value
 * based on the formula: Net Worth = Stars Balance + Value of All Collectibles.
 * 
 * To run this script:
 * 1. Ensure you have your .env file with Firebase credentials
 * 2. Run: npx tsx scripts/recalculateNetWorth.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { COLLECTIBLES, COLLECTIBLE_SELL_RATES } from '../data/collectiblesData';
import { StarsData, CollectionData } from '../types';
import * as fs from 'fs';
import * as path from 'path';

// Manually load .env file
try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^["']|["']$/g, '');
                process.env[key] = value;
                console.log(`Loaded key: ${key}`);
            }
        });
        console.log('Loaded environment variables from .env');
    } else {
        console.warn('No .env file found in root directory');
    }
} catch (error) {
    console.error('Error loading .env file:', error);
}

// Firebase configuration
const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: "code2coder-a324f.firebaseapp.com",
    projectId: "code2coder-a324f",
    storageBucket: "code2coder-a324f.firebasestorage.app",
    messagingSenderId: "875613254710",
    appId: "1:875613254710:web:7f7bee6ca4ceea20835497",
    measurementId: "G-XS427VJBC5"
};

console.log('Initializing Firebase with project:', firebaseConfig.projectId);


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Helper function to calculate collectible value
const calculateCollectiblesValue = (ownedCollectibleIds: string[]): { totalValue: number, breakdown: Record<string, { count: number, value: number }> } => {
    // Count collectibles by rarity
    const rarityCounts: Record<string, number> = {
        common: 0,
        uncommon: 0,
        rare: 0,
        epic: 0,
        legendary: 0,
        mythic: 0,
        divine: 0
    };
    
    // Count each collectible by its rarity
    for (const id of ownedCollectibleIds) {
        const collectible = COLLECTIBLES.find(c => c.id === id);
        if (collectible && collectible.rarity in rarityCounts) {
            rarityCounts[collectible.rarity]++;
        }
    }
    
    // Calculate value for each rarity: count * worth per rarity
    let totalValue = 0;
    const breakdown: Record<string, { count: number, value: number }> = {};
    
    for (const [rarity, count] of Object.entries(rarityCounts)) {
        // @ts-ignore - Indexing with string
        const worthPerItem = COLLECTIBLE_SELL_RATES[rarity] || 0;
        const value = count * worthPerItem;
        breakdown[rarity] = { count, value };
        totalValue += value;
    }
    
    return { totalValue, breakdown };
};

async function recalculateAllUsers() {
    console.log('Starting net worth recalculation for ALL users...');
    
    try {
        const usersRef = collection(db, 'users');
        const snapshot = await getDocs(usersRef);
        
        console.log(`Found ${snapshot.size} users to process.`);
        
        let processedCount = 0;
        let updatedCount = 0;
        
        for (const userDoc of snapshot.docs) {
            const userId = userDoc.id;
            const userData = userDoc.data();
            const currentNetValue = userData.net_value || 0;
            
            // 1. Get Stars Balance
            const starsRef = doc(db, 'users', userId, 'Stars', 'data');
            const starsSnap = await getDoc(starsRef);
            let starsBalance = 0;
            
            if (starsSnap.exists()) {
                const starsData = starsSnap.data() as StarsData;
                starsBalance = starsData.balance || 0;
            }
            
            // 2. Get Collectibles
            const collectionRef = doc(db, 'users', userId, 'Collection', 'data');
            const collectionSnap = await getDoc(collectionRef);
            let ownedCollectibleIds: string[] = [];
            
            if (collectionSnap.exists()) {
                const collectionData = collectionSnap.data() as CollectionData;
                if (collectionData.collectibles && collectionData.collectibles.ownedCollectibleIds) {
                    ownedCollectibleIds = collectionData.collectibles.ownedCollectibleIds;
                }
            }
            
            // 3. Calculate New Net Worth
            const { totalValue: collectiblesValue } = calculateCollectiblesValue(ownedCollectibleIds);
            const newNetWorth = starsBalance + collectiblesValue;
            
            // 4. Update if different or if forcing update
            if (newNetWorth !== currentNetValue) {
                console.log(`User ${userId} (${userData.name || 'Unknown'}):`);
                console.log(`  - Old Net Worth: ${currentNetValue}`);
                console.log(`  - New Net Worth: ${newNetWorth} (Stars: ${starsBalance} + Collectibles: ${collectiblesValue})`);
                
                await setDoc(userDoc.ref, {
                    net_value: newNetWorth,
                    lastActive: Date.now() // Optional: update activity
                }, { merge: true });
                
                updatedCount++;
            }
            
            processedCount++;
            if (processedCount % 10 === 0) {
                console.log(`Processed ${processedCount}/${snapshot.size} users...`);
            }
        }
        
        console.log('\nRecalculation Complete!');
        console.log(`Processed: ${processedCount}`);
        console.log(`Updated: ${updatedCount}`);
        
    } catch (error) {
        console.error('Error during recalculation:', error);
    }
}

// Execute
recalculateAllUsers().then(() => {
    console.log('Done.');
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});

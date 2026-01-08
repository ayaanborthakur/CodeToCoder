import { doc, getDoc, runTransaction } from 'firebase/firestore';
import { db, functions } from './firebase';
import { httpsCallable } from 'firebase/functions';

/**
 * Username Service
 * Handles unique username validation and management
 */

const USERS_COLLECTION = 'users';

// Username validation rules
const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 20;
const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;

/**
 * Validate username format
 */
export const validateUsername = (username: string): { valid: boolean; error?: string } => {
    if (!username || username.trim() === '') {
        return { valid: false, error: 'Username is required' };
    }

    const trimmed = username.trim().toLowerCase();

    if (trimmed.length < USERNAME_MIN_LENGTH) {
        return { valid: false, error: `Username must be at least ${USERNAME_MIN_LENGTH} characters` };
    }

    if (trimmed.length > USERNAME_MAX_LENGTH) {
        return { valid: false, error: `Username must be at most ${USERNAME_MAX_LENGTH} characters` };
    }

    if (!USERNAME_REGEX.test(trimmed)) {
        return { valid: false, error: 'Username can only contain letters, numbers, and underscores' };
    }

    // Reserved usernames
    const reserved = ['admin', 'administrator', 'moderator', 'mod', 'system', 'code2coder', 'support', 'help', 'guest', 'anonymous', 'user', 'null', 'undefined'];
    if (reserved.includes(trimmed)) {
        return { valid: false, error: 'This username is reserved' };
    }

    return { valid: true };
};

/**
 * Check if a username is available
 */
export const isUsernameAvailable = async (username: string): Promise<boolean> => {
    const validation = validateUsername(username);
    if (!validation.valid) return false;

    const normalizedUsername = username.trim().toLowerCase();
    
    try {
        // CALL CLOUD FUNCTION instead of questioning Firestore directly
        // This bypasses client-side security rules obstructing new users
        const checkAvailability = httpsCallable(functions, 'checkUsernameAvailability');
        const result = await checkAvailability({ username: normalizedUsername });
        const data = result.data as { available: boolean; reason?: string };
        
        return data.available;
    } catch (error) {
        console.error('Error checking username availability:', error);
        // Fail securely (assume unavailable if error on server)
        // OR return false to be safe
        return false;
    }
};

/**
 * Claim a username for a user (atomic transaction)
 */
export const claimUsername = async (userId: string, username: string): Promise<void> => {
    const validation = validateUsername(username);
    if (!validation.valid) {
        throw new Error(validation.error || 'Invalid username');
    }

    const normalizedUsername = username.trim().toLowerCase();
    const userRef = doc(db, USERS_COLLECTION, userId);
    const leaderboardRef = doc(db, 'leaderboard', userId);

    // Cloud Function handles both availability AND profanity checking
    const available = await isUsernameAvailable(normalizedUsername);
    if (!available) {
        throw new Error('Username is already taken or contains inappropriate content');
    }

    await runTransaction(db, async (transaction) => {
        // DO ALL READS FIRST
        const leaderboardDoc = await transaction.get(leaderboardRef);
        
        // THEN DO ALL WRITES
        transaction.set(userRef, {
            username: normalizedUsername,
            lastActive: Date.now(),
            shown: true
        }, { merge: true });

        // Update leaderboard document if it exists
        if (leaderboardDoc.exists()) {
            transaction.set(leaderboardRef, {
                username: normalizedUsername
            }, { merge: true });
        }
    });
};



/**
 * Change username (releases old, claims new)
 */
export const changeUsername = async (userId: string, newUsername: string): Promise<void> => {
    // claimUsername handles releasing old username in transaction
    await claimUsername(userId, newUsername);
};

/**
 * Get username by user ID
 */
export const getUsernameByUserId = async (userId: string): Promise<string | null> => {
    try {
        const userRef = doc(db, USERS_COLLECTION, userId);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
            return userDoc.data()?.username || null;
        }
        return null;
    } catch (error) {
        console.error('Failed to get username:', error);
        return null;
    }
};

/**
 * Generate a default unique username
 */
export const generateDefaultUsername = (): string => {
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    return `user_${randomSuffix}`;
};

/**
 * Check if user needs to set a username
 */
export const userNeedsUsername = async (userId: string): Promise<boolean> => {
    const username = await getUsernameByUserId(userId);
    return !username;
};

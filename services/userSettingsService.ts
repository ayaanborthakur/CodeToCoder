import { doc, getDoc, setDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from './firebase';

export interface UserSettings {
    theme: 'light' | 'dark';
    aiAssistanceLevel: number; // 0-10
}

const DEFAULT_SETTINGS: UserSettings = {
    theme: 'dark',
    aiAssistanceLevel: 7
};

/**
 * Get user settings from Firestore
 */
export const getUserSettings = async (userId: string): Promise<UserSettings> => {
    try {
        const settingsRef = doc(db, 'users', userId, 'userSettings', 'preferences');
        const settingsSnap = await getDoc(settingsRef);

        if (settingsSnap.exists()) {
            const data = settingsSnap.data();
            return {
                theme: data.theme || DEFAULT_SETTINGS.theme,
                aiAssistanceLevel: typeof data.aiAssistanceLevel === 'number'
                    ? Math.max(0, Math.min(10, data.aiAssistanceLevel))
                    : DEFAULT_SETTINGS.aiAssistanceLevel
            };
        }

        // If no settings exist, create default settings
        await setDoc(settingsRef, DEFAULT_SETTINGS);
        return DEFAULT_SETTINGS;
    } catch (error) {
        console.error('Error fetching user settings:', error);
        return DEFAULT_SETTINGS;
    }
};

/**
 * Update user settings in Firestore
 */
export const updateUserSettings = async (userId: string, settings: Partial<UserSettings>): Promise<void> => {
    try {
        const settingsRef = doc(db, 'users', userId, 'userSettings', 'preferences');

        // Get current settings first
        const currentSettings = await getUserSettings(userId);

        // Merge with new settings
        const updatedSettings: UserSettings = {
            ...currentSettings,
            ...settings
        };

        // Ensure aiAssistanceLevel is within bounds
        if (typeof updatedSettings.aiAssistanceLevel === 'number') {
            updatedSettings.aiAssistanceLevel = Math.max(0, Math.min(10, updatedSettings.aiAssistanceLevel));
        }

        await setDoc(settingsRef, updatedSettings, { merge: true });
    } catch (error) {
        console.error('Error updating user settings:', error);
        throw error;
    }
};

/**
 * Subscribe to user settings changes in real-time
 */
export const subscribeToUserSettings = (
    userId: string,
    callback: (settings: UserSettings) => void
): Unsubscribe => {
    const settingsRef = doc(db, 'users', userId, 'userSettings', 'preferences');

    return onSnapshot(settingsRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.data();
            const settings: UserSettings = {
                theme: data.theme || DEFAULT_SETTINGS.theme,
                aiAssistanceLevel: typeof data.aiAssistanceLevel === 'number'
                    ? Math.max(0, Math.min(10, data.aiAssistanceLevel))
                    : DEFAULT_SETTINGS.aiAssistanceLevel
            };
            callback(settings);
        } else {
            // Initialize with defaults if document doesn't exist
            setDoc(settingsRef, DEFAULT_SETTINGS).catch(console.error);
            callback(DEFAULT_SETTINGS);
        }
    }, (error) => {
        console.error('Error subscribing to user settings:', error);
        callback(DEFAULT_SETTINGS);
    });
};

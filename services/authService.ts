import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  deleteUser,
  signInWithPopup,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from './firebase';
import { User } from '../types';

const SESSION_KEY = 'code2coder_session';

export const authService = {
  async login(email: string, password: string): Promise<User> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    return this.mapFirebaseUser(firebaseUser);
  },

  async loginWithGoogle(): Promise<void> {
    try {
      // CRITICAL: We use signInWithPopup here. This works because we have strictly REMOVED
      // all COOP (Cross-Origin-Opener-Policy) headers from the server/hosting.
      // If you re-enable COOP (e.g. for SharedArrayBuffer), this popup will break (blank screen).
      // Do NOT switch back to signInWithRedirect unless you have a robust solution for
      // persistent storage access in isolated environments (which is very hard).
      await signInWithPopup(auth, googleProvider);
      // The auth state listener will handle the rest
    } catch (error) {
      console.error("Google Sign In Error:", error);
      throw error;
    }
  },

  async handleRedirectResult(): Promise<User | null> {
    // No longer using redirect flow
    return null;
  },

  async register(email: string, password: string, name: string): Promise<User> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Update profile with name
    await updateProfile(firebaseUser, {
      displayName: name
    });

    // Reload user to get updated profile
    await firebaseUser.reload();

    // Get the refreshed user from auth
    const updatedUser = auth.currentUser;
    if (updatedUser) {
      return this.mapFirebaseUser(updatedUser, name);
    }

    return this.mapFirebaseUser(firebaseUser, name);
  },


  async logout(): Promise<void> {
    await signOut(auth);
    localStorage.removeItem(SESSION_KEY);
  },

  async deleteAccount(): Promise<void> {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      throw new Error('No user is currently signed in');
    }

    const userId = firebaseUser.uid;

    // Delete all user data from localStorage
    localStorage.removeItem(`code2coder_progress_${userId}`);
    localStorage.removeItem(`code2coder_practice_progress_${userId}`);
    localStorage.removeItem(`code2coder_playground_files_${userId}`);
    localStorage.removeItem(`code2coder_custom_quizzes_${userId}`);
    localStorage.removeItem(SESSION_KEY);

    // Delete the user from Firebase Authentication
    await deleteUser(firebaseUser);
  },

  async getCurrentUser(): Promise<User | null> {
    // This is mainly used for initial load if we wanted to check localStorage,
    // but with Firebase we usually rely on the auth state listener.
    // However, we can return the current auth user if initialized.
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      return this.mapFirebaseUser(firebaseUser);
    }
    return null;
  },

  // Helper to map Firebase user to our app's User type (now fetches username from Firestore)
  mapFirebaseUser(firebaseUser: FirebaseUser, fallbackName?: string): User {
    // Note: This is synchronous for backward compatibility
    // Username is fetched separately via refreshUserWithUsername
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      name: firebaseUser.displayName || fallbackName || 'User',
      joinedAt: firebaseUser.metadata.creationTime ? new Date(firebaseUser.metadata.creationTime).getTime() : Date.now(),
    };
  },

  // Async version that fetches username from Firestore
  async mapFirebaseUserWithUsername(firebaseUser: FirebaseUser, fallbackName?: string): Promise<User> {
    const baseUser = this.mapFirebaseUser(firebaseUser, fallbackName);
    
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        // Check if joinedAt is missing (Migration for existing users)
        if (!data.joinedAt) {
          console.log('Migrating joinedAt for user:', firebaseUser.uid);
          // If createdAt exists in Firestore, use it (migration).
          // Otherwise, fall back to Auth metadata or Date.now()
          const joinDate = data.createdAt || baseUser.joinedAt || Date.now();
          
          await setDoc(userRef, {
            joinedAt: joinDate
          }, { merge: true });
        }

        return {
          ...baseUser,
          username: data.username || undefined,
          // Always return the value from Firestore if it exists (though we just set it if missing)
          joinedAt: data.joinedAt || baseUser.joinedAt
        };
      }
    } catch (error) {
      console.error('Failed to fetch username:', error);
    }
    
    return baseUser;
  },

};

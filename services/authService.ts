import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  signInAnonymously,
  deleteUser,
  signInWithPopup,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import { User } from '../types';

const SESSION_KEY = 'codetocoder_session';

export const authService = {
  async login(email: string, password: string): Promise<User> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    return this.mapFirebaseUser(firebaseUser);
  },

  async loginWithGoogle(): Promise<User> {
    const userCredential = await signInWithPopup(auth, googleProvider);
    const firebaseUser = userCredential.user;

    return this.mapFirebaseUser(firebaseUser);
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

  async loginAnonymously(): Promise<User> {
    const userCredential = await signInAnonymously(auth);
    const firebaseUser = userCredential.user;

    return this.mapFirebaseUser(firebaseUser, 'Guest');
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
    localStorage.removeItem(`codetocoder_progress_${userId}`);
    localStorage.removeItem(`codetocoder_practice_progress_${userId}`);
    localStorage.removeItem(`codetocoder_playground_files_${userId}`);
    localStorage.removeItem(`codetocoder_custom_quizzes_${userId}`);
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

  // Helper to map Firebase user to our app's User type
  mapFirebaseUser(firebaseUser: FirebaseUser, fallbackName?: string): User {
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      name: firebaseUser.displayName || fallbackName || 'User',
      joinedAt: Date.now(), // Firebase metadata has creationTime but it's a string
    };
  },

  // Helper to migrate guest data to new user account
  migrateGuestData(userId: string) {
    const guestProgress = localStorage.getItem('codetocoder_progress');
    const guestPractice = localStorage.getItem('codetocoder_practice_progress');
    const guestFiles = localStorage.getItem('codetocoder_playground_files');

    if (guestProgress) localStorage.setItem(`codetocoder_progress_${userId} `, guestProgress);
    if (guestPractice) localStorage.setItem(`codetocoder_practice_progress_${userId} `, guestPractice);
    if (guestFiles) localStorage.setItem(`codetocoder_playground_files_${userId} `, guestFiles);
  }
};


import { User } from '../types';

const USERS_KEY = 'codetocoder_users';
const SESSION_KEY = 'codetocoder_session';

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  async login(email: string, password: string): Promise<User> {
    await delay(800);
    
    const usersStr = localStorage.getItem(USERS_KEY);
    const users: Record<string, any> = usersStr ? JSON.parse(usersStr) : {};
    
    // Simple lookup (In reality, verify hashed password)
    const user = Object.values(users).find((u: any) => u.email === email && u.password === password) as User | undefined;
    
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    localStorage.setItem(SESSION_KEY, user.id);
    return user;
  },

  async register(email: string, password: string, name: string): Promise<User> {
    await delay(800);

    const usersStr = localStorage.getItem(USERS_KEY);
    const users: Record<string, any> = usersStr ? JSON.parse(usersStr) : {};

    if (Object.values(users).some((u: any) => u.email === email)) {
      throw new Error('User already exists');
    }

    const newUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email,
      name,
      password, // In a real app, never store plain text passwords!
      joinedAt: Date.now()
    };

    users[newUser.id] = newUser;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(SESSION_KEY, newUser.id);

    // Return safe user object
    const { password: _, ...safeUser } = newUser;
    return safeUser;
  },

  async logout(): Promise<void> {
    await delay(400);
    localStorage.removeItem(SESSION_KEY);
  },

  async getCurrentUser(): Promise<User | null> {
    const userId = localStorage.getItem(SESSION_KEY);
    if (!userId) return null;

    const usersStr = localStorage.getItem(USERS_KEY);
    const users: Record<string, any> = usersStr ? JSON.parse(usersStr) : {};
    
    const user = users[userId];
    if (!user) return null;

    const { password: _, ...safeUser } = user;
    return safeUser;
  },
  
  // Helper to migrate guest data to new user account
  migrateGuestData(userId: string) {
      const guestProgress = localStorage.getItem('codetocoder_progress');
      const guestPractice = localStorage.getItem('codetocoder_practice_progress');
      const guestFiles = localStorage.getItem('codetocoder_playground_files');
      
      if (guestProgress) localStorage.setItem(`codetocoder_progress_${userId}`, guestProgress);
      if (guestPractice) localStorage.setItem(`codetocoder_practice_progress_${userId}`, guestPractice);
      if (guestFiles) localStorage.setItem(`codetocoder_playground_files_${userId}`, guestFiles);
  }
};

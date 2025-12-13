import { initializeApp } from 'firebase/app';
// import other services you'll use, like getAuth
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Fallback to import.meta.env for local development
const env = (window as any).env || import.meta.env;

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: "code2coder-a324f.firebaseapp.com",
    projectId: "code2coder-a324f",
    storageBucket: "code2coder-a324f.firebasestorage.app",
    messagingSenderId: "875613254710",
    appId: "1:875613254710:web:7f7bee6ca4ceea20835497",
    measurementId: "G-XS427VJBC5"
};


// Initialize Firebase
if (!firebaseConfig.apiKey) {
    console.error("Firebase API Key is missing! Make sure VITE_FIREBASE_API_KEY is set in .env");
}
console.log(`[Firebase] Initializing with hostname: ${window.location.hostname}`);
console.log(`[Firebase] API Key present: ${!!firebaseConfig.apiKey}`);

const app = initializeApp(firebaseConfig);

// Export the initialized services you need
// Export the initialized services you need
export const auth = getAuth(app);

// Initialize Firestore with specific settings for COOP/COEP compatibility
// standard getFirestore(app) can fail in isolated environments
import { initializeFirestore } from 'firebase/firestore';

export const db = initializeFirestore(app, {});

// Initialize analytics with error handling
let analytics: any;
try {
    analytics = getAnalytics(app);
} catch (error) {
    console.warn('Analytics initialization failed (non-critical):', error);
    // Create a dummy analytics object to prevent crashes
    analytics = {
        app: null
    };
}

export { analytics };
export const googleProvider = new GoogleAuthProvider();
export default app;

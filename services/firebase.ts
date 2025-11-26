import { initializeApp } from 'firebase/app';
// import other services you'll use, like getAuth
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBmr2cMMB_6UsmewYnVOxzW3-UahsbIVWI",
    authDomain: "code2coder-a324f.firebaseapp.com",
    projectId: "code2coder-a324f",
    storageBucket: "code2coder-a324f.firebasestorage.app",
    messagingSenderId: "875613254710",
    appId: "1:875613254710:web:7f7bee6ca4ceea20835497",
    measurementId: "G-XS427VJBC5"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the initialized services you need
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
export default app;

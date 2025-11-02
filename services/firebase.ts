import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Fix: Remove redundant global declaration. The global `Window.APP_CONFIG` type
// is now centrally managed in `types.ts` to prevent type conflicts.

// Configuration is sourced from the global window object for static site compatibility.
const firebaseConfig = {
  apiKey: window.APP_CONFIG?.FIREBASE_API_KEY,
  authDomain: window.APP_CONFIG?.FIREBASE_AUTH_DOMAIN,
  projectId: window.APP_CONFIG?.FIREBASE_PROJECT_ID,
  storageBucket: window.APP_CONFIG?.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: window.APP_CONFIG?.FIREBASE_MESSAGING_SENDER_ID,
  appId: window.APP_CONFIG?.FIREBASE_APP_ID,
};


let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let provider: GoogleAuthProvider | null = null;

const firebaseInitialized = 
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId;

if (firebaseInitialized) {
    try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        provider = new GoogleAuthProvider();

        provider.setCustomParameters({
        prompt: 'select_account'
        });
    } catch (error) {
        console.error("Firebase initialization failed:", error);
    }
} else {
    console.warn("Firebase configuration is missing or incomplete from window.APP_CONFIG. Cloud features will be disabled. Make sure config.js is present and correctly configured.");
}


export { app, auth, db, provider };
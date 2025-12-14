import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Fix: Remove redundant global declaration. The global `Window.APP_CONFIG` type
// is now centrally managed in `types.ts` to prevent type conflicts.

// Export mutable bindings that will be initialized later.
export let app: FirebaseApp | null = null;
export let auth: Auth | null = null;
export let db: Firestore | null = null;
export let provider: GoogleAuthProvider | null = null;

let isInitialized = false;

// This function is now called from index.tsx to ensure config.js has loaded.
export function initializeFirebase() {
    if (isInitialized) {
        return;
    }
    isInitialized = true;

    // Configuration is sourced from the global window object for static site compatibility.
    const firebaseConfig = {
      apiKey: window.APP_CONFIG?.FIREBASE_API_KEY,
      authDomain: window.APP_CONFIG?.FIREBASE_AUTH_DOMAIN,
      projectId: window.APP_CONFIG?.FIREBASE_PROJECT_ID,
      storageBucket: window.APP_CONFIG?.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: window.APP_CONFIG?.FIREBASE_MESSAGING_SENDER_ID,
      appId: window.APP_CONFIG?.FIREBASE_APP_ID,
    };


    const firebaseConfigured = 
        firebaseConfig.apiKey &&
        firebaseConfig.authDomain &&
        firebaseConfig.projectId;

    // Added for debugging: Log the config being used (without sensitive keys).
    console.log("Reading Firebase config...", {
        apiKey: firebaseConfig.apiKey ? 'Exists' : 'Missing',
        authDomain: firebaseConfig.authDomain,
        projectId: firebaseConfig.projectId,
    });


    if (firebaseConfigured) {
        try {
            app = initializeApp(firebaseConfig);
            auth = getAuth(app);
            db = getFirestore(app);
            provider = new GoogleAuthProvider();

            provider.setCustomParameters({
            prompt: 'select_account'
            });
            console.log("Firebase initialized successfully.");
        } catch (error) {
            console.error("Firebase initialization failed:", error);
            alert(`Firebase initialization failed, so cloud sync is disabled. This usually means the API keys in your config.js file are incorrect or the Firebase project is not set up properly. Please double-check your keys. Error: ${error instanceof Error ? error.message : String(error)}`);
        }
    } else {
        console.warn("Firebase configuration is missing or incomplete from window.APP_CONFIG. Cloud features will be disabled.");
        // Provide a more specific alert to the user.
        if (!window.APP_CONFIG) {
            alert("Firebase configuration not found (window.APP_CONFIG is missing). Cloud sync is disabled. Please ensure the 'config.js' file is being loaded correctly by your browser.");
        } else {
            alert("One or more required Firebase keys (FIREBASE_API_KEY, FIREBASE_AUTH_DOMAIN, FIREBASE_PROJECT_ID) are missing from your 'config.js' file. Cloud sync is disabled.");
        }
    }
}

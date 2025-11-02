import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Configuration from your Firebase project.
const firebaseConfig = {
  apiKey: "AIzaSyADVyFF14gRrosfm-1q0MossDEDHqmp2bY",
  authDomain: "gen-lang-client-0685540237.firebaseapp.com",
  projectId: "gen-lang-client-0685540237",
  storageBucket: "gen-lang-client-0685540237.firebasestorage.app",
  messagingSenderId: "767354582197",
  appId: "1:767354582197:web:2921f73e9a59e89f4b7afc"
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
    console.warn("Firebase configuration is missing or incomplete. Cloud features will be disabled. Please provide your Firebase project config in services/firebase.ts.");
}


export { app, auth, db, provider };
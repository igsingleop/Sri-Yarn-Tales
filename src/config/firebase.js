import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  signInAnonymously
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration: reads from environment variables (.env / deployment settings) with client project identifiers
// Web client identifiers connect the app to Firebase project 'sri-yarn-tales' across all devices and live deployments
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCS2M9m-FNllH0rtQ6nlT4vk_NZya2mpdc",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "sri-yarn-tales.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "sri-yarn-tales",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "sri-yarn-tales.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "386897098606",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:386897098606:web:9ed5eec20410c4ee28f37f",
};

// Check if actual configuration has been provided
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== "your-api-key-here" &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== "your-project-id"
);

// Initialize Firebase safely
let app = null;
let auth = null;
let db = null;
let storage = null;
let googleProvider = null;

if (isFirebaseConfigured) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    // Initialize Firestore & Storage safely
    try {
      db = getFirestore(app);
    } catch (dbErr) {
      console.warn("Firestore init warning:", dbErr);
    }
    try {
      storage = getStorage(app);
    } catch (stErr) {
      console.warn("Storage init warning:", stErr);
    }
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: "select_account" });

    // Enable anonymous authentication so every mobile device on any cellular network/IP has authorized read/write access
    if (typeof window !== "undefined" && auth && !auth.currentUser) {
      signInAnonymously(auth).catch((authErr) => {
        // Non-blocking notice; Firestore rules can also allow public read
        console.warn("Anonymous session notice:", authErr.message);
      });
    }
  } catch (error) {
    console.warn("Firebase initialization error:", error);
  }
}

/**
 * Trigger Google Sign-In with Popup
 * Returns standardized user object
 */
export async function signInWithGoogle() {
  if (!isFirebaseConfigured || !auth || !googleProvider) {
    return {
      success: false,
      isConfigured: false,
      error: "Firebase credentials not yet configured. Please add your credentials in .env file.",
    };
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    return {
      success: true,
      isConfigured: true,
      user: {
        uid: user.uid,
        name: user.displayName || user.email?.split("@")[0] || "Google User",
        email: user.email,
        avatar: user.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop",
      },
    };
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    return {
      success: false,
      isConfigured: true,
      error: error.message || "Failed to sign in with Google.",
    };
  }
}

export async function signOutFromFirebase() {
  if (auth) {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.warn("Firebase signOut error", e);
    }
  }
}

export { app, auth, db, storage, googleProvider };

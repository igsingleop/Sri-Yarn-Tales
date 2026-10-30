import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut
} from "firebase/auth";

// Read Firebase configuration from Vite environment variables (.env)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
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
let googleProvider = null;

if (isFirebaseConfigured) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: "select_account" });
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

export { app, auth, googleProvider };

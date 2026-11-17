import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signOut as firebaseSignOut
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
  } catch (error) {
    console.warn("Firebase initialization error:", error);
  }
}

/**
 * Trigger Google Sign-In with automatic popup-to-redirect fallback
 * Returns standardized user object or initiates redirect
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
    console.warn("Google Sign-In Notice:", error.code, error.message);

    // If popup was blocked by browser or ad blocker, seamlessly redirect
    if (error.code === "auth/popup-blocked" || error.code === "auth/cancelled-popup-request") {
      try {
        await signInWithRedirect(auth, googleProvider);
        return {
          success: false,
          redirecting: true,
          message: "Popup blocked by browser. Redirecting directly to Google Sign-In...",
        };
      } catch (redirectError) {
        console.error("Redirect Sign-In Error:", redirectError);
        return {
          success: false,
          error: "Browser blocked popup and redirect failed. Please allow popups or add sri-yarn-tales.vercel.app to Firebase Console Authorized Domains.",
        };
      }
    }

    if (error.code === "auth/unauthorized-domain") {
      return {
        success: false,
        error: "Domain not authorized. Please add 'sri-yarn-tales.vercel.app' in Firebase Console > Authentication > Settings > Authorized domains.",
      };
    }

    if (error.code === "auth/popup-closed-by-user") {
      return {
        success: false,
        error: "Sign-in was closed before completing. Please try again.",
      };
    }

    return {
      success: false,
      isConfigured: true,
      error: error.message || "Failed to sign in with Google.",
    };
  }
}

/**
 * Subscribe to Firebase Auth state changes
 * Automatically triggers whenever user signs in via redirect, popup, or session restore
 */
export function onAuthChange(callback) {
  if (!auth) return () => {};
  return onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser && !firebaseUser.isAnonymous) {
      callback({
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Valued Customer",
        email: firebaseUser.email,
        avatar: firebaseUser.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop",
      });
    } else {
      callback(null);
    }
  });
}

/**
 * Handle incoming Google redirect result on page load
 */
export async function checkGoogleRedirectResult() {
  if (!auth) return null;
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      const user = result.user;
      return {
        success: true,
        user: {
          uid: user.uid,
          name: user.displayName || user.email?.split("@")[0] || "Google User",
          email: user.email,
          avatar: user.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop",
        },
      };
    }
    // If user is already authenticated in current session
    if (auth.currentUser && !auth.currentUser.isAnonymous) {
      const user = auth.currentUser;
      return {
        success: true,
        user: {
          uid: user.uid,
          name: user.displayName || user.email?.split("@")[0] || "Google User",
          email: user.email,
          avatar: user.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop",
        },
      };
    }
  } catch (err) {
    console.warn("Redirect auth check notice:", err.message);
    return {
      success: false,
      error: err.code === "auth/unauthorized-domain"
        ? "Domain not authorized. Please add sri-yarn-tales.vercel.app to Firebase Console Authorized Domains."
        : err.message,
    };
  }
  return null;
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

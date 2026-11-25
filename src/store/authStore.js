import { create } from "zustand";
import { persist } from "zustand/middleware";
import { signOutFromFirebase } from "../config/firebase";
import { broadcastSync } from "./sync";

const ADMIN_IDENTIFIERS = [
  "admin",
  "admin@sriyarn.com",
  "admin@sriyarnandtales.com",
  "admin@quaders.studio",
  "deepaksamu77@gmail.com",
];

const VALID_ADMIN_PASSWORDS = [
  "admin",
  "admin123",
  "admin@123",
  "password123",
  "quaders",
  "quaders123",
  "quaders@123",
];

// Clean initialization of auth state from localStorage
if (typeof window !== "undefined") {
  try {
    const raw = window.localStorage.getItem("syt-auth");
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure user and adminUser are always kept in sync
      if (parsed?.state?.adminUser && !parsed?.state?.user) {
        parsed.state.user = parsed.state.adminUser;
        window.localStorage.setItem("syt-auth", JSON.stringify(parsed));
      } else if (parsed?.state?.user?.role === "admin" && !parsed?.state?.adminUser) {
        parsed.state.adminUser = parsed.state.user;
        window.localStorage.setItem("syt-auth", JSON.stringify(parsed));
      }
    }
  } catch (_e) {
    // ignore
  }
}

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // Storefront Customer profile: strictly null by default (logged out)
      user: null,

      // Admin Console session: separate session for /admin portal
      adminUser: null,

      // Customer / General Login
      login: (identifier = "", password = "") => {
        const idLower = (identifier || "").trim().toLowerCase();
        const passTrimmed = (password || "").trim();
        const passLower = passTrimmed.toLowerCase();

        if (!idLower) {
          return { success: false, error: "Please provide a username or email." };
        }

        const isAdminIdentifier =
          ADMIN_IDENTIFIERS.includes(idLower) ||
          idLower === "admin" ||
          idLower.includes("admin@");

        // Check if attempting admin login
        if (isAdminIdentifier) {
          const isPasswordValid =
            VALID_ADMIN_PASSWORDS.includes(passLower) ||
            passLower === "admin123" ||
            passLower === "admin" ||
            passLower.includes("admin") ||
            passLower.includes("quaders") ||
            passTrimmed.length >= 6; // Allow custom studio admin passwords

          if (!isPasswordValid && passTrimmed !== "") {
            return {
              success: false,
              role: "unauthorized",
              error: "Invalid admin password. Please check your credentials.",
            };
          }

          const adminUser = {
            name: "Admin Manager",
            username: idLower.includes("@") ? idLower.split("@")[0] : "admin",
            email: idLower.includes("@") ? idLower : "admin@sriyarnandtales.com",
            role: "admin",
            avatar:
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop",
            provider: "credentials",
            loggedInAt: Date.now(),
          };

          // Store in both adminUser and user so every view sees the active session
          set({ adminUser, user: adminUser });
          broadcastSync("SYNC_ADMIN_AUTH", adminUser);
          broadcastSync("SYNC_AUTH", adminUser);
          return { success: true, role: "admin", adminUser, user: adminUser };
        }

        // Regular customer login: ONLY sets customer profile 'user'
        const customerUser = {
          name: identifier.includes("@")
            ? identifier
                .split("@")[0]
                .replace(/[._-]/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase())
            : identifier,
          username: identifier,
          email: identifier.includes("@")
            ? identifier
            : `${identifier}@example.com`,
          role: "user",
          avatar:
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=faces",
          provider: "credentials",
          loggedInAt: Date.now(),
        };

        set({ user: customerUser });
        broadcastSync("SYNC_AUTH", customerUser);
        return { success: true, role: "user", user: customerUser };
      },

      // Admin portal login dedicated method
      loginAdmin: (username = "", password = "") => {
        const u = (username || "").trim().toLowerCase();
        const p = (password || "").trim().toLowerCase();

        const isValidUser =
          ADMIN_IDENTIFIERS.includes(u) || u === "admin" || u.includes("admin@");
        const isValidPass =
          VALID_ADMIN_PASSWORDS.includes(p) || p === "admin123" || p === "admin";

        if (isValidUser && isValidPass) {
          const adminUser = {
            name: "Admin Manager",
            username: "admin",
            email: "admin@sriyarnandtales.com",
            role: "admin",
            avatar:
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop",
            provider: "credentials",
            loggedInAt: Date.now(),
          };
          set({ adminUser, user: adminUser });
          broadcastSync("SYNC_ADMIN_AUTH", adminUser);
          broadcastSync("SYNC_AUTH", adminUser);
          return { success: true, role: "admin", adminUser, user: adminUser };
        }

        return {
          success: false,
          error: "Invalid administrator credentials. Please check your username and password.",
        };
      },

      logoutAdmin: () => {
        try {
          signOutFromFirebase();
        } catch (_e) {
          // ignore offline/uninitialized signOut
        }
        set({ adminUser: null, user: null });
        broadcastSync("SYNC_ADMIN_AUTH", null);
        broadcastSync("SYNC_AUTH", null);
      },

      loginAsAdminDemo: () => {
        const adminUser = {
          name: "Admin Manager",
          username: "admin",
          email: "admin@sriyarnandtales.com",
          role: "admin",
          avatar:
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop",
          provider: "credentials",
          loggedInAt: Date.now(),
        };
        set({ adminUser, user: adminUser });
        broadcastSync("SYNC_ADMIN_AUTH", adminUser);
        broadcastSync("SYNC_AUTH", adminUser);
        return { success: true, role: "admin", adminUser, user: adminUser };
      },

      // Google Sign-In: Authenticates user, promotes to admin if admin email matches
      loginWithGoogleUser: (googleUser) => {
        const emailLower = (googleUser.email || "").toLowerCase().trim();
        const isAdminEmail =
          ADMIN_IDENTIFIERS.includes(emailLower) ||
          emailLower.startsWith("admin@") ||
          emailLower === "deepaksamu77@gmail.com";

        const user = {
          name: googleUser.name || "Google User",
          username: googleUser.email
            ? googleUser.email.split("@")[0]
            : "google_user",
          email: googleUser.email || "user@gmail.com",
          role: isAdminEmail ? "admin" : "user",
          avatar:
            googleUser.avatar ||
            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop",
          provider: "google",
          uid: googleUser.uid || `google-${Date.now()}`,
          loggedInAt: Date.now(),
        };

        if (isAdminEmail) {
          const adminUser = {
            ...user,
            role: "admin",
          };
          set({ adminUser, user });
          broadcastSync("SYNC_ADMIN_AUTH", adminUser);
          broadcastSync("SYNC_AUTH", user);
          return { success: true, role: "admin", user, adminUser };
        }

        set({ user });
        broadcastSync("SYNC_AUTH", user);
        return { success: true, role: "user", user };
      },

      // Storefront Customer Sign-Out
      logout: () => {
        try {
          signOutFromFirebase();
        } catch (_e) {
          // ignore offline/uninitialized signOut
        }
        set({ user: null, adminUser: null });
        broadcastSync("SYNC_AUTH", null);
        broadcastSync("SYNC_ADMIN_AUTH", null);
      },

      isAdmin: () => Boolean(get().adminUser || get().user?.role === "admin"),
    }),
    {
      name: "syt-auth",
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Ensure user and adminUser are always kept in sync on page load/rehydrate
          if (state.adminUser && !state.user) {
            state.user = state.adminUser;
          } else if (state.user?.role === "admin" && !state.adminUser) {
            state.adminUser = state.user;
          }
        }
      },
    }
  )
);

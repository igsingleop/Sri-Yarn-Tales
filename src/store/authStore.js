import { create } from "zustand";
import { persist } from "zustand/middleware";
import { signOutFromFirebase } from "../config/firebase";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,

      login: (identifier = "", password = "") => {
        const idLower = identifier.trim().toLowerCase();
        const passLower = (password || "").trim().toLowerCase();

        // Check if admin login
        const isAdmin =
          idLower === "admin" ||
          idLower === "admin@sriyarn.com" ||
          idLower === "admin@sriyarnandtales.com" ||
          idLower.includes("admin") ||
          passLower === "admin" ||
          passLower === "admin123";

        if (isAdmin) {
          const adminUser = {
            name: "Admin Manager",
            username: "admin",
            email: "admin@sriyarnandtales.com",
            role: "admin",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop",
            provider: "credentials",
            loggedInAt: Date.now(),
          };
          set({ user: adminUser });
          return { success: true, role: "admin", user: adminUser };
        }

        // Regular customer login
        const customerUser = {
          name: identifier.includes("@")
            ? identifier.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
            : identifier || "Priya Krishnamurthy",
          username: identifier || "priya",
          email: identifier.includes("@") ? identifier : `${identifier || "priya"}@example.com`,
          role: "user",
          avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=faces",
          provider: "credentials",
          loggedInAt: Date.now(),
        };
        set({ user: customerUser });
        return { success: true, role: "user", user: customerUser };
      },

      loginWithGoogleUser: (googleUser) => {
        const emailLower = (googleUser.email || "").toLowerCase();
        const isAdmin =
          emailLower === "admin@sriyarn.com" ||
          emailLower === "admin@sriyarnandtales.com" ||
          emailLower.includes("admin");

        const user = {
          name: googleUser.name || "Google User",
          username: googleUser.email ? googleUser.email.split("@")[0] : "google_user",
          email: googleUser.email || "user@gmail.com",
          role: isAdmin ? "admin" : "user",
          avatar:
            googleUser.avatar ||
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop",
          provider: "google",
          uid: googleUser.uid || `google-${Date.now()}`,
          loggedInAt: Date.now(),
        };

        set({ user });
        return { success: true, role: user.role, user };
      },

      logout: () => {
        try {
          signOutFromFirebase();
        } catch (e) {
          // ignore offline/uninitialized signOut
        }
        set({ user: null });
      },

      isAdmin: () => get().user?.role === "admin",
    }),
    {
      name: "syt-auth",
    }
  )
);

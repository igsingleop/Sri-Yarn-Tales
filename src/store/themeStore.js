import { create } from "zustand";
import { persist } from "zustand/middleware";

const applyThemeToDocument = (theme) => {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-color-scheme: dark)").matches);

  if (isDark) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }

  // Update theme-color meta tag
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute("content", isDark ? "#09090b" : "#ffffff");
  }
};

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: "light", // 'light' | 'dark'

      setTheme: (theme) => {
        set({ theme });
        applyThemeToDocument(theme);
      },

      toggleTheme: () => {
        const next = get().theme === "dark" ? "light" : "dark";
        set({ theme: next });
        applyThemeToDocument(next);
      },
    }),
    {
      name: "syt-theme",
      onRehydrateStorage: () => (state) => {
        if (state?.theme) {
          applyThemeToDocument(state.theme);
        }
      },
    }
  )
);

// Listener for system preference changes (if user chooses system mode in future)
if (typeof window !== "undefined" && window.matchMedia) {
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      const current = useThemeStore.getState().theme;
      if (current === "system") {
        applyThemeToDocument(e.matches ? "dark" : "light");
      }
    });
}

import { create } from "zustand";
import { persist } from "zustand/middleware";
import defaultCategories from "../data/categories.json";
import { broadcastSync } from "./sync";

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
}

export const useCategoryStore = create(
  persist(
    (set, get) => ({
      categories: defaultCategories,

      updateCategory: (idOrSlug, updatedFields) => {
        const updatedCategories = get().categories.map((cat) => {
          if (cat.id === idOrSlug || cat.slug === idOrSlug) {
            return { ...cat, ...updatedFields };
          }
          return cat;
        });
        set({ categories: updatedCategories });
        broadcastSync("SYNC_CATEGORIES", updatedCategories);
        return updatedCategories;
      },

      addCategory: (categoryData) => {
        const name = categoryData.name?.trim() || "New Category";
        const baseSlug = slugify(name);
        const id = `cat-${baseSlug}-${Date.now().toString().slice(-4)}`;
        const slug = categoryData.slug?.trim() || baseSlug;

        const newCat = {
          id,
          slug,
          name,
          description: categoryData.description || "Handcrafted crochet creations made with love.",
          image: categoryData.image || "https://images.unsplash.com/photo-1584589167171-541ce45f1eea?w=600&h=600&fit=crop",
          emoji: categoryData.emoji || "✨",
          count: 0,
        };

        const updatedCategories = [...get().categories, newCat];
        set({ categories: updatedCategories });
        broadcastSync("SYNC_CATEGORIES", updatedCategories);
        return newCat;
      },

      deleteCategory: (idOrSlug) => {
        const updatedCategories = get().categories.filter(
          (c) => c.id !== idOrSlug && c.slug !== idOrSlug
        );
        set({ categories: updatedCategories });
        broadcastSync("SYNC_CATEGORIES", updatedCategories);
      },

      setAllCategories: (categoriesList) => {
        set({ categories: categoriesList });
        broadcastSync("SYNC_CATEGORIES", categoriesList);
      },

      resetCategories: () => {
        set({ categories: defaultCategories });
        broadcastSync("SYNC_CATEGORIES", defaultCategories);
      },
    }),
    {
      name: "syt-custom-categories",
      // Migrate any previously saved broken home-decor image in localStorage
      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray(state.categories)) {
          state.categories = state.categories.map((cat) => {
            if (cat.slug === "home-decor" && cat.image?.includes("photo-1568760970073-ce3f8af8cb72")) {
              return {
                ...cat,
                image: "https://images.unsplash.com/photo-1584589167171-541ce45f1eea?w=600&h=600&fit=crop",
              };
            }
            return cat;
          });
        }
      },
    }
  )
);


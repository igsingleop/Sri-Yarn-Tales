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
          image: categoryData.image || "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=600&h=600&fit=crop",
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
      version: 0,
      migrate: (s) => s,
      // Clean and migrate any previously saved legacy/non-crochet category images in localStorage
      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray(state.categories)) {
          state.categories = state.categories.map((cat) => {
            if (
              cat.image?.includes("photo-1548036328-c9fa89d128fa") ||
              cat.image?.includes("photo-1558618666-fcd25c85cd64") ||
              cat.image?.includes("photo-1584589167171-541ce45f1eea") ||
              cat.image?.includes("photo-1568760970073-ce3f8af8cb72")
            ) {
              const fallback =
                cat.slug === "amigurumi"
                  ? "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=600&h=600&fit=crop"
                  : cat.slug === "bags"
                  ? "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&h=600&fit=crop"
                  : cat.slug === "home-decor"
                  ? "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&h=600&fit=crop"
                  : cat.slug === "wearables"
                  ? "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&h=600&fit=crop"
                  : cat.slug === "baby"
                  ? "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&h=600&fit=crop"
                  : "https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=600&h=600&fit=crop";
              return { ...cat, image: fallback };
            }
            return cat;
          });
        }
      },
    }
  )
);


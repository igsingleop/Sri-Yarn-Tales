import { create } from "zustand";
import { persist } from "zustand/middleware";
import defaultProducts from "../data/products.json";
import { broadcastSync } from "./sync";
import { sanitizeProducts } from "../services/cloudSync";

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
}

export const useProductStore = create(
  persist(
    (set, get) => ({
      products: defaultProducts,

      addProduct: (productData) => {
        const id = `p-${Date.now()}`;
        const baseSlug = slugify(productData.name || "new-product");
        const slug = `${baseSlug}-${id.slice(-4)}`;

        const newProduct = {
          id,
          slug,
          name: productData.name?.trim() || "Untitled Product",
          category: productData.category || "amigurumi",
          price: Number(productData.price) || 499,
          comparePrice: productData.comparePrice ? Number(productData.comparePrice) : null,
          images: productData.images && productData.images.length > 0 
            ? productData.images 
            : ["https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=600&h=600&fit=crop"],
          colors: productData.colors || ["#D4768A", "#F4D58D", "#8FA98B"],
          colorNames: productData.colorNames || ["Rose Pink", "Butter Yellow", "Sage Green"],
          sizes: productData.sizes || ["Standard"],
          rating: 5.0,
          reviewCount: 0,
          stock: Number(productData.stock) || 10,
          tags: productData.tags || ["handmade", "crochet", "new"],
          isCustomizable: Boolean(productData.isCustomizable),
          isBestseller: Boolean(productData.isBestseller),
          isNew: productData.isNew !== undefined ? Boolean(productData.isNew) : true,
          description: productData.description || "Handcrafted with premium yarn, made with love and precision.",
          materials: productData.materials || "100% premium cotton yarn, hypoallergenic fiberfill",
          care: productData.care || "Gentle hand wash in cold water. Reshape and air dry flat.",
          deliveryDays: productData.deliveryDays || "3-5",
          createdAt: Date.now(),
        };

        const updatedProducts = sanitizeProducts([newProduct, ...get().products]);
        set({ products: updatedProducts });
        broadcastSync("SYNC_PRODUCTS", updatedProducts);

        return newProduct;
      },

      updateProduct: (id, updatedFields) => {
        const targetId = String(id);
        const updatedProducts = sanitizeProducts(
          get().products.map((item) =>
            String(item.id) === targetId ? { ...item, ...updatedFields } : item
          )
        );
        set({ products: updatedProducts });
        broadcastSync("SYNC_PRODUCTS", updatedProducts);
      },

      deleteProduct: (id) => {
        const targetId = String(id);
        const updatedProducts = get().products.filter((item) => String(item.id) !== targetId);
        set({ products: updatedProducts });
        broadcastSync("SYNC_PRODUCTS", updatedProducts);
      },

      deleteMultipleProducts: (ids) => {
        const idSet = new Set((ids || []).map((x) => String(x)));
        const updatedProducts = get().products.filter((item) => !idSet.has(String(item.id)));
        set({ products: updatedProducts });
        broadcastSync("SYNC_PRODUCTS", updatedProducts);
      },

      addMultipleProducts: (productsList) => {
        const newItems = productsList.map((p, index) => {
          const id = `p-${Date.now()}-${index}`;
          const baseSlug = slugify(p.name || `bulk-item-${index}`);
          const slug = `${baseSlug}-${id.slice(-6)}`;
          return {
            id,
            slug,
            name: p.name?.trim() || "Untitled Product",
            category: p.category || "amigurumi",
            price: Number(p.price) || 499,
            comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
            images: Array.isArray(p.images) && p.images.length > 0
              ? p.images
              : [p.imageUrl || "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=600&h=600&fit=crop"],
            colors: p.colors || ["#D4768A", "#F4D58D", "#8FA98B"],
            colorNames: p.colorNames || ["Rose Pink", "Butter Yellow", "Sage Green"],
            sizes: p.sizes || ["Standard"],
            rating: p.rating ? Number(p.rating) : 5.0,
            reviewCount: p.reviewCount ? Number(p.reviewCount) : 0,
            stock: p.stock !== undefined ? Number(p.stock) : 10,
            tags: Array.isArray(p.tags)
              ? p.tags
              : (typeof p.tags === "string" ? p.tags.split(";").map(t => t.trim()) : ["handmade", "crochet"]),
            isCustomizable: Boolean(p.isCustomizable),
            isBestseller: Boolean(p.isBestseller),
            isNew: p.isNew !== undefined ? Boolean(p.isNew) : true,
            description: p.description || "Handcrafted with premium soft yarn, made with love and precision.",
            materials: p.materials || "100% premium cotton yarn, hypoallergenic fiberfill",
            care: p.care || "Gentle hand wash in cold water. Reshape and air dry flat.",
            deliveryDays: p.deliveryDays || "3-5",
            createdAt: Date.now() + index,
          };
        });

        const updatedProducts = sanitizeProducts([...newItems, ...get().products]);
        set({ products: updatedProducts });
        broadcastSync("SYNC_PRODUCTS", updatedProducts);
        return newItems;
      },

      resetProducts: () => {
        const clean = sanitizeProducts(defaultProducts);
        set({ products: clean });
        broadcastSync("SYNC_PRODUCTS", clean);
      },
    }),
    {
      name: "syt-custom-products",
      version: 0,
      migrate: (persistedState) => {
        if (persistedState && typeof persistedState === "object" && Array.isArray(persistedState.products)) {
          return persistedState;
        }
        return persistedState;
      },
      onRehydrateStorage: () => (state) => {
        if (state?.products && Array.isArray(state.products)) {
          state.products = sanitizeProducts(
            state.products.map((item) => {
              if (item?.images && Array.isArray(item.images)) {
                item.images = item.images.map((img) => {
                  if (!img || img.includes("photo-1591781696001-67e57f2dc052")) {
                    return "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&h=600&fit=crop";
                  }
                  if (img.includes("photo-1558618666-fcd25c85cd64") || (item.slug?.includes("bunny") && img.includes("photo-1584589167171-541ce45f1eea"))) {
                    return "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=600&h=600&fit=crop";
                  }
                  if (img.includes("photo-1548036328-c9fa89d128fa") || img.includes("photo-1590874103328-eac38a683ce7")) {
                    return "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&h=600&fit=crop";
                  }
                  if (img.includes("photo-1622560480605-d83c853bc5c3")) {
                    return "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&h=600&fit=crop";
                  }
                  if (img.includes("photo-1598300042247-d088f8ab3a91")) {
                    return "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&h=600&fit=crop";
                  }
                  if (img.includes("photo-1578587018452-892bacefd3f2")) {
                    return "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=600&h=600&fit=crop";
                  }
                  if (img.includes("photo-1520903920243-00d872a2d1c9")) {
                    return "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=600&h=600&fit=crop";
                  }
                  if (img.includes("photo-1568760970073-ce3f8af8cb72") || img.includes("photo-1555041469-a586c61ea9bc")) {
                    return "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&h=600&fit=crop";
                  }
                  return img;
                });
              }
              return item;
            })
          );
        }
      },
    }
  )
);

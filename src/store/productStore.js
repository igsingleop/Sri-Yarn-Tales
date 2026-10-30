import { create } from "zustand";
import { persist } from "zustand/middleware";
import defaultProducts from "../data/products.json";
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
          name: productData.name || "Untitled Product",
          category: productData.category || "amigurumi",
          price: Number(productData.price) || 499,
          comparePrice: productData.comparePrice ? Number(productData.comparePrice) : null,
          images: productData.images && productData.images.length > 0 
            ? productData.images 
            : ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop"],
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

        const updatedProducts = [newProduct, ...get().products];
        set({ products: updatedProducts });
        broadcastSync("SYNC_PRODUCTS", updatedProducts);

        return newProduct;
      },

      updateProduct: (id, updatedFields) => {
        const updatedProducts = get().products.map((item) =>
          item.id === id ? { ...item, ...updatedFields } : item
        );
        set({ products: updatedProducts });
        broadcastSync("SYNC_PRODUCTS", updatedProducts);
      },

      deleteProduct: (id) => {
        const updatedProducts = get().products.filter((item) => item.id !== id);
        set({ products: updatedProducts });
        broadcastSync("SYNC_PRODUCTS", updatedProducts);
      },

      deleteMultipleProducts: (ids) => {
        const idSet = new Set(ids);
        const updatedProducts = get().products.filter((item) => !idSet.has(item.id));
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
            name: p.name || "Untitled Product",
            category: p.category || "amigurumi",
            price: Number(p.price) || 499,
            comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
            images: Array.isArray(p.images) && p.images.length > 0
              ? p.images
              : [p.imageUrl || "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop"],
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

        const updatedProducts = [...newItems, ...get().products];
        set({ products: updatedProducts });
        broadcastSync("SYNC_PRODUCTS", updatedProducts);
        return newItems;
      },

      resetProducts: () => {
        set({ products: defaultProducts });
        broadcastSync("SYNC_PRODUCTS", defaultProducts);
      },
    }),
    {
      name: "syt-custom-products",
    }
  )
);

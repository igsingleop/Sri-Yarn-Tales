import { create } from "zustand";
import { persist } from "zustand/middleware";
import defaultProducts from "../data/products.json";

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

        set((state) => ({
          products: [newProduct, ...state.products],
        }));

        return newProduct;
      },

      updateProduct: (id, updatedFields) => {
        set((state) => ({
          products: state.products.map((item) =>
            item.id === id ? { ...item, ...updatedFields } : item
          ),
        }));
      },

      deleteProduct: (id) => {
        set((state) => ({
          products: state.products.filter((item) => item.id !== id),
        }));
      },

      resetProducts: () => {
        set({ products: defaultProducts });
      },
    }),
    {
      name: "syt-custom-products",
    }
  )
);

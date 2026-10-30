import defaultProducts from "../data/products.json";
import reviewsData from "../data/reviews.json";
import categoriesData from "../data/categories.json";
import { useProductStore } from "../store/productStore";

// Simulate network latency
const delay = (ms = 200) => new Promise((res) => setTimeout(res, ms));

// Get current live products (from persistent store or fallback to JSON)
export const getCurrentProducts = () => {
  try {
    const storeProducts = useProductStore?.getState?.()?.products;
    if (storeProducts && Array.isArray(storeProducts) && storeProducts.length > 0) {
      return [...storeProducts];
    }
  } catch {
    // fallback
  }
  return [...defaultProducts];
};

// ---- Products ----
export const getProducts = async (filters = {}) => {
  await delay();
  let products = getCurrentProducts();

  if (filters.category) {
    products = products.filter((p) => p.category === filters.category);
  }
  if (filters.minPrice !== undefined) {
    products = products.filter((p) => p.price >= filters.minPrice);
  }
  if (filters.maxPrice !== undefined) {
    products = products.filter((p) => p.price <= filters.maxPrice);
  }
  if (filters.rating) {
    products = products.filter((p) => p.rating >= filters.rating);
  }
  if (filters.colors && filters.colors.length > 0) {
    products = products.filter((p) =>
      p.colorNames.some((c) =>
        filters.colors.map((fc) => fc.toLowerCase()).includes(c.toLowerCase())
      )
    );
  }
  if (filters.isCustomizable !== undefined) {
    products = products.filter(
      (p) => p.isCustomizable === filters.isCustomizable
    );
  }
  if (filters.inStock) {
    products = products.filter((p) => p.stock > 0);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q)
    );
  }

  // Sorting
  if (filters.sort) {
    switch (filters.sort) {
      case "newest":
        products = products.filter((p) => p.isNew).concat(products.filter((p) => !p.isNew));
        break;
      case "price-asc":
        products.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        products.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        products.sort((a, b) => b.rating - a.rating);
        break;
      case "bestsellers":
        products = products.filter((p) => p.isBestseller).concat(products.filter((p) => !p.isBestseller));
        break;
      default:
        break;
    }
  }

  return products;
};

export const getProductBySlug = async (slug) => {
  await delay();
  return getCurrentProducts().find((p) => p.slug === slug) || null;
};

export const getProductById = async (id) => {
  await delay(100);
  return getCurrentProducts().find((p) => p.id === id) || null;
};

export const getBestsellers = async (limit = 8) => {
  await delay();
  return getCurrentProducts().filter((p) => p.isBestseller).slice(0, limit);
};

export const getNewArrivals = async (limit = 8) => {
  await delay();
  return getCurrentProducts().filter((p) => p.isNew).slice(0, limit);
};

export const getRelatedProducts = async (productId, category, limit = 4) => {
  await delay(100);
  return getCurrentProducts()
    .filter((p) => p.category === category && p.id !== productId)
    .slice(0, limit);
};

export const searchProducts = async (query) => {
  await delay(150);
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  return getCurrentProducts()
    .filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q)
    )
    .slice(0, 6);
};

// ---- Categories ----
export const getCategories = async () => {
  await delay(50);
  const products = getCurrentProducts();
  return categoriesData.map((cat) => ({
    ...cat,
    count: products.filter((p) => p.category === cat.slug).length,
  }));
};

// ---- Reviews ----
export const getReviewsByProduct = async (productId) => {
  await delay();
  return reviewsData.filter((r) => r.productId === productId);
};

export const getAllReviews = async () => {
  await delay();
  return reviewsData;
};

// ---- Checkout (mock) ----
export const createOrder = async (orderData) => {
  await delay(1500);
  const { generateOrderId } = await import("./utils.js");
  return {
    success: true,
    orderId: generateOrderId(),
    ...orderData,
    status: "confirmed",
    createdAt: new Date().toISOString(),
  };
};

// ---- PIN code check (mock) ----
const pinData = {
  "560001": { city: "Bangalore", state: "Karnataka", days: "2-3" },
  "400001": { city: "Mumbai", state: "Maharashtra", days: "3-4" },
  "110001": { city: "Delhi", state: "Delhi", days: "3-4" },
  "600001": { city: "Chennai", state: "Tamil Nadu", days: "3-5" },
  "500001": { city: "Hyderabad", state: "Telangana", days: "3-4" },
  "700001": { city: "Kolkata", state: "West Bengal", days: "4-6" },
};

export const checkPincode = async (pin) => {
  await delay(800);
  const info = pinData[pin];
  if (info) {
    return { available: true, ...info };
  }
  if (/^\d{6}$/.test(pin)) {
    return { available: true, city: "Your city", state: "India", days: "5-7" };
  }
  return { available: false, error: "Invalid PIN code" };
};

// ---- Coupon validation ----
export const validateCoupon = async (code, subtotal) => {
  await delay(600);
  const coupons = {
    WELCOME10: { discount: 10, type: "percent", minOrder: 0, label: "10% off" },
    FLAT200: { discount: 200, type: "flat", minOrder: 999, label: "₹200 off" },
    HANDMADE15: { discount: 15, type: "percent", minOrder: 1499, label: "15% off on ₹1499+" },
  };
  const coupon = coupons[code.toUpperCase()];
  if (!coupon) return { valid: false, error: "Invalid coupon code" };
  if (subtotal < coupon.minOrder)
    return {
      valid: false,
      error: `Minimum order ₹${coupon.minOrder} required for this coupon`,
    };
  return { valid: true, ...coupon };
};

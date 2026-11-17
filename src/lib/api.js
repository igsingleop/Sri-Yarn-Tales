import defaultProducts from "../data/products.json";
import reviewsData from "../data/reviews.json";
import categoriesData from "../data/categories.json";
import { useProductStore } from "../store/productStore";
import { useCategoryStore } from "../store/categoryStore";

// Instant resolver for client state, with optional delay for operations that simulate network checkout
const delay = (ms = 0) =>
  ms > 0 ? new Promise((res) => setTimeout(res, ms)) : Promise.resolve();

// Get current live categories
export const getCurrentCategories = () => {
  try {
    const storeCategories = useCategoryStore?.getState?.()?.categories;
    if (storeCategories && Array.isArray(storeCategories) && storeCategories.length > 0) {
      return [...storeCategories];
    }
  } catch {
    // fallback
  }
  return [...categoriesData];
};

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
  await delay(0);
  let products = getCurrentProducts();

  if (filters.category) {
    const targetCat = String(filters.category).toLowerCase().trim();
    products = products.filter(
      (p) => String(p.category || "").toLowerCase().trim() === targetCat
    );
  }
  if (filters.minPrice !== undefined && Number(filters.minPrice) > 0) {
    products = products.filter((p) => Number(p.price) >= Number(filters.minPrice));
  }
  if (filters.maxPrice !== undefined && Number(filters.maxPrice) < 5000) {
    products = products.filter((p) => Number(p.price) <= Number(filters.maxPrice));
  }
  if (filters.rating && Number(filters.rating) > 0) {
    products = products.filter((p) => Number(p.rating || 5) >= Number(filters.rating));
  }
  if (filters.colors && Array.isArray(filters.colors) && filters.colors.length > 0) {
    const filterColors = filters.colors.map((fc) => String(fc).toLowerCase());
    products = products.filter((p) =>
      Array.isArray(p.colorNames) &&
      p.colorNames.some((c) => filterColors.includes(String(c).toLowerCase()))
    );
  }
  // ONLY filter if the user turned ON "Customisable Only"
  if (filters.isCustomizable === true) {
    products = products.filter((p) => Boolean(p.isCustomizable));
  }
  // ONLY filter if the user turned ON "In Stock Only"
  if (filters.inStock === true) {
    products = products.filter((p) => Number(p.stock) > 0);
  }
  if (filters.search && typeof filters.search === "string" && filters.search.trim()) {
    const q = filters.search.trim().toLowerCase();
    products = products.filter(
      (p) =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (Array.isArray(p.tags) && p.tags.some((t) => String(t).toLowerCase().includes(q))) ||
        (p.category && p.category.toLowerCase().includes(q))
    );
  }

  // Sorting
  if (filters.sort) {
    switch (filters.sort) {
      case "newest":
        products = [...products].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        break;
      case "price-asc":
        products = [...products].sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case "price-desc":
        products = [...products].sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case "rating":
        products = [...products].sort((a, b) => Number(b.rating || 5) - Number(a.rating || 5));
        break;
      case "bestsellers":
        products = [...products].sort((a, b) => {
          if (Boolean(a.isBestseller) === Boolean(b.isBestseller)) return 0;
          return a.isBestseller ? -1 : 1;
        });
        break;
      default:
        break;
    }
  }

  return products;
};

export const getProductBySlug = async (slug) => {
  await delay(0);
  return getCurrentProducts().find((p) => p.slug === slug) || null;
};

export const getProductById = async (id) => {
  await delay(0);
  return getCurrentProducts().find((p) => p.id === id) || null;
};

export const getBestsellers = async (limit = 8) => {
  await delay(0);
  return getCurrentProducts().filter((p) => p.isBestseller).slice(0, limit);
};

export const getNewArrivals = async (limit = 8) => {
  await delay(0);
  return getCurrentProducts().filter((p) => p.isNew).slice(0, limit);
};

export const getRelatedProducts = async (productId, category, limit = 4) => {
  await delay(0);
  return getCurrentProducts()
    .filter((p) => p.category === category && p.id !== productId)
    .slice(0, limit);
};

export const searchProducts = async (query) => {
  await delay(0);
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
  await delay(0);
  const products = getCurrentProducts();
  const rawCategories = getCurrentCategories();
  return rawCategories.map((cat) => ({
    ...cat,
    count: products.filter(
      (p) => String(p.category || "").toLowerCase().trim() === String(cat.slug || "").toLowerCase().trim()
    ).length,
  }));
};

// ---- Reviews ----
export const getReviewsByProduct = async (productId) => {
  await delay(0);
  return reviewsData.filter((r) => r.productId === productId);
};

export const getAllReviews = async () => {
  await delay(0);
  return reviewsData;
};

// ---- Checkout (mock) ----
export const createOrder = async (orderData) => {
  await delay(1200);
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
  await delay(400);
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
  await delay(300);
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

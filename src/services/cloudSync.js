import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../config/firebase";

// In-memory record of the latest known catalog update timestamp
let lastCloudCatalogTimestamp = 0;

/**
 * Validates, deduplicates, and sanitizes product objects.
 * Prevents junk, corrupted entries, and malformed records from entering the catalog.
 */
export function sanitizeProducts(rawProducts) {
  if (!Array.isArray(rawProducts)) return [];

  const seenIds = new Set();
  const cleaned = [];

  for (const item of rawProducts) {
    if (!item || typeof item !== "object") continue;

    // Must have a valid name and price
    const name = typeof item.name === "string" ? item.name.trim() : "";
    const price = Number(item.price);
    if (!name || isNaN(price) || price <= 0) continue;

    // Generate or normalize ID
    const id = String(item.id || `p-${Date.now()}-${cleaned.length}`);
    if (seenIds.has(id)) continue;
    seenIds.add(id);

    // Clean images array
    let images = Array.isArray(item.images) ? item.images.filter(Boolean) : [];
    if (images.length === 0 && item.imageUrl) {
      images = [item.imageUrl];
    }
    if (images.length === 0) {
      images = ["https://images.unsplash.com/photo-1584589167171-541ce45f1eea?w=600&h=600&fit=crop"];
    }

    // Clean tags
    let tags = Array.isArray(item.tags)
      ? item.tags.map((t) => String(t).trim()).filter(Boolean)
      : typeof item.tags === "string"
      ? item.tags.split(";").map((t) => t.trim()).filter(Boolean)
      : ["handmade", "crochet"];

    // Clean colors & colorNames
    let colors = Array.isArray(item.colors) && item.colors.length > 0
      ? item.colors
      : ["#D4768A", "#F4D58D", "#8FA98B"];

    let colorNames = Array.isArray(item.colorNames) && item.colorNames.length > 0
      ? item.colorNames
      : ["Rose Pink", "Butter Yellow", "Sage Green"];

    let sizes = Array.isArray(item.sizes) && item.sizes.length > 0
      ? item.sizes
      : ["Standard"];

    cleaned.push({
      id,
      slug: String(item.slug || name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "")),
      name,
      category: String(item.category || "amigurumi").toLowerCase().trim(),
      price: Math.round(price),
      comparePrice: item.comparePrice ? Math.round(Number(item.comparePrice)) : null,
      images,
      colors,
      colorNames,
      sizes,
      rating: item.rating ? Number(item.rating) : 5.0,
      reviewCount: item.reviewCount ? Number(item.reviewCount) : 0,
      stock: item.stock !== undefined ? Math.max(0, Number(item.stock)) : 10,
      tags,
      isCustomizable: Boolean(item.isCustomizable),
      isBestseller: Boolean(item.isBestseller),
      isNew: item.isNew !== undefined ? Boolean(item.isNew) : true,
      description: item.description || "Handcrafted with premium soft yarn, made with love and precision.",
      materials: item.materials || "100% premium cotton yarn, hypoallergenic fiberfill",
      care: item.care || "Gentle hand wash in cold water. Reshape and air dry flat.",
      deliveryDays: item.deliveryDays || "3-5",
      createdAt: item.createdAt || Date.now(),
    });
  }

  return cleaned;
}

/**
 * Image compression utility to ensure images upload smoothly and quickly
 */
export function compressImageFile(file, maxWidth = 800, quality = 0.75) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) {
      reject(new Error("Please upload a valid image file (JPG, PNG, WEBP)."));
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => reject(new Error("Failed to load image file."));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.readAsDataURL(file);
  });
}

/**
 * Upload an image to Firebase Storage CDN if available;
 * falls back to compressed base64 data URL if Storage is not permitted.
 */
export async function uploadProductImage(file) {
  if (!file) return null;

  // Try Firebase Storage first
  if (storage && typeof window !== "undefined") {
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const storageRef = ref(storage, `catalog/${Date.now()}-${safeName}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return { url: downloadURL, isCloudStorage: true };
    } catch (stErr) {
      console.warn("Storage upload notice (falling back to optimized data URL):", stErr.message);
    }
  }

  // Fallback to high-efficiency client compression
  const compressed = await compressImageFile(file, 800, 0.75);
  return { url: compressed, isCloudStorage: false };
}

/**
 * Sync all products to Firestore Cloud
 * Ensures instant multi-device reflection on the live site across ALL mobile networks and IPs
 */
export async function syncProductsToCloud(products) {
  const cleanProducts = sanitizeProducts(products);
  const now = Date.now();
  lastCloudCatalogTimestamp = now;

  // Update local storage cache immediately with timestamp
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        "syt-custom-products",
        JSON.stringify({ state: { products: cleanProducts, updatedAt: now }, version: now })
      );
    }
  } catch (_e) {}

  if (!db || typeof window === "undefined") {
    return { success: false, reason: "No cloud database instance available" };
  }

  try {
    const docRef = doc(db, "store", "catalog");
    await setDoc(
      docRef,
      {
        products: cleanProducts,
        updatedAt: now,
        count: cleanProducts.length,
        isLive: true,
      },
      { merge: true }
    );
    return { success: true, count: cleanProducts.length, updatedAt: now };
  } catch (error) {
    console.warn("Firestore syncProducts notice:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Sync Banners to Firestore Cloud
 */
export async function syncBannersToCloud(banners) {
  if (!db || typeof window === "undefined") return { success: false };

  try {
    const docRef = doc(db, "store", "banners");
    await setDoc(docRef, { ...banners, updatedAt: Date.now() }, { merge: true });
    return { success: true };
  } catch (error) {
    console.warn("Firestore syncBanners notice:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Sync Categories to Firestore Cloud
 */
export async function syncCategoriesToCloud(categories) {
  if (!db || typeof window === "undefined" || !Array.isArray(categories)) return { success: false };

  try {
    const docRef = doc(db, "store", "categories");
    await setDoc(docRef, { categories, updatedAt: Date.now() }, { merge: true });
    return { success: true };
  } catch (error) {
    console.warn("Firestore syncCategories notice:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Manually fetch the live catalog from Firestore Cloud (works over standard HTTPS on any IP)
 */
export async function fetchLiveCatalogFromCloud() {
  if (!db || typeof window === "undefined") return null;

  try {
    const docRef = doc(db, "store", "catalog");
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      if (Array.isArray(data?.products) && data.products.length > 0) {
        lastCloudCatalogTimestamp = data.updatedAt || Date.now();
        return {
          products: sanitizeProducts(data.products),
          updatedAt: data.updatedAt || Date.now(),
        };
      }
    }
  } catch (error) {
    console.warn("Firestore fetchLiveCatalog notice:", error.message);
  }
  return null;
}

/**
 * Initialize real-time Cloud Synchronization
 * Connects to Firestore snapshot listeners on all devices with ZERO DELAY!
 * Includes mobile browser resume re-fetching (visibilitychange, focus, online, periodic heartbeat).
 */
export function initLiveCloudSync({ setProducts, setBanners, setCategories, onStatusChange }) {
  if (typeof window === "undefined" || !db) {
    onStatusChange?.({ status: "local-only", message: "Operating in fast local mode" });
    return () => {};
  }

  onStatusChange?.({ status: "connecting", message: "Connecting to live cloud..." });

  // Function to re-check and pull latest products (vital for mobile devices on 4G/5G)
  const refreshCatalogActive = async () => {
    try {
      const result = await fetchLiveCatalogFromCloud();
      if (result && Array.isArray(result.products) && result.products.length > 0) {
        setProducts?.(result.products);
        // Overwrite mobile device local storage so offline or refreshed state stays updated
        try {
          window.localStorage.setItem(
            "syt-custom-products",
            JSON.stringify({ state: { products: result.products, updatedAt: result.updatedAt }, version: result.updatedAt })
          );
        } catch (_e) {}
      }
    } catch (_e) {}
  };

  // 1. Immediately trigger an active fetch on startup so mobile devices don't have to wait for WebSocket negotiation
  refreshCatalogActive();

  // 2. Live Catalog Listener (real-time push)
  let unsubCatalog = () => {};
  try {
    const catalogRef = doc(db, "store", "catalog");
    unsubCatalog = onSnapshot(
      catalogRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (Array.isArray(data?.products) && data.products.length > 0) {
            const cleaned = sanitizeProducts(data.products);
            lastCloudCatalogTimestamp = data.updatedAt || Date.now();
            setProducts?.(cleaned);

            // Update mobile local storage with latest cloud snapshot
            try {
              window.localStorage.setItem(
                "syt-custom-products",
                JSON.stringify({ state: { products: cleaned, updatedAt: lastCloudCatalogTimestamp }, version: lastCloudCatalogTimestamp })
              );
            } catch (_e) {}

            onStatusChange?.({
              status: "synced",
              message: "Live cloud connected — All devices in sync",
              updatedAt: lastCloudCatalogTimestamp,
              count: cleaned.length,
            });
          }
        } else {
          onStatusChange?.({ status: "ready", message: "Cloud ready for initial publish" });
        }
      },
      (error) => {
        console.warn("Catalog onSnapshot notice:", error.message);
        onStatusChange?.({ status: "offline", message: "Offline / Local fallback active" });
      }
    );
  } catch (e) {
    console.warn("Catalog listener setup notice:", e.message);
  }

  // 3. Live Banners Listener
  let unsubBanners = () => {};
  try {
    const bannersRef = doc(db, "store", "banners");
    unsubBanners = onSnapshot(
      bannersRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setBanners?.(data);
        }
      },
      (error) => console.warn("Banners onSnapshot notice:", error.message)
    );
  } catch (e) {
    console.warn("Banners listener setup notice:", e.message);
  }

  // 4. Live Categories Listener
  let unsubCategories = () => {};
  try {
    const categoriesRef = doc(db, "store", "categories");
    unsubCategories = onSnapshot(
      categoriesRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (Array.isArray(data?.categories) && data.categories.length > 0) {
            setCategories?.(data.categories);
          }
        }
      },
      (error) => console.warn("Categories onSnapshot notice:", error.message)
    );
  } catch (e) {
    console.warn("Categories listener setup notice:", e.message);
  }

  // 5. Mobile Lifecycle Resiliency Listeners:
  // When mobile devices wake from sleep, change apps, or switch from Wi-Fi to cellular data,
  // immediately pull latest cloud catalog to bypass paused WebSockets
  const handleWakeOrFocus = () => {
    if (document.visibilityState === "visible") {
      refreshCatalogActive();
    }
  };

  window.addEventListener("visibilitychange", handleWakeOrFocus);
  window.addEventListener("focus", handleWakeOrFocus);
  window.addEventListener("online", handleWakeOrFocus);

  // Periodic heartbeat: check every 15 seconds to ensure mobile devices stay 100% updated
  const heartbeatTimer = setInterval(refreshCatalogActive, 15000);

  return () => {
    unsubCatalog();
    unsubBanners();
    unsubCategories();
    window.removeEventListener("visibilitychange", handleWakeOrFocus);
    window.removeEventListener("focus", handleWakeOrFocus);
    window.removeEventListener("online", handleWakeOrFocus);
    clearInterval(heartbeatTimer);
  };
}

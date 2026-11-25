import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  collection,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../config/firebase";

// In-memory record of the latest known catalog update timestamp
let lastCloudCatalogTimestamp = 0;
let lastLocalMutationTimestamp = 0;
let isSyncingProducts = false;

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

    // Clean images array & purge legacy bad images
    let images = Array.isArray(item.images) ? item.images.filter(Boolean) : [];
    if (images.length === 0 && item.imageUrl) {
      images = [item.imageUrl];
    }
    if (images.length === 0) {
      images = ["https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=600&h=600&fit=crop"];
    }

    // Auto-migrate any old broken or non-crochet photos
    images = images.map((img) => {
      if (!img || img.includes("photo-1591781696001-67e57f2dc052")) {
        return "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&h=600&fit=crop";
      }
      if (img.includes("photo-1558618666-fcd25c85cd64") || (name.toLowerCase().includes("bunny") && img.includes("photo-1584589167171-541ce45f1eea"))) {
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
      return img;
    });

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
 * Upload an image:
 * 1. Backblaze B2 Cloud Storage CDN via /api/upload
 * 2. Firebase Storage CDN with strict 4s timeout
 * 3. Instant client-compressed image fallback (guarantees upload NEVER gets stuck)
 */
export async function uploadProductImage(file) {
  if (!file) return null;

  // Step 1: Pre-compress image for ultra-fast fallback and lightweight upload payload
  let localCompressed = null;
  try {
    localCompressed = await compressImageFile(file, 900, 0.82);
  } catch (_e) {}

  // Step 2: Try Backblaze B2 Upload via /api/upload (5-second timeout)
  if (typeof window !== "undefined" && localCompressed) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base64: localCompressed,
          fileName: file.name,
        }),
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (res.ok) {
        const data = await res.json();
        if (data?.url) {
          return { url: data.url, isCloudStorage: true, provider: "backblaze" };
        }
      }
    } catch (_b2Err) {
      // Non-blocking; continue to secondary cloud or local fallback
    }
  }

  // Step 3: Try Firebase Storage with strict 4-second timeout
  if (storage && typeof window !== "undefined") {
    try {
      const uploadWithTimeout = new Promise(async (resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("Storage timeout")), 4000);
        try {
          const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
          const storageRef = ref(storage, `catalog/${Date.now()}-${safeName}`);
          const snapshot = await uploadBytes(storageRef, file);
          const downloadURL = await getDownloadURL(snapshot.ref);
          clearTimeout(timer);
          resolve({ url: downloadURL, isCloudStorage: true, provider: "firebase" });
        } catch (err) {
          clearTimeout(timer);
          reject(err);
        }
      });
      const cloudRes = await uploadWithTimeout;
      return cloudRes;
    } catch (_stErr) {
      // Storage unavailable or timed out; continue to fallback
    }
  }

  // Step 4: Fallback to high-efficiency client-compressed image (renders immediately, never hangs!)
  return {
    url: localCompressed || "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=600&h=600&fit=crop",
    isCloudStorage: false,
  };
}

/**
 * Sync all products to Universal Cloud Storage & Firestore
 * Stores each product in its own Firestore document under `products/{id}`
 * so N number of products can be saved without hitting the 1 MB single-doc limit.
 */
export async function syncProductsToCloud(products) {
  const cleanProducts = sanitizeProducts(products);
  const now = Date.now();
  lastCloudCatalogTimestamp = now;
  lastLocalMutationTimestamp = now;
  isSyncingProducts = true;

  const payload = {
    products: cleanProducts,
    updatedAt: now,
    count: cleanProducts.length,
    version: 0,
    isLive: true,
  };

  // 1. Immediately update device local storage cache (ignore QuotaExceededError if many base64 images)
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        "syt-custom-products",
        JSON.stringify({ state: { products: cleanProducts, updatedAt: now }, version: 0 })
      );
    }
  } catch (_e) {}

  let synced = false;
  let cloudError = null;

  // 2. Sync to Firebase Firestore (per-product collection `products/{id}`)
  if (db && typeof window !== "undefined") {
    try {
      const productsCol = collection(db, "products");
      const existingSnap = await getDocs(productsCol);
      const keepIds = new Set(cleanProducts.map((p) => String(p.id)));

      // Batch writes in chunks of 400 operations (Firestore batch limit is 500)
      const ops = [];
      for (const product of cleanProducts) {
        ops.push({ type: "set", ref: doc(db, "products", String(product.id)), data: { ...product, updatedAt: now } });
      }
      existingSnap.forEach((docSnap) => {
        if (!keepIds.has(docSnap.id)) {
          ops.push({ type: "delete", ref: docSnap.ref });
        }
      });

      for (let i = 0; i < ops.length; i += 400) {
        const batch = writeBatch(db);
        const chunk = ops.slice(i, i + 400);
        for (const op of chunk) {
          if (op.type === "set") batch.set(op.ref, op.data);
          else batch.delete(op.ref);
        }
        await batch.commit();
      }

      // Also update legacy `store/catalog` doc only if payload stays safely below Firestore's 1 MB limit
      try {
        const approxBytes = new Blob([JSON.stringify(payload)]).size;
        if (approxBytes < 850000) {
          await setDoc(doc(db, "store", "catalog"), payload, { merge: true });
        }
      } catch (_legacyErr) {
        // Legacy mirror is optional; `products` collection is authoritative
      }

      synced = true;
    } catch (error) {
      cloudError = error;
      console.warn("Firestore syncProducts notice:", error.message);
    }
  }

  isSyncingProducts = false;
  return { success: synced, count: cleanProducts.length, updatedAt: now, error: cloudError?.message };
}

/**
 * Sync Banners to Cloud
 */
export async function syncBannersToCloud(banners) {
  const now = Date.now();
  const payload = { ...banners, updatedAt: now };

  if (db && typeof window !== "undefined") {
    try {
      const docRef = doc(db, "store", "banners");
      await setDoc(docRef, payload, { merge: true });
    } catch (_fb) {}
  }
  return { success: true };
}

/**
 * Sync Categories to Cloud
 */
export async function syncCategoriesToCloud(categories) {
  if (!Array.isArray(categories)) return { success: false };
  const now = Date.now();
  const payload = { categories, updatedAt: now };

  if (db && typeof window !== "undefined") {
    try {
      const docRef = doc(db, "store", "categories");
      await setDoc(docRef, payload, { merge: true });
    } catch (_fb) {}
  }
  return { success: true };
}

/**
 * Manually fetch the live catalog from Cloud
 * Reads from per-product `products` collection (supports unlimited N products),
 * with automatic fallback/migration from legacy `store/catalog`.
 */
export async function fetchLiveCatalogFromCloud() {
  if (typeof window === "undefined") return null;

  if (db) {
    try {
      // 1. Prefer unlimited `products` collection
      const snapCol = await getDocs(collection(db, "products"));
      if (!snapCol.empty) {
        const list = [];
        let maxUpdatedAt = 0;
        snapCol.forEach((d) => {
          const data = d.data();
          if (data) {
            list.push(data);
            if ((data.updatedAt || 0) > maxUpdatedAt) {
              maxUpdatedAt = data.updatedAt;
            }
          }
        });
        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        const cleaned = sanitizeProducts(list);
        if (cleaned.length > 0) {
          lastCloudCatalogTimestamp = maxUpdatedAt || Date.now();
          return {
            products: cleaned,
            updatedAt: lastCloudCatalogTimestamp,
          };
        }
      }

      // 2. Fallback to legacy `store/catalog`
      const docRef = doc(db, "store", "catalog");
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        if (Array.isArray(data?.products) && data.products.length > 0) {
          lastCloudCatalogTimestamp = data.updatedAt || Date.now();
          return {
            products: sanitizeProducts(data.products),
            updatedAt: lastCloudCatalogTimestamp,
          };
        }
      }
    } catch (_fbErr) {}
  }

  return null;
}

/**
 * Initialize real-time Cloud Synchronization
 * Connects Firestore `products` collection snapshot listeners on all devices with ZERO DELAY!
 */
export function initLiveCloudSync({ setProducts, setBanners, setCategories, onStatusChange }) {
  if (typeof window === "undefined") return () => {};

  onStatusChange?.({ status: "connecting", message: "Connecting to live cloud..." });

  // Function to pull latest products and immediately update device state
  const refreshCatalogActive = async () => {
    // Do not overwrite in-flight local edits
    if (isSyncingProducts || Date.now() - lastLocalMutationTimestamp < 4000) {
      return;
    }
    try {
      const result = await fetchLiveCatalogFromCloud();
      if (
        result &&
        Array.isArray(result.products) &&
        result.products.length > 0 &&
        !isSyncingProducts &&
        Date.now() - lastLocalMutationTimestamp >= 4000
      ) {
        setProducts?.(result.products);

        // Overwrite mobile device local storage so offline/refreshed view stays updated
        try {
          window.localStorage.setItem(
            "syt-custom-products",
            JSON.stringify({ state: { products: result.products, updatedAt: result.updatedAt }, version: 0 })
          );
        } catch (_e) {}

        onStatusChange?.({
          status: "synced",
          message: "Live cloud connected — All devices in sync",
          updatedAt: result.updatedAt,
          count: result.products.length,
        });
      }
    } catch (_e) {}
  };

  // 1. Immediately trigger an active fetch on startup
  refreshCatalogActive();

  // 2. Setup Firebase Firestore listeners if initialized
  let unsubProductsCol = () => {};
  let unsubCatalog = () => {};
  let unsubBanners = () => {};
  let unsubCategories = () => {};

  if (db) {
    try {
      unsubProductsCol = onSnapshot(collection(db, "products"), (snapCol) => {
        if (isSyncingProducts || Date.now() - lastLocalMutationTimestamp < 2500) {
          return;
        }
        if (!snapCol.empty) {
          const list = [];
          let maxUpdatedAt = 0;
          snapCol.forEach((d) => {
            const data = d.data();
            if (data) {
              list.push(data);
              if ((data.updatedAt || 0) > maxUpdatedAt) {
                maxUpdatedAt = data.updatedAt;
              }
            }
          });
          list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          const cleaned = sanitizeProducts(list);
          if (cleaned.length > 0) {
            lastCloudCatalogTimestamp = maxUpdatedAt || Date.now();
            setProducts?.(cleaned);
            try {
              window.localStorage.setItem(
                "syt-custom-products",
                JSON.stringify({ state: { products: cleaned, updatedAt: lastCloudCatalogTimestamp }, version: 0 })
              );
            } catch (_e) {}
            onStatusChange?.({
              status: "synced",
              message: "Live cloud connected — All devices in sync",
              updatedAt: lastCloudCatalogTimestamp,
              count: cleaned.length,
            });
          }
        }
      }, () => {});

      unsubCatalog = onSnapshot(doc(db, "store", "catalog"), async (snapshot) => {
        if (isSyncingProducts || Date.now() - lastLocalMutationTimestamp < 2500) {
          return;
        }
        // Only apply legacy `store/catalog` if `products` collection is empty
        const colCheck = await getDocs(collection(db, "products")).catch(() => null);
        if (colCheck && !colCheck.empty) return;

        if (snapshot.exists()) {
          const data = snapshot.data();
          if (Array.isArray(data?.products) && data.products.length > 0) {
            const cleaned = sanitizeProducts(data.products);
            lastCloudCatalogTimestamp = data.updatedAt || Date.now();
            setProducts?.(cleaned);
            try {
              window.localStorage.setItem(
                "syt-custom-products",
                JSON.stringify({ state: { products: cleaned, updatedAt: lastCloudCatalogTimestamp }, version: 0 })
              );
            } catch (_e) {}
            onStatusChange?.({
              status: "synced",
              message: "Live cloud connected — All devices in sync",
              updatedAt: lastCloudCatalogTimestamp,
              count: cleaned.length,
            });
          }
        }
      }, () => {});

      unsubBanners = onSnapshot(doc(db, "store", "banners"), (snap) => {
        if (snap.exists()) setBanners?.(snap.data());
      }, () => {});

      unsubCategories = onSnapshot(doc(db, "store", "categories"), (snap) => {
        if (snap.exists() && Array.isArray(snap.data()?.categories)) {
          setCategories?.(snap.data().categories);
        }
      }, () => {});
    } catch (_err) {}
  }

  // 3. Mobile Lifecycle Resiliency Listeners:
  // When mobile devices wake from sleep, change apps, or switch from Wi-Fi to cellular data,
  // immediately pull latest cloud catalog over HTTPS
  const handleWakeOrFocus = () => {
    if (document.visibilityState === "visible") {
      refreshCatalogActive();
    }
  };

  window.addEventListener("visibilitychange", handleWakeOrFocus);
  window.addEventListener("focus", handleWakeOrFocus);
  window.addEventListener("online", handleWakeOrFocus);

  // 4. Background Heartbeat: polls every 10 seconds to keep all users and devices 100% updated
  const heartbeatTimer = setInterval(refreshCatalogActive, 10000);

  return () => {
    unsubProductsCol();
    unsubCatalog();
    unsubBanners();
    unsubCategories();
    window.removeEventListener("visibilitychange", handleWakeOrFocus);
    window.removeEventListener("focus", handleWakeOrFocus);
    window.removeEventListener("online", handleWakeOrFocus);
    clearInterval(heartbeatTimer);
  };
}

/**
 * Diagnostic tool to check live Firestore connection and database provisioning
 */
export async function checkCloudHealth() {
  if (!db) {
    return { ok: false, status: "unconfigured", reason: "Firebase configuration not active" };
  }
  try {
    const docRef = doc(db, "store", "catalog");
    const snap = await getDoc(docRef);
    return {
      ok: true,
      status: "connected",
      exists: snap.exists(),
      productCount: snap.exists() ? (snap.data()?.products?.length || 0) : 0,
      updatedAt: snap.exists() ? snap.data()?.updatedAt : null,
    };
  } catch (err) {
    const msg = err?.message || String(err);
    const isMissingDb = msg.includes("does not exist") || msg.includes("not-found") || (err?.code === "not-found");
    return {
      ok: false,
      status: isMissingDb ? "database_missing" : "error",
      reason: isMissingDb
        ? "Cloud Firestore database has not been created yet in Firebase Console."
        : msg,
      consoleUrl: "https://console.firebase.google.com/project/sri-yarn-tales/firestore",
    };
  }
}

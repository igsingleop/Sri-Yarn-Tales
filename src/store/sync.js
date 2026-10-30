// Cross-tab and in-memory real-time synchronization helper
// Sri Yarn & Tales Storefront & Admin Portal

const CHANNEL_NAME = "syt_store_channel";
let channel = null;

if (typeof window !== "undefined" && "BroadcastChannel" in window) {
  try {
    channel = new BroadcastChannel(CHANNEL_NAME);
  } catch (err) {
    console.warn("BroadcastChannel not available:", err);
  }
}

/**
 * Broadcast an update event to all other open tabs/windows
 * @param {"SYNC_PRODUCTS" | "SYNC_BANNERS" | "SYNC_AUTH"} type 
 * @param {any} payload 
 */
export function broadcastSync(type, payload) {
  if (channel) {
    try {
      channel.postMessage({ type, payload, timestamp: Date.now() });
    } catch (_e) {
      // ignore serialization or closed channel errors
    }
  }

  // Also dispatch custom DOM event for intra-window components
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(`syt:${type.toLowerCase()}`, { detail: payload })
    );
  }
}

/**
 * Register global listeners for cross-tab sync
 * @param {Object} stores
 * @param {Function} stores.setProducts
 * @param {Function} stores.setBanners
 * @param {Function} stores.setAuth
 */
export function initCrossTabSync({ setProducts, setBanners, setAuth, setAdminAuth }) {
  if (typeof window === "undefined") return () => {};

  // 1. BroadcastChannel listener (fastest, microsecond cross-tab sync)
  if (channel) {
    channel.onmessage = (event) => {
      const { type, payload } = event.data || {};
      if (type === "SYNC_PRODUCTS" && setProducts && payload) {
        setProducts(payload);
      } else if (type === "SYNC_BANNERS" && setBanners && payload) {
        setBanners(payload);
      } else if (type === "SYNC_AUTH" && setAuth) {
        setAuth(payload);
      } else if (type === "SYNC_ADMIN_AUTH" && setAdminAuth) {
        setAdminAuth(payload);
      }
    };
  }

  // 2. Storage event listener (standard browser fallback)
  const handleStorage = (event) => {
    if (!event.newValue) return;
    try {
      if (event.key === "syt-custom-products" && setProducts) {
        const parsed = JSON.parse(event.newValue);
        if (parsed?.state?.products && Array.isArray(parsed.state.products)) {
          setProducts(parsed.state.products);
        }
      } else if (event.key === "syt-custom-banners" && setBanners) {
        const parsed = JSON.parse(event.newValue);
        if (parsed?.state) {
          setBanners(parsed.state);
        }
      } else if (event.key === "syt-auth") {
        const parsed = JSON.parse(event.newValue);
        if (parsed?.state) {
          // If stored state had user as admin, do not set storefront user
          if (parsed.state.user?.role === "admin") {
            if (setAdminAuth) setAdminAuth(parsed.state.user);
            if (setAuth) setAuth(null);
          } else {
            if (setAuth) setAuth(parsed.state.user || null);
            if (setAdminAuth) setAdminAuth(parsed.state.adminUser || null);
          }
        }
      }
    } catch (_e) {
      // ignore parse errors
    }
  };

  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener("storage", handleStorage);
  };
}

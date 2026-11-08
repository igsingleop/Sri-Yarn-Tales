import React from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import "./styles/index.css";
import App from "./App";
import { initCrossTabSync } from "./store/sync";
import { useProductStore } from "./store/productStore";
import { useBannerStore } from "./store/bannerStore";
import { useCategoryStore } from "./store/categoryStore";
import { useAuthStore } from "./store/authStore";

// Initialize instantaneous cross-tab and cross-window sync
initCrossTabSync({
  setProducts: (products) => useProductStore.setState({ products }),
  setBanners: (banners) => useBannerStore.setState(banners),
  setCategories: (categories) => useCategoryStore.setState({ categories }),
  setAuth: (user) => useAuthStore.setState({ user }),
  setAdminAuth: (adminUser) => useAuthStore.setState({ adminUser }),
});

const container = document.getElementById("root");
const appElement = (
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

if (container && container.hasChildNodes()) {
  hydrateRoot(container, appElement);
} else if (container) {
  createRoot(container).render(appElement);
}

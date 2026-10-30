import React from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import App from "./App";
import { initCrossTabSync } from "./store/sync";
import { useProductStore } from "./store/productStore";
import { useBannerStore } from "./store/bannerStore";
import { useAuthStore } from "./store/authStore";

// Initialize instantaneous cross-tab and cross-window sync
initCrossTabSync({
  setProducts: (products) => useProductStore.setState({ products }),
  setBanners: (banners) => useBannerStore.setState(banners),
  setAuth: (user) => useAuthStore.setState({ user }),
  setAdminAuth: (adminUser) => useAuthStore.setState({ adminUser }),
});

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

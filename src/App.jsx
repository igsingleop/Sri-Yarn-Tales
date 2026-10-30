import React, { Suspense, lazy, Component } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { HelmetProvider } from "react-helmet-async";

import Layout from "./components/layout/Layout";
import PageLoader from "./components/ui/PageLoader";
import AdminDashboard from "./pages/admin/AdminDashboard";

// ---- Lazy-loaded pages ----
const Home = lazy(() => import("./pages/Home"));
const Shop = lazy(() => import("./pages/Shop"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const CustomOrders = lazy(() => import("./pages/CustomOrders"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Account = lazy(() => import("./pages/Account"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Robust React Error Boundary
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Caught in ErrorBoundary:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-cream via-oatmeal/40 to-cream flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-3xl bg-red-50 border border-red-200 text-error flex items-center justify-center text-3xl mb-4 shadow-sm">
            🧶
          </div>
          <h2 className="font-heading font-bold text-2xl text-cocoa mb-2">Something went wrong</h2>
          <p className="text-sm text-warmgray max-w-md mb-6 leading-relaxed">
            {this.state.error?.message || "An unexpected error occurred while loading this view."}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="btn-primary py-2.5 px-5 rounded-2xl text-sm font-semibold shadow-rose-sm"
            >
              Reload Page
            </button>
            <a
              href="/"
              className="btn-secondary py-2.5 px-5 rounded-2xl text-sm font-semibold"
            >
              Return to Storefront
            </a>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Page transition variants
const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } },
};

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/:category" element={<Shop />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/custom-orders" element={<CustomOrders />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/account" element={<Account />} />
          <Route path="/login" element={<Account />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <Layout>
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <AnimatedRoutes />
            </Suspense>
          </ErrorBoundary>
        </Layout>
      </BrowserRouter>
    </HelmetProvider>
  );
}

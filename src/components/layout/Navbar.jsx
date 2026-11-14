import React, { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Heart, ShoppingBag, Menu, User, ChevronDown
} from "lucide-react";
import Logo from "../ui/Logo";
import {
  useCartStore,
  useWishlistStore,
  useUIStore,
  useAuthStore,
  useBannerStore,
} from "../../store";
import SearchOverlay from "./SearchOverlay";
import CartDrawer from "../cart/CartDrawer";
import MobileMenu from "./MobileMenu";

const navLinks = [
  { label: "Shop All", to: "/shop" },
  {
    label: "Collections",
    to: "/shop",
    dropdown: [
      { label: "Amigurumi Toys", to: "/shop/amigurumi" },
      { label: "Bags & Totes", to: "/shop/bags" },
      { label: "Home Decor", to: "/shop/home-decor" },
      { label: "Wearables", to: "/shop/wearables" },
      { label: "Baby Items", to: "/shop/baby" },
      { label: "Accessories", to: "/shop/accessories" },
    ],
  },
  { label: "Custom Craft", to: "/custom-orders" },
  { label: "Our Story", to: "/about" },
  { label: "Contact", to: "/contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const location = useLocation();

  const user = useAuthStore((s) => s.user);
  const topAnnouncement = useBannerStore((s) => s.topAnnouncement);

  const cartCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.qty, 0));
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const {
    cartOpen,
    openCart,
    closeCart,
    searchOpen,
    openSearch,
    closeSearch,
    mobileMenuOpen,
    openMobileMenu,
    closeMobileMenu,
  } = useUIStore();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    closeMobileMenu();
    setActiveDropdown(null);
  }, [location, closeMobileMenu]);

  return (
    <>
      {/* Endless Announcement Ticker — Right to Left Smooth Marquee */}
      {topAnnouncement.enabled && (
        <aside
          aria-label="Announcement"
          className="bg-black text-white dark:bg-zinc-950 dark:text-zinc-200 border-b border-zinc-800 text-[11px] sm:text-xs py-2 overflow-hidden select-none font-bold uppercase tracking-[0.2em] transition-colors relative"
        >
          <div className="ticker-track-endless flex items-center">
            {/* Repeated segments to ensure 100% gapless, seamless endless loop */}
            {[...Array(6)].map((_, idx) => (
              <div key={idx} className="flex items-center flex-shrink-0 px-6 sm:px-8">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500 mr-2.5 align-middle animate-pulse" />
                <span className="tracking-[0.18em]">
                  {topAnnouncement.text}
                  {topAnnouncement.badgeText && ` · ${topAnnouncement.badgeText}`}
                </span>
                <span className="ml-6 sm:ml-8 text-zinc-600 dark:text-zinc-500 font-normal">✦</span>
              </div>
            ))}
          </div>
        </aside>
      )}

      {/* Navbar — Minimalist Luxury Header */}
      <motion.header
        className={`sticky top-0 z-40 transition-all duration-200 border-b ${
          scrolled
            ? "bg-white/95 dark:bg-black/95 backdrop-blur-md border-zinc-200 dark:border-zinc-800 py-2.5 shadow-xs"
            : "bg-white dark:bg-black border-zinc-200/60 dark:border-zinc-800/60 py-3.5"
        }`}
        initial={{ y: -60 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-6">
            {/* Brand Logo */}
            <Link to="/" aria-label="Sri Yarn & Tales — Home" className="flex-shrink-0">
              <Logo />
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-7">
              {navLinks.map((link) =>
                link.dropdown ? (
                  <div
                    key={link.label}
                    className="relative"
                    onMouseEnter={() => setActiveDropdown(link.label)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <button className="nav-link flex items-center gap-1.5 py-1.5 focus:outline-none">
                      <span>{link.label}</span>
                      <ChevronDown
                        size={13}
                        className={`transition-transform duration-200 ${
                          activeDropdown === link.label ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <AnimatePresence>
                      {activeDropdown === link.label && (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 6 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl overflow-hidden z-50 py-2"
                        >
                          {link.dropdown.map((item) => (
                            <Link
                              key={item.label}
                              to={item.to}
                              className="block px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            >
                              {item.label}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <NavLink
                    key={link.label}
                    to={link.to}
                    className={({ isActive }) =>
                      `nav-link py-1.5 ${
                        link.to === "/" && location.pathname !== "/"
                          ? ""
                          : isActive
                          ? "active"
                          : ""
                      }`
                    }
                    end={link.to === "/"}
                  >
                    {link.label}
                  </NavLink>
                )
              )}
            </div>

            {/* Right Action Icons */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Search */}
              <button
                onClick={openSearch}
                className="btn-ghost w-9 h-9 p-0 rounded-full flex items-center justify-center"
                aria-label="Search products"
              >
                <Search size={18} />
              </button>

              {/* Wishlist */}
              <Link
                to="/wishlist"
                className="btn-ghost w-9 h-9 p-0 rounded-full flex items-center justify-center relative"
                aria-label={`Wishlist (${wishlistCount} items)`}
              >
                <Heart size={18} />
                {wishlistCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] bg-black text-white dark:bg-white dark:text-black text-[9px] font-bold rounded-full flex items-center justify-center px-1"
                  >
                    {wishlistCount}
                  </motion.span>
                )}
              </Link>

              {/* Cart */}
              <button
                onClick={openCart}
                className="btn-ghost w-9 h-9 p-0 rounded-full flex items-center justify-center relative"
                aria-label={`Cart (${cartCount} items)`}
              >
                <ShoppingBag size={18} />
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 1.3 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] bg-black text-white dark:bg-white dark:text-black text-[9px] font-bold rounded-full flex items-center justify-center px-1"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </button>

              {/* User Account */}
              <Link
                to="/account"
                className="btn-ghost w-9 h-9 p-0 rounded-full flex items-center justify-center relative"
                aria-label="User Account"
                title={user ? `Signed in as ${user.name}` : "Log In / Sign Up"}
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-6 h-6 rounded-full object-cover border border-zinc-300 dark:border-zinc-700"
                  />
                ) : (
                  <User size={18} />
                )}
                {user?.role === "admin" && (
                  <span className="absolute bottom-1 right-1 w-2 h-2 bg-emerald-500 rounded-full border border-white dark:border-black" />
                )}
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                onClick={openMobileMenu}
                className="lg:hidden btn-ghost w-9 h-9 p-0 rounded-full flex items-center justify-center"
                aria-label="Open navigation menu"
              >
                <Menu size={20} />
              </button>
            </div>
          </div>
        </nav>
      </motion.header>

      {/* Slide-over Drawers and Overlays */}
      <SearchOverlay open={searchOpen} onClose={closeSearch} />
      <CartDrawer open={cartOpen} onClose={closeCart} />
      <MobileMenu open={mobileMenuOpen} onClose={closeMobileMenu} links={navLinks} />
    </>
  );
}

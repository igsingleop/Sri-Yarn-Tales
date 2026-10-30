import React, { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Heart, ShoppingBag, Menu, User, ChevronDown, ShieldCheck
} from "lucide-react";
import Logo from "../ui/Logo";
import {
  useCartStore,
  useWishlistStore,
  useUIStore,
  useAuthStore,
  useBannerStore
} from "../../store";
import SearchOverlay from "./SearchOverlay";
import CartDrawer from "../cart/CartDrawer";
import MobileMenu from "./MobileMenu";
import { brand } from "../../config/brand";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/shop" },
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
  { label: "Custom Orders", to: "/custom-orders" },
  { label: "About", to: "/about" },
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
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    closeMobileMenu();
    setActiveDropdown(null);
  }, [location, closeMobileMenu]);

  return (
    <>
      {/* Dynamic Announcement Bar */}
      {topAnnouncement.enabled && (
        <div
          className="text-white text-xs sm:text-sm text-center py-2 px-4 font-medium tracking-wide transition-colors"
          style={{ backgroundColor: topAnnouncement.bgColor || "#D4768A" }}
        >
          <span className="animate-pulse inline-block w-1.5 h-1.5 rounded-full bg-white mr-2 align-middle" />
          {topAnnouncement.text}
          {topAnnouncement.badgeText && (
            <span className="hidden sm:inline-block ml-2 font-semibold bg-white/20 px-2 py-0.5 rounded-full text-xs">
              {topAnnouncement.badgeText}
            </span>
          )}
        </div>
      )}

      {/* Navbar */}
      <motion.header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled ? "glass shadow-warm py-2" : "bg-cream/80 backdrop-blur-sm py-3"
        }`}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/" aria-label="Sri Yarn & Tales — Home">
              <Logo />
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) =>
                link.dropdown ? (
                  <div
                    key={link.label}
                    className="relative"
                    onMouseEnter={() => setActiveDropdown(link.label)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <button className="nav-link flex items-center gap-1 py-2">
                      {link.label}
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-200 ${
                          activeDropdown === link.label ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <AnimatePresence>
                      {activeDropdown === link.label && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.95 }}
                          transition={{ duration: 0.18 }}
                          className="absolute top-full left-0 mt-1 w-52 glass rounded-2xl shadow-warm overflow-hidden z-50 py-2"
                        >
                          {link.dropdown.map((item) => (
                            <Link
                              key={item.label}
                              to={item.to}
                              className="block px-4 py-2.5 text-sm text-warmgray hover:text-primary hover:bg-primary-light/50 transition-colors"
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
                      `nav-link py-2 ${
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

            {/* Right icons */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Quick Admin Dashboard Link if logged in as admin */}
              {user?.role === "admin" && (
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1.5 bg-cocoa text-white text-xs font-bold px-3 py-1.5 rounded-full hover:bg-primary transition-all shadow-xs"
                  title="Open Admin Dashboard"
                >
                  <ShieldCheck size={13} className="text-butter" /> Admin Panel
                </Link>
              )}

              {/* Search */}
              <button
                onClick={openSearch}
                className="btn-ghost w-10 h-10 p-0 rounded-full"
                aria-label="Search products"
              >
                <Search size={20} />
              </button>

              {/* Wishlist */}
              <Link
                to="/wishlist"
                className="btn-ghost w-10 h-10 p-0 rounded-full relative"
                aria-label={`Wishlist (${wishlistCount} items)`}
              >
                <Heart size={20} />
                {wishlistCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 min-w-[18px] min-h-[18px] bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                  >
                    {wishlistCount}
                  </motion.span>
                )}
              </Link>

              {/* Cart */}
              <button
                onClick={openCart}
                className="btn-ghost w-10 h-10 p-0 rounded-full relative"
                aria-label={`Cart (${cartCount} items)`}
              >
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 1.5 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 min-w-[18px] min-h-[18px] bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </button>

              {/* User Account / Login */}
              <Link
                to="/account"
                className="btn-ghost w-10 h-10 p-0 rounded-full relative flex items-center justify-center"
                aria-label="User Account"
                title={user ? `Signed in as ${user.name}` : "Log In / Sign Up"}
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border border-primary/40"
                  />
                ) : (
                  <User size={20} />
                )}
                {user?.role === "admin" && (
                  <span className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-butter-dark rounded-full border border-white" />
                )}
              </Link>

              {/* Mobile menu button */}
              <button
                onClick={openMobileMenu}
                className="lg:hidden btn-ghost w-10 h-10 p-0 rounded-full"
                aria-label="Open menu"
              >
                <Menu size={22} />
              </button>
            </div>
          </div>
        </nav>
      </motion.header>

      {/* Overlays */}
      <SearchOverlay open={searchOpen} onClose={closeSearch} />
      <CartDrawer open={cartOpen} onClose={closeCart} />
      <MobileMenu open={mobileMenuOpen} onClose={closeMobileMenu} links={navLinks} />
    </>
  );
}

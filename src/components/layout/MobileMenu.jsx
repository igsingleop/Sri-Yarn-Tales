import React from "react";
import { Link, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Home, ShoppingBag, Package, Paintbrush, Info, Phone, Heart, User } from "lucide-react";
import Logo from "../ui/Logo";

const menuVariants = {
  closed: { opacity: 0, x: "100%" },
  open: { opacity: 1, x: 0 },
};

const iconMap = {
  "Home": Home,
  "Shop": ShoppingBag,
  "Collections": Package,
  "Custom Orders": Paintbrush,
  "About": Info,
  "Contact": Phone,
};

export default function MobileMenu({ open, onClose, links }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-cocoa/40 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-cream z-50 flex flex-col shadow-2xl"
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border">
              <Logo />
              <button
                onClick={onClose}
                className="btn-ghost w-10 h-10 p-0 rounded-full"
                aria-label="Close menu"
              >
                <X size={22} />
              </button>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 overflow-y-auto p-5 space-y-1">
              {links.map((link, i) => {
                const Icon = iconMap[link.label];
                return (
                  <motion.div
                    key={link.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 + 0.1 }}
                  >
                    {link.dropdown ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-3 px-4 py-3 text-warmgray font-semibold text-sm">
                          {Icon && <Icon size={18} />}
                          {link.label}
                        </div>
                        <div className="ml-8 space-y-1">
                          {link.dropdown.map((sub) => (
                            <NavLink
                              key={sub.label}
                              to={sub.to}
                              onClick={onClose}
                              className={({ isActive }) =>
                                `block px-4 py-2 rounded-xl text-sm transition-colors ${
                                  isActive
                                    ? "bg-primary-light text-primary font-semibold"
                                    : "text-warmgray hover:bg-oatmeal"
                                }`
                              }
                            >
                              {sub.label}
                            </NavLink>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <NavLink
                        to={link.to}
                        end={link.to === "/"}
                        onClick={onClose}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-all ${
                            isActive
                              ? "bg-primary-light text-primary"
                              : "text-cocoa hover:bg-oatmeal"
                          }`
                        }
                      >
                        {Icon && <Icon size={18} />}
                        {link.label}
                      </NavLink>
                    )}
                  </motion.div>
                );
              })}
            </nav>

            {/* Footer links */}
            <div className="p-5 border-t border-border space-y-3">
              <Link
                to="/wishlist"
                onClick={onClose}
                className="flex items-center gap-3 text-warmgray hover:text-primary transition-colors text-sm font-medium"
              >
                <Heart size={18} /> My Wishlist
              </Link>
              <Link
                to="/account"
                onClick={onClose}
                className="flex items-center gap-3 text-warmgray hover:text-primary transition-colors text-sm font-medium"
              >
                <User size={18} /> My Account
              </Link>
              <p className="text-xs text-warmgray/60 pt-2">
                © 2026 Sri Yarn &amp; Tales · Made with ❤️ in India
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

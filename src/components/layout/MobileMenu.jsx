import React from "react";
import { Link, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Package, Sparkles, Info, Phone, Heart, User, Search } from "lucide-react";
import Logo from "../ui/Logo";
import { useUIStore, useAuthStore } from "../../store";

const menuVariants = {
  closed: { opacity: 0, x: "100%" },
  open: { opacity: 1, x: 0 },
};

const iconMap = {
  "Shop All": ShoppingBag,
  "Collections": Package,
  "Custom Craft": Sparkles,
  "Our Story": Info,
  "Contact": Phone,
};

export default function MobileMenu({ open, onClose, links }) {
  const { openSearch } = useUIStore();
  const user = useAuthStore((s) => s.user);

  const handleSearchClick = () => {
    onClose();
    openSearch();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 z-50 flex flex-col border-l border-zinc-200 dark:border-zinc-800 shadow-2xl"
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            transition={{ type: "spring", damping: 30, stiffness: 350 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-zinc-200 dark:border-zinc-800">
              <Logo />
              <button
                onClick={onClose}
                className="btn-ghost w-9 h-9 p-0 rounded-full flex items-center justify-center text-zinc-600 dark:text-zinc-400"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick Actions Bar (Search) */}
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-900">
              <button
                onClick={handleSearchClick}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded bg-zinc-100 dark:bg-zinc-900 text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors"
              >
                <Search size={14} /> Search Products
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
                    transition={{ delay: i * 0.04 + 0.05 }}
                  >
                    {link.dropdown ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-3 px-3 py-3 text-zinc-400 dark:text-zinc-500 font-bold text-xs uppercase tracking-widest">
                          {Icon && <Icon size={16} />}
                          {link.label}
                        </div>
                        <div className="ml-4 pl-3 border-l border-zinc-200 dark:border-zinc-800 space-y-1">
                          {link.dropdown.map((sub) => (
                            <NavLink
                              key={sub.label}
                              to={sub.to}
                              onClick={onClose}
                              className={({ isActive }) =>
                                `block px-3 py-2 rounded text-xs font-semibold uppercase tracking-wider transition-colors ${
                                  isActive
                                    ? "bg-zinc-900 text-white dark:bg-white dark:text-black font-bold"
                                    : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
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
                          `flex items-center gap-3 px-3 py-3 rounded text-xs font-bold uppercase tracking-widest transition-all ${
                            isActive
                              ? "bg-black text-white dark:bg-white dark:text-black"
                              : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                          }`
                        }
                      >
                        {Icon && <Icon size={16} />}
                        {link.label}
                      </NavLink>
                    )}
                  </motion.div>
                );
              })}
            </nav>

            {/* Footer User Account Info */}
            <div className="p-5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
              <Link
                to="/account"
                onClick={onClose}
                className="flex items-center gap-3 p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover border border-zinc-300 dark:border-zinc-700"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
                    <User size={18} />
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                    {user ? user.name : "My Account"}
                  </p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    {user ? user.email : "Sign in or create account"}
                  </p>
                </div>
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

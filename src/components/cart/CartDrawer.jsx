import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Plus, Minus, Trash2, Heart, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCartStore, useWishlistStore } from "../../store";
import { formatINR } from "../../lib/utils";
import { brand } from "../../config/brand";

export default function CartDrawer({ open, onClose }) {
  const { items, removeItem, updateQty, subtotal, shippingCost, total, discount, coupon } = useCartStore();
  const { toggle } = useWishlistStore();
  const navigate = useNavigate();

  const freeShippingProgress = Math.min((subtotal / brand.freeShippingThreshold) * 100, 100);
  const remaining = brand.freeShippingThreshold - subtotal;

  const handleCheckout = () => {
    onClose();
    navigate("/checkout");
  };

  const handleMoveToWishlist = (item) => {
    toggle(item.product);
    removeItem(item.key);
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
            className="fixed top-0 right-0 h-full w-full sm:w-96 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 z-50 flex flex-col border-l border-zinc-200 dark:border-zinc-800 shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 350 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <ShoppingBag size={18} className="text-zinc-950 dark:text-white" />
                <h2 className="font-heading font-black text-sm uppercase tracking-wider text-zinc-950 dark:text-white">
                  Shopping Bag
                </h2>
                <span className="badge bg-black text-white dark:bg-white dark:text-black text-[10px] font-mono font-bold">
                  {items.reduce((s, i) => s + i.qty, 0)}
                </span>
              </div>
              <button
                onClick={onClose}
                className="btn-ghost w-9 h-9 p-0 rounded-full flex items-center justify-center text-zinc-600 dark:text-zinc-400"
                aria-label="Close shopping bag"
              >
                <X size={18} />
              </button>
            </div>

            {/* Free Shipping Progress Indicator */}
            {subtotal < brand.freeShippingThreshold ? (
              <div className="px-5 pt-4">
                <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 mb-2">
                    Add {formatINR(remaining)} for Complimentary Shipping
                  </p>
                  <div className="h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-black dark:bg-white rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${freeShippingProgress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="px-5 pt-4">
                <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 rounded p-2.5 text-center text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
                  ✓ Unlocked Complimentary Express Shipping
                </div>
              </div>
            )}

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400">
                    <ShoppingBag size={28} />
                  </div>
                  <div>
                    <p className="font-heading font-black text-sm uppercase tracking-wider text-zinc-950 dark:text-white">
                      Your bag is empty
                    </p>
                    <p className="text-zinc-400 text-xs mt-1">Discover handcrafted artisanal creations.</p>
                  </div>
                  <button onClick={onClose} className="btn-primary btn-sm mt-2">
                    Explore Shop
                  </button>
                </div>
              ) : (
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={item.key}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex gap-3 border border-zinc-200 dark:border-zinc-800 rounded p-3 bg-zinc-50/50 dark:bg-zinc-900/50"
                    >
                      {/* Image */}
                      <Link to={`/product/${item.product.slug}`} onClick={onClose} className="flex-shrink-0">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-16 h-16 rounded object-cover border border-zinc-200 dark:border-zinc-800"
                          loading="lazy"
                        />
                      </Link>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <Link to={`/product/${item.product.slug}`} onClick={onClose}>
                          <h3 className="text-xs font-bold uppercase tracking-tight text-zinc-950 dark:text-white line-clamp-1 hover:underline">
                            {item.product.name}
                          </h3>
                        </Link>

                        {(item.variant.color || item.variant.size) && (
                          <p className="text-[11px] text-zinc-400 mt-0.5 font-medium">
                            {item.variant.color && <span>{item.variant.color}</span>}
                            {item.variant.color && item.variant.size && " // "}
                            {item.variant.size && <span>{item.variant.size}</span>}
                          </p>
                        )}

                        <p className="text-xs font-black font-mono text-zinc-950 dark:text-white mt-1">
                          {formatINR(item.product.price * item.qty)}
                        </p>

                        <div className="flex items-center justify-between mt-2">
                          {/* Qty selector */}
                          <div className="flex items-center border border-zinc-300 dark:border-zinc-700 rounded">
                            <button
                              onClick={() => updateQty(item.key, item.qty - 1)}
                              className="w-6 h-6 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={10} />
                            </button>
                            <span className="w-6 text-center text-xs font-bold font-mono">
                              {item.qty}
                            </span>
                            <button
                              onClick={() => updateQty(item.key, item.qty + 1)}
                              className="w-6 h-6 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                              aria-label="Increase quantity"
                            >
                              <Plus size={10} />
                            </button>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleMoveToWishlist(item)}
                              className="p-1 text-zinc-400 hover:text-black dark:hover:text-white"
                              aria-label="Move to wishlist"
                              title="Save to wishlist"
                            >
                              <Heart size={14} />
                            </button>
                            <button
                              onClick={() => removeItem(item.key)}
                              className="p-1 text-zinc-400 hover:text-red-500"
                              aria-label="Remove item"
                              title="Remove item"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Bottom Summary & Checkout */}
            {items.length > 0 && (
              <div className="border-t border-zinc-200 dark:border-zinc-800 p-5 space-y-3 bg-zinc-50 dark:bg-zinc-950">
                <div className="space-y-1.5 text-xs font-semibold uppercase tracking-wider">
                  <div className="flex justify-between text-zinc-500">
                    <span>Subtotal</span>
                    <span className="font-mono text-zinc-950 dark:text-white">{formatINR(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount ({coupon?.label})</span>
                      <span className="font-mono">−{formatINR(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-zinc-500">
                    <span>Shipping</span>
                    <span className="font-mono text-zinc-950 dark:text-white">
                      {shippingCost === 0 ? "COMPLIMENTARY" : formatINR(shippingCost)}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-sm border-t border-zinc-200 dark:border-zinc-800 pt-2 text-zinc-950 dark:text-white">
                    <span>Estimated Total</span>
                    <span className="font-black font-mono">{formatINR(total)}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="btn-primary w-full btn-lg mt-2"
                >
                  Proceed to Checkout <ArrowRight size={14} />
                </button>
                <Link
                  to="/cart"
                  onClick={onClose}
                  className="block text-center text-xs uppercase font-bold tracking-wider text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
                >
                  View Full Bag
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

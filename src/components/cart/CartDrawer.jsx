import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Plus, Minus, Trash2, Heart, ArrowRight, Package } from "lucide-react";
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
            className="fixed inset-0 bg-cocoa/40 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className="fixed top-0 right-0 h-full w-full sm:w-96 bg-cream z-50 flex flex-col shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 350 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border glass">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} className="text-primary" />
                <h2 className="font-heading font-bold text-lg text-cocoa">
                  My Cart
                </h2>
                <span className="badge-primary text-xs">{items.reduce((s, i) => s + i.qty, 0)}</span>
              </div>
              <button onClick={onClose} className="btn-ghost w-9 h-9 p-0 rounded-full" aria-label="Close cart">
                <X size={20} />
              </button>
            </div>

            {/* Free shipping bar */}
            {subtotal < brand.freeShippingThreshold && (
              <div className="px-5 pt-4">
                <div className="bg-primary-light rounded-2xl p-3">
                  <p className="text-xs text-primary-dark font-semibold mb-2">
                    Add {formatINR(remaining)} more for FREE shipping! 🎉
                  </p>
                  <div className="h-1.5 bg-white rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${freeShippingProgress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              </div>
            )}

            {subtotal >= brand.freeShippingThreshold && (
              <div className="px-5 pt-4">
                <div className="bg-sage/20 rounded-2xl p-3 text-center text-sage-dark text-xs font-semibold">
                  🎉 You've unlocked FREE shipping!
                </div>
              </div>
            )}

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {items.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center h-64 text-center gap-4"
                >
                  <div className="w-20 h-20 rounded-full bg-oatmeal flex items-center justify-center">
                    <ShoppingBag size={36} className="text-primary/40" />
                  </div>
                  <div>
                    <p className="font-heading font-semibold text-cocoa text-lg">Your cart is empty</p>
                    <p className="text-warmgray text-sm mt-1">Add some handmade goodness!</p>
                  </div>
                  <button onClick={onClose} className="btn-primary btn-sm">
                    Start Shopping
                  </button>
                </motion.div>
              ) : (
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={item.key}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20, height: 0 }}
                      className="flex gap-3 bg-white rounded-2xl p-3 shadow-card"
                    >
                      {/* Image */}
                      <Link to={`/product/${item.product.slug}`} onClick={onClose}>
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                          loading="lazy"
                        />
                      </Link>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <Link to={`/product/${item.product.slug}`} onClick={onClose}>
                          <h3 className="text-sm font-semibold text-cocoa line-clamp-2 hover:text-primary transition-colors">
                            {item.product.name}
                          </h3>
                        </Link>

                        {/* Variant */}
                        {(item.variant.color || item.variant.size) && (
                          <p className="text-xs text-warmgray mt-0.5">
                            {item.variant.color && <span>Colour: {item.variant.color}</span>}
                            {item.variant.color && item.variant.size && " · "}
                            {item.variant.size && <span>Size: {item.variant.size}</span>}
                          </p>
                        )}

                        {/* Price */}
                        <p className="text-sm font-bold text-primary mt-1">
                          {formatINR(item.product.price * item.qty)}
                        </p>

                        {/* Qty + Actions */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-0.5 bg-oatmeal rounded-full">
                            <button
                              onClick={() => updateQty(item.key, item.qty - 1)}
                              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm transition-all"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-6 text-center text-sm font-semibold">{item.qty}</span>
                            <button
                              onClick={() => updateQty(item.key, item.qty + 1)}
                              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm transition-all"
                              aria-label="Increase quantity"
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleMoveToWishlist(item)}
                              className="w-7 h-7 flex items-center justify-center rounded-full text-warmgray hover:text-primary hover:bg-primary-light transition-all"
                              aria-label="Move to wishlist"
                            >
                              <Heart size={12} />
                            </button>
                            <button
                              onClick={() => removeItem(item.key)}
                              className="w-7 h-7 flex items-center justify-center rounded-full text-warmgray hover:text-error hover:bg-red-50 transition-all"
                              aria-label="Remove item"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Order Summary + CTA */}
            {items.length > 0 && (
              <div className="border-t border-border p-5 space-y-4 bg-white">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-warmgray">
                    <span>Subtotal</span>
                    <span className="font-semibold text-cocoa">{formatINR(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sage-dark">
                      <span>Discount ({coupon?.label})</span>
                      <span className="font-semibold">−{formatINR(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-warmgray">
                    <span>Shipping</span>
                    <span className={`font-semibold ${shippingCost === 0 ? "text-sage-dark" : "text-cocoa"}`}>
                      {shippingCost === 0 ? "FREE" : formatINR(shippingCost)}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-base border-t border-border pt-2 text-cocoa">
                    <span>Total</span>
                    <span className="text-primary">{formatINR(total)}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="btn-primary w-full btn-lg"
                >
                  Checkout <ArrowRight size={18} />
                </button>
                <Link
                  to="/cart"
                  onClick={onClose}
                  className="block text-center text-sm text-warmgray hover:text-primary transition-colors font-medium"
                >
                  View full cart
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

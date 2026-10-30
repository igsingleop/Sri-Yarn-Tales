import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag, Plus, Minus, Trash2, Heart, ArrowRight,
  Tag, Package, X, Check
} from "lucide-react";
import { useCartStore, useWishlistStore } from "../store";
import { formatINR } from "../lib/utils";
import { validateCoupon } from "../lib/api";
import { brand } from "../config/brand";

export default function Cart() {
  const { items, removeItem, updateQty, subtotal, shippingCost, total, discount,
          coupon, setCoupon, clearCoupon } = useCartStore();
  const { toggle } = useWishlistStore();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponSuccess, setCouponSuccess] = useState(false);

  const freeShippingProgress = Math.min((subtotal / brand.freeShippingThreshold) * 100, 100);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    const result = await validateCoupon(couponCode.trim(), subtotal);
    setCouponLoading(false);
    if (result.valid) {
      setCoupon(result, result.type === "percent" ? result.discount : result.discount);
      setCouponSuccess(true);
      setTimeout(() => setCouponSuccess(false), 3000);
    } else {
      setCouponError(result.error);
    }
  };

  if (items.length === 0) {
    return (
      <>
        <Helmet>
          <title>Your Cart | Sri Yarn &amp; Tales</title>
        </Helmet>
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 gap-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-32 h-32 rounded-full bg-oatmeal flex items-center justify-center"
          >
            <ShoppingBag size={56} className="text-primary/40" />
          </motion.div>
          <h1 className="font-heading text-3xl font-bold text-cocoa">Your cart is empty</h1>
          <p className="text-warmgray max-w-xs">
            Looks like you haven't added anything yet. Let's find something beautiful for you!
          </p>
          <Link to="/shop" className="btn-primary btn-lg">
            Explore Shop <ArrowRight size={18} />
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Your Cart ({items.reduce((s, i) => s + i.qty, 0)} items) | Sri Yarn &amp; Tales</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="section-title mb-8"
        >
          Shopping Cart
          <span className="ml-3 text-xl text-warmgray font-body font-normal">
            ({items.reduce((s, i) => s + i.qty, 0)} items)
          </span>
        </motion.h1>

        {/* Free shipping progress */}
        {subtotal < brand.freeShippingThreshold && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-primary-light rounded-2xl p-4 mb-6"
          >
            <p className="text-sm text-primary-dark font-semibold mb-2">
              You're {formatINR(brand.freeShippingThreshold - subtotal)} away from FREE shipping! 🎉
            </p>
            <div className="h-2 bg-primary/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${freeShippingProgress}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.key}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -40, height: 0, marginBottom: 0 }}
                  className="bg-white rounded-3xl p-4 sm:p-5 shadow-card"
                >
                  <div className="flex gap-4">
                    <Link to={`/product/${item.product.slug}`} className="flex-shrink-0">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover"
                      />
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${item.product.slug}`}>
                        <h3 className="font-heading font-semibold text-cocoa hover:text-primary transition-colors line-clamp-2">
                          {item.product.name}
                        </h3>
                      </Link>

                      {(item.variant.color || item.variant.size) && (
                        <p className="text-xs text-warmgray mt-1">
                          {[item.variant.color, item.variant.size].filter(Boolean).join(" · ")}
                        </p>
                      )}

                      {item.note && (
                        <p className="text-xs text-sage-dark mt-1 bg-sage/10 rounded-lg px-2 py-1">
                          Note: {item.note}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                        <div className="flex items-center gap-1 bg-oatmeal rounded-full p-1">
                          <button onClick={() => updateQty(item.key, item.qty - 1)} className="w-8 h-8 rounded-full hover:bg-white hover:shadow-sm transition-all flex items-center justify-center" aria-label="Decrease quantity">
                            <Minus size={14} />
                          </button>
                          <span className="w-7 text-center text-sm font-semibold">{item.qty}</span>
                          <button onClick={() => updateQty(item.key, item.qty + 1)} className="w-8 h-8 rounded-full hover:bg-white hover:shadow-sm transition-all flex items-center justify-center" aria-label="Increase quantity">
                            <Plus size={14} />
                          </button>
                        </div>

                        <span className="font-bold text-primary">
                          {formatINR(item.product.price * item.qty)}
                        </span>
                      </div>

                      <div className="flex gap-3 mt-3">
                        <button
                          onClick={() => { toggle(item.product); removeItem(item.key); }}
                          className="flex items-center gap-1.5 text-xs text-warmgray hover:text-primary transition-colors"
                        >
                          <Heart size={13} /> Move to wishlist
                        </button>
                        <button
                          onClick={() => removeItem(item.key)}
                          className="flex items-center gap-1.5 text-xs text-warmgray hover:text-error transition-colors"
                        >
                          <Trash2 size={13} /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-5 shadow-card sticky top-24">
              <h2 className="font-heading font-bold text-lg text-cocoa mb-4">Order Summary</h2>

              {/* Coupon */}
              {!coupon ? (
                <form onSubmit={handleApplyCoupon} className="mb-4">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-warmgray" />
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(""); }}
                        placeholder="Coupon code"
                        className="input pl-9 py-2.5 text-sm"
                        aria-label="Coupon code"
                      />
                    </div>
                    <button type="submit" disabled={couponLoading} className="btn-primary btn-sm">
                      {couponLoading ? "..." : "Apply"}
                    </button>
                  </div>
                  {couponError && <p className="text-xs text-error mt-1.5">{couponError}</p>}
                  <p className="text-xs text-warmgray mt-1.5">Try: WELCOME10, FLAT200, HANDMADE15</p>
                </form>
              ) : (
                <div className="flex items-center justify-between bg-sage/10 rounded-xl px-3 py-2 mb-4">
                  <div className="flex items-center gap-2 text-sage-dark text-sm font-semibold">
                    <Check size={14} /> {coupon.code || couponCode} — {coupon.label}
                  </div>
                  <button onClick={clearCoupon} className="text-warmgray hover:text-error" aria-label="Remove coupon">
                    <X size={14} />
                  </button>
                </div>
              )}

              {couponSuccess && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="badge-sage mb-3 text-xs">
                  ✓ Coupon applied successfully!
                </motion.div>
              )}

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-warmgray">
                  <span>Subtotal</span>
                  <span className="font-semibold text-cocoa">{formatINR(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sage-dark">
                    <span>Discount</span>
                    <span className="font-semibold">−{formatINR(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-warmgray">
                  <span>Shipping</span>
                  <span className={`font-semibold ${shippingCost === 0 ? "text-sage-dark" : "text-cocoa"}`}>
                    {shippingCost === 0 ? "FREE" : formatINR(shippingCost)}
                  </span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between font-bold text-base text-cocoa">
                  <span>Total</span>
                  <span className="text-primary text-xl">{formatINR(total)}</span>
                </div>
              </div>

              <button
                onClick={() => navigate("/checkout")}
                className="btn-primary w-full btn-lg mt-5"
              >
                Proceed to Checkout <ArrowRight size={18} />
              </button>

              <Link to="/shop" className="block text-center text-sm text-warmgray hover:text-primary transition-colors mt-3 font-medium">
                ← Continue Shopping
              </Link>

              <div className="mt-4 pt-4 border-t border-border flex justify-center gap-2">
                {["UPI", "Visa", "Mastercard", "RuPay", "COD"].map((p) => (
                  <span key={p} className="text-xs bg-oatmeal px-2 py-1 rounded text-warmgray">{p}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

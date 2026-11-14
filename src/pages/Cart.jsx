import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag, Plus, Minus, Trash2, Heart, ArrowRight,
  Tag, Check
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

  const handleMoveToWishlist = (item) => {
    toggle(item.product);
    removeItem(item.key);
  };

  if (items.length === 0) {
    return (
      <>
        <Helmet>
          <title>Shopping Bag | Sri Yarn &amp; Tales</title>
        </Helmet>
        <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4 bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors">
          <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 mb-4">
            <ShoppingBag size={32} />
          </div>
          <h1 className="font-heading font-black text-2xl uppercase tracking-tight text-zinc-950 dark:text-white mb-2">
            Your Bag is Empty
          </h1>
          <p className="text-zinc-500 text-xs uppercase tracking-wider max-w-xs mb-6">
            Your shopping bag awaits handcrafted luxury pieces.
          </p>
          <Link to="/shop" className="btn-primary btn-lg">
            Explore Catalog <ArrowRight size={14} />
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`Shopping Bag (${items.reduce((s, i) => s + i.qty, 0)} items) | Sri Yarn & Tales`}</title>
      </Helmet>

      <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 pb-4 border-b border-zinc-200 dark:border-zinc-800">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400">
              Checkout Bag
            </p>
            <h1 className="font-heading font-black text-2xl sm:text-4xl uppercase tracking-tight text-zinc-950 dark:text-white">
              Shopping Bag ({items.reduce((s, i) => s + i.qty, 0)})
            </h1>
          </div>

          {/* Complimentary shipping bar */}
          {subtotal < brand.freeShippingThreshold ? (
            <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded p-4 mb-8">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                Add {formatINR(brand.freeShippingThreshold - subtotal)} more for Complimentary Shipping
              </p>
              <div className="h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-black dark:bg-white rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${freeShippingProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 rounded p-3 mb-8 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              ✓ Unlocked Complimentary Express Shipping Nationwide
            </div>
          )}

          <div className="grid lg:grid-cols-12 gap-10">
            {/* Bag Items (Left 8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.key}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50"
                  >
                    <Link to={`/product/${item.product.slug}`} className="flex-shrink-0">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded object-cover border border-zinc-200 dark:border-zinc-800"
                      />
                    </Link>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-4">
                          <Link to={`/product/${item.product.slug}`}>
                            <h2 className="font-heading font-black text-sm uppercase tracking-tight text-zinc-950 dark:text-white hover:underline">
                              {item.product.name}
                            </h2>
                          </Link>
                          <span className="font-mono font-black text-sm text-zinc-950 dark:text-white">
                            {formatINR(item.product.price * item.qty)}
                          </span>
                        </div>

                        {(item.variant.color || item.variant.size) && (
                          <p className="text-xs text-zinc-400 mt-1 font-medium">
                            {item.variant.color && <span>Colour: {item.variant.color}</span>}
                            {item.variant.color && item.variant.size && " // "}
                            {item.variant.size && <span>Size: {item.variant.size}</span>}
                          </p>
                        )}

                        {item.note && (
                          <p className="text-xs text-zinc-500 italic mt-1">
                            Note: "{item.note}"
                          </p>
                        )}
                      </div>

                      {/* Controls row */}
                      <div className="flex items-center justify-between pt-4 mt-2 border-t border-zinc-200 dark:border-zinc-800">
                        {/* Quantity */}
                        <div className="flex items-center border border-zinc-300 dark:border-zinc-700 rounded">
                          <button
                            onClick={() => updateQty(item.key, item.qty - 1)}
                            className="w-7 h-7 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={11} />
                          </button>
                          <span className="w-8 text-center font-mono font-bold text-xs">
                            {item.qty}
                          </span>
                          <button
                            onClick={() => updateQty(item.key, item.qty + 1)}
                            className="w-7 h-7 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                            aria-label="Increase quantity"
                          >
                            <Plus size={11} />
                          </button>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleMoveToWishlist(item)}
                            className="text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-black dark:hover:text-white flex items-center gap-1"
                          >
                            <Heart size={13} /> Save
                          </button>
                          <button
                            onClick={() => removeItem(item.key)}
                            className="text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-red-500 flex items-center gap-1"
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

            {/* Summary & Checkout (Right 4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 bg-zinc-50 dark:bg-zinc-950 space-y-4">
                <h2 className="font-heading font-black text-xs uppercase tracking-[0.2em] text-zinc-950 dark:text-white pb-3 border-b border-zinc-200 dark:border-zinc-800">
                  Order Summary
                </h2>

                <div className="space-y-2.5 text-xs font-bold uppercase tracking-wider">
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
                  <div className="flex justify-between font-black text-base border-t border-zinc-200 dark:border-zinc-800 pt-3 text-zinc-950 dark:text-white">
                    <span>Estimated Total</span>
                    <span className="font-mono">{formatINR(total)}</span>
                  </div>
                </div>

                {/* Coupon Input */}
                <form onSubmit={handleApplyCoupon} className="pt-2">
                  <label className="label">Promo / Atelier Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="e.g. WELCOME10"
                      className="input uppercase font-mono text-xs"
                      aria-label="Coupon code"
                    />
                    <button type="submit" disabled={couponLoading} className="btn-secondary btn-sm flex-shrink-0">
                      {couponLoading ? "..." : "Apply"}
                    </button>
                  </div>
                  {couponSuccess && (
                    <p className="text-xs text-emerald-600 font-bold mt-1.5">✓ Coupon Applied</p>
                  )}
                  {couponError && (
                    <p className="text-xs text-red-500 font-bold mt-1.5">{couponError}</p>
                  )}
                </form>

                <button
                  onClick={() => navigate("/checkout")}
                  className="btn-primary w-full btn-lg mt-4"
                >
                  Proceed to Checkout <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

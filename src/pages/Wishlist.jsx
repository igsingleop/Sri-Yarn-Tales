import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, X } from "lucide-react";
import ProductCard from "../components/product/ProductCard";
import { useWishlistStore, useCartStore } from "../store";

export default function Wishlist() {
  const { items, remove, clear } = useWishlistStore();
  const addItem = useCartStore((s) => s.addItem);

  const handleMoveAll = () => {
    items.forEach((p) => addItem(p, {}, 1));
    clear();
  };

  return (
    <>
      <Helmet>
        <title>Saved Wishlist | Sri Yarn &amp; Tales</title>
      </Helmet>

      <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-6 border-b border-zinc-200 dark:border-zinc-800 gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400">
                Personal Archive
              </p>
              <motion.h1
                className="font-heading font-black text-2xl sm:text-4xl uppercase tracking-tight text-zinc-950 dark:text-white"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
              >
                Saved Wishlist ({items.length})
              </motion.h1>
            </div>
            {items.length > 0 && (
              <button onClick={handleMoveAll} className="btn-primary">
                <ShoppingBag size={14} /> Move All to Bag
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-20 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 p-8">
              <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 mb-4">
                <Heart size={28} />
              </div>
              <h2 className="font-heading font-black text-xl uppercase tracking-tight text-zinc-950 dark:text-white mb-2">
                No Pieces Saved Yet
              </h2>
              <p className="text-zinc-500 text-xs uppercase tracking-wider max-w-xs mb-6">
                Click the heart icon on any product to save it to your curated collection.
              </p>
              <Link to="/shop" className="btn-primary">
                Explore The Shop
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 items-stretch">
              <AnimatePresence>
                {items.map((product, i) => (
                  <motion.div
                    key={product.id}
                    layout
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative"
                  >
                    <button
                      onClick={() => remove(product.id)}
                      aria-label="Remove from wishlist"
                      className="absolute top-2.5 right-12 z-20 w-8 h-8 rounded-full bg-white/90 dark:bg-black/90 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-black dark:hover:text-white shadow-xs"
                    >
                      <X size={12} />
                    </button>
                    <ProductCard product={product} index={i} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, Trash2, X } from "lucide-react";
import ProductCard from "../components/product/ProductCard";
import { useWishlistStore, useCartStore } from "../store";
import { formatINR } from "../lib/utils";

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
        <title>My Wishlist | Sri Yarn &amp; Tales</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div>
            <motion.h1 className="section-title" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              My Wishlist
            </motion.h1>
            <p className="text-warmgray mt-1">{items.length} saved item{items.length !== 1 ? "s" : ""}</p>
          </div>
          {items.length > 0 && (
            <button onClick={handleMoveAll} className="btn-primary">
              <ShoppingBag size={16} /> Move All to Cart
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center text-center py-24 gap-6"
          >
            <div className="w-28 h-28 rounded-full bg-primary-light flex items-center justify-center">
              <Heart size={52} className="text-primary/50" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-cocoa">No saved items yet</h2>
            <p className="text-warmgray max-w-xs">
              Heart any product to save it here. Great for keeping track of things you love!
            </p>
            <Link to="/shop" className="btn-primary btn-lg">
              Browse Products
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
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
                    className="absolute top-3 right-3 z-10 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow hover:bg-error hover:text-white transition-all"
                  >
                    <X size={14} />
                  </button>
                  <ProductCard product={product} index={i} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </>
  );
}

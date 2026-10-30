import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { searchProducts } from "../../lib/api";
import { formatINR, debounce } from "../../lib/utils";

export default function SearchOverlay({ open, onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const doSearch = debounce(async (q) => {
    if (!q || q.length < 2) { setResults([]); setLoading(false); return; }
    setLoading(true);
    const res = await searchProducts(q);
    setResults(res);
    setLoading(false);
  }, 300);

  useEffect(() => {
    doSearch(query);
  }, [query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const handleSelect = (slug) => {
    onClose();
    navigate(`/product/${slug}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onClose();
      navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-cocoa/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Search box */}
          <motion.div
            className="relative w-full max-w-2xl bg-cream rounded-3xl shadow-2xl overflow-hidden"
            initial={{ scale: 0.92, y: -20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, y: -20 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
          >
            <form onSubmit={handleSubmit} className="flex items-center gap-3 p-4 border-b border-border">
              {loading ? (
                <Loader2 size={20} className="text-primary animate-spin flex-shrink-0" />
              ) : (
                <Search size={20} className="text-warmgray flex-shrink-0" />
              )}
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for amigurumi, bags, baby items..."
                className="flex-1 bg-transparent text-cocoa placeholder:text-warmgray/60 text-base outline-none"
                aria-label="Search products"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="btn-ghost w-8 h-8 p-0 rounded-full"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </form>

            {/* Results */}
            <AnimatePresence>
              {results.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <ul className="divide-y divide-border max-h-80 overflow-y-auto">
                    {results.map((product) => (
                      <motion.li
                        key={product.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <button
                          onClick={() => handleSelect(product.slug)}
                          className="w-full flex items-center gap-3 p-4 hover:bg-oatmeal transition-colors text-left"
                        >
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-cocoa truncate">{product.name}</p>
                            <p className="text-xs text-warmgray capitalize">{product.category.replace("-", " ")}</p>
                          </div>
                          <span className="text-sm font-bold text-primary flex-shrink-0">
                            {formatINR(product.price)}
                          </span>
                        </button>
                      </motion.li>
                    ))}
                  </ul>
                  <div className="p-3 border-t border-border">
                    <button
                      onClick={handleSubmit}
                      className="flex items-center gap-2 text-sm text-primary font-semibold hover:gap-3 transition-all"
                    >
                      See all results for "{query}" <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Empty state */}
            {!loading && query.length >= 2 && results.length === 0 && (
              <div className="p-8 text-center text-warmgray text-sm">
                No products found for "{query}"
              </div>
            )}

            {/* Quick links when empty */}
            {!query && (
              <div className="p-4">
                <p className="text-xs font-semibold text-warmgray uppercase tracking-wider mb-3">
                  Popular searches
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Amigurumi", "Baby gifts", "Crochet bags", "Keychains", "Custom order"].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setQuery(tag)}
                      className="px-3 py-1.5 text-xs bg-oatmeal rounded-full text-warmgray hover:bg-primary-light hover:text-primary transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

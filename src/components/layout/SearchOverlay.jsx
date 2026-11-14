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
    if (!q || q.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const res = await searchProducts(q);
    setResults(res);
    setLoading(false);
  }, 250);

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
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
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
          className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-xs"
            onClick={onClose}
          />

          {/* Search Box Modal */}
          <motion.div
            className="relative w-full max-w-2xl bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden"
            initial={{ scale: 0.95, y: -16 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: -16 }}
            transition={{ type: "spring", damping: 28, stiffness: 350 }}
          >
            <form onSubmit={handleSubmit} className="flex items-center gap-3 p-4 border-b border-zinc-200 dark:border-zinc-800">
              {loading ? (
                <Loader2 size={18} className="text-zinc-500 animate-spin flex-shrink-0" />
              ) : (
                <Search size={18} className="text-zinc-400 flex-shrink-0" />
              )}
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search catalog: amigurumi, tote, scarf, decor..."
                className="flex-1 bg-transparent border-none text-sm sm:text-base font-sans font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none"
                aria-label="Search catalog"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="text-zinc-400 hover:text-black dark:hover:text-white p-1"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-black dark:hover:text-white px-2 py-1"
              >
                ESC
              </button>
            </form>

            {/* Results / Suggestions */}
            <div className="max-h-96 overflow-y-auto p-4 space-y-2">
              {query.length >= 2 && results.length === 0 && !loading && (
                <p className="text-center text-xs uppercase tracking-wider text-zinc-400 py-8">
                  No creations matching "{query}"
                </p>
              )}

              {results.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleSelect(product.slug)}
                  className="flex items-center gap-3.5 w-full p-2.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 text-left transition-colors group"
                >
                  <img
                    src={product.images[0]}
                    alt=""
                    className="w-12 h-12 rounded object-cover flex-shrink-0 border border-zinc-200 dark:border-zinc-800"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-heading font-bold text-xs uppercase tracking-wider text-zinc-950 dark:text-white truncate group-hover:text-zinc-600 dark:group-hover:text-zinc-300">
                      {product.name}
                    </p>
                    <p className="text-[11px] text-zinc-400 uppercase tracking-widest font-semibold mt-0.5">
                      {product.category.replace("-", " ")}
                    </p>
                  </div>
                  <span className="font-mono font-bold text-xs text-zinc-950 dark:text-white">
                    {formatINR(product.price)}
                  </span>
                  <ArrowRight size={14} className="text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ))}

              {!query && (
                <div className="py-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2.5">
                    Popular Searches
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {["Amigurumi Bunny", "Market Bag", "Wool Scarf", "Macramé Wall Hanging", "Baby Booties"].map((term) => (
                      <button
                        key={term}
                        onClick={() => setQuery(term)}
                        className="text-xs px-2.5 py-1 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-black dark:hover:border-white transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useParams } from "react-router-dom";
import {
  SlidersHorizontal, Grid2x2, Grid3x3, X, ChevronDown,
  Star
} from "lucide-react";
import ProductCard, { ProductCardSkeleton } from "../components/product/ProductCard";
import { getProducts, getCategories } from "../lib/api";
import { brand } from "../config/brand";
import { useProductStore, useCategoryStore } from "../store";

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Best Rated" },
  { value: "bestsellers", label: "Bestsellers" },
];

const colorOptions = [
  { name: "Rose", hex: "#D4768A" },
  { name: "Sage", hex: "#8FA98B" },
  { name: "Yellow", hex: "#F4D58D" },
  { name: "Cocoa", hex: "#3B2A2F" },
  { name: "Natural", hex: "#F5DEB3" },
  { name: "Pink", hex: "#F9C6C9" },
  { name: "Blue", hex: "#BBDEFB" },
];

function FilterSidebar({ filters, setFilters, categories, onClose, mobile = false }) {
  const handleCategoryToggle = (slug) => {
    setFilters((f) => ({ ...f, category: f.category === slug ? null : slug }));
  };

  const handleColorToggle = (name) => {
    setFilters((f) => ({
      ...f,
      colors: f.colors?.includes(name)
        ? f.colors.filter((c) => c !== name)
        : [...(f.colors || []), name],
    }));
  };

  const clearAll = () => {
    setFilters({ category: null, minPrice: 0, maxPrice: 5000, colors: [], rating: 0, inStock: false, isCustomizable: false });
  };

  return (
    <div className={`${mobile ? "p-5" : "space-y-6"}`}>
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
        <h2 className="font-heading font-black text-xs uppercase tracking-[0.2em] text-zinc-950 dark:text-white">
          Filter By
        </h2>
        <button onClick={clearAll} className="text-xs text-zinc-500 hover:text-black dark:hover:text-white font-bold uppercase tracking-wider underline">
          Reset
        </button>
      </div>

      {/* Category */}
      <div>
        <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-900 dark:text-zinc-100 mb-3">
          Category
        </h3>
        <div className="space-y-1.5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryToggle(cat.slug)}
              className={`flex items-center justify-between w-full px-3 py-2 rounded text-xs font-semibold uppercase tracking-wider transition-all ${
                filters.category === cat.slug
                  ? "bg-black text-white dark:bg-white dark:text-black font-bold"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white"
              }`}
            >
              <span>{cat.name}</span>
              <span className="text-[10px] opacity-60 font-mono">{cat.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-900 dark:text-zinc-100 mb-2">
          Max Price: {brand.currencySymbol}{filters.maxPrice}
        </h3>
        <div className="space-y-2">
          <input
            type="range"
            min={0}
            max={5000}
            step={100}
            value={filters.maxPrice}
            onChange={(e) => setFilters((f) => ({ ...f, maxPrice: +e.target.value }))}
            className="w-full accent-black dark:accent-white"
            aria-label="Maximum price filter"
          />
          <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
            <span>{brand.currencySymbol}0</span>
            <span>{brand.currencySymbol}5,000+</span>
          </div>
        </div>
      </div>

      {/* Colors */}
      <div>
        <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-900 dark:text-zinc-100 mb-2.5">
          Colour Palette
        </h3>
        <div className="flex flex-wrap gap-2">
          {colorOptions.map((c) => (
            <button
              key={c.name}
              onClick={() => handleColorToggle(c.name)}
              title={c.name}
              aria-label={`Filter by ${c.name}`}
              className={`w-6 h-6 rounded-full border transition-all ${
                filters.colors?.includes(c.name)
                  ? "border-black dark:border-white scale-110 ring-2 ring-black/40 dark:ring-white/40"
                  : "border-zinc-300 dark:border-zinc-700"
              }`}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
      </div>

      {/* Rating */}
      <div>
        <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-900 dark:text-zinc-100 mb-2">
          Minimum Rating
        </h3>
        <div className="space-y-1">
          {[4.5, 4, 3.5, 0].map((r) => (
            <button
              key={r}
              onClick={() => setFilters((f) => ({ ...f, rating: r }))}
              className={`flex items-center gap-2 w-full px-3 py-1.5 rounded text-xs transition-all ${
                filters.rating === r
                  ? "bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white font-bold"
                  : "text-zinc-500 hover:text-black dark:hover:text-white"
              }`}
            >
              <div className="flex text-amber-500 text-xs">
                {"★".repeat(Math.round(r || 5))}
              </div>
              <span className="font-bold">{r === 0 ? "All Ratings" : `${r}+ Stars`}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
            In Stock Only
          </span>
          <button
            role="switch"
            aria-checked={filters.inStock}
            onClick={() => setFilters((f) => ({ ...f, inStock: !f.inStock }))}
            className={`w-10 h-5 rounded-full transition-colors duration-200 ${
              filters.inStock ? "bg-black dark:bg-white" : "bg-zinc-300 dark:bg-zinc-700"
            } relative`}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 rounded-full transition-transform duration-200 ${
                filters.inStock
                  ? "translate-x-5 bg-white dark:bg-black"
                  : "translate-x-0.5 bg-white"
              }`}
            />
          </button>
        </label>
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
            Customisable Only
          </span>
          <button
            role="switch"
            aria-checked={filters.isCustomizable}
            onClick={() => setFilters((f) => ({ ...f, isCustomizable: !f.isCustomizable }))}
            className={`w-10 h-5 rounded-full transition-colors duration-200 ${
              filters.isCustomizable ? "bg-black dark:bg-white" : "bg-zinc-300 dark:bg-zinc-700"
            } relative`}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 rounded-full transition-transform duration-200 ${
                filters.isCustomizable
                  ? "translate-x-5 bg-white dark:bg-black"
                  : "translate-x-0.5 bg-white"
              }`}
            />
          </button>
        </label>
      </div>

      {mobile && (
        <button onClick={onClose} className="btn-primary w-full mt-4">
          Apply Filters
        </button>
      )}
    </div>
  );
}

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { category: routeCategory } = useParams();
  const storeProducts = useProductStore((s) => s.products);
  const storeCategories = useCategoryStore((s) => s.categories);

  const initialCat = routeCategory || searchParams.get("category") || null;
  const initialSearch = searchParams.get("search") || "";

  const [products, setProducts] = useState(() => {
    let list = Array.isArray(storeProducts) ? storeProducts : [];
    if (initialCat) {
      list = list.filter((p) => p.category === initialCat);
    }
    return list;
  });

  const [categories, setCategories] = useState(() => {
    return Array.isArray(storeCategories) && storeCategories.length > 0
      ? storeCategories.map((cat) => ({
          ...cat,
          count: (Array.isArray(storeProducts) ? storeProducts : []).filter(
            (p) => p.category === cat.slug
          ).length,
        }))
      : [];
  });

  const [loading, setLoading] = useState(false);
  const [gridCols, setGridCols] = useState(3);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sort, setSort] = useState(searchParams.get("sort") || "featured");

  const [filters, setFilters] = useState({
    category: initialCat,
    search: initialSearch,
    minPrice: 0,
    maxPrice: 5000,
    colors: [],
    rating: 0,
    inStock: false,
    isCustomizable: false,
  });

  useEffect(() => {
    let isCurrent = true;
    const executeFetch = async () => {
      const data = await getProducts({ ...filters, sort });
      if (isCurrent) {
        setProducts(data);
        setLoading(false);
      }
    };

    if (filters.search) {
      setLoading(true);
      const timer = setTimeout(executeFetch, 150);
      return () => {
        isCurrent = false;
        clearTimeout(timer);
      };
    } else {
      executeFetch();
    }
  }, [filters, sort, storeProducts]);

  useEffect(() => {
    getCategories().then(setCategories);
  }, [storeProducts, storeCategories]);

  const activeFilterCount = [
    filters.category,
    filters.maxPrice < 5000,
    filters.colors?.length > 0,
    filters.rating > 0,
    filters.inStock,
    filters.isCustomizable,
  ].filter(Boolean).length;

  const removeFilter = (key) => {
    setFilters((f) => ({
      ...f,
      [key]: key === "colors" ? [] : key === "maxPrice" ? 5000 : key === "rating" ? 0 : false,
    }));
  };

  return (
    <>
      <Helmet>
        <title>
          {filters.category
            ? `${categories.find((c) => c.slug === filters.category)?.name || "Collection"} | Sri Yarn & Tales`
            : "Shop Minimalist Luxury Handmade Crochet | Sri Yarn & Tales"}
        </title>
        <meta name="description" content="Browse our catalog of handcrafted crochet creations: amigurumi toys, architectural bags, bespoke home decor, and luxury wearables." />
      </Helmet>

      <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors">
        {/* Page Header — Architectural Minimalism */}
        <div className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 py-12 px-4">
          <div className="max-w-7xl mx-auto text-center space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400">
              The Catalog // 2026 Edition
            </p>
            <motion.h1
              className="font-heading font-black text-3xl sm:text-5xl uppercase tracking-tight text-zinc-950 dark:text-white"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {filters.category
                ? categories.find((c) => c.slug === filters.category)?.name || "Collection"
                : "All Creations"}
            </motion.h1>
            {filters.search && (
              <p className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">
                Showing results matching: <strong className="text-black dark:text-white font-black">"{filters.search}"</strong>
              </p>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Top Toolbar */}
          <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              {/* Mobile filter button */}
              <button
                onClick={() => setFilterOpen(true)}
                className="flex items-center gap-2 btn-secondary btn-sm lg:hidden"
              >
                <SlidersHorizontal size={14} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="w-4 h-4 bg-black text-white dark:bg-white dark:text-black text-[9px] rounded-full flex items-center justify-center font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                <span className="text-zinc-950 dark:text-white font-black">{products.length}</span> Products
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Sort Selector */}
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="appearance-none text-xs font-bold uppercase tracking-wider bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded pl-3 pr-8 py-2 text-zinc-900 dark:text-zinc-100 cursor-pointer focus:outline-none focus:border-black dark:focus:border-white"
                  aria-label="Sort products"
                >
                  {sortOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              </div>

              {/* Grid Column Toggle */}
              <div className="hidden sm:flex items-center gap-1 border border-zinc-200 dark:border-zinc-800 rounded p-0.5">
                <button
                  onClick={() => setGridCols(2)}
                  className={`w-7 h-7 rounded flex items-center justify-center transition-all ${
                    gridCols === 2 ? "bg-black text-white dark:bg-white dark:text-black" : "text-zinc-400"
                  }`}
                  aria-label="2 column grid"
                >
                  <Grid2x2 size={14} />
                </button>
                <button
                  onClick={() => setGridCols(3)}
                  className={`w-7 h-7 rounded flex items-center justify-center transition-all ${
                    gridCols === 3 ? "bg-black text-white dark:bg-white dark:text-black" : "text-zinc-400"
                  }`}
                  aria-label="3 column grid"
                >
                  <Grid3x3 size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Active Filter Chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {filters.category && (
                <span className="badge bg-black text-white dark:bg-white dark:text-black flex items-center gap-1.5 text-[10px]">
                  {categories.find((c) => c.slug === filters.category)?.name}
                  <button onClick={() => setFilters((f) => ({ ...f, category: null }))} aria-label="Remove category filter">
                    <X size={10} />
                  </button>
                </span>
              )}
              {filters.maxPrice < 5000 && (
                <span className="badge bg-black text-white dark:bg-white dark:text-black flex items-center gap-1.5 text-[10px]">
                  Under {brand.currencySymbol}{filters.maxPrice}
                  <button onClick={() => removeFilter("maxPrice")} aria-label="Remove price filter">
                    <X size={10} />
                  </button>
                </span>
              )}
              {filters.inStock && (
                <span className="badge bg-black text-white dark:bg-white dark:text-black flex items-center gap-1.5 text-[10px]">
                  In Stock
                  <button onClick={() => removeFilter("inStock")} aria-label="Remove in stock filter">
                    <X size={10} />
                  </button>
                </span>
              )}
              {filters.isCustomizable && (
                <span className="badge bg-black text-white dark:bg-white dark:text-black flex items-center gap-1.5 text-[10px]">
                  Customisable
                  <button onClick={() => removeFilter("isCustomizable")} aria-label="Remove customisable filter">
                    <X size={10} />
                  </button>
                </span>
              )}
            </div>
          )}

          <div className="flex gap-8">
            {/* Desktop Filter Sidebar */}
            <aside className="hidden lg:block w-60 flex-shrink-0">
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 bg-white dark:bg-zinc-950 sticky top-24">
                <FilterSidebar
                  filters={filters}
                  setFilters={setFilters}
                  categories={categories}
                />
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1 min-w-0">
              {loading ? (
                <div className={`grid gap-4 sm:gap-6 items-stretch ${gridCols === 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"}`}>
                  {Array(6).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-20 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 p-8">
                  <h2 className="font-heading font-black text-xl uppercase tracking-tight text-zinc-950 dark:text-white mb-2">
                    No Creations Matched
                  </h2>
                  <p className="text-zinc-500 text-xs uppercase tracking-wider mb-6">
                    Try adjusting your filters or search keywords.
                  </p>
                  <button
                    onClick={() => setFilters({ category: null, minPrice: 0, maxPrice: 5000, colors: [], rating: 0, inStock: false, isCustomizable: false })}
                    className="btn-primary"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className={`grid gap-3 sm:gap-6 items-stretch ${gridCols === 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"}`}>
                  {products.map((p, i) => (
                    <ProductCard key={p.id} product={p} index={i} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter Slide Drawer */}
      <AnimatePresence>
        {filterOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 z-50 backdrop-blur-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFilterOpen(false)}
            />
            <motion.div
              className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 rounded-t-xl z-50 max-h-[85vh] overflow-y-auto"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 350 }}
            >
              <div className="w-10 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mt-3 mb-1" />
              <FilterSidebar
                filters={filters}
                setFilters={setFilters}
                categories={categories}
                mobile
                onClose={() => setFilterOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

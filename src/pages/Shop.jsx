import React, { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import {
  SlidersHorizontal, Grid2x2, Grid3x3, X, ChevronDown,
  Star, Check
} from "lucide-react";
import ProductCard, { ProductCardSkeleton } from "../components/product/ProductCard";
import { getProducts, getCategories } from "../lib/api";
import { brand } from "../config/brand";
import { debounce } from "../lib/utils";
import { useProductStore } from "../store";

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
    <div className={`${mobile ? "p-5" : "sticky top-24 space-y-6"}`}>
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-bold text-cocoa text-lg">Filters</h2>
        <button onClick={clearAll} className="text-xs text-primary font-semibold hover:underline">
          Clear All
        </button>
      </div>

      {/* Category */}
      <div>
        <h3 className="font-semibold text-sm text-cocoa mb-3">Category</h3>
        <div className="space-y-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryToggle(cat.slug)}
              className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-sm transition-all ${
                filters.category === cat.slug
                  ? "bg-primary-light text-primary font-semibold"
                  : "hover:bg-oatmeal text-warmgray"
              }`}
            >
              <span>{cat.name}</span>
              <span className="text-xs opacity-60">{cat.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold text-sm text-cocoa mb-3">
          Price: {brand.currencySymbol}{filters.minPrice} – {brand.currencySymbol}{filters.maxPrice}
        </h3>
        <div className="space-y-2">
          <input
            type="range"
            min={0}
            max={5000}
            step={100}
            value={filters.maxPrice}
            onChange={(e) => setFilters((f) => ({ ...f, maxPrice: +e.target.value }))}
            className="w-full accent-primary"
            aria-label="Maximum price filter"
          />
          <div className="flex justify-between text-xs text-warmgray">
            <span>{brand.currencySymbol}0</span>
            <span>{brand.currencySymbol}5,000+</span>
          </div>
        </div>
      </div>

      {/* Colors */}
      <div>
        <h3 className="font-semibold text-sm text-cocoa mb-3">Colour</h3>
        <div className="flex flex-wrap gap-2">
          {colorOptions.map((c) => (
            <button
              key={c.name}
              onClick={() => handleColorToggle(c.name)}
              title={c.name}
              aria-label={`Filter by ${c.name}`}
              className={`w-7 h-7 rounded-full border-2 transition-all ${
                filters.colors?.includes(c.name)
                  ? "border-primary scale-110 ring-2 ring-primary/30"
                  : "border-white ring-1 ring-border"
              }`}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
      </div>

      {/* Rating */}
      <div>
        <h3 className="font-semibold text-sm text-cocoa mb-3">Min Rating</h3>
        <div className="space-y-1">
          {[4.5, 4, 3.5, 0].map((r) => (
            <button
              key={r}
              onClick={() => setFilters((f) => ({ ...f, rating: r }))}
              className={`flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm transition-all ${
                filters.rating === r
                  ? "bg-primary-light text-primary font-semibold"
                  : "hover:bg-oatmeal text-warmgray"
              }`}
            >
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} size={11} fill={s <= Math.round(r) ? "#F4D58D" : "none"} className={s <= Math.round(r) ? "text-butter-dark" : "text-border"} />
                ))}
              </div>
              <span>{r === 0 ? "All" : `${r}+`}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-3">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm font-medium text-cocoa">In Stock Only</span>
          <button
            role="switch"
            aria-checked={filters.inStock}
            onClick={() => setFilters((f) => ({ ...f, inStock: !f.inStock }))}
            className={`w-11 h-6 rounded-full transition-colors duration-200 ${filters.inStock ? "bg-primary" : "bg-border"} relative`}
          >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${filters.inStock ? "translate-x-6" : "translate-x-1"}`} />
          </button>
        </label>
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm font-medium text-cocoa">Customisable</span>
          <button
            role="switch"
            aria-checked={filters.isCustomizable}
            onClick={() => setFilters((f) => ({ ...f, isCustomizable: !f.isCustomizable }))}
            className={`w-11 h-6 rounded-full transition-colors duration-200 ${filters.isCustomizable ? "bg-primary" : "bg-border"} relative`}
          >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${filters.isCustomizable ? "translate-x-6" : "translate-x-1"}`} />
          </button>
        </label>
      </div>

      {mobile && (
        <button onClick={onClose} className="btn-primary w-full mt-2">
          Show Results
        </button>
      )}
    </div>
  );
}

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gridCols, setGridCols] = useState(3);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sort, setSort] = useState(searchParams.get("sort") || "featured");

  const [filters, setFilters] = useState({
    category: searchParams.get("category") || null,
    search: searchParams.get("search") || "",
    minPrice: 0,
    maxPrice: 5000,
    colors: [],
    rating: 0,
    inStock: false,
    isCustomizable: false,
  });

  // Sync filters to URL
  useEffect(() => {
    const params = {};
    if (filters.category) params.category = filters.category;
    if (filters.search) params.search = filters.search;
    if (sort !== "featured") params.sort = sort;
    setSearchParams(params, { replace: true });
  }, [filters, sort]);

  const storeProducts = useProductStore((s) => s.products);

  // Fetch products immediately on storeProducts or filter change
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
      const timer = setTimeout(executeFetch, 200);
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
  }, [storeProducts]);

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
        <title>Shop Handmade Crochet | Sri Yarn &amp; Tales</title>
        <meta name="description" content="Browse our full collection of handmade crochet products — amigurumi, bags, home decor, wearables, baby items, and accessories." />
      </Helmet>

      <div className="min-h-screen bg-cream">
        {/* Page Header */}
        <div className="bg-gradient-to-br from-primary-light to-cream py-12 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <motion.h1
              className="section-title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {filters.category
                ? categories.find((c) => c.slug === filters.category)?.name || "Shop"
                : "All Products"}
            </motion.h1>
            {filters.search && (
              <p className="text-warmgray mt-2">
                Results for: <strong>"{filters.search}"</strong>
              </p>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              {/* Mobile filter button */}
              <button
                onClick={() => setFilterOpen(true)}
                className="flex items-center gap-2 btn-secondary btn-sm lg:hidden"
              >
                <SlidersHorizontal size={16} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <p className="text-sm text-warmgray">
                <span className="font-semibold text-cocoa">{products.length}</span> products
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Sort */}
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="appearance-none text-sm bg-white border border-border rounded-xl pl-3 pr-8 py-2.5 text-cocoa cursor-pointer focus:outline-none focus:border-primary"
                  aria-label="Sort products"
                >
                  {sortOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-warmgray pointer-events-none" />
              </div>

              {/* Grid toggle */}
              <div className="hidden sm:flex items-center gap-1 bg-oatmeal rounded-xl p-1">
                <button
                  onClick={() => setGridCols(2)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${gridCols === 2 ? "bg-white shadow-sm text-primary" : "text-warmgray"}`}
                  aria-label="2 column grid"
                >
                  <Grid2x2 size={15} />
                </button>
                <button
                  onClick={() => setGridCols(3)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${gridCols === 3 ? "bg-white shadow-sm text-primary" : "text-warmgray"}`}
                  aria-label="3 column grid"
                >
                  <Grid3x3 size={15} />
                </button>
              </div>
            </div>
          </div>

          {/* Active filter chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {filters.category && (
                <span className="badge-primary flex items-center gap-1.5">
                  {categories.find((c) => c.slug === filters.category)?.name}
                  <button onClick={() => setFilters((f) => ({ ...f, category: null }))} aria-label="Remove category filter">
                    <X size={12} />
                  </button>
                </span>
              )}
              {filters.maxPrice < 5000 && (
                <span className="badge-primary flex items-center gap-1.5">
                  Under {brand.currencySymbol}{filters.maxPrice}
                  <button onClick={() => removeFilter("maxPrice")} aria-label="Remove price filter"><X size={12} /></button>
                </span>
              )}
              {filters.inStock && (
                <span className="badge-primary flex items-center gap-1.5">
                  In Stock
                  <button onClick={() => removeFilter("inStock")} aria-label="Remove in stock filter"><X size={12} /></button>
                </span>
              )}
              {filters.isCustomizable && (
                <span className="badge-primary flex items-center gap-1.5">
                  Customisable
                  <button onClick={() => removeFilter("isCustomizable")} aria-label="Remove customizable filter"><X size={12} /></button>
                </span>
              )}
            </div>
          )}

          <div className="flex gap-8">
            {/* Sidebar — desktop */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="bg-white rounded-3xl p-6 shadow-card">
                <FilterSidebar
                  filters={filters}
                  setFilters={setFilters}
                  categories={categories}
                />
              </div>
            </aside>

            {/* Products grid */}
            <div className="flex-1 min-w-0">
              {loading ? (
                <div className={`grid gap-4 sm:gap-6 ${gridCols === 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"}`}>
                  {Array(6).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)}
                </div>
              ) : products.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-24"
                >
                  <div className="text-6xl mb-4">🧶</div>
                  <h2 className="font-heading text-2xl text-cocoa mb-2">No products found</h2>
                  <p className="text-warmgray mb-6">Try adjusting your filters or search term</p>
                  <button
                    onClick={() => setFilters({ category: null, minPrice: 0, maxPrice: 5000, colors: [], rating: 0, inStock: false, isCustomizable: false })}
                    className="btn-primary"
                  >
                    Clear Filters
                  </button>
                </motion.div>
              ) : (
                <div className={`grid gap-4 sm:gap-6 ${gridCols === 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"}`}>
                  {products.map((p, i) => (
                    <ProductCard key={p.id} product={p} index={i} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {filterOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-cocoa/40 z-50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFilterOpen(false)}
            />
            <motion.div
              className="fixed bottom-0 left-0 right-0 bg-cream rounded-t-4xl z-50 max-h-[85vh] overflow-y-auto"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 350 }}
            >
              <div className="w-12 h-1 bg-border rounded-full mx-auto mt-3 mb-2" />
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

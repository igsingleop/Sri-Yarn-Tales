import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star, Heart, ShoppingBag, Share2, ChevronDown, ChevronLeft,
  ChevronRight, Check, Truck, RefreshCw, Shield, MapPin,
  Loader2, Minus, Plus, ArrowLeft
} from "lucide-react";
import ProductCard from "../components/product/ProductCard";
import { getProductBySlug, getReviewsByProduct, getRelatedProducts, checkPincode } from "../lib/api";
import { useCartStore, useWishlistStore, useProductStore } from "../store";
import { formatINR, getDiscountPercent } from "../lib/utils";
import { brand } from "../config/brand";
import reviewsData from "../data/reviews.json";

function RatingBar({ label, count, total }) {
  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="text-zinc-500 dark:text-zinc-400 w-4 font-bold">{label}</span>
      <div className="flex-1 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-amber-400 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: total > 0 ? `${(count / total) * 100}%` : "0%" }}
          transition={{ duration: 0.6 }}
        />
      </div>
      <span className="text-zinc-400 w-6 text-right font-mono">{count}</span>
    </div>
  );
}

function AccordionItem({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-zinc-200 dark:border-zinc-800">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full py-4 text-left"
        aria-expanded={open}
      >
        <span className="font-heading font-black text-xs uppercase tracking-wider text-zinc-950 dark:text-white">
          {title}
        </span>
        <ChevronDown size={14} className={`text-zinc-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-4 text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm leading-relaxed">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const storeProducts = useProductStore((s) => s.products);

  const initialProduct = Array.isArray(storeProducts)
    ? storeProducts.find((item) => item.slug === slug)
    : null;

  const [product, setProduct] = useState(initialProduct || null);
  const [reviews, setReviews] = useState(() => {
    if (!initialProduct) return [];
    return reviewsData.filter((r) => r.productId === initialProduct.id);
  });
  const [related, setRelated] = useState(() => {
    if (!initialProduct || !Array.isArray(storeProducts)) return [];
    return storeProducts
      .filter((p) => p.category === initialProduct.category && p.id !== initialProduct.id)
      .slice(0, 4);
  });
  const [loading, setLoading] = useState(!initialProduct);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedColor, setSelectedColor] = useState(() => initialProduct?.colorNames?.[0] || null);
  const [selectedSize, setSelectedSize] = useState(() => initialProduct?.sizes?.[0] || null);
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const [added, setAdded] = useState(false);
  const [pincode, setPincode] = useState("");
  const [pincodeResult, setPincodeResult] = useState(null);
  const [pincodeLoading, setPincodeLoading] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const { toggle, isWishlisted } = useWishlistStore();
  const wishlisted = product ? isWishlisted(product.id) : false;

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    setActiveImg(0);
    const p = storeProducts.find((item) => item.slug === slug);
    if (p) {
      setProduct(p);
      setSelectedColor((prev) => (prev && p.colorNames?.includes(prev) ? prev : p.colorNames?.[0]));
      setSelectedSize((prev) => (prev && p.sizes?.includes(prev) ? prev : p.sizes?.[0]));
      setLoading(false);
      Promise.all([
        getReviewsByProduct(p.id),
        getRelatedProducts(p.id, p.category),
      ]).then(([revs, rel]) => {
        setReviews(revs);
        setRelated(rel);
      });
    } else {
      setLoading(true);
      getProductBySlug(slug).then((fetched) => {
        setProduct(fetched);
        if (fetched) {
          setSelectedColor(fetched.colorNames?.[0]);
          setSelectedSize(fetched.sizes?.[0]);
          Promise.all([
            getReviewsByProduct(fetched.id),
            getRelatedProducts(fetched.id, fetched.category),
          ]).then(([revs, rel]) => {
            setReviews(revs);
            setRelated(rel);
            setLoading(false);
          });
        } else {
          setLoading(false);
        }
      });
    }
  }, [slug, storeProducts]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, { color: selectedColor, size: selectedSize }, qty, note);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate("/checkout");
  };

  const handlePincodeCheck = async (e) => {
    e.preventDefault();
    if (!pincode || pincode.length !== 6) return;
    setPincodeLoading(true);
    const res = await checkPincode(pincode);
    setPincodeResult(res);
    setPincodeLoading(false);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${product.name} | Sri Yarn & Tales`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center">
        <Loader2 size={32} className="animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h1 className="font-heading font-black text-2xl uppercase tracking-tight text-zinc-950 dark:text-white mb-4">
          Creation Not Found
        </h1>
        <p className="text-zinc-500 mb-6">The product you are looking for may have retired from our collection.</p>
        <Link to="/shop" className="btn-primary">
          Return to Shop
        </Link>
      </div>
    );
  }

  const discount = getDiscountPercent(product.price, product.comparePrice);
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : product.rating;

  const ratingBreakdown = [5, 4, 3, 2, 1].map((stars) => ({
    label: `${stars}★`,
    count: reviews.filter((r) => r.rating === stars).length,
  }));

  return (
    <>
      <Helmet>
        <title>{`${product.name} | Sri Yarn & Tales`}</title>
        <meta name="description" content={product.description} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": product.name,
            "description": product.description,
            "image": product.images,
            "offers": {
              "@type": "Offer",
              "price": product.price,
              "priceCurrency": "INR",
              "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": avgRating,
              "reviewCount": product.reviewCount || 1,
            },
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors pb-24">
        {/* Breadcrumbs & Back Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center justify-between gap-3">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 overflow-hidden">
              <Link to="/" className="hover:text-black dark:hover:text-white flex-shrink-0">Home</Link>
              <span>/</span>
              <Link to="/shop" className="hover:text-black dark:hover:text-white flex-shrink-0">Shop</Link>
              <span>/</span>
              <Link to={`/shop/${product.category}`} className="hover:text-black dark:hover:text-white flex-shrink-0">
                {product.category.replace("-", " ")}
              </Link>
              <span>/</span>
              <span className="text-zinc-950 dark:text-white truncate">{product.name}</span>
            </nav>
            <button
              type="button"
              onClick={() => {
                if (window.history.length > 1) navigate(-1);
                else navigate("/shop");
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 transition-colors flex-shrink-0 active:scale-95"
            >
              <ArrowLeft size={12} className="stroke-[2.5]" />
              <span>Back</span>
            </button>
          </div>
        </div>

        {/* Product Details Layout — Screen Fit Hero */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Gallery (Left 6 Columns — Viewport-Bounded) */}
            <div className="lg:col-span-6 space-y-2">
              {/* Main Image */}
              <div className="relative rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 w-full h-[280px] sm:h-[360px] md:h-[400px] lg:h-[min(480px,calc(100vh-210px))] flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImg}
                    src={product.images[activeImg]}
                    alt={`${product.name} - view ${activeImg + 1}`}
                    className="w-full h-full object-cover"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                </AnimatePresence>

                {/* Left/Right controls */}
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImg((i) => (i - 1 + product.images.length) % product.images.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 dark:bg-black/90 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-black dark:text-white shadow-sm"
                      aria-label="Previous photo"
                    >
                      <ChevronLeft size={15} />
                    </button>
                    <button
                      onClick={() => setActiveImg((i) => (i + 1) % product.images.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 dark:bg-black/90 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-black dark:text-white shadow-sm"
                      aria-label="Next photo"
                    >
                      <ChevronRight size={15} />
                    </button>
                  </>
                )}

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                  {product.isNew && (
                    <span className="badge bg-white text-black border border-zinc-200 dark:bg-zinc-900 dark:text-white dark:border-zinc-700 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5">
                      New Arrival
                    </span>
                  )}
                  {discount > 0 && (
                    <span className="badge bg-red-600 text-white text-[9px] font-bold uppercase tracking-widest px-2 py-0.5">
                      -{discount}%
                    </span>
                  )}
                </div>
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 pt-0.5">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`w-11 h-11 sm:w-12 sm:h-12 rounded overflow-hidden border-2 transition-all flex-shrink-0 ${activeImg === i ? "border-black dark:border-white scale-105" : "border-zinc-200 dark:border-zinc-800 opacity-70 hover:opacity-100"
                        }`}
                      aria-label={`View photo ${i + 1}`}
                    >
                      <img src={img} alt={`${product.name} thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info (Right 6 Columns — Compact Screen Fit) */}
            <div className="lg:col-span-6 space-y-2 sm:space-y-2.5">
              {/* Category & Share */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                  {product.category.replace("-", " ")}
                </span>
                <button
                  onClick={handleShare}
                  className="btn-ghost w-7 h-7 rounded-full flex items-center justify-center text-zinc-500 hover:text-black dark:hover:text-white"
                  aria-label="Share product"
                >
                  <Share2 size={13} />
                </button>
              </div>

              {/* Title */}
              <h1 className="font-heading font-black text-xl sm:text-2xl lg:text-3xl uppercase tracking-tight text-zinc-950 dark:text-white leading-tight">
                {product.name}
              </h1>

              {/* Ratings */}
              <div className="flex items-center gap-2">
                <div className="flex text-amber-500 dark:text-amber-400 text-xs">
                  {"★".repeat(Math.round(avgRating || 5))}
                  {"☆".repeat(5 - Math.round(avgRating || 5))}
                </div>
                <span className="font-bold text-xs font-mono text-zinc-900 dark:text-zinc-100">{avgRating}</span>
                <span className="text-[11px] text-zinc-400">({product.reviewCount} Reviews)</span>
              </div>

              {/* Pricing */}
              <div className="flex items-baseline gap-2.5 pt-0.5">
                <span className="price text-xl sm:text-2xl font-black text-zinc-950 dark:text-white">
                  {formatINR(product.price)}
                </span>
                {product.comparePrice && (
                  <span className="price-compare text-xs sm:text-sm text-zinc-400 line-through">
                    {formatINR(product.comparePrice)}
                  </span>
                )}
                {discount > 0 && (
                  <span className="badge bg-red-600 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5">
                    Save {brand.currencySymbol}{product.comparePrice - product.price}
                  </span>
                )}
              </div>

              {/* Stock Status & Customisable Tag */}
              <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-wider">
                {product.stock > 0 ? (
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{product.stock <= 5 ? `Only ${product.stock} Units Left` : "In Stock — Ready to Dispatch"}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-red-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    <span>Sold Out</span>
                  </div>
                )}
                {product.isCustomizable && (
                  <span className="text-[10px] text-zinc-400 font-semibold border-l border-zinc-200 dark:border-zinc-800 pl-3">
                    Customisable
                  </span>
                )}
              </div>

              {/* Color Selector */}
              {product.colors && product.colors.length > 0 && (
                <div className="pt-0.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 mb-1">
                    Colourway: <span className="text-zinc-500 font-normal">{selectedColor}</span>
                  </p>
                  <div className="flex gap-1.5 flex-wrap">
                    {product.colors.map((hex, i) => (
                      <button
                        key={hex}
                        onClick={() => setSelectedColor(product.colorNames[i])}
                        aria-label={`Select color ${product.colorNames[i]}`}
                        title={product.colorNames[i]}
                        className={`w-6 h-6 rounded-full border transition-all ${selectedColor === product.colorNames[i]
                            ? "border-black dark:border-white scale-110 ring-2 ring-black/30 dark:ring-white/30"
                            : "border-zinc-300 dark:border-zinc-700 hover:scale-105"
                          }`}
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Action Row 1: Quantity + Add to Bag + Wishlist */}
              <div className="flex items-center gap-2 pt-1">
                {/* Quantity */}
                <div className="flex items-center border border-zinc-300 dark:border-zinc-700 rounded h-10 sm:h-11 flex-shrink-0 bg-zinc-50/60 dark:bg-zinc-900/60">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="w-7 sm:w-8 h-full flex items-center justify-center hover:bg-zinc-200/50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={11} />
                  </button>
                  <span className="w-7 sm:w-8 text-center font-bold font-mono text-xs text-zinc-950 dark:text-white">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                    className="w-7 sm:w-8 h-full flex items-center justify-center hover:bg-zinc-200/50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus size={11} />
                  </button>
                </div>

                {/* Add to Bag Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={`flex-1 h-10 sm:h-11 px-4 text-xs font-bold uppercase tracking-wider rounded-sm transition-all duration-150 flex items-center justify-center gap-2 shadow-xs ${product.stock === 0
                      ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
                      : added
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : "bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                    }`}
                >
                  {added ? (
                    <span className="flex items-center gap-1.5 font-bold">
                      <Check size={15} /> Added to Bag
                    </span>
                  ) : product.stock === 0 ? (
                    <span>Sold Out</span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <ShoppingBag size={14} /> Add to Bag
                    </span>
                  )}
                </button>

                {/* Wishlist Button */}
                <button
                  onClick={() => toggle(product)}
                  aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                  className={`w-10 sm:w-11 h-10 sm:h-11 rounded-sm border border-zinc-300 dark:border-zinc-700 flex items-center justify-center transition-colors flex-shrink-0 ${wishlisted
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white"
                    }`}
                >
                  <Heart size={16} className={wishlisted ? "fill-current" : ""} />
                </button>
              </div>

              {/* Action Row 2: Buy Now */}
              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className={`w-full h-10 sm:h-11 px-4 text-xs font-bold uppercase tracking-wider rounded-sm transition-all duration-150 flex items-center justify-center gap-2 shadow-xs active:scale-[0.99] ${
                  product.stock === 0
                    ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
                    : "bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                }`}
              >
                Buy Now
              </button>

              {/* Below the Fold: Pincode Check & Accordions */}
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-900 space-y-3">
                {/* Pincode Delivery Check */}
                <div className="border border-zinc-200 dark:border-zinc-800 rounded p-3 bg-zinc-50/50 dark:bg-zinc-950/50 space-y-1.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <MapPin size={13} /> Pincode Express Delivery Check
                  </p>
                  <form onSubmit={handlePincodeCheck} className="flex gap-2">
                    <input
                      type="tel"
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => {
                        setPincode(e.target.value.replace(/\D/g, ""));
                        setPincodeResult(null);
                      }}
                      placeholder="Enter 6-digit PIN"
                      className="input py-1.5 text-xs font-mono"
                      aria-label="6-digit postal code"
                    />
                    <button type="submit" disabled={pincodeLoading} className="btn-secondary btn-sm flex-shrink-0 py-1.5">
                      {pincodeLoading ? <Loader2 size={12} className="animate-spin" /> : "Verify"}
                    </button>
                  </form>
                  {pincodeResult && (
                    <p className={`text-xs font-semibold ${pincodeResult.available ? "text-emerald-600" : "text-red-500"}`}>
                      {pincodeResult.available
                        ? `✓ Deliverable to ${pincodeResult.city} in ${pincodeResult.days} business days`
                        : pincodeResult.error}
                    </p>
                  )}
                </div>

                {/* Accordions */}
                <div className="pt-1">
                  <AccordionItem title="Product Specifications">
                    <p>{product.description}</p>
                  </AccordionItem>
                  <AccordionItem title="Materials & Craftsmanship">
                    <p className="mb-2"><strong>Composition:</strong> {product.materials}</p>
                    <p><strong>Care:</strong> {product.care}</p>
                  </AccordionItem>
                  <AccordionItem title="Shipping & Returns Policy">
                    <p className="mb-2">Complimentary express shipping on orders over ₹999 across all Indian pin codes.</p>
                    <p>Hassle-free 7-day returns for damaged or defective items.</p>
                  </AccordionItem>
                </div>
              </div>
            </div>
          </div>

          {/* Related Products Section */}
          {related.length > 0 && (
            <section className="mt-20 pt-12 border-t border-zinc-200 dark:border-zinc-800">
              <div className="mb-8">
                <p className="section-eyebrow">Complementary Pieces</p>
                <h2 className="section-title">You May Also Appreciate</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 items-stretch">
                {related.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Sticky Mobile Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-black/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 p-3 flex items-center gap-3">
        <div className="flex-1">
          <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">Total</p>
          <p className="font-heading font-black text-sm text-zinc-950 dark:text-white">
            {formatINR(product.price * qty)}
          </p>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="flex-1 btn-primary py-2.5 text-xs font-bold"
        >
          {added ? "✓ In Bag" : "Add to Bag"}
        </button>
        <button
          onClick={handleBuyNow}
          disabled={product.stock === 0}
          className="flex-1 btn-primary py-2.5 text-xs font-bold"
        >
          Buy Now
        </button>
      </div>
    </>
  );
}

import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star, Heart, ShoppingBag, Share2, ChevronDown, ChevronLeft,
  ChevronRight, Check, Truck, RefreshCw, Shield, MapPin,
  Loader2, Minus, Plus
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
        {/* Breadcrumbs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            <Link to="/" className="hover:text-black dark:hover:text-white">Home</Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-black dark:hover:text-white">Shop</Link>
            <span>/</span>
            <Link to={`/shop/${product.category}`} className="hover:text-black dark:hover:text-white">
              {product.category.replace("-", " ")}
            </Link>
            <span>/</span>
            <span className="text-zinc-950 dark:text-white truncate">{product.name}</span>
          </nav>
        </div>

        {/* Product Details Layout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14">
            {/* Gallery (Left 7 Columns) */}
            <div className="lg:col-span-7 space-y-3">
              {/* Main Image */}
              <div className="aspect-square rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 relative">
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
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 dark:bg-black/90 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-black dark:text-white"
                      aria-label="Previous photo"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={() => setActiveImg((i) => (i + 1) % product.images.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 dark:bg-black/90 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-black dark:text-white"
                      aria-label="Next photo"
                    >
                      <ChevronRight size={16} />
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
                <div className="flex gap-2.5 overflow-x-auto pb-1">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`w-16 h-16 rounded overflow-hidden border-2 transition-all flex-shrink-0 ${
                        activeImg === i ? "border-black dark:border-white scale-105" : "border-zinc-200 dark:border-zinc-800 opacity-70"
                      }`}
                      aria-label={`View photo ${i + 1}`}
                    >
                      <img src={img} alt={`${product.name} thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info (Right 5 Columns) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Category & Share */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                  {product.category.replace("-", " ")}
                </span>
                <button
                  onClick={handleShare}
                  className="btn-ghost w-8 h-8 rounded-full flex items-center justify-center text-zinc-600 dark:text-zinc-400"
                  aria-label="Share product"
                >
                  <Share2 size={16} />
                </button>
              </div>

              {/* Title */}
              <h1 className="font-heading font-black text-2xl sm:text-4xl uppercase tracking-tight text-zinc-950 dark:text-white leading-tight">
                {product.name}
              </h1>

              {/* Ratings */}
              <div className="flex items-center gap-2.5">
                <div className="flex text-amber-500 dark:text-amber-400 text-sm">
                  {"★".repeat(Math.round(avgRating || 5))}
                </div>
                <span className="font-bold text-xs font-mono text-zinc-900 dark:text-zinc-100">{avgRating}</span>
                <span className="text-xs text-zinc-400">({product.reviewCount} Reviews)</span>
              </div>

              {/* Pricing */}
              <div className="flex items-baseline gap-3 pt-1 border-t border-zinc-100 dark:border-zinc-900">
                <span className="price text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white">
                  {formatINR(product.price)}
                </span>
                {product.comparePrice && (
                  <span className="price-compare text-base text-zinc-400 line-through">
                    {formatINR(product.comparePrice)}
                  </span>
                )}
                {discount > 0 && (
                  <span className="badge bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
                    Save {brand.currencySymbol}{product.comparePrice - product.price}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                {product.stock > 0 ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400">
                      {product.stock <= 5 ? `Only ${product.stock} Units Remaining` : "In Stock — Ready to Dispatch"}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-red-500">Sold Out</span>
                  </>
                )}
              </div>

              {/* Color Selector */}
              {product.colors.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 mb-2">
                    Colourway: <span className="text-zinc-500 font-normal">{selectedColor}</span>
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {product.colors.map((hex, i) => (
                      <button
                        key={hex}
                        onClick={() => setSelectedColor(product.colorNames[i])}
                        aria-label={`Select color ${product.colorNames[i]}`}
                        title={product.colorNames[i]}
                        className={`w-7 h-7 rounded-full border transition-all ${
                          selectedColor === product.colorNames[i]
                            ? "border-black dark:border-white scale-110 ring-2 ring-black/40 dark:ring-white/40"
                            : "border-zinc-300 dark:border-zinc-700"
                        }`}
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                  Quantity
                </span>
                <div className="flex items-center border border-zinc-300 dark:border-zinc-700 rounded">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="w-10 text-center font-bold font-mono text-xs text-zinc-950 dark:text-white">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                    className="w-8 h-8 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                    aria-label="Increase quantity"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>

              {/* CTA Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={`flex-1 btn-primary btn-lg ${
                    added ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
                  }`}
                >
                  {added ? (
                    <span className="flex items-center gap-2">
                      <Check size={16} /> Added to Bag
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <ShoppingBag size={16} /> Add to Bag
                    </span>
                  )}
                </button>

                <button
                  onClick={() => toggle(product)}
                  aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                  className={`btn-ghost w-12 h-12 rounded border border-zinc-300 dark:border-zinc-700 flex items-center justify-center ${
                    wishlisted ? "bg-black text-white dark:bg-white dark:text-black" : ""
                  }`}
                >
                  <Heart size={18} className={wishlisted ? "fill-current" : ""} />
                </button>
              </div>

              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="btn-secondary btn-lg w-full"
              >
                Instant Checkout
              </button>

              {/* Pincode Delivery Check */}
              <div className="border border-zinc-200 dark:border-zinc-800 rounded p-4 bg-zinc-50/50 dark:bg-zinc-950/50 space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <MapPin size={14} /> Pincode Express Delivery Check
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
                    className="input py-2 text-xs font-mono"
                    aria-label="6-digit postal code"
                  />
                  <button type="submit" disabled={pincodeLoading} className="btn-secondary btn-sm flex-shrink-0">
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
              <div className="pt-2">
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
          className="flex-1 btn-secondary py-2.5 text-xs font-bold"
        >
          Buy Now
        </button>
      </div>
    </>
  );
}

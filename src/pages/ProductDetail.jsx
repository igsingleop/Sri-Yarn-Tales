import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star, Heart, ShoppingBag, Share2, ChevronDown, ChevronLeft,
  ChevronRight, Check, Truck, RefreshCw, Shield, Zap, MapPin,
  Loader2, Minus, Plus
} from "lucide-react";
import ProductCard from "../components/product/ProductCard";
import { getProductBySlug, getReviewsByProduct, getRelatedProducts, checkPincode } from "../lib/api";
import { useCartStore, useWishlistStore, useProductStore } from "../store";
import { formatINR, getDiscountPercent } from "../lib/utils";
import { brand } from "../config/brand";

function RatingBar({ label, value, count, total }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-warmgray w-4">{label}</span>
      <div className="flex-1 h-2 bg-oatmeal rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-butter-dark rounded-full"
          initial={{ width: 0 }}
          animate={{ width: total > 0 ? `${(count / total) * 100}%` : "0%" }}
          transition={{ duration: 0.8 }}
        />
      </div>
      <span className="text-warmgray w-6">{count}</span>
    </div>
  );
}

function AccordionItem({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full py-4 text-left"
        aria-expanded={open}
      >
        <span className="font-semibold text-cocoa">{title}</span>
        <ChevronDown size={18} className={`text-warmgray transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="pb-4 text-warmgray text-sm leading-relaxed">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const [added, setAdded] = useState(false);
  const [pincode, setPincode] = useState("");
  const [pincodeResult, setPincodeResult] = useState(null);
  const [pincodeLoading, setPincodeLoading] = useState(false);

  const storeProducts = useProductStore((s) => s.products);
  const addItem = useCartStore((s) => s.addItem);
  const openCart = () => useUIStore?.getState?.()?.openCart?.();
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
    setTimeout(() => setAdded(false), 2500);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate("/checkout");
  };

  const handlePincodeCheck = async (e) => {
    e.preventDefault();
    if (!pincode || pincode.length !== 6) return;
    setPincodeLoading(true);
    const result = await checkPincode(pincode);
    setPincodeResult(result);
    setPincodeLoading(false);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={40} className="text-primary animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center p-8">
        <div className="text-6xl">🧶</div>
        <h1 className="font-heading text-2xl text-cocoa">Product not found</h1>
        <Link to="/shop" className="btn-primary">Browse Shop</Link>
      </div>
    );
  }

  const discount = getDiscountPercent(product.price, product.comparePrice);
  const avgRating = product.rating;

  // Rating breakdown (mock)
  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => ({
    label: star,
    count: star === 5 ? Math.round(product.reviewCount * 0.7)
         : star === 4 ? Math.round(product.reviewCount * 0.2)
         : star === 3 ? Math.round(product.reviewCount * 0.07)
         : star === 2 ? Math.round(product.reviewCount * 0.02)
         : Math.round(product.reviewCount * 0.01),
  }));

  return (
    <>
      <Helmet>
        <title>{product.name} | Sri Yarn &amp; Tales</title>
        <meta name="description" content={product.description.slice(0, 155)} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            image: product.images,
            description: product.description,
            offers: {
              "@type": "Offer",
              priceCurrency: "INR",
              price: product.price,
              availability: product.stock > 0 ? "InStock" : "OutOfStock",
            },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: product.rating,
              reviewCount: product.reviewCount,
            },
          })}
        </script>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="flex items-center gap-2 text-sm text-warmgray mb-6">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-primary">Shop</Link>
          <span>/</span>
          <Link to={`/shop/${product.category}`} className="hover:text-primary capitalize">
            {product.category.replace("-", " ")}
          </Link>
          <span>/</span>
          <span className="text-cocoa font-medium truncate">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main image */}
            <div className="aspect-square rounded-4xl overflow-hidden bg-oatmeal relative">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImg}
                  src={product.images[activeImg]}
                  alt={`${product.name} - view ${activeImg + 1}`}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0, scale: 1.03 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  width={600}
                  height={600}
                />
              </AnimatePresence>

              {/* Image nav arrows */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImg((i) => (i - 1 + product.images.length) % product.images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center shadow hover:bg-white transition-all"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => setActiveImg((i) => (i + 1) % product.images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center shadow hover:bg-white transition-all"
                    aria-label="Next image"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isNew && <span className="badge-primary font-bold">New Arrival</span>}
                {discount > 0 && <span className="badge-error font-bold">{discount}% off</span>}
              </div>
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${
                      activeImg === i ? "border-primary shadow-rose" : "border-transparent"
                    }`}
                    aria-label={`View image ${i + 1}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Category + Share */}
            <div className="flex items-center justify-between">
              <Link
                to={`/shop/${product.category}`}
                className="text-sm text-primary font-semibold capitalize hover:underline"
              >
                {product.category.replace("-", " ")}
              </Link>
              <button
                onClick={handleShare}
                className="btn-ghost w-9 h-9 p-0 rounded-full"
                aria-label="Share product"
              >
                <Share2 size={18} />
              </button>
            </div>

            <h1 className="font-heading font-bold text-3xl sm:text-4xl text-cocoa leading-snug">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} size={16} fill={s <= Math.round(avgRating) ? "#F4D58D" : "none"}
                    className={s <= Math.round(avgRating) ? "text-butter-dark" : "text-border"} />
                ))}
              </div>
              <span className="font-bold text-cocoa">{avgRating}</span>
              <span className="text-sm text-warmgray">({product.reviewCount} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="price text-3xl text-primary">{formatINR(product.price)}</span>
              {product.comparePrice && (
                <span className="price-compare text-lg">{formatINR(product.comparePrice)}</span>
              )}
              {discount > 0 && (
                <span className="badge-error font-bold">Save {brand.currencySymbol}{product.comparePrice - product.price}</span>
              )}
            </div>

            {/* Stock status */}
            <div className="flex items-center gap-2 text-sm">
              {product.stock > 0 ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-sage" />
                  <span className="text-sage-dark font-medium">
                    {product.stock <= 5 ? `Only ${product.stock} left!` : "In Stock"}
                  </span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-error" />
                  <span className="text-error font-medium">Out of Stock</span>
                </>
              )}
            </div>

            {/* Colour selector */}
            {product.colors.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-cocoa mb-2">
                  Colour: <span className="text-primary">{selectedColor}</span>
                </p>
                <div className="flex gap-2 flex-wrap">
                  {product.colors.map((hex, i) => (
                    <button
                      key={hex}
                      onClick={() => setSelectedColor(product.colorNames[i])}
                      aria-label={`Select colour ${product.colorNames[i]}`}
                      title={product.colorNames[i]}
                      className={`w-9 h-9 rounded-full border-2 transition-all ${
                        selectedColor === product.colorNames[i]
                          ? "border-primary ring-2 ring-primary/30 scale-110"
                          : "border-white ring-1 ring-border"
                      }`}
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size selector */}
            {product.sizes.length > 0 && product.sizes[0] !== "One Size" && (
              <div>
                <p className="text-sm font-semibold text-cocoa mb-2">
                  Size: <span className="text-primary">{selectedSize}</span>
                </p>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                        selectedSize === size
                          ? "border-primary bg-primary-light text-primary"
                          : "border-border text-warmgray hover:border-primary"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Personalisation note */}
            {product.isCustomizable && (
              <div>
                <label className="label" htmlFor="custom-note">
                  Personalisation Note <span className="text-warmgray font-normal">(optional)</span>
                </label>
                <textarea
                  id="custom-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Name to embroider, preferred color variation, special message..."
                  className="input resize-none"
                  rows={3}
                />
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 bg-oatmeal rounded-full p-1">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-9 h-9 rounded-full hover:bg-white hover:shadow-sm transition-all flex items-center justify-center" aria-label="Decrease quantity">
                  <Minus size={16} />
                </button>
                <span className="w-8 text-center font-semibold text-cocoa">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} className="w-9 h-9 rounded-full hover:bg-white hover:shadow-sm transition-all flex items-center justify-center" aria-label="Increase quantity">
                  <Plus size={16} />
                </button>
              </div>
              <span className="text-sm text-warmgray">
                Total: <strong className="text-cocoa">{formatINR(product.price * qty)}</strong>
              </span>
            </div>

            {/* CTAs */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`flex-1 btn btn-lg transition-all ${
                  added ? "bg-sage text-white" : "btn-primary"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <AnimatePresence mode="wait">
                  {added ? (
                    <motion.span key="added" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                      <Check size={18} /> Added to Cart!
                    </motion.span>
                  ) : (
                    <motion.span key="add" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                      <ShoppingBag size={18} /> Add to Cart
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
              <button
                onClick={() => toggle(product)}
                aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                className={`btn w-14 h-14 p-0 rounded-2xl border-2 transition-all ${
                  wishlisted ? "border-primary bg-primary-light text-primary" : "border-border hover:border-primary"
                }`}
              >
                <motion.div animate={wishlisted ? { scale: [1, 1.3, 1] } : {}}>
                  <Heart size={20} fill={wishlisted ? "currentColor" : "none"} />
                </motion.div>
              </button>
            </div>

            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="w-full btn-secondary btn-lg disabled:opacity-50"
            >
              Buy Now
            </button>

            {/* Delivery check */}
            <div className="bg-oatmeal rounded-2xl p-4">
              <p className="text-sm font-semibold text-cocoa mb-3 flex items-center gap-2">
                <MapPin size={16} className="text-primary" /> Check Delivery
              </p>
              <form onSubmit={handlePincodeCheck} className="flex gap-2">
                <input
                  type="tel"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => { setPincode(e.target.value.replace(/\D/g, "")); setPincodeResult(null); }}
                  placeholder="Enter 6-digit PIN code"
                  className="input flex-1 py-2 text-sm"
                  aria-label="PIN code"
                />
                <button type="submit" disabled={pincodeLoading} className="btn-primary btn-sm">
                  {pincodeLoading ? <Loader2 size={16} className="animate-spin" /> : "Check"}
                </button>
              </form>
              {pincodeResult && (
                <motion.p
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-sm mt-2 font-medium ${pincodeResult.available ? "text-sage-dark" : "text-error"}`}
                >
                  {pincodeResult.available
                    ? `✓ Deliverable to ${pincodeResult.city} in ${pincodeResult.days} days`
                    : pincodeResult.error}
                </motion.p>
              )}
            </div>

            {/* Trust indicators */}
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { icon: Truck, label: "Free shipping ₹999+" },
                { icon: Shield, label: "Secure payment" },
                { icon: RefreshCw, label: "Easy returns" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1 p-3 bg-oatmeal rounded-2xl text-xs text-warmgray">
                  <Icon size={18} className="text-primary" />
                  <span>{label}</span>
                </div>
              ))}
            </div>

            {/* Accordion tabs */}
            <div className="space-y-0">
              <AccordionItem title="Product Description">
                <p>{product.description}</p>
              </AccordionItem>
              <AccordionItem title="Materials & Care">
                <p className="mb-2"><strong>Materials:</strong> {product.materials}</p>
                <p><strong>Care Instructions:</strong> {product.care}</p>
              </AccordionItem>
              <AccordionItem title="Shipping & Returns">
                <p className="mb-2">Estimated delivery: <strong>{product.deliveryDays} business days</strong> after dispatch.</p>
                <p className="mb-2">Free shipping on orders above ₹999. Standard shipping ₹99 for smaller orders.</p>
                <p>Returns accepted within 7 days for manufacturing defects. Custom/personalised items cannot be returned unless defective.</p>
              </AccordionItem>
            </div>
          </div>
        </div>

        {/* Reviews section */}
        <section className="mt-16 pt-12 border-t border-border">
          <h2 className="section-title mb-8">Customer Reviews</h2>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Rating summary */}
            <div className="space-y-4">
              <div className="text-center p-6 bg-oatmeal rounded-3xl">
                <p className="font-heading font-bold text-6xl text-cocoa">{avgRating}</p>
                <div className="flex justify-center gap-1 my-2">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} size={18} fill={s <= Math.round(avgRating) ? "#F4D58D" : "none"}
                      className={s <= Math.round(avgRating) ? "text-butter-dark" : "text-border"} />
                  ))}
                </div>
                <p className="text-sm text-warmgray">{product.reviewCount} reviews</p>
              </div>
              <div className="space-y-2">
                {ratingBreakdown.map((r) => (
                  <RatingBar key={r.label} label={r.label} count={r.count} total={product.reviewCount} />
                ))}
              </div>
            </div>

            {/* Review list */}
            <div className="lg:col-span-2 space-y-4">
              {reviews.length === 0 ? (
                <p className="text-warmgray text-sm">No reviews yet. Be the first to review!</p>
              ) : (
                reviews.map((review) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-white rounded-3xl p-5 shadow-card"
                  >
                    <div className="flex items-start gap-3">
                      <img src={review.avatar} alt={review.author} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <p className="font-semibold text-cocoa text-sm">{review.author}</p>
                          <p className="text-xs text-warmgray">{new Date(review.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                        </div>
                        <div className="flex gap-0.5 my-1">
                          {[1,2,3,4,5].map((s) => (
                            <Star key={s} size={13} fill={s <= review.rating ? "#F4D58D" : "none"}
                              className={s <= review.rating ? "text-butter-dark" : "text-border"} />
                          ))}
                        </div>
                        <p className="text-sm text-warmgray leading-relaxed">{review.text}</p>
                        {review.verified && (
                          <span className="badge-sage text-xs mt-2">✓ Verified Purchase</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Related products */}
        {related.length > 0 && (
          <section className="mt-16 pt-12 border-t border-border">
            <h2 className="section-title mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </section>
        )}
      </div>

      {/* Sticky mobile bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border p-4 flex gap-3 pb-safe">
        <div className="flex-1">
          <p className="text-xs text-warmgray">Total</p>
          <p className="font-bold text-primary">{formatINR(product.price * qty)}</p>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className={`flex-1 btn ${added ? "bg-sage text-white" : "btn-primary"} disabled:opacity-50`}
        >
          {added ? <><Check size={16} /> Added!</> : <><ShoppingBag size={16} /> Add to Cart</>}
        </button>
        <button onClick={handleBuyNow} className="flex-1 btn-secondary">
          Buy Now
        </button>
      </div>
    </>
  );
}

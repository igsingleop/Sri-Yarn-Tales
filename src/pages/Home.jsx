import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight, Star, ChevronLeft, ChevronRight,
  Package, Heart, Sparkles, Truck
} from "lucide-react";
import ProductCard, { ProductCardSkeleton } from "../components/product/ProductCard";
import { getBestsellers, getNewArrivals, getCategories, getAllReviews } from "../lib/api";
import { brand } from "../config/brand";
import { formatINR } from "../lib/utils";
import { useBannerStore, useProductStore } from "../store";

// ---- Floating Blob ----
function Blob({ className, style }) {
  return (
    <div
      className={`absolute rounded-full blur-3xl opacity-40 pointer-events-none ${className}`}
      style={style}
    />
  );
}

// ---- Circular rotating text badge ----
function RotatingBadge() {
  const text = "100% Handmade · Made in India · Premium Yarn · ";
  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <motion.svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      >
        <defs>
          <path id="circle" d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" />
        </defs>
        <text className="text-[8px] fill-primary font-semibold tracking-widest">
          <textPath href="#circle" startOffset="0%">
            {text}
          </textPath>
        </text>
      </motion.svg>
      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
        <Heart size={20} className="text-white" fill="white" />
      </div>
    </div>
  );
}

// ---- Animated counter ----
function Counter({ to, suffix = "", label }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  return (
    <motion.div
      whileInView={() => {
        if (!started) {
          setStarted(true);
          let start = 0;
          const step = to / 60;
          const timer = setInterval(() => {
            start += step;
            if (start >= to) { setCount(to); clearInterval(timer); }
            else setCount(Math.floor(start));
          }, 16);
        }
      }}
      viewport={{ once: true }}
      className="text-center"
    >
      <p className="font-heading font-bold text-4xl text-cocoa">
        {count.toLocaleString("en-IN")}{suffix}
      </p>
      <p className="text-warmgray text-sm mt-1">{label}</p>
    </motion.div>
  );
}

// ---- Hero Section ----
function Hero() {
  const heroBanner = useBannerStore((s) => s.heroBanner);
  const headline = heroBanner.headline || "Handmade Crochet, Woven With Love";
  const words = headline.split(" ");
  const images = heroBanner.heroImages || [
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1568760970073-ce3f8af8cb72?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400&h=400&fit=crop",
  ];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-hero yarn-texture">
      {/* Floating blobs */}
      <Blob className="w-96 h-96 bg-primary animate-blob-slow" style={{ top: "10%", left: "-10%" }} />
      <Blob className="w-80 h-80 bg-butter animate-blob-medium" style={{ top: "60%", right: "-5%" }} />
      <Blob className="w-64 h-64 bg-sage/40 animate-blob-fast" style={{ bottom: "20%", left: "50%" }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Text content */}
          <div className="space-y-6 text-center lg:text-left">
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-primary-light rounded-full px-4 py-1.5 text-primary text-sm font-semibold"
            >
              <Sparkles size={14} />
              {heroBanner.eyebrow || "Crafted with love in India"}
            </motion.div>

            {/* Headline */}
            <h1 className="font-heading font-bold leading-tight" style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}>
              {words.map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.12, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                  className={`inline-block mr-3 ${
                    word.toLowerCase().includes("crochet") || word.toLowerCase().includes("love")
                      ? "text-primary italic"
                      : "text-cocoa"
                  }`}
                >
                  {word}
                </motion.span>
              ))}
            </h1>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="text-warmgray text-lg leading-relaxed max-w-lg mx-auto lg:mx-0"
            >
              {heroBanner.subtext || "Discover one-of-a-kind amigurumi toys, bags, home decor, and wearables — each piece handcrafted with premium soft yarn and shipped lovingly across India."}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="flex flex-wrap gap-4 justify-center lg:justify-start"
            >
              <Link to={heroBanner.primaryBtnLink || "/shop"} className="btn-primary btn-lg group">
                {heroBanner.primaryBtnText || "Shop Now"}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to={heroBanner.secondaryBtnLink || "/custom-orders"} className="btn-secondary btn-lg">
                {heroBanner.secondaryBtnText || "Order Custom"}
              </Link>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="flex items-center gap-4 justify-center lg:justify-start pt-2"
            >
              <div className="flex -space-x-2">
                {[
                  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop&crop=faces",
                  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=faces",
                  "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=40&h=40&fit=crop&crop=faces",
                ].map((src, i) => (
                  <img key={i} src={src} alt="" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                ))}
              </div>
              <div className="text-sm">
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(s => <Star key={s} size={12} fill="#F4D58D" className="text-butter-dark" />)}
                </div>
                <p className="text-warmgray">Loved by <strong className="text-cocoa">2,000+</strong> happy customers</p>
              </div>
            </motion.div>
          </div>

          {/* Hero image collage */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="relative hidden lg:block"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <motion.div
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="rounded-3xl overflow-hidden shadow-rose-lg aspect-square"
                >
                  <img
                    src={images[0] || "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop"}
                    alt="Handmade crochet item 1"
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                <motion.div
                  animate={{ y: [0, 12, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="rounded-3xl overflow-hidden shadow-warm aspect-video"
                >
                  <img
                    src={images[1] || "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=300&fit=crop"}
                    alt="Handmade crochet item 2"
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              </div>
              <div className="space-y-4 pt-8">
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="rounded-3xl overflow-hidden shadow-warm aspect-video"
                >
                  <img
                    src={images[2] || "https://images.unsplash.com/photo-1568760970073-ce3f8af8cb72?w=400&h=300&fit=crop"}
                    alt="Handmade crochet item 3"
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                  className="rounded-3xl overflow-hidden shadow-rose-lg aspect-square"
                >
                  <img
                    src={images[3] || "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400&h=400&fit=crop"}
                    alt="Handmade crochet item 4"
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              </div>
            </div>

            {/* Rotating badge overlay */}
            <div className="absolute -bottom-4 -left-4">
              <RotatingBadge />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-5 h-8 rounded-full border-2 border-warmgray/40 flex justify-center pt-1.5">
          <div className="w-1 h-1.5 bg-warmgray/60 rounded-full" />
        </div>
      </motion.div>
    </section>
  );
}

// ---- Marquee Strip ----
function MarqueeStrip() {
  const items = [
    "Handmade with Love",
    "Eco-friendly Yarn",
    "Made in India",
    "Premium Quality",
    "Gift-Ready Packaging",
    "Custom Orders Welcome",
    "Free Shipping ₹999+",
    "100% Handcrafted",
  ];

  const repeated = [...items, ...items];

  return (
    <div className="bg-primary py-3 overflow-hidden">
      <motion.div
        className="flex gap-8 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        {repeated.map((item, i) => (
          <span key={i} className="text-white text-sm font-semibold flex items-center gap-3 flex-shrink-0">
            <span className="w-1 h-1 rounded-full bg-white/60 inline-block" />
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ---- Shop by Category ----
function ShopByCategory({ categories }) {
  const icons = { amigurumi: "🧸", bags: "👜", "home-decor": "🏡", wearables: "🧣", baby: "👶", accessories: "✨" };

  return (
    <section className="py-20 bg-oatmeal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.p
            className="text-primary font-accent text-lg mb-2"
            whileInView={{ opacity: [0, 1] }}
            viewport={{ once: true }}
          >
            Browse Our Collection
          </motion.p>
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Shop by Category
          </motion.h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Link
                to={`/shop/${cat.slug}`}
                className="group block rounded-3xl overflow-hidden bg-white shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                    width={200}
                    height={200}
                  />
                </div>
                <div className="p-3 text-center">
                  <p className="font-heading font-semibold text-sm text-cocoa group-hover:text-primary transition-colors">
                    {cat.name}
                  </p>
                  <p className="text-xs text-warmgray mt-0.5">{cat.count} items</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---- Product Section ----
function ProductSection({ title, subtitle, products, loading, viewAllLink }) {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <motion.p
              className="text-primary font-accent text-lg mb-1"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              {subtitle}
            </motion.p>
            <motion.h2
              className="section-title"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              {title}
            </motion.h2>
          </div>
          <Link
            to={viewAllLink}
            className="hidden sm:flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3 transition-all"
          >
            View All <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {loading
            ? Array(4).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)
            : products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)
          }
        </div>

        <div className="sm:hidden text-center mt-8">
          <Link to={viewAllLink} className="btn-secondary">
            View All <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ---- Brand Story Teaser ----
function StoryTeaser() {
  return (
    <section className="py-20 bg-gradient-to-br from-primary-light via-cream to-oatmeal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="aspect-video rounded-4xl overflow-hidden shadow-rose-lg">
              <img
                src="https://images.unsplash.com/photo-1612548403247-aa2873e9422d?w=800&h=500&fit=crop"
                alt="Maker crafting crochet by hand"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl p-4 shadow-warm">
              <p className="font-accent text-primary text-lg">Made with ❤️</p>
              <p className="text-xs text-warmgray">every stitch, every day</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <p className="text-primary font-accent text-xl">Our Story</p>
            <h2 className="section-title">From One Hook, A World of Warmth</h2>
            <p className="text-warmgray leading-relaxed">
              Sri Yarn &amp; Tales was born from a simple love of yarn and the joy of making things with your hands. 
              What started as a hobby in a cozy Bangalore apartment has grown into a small business 
              that brings handmade crochet pieces to homes across India.
            </p>
            <p className="text-warmgray leading-relaxed">
              Every product is made one stitch at a time — no machines, no shortcuts. 
              We choose the softest yarn, the warmest colours, and pour genuine care into everything we create.
            </p>
            <Link to="/about" className="btn-primary inline-flex gap-2">
              Meet the Maker <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ---- Why Choose Us ----
function WhyChooseUs() {
  const features = [
    { icon: "🧶", title: "100% Handmade", desc: "Every piece is crafted by hand with patience and skill." },
    { icon: "🌿", title: "Premium Soft Yarn", desc: "Only the finest, softest yarns — kind to skin and planet." },
    { icon: "🎁", title: "Gift-Ready Packaging", desc: "Every order comes beautifully packed, ready to gift." },
    { icon: "✏️", title: "Made-to-Order", desc: "Customise size, colour, and design to make it truly yours." },
  ];

  return (
    <section className="py-20 bg-cocoa text-white relative overflow-hidden">
      <Blob className="w-96 h-96 bg-primary/20 animate-blob-slow" style={{ top: "-20%", right: "-5%" }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <motion.h2
            className="font-heading font-bold text-3xl sm:text-4xl text-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Why Choose Sri Yarn &amp; Tales?
          </motion.h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center p-6 rounded-3xl bg-white/10 hover:bg-white/15 transition-colors border border-white/10"
            >
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="font-heading font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-white/60 text-sm">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 mt-16 pt-12 border-t border-white/10">
          <Counter to={2000} suffix="+" label="Happy Customers" />
          <Counter to={5000} suffix="+" label="Pieces Handmade" />
          <Counter to={500} suffix="+" label="5-Star Reviews" />
        </div>
      </div>
    </section>
  );
}

// ---- Custom Order CTA ----
function CustomOrderCTA() {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-rose rounded-4xl p-8 sm:p-12 lg:p-16 text-center relative overflow-hidden"
        >
          <Blob className="w-64 h-64 bg-white/20" style={{ top: "-30%", left: "-10%" }} />
          <Blob className="w-48 h-48 bg-white/10" style={{ bottom: "-20%", right: "-5%" }} />

          <div className="relative z-10">
            <p className="font-accent text-white/80 text-xl mb-3">Have something in mind?</p>
            <h2 className="font-heading font-bold text-white mb-4" style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)" }}>
              Order Your Dream Crochet Piece
            </h2>
            <p className="text-white/80 max-w-xl mx-auto mb-8">
              Share your idea and we'll bring it to life — custom colours, sizes, characters, and designs. 
              Personalised gifts that nobody else will have.
            </p>
            <Link to="/custom-orders" className="btn bg-white text-primary hover:bg-primary-light btn-lg">
              Start Custom Order <ArrowRight size={18} />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ---- Testimonials ----
function Testimonials({ reviews }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!reviews.length) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % reviews.length), 5000);
    return () => clearInterval(t);
  }, [reviews]);

  if (!reviews.length) return null;

  return (
    <section className="py-20 bg-oatmeal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-primary font-accent text-lg mb-2">Real Love</p>
          <h2 className="section-title">What Our Customers Say</h2>
        </div>

        <div className="relative max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-4xl p-8 sm:p-10 shadow-warm text-center"
            >
              {/* Stars */}
              <div className="flex justify-center gap-1 mb-4">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={18} fill={s <= reviews[idx].rating ? "#F4D58D" : "none"}
                    className={s <= reviews[idx].rating ? "text-butter-dark" : "text-border"} />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-cocoa font-heading text-lg italic leading-relaxed mb-6">
                "{reviews[idx].text}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center justify-center gap-3">
                <img
                  src={reviews[idx].avatar}
                  alt={reviews[idx].author}
                  className="w-12 h-12 rounded-full object-cover border-2 border-primary-light"
                />
                <div className="text-left">
                  <p className="font-semibold text-cocoa text-sm">{reviews[idx].author}</p>
                  <p className="text-xs text-warmgray">Verified Buyer</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-center gap-2 mt-6">
            <button
              onClick={() => setIdx((i) => (i - 1 + reviews.length) % reviews.length)}
              className="w-10 h-10 rounded-full bg-white shadow-card hover:shadow-card-hover transition-all flex items-center justify-center"
              aria-label="Previous review"
            >
              <ChevronLeft size={18} className="text-warmgray" />
            </button>
            <div className="flex items-center gap-1.5">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  aria-label={`Review ${i + 1}`}
                  className={`rounded-full transition-all duration-300 ${
                    i === idx ? "w-6 h-2 bg-primary" : "w-2 h-2 bg-border"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => setIdx((i) => (i + 1) % reviews.length)}
              className="w-10 h-10 rounded-full bg-white shadow-card hover:shadow-card-hover transition-all flex items-center justify-center"
              aria-label="Next review"
            >
              <ChevronRight size={18} className="text-warmgray" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---- Instagram Grid ----
function InstagramGrid() {
  const images = [
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1568760970073-ce3f8af8cb72?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop",
  ];

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-primary font-accent text-lg mb-2">Follow the Journey</p>
          <h2 className="section-title">{brand.instagramHandle}</h2>
          <p className="text-warmgray mt-2 text-sm">Tag us in your crochet moments!</p>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
          {images.map((src, i) => (
            <motion.a
              key={i}
              href={brand.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="group block aspect-square rounded-2xl overflow-hidden relative"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <img
                src={src}
                alt={`Instagram post ${i + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
                width={200}
                height={200}
              />
              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/30 transition-all duration-300 flex items-center justify-center">
                <Instagram className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" size={28} />
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---- Newsletter ----
function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) { setSubmitted(true); }
  };

  return (
    <section className="py-16 bg-oatmeal">
      <div className="max-w-xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-4"
        >
          <p className="font-accent text-primary text-xl">🎉 Special Offer</p>
          <h2 className="font-heading font-bold text-3xl text-cocoa">
            Get 10% off your first order
          </h2>
          <p className="text-warmgray">
            Subscribe to our newsletter for exclusive offers, new arrivals, and crochet inspiration.
          </p>

          {submitted ? (
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-sage/20 text-sage-dark rounded-2xl p-4 font-semibold"
            >
              🎉 You're in! Check your email for your 10% off code.
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-2 max-w-sm mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="input flex-1"
                aria-label="Email address"
              />
              <button type="submit" className="btn-primary">
                Subscribe
              </button>
            </form>
          )}
          <p className="text-xs text-warmgray/60">No spam, unsubscribe anytime. Use code WELCOME10 at checkout.</p>
        </motion.div>
      </div>
    </section>
  );
}

// Instagram icon not imported above, add it:
function Instagram({ className, size }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

// ---- Promotional Banner ----
function PromoBannerSection() {
  const promo = useBannerStore((s) => s.promoBanner);
  if (!promo?.enabled) return null;

  return (
    <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative rounded-4xl overflow-hidden shadow-rose-lg bg-cocoa text-white min-h-[260px] sm:min-h-[300px] flex items-center p-8 sm:p-12"
      >
        <img
          src={promo.imageUrl || "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=1000&h=600&fit=crop"}
          alt="Promotional Banner"
          className="absolute inset-0 w-full h-full object-cover opacity-35 transform hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-cocoa via-cocoa/85 to-transparent" />

        <div className="relative z-10 max-w-xl space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-primary text-white shadow-xs">
              {promo.tag || "Special Offer ✨"}
            </span>
            {promo.discountBadge && (
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-butter text-cocoa">
                {promo.discountBadge}
              </span>
            )}
          </div>
          <h2 className="font-heading font-bold text-2xl sm:text-4xl text-white leading-tight">
            {promo.title}
          </h2>
          <p className="text-white/80 text-sm sm:text-base leading-relaxed">
            {promo.subtitle}
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <Link to={promo.ctaLink || "/custom-orders"} className="btn-primary btn-md">
              {promo.ctaText || "Explore Collection"} <ArrowRight size={16} />
            </Link>
            {promo.couponCode && (
              <span className="text-xs font-mono bg-white/15 px-3 py-2 rounded-2xl border border-white/20">
                Use code: <strong className="text-butter">{promo.couponCode}</strong>
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

// ---- Main Home Page ----
export default function Home() {
  const storeProducts = useProductStore((s) => s.products);
  const [bestsellers, setBestsellers] = useState(() =>
    storeProducts.filter((p) => p.isBestseller).slice(0, 4)
  );
  const [newArrivals, setNewArrivals] = useState(() =>
    storeProducts.filter((p) => p.isNew).slice(0, 4)
  );
  const [categories, setCategories] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const bs = storeProducts.filter((p) => p.isBestseller).slice(0, 4);
    const na = storeProducts.filter((p) => p.isNew).slice(0, 4);
    setBestsellers(bs);
    setNewArrivals(na);

    getCategories().then(setCategories);
    getAllReviews().then(setReviews);
    setLoading(false);
  }, [storeProducts]);

  return (
    <>
      <Helmet>
        <title>{brand.seo.defaultTitle}</title>
        <meta name="description" content={brand.seo.defaultDescription} />
        <meta property="og:title" content={brand.seo.defaultTitle} />
        <meta property="og:description" content={brand.seo.defaultDescription} />
        <meta property="og:type" content="website" />
      </Helmet>

      <Hero />
      <MarqueeStrip />
      <ShopByCategory categories={categories} />
      <ProductSection
        title="Bestsellers"
        subtitle="Customer Favourites"
        products={bestsellers}
        loading={loading}
        viewAllLink="/shop?sort=bestsellers"
      />
      <StoryTeaser />
      <ProductSection
        title="New Arrivals"
        subtitle="Just Landed"
        products={newArrivals}
        loading={loading}
        viewAllLink="/shop?sort=newest"
      />
      <PromoBannerSection />
      <WhyChooseUs />
      <CustomOrderCTA />
      <Testimonials reviews={reviews} />
      <InstagramGrid />
      <Newsletter />
    </>
  );
}

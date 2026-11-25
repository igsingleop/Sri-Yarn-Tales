import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight, Star, ChevronLeft, ChevronRight,
  Shield, Sparkles, Check, ArrowUpRight
} from "lucide-react";
import ProductCard, { ProductCardSkeleton } from "../components/product/ProductCard";
import HeroPosterBanner from "../components/home/HeroPosterBanner";
import { getCategories, getAllReviews } from "../lib/api";
import { brand } from "../config/brand";
import { formatINR } from "../lib/utils";
import { useBannerStore, useProductStore, useCategoryStore } from "../store";
import reviewsData from "../data/reviews.json";

// ---- Counter component (respects prefers-reduced-motion & no-JS) ----
function Counter({ to, suffix = "", label, whiteText = false }) {
  const [count, setCount] = React.useState(to); // default to final value (no-JS / SSR safe)
  const [started, setStarted] = React.useState(false);
  const prefersReduced =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  return (
    <motion.div
      whileInView={() => {
        if (!started && !prefersReduced) {
          setStarted(true);
          setCount(0);
          let start = 0;
          const step = Math.max(1, Math.floor(to / 50));
          const timer = setInterval(() => {
            start += step;
            if (start >= to) {
              setCount(to);
              clearInterval(timer);
            } else {
              setCount(start);
            }
          }, 20);
        }
      }}
      viewport={{ once: true }}
      className="text-left"
    >
      <p className={`font-heading font-black text-3xl sm:text-4xl tracking-tight ${whiteText ? 'text-white' : 'text-zinc-950 dark:text-white'}`}>
        {count.toLocaleString("en-IN")}{suffix}
      </p>
      <p className={`text-xs uppercase tracking-wider font-semibold mt-1 ${whiteText ? 'text-zinc-400' : 'text-zinc-500 dark:text-zinc-400'}`}>
        {label}
      </p>
    </motion.div>
  );
}

// ---- Hero Section (Nike / Adidas Minimalist Luxury) ----
function Hero() {
  const heroBanner = useBannerStore((s) => s.heroBanner);
  const headline = heroBanner.headline || "Engineered By Hand. Woven For Life.";
  const subtext = heroBanner.subtext || "Discover limited-batch artisanal amigurumi, architectural bags, bespoke home decor, and luxury knitwear — handcrafted in India with 100% natural soft yarn.";
  const images = heroBanner.heroImages || [
    "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&h=600&fit=crop",
  ];

  return (
    <section className="relative overflow-hidden bg-white dark:bg-black border-b border-zinc-200 dark:border-zinc-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-14 min-h-[calc(100vh-100px)] flex items-center">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-6 items-center w-full">
          {/* Left Column: Bold Editorial Typography */}
          <div className="lg:col-span-5 xl:col-span-5 space-y-5 sm:space-y-6 text-left z-10">
            {/* Season Badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-zinc-900 dark:text-zinc-100 text-[11px] font-bold uppercase tracking-[0.2em]"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              {heroBanner.eyebrow || "Season 2026 // Artisanal Drop 04"}
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="font-heading font-black text-4xl sm:text-6xl lg:text-7xl uppercase tracking-tighter text-zinc-950 dark:text-white leading-[0.95]"
            >
              {headline}
            </motion.h1>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.2 }}
              className="text-zinc-600 dark:text-zinc-400 text-base sm:text-lg max-w-xl leading-relaxed font-normal"
            >
              {subtext}
            </motion.p>

            {/* High-contrast CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.3 }}
              className="flex flex-wrap gap-4 pt-1"
            >
              <Link
                to={heroBanner.primaryBtnLink || "/shop"}
                className="btn-primary btn-lg group"
              >
                {heroBanner.primaryBtnText || "Explore Collection"}
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to={heroBanner.secondaryBtnLink || "/custom-orders"}
                className="btn-secondary btn-lg"
              >
                {heroBanner.secondaryBtnText || "Bespoke Orders"}
              </Link>
            </motion.div>

            {/* Micro social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="flex items-center gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-900"
            >
              <div className="flex text-amber-500 dark:text-amber-400 text-sm">
                {"★".repeat(5)}
              </div>
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                <span className="text-zinc-950 dark:text-white font-bold">4.9 / 5.0</span> rating from 2,000+ collectors across India
              </p>
            </motion.div>
          </div>

          {/* Right Column: 3D Tilted Poster Wall */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-7 xl:col-span-7 relative w-full overflow-hidden"
          >
            <HeroPosterBanner images={images} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ---- Four Pillars Strip (Nike / Adidas Clean Value Bar) ----
function ValuePillars() {
  const pillars = [
    {
      title: "100% Hand-Crocheted",
      desc: "Zero industrial automation. Every stitch crafted by Indian artisans.",
    },
    {
      title: "Natural Soft Fibres",
      desc: "Combed cotton & pure wool yarn safe for sensitive skin.",
    },
    {
      title: "Bespoke Commissions",
      desc: "Custom dimensions, custom palette, and personalized monogramming.",
    },
    {
      title: "Pan-India Express",
      desc: "Complimentary insured delivery nationwide on orders above ₹999.",
    },
  ];

  return (
    <section className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/60 py-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {pillars.map((p, i) => (
            <div key={i} className="space-y-1">
              <p className="font-heading font-black text-xs sm:text-sm uppercase tracking-wider text-zinc-950 dark:text-white">
                {p.title}
              </p>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed font-normal">
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---- Shop by Category (Nike / Adidas Style Clean Grid) ----
function ShopByCategory({ categories }) {
  const desktopCols =
    categories.length <= 2
      ? "lg:grid-cols-2"
      : categories.length === 3
      ? "lg:grid-cols-3"
      : categories.length === 4
      ? "lg:grid-cols-4"
      : categories.length === 5
      ? "lg:grid-cols-5"
      : "lg:grid-cols-6";

  return (
    <section className="py-16 sm:py-24 bg-white dark:bg-black transition-colors border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-4">
          <div>
            <p className="section-eyebrow">Disciplines // Catalog</p>
            <h2 className="section-title">Shop By Category</h2>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-100 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
          >
            All Collections <ArrowRight size={14} />
          </Link>
        </div>

        {/* Dynamic Category Cards Grid — fits full width cleanly */}
        <div className={`grid grid-cols-2 sm:grid-cols-3 ${desktopCols} gap-3 sm:gap-4`}>
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.35 }}
            >
              <Link
                to={`/shop/${cat.slug}`}
                className="group block relative aspect-[4/5] rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white transition-colors duration-200 bg-zinc-100 dark:bg-zinc-900"
              >
                {/* Full-bleed category photo with stable hover zoom */}
                <img
                  src={cat.image}
                  alt={cat.name}
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&h=600&fit=crop";
                  }}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  loading="lazy"
                  width={300}
                  height={375}
                />

                {/* Subtle dark gradient overlay at bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-3 sm:p-4 text-left" />

                {/* Overlaid category info */}
                <div className="absolute bottom-0 inset-x-0 p-3 sm:p-4 text-left z-10 flex items-end justify-between gap-2">
                  <p className="font-heading font-black text-xs sm:text-sm text-white uppercase tracking-wider leading-tight">
                    {cat.name}
                  </p>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white font-bold text-xs flex-shrink-0">
                    →
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---- Product Section Carousel with Smooth Scroll & Left/Right Buttons ----
function ProductSection({ title, eyebrow, products, loading, viewAllLink, totalCount }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollButtons = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateScrollButtons();
    window.addEventListener("resize", updateScrollButtons);
    return () => window.removeEventListener("resize", updateScrollButtons);
  }, [products.length, updateScrollButtons]);

  const scrollByDirection = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    const step = Math.max(280, Math.round(el.clientWidth * 0.8));
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <section className="py-16 sm:py-24 bg-white dark:bg-black transition-colors border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-4">
          <div>
            <p className="section-eyebrow">{eyebrow}</p>
            <h2 className="section-title">{title}</h2>
          </div>
          <Link
            to={viewAllLink}
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-100 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
          >
            View All ({totalCount ?? products.length}) <ArrowRight size={14} />
          </Link>
        </div>

        {/* Horizontal Smooth-Scroll Carousel with Non-Overlapping Left/Right Arrow Symbols */}
        <div className="flex items-center gap-1 sm:gap-3">
          {products.length > 1 && (
            <button
              type="button"
              onClick={() => scrollByDirection(-1)}
              disabled={!canScrollLeft}
              aria-label={`Scroll ${title} left`}
              className="flex-shrink-0 p-1 text-zinc-800 dark:text-zinc-200 hover:text-black dark:hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-90"
            >
              <ChevronLeft size={24} className="stroke-[2.25]" />
            </button>
          )}

          <div
            ref={scrollRef}
            onScroll={updateScrollButtons}
            className="flex-1 min-w-0 flex gap-3 sm:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar pb-2 items-stretch"
          >
            {loading
              ? Array(4)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={i}
                      className="flex-shrink-0 w-[calc(50%-6px)] md:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)] snap-start"
                    >
                      <ProductCardSkeleton />
                    </div>
                  ))
              : products.map((p, i) => (
                  <div
                    key={p.id}
                    className="flex-shrink-0 w-[calc(50%-6px)] md:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)] snap-start"
                  >
                    <ProductCard product={p} index={i} />
                  </div>
                ))}
          </div>

          {products.length > 1 && (
            <button
              type="button"
              onClick={() => scrollByDirection(1)}
              disabled={!canScrollRight}
              aria-label={`Scroll ${title} right`}
              className="flex-shrink-0 p-1 text-zinc-800 dark:text-zinc-200 hover:text-black dark:hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-90"
            >
              <ChevronRight size={24} className="stroke-[2.25]" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

// ---- Brand Manifesto Section (Nike Editorial Style) ----
function BrandManifesto() {
  return (
    <section className="py-16 sm:py-24 bg-zinc-950 text-white border-b border-zinc-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left: Manifesto Statement */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-400">
              The Craft // Artisanal Crochet
            </p>
            <h2 className="font-heading font-black text-3xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-white leading-tight">
              Fast fashion forgets. Pure crochet endures.
            </h2>
            <p className="text-zinc-300 text-base sm:text-lg leading-relaxed font-normal">
              Sri Yarn &amp; Tales was founded with a singular conviction: that true luxury lies in patience, human intentionality, and natural fibers. Unlike machine knitwear, authentic crochet cannot be produced by any industrial machine in the world — each loop and stitch is guided by human hands and a single crochet hook.
            </p>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed font-normal">
              We reject the disposable speed of modern factory assembly. Every stitch tension is calibrated, every tail securely woven in, delivering heirloom-grade amigurumi, architectural bags, and bespoke home textiles that tell a story for decades to come.
            </p>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-zinc-800">
              <Counter to={5000} suffix="+" label="Stitches / Creation" whiteText />
              <Counter to={100} suffix="%" label="Hand-Crocheted" whiteText />
              <Counter to={0} suffix="%" label="Synthetic Fibres" whiteText />
            </div>

            <div className="pt-4">
              <Link to="/about" className="btn-secondary text-white border-white hover:bg-white hover:text-black">
                Meet The Artisans <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Right: Studio Imagery Frame */}
          <div className="lg:col-span-5 relative">
            <div className="aspect-[4/5] rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900 relative shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800&h=1000&fit=crop"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=800&h=1000&fit=crop";
                }}
                alt="Artisan hands crocheting with hook and yarn at Sri Yarn & Tales atelier"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                loading="lazy"
                width={800}
                height={1000}
              />
              <div className="absolute top-4 left-4 px-2.5 py-1 bg-black/80 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-widest rounded-xs border border-white/10">
                Atelier Archive // 100% Hand-Crocheted
              </div>
              <div className="absolute bottom-4 left-4 right-4 px-3 py-2 bg-black/75 backdrop-blur-xs rounded text-[11px] text-zinc-300 flex items-center justify-between border border-white/10">
                <span className="font-semibold text-white">Technique: Single Hook Stitching</span>
                <span className="text-zinc-400">Pure Combed Cotton</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---- Minimalist Ticker Marquee ----
function TickerMarquee() {
  const statement = "SRI YARN & TALES // 100% HAND-CROCHETED IN INDIA // BESPOKE COMMISSIONS // INSURED NATIONWIDE DELIVERY OVER ₹999 // ";
  const fullText = statement.repeat(6);

  return (
    <div className="bg-black text-white dark:bg-zinc-950 dark:text-zinc-200 border-b border-zinc-800 py-3 overflow-hidden select-none" aria-hidden="true">
      <div className="ticker-track">
        <span className="font-mono text-xs uppercase tracking-[0.25em] font-bold inline-block pr-8">
          {fullText}
        </span>
      </div>
    </div>
  );
}

// ---- Bespoke Custom Order Hero Banner ----
function BespokeCallout() {
  return (
    <section className="py-16 sm:py-24 bg-white dark:bg-black transition-colors border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-8 sm:p-14 lg:p-16 text-center relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-4">
            <p className="section-eyebrow">Bespoke Commissions</p>
            <h2 className="font-heading font-black text-3xl sm:text-5xl uppercase tracking-tight text-zinc-950 dark:text-white">
              Your Vision. Woven Stitch by Stitch.
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed">
              Have a specific character, color palette, or architectural dimension in mind? Our master artisans craft custom amigurumi, bags, and home installations tailored exactly to your specification.
            </p>
            <div className="pt-4 flex flex-wrap justify-center gap-4">
              <Link to="/custom-orders" className="btn-primary btn-lg">
                Begin Custom Order <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---- Verified Community Reviews ----
function VerifiedReviews({ reviews }) {
  const [active, setActive] = useState(0);

  if (!reviews || !reviews.length) return null;

  return (
    <section className="py-16 sm:py-24 bg-white dark:bg-black transition-colors border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <p className="section-eyebrow">Collector Sentiment</p>
            <h2 className="section-title">Verified Reviews</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActive((i) => (i - 1 + reviews.length) % reviews.length)}
              className="btn-ghost w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300"
              aria-label="Previous review"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setActive((i) => (i + 1) % reviews.length)}
              className="btn-ghost w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300"
              aria-label="Next review"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Active review showcase */}
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 sm:p-10 bg-zinc-50/50 dark:bg-zinc-950/50">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="flex text-amber-500 dark:text-amber-400 text-lg">
                {"★".repeat(reviews[active].rating || 5)}
              </div>
              <blockquote className="text-xl sm:text-2xl font-heading font-bold text-zinc-950 dark:text-white leading-snug">
                "{reviews[active].text}"
              </blockquote>
              <div className="flex items-center gap-3 pt-2">
                <img
                  src={reviews[active].avatar}
                  alt={reviews[active].author}
                  className="w-10 h-10 rounded-full object-cover border border-zinc-200 dark:border-zinc-800"
                />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-950 dark:text-white">
                    {reviews[active].author}
                  </p>
                  <p className="text-[11px] text-zinc-400 font-medium">Verified Collector // India</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

// ---- Newsletter (Top-Brand Minimalist) ----
function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <section className="py-16 sm:py-24 bg-zinc-50 dark:bg-zinc-950 transition-colors">
      <div className="max-w-xl mx-auto px-4 text-center space-y-4">
        <p className="section-eyebrow">Direct Communiqué</p>
        <h2 className="font-heading font-black text-2xl sm:text-4xl uppercase tracking-tight text-zinc-950 dark:text-white">
          Join The Inner Circle
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm leading-relaxed">
          Receive early notifications for limited-edition drops, atelier insights, and unlock 10% off your initial acquisition.
        </p>

        {submitted ? (
          <div className="p-4 rounded border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
            ✓ Invitation Confirmed. Use code WELCOME10 at checkout.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2 pt-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="input flex-1"
              aria-label="Email address for newsletter"
            />
            <button type="submit" className="btn-primary flex-shrink-0">
              Subscribe
            </button>
          </form>
        )}
        <p className="text-[11px] text-zinc-400">
          We respect privacy. Unsubscribe anytime.
        </p>
      </div>
    </section>
  );
}

// ---- Main Home Page Component ----
export default function Home() {
  const storeProducts = useProductStore((s) => s.products);
  const storeCategories = useCategoryStore((s) => s.categories);

  const bestsellers = useMemo(
    () => (Array.isArray(storeProducts) ? storeProducts.filter((p) => p.isBestseller) : []),
    [storeProducts]
  );

  const newArrivals = useMemo(
    () => (Array.isArray(storeProducts) ? storeProducts.filter((p) => p.isNew) : []),
    [storeProducts]
  );

  const categories = useMemo(
    () =>
      (Array.isArray(storeCategories) ? storeCategories : []).map((cat) => ({
        ...cat,
        count: (Array.isArray(storeProducts) ? storeProducts : []).filter(
          (p) => p.category === cat.slug
        ).length,
      })),
    [storeCategories, storeProducts]
  );

  const [reviews, setReviews] = useState(() => reviewsData || []);

  useEffect(() => {
    getAllReviews().then(setReviews);
  }, []);

  return (
    <>
      <Helmet>
        <title>{brand.seo.defaultTitle}</title>
        <meta name="description" content={brand.seo.defaultDescription} />
        <meta property="og:title" content={brand.seo.defaultTitle} />
        <meta property="og:description" content={brand.seo.defaultDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={`${brand.siteUrl}${brand.seo.ogImage}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content={brand.seo.twitterHandle} />
        <link rel="canonical" href={brand.siteUrl} />
      </Helmet>

      <Hero />
      <ValuePillars />
      <ShopByCategory categories={categories} />
      <ProductSection
        title="Bestsellers"
        eyebrow="Community Staples"
        products={bestsellers}
        loading={false}
        viewAllLink="/shop?sort=bestsellers"
        totalCount={bestsellers.length}
      />
      <BrandManifesto />
      <ProductSection
        title="Latest Drops"
        eyebrow="Season 2026 Releases"
        products={newArrivals}
        loading={false}
        viewAllLink="/shop?sort=newest"
        totalCount={newArrivals.length}
      />
      <TickerMarquee />
      <BespokeCallout />
      <VerifiedReviews reviews={reviews} />
      <Newsletter />
    </>
  );
}

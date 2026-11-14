import React from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Heart, Leaf, Clock, Award, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

function Counter({ to, suffix, label }) {
  const [count, setCount] = React.useState(0);
  const [started, setStarted] = React.useState(false);
  return (
    <motion.div
      whileInView={() => {
        if (!started) {
          setStarted(true);
          let s = 0;
          const step = Math.max(1, Math.floor(to / 50));
          const t = setInterval(() => {
            s += step;
            if (s >= to) {
              setCount(to);
              clearInterval(t);
            } else {
              setCount(s);
            }
          }, 20);
        }
      }}
      viewport={{ once: true }}
      className="text-left"
    >
      <p className="font-heading font-black text-3xl sm:text-4xl text-zinc-950 dark:text-white tracking-tight">
        {count.toLocaleString("en-IN")}{suffix}
      </p>
      <p className="text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider font-semibold mt-1">
        {label}
      </p>
    </motion.div>
  );
}

export default function About() {
  const values = [
    { icon: Heart, title: "100% Handcrafted", desc: "Every loop is calibrated by human touch. Zero automation, no mass assembly." },
    { icon: Leaf, title: "Natural Combed Fibres", desc: "Combed natural cotton and pure merino wool. Completely hypoallergenic and biodegradable." },
    { icon: Clock, title: "Slow Craft Ethics", desc: "We dedicate hours of patient knotting to every piece so each item endures generations." },
    { icon: Award, title: "Uncompromising Finish", desc: "Rigorous tension inspection and reinforced seam finishes for heirloom durability." },
  ];

  return (
    <>
      <Helmet>
        <title>Our Story &amp; Atelier Philosophy | Sri Yarn &amp; Tales</title>
        <meta name="description" content="Discover the philosophy behind Sri Yarn & Tales — artisanal Indian crochet brand elevating slow craft, natural fibres, and timeless minimalist essentials." />
      </Helmet>

      <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors">
        {/* Editorial Header */}
        <section className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 py-16 sm:py-24 px-4">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400">
              The Atelier // Origins
            </p>
            <motion.h1
              className="font-heading font-black text-3xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-zinc-950 dark:text-white leading-[1.05]"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Every Stitch Has Intent. Zero Compromise.
            </motion.h1>
            <motion.p
              className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              Sri Yarn &amp; Tales was established in Bangalore, India, to rescue authentic artisanal crochet from fast-fashion obsolescence. We treat the hook as an instrument of slow architecture.
            </motion.p>
          </div>
        </section>

        {/* Maker Profile */}
        <section className="py-16 sm:py-24 border-b border-zinc-200 dark:border-zinc-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-5 relative">
                <div className="aspect-[4/5] rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900">
                  <img
                    src="https://images.unsplash.com/photo-1612548403247-aa2873e9422d?w=800&h=1000&fit=crop"
                    alt="Artisan crafting crochet at Sri Yarn & Tales"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>

              <div className="lg:col-span-7 space-y-6 text-left">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-400">
                  Master Artisan &amp; Founder
                </p>
                <h2 className="font-heading font-black text-2xl sm:text-4xl uppercase tracking-tight text-zinc-950 dark:text-white">
                  Crafting Heirlooms for the Modern World
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed">
                  "I learned the mathematics and rhythm of crochet from my grandmother. While modern industrial manufacturing favors volume and disposability, handmade crochet remains one of the few textiles that no machine in the world can replicate. Every knot requires human fingers, tactile intuition, and patience."
                </p>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed">
                  Today, every single creation shipped from Sri Yarn &amp; Tales is hand-knotted with pure natural yarn, individually numbered, and checked for tension perfection before leaving our atelier.
                </p>
                <div className="pt-2">
                  <p className="font-heading font-black text-sm uppercase tracking-wider text-zinc-950 dark:text-white">
                    — Srimathi
                  </p>
                  <p className="text-xs text-zinc-400 uppercase tracking-widest font-semibold">
                    Founder &amp; Creative Director // Sri Yarn &amp; Tales
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pillars of Craft */}
        <section className="py-16 sm:py-24 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400 mb-2">
                Brand Core
              </p>
              <h2 className="font-heading font-black text-2xl sm:text-4xl uppercase tracking-tight text-zinc-950 dark:text-white">
                Our Core Principles
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((v) => (
                <div
                  key={v.title}
                  className="p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 space-y-3"
                >
                  <div className="w-10 h-10 rounded bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-white">
                    <v.icon size={18} />
                  </div>
                  <h3 className="font-heading font-black text-sm uppercase tracking-wider text-zinc-950 dark:text-white">
                    {v.title}
                  </h3>
                  <p className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed font-normal">
                    {v.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Metrics Strip */}
        <section className="py-16 sm:py-20 border-b border-zinc-200 dark:border-zinc-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-3 gap-8">
              <Counter to={2000} suffix="+" label="Collectors Across India" />
              <Counter to={5000} suffix="+" label="Handmade Pieces Finished" />
              <Counter to={500} suffix="+" label="5-Star Verified Reviews" />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 text-center">
          <div className="max-w-xl mx-auto px-4 space-y-4">
            <h2 className="font-heading font-black text-2xl sm:text-3xl uppercase tracking-tight text-zinc-950 dark:text-white">
              Experience Authentic Indian Crochet
            </h2>
            <p className="text-xs uppercase tracking-wider text-zinc-500">
              Explore current seasonal catalog or commission a bespoke creation.
            </p>
            <div className="pt-4 flex justify-center gap-3">
              <Link to="/shop" className="btn-primary">
                Shop Collection <ArrowRight size={14} />
              </Link>
              <Link to="/custom-orders" className="btn-secondary">
                Bespoke Orders
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

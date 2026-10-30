import React from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Heart, Leaf, Clock, Award } from "lucide-react";

function Counter({ to, suffix, label }) {
  const [count, setCount] = React.useState(0);
  const [started, setStarted] = React.useState(false);
  return (
    <motion.div
      whileInView={() => {
        if (!started) {
          setStarted(true);
          let s = 0;
          const step = to / 60;
          const t = setInterval(() => {
            s += step;
            if (s >= to) { setCount(to); clearInterval(t); } else setCount(Math.floor(s));
          }, 16);
        }
      }}
      viewport={{ once: true }}
      className="text-center"
    >
      <p className="font-heading font-bold text-4xl text-cocoa">{count.toLocaleString("en-IN")}{suffix}</p>
      <p className="text-warmgray text-sm mt-1">{label}</p>
    </motion.div>
  );
}

export default function About() {
  const values = [
    { icon: Heart, title: "Made with Love", desc: "Every stitch is a labour of love. No machines, no shortcuts — just skill, patience, and passion." },
    { icon: Leaf, title: "Sustainably Made", desc: "We choose yarns that are kind to the planet — natural fibres, minimal waste, plastic-free packaging." },
    { icon: Clock, title: "Slow Craft", desc: "We believe in taking our time. Each piece is crafted slowly, thoughtfully, and without compromise." },
    { icon: Award, title: "Premium Quality", desc: "We use only the finest yarn — soft, durable, and a joy to touch. Quality you can feel." },
  ];

  return (
    <>
      <Helmet>
        <title>About Us | Sri Yarn &amp; Tales</title>
        <meta name="description" content="Meet the maker behind Sri Yarn & Tales — a Bangalore-based handmade crochet brand built on love, slow craft, and sustainable yarn." />
      </Helmet>

      <div>
        {/* Hero */}
        <section className="bg-gradient-hero py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.p className="text-primary font-accent text-xl mb-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              Our Story
            </motion.p>
            <motion.h1 className="section-title mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              From One Hook, A World of Warmth
            </motion.h1>
            <motion.p className="text-warmgray text-lg max-w-2xl mx-auto leading-relaxed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              Sri Yarn &amp; Tales was born in a cosy Bangalore apartment, fuelled by chai, soft yarn, and an 
              unstoppable need to make things. What started as a personal creative outlet became a small business 
              that ships handmade love to homes all across India.
            </motion.p>
          </div>
        </section>

        {/* Maker story */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1612548403247-aa2873e9422d?w=700&h=550&fit=crop"
                    alt="The maker crocheting by hand"
                    className="rounded-4xl w-full shadow-rose-lg"
                    loading="lazy"
                  />
                  <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl p-4 shadow-warm text-center">
                    <p className="font-accent text-primary text-2xl">5+ years</p>
                    <p className="text-xs text-warmgray">of crocheting</p>
                  </div>
                </div>
              </motion.div>

              <motion.div className="space-y-5" initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <h2 className="section-title">Meet the Maker</h2>
                <p className="text-warmgray leading-relaxed">
                  Hi! I'm Srimathi, the hands and heart behind every piece in this shop. I've been crocheting 
                  since I was a teenager, taught by my grandmother who believed that the best gifts were always 
                  handmade ones.
                </p>
                <p className="text-warmgray leading-relaxed">
                  After years of making things just for friends and family, I finally took the leap and opened 
                  Sri Yarn &amp; Tales in 2023. I work from my home studio in Bangalore, surrounded by yarn in 
                  every colour imaginable, a cup of filter coffee, and a lot of good music.
                </p>
                <p className="text-warmgray leading-relaxed">
                  Every order is packed personally by me, and I genuinely care about every single product that 
                  leaves my hands. If you have a question, a custom request, or just want to chat about crochet 
                  — please reach out. I'd love to hear from you! 🧶
                </p>
                <div className="pt-2">
                  <p className="font-accent text-primary text-2xl">— Srimathi</p>
                  <p className="text-warmgray text-sm">Founder &amp; Maker, Sri Yarn &amp; Tales</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 bg-oatmeal">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="section-title text-center mb-12">What We Stand For</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((v, i) => (
                <motion.div key={v.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-3xl p-6 shadow-card text-center">
                  <div className="w-14 h-14 bg-primary-light rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <v.icon size={24} className="text-primary" />
                  </div>
                  <h3 className="font-heading font-bold text-cocoa mb-2">{v.title}</h3>
                  <p className="text-warmgray text-sm leading-relaxed">{v.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-3 gap-8">
              <Counter to={2000} suffix="+" label="Happy Customers" />
              <Counter to={5000} suffix="+" label="Pieces Handcrafted" />
              <Counter to={500} suffix="+" label="5-Star Reviews" />
            </div>
          </div>
        </section>

        {/* Process photos */}
        <section className="py-16 bg-oatmeal">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="section-title text-center mb-10">The Craft Process</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                "https://images.unsplash.com/photo-1576150854012-72bc5f9f7a03?w=400&h=400&fit=crop",
                "https://images.unsplash.com/photo-1604868179606-5cbea1e5fb60?w=400&h=400&fit=crop",
                "https://images.unsplash.com/photo-1612548403247-aa2873e9422d?w=400&h=400&fit=crop",
                "https://images.unsplash.com/photo-1568760970073-ce3f8af8cb72?w=400&h=400&fit=crop",
                "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=400&fit=crop",
                "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
              ].map((src, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                  className="aspect-square rounded-3xl overflow-hidden">
                  <img src={src} alt={`Craft process step ${i+1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" loading="lazy" />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

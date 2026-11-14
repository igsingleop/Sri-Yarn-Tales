import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, Check, Upload, Star, Sparkles, MessageSquare, Package } from "lucide-react";

const schema = z.object({
  name: z.string().min(2, "Name required"),
  email: z.string().email("Valid email required"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Valid Indian mobile number required"),
  productType: z.string().min(1, "Please select a product type"),
  size: z.string().optional(),
  colorPreferences: z.string().optional(),
  budget: z.string().min(1, "Please select a budget range"),
  deadline: z.string().optional(),
  notes: z.string().optional(),
});

const steps = [
  { icon: MessageSquare, title: "1. Brief & Vision", desc: "Submit product category, dimensions, color preferences, and concept references." },
  { icon: Star, title: "2. Atelier Quote", desc: "Our creative director evaluates feasibility and returns a custom quote within 24 hours." },
  { icon: Sparkles, title: "3. Hand-Knotting", desc: "Upon confirmation, your piece is slowly hand-crafted stitch by stitch in our atelier." },
  { icon: Package, title: "4. Insured Delivery", desc: "Arrives carefully boxed with proof of craftsmanship and care documentation." },
];

const productTypes = [
  "Amigurumi Plush Collectible",
  "Architectural Bag / Tote",
  "Home Decor Installation",
  "Wearable / Scarf / Beanie",
  "Baby Heirloom Set",
  "Bespoke Accessory",
  "Event / Corporate Gifting",
  "Other Unique Commission",
];

export default function CustomOrders() {
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitted(true);
  };

  return (
    <>
      <Helmet>
        <title>Bespoke Custom Orders | Sri Yarn &amp; Tales</title>
        <meta name="description" content="Commission a completely custom artisanal crochet piece — personalised palette, dimensions, and embroidery." />
      </Helmet>

      <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors">
        {/* Editorial Header */}
        <section className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 py-16 sm:py-24 px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-4">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400">
              Bespoke Commissions
            </p>
            <motion.h1
              className="font-heading font-black text-3xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-zinc-950 dark:text-white"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Tailored by Master Artisans
            </motion.h1>
            <motion.p
              className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              Bring your design concepts to life. Whether a character collectible, bespoke colorway tote, or architectural home wall hanging, our atelier crafts each piece with meticulous care.
            </motion.p>
          </div>
        </section>

        {/* Process Steps */}
        <section className="py-16 sm:py-20 border-b border-zinc-200 dark:border-zinc-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400 mb-2">
                The Journey
              </p>
              <h2 className="font-heading font-black text-2xl sm:text-3xl uppercase tracking-tight text-zinc-950 dark:text-white">
                How Bespoke Craft Works
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((s) => (
                <div
                  key={s.title}
                  className="p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 space-y-3"
                >
                  <div className="w-10 h-10 rounded bg-black dark:bg-white text-white dark:text-black flex items-center justify-center">
                    <s.icon size={18} />
                  </div>
                  <h3 className="font-heading font-black text-sm uppercase tracking-wider text-zinc-950 dark:text-white">
                    {s.title}
                  </h3>
                  <p className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed font-normal">
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Commission Form */}
        <section className="py-16 sm:py-24">
          <div className="max-w-2xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400 mb-2">
                Atelier Inquiry
              </p>
              <h2 className="font-heading font-black text-2xl sm:text-3xl uppercase tracking-tight text-zinc-950 dark:text-white">
                Submit Your Project Details
              </h2>
            </div>

            {submitted ? (
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-10 bg-zinc-50 dark:bg-zinc-950 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <Check size={32} />
                </div>
                <h3 className="font-heading font-black text-xl uppercase tracking-tight text-zinc-950 dark:text-white">
                  Commission Request Received
                </h3>
                <p className="text-zinc-500 text-xs uppercase tracking-wider max-w-sm mx-auto">
                  Our creative director will review your specifications and email a bespoke estimate within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 sm:p-10 bg-zinc-50/50 dark:bg-zinc-950/50 space-y-5" noValidate>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label" htmlFor="cu-name">Full Name *</label>
                    <input id="cu-name" {...register("name")} className={`input ${errors.name ? "input-error" : ""}`} placeholder="Deepak Kumar" />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="label" htmlFor="cu-email">Email Address *</label>
                    <input id="cu-email" type="email" {...register("email")} className={`input ${errors.email ? "input-error" : ""}`} placeholder="deepak@example.com" />
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="label" htmlFor="cu-phone">Mobile Contact (+91) *</label>
                  <input id="cu-phone" type="tel" maxLength={10} {...register("phone")} className={`input ${errors.phone ? "input-error" : ""}`} placeholder="9876543210" />
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
                </div>

                <div>
                  <label className="label" htmlFor="cu-type">Product Category *</label>
                  <select id="cu-type" {...register("productType")} className={`input ${errors.productType ? "input-error" : ""}`}>
                    <option value="">Select category...</option>
                    {productTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {errors.productType && <p className="text-xs text-red-500 mt-1">{errors.productType.message}</p>}
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label" htmlFor="cu-size">Dimensions / Size</label>
                    <input id="cu-size" {...register("size")} className="input" placeholder="e.g. 25cm height / Medium" />
                  </div>
                  <div>
                    <label className="label" htmlFor="cu-colors">Colorway Palette</label>
                    <input id="cu-colors" {...register("colorPreferences")} className="input" placeholder="e.g. Obsidian black & cream" />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label" htmlFor="cu-budget">Budget Tier *</label>
                    <select id="cu-budget" {...register("budget")} className={`input ${errors.budget ? "input-error" : ""}`}>
                      <option value="">Select budget tier...</option>
                      <option value="under-1000">₹500 – ₹1,000</option>
                      <option value="1000-2500">₹1,000 – ₹2,500</option>
                      <option value="2500-5000">₹2,500 – ₹5,000</option>
                      <option value="5000+">₹5,000+</option>
                    </select>
                    {errors.budget && <p className="text-xs text-red-500 mt-1">{errors.budget.message}</p>}
                  </div>
                  <div>
                    <label className="label" htmlFor="cu-deadline">Delivery Target Date</label>
                    <input id="cu-deadline" type="date" {...register("deadline")} className="input" min={new Date().toISOString().split("T")[0]} />
                  </div>
                </div>

                <div>
                  <label className="label" htmlFor="cu-notes">Project Specifications</label>
                  <textarea id="cu-notes" {...register("notes")} rows={4} className="input resize-none"
                    placeholder="Describe specific details, character inspiration, custom embroidery initials, or requirements..." />
                </div>

                <div className="p-3 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-start gap-3 text-xs text-zinc-500">
                  <Upload size={14} className="text-zinc-900 dark:text-white flex-shrink-0 mt-0.5" />
                  <p>Inspiration images may be attached in reply to your email confirmation.</p>
                </div>

                <button type="submit" disabled={isSubmitting} className="btn-primary w-full btn-lg">
                  {isSubmitting ? "Transmitting..." : "Submit Bespoke Commission"}
                  <ArrowRight size={14} />
                </button>
              </form>
            )}
          </div>
        </section>
      </div>
    </>
  );
}

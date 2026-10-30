import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, Check, Upload, Star, Sparkles, MessageSquare, Clock, Package } from "lucide-react";

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
  { icon: MessageSquare, title: "Share Your Idea", desc: "Tell us what you have in mind — product type, colours, size, and any inspiration images." },
  { icon: Star, title: "Get a Quote", desc: "We'll review your requirements and send a personalised quote within 24-48 hours." },
  { icon: Sparkles, title: "We Start Crafting", desc: "Once you confirm the quote, our maker begins crafting your one-of-a-kind piece with love." },
  { icon: Package, title: "Delivery", desc: "Your custom piece is carefully packed in our signature gift box and shipped to your door." },
];

const productTypes = [
  "Amigurumi / Plushie",
  "Bag or Tote",
  "Home Decor",
  "Wearable (Scarf, Beanie, etc.)",
  "Baby Item",
  "Accessories (Keychain, Earrings, etc.)",
  "Custom Wedding / Event Piece",
  "Other",
];

export default function CustomOrders() {
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    await new Promise((r) => setTimeout(r, 1500)); // Simulate submission
    setSubmitted(true);
  };

  return (
    <>
      <Helmet>
        <title>Custom Orders | Sri Yarn &amp; Tales</title>
        <meta name="description" content="Order a completely custom handmade crochet piece — personalised to your colours, size, and design. Amigurumi, bags, wearables and more." />
      </Helmet>

      <div>
        {/* Hero */}
        <section className="bg-gradient-rose text-white py-20 px-4 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="absolute w-2 h-2 bg-white rounded-full animate-float"
                style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 4}s` }} />
            ))}
          </div>
          <div className="relative z-10 max-w-3xl mx-auto">
            <motion.p className="font-accent text-white/80 text-xl mb-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              Made Just for You
            </motion.p>
            <motion.h1 className="font-heading font-bold mb-4" style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              Custom Crochet Orders
            </motion.h1>
            <motion.p className="text-white/80 text-lg max-w-2xl mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              Have a specific idea in mind? We'd love to bring it to life. Share your vision and we'll craft something 
              completely unique — from custom amigurumi characters to personalised wedding favours.
            </motion.p>
          </div>
        </section>

        {/* Process Steps */}
        <section className="py-16 bg-oatmeal">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="section-title text-center mb-12">How It Works</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((s, i) => (
                <motion.div key={s.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center mx-auto mb-4 relative">
                    <s.icon size={28} className="text-primary" />
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">{i + 1}</span>
                  </div>
                  <h3 className="font-heading font-bold text-lg text-cocoa mb-2">{s.title}</h3>
                  <p className="text-warmgray text-sm leading-relaxed">{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Form */}
        <section className="py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10">
              <h2 className="section-title">Tell Us About Your Project</h2>
              <p className="section-subtitle mx-auto mt-3">
                Fill in the details below and we'll get back to you within 24-48 hours with a quote.
              </p>
            </div>

            {submitted ? (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-4xl p-10 shadow-warm text-center">
                <div className="w-20 h-20 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check size={40} className="text-primary" />
                </div>
                <h3 className="font-heading font-bold text-2xl text-cocoa mb-2">Request Received! 🎉</h3>
                <p className="text-warmgray">
                  Thank you! We've received your custom order request and will get back to you within 24-48 hours.
                  Check your email for a confirmation.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-4xl p-6 sm:p-10 shadow-warm space-y-5" noValidate>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label" htmlFor="cu-name">Your Name <span className="text-error">*</span></label>
                    <input id="cu-name" {...register("name")} className={`input ${errors.name ? "input-error" : ""}`} placeholder="Priya Sharma" />
                    {errors.name && <p className="text-xs text-error mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="label" htmlFor="cu-email">Email <span className="text-error">*</span></label>
                    <input id="cu-email" type="email" {...register("email")} className={`input ${errors.email ? "input-error" : ""}`} placeholder="priya@example.com" />
                    {errors.email && <p className="text-xs text-error mt-1">{errors.email.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="label" htmlFor="cu-phone">Mobile Number <span className="text-error">*</span></label>
                  <div className="flex gap-2">
                    <span className="input flex-shrink-0 w-16 text-center font-semibold bg-oatmeal">+91</span>
                    <input id="cu-phone" type="tel" maxLength={10} {...register("phone")} className={`input flex-1 ${errors.phone ? "input-error" : ""}`} placeholder="98765 43210" />
                  </div>
                  {errors.phone && <p className="text-xs text-error mt-1">{errors.phone.message}</p>}
                </div>

                <div>
                  <label className="label" htmlFor="cu-type">Product Type <span className="text-error">*</span></label>
                  <select id="cu-type" {...register("productType")} className={`input ${errors.productType ? "input-error" : ""}`}>
                    <option value="">Select product type...</option>
                    {productTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {errors.productType && <p className="text-xs text-error mt-1">{errors.productType.message}</p>}
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label" htmlFor="cu-size">Preferred Size</label>
                    <input id="cu-size" {...register("size")} className="input" placeholder="e.g. 20cm tall, medium, A4 size..." />
                  </div>
                  <div>
                    <label className="label" htmlFor="cu-colors">Colour Preferences</label>
                    <input id="cu-colors" {...register("colorPreferences")} className="input" placeholder="e.g. pastel pink and white..." />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label" htmlFor="cu-budget">Budget Range <span className="text-error">*</span></label>
                    <select id="cu-budget" {...register("budget")} className={`input ${errors.budget ? "input-error" : ""}`}>
                      <option value="">Select budget...</option>
                      <option value="under-500">Under ₹500</option>
                      <option value="500-1000">₹500 – ₹1,000</option>
                      <option value="1000-2000">₹1,000 – ₹2,000</option>
                      <option value="2000-5000">₹2,000 – ₹5,000</option>
                      <option value="5000+">₹5,000+</option>
                    </select>
                    {errors.budget && <p className="text-xs text-error mt-1">{errors.budget.message}</p>}
                  </div>
                  <div>
                    <label className="label" htmlFor="cu-deadline">Required By</label>
                    <input id="cu-deadline" type="date" {...register("deadline")} className="input" min={new Date().toISOString().split("T")[0]} />
                    <p className="text-xs text-warmgray mt-1">Please allow at least 2 weeks for custom orders</p>
                  </div>
                </div>

                <div>
                  <label className="label" htmlFor="cu-notes">Additional Notes / Description</label>
                  <textarea id="cu-notes" {...register("notes")} rows={4} className="input resize-none"
                    placeholder="Describe your idea in detail — reference images, character details, special requirements, personalization notes..." />
                </div>

                <div className="bg-oatmeal rounded-2xl p-4 flex items-start gap-3 text-sm text-warmgray">
                  <Upload size={16} className="text-primary flex-shrink-0 mt-0.5" />
                  <p>Have reference images? Please email them to <strong className="text-primary">hello@srigyarnandtales.com</strong> after submitting this form.</p>
                </div>

                <button type="submit" disabled={isSubmitting} className="btn-primary w-full btn-lg disabled:opacity-50">
                  {isSubmitting ? "Sending..." : "Submit Custom Order Request"}
                  <ArrowRight size={18} />
                </button>
              </form>
            )}
          </div>
        </section>
      </div>
    </>
  );
}

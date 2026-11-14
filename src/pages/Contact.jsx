import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Phone, MapPin, MessageCircle, ChevronDown, Check, Send } from "lucide-react";
import { brand } from "../config/brand";

const schema = z.object({
  name: z.string().min(2, "Name required"),
  email: z.string().email("Valid email required"),
  subject: z.string().min(3, "Subject required"),
  message: z.string().min(15, "Please provide more details"),
});

const faqs = [
  { q: "What is the typical production timeline for bespoke orders?", a: "In-stock items dispatch within 2 business days. Custom bespoke commissions require 10-18 working days depending on complexity." },
  { q: "Is insured delivery available across all Indian states?", a: "Yes. We deliver to all postal codes across India via insured courier. Complimentary express shipping applies to orders above ₹999." },
  { q: "What is the policy regarding returns & exchanges?", a: "We provide seamless 7-day replacements for any manufacturing damage. Bespoke personalized pieces are final sale unless damaged in transit." },
  { q: "How should natural fibre crochet be cared for?", a: "We recommend gentle hand-washing in cold water with eco-friendly liquid detergent, followed by flat air-drying to preserve loop geometry." },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-zinc-200 dark:border-zinc-800">
      <button onClick={() => setOpen((o) => !o)} className="flex items-center justify-between w-full py-4 text-left gap-3" aria-expanded={open}>
        <span className="font-heading font-black text-xs uppercase tracking-wider text-zinc-950 dark:text-white">{q}</span>
        <ChevronDown size={14} className={`text-zinc-400 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <p className="pb-4 text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitted(true);
  };

  return (
    <>
      <Helmet>
        <title>Atelier Communications &amp; FAQ | Sri Yarn &amp; Tales</title>
        <meta name="description" content="Contact the Sri Yarn & Tales atelier for custom orders, press inquiries, and client assistance." />
      </Helmet>

      <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors">
        {/* Header */}
        <section className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 py-16 sm:py-20 px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400">
              Client Support // Communications
            </p>
            <motion.h1 className="font-heading font-black text-3xl sm:text-5xl uppercase tracking-tight text-zinc-950 dark:text-white" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              Connect With The Atelier
            </motion.h1>
            <p className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm uppercase tracking-wider">
              Bespoke commissions, order queries, or private studio requests.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-12">
              {/* Form (7 cols) */}
              <div className="lg:col-span-7">
                <h2 className="font-heading font-black text-xl uppercase tracking-wider text-zinc-950 dark:text-white mb-6">
                  Transmit an Inquiry
                </h2>
                {submitted ? (
                  <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-8 bg-zinc-50 dark:bg-zinc-950 text-center space-y-3">
                    <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                      <Check size={24} />
                    </div>
                    <h3 className="font-heading font-black text-base uppercase tracking-wider text-zinc-950 dark:text-white">
                      Message Received
                    </h3>
                    <p className="text-zinc-500 text-xs uppercase tracking-wider">
                      We will review and respond to your inquiry within 24 hours.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 sm:p-8 bg-zinc-50/50 dark:bg-zinc-950/50" noValidate>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label" htmlFor="ct-name">Name *</label>
                        <input id="ct-name" {...register("name")} className={`input ${errors.name ? "input-error" : ""}`} placeholder="Your full name" />
                        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                      </div>
                      <div>
                        <label className="label" htmlFor="ct-email">Email Address *</label>
                        <input id="ct-email" type="email" {...register("email")} className={`input ${errors.email ? "input-error" : ""}`} placeholder="name@domain.com" />
                        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                      </div>
                    </div>
                    <div>
                      <label className="label" htmlFor="ct-subject">Inquiry Subject *</label>
                      <input id="ct-subject" {...register("subject")} className={`input ${errors.subject ? "input-error" : ""}`} placeholder="e.g. Order status, custom bridal set" />
                      {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject.message}</p>}
                    </div>
                    <div>
                      <label className="label" htmlFor="ct-message">Details *</label>
                      <textarea id="ct-message" {...register("message")} rows={5} className={`input resize-none ${errors.message ? "input-error" : ""}`} placeholder="Provide relevant details..." />
                      {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message.message}</p>}
                    </div>
                    <button type="submit" disabled={isSubmitting} className="btn-primary w-full btn-lg">
                      {isSubmitting ? "Transmitting..." : <><Send size={14} /> Send Message</>}
                    </button>
                  </form>
                )}
              </div>

              {/* Direct Info & FAQ (5 cols) */}
              <div className="lg:col-span-5 space-y-8">
                <div>
                  <h2 className="font-heading font-black text-xl uppercase tracking-wider text-zinc-950 dark:text-white mb-6">
                    Direct Channels
                  </h2>
                  <div className="space-y-3">
                    {[
                      { icon: Mail, label: "Electronic Mail", value: brand.email, href: `mailto:${brand.email}` },
                      { icon: Phone, label: "Telephone Contact", value: brand.phone, href: `tel:${brand.phone}` },
                      { icon: MapPin, label: "Atelier Studio", value: brand.address },
                    ].map(({ icon: Icon, label, value, href }) => (
                      <div key={label} className="flex items-center gap-3.5 p-3.5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 rounded">
                        <div className="w-8 h-8 bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center rounded flex-shrink-0 text-zinc-950 dark:text-white">
                          <Icon size={14} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{label}</p>
                          {href ? (
                            <a href={href} className="text-xs font-bold uppercase tracking-wider text-zinc-950 dark:text-white hover:underline">{value}</a>
                          ) : (
                            <p className="text-xs font-bold uppercase tracking-wider text-zinc-950 dark:text-white">{value}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <a
                    href={`https://wa.me/${brand.whatsapp}?text=Hi%20Sri%20Yarn%20%26%20Tales!%20I%20have%20an%20inquiry.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 flex items-center gap-2 btn bg-emerald-600 text-white hover:bg-emerald-700 w-full justify-center text-xs font-bold uppercase tracking-wider"
                  >
                    <MessageCircle size={16} />
                    Instant WhatsApp Concierge
                  </a>
                </div>

                {/* FAQ */}
                <div>
                  <h3 className="font-heading font-black text-xs uppercase tracking-[0.2em] text-zinc-400 mb-4">
                    Frequently Addressed Inquiries
                  </h3>
                  <div className="space-y-0">
                    {faqs.map((faq) => <FaqItem key={faq.q} {...faq} />)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

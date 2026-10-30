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
  message: z.string().min(20, "Please write at least 20 characters"),
});

const faqs = [
  { q: "How long does it take to receive my order?", a: "Most in-stock items ship within 2-3 business days. Custom orders take 2-4 weeks depending on complexity. Delivery typically takes 3-7 days after dispatch depending on your location." },
  { q: "Do you ship across India?", a: "Yes! We ship to all pin codes across India. Free shipping on orders above ₹999." },
  { q: "Can I get a refund?", a: "We accept returns within 7 days for manufacturing defects. Custom and personalised items cannot be returned unless there's a defect. Please contact us before returning." },
  { q: "How do I care for my crochet items?", a: "Most items require hand wash in cold water with a gentle detergent. Specific care instructions are included on every product page and in the order package." },
  { q: "Do you do bulk orders?", a: "Absolutely! We love bulk orders for weddings, corporate gifting, and events. Please contact us directly for bulk pricing." },
  { q: "Can I visit your studio?", a: "We're a home-based studio in Bangalore. While we don't have a walk-in store, you're welcome to reach out via WhatsApp to arrange a pickup." },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border">
      <button onClick={() => setOpen((o) => !o)} className="flex items-center justify-between w-full py-4 text-left gap-3" aria-expanded={open}>
        <span className="font-medium text-cocoa text-sm sm:text-base">{q}</span>
        <ChevronDown size={18} className={`text-warmgray flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
            <p className="pb-4 text-warmgray text-sm leading-relaxed">{a}</p>
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
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitted(true);
  };

  return (
    <>
      <Helmet>
        <title>Contact Us | Sri Yarn &amp; Tales</title>
        <meta name="description" content="Get in touch with Sri Yarn & Tales for orders, custom requests, or just to say hello. We'd love to hear from you!" />
      </Helmet>

      <div>
        {/* Header */}
        <section className="bg-gradient-to-br from-primary-light to-cream py-16 px-4 text-center">
          <motion.h1 className="section-title mb-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            Let's Talk Yarn 🧶
          </motion.h1>
          <motion.p className="section-subtitle mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            Questions, custom orders, collaborations, or just a friendly hello — we'd love to hear from you!
          </motion.p>
        </section>

        {/* Main content */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Form */}
              <div>
                <h2 className="font-heading font-bold text-2xl text-cocoa mb-6">Send Us a Message</h2>
                {submitted ? (
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-sage/10 rounded-3xl p-8 text-center">
                    <div className="w-16 h-16 bg-sage/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check size={32} className="text-sage-dark" />
                    </div>
                    <h3 className="font-heading font-bold text-xl text-cocoa mb-2">Message Sent!</h3>
                    <p className="text-warmgray">Thank you for reaching out. We'll reply within 24-48 hours.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label" htmlFor="ct-name">Name <span className="text-error">*</span></label>
                        <input id="ct-name" {...register("name")} className={`input ${errors.name ? "input-error" : ""}`} placeholder="Your name" />
                        {errors.name && <p className="text-xs text-error mt-1">{errors.name.message}</p>}
                      </div>
                      <div>
                        <label className="label" htmlFor="ct-email">Email <span className="text-error">*</span></label>
                        <input id="ct-email" type="email" {...register("email")} className={`input ${errors.email ? "input-error" : ""}`} placeholder="your@email.com" />
                        {errors.email && <p className="text-xs text-error mt-1">{errors.email.message}</p>}
                      </div>
                    </div>
                    <div>
                      <label className="label" htmlFor="ct-subject">Subject <span className="text-error">*</span></label>
                      <input id="ct-subject" {...register("subject")} className={`input ${errors.subject ? "input-error" : ""}`} placeholder="What's it about?" />
                      {errors.subject && <p className="text-xs text-error mt-1">{errors.subject.message}</p>}
                    </div>
                    <div>
                      <label className="label" htmlFor="ct-message">Message <span className="text-error">*</span></label>
                      <textarea id="ct-message" {...register("message")} rows={5} className={`input resize-none ${errors.message ? "input-error" : ""}`} placeholder="Tell us everything..." />
                      {errors.message && <p className="text-xs text-error mt-1">{errors.message.message}</p>}
                    </div>
                    <button type="submit" disabled={isSubmitting} className="btn-primary w-full btn-lg disabled:opacity-50">
                      {isSubmitting ? "Sending..." : <><Send size={18} /> Send Message</>}
                    </button>
                  </form>
                )}
              </div>

              {/* Contact info */}
              <div className="space-y-8">
                <div>
                  <h2 className="font-heading font-bold text-2xl text-cocoa mb-6">Find Us</h2>
                  <div className="space-y-4">
                    {[
                      { icon: Mail, label: "Email", value: brand.email, href: `mailto:${brand.email}` },
                      { icon: Phone, label: "Phone", value: brand.phone, href: `tel:${brand.phone}` },
                      { icon: MapPin, label: "Location", value: brand.address },
                    ].map(({ icon: Icon, label, value, href }) => (
                      <div key={label} className="flex items-center gap-4 p-4 bg-oatmeal rounded-2xl">
                        <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center flex-shrink-0">
                          <Icon size={18} className="text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-warmgray font-medium">{label}</p>
                          {href ? (
                            <a href={href} className="text-cocoa font-semibold hover:text-primary transition-colors">{value}</a>
                          ) : (
                            <p className="text-cocoa font-semibold">{value}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <a
                    href={`https://wa.me/${brand.whatsapp}?text=Hi%20Sri%20Yarn%20%26%20Tales!%20I%20have%20a%20question.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 flex items-center gap-3 btn bg-[#25D366] text-white hover:bg-[#1da851] w-full justify-center"
                  >
                    <MessageCircle size={20} />
                    Chat on WhatsApp
                  </a>
                </div>

                {/* FAQ */}
                <div>
                  <h3 className="font-heading font-bold text-xl text-cocoa mb-4">Frequently Asked Questions</h3>
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

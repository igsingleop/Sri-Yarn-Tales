import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { brand } from "../config/brand";

const faqs = [
  {
    category: "Orders & Production",
    items: [
      {
        q: "What is the production timeline for bespoke / custom orders?",
        a: "In-stock items are dispatched within 1–2 business days. Custom bespoke commissions require 10–18 working days depending on complexity, number of pieces, and the specific colour palette requested. You'll receive a detailed timeline in your commission confirmation email. If your order is time-sensitive (e.g., a birthday or wedding gift), mention it in your brief and we'll do our best to accommodate.",
      },
      {
        q: "Can I make changes to my order after placing it?",
        a: "In-stock orders may be modified within 12 hours of placement by emailing us. Once dispatched, changes cannot be made. For custom orders, modifications are possible before the crafting begins — typically within 24 hours of commission confirmation.",
      },
      {
        q: "Do you offer bulk or corporate gifting discounts?",
        a: "Yes! For orders of 10+ pieces, contact us at " + brand.email + " for a custom corporate quote. We also offer branded packaging and personalised gift notes.",
      },
    ],
  },
  {
    category: "Shipping & Delivery",
    items: [
      {
        q: "Is insured delivery available across all Indian states?",
        a: "Yes. We deliver to every serviceable PIN code across India via fully insured courier (Delhivery & BlueDart). Complimentary insured express shipping is available on all orders above ₹" + brand.freeShippingThreshold + ". Orders below this attract a flat ₹79 shipping fee. Delivery typically takes 3–7 business days depending on your location.",
      },
      {
        q: "How do I track my order?",
        a: "Once dispatched, you'll receive an email with your AWB (airway bill) tracking number and a direct link to the courier's tracking page. You can also check your order status in your account dashboard.",
      },
      {
        q: "Do you ship internationally?",
        a: "International shipping is not currently available but is planned for 2026. Join our newsletter to be notified when international orders open.",
      },
    ],
  },
  {
    category: "Returns & Exchanges",
    items: [
      {
        q: "What is the returns & exchanges policy?",
        a: "We provide seamless 7-day replacements for any item that arrives damaged or defective. To initiate a return, email " + brand.email + " with your order number and photographs of the damage within 7 days of delivery. We arrange a prepaid return pickup and dispatch a replacement (or full refund) within 5–7 business days. Bespoke/custom pieces are final sale unless defective.",
      },
      {
        q: "What if I simply change my mind?",
        a: "We're unable to accept returns for change of mind on handmade items, as each piece is crafted specifically for our small-batch collection. If you have concerns before purchasing, please contact us — we're happy to share additional photos, videos, or size references.",
      },
    ],
  },
  {
    category: "Product Care",
    items: [
      {
        q: "How should I care for natural fibre crochet pieces?",
        a: "We recommend gentle hand-washing in cold water (below 30°C) using a mild, eco-friendly liquid detergent. Avoid wringing or twisting. Gently press out excess water using a clean towel, then reshape the piece and air-dry flat, away from direct sunlight and heat. Never tumble dry, iron directly, or use bleach.",
      },
      {
        q: "How do I store crochet amigurumi toys?",
        a: "Store amigurumi in a cool, dry place away from direct sunlight to preserve colour vibrancy. Avoid storing in compressed spaces that may distort their shape. For long-term storage, a breathable cotton bag is ideal.",
      },
      {
        q: "Are your products safe for babies?",
        a: "Products using safety eyes (which have a small backing post) are labelled suitable for age 3+. For infants and babies under 3, we recommend our embroidered-eyes variants which are free from any detachable parts. All our yarns are hypoallergenic and free from harmful dyes.",
      },
    ],
  },
  {
    category: "Custom Orders",
    items: [
      {
        q: "What information do I need to provide for a bespoke commission?",
        a: "Use our Custom Order form to submit: (1) the type of piece — amigurumi character, bag, home decor, etc.; (2) preferred dimensions; (3) colour palette — hex codes, Pantone references, or simply descriptive names; (4) any reference images; (5) your target delivery date; and (6) your budget tier. The more detail you provide, the more accurate our quote.",
      },
      {
        q: "Can I commission a custom character or IP-inspired amigurumi?",
        a: "We can create amigurumi inspired by colour schemes, shapes, and general aesthetics. However, we do not reproduce officially trademarked characters (e.g., Disney, Pokémon) for resale purposes. Personal commissions for private use can be discussed on a case-by-case basis.",
      },
    ],
  },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-zinc-200 dark:border-zinc-800">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full py-4 text-left gap-4"
        aria-expanded={open}
      >
        <span className="font-heading font-bold text-sm text-zinc-950 dark:text-white leading-snug">{q}</span>
        <ChevronDown
          size={16}
          className={`text-zinc-400 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
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
            <p className="pb-5 text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  return (
    <>
      <Helmet>
        <title>FAQ &amp; Care Guide | Sri Yarn &amp; Tales</title>
        <meta
          name="description"
          content="Answers to frequently asked questions — bespoke production timelines, insured delivery, returns policy, and natural-fibre care guide."
        />
        <link rel="canonical" href={`${brand.siteUrl}/faq`} />
      </Helmet>

      <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors">
        <section className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 py-12 sm:py-16 px-4">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400">
              Client Care // Knowledge Base
            </p>
            <motion.h1
              className="font-heading font-black text-3xl sm:text-5xl uppercase tracking-tight text-zinc-950 dark:text-white"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
            >
              FAQ &amp; Care Guide
            </motion.h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm uppercase tracking-wider">
              Everything you need to know about ordering, delivery, and caring for your pieces.
            </p>
          </div>
        </section>

        <section className="py-16 sm:py-24">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-14">
            {faqs.map(({ category, items }) => (
              <div key={category}>
                <h2 className="font-heading font-black text-xs uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 mb-4">
                  {category}
                </h2>
                <div className="space-y-0">
                  {items.map((item) => (
                    <FaqItem key={item.q} {...item} />
                  ))}
                </div>
              </div>
            ))}

            <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 text-center space-y-4 bg-zinc-50/50 dark:bg-zinc-950/50">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Still have questions?
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link to="/contact" className="btn-primary">
                  Contact Atelier
                </Link>
                <Link to="/custom-orders" className="btn-secondary">
                  Bespoke Orders
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

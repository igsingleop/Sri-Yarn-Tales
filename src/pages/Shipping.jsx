import React from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Package, Clock, MapPin, Shield, ArrowRight } from "lucide-react";
import { brand } from "../config/brand";

const sections = [
  {
    icon: Clock,
    title: "Processing Time",
    content:
      "In-stock items are dispatched within 1–2 business days of order confirmation. Custom bespoke commissions require 10–18 working days depending on complexity and your specifications. You will receive an email confirmation once your order ships.",
  },
  {
    icon: Package,
    title: "Shipping Methods & Rates",
    content:
      `Complimentary insured express shipping is available on all orders above ₹${brand.freeShippingThreshold}. Orders below ₹${brand.freeShippingThreshold} attract a flat shipping fee of ₹79. We use trusted courier partners (Delhivery, BlueDart) for all deliveries.`,
  },
  {
    icon: MapPin,
    title: "Delivery Coverage",
    content:
      "We deliver to all serviceable PIN codes across India — from metro cities to tier-3 towns. International shipping is currently unavailable but is planned for 2026.",
  },
  {
    icon: Shield,
    title: "Insured Parcels",
    content:
      "Every parcel is packed with artisanal care and fully insured against damage or loss in transit. In the unlikely event of a damaged delivery, please photograph the parcel and contact us within 48 hours of receipt.",
  },
];

export default function Shipping() {
  return (
    <>
      <Helmet>
        <title>Shipping Policy | Sri Yarn &amp; Tales</title>
        <meta
          name="description"
          content="Sri Yarn & Tales shipping policy — processing times, insured delivery, and coverage across India."
        />
        <link rel="canonical" href={`${brand.siteUrl}/shipping`} />
      </Helmet>

      <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors">
        {/* Header */}
        <section className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 py-12 sm:py-16 px-4">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400">
              Client Care // Logistics
            </p>
            <motion.h1
              className="font-heading font-black text-3xl sm:text-5xl uppercase tracking-tight text-zinc-950 dark:text-white"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Shipping Policy
            </motion.h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm uppercase tracking-wider">
              Complimentary insured delivery across India on orders above ₹{brand.freeShippingThreshold}.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 sm:py-24">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="space-y-8">
              {sections.map(({ icon: Icon, title, content }) => (
                <div
                  key={title}
                  className="flex gap-5 p-6 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50/50 dark:bg-zinc-950/50"
                >
                  <div className="w-10 h-10 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center rounded flex-shrink-0">
                    <Icon size={18} />
                  </div>
                  <div>
                    <h2 className="font-heading font-black text-sm uppercase tracking-wider text-zinc-950 dark:text-white mb-2">
                      {title}
                    </h2>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">{content}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 p-6 border border-zinc-200 dark:border-zinc-800 rounded-lg text-center space-y-4">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Questions about your shipment?
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link to="/contact" className="btn-primary">
                  Contact Atelier <ArrowRight size={14} />
                </Link>
                <Link to="/faq" className="btn-secondary">
                  FAQ &amp; Care Guide
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

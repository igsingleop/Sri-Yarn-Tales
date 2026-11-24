import React from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { RefreshCw, AlertCircle, Check, X, ArrowRight } from "lucide-react";
import { brand } from "../config/brand";

const eligible = [
  "Items received damaged or defective",
  "Incorrect item shipped by us",
  "Significant deviation from product description",
];

const ineligible = [
  "Bespoke / custom-made pieces (unless defective)",
  "Items showing signs of use or washing",
  "Returns initiated after 7 days of delivery",
  "Items without original packaging",
];

const steps = [
  { step: "01", title: "Contact Us Within 7 Days", desc: `Email ${brand.email} with your order number and clear photos of the issue within 7 days of delivery.` },
  { step: "02", title: "Atelier Review", desc: "Our team reviews your request within 24 hours and confirms eligibility." },
  { step: "03", title: "Return Dispatch", desc: "We arrange a prepaid return pickup from your address at no extra cost." },
  { step: "04", title: "Replacement or Refund", desc: "Upon receipt and inspection, we dispatch a replacement or initiate a full refund within 5–7 business days." },
];

export default function Returns() {
  return (
    <>
      <Helmet>
        <title>Returns &amp; Exchanges | Sri Yarn &amp; Tales</title>
        <meta
          name="description"
          content="Sri Yarn & Tales returns and exchanges policy — 7-day replacement guarantee for manufacturing defects."
        />
        <link rel="canonical" href={`${brand.siteUrl}/returns`} />
      </Helmet>

      <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors">
        <section className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 py-12 sm:py-16 px-4">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400">
              Client Care // Returns
            </p>
            <motion.h1
              className="font-heading font-black text-3xl sm:text-5xl uppercase tracking-tight text-zinc-950 dark:text-white"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Returns &amp; Exchanges
            </motion.h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm uppercase tracking-wider">
              7-day replacement guarantee on manufacturing defects.
            </p>
          </div>
        </section>

        <section className="py-16 sm:py-24">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-12">
            {/* Eligibility */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="p-6 border border-emerald-200 dark:border-emerald-900 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20">
                <h2 className="font-heading font-black text-sm uppercase tracking-wider text-zinc-950 dark:text-white mb-4 flex items-center gap-2">
                  <Check size={16} className="text-emerald-600" /> Eligible for Return
                </h2>
                <ul className="space-y-2">
                  {eligible.map((item) => (
                    <li key={item} className="text-xs text-zinc-600 dark:text-zinc-400 flex items-start gap-2">
                      <Check size={12} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-6 border border-red-200 dark:border-red-900 rounded-lg bg-red-50/50 dark:bg-red-950/20">
                <h2 className="font-heading font-black text-sm uppercase tracking-wider text-zinc-950 dark:text-white mb-4 flex items-center gap-2">
                  <X size={16} className="text-red-500" /> Not Eligible
                </h2>
                <ul className="space-y-2">
                  {ineligible.map((item) => (
                    <li key={item} className="text-xs text-zinc-600 dark:text-zinc-400 flex items-start gap-2">
                      <X size={12} className="text-red-500 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Process */}
            <div>
              <h2 className="font-heading font-black text-xl uppercase tracking-wider text-zinc-950 dark:text-white mb-6 text-center">
                Return Process
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {steps.map(({ step, title, desc }) => (
                  <div key={step} className="p-5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50/50 dark:bg-zinc-950/50">
                    <span className="text-xs font-mono font-bold text-zinc-400 dark:text-zinc-500">{step}</span>
                    <h3 className="font-heading font-black text-sm uppercase tracking-wider text-zinc-950 dark:text-white mt-1 mb-2">{title}</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 border border-amber-200 dark:border-amber-900 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 flex gap-3">
              <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                <strong>Bespoke Orders:</strong> Custom-crafted pieces are final sale unless they arrive damaged or defective. We photograph and document every custom piece before dispatch as proof of condition.
              </p>
            </div>

            <div className="text-center space-y-4">
              <Link to="/contact" className="btn-primary inline-flex">
                Contact Atelier <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

import React from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { brand } from "../config/brand";

const sections = [
  {
    title: "1. Acceptance of Terms",
    content:
      "By accessing or placing an order on sri-yarn-tales.vercel.app, you agree to be bound by these Terms of Service and all applicable laws. If you do not agree with any part of these terms, please discontinue use of the site.",
  },
  {
    title: "2. Products & Descriptions",
    content:
      "We strive to display product colours, dimensions, and descriptions as accurately as possible. Due to the handmade nature of our products, minor variations in colour, size (±5%), and stitch pattern are inherent and are not defects. Each piece is unique.",
  },
  {
    title: "3. Pricing & Payments",
    content:
      `All prices are displayed in Indian Rupees (₹) inclusive of applicable GST. We reserve the right to modify prices at any time. Payment is processed securely via Razorpay. We accept UPI, Net Banking, credit/debit cards, and select wallets.`,
  },
  {
    title: "4. Order Confirmation",
    content:
      "An order is confirmed only upon receipt of full payment and an email confirmation from us. We reserve the right to cancel any order if a product becomes unavailable, in which case a full refund is issued within 5–7 business days.",
  },
  {
    title: "5. Custom & Bespoke Orders",
    content:
      "Bespoke commissions require a 50% advance payment. Balance is due before dispatch. Custom pieces are non-refundable unless they arrive defective. Production timelines are estimates; delays beyond 2 weeks will be communicated proactively.",
  },
  {
    title: "6. Intellectual Property",
    content:
      "All content on this site — product designs, photography, copy, and the Sri Yarn & Tales brand identity — is the exclusive intellectual property of Sri Yarn & Tales. Reproduction or commercial use without written consent is prohibited.",
  },
  {
    title: "7. Limitation of Liability",
    content:
      `Sri Yarn & Tales' maximum liability for any claim arising from an order shall not exceed the value of that order. We are not liable for indirect or consequential losses.`,
  },
  {
    title: "8. Governing Law",
    content:
      "These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts of Bangalore, Karnataka.",
  },
  {
    title: "9. Contact",
    content:
      `For any questions regarding these terms, contact us at ${brand.email}.`,
  },
];

export default function Terms() {
  return (
    <>
      <Helmet>
        <title>Terms of Service | Sri Yarn &amp; Tales</title>
        <meta
          name="description"
          content="Sri Yarn & Tales terms of service — your rights and obligations when shopping with us."
        />
        <link rel="canonical" href={`${brand.siteUrl}/terms`} />
      </Helmet>

      <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors">
        <section className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 py-12 sm:py-16 px-4">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400">
              Legal // Terms
            </p>
            <motion.h1
              className="font-heading font-black text-3xl sm:text-5xl uppercase tracking-tight text-zinc-950 dark:text-white"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Terms of Service
            </motion.h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm">
              Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </section>

        <section className="py-16 sm:py-24">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
            {sections.map(({ title, content }) => (
              <div key={title} className="border-b border-zinc-100 dark:border-zinc-900 pb-8">
                <h2 className="font-heading font-black text-sm uppercase tracking-wider text-zinc-950 dark:text-white mb-3">
                  {title}
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">{content}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

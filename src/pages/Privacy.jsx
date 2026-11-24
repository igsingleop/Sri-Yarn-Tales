import React from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { brand } from "../config/brand";

const sections = [
  {
    title: "Information We Collect",
    content:
      "When you place an order or create an account, we collect your name, email address, shipping address, phone number, and payment details (processed securely via Razorpay — we never store card information). We also collect usage data such as pages visited and products viewed to improve your experience.",
  },
  {
    title: "How We Use Your Information",
    content:
      "Your information is used to process and fulfil orders, send order confirmations and shipping updates, respond to your enquiries, send promotional emails (only with your consent), and improve our website and product range. We never sell your personal data to third parties.",
  },
  {
    title: "Cookies",
    content:
      "We use essential cookies to maintain your shopping cart, wishlist, and session. We may use analytics cookies (e.g., Google Analytics) to understand site usage. You can disable non-essential cookies via your browser settings without affecting core site functionality.",
  },
  {
    title: "Data Retention",
    content:
      "Order data is retained for 7 years for accounting and legal compliance. Account data is retained until you request deletion. You may request deletion of your account data at any time by emailing us.",
  },
  {
    title: "Your Rights",
    content:
      `Under applicable Indian law and global best practices, you have the right to access, correct, or delete your personal data. To exercise these rights, email ${brand.email} with the subject line "Privacy Request".`,
  },
  {
    title: "Third-Party Services",
    content:
      "We use trusted third-party services including Firebase (authentication & database), Razorpay (payments), Delhivery/BlueDart (logistics), and Google Analytics. Each operates under their own privacy policy and is bound by data-processing agreements.",
  },
  {
    title: "Contact",
    content:
      `For any privacy concerns, contact our data protection officer at ${brand.email}. We aim to respond within 48 hours.`,
  },
];

export default function Privacy() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | Sri Yarn &amp; Tales</title>
        <meta
          name="description"
          content="Sri Yarn & Tales privacy policy — how we collect, use, and protect your personal information."
        />
        <link rel="canonical" href={`${brand.siteUrl}/privacy`} />
      </Helmet>

      <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors">
        <section className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 py-12 sm:py-16 px-4">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400">
              Legal // Data Protection
            </p>
            <motion.h1
              className="font-heading font-black text-3xl sm:text-5xl uppercase tracking-tight text-zinc-950 dark:text-white"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Privacy Policy
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

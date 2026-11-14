import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <>
      <Helmet>
        <title>404 — Page Not Found | Sri Yarn &amp; Tales</title>
      </Helmet>

      <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors flex flex-col items-center justify-center text-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 max-w-md border border-zinc-200 dark:border-zinc-800 rounded-lg p-8 bg-zinc-50/50 dark:bg-zinc-950/50"
        >
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-400">
            Error 404 // Route Unresolved
          </p>
          <h1 className="font-heading font-black text-6xl sm:text-7xl tracking-tighter text-zinc-950 dark:text-white">
            404
          </h1>
          <h2 className="font-heading font-bold text-lg uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
            The Thread Unraveled
          </h2>
          <p className="text-zinc-500 text-xs uppercase tracking-wider leading-relaxed">
            The piece or page you requested could not be located in our active catalog.
          </p>

          <div className="flex gap-3 justify-center pt-4">
            <Link to="/" className="btn-primary">
              <Home size={14} /> Home Atelier
            </Link>
            <Link to="/shop" className="btn-secondary">
              <Search size={14} /> Catalog
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  );
}

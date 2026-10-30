import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <>
      <Helmet>
        <title>Page Not Found | Sri Yarn &amp; Tales</title>
      </Helmet>

      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 py-20">
        {/* Tangled yarn illustration */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", damping: 15, stiffness: 200 }}
          className="text-8xl sm:text-9xl mb-6"
        >
          🧶
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4 max-w-md"
        >
          <h1 className="font-heading font-bold text-6xl sm:text-8xl text-primary">404</h1>
          <h2 className="font-heading font-bold text-2xl text-cocoa">Oops! This thread got tangled.</h2>
          <p className="text-warmgray leading-relaxed">
            The page you're looking for seems to have unravelled. 
            Let's find you something beautiful instead!
          </p>

          <div className="flex gap-3 justify-center pt-4">
            <Link to="/" className="btn-primary gap-2">
              <Home size={18} /> Go Home
            </Link>
            <Link to="/shop" className="btn-secondary gap-2">
              <Search size={18} /> Browse Shop
            </Link>
          </div>
        </motion.div>

        {/* Floating dots */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-full bg-primary/20"
            style={{ left: `${15 + i * 14}%`, top: `${20 + (i % 3) * 20}%` }}
            animate={{ y: [0, -20, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2 + i * 0.4, repeat: Infinity, delay: i * 0.3 }}
          />
        ))}
      </div>
    </>
  );
}

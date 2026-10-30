import React from "react";
import { motion } from "framer-motion";
import { YarnBallLogo } from "./Logo";

export default function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-cream">
      {/* Animated yarn ball */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="relative"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <YarnBallLogo className="w-16 h-16" />
        </motion.div>

        {/* Unspooling thread */}
        <motion.div
          className="absolute top-full left-1/2 -translate-x-1/2 mt-2"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          style={{ transformOrigin: "left" }}
        >
          <div className="h-0.5 w-20 bg-gradient-to-r from-primary to-transparent rounded-full" />
        </motion.div>
      </motion.div>

      {/* Brand name */}
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="mt-8 font-heading text-lg text-cocoa"
      >
        Sri Yarn &amp; Tales
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="text-sm text-warmgray mt-1"
      >
        Crafting your experience…
      </motion.p>

      {/* Dot loader */}
      <div className="flex gap-1.5 mt-6">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-primary"
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </div>
  );
}

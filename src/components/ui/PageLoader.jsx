import React from "react";
import { motion } from "framer-motion";
import { YarnBallLogo } from "./Logo";

export default function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-4"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          <YarnBallLogo className="w-12 h-12" />
        </motion.div>

        <p className="font-heading font-black text-xs tracking-[0.25em] uppercase text-zinc-950 dark:text-white">
          Sri Yarn &amp; Tales
        </p>
      </motion.div>
    </div>
  );
}

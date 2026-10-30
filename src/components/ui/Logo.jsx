import React from "react";
import { motion } from "framer-motion";

// Yarn ball SVG logo mark
export function YarnBallLogo({ className = "w-8 h-8" }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Sri Yarn & Tales logo mark"
    >
      {/* Yarn ball body */}
      <circle cx="24" cy="24" r="18" fill="#FBE9ED" stroke="#D4768A" strokeWidth="2" />
      {/* Yarn strands */}
      <path
        d="M8 20C12 14 22 10 30 16C36 20 38 28 34 34"
        stroke="#D4768A"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M10 28C16 24 24 22 30 26C34 29 35 34 32 38"
        stroke="#B85C71"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />
      <path
        d="M6 18C8 12 18 6 26 10"
        stroke="#D4768A"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
      {/* Looped thread / needle */}
      <path
        d="M32 10 Q42 6 44 16 Q46 24 38 28 Q34 30 30 28"
        stroke="#D4768A"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Needle eye */}
      <circle cx="44" cy="16" r="2" fill="#D4768A" />
    </svg>
  );
}

// Full logo with text
export default function Logo({ showText = true, className = "" }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <YarnBallLogo className="w-9 h-9 flex-shrink-0" />
      {showText && (
        <div className="flex flex-col leading-none">
          <span className="font-heading font-bold text-lg text-cocoa leading-none">
            Sri Yarn
          </span>
          <span className="font-accent text-sm text-primary leading-none">
            &amp; Tales
          </span>
        </div>
      )}
    </div>
  );
}

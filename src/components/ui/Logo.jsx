import React from "react";

// Official Brand Logo Emblem (Image)
export function OfficialLogoImage({ className = "w-10 h-10" }) {
  return (
    <img
      src="/logo.jpg"
      alt="Sri Yarn & Tales official emblem"
      className={`rounded-full object-cover flex-shrink-0 shadow-sm border border-zinc-200/90 dark:border-zinc-750 bg-white ${className}`}
      width={48}
      height={48}
      loading="eager"
    />
  );
}

// Backward-compatible YarnBallLogo export
export function YarnBallLogo({ className = "w-8 h-8" }) {
  return <OfficialLogoImage className={className} />;
}

// Full Official Logo lockup with optional typography
export default function Logo({ showText = true, className = "", size = "md" }) {
  const imgSize =
    size === "lg"
      ? "w-12 h-12 sm:w-14 sm:h-14"
      : size === "sm"
      ? "w-8 h-8"
      : "w-10 h-10 sm:w-11 sm:h-11";

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <OfficialLogoImage className={imgSize} />
      {showText && (
        <div className="flex flex-col leading-none">
          <span className="font-heading font-black text-sm tracking-[0.22em] uppercase text-zinc-950 dark:text-white transition-colors">
            Sri Yarn
          </span>
          <span className="text-[10px] tracking-[0.3em] uppercase text-zinc-500 dark:text-zinc-400 font-semibold mt-0.5 transition-colors">
            &amp; Tales
          </span>
        </div>
      )}
    </div>
  );
}

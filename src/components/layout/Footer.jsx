import React from "react";
import { Link } from "react-router-dom";
import {
  Heart, Shield, Package, RefreshCw
} from "lucide-react";
import Logo from "../ui/Logo";
import { brand } from "../../config/brand";

function InstagramIcon({ className = "w-4 h-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ className = "w-4 h-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

const footerLinks = {
  Collections: [
    { label: "Amigurumi Toys", to: "/shop/amigurumi" },
    { label: "Bags & Totes", to: "/shop/bags" },
    { label: "Home Decor", to: "/shop/home-decor" },
    { label: "Wearables & Scarves", to: "/shop/wearables" },
    { label: "Baby Items", to: "/shop/baby" },
    { label: "Accessories", to: "/shop/accessories" },
  ],
  Atelier: [
    { label: "Our Story & Ethics", to: "/about" },
    { label: "Bespoke Commissions", to: "/custom-orders" },
    { label: "Contact Atelier", to: "/contact" },
    { label: "Collector Account", to: "/account" },
    { label: "Admin Portal", to: "/admin" },
  ],
  ClientCare: [
    { label: "Shipping Policy", to: "/shipping" },
    { label: "Returns & Exchanges", to: "/returns" },
    { label: "Privacy Policy", to: "/privacy" },
    { label: "Terms of Service", to: "/terms" },
    { label: "FAQ & Care Guide", to: "/faq" },
  ],
};

const trustBadges = [
  { icon: Shield, label: "Encrypted Transactions" },
  { icon: Package, label: "Artisanal Gift Packaging" },
  { icon: RefreshCw, label: "Seamless Returns" },
  { icon: Heart, label: "100% Handcrafted in India" },
];

export default function Footer() {
  return (
    <footer className="bg-black text-white dark:bg-[#070709] border-t border-zinc-800 transition-colors">
      {/* Top Value Badges Strip */}
      <div className="border-b border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {trustBadges.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 text-xs text-zinc-400">
                <div className="w-8 h-8 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0 text-white">
                  <Icon size={14} />
                </div>
                <span className="font-bold uppercase tracking-wider">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Manifesto Column */}
          <div className="lg:col-span-2 space-y-4">
            <Logo className="text-white [&_span]:text-white" />
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-sm font-normal">
              Sri Yarn &amp; Tales is an artisanal crochet house based in India. Every creation is hand-knotted with pure combed fibres, redefining slow luxury for modern living.
            </p>

            {/* Social Channels */}
            <div className="flex gap-2.5 pt-2">
              <a
                href={brand.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href={brand.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors"
                aria-label="Facebook"
              >
                <FacebookIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links Column: Collections */}
          <div className="space-y-3">
            <p className="font-heading font-black text-xs uppercase tracking-[0.2em] text-white">
              Collections
            </p>
            <ul className="space-y-2">
              {footerLinks.Collections.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-xs text-zinc-400 hover:text-white transition-colors uppercase tracking-wider font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links Column: Atelier */}
          <div className="space-y-3">
            <p className="font-heading font-black text-xs uppercase tracking-[0.2em] text-white">
              Atelier
            </p>
            <ul className="space-y-2">
              {footerLinks.Atelier.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-xs text-zinc-400 hover:text-white transition-colors uppercase tracking-wider font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links Column: Client Care */}
          <div className="space-y-3">
            <p className="font-heading font-black text-xs uppercase tracking-[0.2em] text-white">
              Client Care
            </p>
            <ul className="space-y-2">
              {footerLinks.ClientCare.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-xs text-zinc-400 hover:text-white transition-colors uppercase tracking-wider font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Lower Legal & Regional Strip */}
        <div className="mt-16 pt-8 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 font-medium">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-bold uppercase tracking-widest text-zinc-400">
              India // INR (₹)
            </span>
          </div>

          <p className="uppercase tracking-wider text-[11px] text-center sm:text-right">
            &copy; {new Date().getFullYear()} SRI YARN &amp; TALES. ALL RIGHTS RESERVED. HANDMADE WITH PRIDE.
          </p>
        </div>
      </div>
    </footer>
  );
}

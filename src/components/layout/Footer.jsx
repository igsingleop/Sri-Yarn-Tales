import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Heart, Mail, Phone, MapPin,
  CreditCard, Shield, Package, RefreshCw
} from "lucide-react";
import Logo from "../ui/Logo";
import { brand } from "../../config/brand";

function Instagram({ className, size = 18 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function Facebook({ className, size = 18 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

const footerLinks = {
  Shop: [
    { label: "Amigurumi Toys", to: "/shop/amigurumi" },
    { label: "Bags & Totes", to: "/shop/bags" },
    { label: "Home Decor", to: "/shop/home-decor" },
    { label: "Wearables", to: "/shop/wearables" },
    { label: "Baby Items", to: "/shop/baby" },
    { label: "Accessories", to: "/shop/accessories" },
  ],
  Company: [
    { label: "About Us", to: "/about" },
    { label: "Custom Orders", to: "/custom-orders" },
    { label: "Contact", to: "/contact" },
    { label: "My Account", to: "/account" },
    { label: "Track Order", to: "/account" },
  ],
  Policies: [
    { label: "Shipping Policy", to: "/shipping" },
    { label: "Returns & Refunds", to: "/returns" },
    { label: "Privacy Policy", to: "/privacy" },
    { label: "Terms of Service", to: "/terms" },
    { label: "FAQ", to: "/faq" },
  ],
};

const trustBadges = [
  { icon: Shield, label: "Secure Payments" },
  { icon: Package, label: "Gift Packaging" },
  { icon: RefreshCw, label: "Easy Returns" },
  { icon: Heart, label: "Handmade with Love" },
];

export default function Footer() {
  return (
    <footer className="bg-cocoa text-white relative overflow-hidden">
      {/* Decorative top edge */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      {/* Trust badges strip */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {trustBadges.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 text-sm text-white/70">
                <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Icon size={16} className="text-primary" />
                </div>
                <span className="font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand column */}
          <div className="lg:col-span-2 space-y-4">
            <Logo className="[&_span]:text-white [&_.font-accent]:text-primary" />
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              Handcrafted crochet products made with love in India. 
              Every stitch tells a story, every piece is one-of-a-kind.
            </p>

            {/* Social */}
            <div className="flex gap-3 pt-2">
              <a
                href={brand.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors"
              >
                <Instagram size={18} />
              </a>
              <a
                href={brand.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors"
              >
                <Facebook size={18} />
              </a>
              {/* WhatsApp */}
              <a
                href={`https://wa.me/${brand.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors text-sm font-bold"
              >
                WA
              </a>
            </div>

            {/* Contact info */}
            <div className="space-y-2 text-sm text-white/60 pt-2">
              <a href={`mailto:${brand.email}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                <Mail size={14} /> {brand.email}
              </a>
              <a href={`tel:${brand.phone}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                <Phone size={14} /> {brand.phone}
              </a>
              <p className="flex items-center gap-2">
                <MapPin size={14} /> {brand.address}
              </p>
            </div>
          </div>

          {/* Nav columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading} className="space-y-3">
              <h3 className="font-heading font-semibold text-white text-sm uppercase tracking-wider">
                {heading}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-white/60 text-sm hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
            <p>© 2026 Sri Yarn &amp; Tales. All rights reserved.</p>
            <div className="flex items-center gap-1">
              Made with <Heart size={12} className="text-primary mx-1" fill="currentColor" /> in India
            </div>
            <div className="flex items-center gap-2">
              <span>We accept:</span>
              <span className="flex gap-1">
                {["UPI", "Visa", "MC", "RuPay", "COD"].map((p) => (
                  <span key={p} className="bg-white/10 px-1.5 py-0.5 rounded text-xs font-medium">
                    {p}
                  </span>
                ))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

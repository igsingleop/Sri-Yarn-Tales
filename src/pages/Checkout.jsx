import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Check, ChevronRight, Loader2, CreditCard,
  Smartphone, Building2, Wallet, Package
} from "lucide-react";
import { useCartStore } from "../store";
import { formatINR } from "../lib/utils";
import { createOrder } from "../lib/api";

const steps = ["Contact", "Shipping", "Payment", "Review"];

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
});

const shippingSchema = z.object({
  address: z.string().min(10, "Please enter your full address"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit PIN code"),
  landmark: z.string().optional(),
});

const indianStates = [
  "Andhra Pradesh", "Assam", "Bihar", "Delhi", "Goa", "Gujarat", "Haryana",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Odisha", "Punjab",
  "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh", "West Bengal",
  "Other",
];

function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center mb-10 max-w-lg mx-auto">
      {steps.map((step, i) => (
        <React.Fragment key={step}>
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all duration-200 ${
                i < current
                  ? "bg-black border-black text-white dark:bg-white dark:border-white dark:text-black"
                  : i === current
                  ? "border-black dark:border-white text-black dark:text-white"
                  : "border-zinc-300 dark:border-zinc-700 text-zinc-400"
              }`}
            >
              {i < current ? <Check size={14} /> : i + 1}
            </div>
            <p className={`text-[10px] mt-1 font-bold uppercase tracking-wider ${
              i === current ? "text-zinc-950 dark:text-white" : "text-zinc-400"
            }`}>
              {step}
            </p>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-px mx-2 mb-4 transition-all duration-300 ${
              i < current ? "bg-black dark:bg-white" : "bg-zinc-200 dark:bg-zinc-800"
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function FormError({ message }) {
  if (!message) return null;
  return <p className="text-xs text-red-500 mt-1 font-semibold" role="alert">{message}</p>;
}

export default function Checkout() {
  const [step, setStep] = useState(0);
  const [contact, setContact] = useState({});
  const [shipping, setShipping] = useState({});
  const [paymentMethod, setPaymentMethod] = useState("razorpay-upi");
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const { items, subtotal, shippingCost, total, discount, coupon, clearCart } = useCartStore();
  const navigate = useNavigate();

  const contactForm = useForm({ resolver: zodResolver(contactSchema) });
  const shippingForm = useForm({ resolver: zodResolver(shippingSchema) });

  const handleContactSubmit = (data) => {
    setContact(data);
    setStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleShippingSubmit = (data) => {
    setShipping(data);
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    const order = await createOrder({
      contact,
      shipping,
      paymentMethod,
      items: items.map((i) => ({ id: i.product.id, name: i.product.name, qty: i.qty, price: i.product.price, variant: i.variant })),
      totals: { subtotal, discount, shipping: shippingCost, total },
      coupon: coupon?.label || null,
    });
    setOrderId(order.orderId);
    clearCart();
    setStep(3);
    setLoading(false);
  };

  // Order Confirmed Screen
  if (step === 3 && orderId) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors flex items-center justify-center px-4 py-16">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md w-full border border-zinc-200 dark:border-zinc-800 rounded-lg p-8 bg-zinc-50/50 dark:bg-zinc-950/50 space-y-4"
        >
          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <Check size={32} />
          </div>
          <h1 className="font-heading font-black text-2xl uppercase tracking-tight text-zinc-950 dark:text-white">
            Order Confirmed
          </h1>
          <p className="text-zinc-500 text-xs uppercase tracking-wider">
            Thank you, {contact.name}. Your handcrafted commission is officially queued in our atelier.
          </p>
          <div className="p-4 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-left space-y-1">
            <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">Order Reference</p>
            <p className="font-mono font-black text-sm text-zinc-950 dark:text-white">{orderId}</p>
            <p className="text-[11px] text-zinc-500 pt-1">Confirmation dispatch sent to {contact.email}</p>
          </div>
          <div className="space-y-2 pt-2">
            <button onClick={() => navigate("/shop")} className="btn-primary w-full">
              Continue Shopping
            </button>
            <button onClick={() => navigate("/account")} className="btn-secondary w-full">
              View Order Tracking
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Secure Checkout | Sri Yarn &amp; Tales</title>
      </Helmet>

      <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors py-10 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400 mb-1">
              Encrypted Checkout
            </p>
            <h1 className="font-heading font-black text-2xl sm:text-4xl uppercase tracking-tight text-zinc-950 dark:text-white">
              Complete Your Acquisition
            </h1>
          </div>

          <StepIndicator current={step} />

          <div className="grid lg:grid-cols-12 gap-8">
            {/* Form Steps (Left 8 cols) */}
            <div className="lg:col-span-8">
              <AnimatePresence mode="wait">
                {/* Step 0: Contact */}
                {step === 0 && (
                  <motion.div key="contact" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 bg-zinc-50/50 dark:bg-zinc-950/50">
                      <h2 className="font-heading font-black text-xs uppercase tracking-[0.2em] text-zinc-950 dark:text-white mb-6">
                        01 // Contact Information
                      </h2>
                      <form onSubmit={contactForm.handleSubmit(handleContactSubmit)} className="space-y-4" noValidate>
                        <div>
                          <label className="label" htmlFor="co-name">Full Name *</label>
                          <input id="co-name" {...contactForm.register("name")} className="input" placeholder="Priya Sharma" />
                          <FormError message={contactForm.formState.errors.name?.message} />
                        </div>
                        <div>
                          <label className="label" htmlFor="co-email">Email Address *</label>
                          <input id="co-email" type="email" {...contactForm.register("email")} className="input" placeholder="priya@domain.com" />
                          <FormError message={contactForm.formState.errors.email?.message} />
                        </div>
                        <div>
                          <label className="label" htmlFor="co-phone">Mobile Contact *</label>
                          <input id="co-phone" type="tel" maxLength={10} {...contactForm.register("phone")} className="input" placeholder="9876543210" />
                          <FormError message={contactForm.formState.errors.phone?.message} />
                        </div>
                        <button type="submit" className="btn-primary w-full btn-lg mt-2">
                          Continue to Delivery Address <ChevronRight size={14} />
                        </button>
                      </form>
                    </div>
                  </motion.div>
                )}

                {/* Step 1: Shipping */}
                {step === 1 && (
                  <motion.div key="shipping" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 bg-zinc-50/50 dark:bg-zinc-950/50">
                      <h2 className="font-heading font-black text-xs uppercase tracking-[0.2em] text-zinc-950 dark:text-white mb-6">
                        02 // Delivery Destination
                      </h2>
                      <form onSubmit={shippingForm.handleSubmit(handleShippingSubmit)} className="space-y-4" noValidate>
                        <div>
                          <label className="label" htmlFor="sh-address">Street Address *</label>
                          <textarea id="sh-address" {...shippingForm.register("address")} rows={3} className="input resize-none" placeholder="Flat, building, road, area..." />
                          <FormError message={shippingForm.formState.errors.address?.message} />
                        </div>
                        <div>
                          <label className="label" htmlFor="sh-landmark">Landmark</label>
                          <input id="sh-landmark" {...shippingForm.register("landmark")} className="input" placeholder="Nearby landmark" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="label" htmlFor="sh-city">City *</label>
                            <input id="sh-city" {...shippingForm.register("city")} className="input" placeholder="Bangalore" />
                            <FormError message={shippingForm.formState.errors.city?.message} />
                          </div>
                          <div>
                            <label className="label" htmlFor="sh-pin">Postal PIN Code *</label>
                            <input id="sh-pin" type="tel" maxLength={6} {...shippingForm.register("pincode")} className="input font-mono" placeholder="560001" />
                            <FormError message={shippingForm.formState.errors.pincode?.message} />
                          </div>
                        </div>
                        <div>
                          <label className="label" htmlFor="sh-state">State / Province *</label>
                          <select id="sh-state" {...shippingForm.register("state")} className="input">
                            <option value="">Select State</option>
                            {indianStates.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                          <FormError message={shippingForm.formState.errors.state?.message} />
                        </div>
                        <div className="flex gap-3 pt-2">
                          <button type="button" onClick={() => setStep(0)} className="btn-secondary flex-1">Back</button>
                          <button type="submit" className="btn-primary flex-1 btn-lg">
                            Proceed to Payment <ChevronRight size={14} />
                          </button>
                        </div>
                      </form>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Payment */}
                {step === 2 && (
                  <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 bg-zinc-50/50 dark:bg-zinc-950/50 space-y-4">
                      <h2 className="font-heading font-black text-xs uppercase tracking-[0.2em] text-zinc-950 dark:text-white mb-6">
                        03 // Payment Settlement
                      </h2>
                      <div className="space-y-2.5">
                        {[
                          { id: "razorpay-upi", icon: Smartphone, label: "Instant UPI (Google Pay, PhonePe, BHIM)", sub: "Instant bank authorization" },
                          { id: "razorpay-card", icon: CreditCard, label: "Credit or Debit Card", sub: "Visa, Mastercard, RuPay" },
                          { id: "razorpay-netbanking", icon: Building2, label: "Net Banking", sub: "All verified Indian financial institutions" },
                          { id: "cod", icon: Package, label: "Cash on Delivery", sub: "Pay upon physical delivery" },
                        ].map(({ id, icon: Icon, label, sub }) => (
                          <button
                            key={id}
                            onClick={() => setPaymentMethod(id)}
                            className={`w-full flex items-center gap-3.5 p-3.5 rounded border transition-all text-left ${
                              paymentMethod === id
                                ? "border-black dark:border-white bg-white dark:bg-zinc-900"
                                : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-400"
                            }`}
                          >
                            <div className={`w-8 h-8 rounded flex items-center justify-center ${
                              paymentMethod === id ? "bg-black text-white dark:bg-white dark:text-black" : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                            }`}>
                              <Icon size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-heading font-bold text-xs uppercase tracking-wider text-zinc-950 dark:text-white">{label}</p>
                              <p className="text-[11px] text-zinc-400">{sub}</p>
                            </div>
                            {paymentMethod === id && (
                              <Check size={16} className="text-black dark:text-white" />
                            )}
                          </button>
                        ))}
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button onClick={() => setStep(1)} className="btn-secondary flex-1">Back</button>
                        <button onClick={() => setStep(2.5)} className="btn-primary flex-1 btn-lg">
                          Review Acquisition <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 2.5: Review Order */}
                {step === 2.5 && (
                  <motion.div key="review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 bg-zinc-50/50 dark:bg-zinc-950/50 space-y-4">
                      <h2 className="font-heading font-black text-xs uppercase tracking-[0.2em] text-zinc-950 dark:text-white">
                        04 // Acquisition Review
                      </h2>

                      <div className="border border-zinc-200 dark:border-zinc-800 rounded p-4 bg-white dark:bg-zinc-900 text-xs space-y-1">
                        <p className="font-bold uppercase tracking-wider text-zinc-400">Recipient</p>
                        <p className="font-bold text-zinc-950 dark:text-white">{contact.name} ({contact.phone})</p>
                        <p className="text-zinc-500">{contact.email}</p>
                      </div>

                      <div className="border border-zinc-200 dark:border-zinc-800 rounded p-4 bg-white dark:bg-zinc-900 text-xs space-y-1">
                        <p className="font-bold uppercase tracking-wider text-zinc-400">Delivery Address</p>
                        <p className="text-zinc-950 dark:text-white font-medium">{shipping.address}, {shipping.city}, {shipping.state} — {shipping.pincode}</p>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button onClick={() => setStep(2)} className="btn-secondary flex-1">Back</button>
                        <button
                          onClick={handlePlaceOrder}
                          disabled={loading}
                          className="btn-primary flex-1 btn-lg"
                        >
                          {loading ? <><Loader2 size={16} className="animate-spin" /> Transmitting...</> : "Authorize & Place Order"}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sidebar Summary (Right 4 cols) */}
            <div className="lg:col-span-4">
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 bg-zinc-50 dark:bg-zinc-950 sticky top-24 space-y-4">
                <h3 className="font-heading font-black text-xs uppercase tracking-[0.2em] text-zinc-950 dark:text-white pb-3 border-b border-zinc-200 dark:border-zinc-800">
                  Cart Contents
                </h3>

                <div className="space-y-2.5 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.key} className="flex gap-3 text-xs">
                      <img src={item.product.images[0]} alt="" className="w-12 h-12 rounded object-cover border border-zinc-200 dark:border-zinc-800" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-zinc-950 dark:text-white truncate">{item.product.name}</p>
                        <p className="text-zinc-400">Qty: {item.qty}</p>
                      </div>
                      <span className="font-mono font-bold">{formatINR(item.product.price * item.qty)}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-1.5 text-xs font-semibold uppercase tracking-wider border-t border-zinc-200 dark:border-zinc-800 pt-3">
                  <div className="flex justify-between text-zinc-500"><span>Subtotal</span><span className="font-mono text-zinc-950 dark:text-white">{formatINR(subtotal)}</span></div>
                  {discount > 0 && <div className="flex justify-between text-emerald-600"><span>Discount</span><span className="font-mono">−{formatINR(discount)}</span></div>}
                  <div className="flex justify-between text-zinc-500"><span>Shipping</span><span className="font-mono text-zinc-950 dark:text-white">{shippingCost === 0 ? "FREE" : formatINR(shippingCost)}</span></div>
                  <div className="flex justify-between font-black text-sm border-t border-zinc-200 dark:border-zinc-800 pt-2 text-zinc-950 dark:text-white">
                    <span>Total</span><span className="font-mono">{formatINR(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

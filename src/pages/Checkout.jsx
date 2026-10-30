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
    <div className="flex items-center justify-center mb-10">
      {steps.map((step, i) => (
        <React.Fragment key={step}>
          <div className="flex flex-col items-center">
            <motion.div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
                i < current
                  ? "bg-primary border-primary text-white"
                  : i === current
                  ? "bg-white border-primary text-primary"
                  : "bg-white border-border text-warmgray"
              }`}
            >
              {i < current ? <Check size={16} /> : i + 1}
            </motion.div>
            <p className={`text-xs mt-1 font-medium ${i === current ? "text-primary" : "text-warmgray"}`}>
              {step}
            </p>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-2 mb-5 rounded-full transition-all duration-500 ${
              i < current ? "bg-primary" : "bg-border"
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function FormError({ message }) {
  if (!message) return null;
  return <p className="text-xs text-error mt-1" role="alert">{message}</p>;
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

  // Confirmation screen
  if (step === 3 && orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md"
        >
          <motion.div
            className="w-24 h-24 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-6"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.6 }}
          >
            <Check size={48} className="text-primary" />
          </motion.div>
          <h1 className="font-heading font-bold text-3xl text-cocoa mb-3">Order Placed! 🎉</h1>
          <p className="text-warmgray mb-4">
            Thank you, <strong>{contact.name}</strong>! Your handmade treasures are on their way.
          </p>
          <div className="bg-oatmeal rounded-2xl p-4 mb-6 text-sm">
            <p className="text-warmgray">Order ID</p>
            <p className="font-bold text-cocoa text-lg font-mono">{orderId}</p>
            <p className="text-warmgray mt-2">Confirmation sent to {contact.email}</p>
          </div>
          <div className="space-y-3">
            <button onClick={() => navigate("/shop")} className="btn-primary w-full">
              Continue Shopping
            </button>
            <button onClick={() => navigate("/account")} className="btn-secondary w-full">
              View My Orders
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Checkout | Sri Yarn &amp; Tales</title>
      </Helmet>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="section-title text-center mb-8">Checkout</h1>
        <StepIndicator current={step} />

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Steps */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* Step 0: Contact */}
              {step === 0 && (
                <motion.div key="contact" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                  <div className="bg-white rounded-3xl p-6 shadow-card">
                    <h2 className="font-heading font-bold text-xl text-cocoa mb-6">Contact Information</h2>
                    <form onSubmit={contactForm.handleSubmit(handleContactSubmit)} className="space-y-4" noValidate>
                      <div>
                        <label className="label" htmlFor="co-name">Full Name <span className="text-error">*</span></label>
                        <input id="co-name" {...contactForm.register("name")} className="input" placeholder="Priya Sharma" />
                        <FormError message={contactForm.formState.errors.name?.message} />
                      </div>
                      <div>
                        <label className="label" htmlFor="co-email">Email Address <span className="text-error">*</span></label>
                        <input id="co-email" type="email" {...contactForm.register("email")} className="input" placeholder="priya@example.com" />
                        <FormError message={contactForm.formState.errors.email?.message} />
                      </div>
                      <div>
                        <label className="label" htmlFor="co-phone">Mobile Number <span className="text-error">*</span></label>
                        <div className="flex gap-2">
                          <span className="input flex-shrink-0 w-16 text-center font-semibold bg-oatmeal">+91</span>
                          <input id="co-phone" type="tel" maxLength={10} {...contactForm.register("phone")} className="input flex-1" placeholder="98765 43210" />
                        </div>
                        <FormError message={contactForm.formState.errors.phone?.message} />
                      </div>
                      <button type="submit" className="btn-primary w-full btn-lg mt-2">
                        Continue to Shipping <ChevronRight size={18} />
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}

              {/* Step 1: Shipping */}
              {step === 1 && (
                <motion.div key="shipping" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                  <div className="bg-white rounded-3xl p-6 shadow-card">
                    <h2 className="font-heading font-bold text-xl text-cocoa mb-6">Shipping Address</h2>
                    <form onSubmit={shippingForm.handleSubmit(handleShippingSubmit)} className="space-y-4" noValidate>
                      <div>
                        <label className="label" htmlFor="sh-address">Street Address <span className="text-error">*</span></label>
                        <textarea id="sh-address" {...shippingForm.register("address")} rows={3} className="input resize-none" placeholder="Flat no, building, street, area..." />
                        <FormError message={shippingForm.formState.errors.address?.message} />
                      </div>
                      <div>
                        <label className="label" htmlFor="sh-landmark">Landmark (optional)</label>
                        <input id="sh-landmark" {...shippingForm.register("landmark")} className="input" placeholder="Near temple, opposite park..." />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="label" htmlFor="sh-city">City <span className="text-error">*</span></label>
                          <input id="sh-city" {...shippingForm.register("city")} className="input" placeholder="Bangalore" />
                          <FormError message={shippingForm.formState.errors.city?.message} />
                        </div>
                        <div>
                          <label className="label" htmlFor="sh-pin">PIN Code <span className="text-error">*</span></label>
                          <input id="sh-pin" type="tel" maxLength={6} {...shippingForm.register("pincode")} className="input" placeholder="560001" />
                          <FormError message={shippingForm.formState.errors.pincode?.message} />
                        </div>
                      </div>
                      <div>
                        <label className="label" htmlFor="sh-state">State <span className="text-error">*</span></label>
                        <select id="sh-state" {...shippingForm.register("state")} className="input">
                          <option value="">Select state</option>
                          {indianStates.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <FormError message={shippingForm.formState.errors.state?.message} />
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setStep(0)} className="btn-ghost flex-1">← Back</button>
                        <button type="submit" className="btn-primary flex-1 btn-lg">
                          Continue to Payment <ChevronRight size={18} />
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Payment */}
              {step === 2 && (
                <motion.div key="payment" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                  <div className="bg-white rounded-3xl p-6 shadow-card">
                    <h2 className="font-heading font-bold text-xl text-cocoa mb-6">Select Payment Method</h2>
                    <div className="space-y-3">
                      {[
                        { id: "razorpay-upi", icon: Smartphone, label: "UPI (Google Pay, PhonePe, BHIM)", sub: "Instant & secure" },
                        { id: "razorpay-card", icon: CreditCard, label: "Credit / Debit Card", sub: "Visa, Mastercard, RuPay" },
                        { id: "razorpay-netbanking", icon: Building2, label: "Net Banking", sub: "All major Indian banks" },
                        { id: "razorpay-wallet", icon: Wallet, label: "Wallets", sub: "Paytm, Mobikwik, Freecharge" },
                        { id: "cod", icon: Package, label: "Cash on Delivery", sub: "Pay when your order arrives" },
                      ].map(({ id, icon: Icon, label, sub }) => (
                        <button
                          key={id}
                          onClick={() => setPaymentMethod(id)}
                          className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                            paymentMethod === id
                              ? "border-primary bg-primary-light"
                              : "border-border hover:border-primary/40"
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${paymentMethod === id ? "bg-primary text-white" : "bg-oatmeal text-warmgray"}`}>
                            <Icon size={20} />
                          </div>
                          <div>
                            <p className={`font-semibold text-sm ${paymentMethod === id ? "text-primary" : "text-cocoa"}`}>{label}</p>
                            <p className="text-xs text-warmgray">{sub}</p>
                          </div>
                          {paymentMethod === id && (
                            <motion.div className="ml-auto" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                              <Check size={18} className="text-primary" />
                            </motion.div>
                          )}
                        </button>
                      ))}
                    </div>

                    {paymentMethod !== "cod" && (
                      <div className="mt-4 p-3 bg-butter/20 rounded-xl text-xs text-warmgray">
                        🔒 This is a test integration. No real payment will be charged. 
                        Use any test card details (4111 1111 1111 1111, any future date, any CVV).
                      </div>
                    )}

                    <div className="flex gap-3 mt-6">
                      <button onClick={() => setStep(1)} className="btn-ghost flex-1">← Back</button>
                      <button onClick={() => setStep(2.5)} className="btn-primary flex-1 btn-lg">
                        Review Order <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2.5: Review */}
              {step === 2.5 && (
                <motion.div key="review" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                  <div className="bg-white rounded-3xl p-6 shadow-card space-y-5">
                    <h2 className="font-heading font-bold text-xl text-cocoa">Review Your Order</h2>

                    {/* Contact */}
                    <div className="p-4 bg-oatmeal rounded-2xl text-sm space-y-1">
                      <p className="font-semibold text-cocoa">📋 Contact</p>
                      <p className="text-warmgray">{contact.name} · {contact.email} · +91 {contact.phone}</p>
                    </div>

                    {/* Shipping */}
                    <div className="p-4 bg-oatmeal rounded-2xl text-sm space-y-1">
                      <p className="font-semibold text-cocoa">📦 Delivery Address</p>
                      <p className="text-warmgray">{shipping.address}, {shipping.city}, {shipping.state} — {shipping.pincode}</p>
                      {shipping.landmark && <p className="text-warmgray">Near: {shipping.landmark}</p>}
                    </div>

                    {/* Payment */}
                    <div className="p-4 bg-oatmeal rounded-2xl text-sm">
                      <p className="font-semibold text-cocoa">💳 Payment</p>
                      <p className="text-warmgray capitalize">{paymentMethod.replace("-", " ")}</p>
                    </div>

                    {/* Items */}
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.key} className="flex items-center gap-3 text-sm">
                          <img src={item.product.images[0]} alt={item.product.name} className="w-12 h-12 rounded-xl object-cover" />
                          <div className="flex-1">
                            <p className="font-medium text-cocoa">{item.product.name}</p>
                            <p className="text-warmgray text-xs">Qty: {item.qty}</p>
                          </div>
                          <p className="font-bold text-primary">{formatINR(item.product.price * item.qty)}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <button onClick={() => setStep(2)} className="btn-ghost flex-1">← Back</button>
                      <button
                        onClick={handlePlaceOrder}
                        disabled={loading}
                        className="btn-primary flex-1 btn-lg disabled:opacity-50"
                      >
                        {loading ? <><Loader2 size={18} className="animate-spin" /> Placing...</> : "Place Order"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary sidebar */}
          <div>
            <div className="bg-white rounded-3xl p-5 shadow-card sticky top-24">
              <h3 className="font-heading font-bold text-cocoa mb-4">Order Summary</h3>
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.key} className="flex gap-2 text-sm">
                    <img src={item.product.images[0]} alt={item.product.name} className="w-12 h-12 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-cocoa line-clamp-1">{item.product.name}</p>
                      <p className="text-warmgray text-xs">× {item.qty}</p>
                    </div>
                    <p className="font-semibold text-primary text-sm">{formatINR(item.product.price * item.qty)}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2 text-sm border-t border-border pt-3">
                <div className="flex justify-between text-warmgray"><span>Subtotal</span><span className="font-semibold text-cocoa">{formatINR(subtotal)}</span></div>
                {discount > 0 && <div className="flex justify-between text-sage-dark"><span>Discount</span><span>−{formatINR(discount)}</span></div>}
                <div className="flex justify-between text-warmgray"><span>Shipping</span><span className={shippingCost === 0 ? "text-sage-dark font-semibold" : "font-semibold text-cocoa"}>{shippingCost === 0 ? "FREE" : formatINR(shippingCost)}</span></div>
                <div className="flex justify-between font-bold text-base border-t border-border pt-2 text-cocoa">
                  <span>Total</span><span className="text-primary">{formatINR(total)}</span>
                </div>
              </div>
              <p className="text-xs text-warmgray mt-3 text-center">🔒 Secure checkout powered by Razorpay</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

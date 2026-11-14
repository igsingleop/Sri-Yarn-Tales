import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, MapPin, Heart, LogOut, Settings, ChevronRight,
  ArrowRight, Info, CheckCircle2
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { formatINR } from "../lib/utils";
import { useAuthStore } from "../store";
import { signInWithGoogle, isFirebaseConfigured } from "../config/firebase";

const MOCK_ORDERS = [
  { id: "SYT-M3X9-P2KF", date: "2026-10-10", status: "Delivered", total: 1298, items: 2 },
  { id: "SYT-L7Y4-Q8RN", date: "2026-09-28", status: "Shipped", total: 649, items: 1 },
  { id: "SYT-K2W1-T5HM", date: "2026-09-15", status: "Delivered", total: 2197, items: 3 },
];

const statusColor = {
  Delivered: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800",
  Shipped: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800",
  Processing: "bg-zinc-100 text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700",
  Cancelled: "bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-800",
};

function GoogleIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export default function Account() {
  const navigate = useNavigate();

  const { user, login, loginWithGoogleUser, logout } = useAuthStore();
  const [isLogin, setIsLogin] = useState(true);
  const [activeTab, setActiveTab] = useState("orders");
  
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showFirebaseModal, setShowFirebaseModal] = useState(false);

  const handleLoginSubmit = (e) => {
    e?.preventDefault();
    setError("");

    if (!identifier.trim()) {
      setError("Please enter a username or email");
      return;
    }

    const res = login(identifier.trim(), password);

    if (!res.success) {
      setError(res.error || "Login failed. Please verify your credentials.");
      return;
    }

    if (res.role === "admin") {
      navigate("/admin");
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");

    if (!isFirebaseConfigured) {
      setShowFirebaseModal(true);
      return;
    }

    setGoogleLoading(true);
    try {
      const res = await signInWithGoogle();
      if (res.success && res.user) {
        const authRes = loginWithGoogleUser(res.user);
        if (authRes.role === "admin") {
          navigate("/admin");
        }
      } else if (res.error) {
        setError(res.error);
      }
    } catch (err) {
      setError("Google authentication was canceled or failed.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleDemoGoogleLogin = (isAdmin = false) => {
    const mockUser = {
      uid: isAdmin ? "admin-demo-id" : "google-demo-uid-999",
      displayName: isAdmin ? "Admin Manager" : "Priya Sharma",
      email: isAdmin ? "admin@sriyarnandtales.com" : "priya.sharma@example.com",
      photoURL: isAdmin
        ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces"
        : "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces",
      emailVerified: true,
    };
    loginWithGoogleUser(mockUser);
    setShowFirebaseModal(false);
    if (isAdmin) {
      navigate("/admin");
    }
  };

  // Not Logged In View
  if (!user) {
    return (
      <>
        <Helmet>
          <title>{isLogin ? "Sign In | Sri Yarn & Tales" : "Create Account | Sri Yarn & Tales"}</title>
        </Helmet>

        <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors py-12 sm:py-20 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 sm:p-8 bg-zinc-50/50 dark:bg-zinc-950/50"
          >
            <div className="text-center mb-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400 mb-1">
                Atelier Access
              </p>
              <h1 className="font-heading font-black text-2xl uppercase tracking-tight text-zinc-950 dark:text-white">
                {isLogin ? "Sign In" : "Register"}
              </h1>
              <p className="text-xs text-zinc-500 mt-1">
                {isLogin ? "Access your saved pieces and tracked shipments" : "Join our community of handcrafted collectors"}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded border border-red-500/30 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs font-semibold">
                {error}
              </div>
            )}

            {/* Google Authentication */}
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="w-full py-2.5 px-4 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
              >
                <GoogleIcon />
                {googleLoading ? "Connecting..." : "Continue with Google"}
              </button>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-zinc-200 dark:border-zinc-800 w-full" />
                <span className="bg-zinc-50 dark:bg-zinc-950 px-3 text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                  or credentials
                </span>
                <div className="border-t border-zinc-200 dark:border-zinc-800 w-full" />
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                {!isLogin && (
                  <div>
                    <label className="label" htmlFor="acc-name">Full Name</label>
                    <input
                      id="acc-name"
                      type="text"
                      className="input"
                      placeholder="e.g. Deepak Kumar"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                )}

                <div>
                  <label className="label" htmlFor="acc-email">
                    Username or Email
                  </label>
                  <input
                    id="acc-email"
                    type="text"
                    className="input"
                    placeholder="Enter username or email"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                  />
                </div>

                <div>
                  <label className="label" htmlFor="acc-pass">Password</label>
                  <input
                    id="acc-pass"
                    type="password"
                    className="input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn-primary w-full btn-lg mt-2">
                  {isLogin ? "Sign In & Proceed" : "Create Account"}
                  <ArrowRight size={14} />
                </button>
              </form>

              <p className="text-center text-xs text-zinc-500 pt-2">
                {isLogin ? "New to the atelier? " : "Already registered? "}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="font-bold text-black dark:text-white uppercase tracking-wider underline ml-1"
                >
                  {isLogin ? "Sign Up" : "Log In"}
                </button>
              </p>
            </div>
          </motion.div>
        </div>

        {/* Firebase modal if needed */}
        <AnimatePresence>
          {showFirebaseModal && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 rounded-lg max-w-md w-full p-6 border border-zinc-200 dark:border-zinc-800 space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                  <h3 className="font-heading font-black text-sm uppercase tracking-wider">
                    Google Authentication
                  </h3>
                  <button onClick={() => setShowFirebaseModal(false)} className="text-zinc-400 hover:text-black dark:hover:text-white">
                    ✕
                  </button>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  To authenticate with your live Google credentials, configure Firebase in your environment or continue with a simulated verified account:
                </p>
                <button
                  onClick={() => handleDemoGoogleLogin(false)}
                  className="btn-primary w-full text-xs"
                >
                  <GoogleIcon /> Continue as Verified Collector
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Logged-in View
  return (
    <>
      <Helmet>
        <title>Collector Account | Sri Yarn &amp; Tales</title>
      </Helmet>

      <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Sidebar Profile & Nav (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              {/* Profile Card */}
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 bg-zinc-50/50 dark:bg-zinc-950/50 text-center">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-16 h-16 rounded-full object-cover mx-auto border-2 border-zinc-300 dark:border-zinc-700 mb-3"
                />
                <h2 className="font-heading font-black text-base uppercase tracking-tight text-zinc-950 dark:text-white">
                  {user.name}
                </h2>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">{user.email}</p>
                {user.provider === "google" && (
                  <div className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded mt-2">
                    <CheckCircle2 size={10} /> Google Verified
                  </div>
                )}
              </div>

              {/* Account Navigation Tabs */}
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 bg-zinc-50/50 dark:bg-zinc-950/50 space-y-1">
                {[
                  { id: "orders", icon: Package, label: "My Orders" },
                  { id: "addresses", icon: MapPin, label: "Delivery Addresses" },
                  { id: "wishlist", icon: Heart, label: "Saved Wishlist" },
                  { id: "profile", icon: Settings, label: "Profile Settings" },
                ].map(({ id, icon: Icon, label }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex items-center gap-3 w-full px-3.5 py-2.5 rounded text-xs font-bold uppercase tracking-wider transition-all ${
                      activeTab === id
                        ? "bg-black text-white dark:bg-white dark:text-black"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                    }`}
                  >
                    <Icon size={14} /> {label}
                    {activeTab === id && <ChevronRight size={12} className="ml-auto" />}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => logout()}
                  className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded text-xs font-bold uppercase tracking-wider text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all cursor-pointer"
                >
                  <LogOut size={14} /> Log Out
                </button>
              </div>
            </div>

            {/* Main Details Section (8 cols) */}
            <div className="lg:col-span-8">
              {activeTab === "orders" && (
                <div className="space-y-4">
                  <h2 className="font-heading font-black text-xl uppercase tracking-tight text-zinc-950 dark:text-white mb-4">
                    Order History
                  </h2>
                  <div className="space-y-3">
                    {MOCK_ORDERS.map((order) => (
                      <div
                        key={order.id}
                        className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 bg-zinc-50/50 dark:bg-zinc-950/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div>
                          <p className="font-mono font-bold text-xs uppercase tracking-wider text-zinc-950 dark:text-white">
                            {order.id}
                          </p>
                          <p className="text-xs text-zinc-400 mt-0.5">
                            {new Date(order.date).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })} · {order.items} Item{order.items > 1 ? "s" : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`badge ${statusColor[order.status]}`}>
                            {order.status}
                          </span>
                          <span className="font-mono font-black text-sm text-zinc-950 dark:text-white">
                            {formatINR(order.total)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "addresses" && (
                <div>
                  <h2 className="font-heading font-black text-xl uppercase tracking-tight text-zinc-950 dark:text-white mb-4">
                    Saved Addresses
                  </h2>
                  <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 bg-zinc-50/50 dark:bg-zinc-950/50">
                    <span className="badge bg-black text-white dark:bg-white dark:text-black mb-3">Default</span>
                    <p className="font-bold text-sm text-zinc-950 dark:text-white">{user.name}</p>
                    <p className="text-xs text-zinc-400 mt-1">42, 3rd Cross, Jayanagar 4th Block</p>
                    <p className="text-xs text-zinc-400">Bangalore, Karnataka — 560011</p>
                  </div>
                </div>
              )}

              {activeTab === "wishlist" && (
                <div>
                  <h2 className="font-heading font-black text-xl uppercase tracking-tight text-zinc-950 dark:text-white mb-4">
                    Saved Wishlist
                  </h2>
                  <Link to="/wishlist" className="btn-primary">
                    View Complete Wishlist →
                  </Link>
                </div>
              )}

              {activeTab === "profile" && (
                <div>
                  <h2 className="font-heading font-black text-xl uppercase tracking-tight text-zinc-950 dark:text-white mb-4">
                    Profile Configuration
                  </h2>
                  <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 bg-zinc-50/50 dark:bg-zinc-950/50 space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label">Full Name</label>
                        <input className="input" defaultValue={user.name} />
                      </div>
                      <div>
                        <label className="label">Username</label>
                        <input className="input" defaultValue={user.username || "collector"} readOnly />
                      </div>
                    </div>
                    <div>
                      <label className="label">Email Address</label>
                      <input className="input" defaultValue={user.email} type="email" />
                    </div>
                    <button className="btn-primary mt-2">
                      Save Changes
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

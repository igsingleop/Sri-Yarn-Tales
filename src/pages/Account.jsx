import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, MapPin, Heart, LogOut, Settings, ChevronRight,
  ArrowRight, Sparkles, AlertCircle, Info,
  CheckCircle2
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
  Delivered: "bg-sage/20 text-sage-dark",
  Shipped: "bg-butter/30 text-cocoa",
  Processing: "bg-primary-light text-primary",
  Cancelled: "bg-red-100 text-error",
};

// Official Google "G" Icon SVG
function GoogleIcon({ className = "w-5 h-5" }) {
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

    // If user entered admin or is an admin account, redirect immediately to /admin
    if (res.role === "admin") {
      navigate("/admin");
    }
  };

  // Google Sign-In Handler
  const handleGoogleSignIn = async () => {
    setError("");

    // If Firebase keys are not in .env, show the setup modal with instructions & demo preview
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
        if (res.error.includes("auth/configuration-not-found")) {
          setError(
            "Action Needed in Firebase Console: Google Sign-in is not yet enabled. In your Firebase Console, click 'Authentication' > 'Sign-in method' > click 'Google' and toggle 'Enable', then save."
          );
        } else if (res.error.includes("auth/popup-closed-by-user")) {
          setError("Google sign-in popup was closed before completing.");
        } else if (res.error.includes("auth/unauthorized-domain")) {
          setError(
            "Unauthorized domain: Please ensure 'localhost' is added under Firebase Console > Authentication > Settings > Authorized domains."
          );
        } else {
          setError(res.error);
        }
      }
    } catch (err) {
      const msg = err?.message || "";
      if (msg.includes("auth/configuration-not-found")) {
        setError(
          "Action Needed in Firebase Console: Google Sign-in is not yet enabled. In your Firebase Console, click 'Authentication' > 'Sign-in method' > click 'Google' and toggle 'Enable', then save."
        );
      } else {
        setError(msg || "Google sign-in failed. Please check your network or Firebase configuration.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  // Simulated Google Login (for immediate test before pasting real Firebase keys)
  const handleDemoGoogleLogin = (asAdmin = false) => {
    const demoGoogleUser = asAdmin
      ? {
          uid: "google-admin-12345",
          name: "Deepak (Admin)",
          email: "admin@sriyarn.com",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop",
        }
      : {
          uid: "google-user-67890",
          name: "Deepak Sundar",
          email: "deepak.crochet@gmail.com",
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop",
        };

    const authRes = loginWithGoogleUser(demoGoogleUser);
    setShowFirebaseModal(false);
    if (authRes.role === "admin") {
      navigate("/admin");
    }
  };

  if (!user) {
    return (
      <>
        <Helmet><title>Login & Account | Sri Yarn &amp; Tales</title></Helmet>
        <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-gradient-to-b from-cream via-oatmeal/40 to-cream">
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
            <div className="text-center mb-8">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-light text-primary mb-3">
                <Sparkles size={13} /> Sri Yarn & Tales Account Portal
              </span>
              <h1 className="font-heading font-bold text-3xl text-cocoa">
                {isLogin ? "Welcome Back!" : "Create Account"}
              </h1>
              <p className="text-warmgray mt-2 text-sm">
                {isLogin ? "Sign in with Google, customer or admin credentials" : "Join the Sri Yarn & Tales family"}
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-warm border border-border/40 space-y-5">
              {error && (
                <div className="p-3 rounded-2xl bg-red-50 text-error text-xs flex items-center gap-2">
                  <AlertCircle size={15} />
                  <span>{error}</span>
                </div>
              )}

              {/* Google Sign-In Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="w-full py-3.5 px-4 rounded-2xl border-2 border-border/80 hover:border-primary/50 bg-white hover:bg-cream/50 text-cocoa font-semibold text-sm flex items-center justify-center gap-3 transition-all shadow-xs hover:shadow-card cursor-pointer group"
              >
                {googleLoading ? (
                  <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <GoogleIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                )}
                <span>Continue with Google</span>
              </button>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-3">
                <div className="border-t border-border/70 w-full" />
                <span className="bg-white px-3 text-xs text-warmgray uppercase tracking-wider font-medium">
                  or with email
                </span>
                <div className="border-t border-border/70 w-full" />
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {!isLogin && (
                  <div>
                    <label className="label" htmlFor="acc-name">Full Name</label>
                    <input
                      id="acc-name"
                      type="text"
                      className="input"
                      placeholder="e.g. Priya Sharma"
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
                    placeholder="Enter your username or email"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    autoFocus
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

                <button type="submit" className="btn-primary w-full btn-lg justify-center shadow-rose-lg">
                  {isLogin ? "Sign In & Proceed" : "Create Account"}
                  <ArrowRight size={16} />
                </button>
              </form>

              <p className="text-center text-sm text-warmgray pt-1">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-primary font-semibold hover:underline"
                >
                  {isLogin ? "Sign up" : "Log in"}
                </button>
              </p>
            </div>
          </motion.div>
        </div>

        {/* FIREBASE CONFIGURATION INSTRUCTION MODAL */}
        <AnimatePresence>
          {showFirebaseModal && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 16 }}
                className="bg-white rounded-4xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-border/50 relative"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                      <GoogleIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-xl text-cocoa">
                        Firebase Google Auth Setup
                      </h3>
                      <p className="text-xs text-warmgray">
                        Firebase package &amp; handler are installed and ready!
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowFirebaseModal(false)}
                    className="w-8 h-8 rounded-full bg-oatmeal text-warmgray hover:text-cocoa flex items-center justify-center"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4 text-xs text-warmgray leading-relaxed">
                  <p>
                    To connect your live Google account, paste your Firebase project credentials into the <strong><code className="bg-oatmeal px-1.5 py-0.5 rounded text-cocoa font-mono">.env</code></strong> file in your project:
                  </p>

                  <div className="bg-cocoa text-white/90 p-4 rounded-2xl font-mono text-[11px] overflow-x-auto space-y-1">
                    <p className="text-butter font-bold"># Paste in .env:</p>
                    <p>VITE_FIREBASE_API_KEY=AIzaSy...</p>
                    <p>VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com</p>
                    <p>VITE_FIREBASE_PROJECT_ID=your-project-id</p>
                    <p>VITE_FIREBASE_STORAGE_BUCKET=...</p>
                    <p>VITE_FIREBASE_MESSAGING_SENDER_ID=...</p>
                    <p>VITE_FIREBASE_APP_ID=1:...</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-primary-light/50 border border-primary/20 text-cocoa space-y-1">
                    <p className="font-semibold flex items-center gap-1.5 text-primary">
                      <Info size={14} /> Firebase Console Steps:
                    </p>
                    <ol className="list-decimal list-inside space-y-0.5 pl-1 text-[11px] text-warmgray">
                      <li>Go to <strong>Authentication &gt; Sign-in method</strong></li>
                      <li>Enable <strong>Google</strong> provider</li>
                      <li>Add your authorized domain (e.g. <code>localhost</code>)</li>
                    </ol>
                  </div>

                  <div className="pt-2 border-t border-border/40 space-y-2">
                    <p className="text-xs font-bold text-cocoa">
                      Want to test Google login right now?
                    </p>
                    <button
                      type="button"
                      onClick={() => handleDemoGoogleLogin(false)}
                      className="w-full py-2.5 px-3 rounded-xl bg-primary text-white hover:bg-primary-dark font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                    >
                      <GoogleIcon className="w-4 h-4" /> Continue with Demo Account
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Logged-in view
  return (
    <>
      <Helmet><title>My Account | Sri Yarn &amp; Tales</title></Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="space-y-4">
            {/* Profile */}
            <div className="bg-white rounded-3xl p-5 shadow-card text-center border border-border/40">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-20 h-20 rounded-full object-cover mx-auto border-4 border-primary-light mb-3"
              />
              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                <h2 className="font-heading font-bold text-cocoa">{user.name}</h2>
              </div>
              <p className="text-warmgray text-sm">{user.email}</p>
              {user.provider === "google" && (
                <div className="inline-flex items-center gap-1 text-[11px] text-sage-dark font-medium bg-sage/15 px-2.5 py-0.5 rounded-full mt-2">
                  <CheckCircle2 size={12} /> Google Verified
                </div>
              )}
            </div>

            {/* Nav */}
            <div className="bg-white rounded-3xl p-3 shadow-card space-y-1 border border-border/40">
              {[
                { id: "orders", icon: Package, label: "My Orders" },
                { id: "addresses", icon: MapPin, label: "Addresses" },
                { id: "wishlist", icon: Heart, label: "Wishlist" },
                { id: "profile", icon: Settings, label: "Profile Settings" },
              ].map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                    activeTab === id ? "bg-primary-light text-primary font-semibold" : "text-warmgray hover:bg-oatmeal"
                  }`}
                >
                  <Icon size={18} /> {label}
                  {activeTab === id && <ChevronRight size={14} className="ml-auto" />}
                </button>
              ))}

              <button
                type="button"
                onClick={() => logout()}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-sm font-medium text-error hover:bg-red-50 transition-all cursor-pointer"
              >
                <LogOut size={18} /> Log Out
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {activeTab === "orders" && (
              <div>
                <h2 className="font-heading font-bold text-2xl text-cocoa mb-6">My Orders</h2>
                <div className="space-y-4">
                  {MOCK_ORDERS.map((order) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-3xl p-5 shadow-card border border-border/30"
                    >
                      <div className="flex items-start justify-between flex-wrap gap-3">
                        <div>
                          <p className="font-mono font-bold text-cocoa">{order.id}</p>
                          <p className="text-sm text-warmgray mt-0.5">
                            {new Date(order.date).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                            {" · "}{order.items} item{order.items > 1 ? "s" : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`badge ${statusColor[order.status]}`}>{order.status}</span>
                          <span className="font-bold text-primary">{formatINR(order.total)}</span>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button className="btn-secondary btn-sm">Track Order</button>
                        <button className="btn-ghost btn-sm text-warmgray">Reorder</button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "addresses" && (
              <div>
                <h2 className="font-heading font-bold text-2xl text-cocoa mb-6">Saved Addresses</h2>
                <div className="bg-white rounded-3xl p-6 shadow-card border border-border/30">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="badge-primary text-xs mb-2">Default</span>
                      <p className="font-semibold text-cocoa mt-1">{user.name}</p>
                      <p className="text-warmgray text-sm mt-1">42, 3rd Cross, Jayanagar 4th Block</p>
                      <p className="text-warmgray text-sm">Bangalore, Karnataka — 560011</p>
                    </div>
                    <button className="btn-ghost btn-sm text-warmgray">Edit</button>
                  </div>
                </div>
                <button className="btn-secondary mt-4">+ Add New Address</button>
              </div>
            )}

            {activeTab === "wishlist" && (
              <div>
                <h2 className="font-heading font-bold text-2xl text-cocoa mb-6">Wishlist</h2>
                <Link to="/wishlist" className="btn-primary">Go to Wishlist</Link>
              </div>
            )}

            {activeTab === "profile" && (
              <div>
                <h2 className="font-heading font-bold text-2xl text-cocoa mb-6">Profile Settings</h2>
                <div className="bg-white rounded-3xl p-6 shadow-card space-y-4 border border-border/30">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Full Name</label>
                      <input className="input" defaultValue={user.name} />
                    </div>
                    <div>
                      <label className="label">Username</label>
                      <input className="input" defaultValue={user.username || "user"} readOnly />
                    </div>
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input className="input" defaultValue={user.email} type="email" />
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <button className="btn-primary">Save Changes</button>
                    {user.provider === "google" && (
                      <span className="text-xs text-warmgray flex items-center gap-1">
                        <GoogleIcon className="w-3.5 h-3.5" /> Authenticated via Google
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

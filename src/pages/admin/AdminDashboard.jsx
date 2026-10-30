import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Package, Image as ImageIcon, Sliders, Plus, Trash2, Edit3,
  ExternalLink, LogOut, Check, ArrowLeft, Search, Star,
  Sparkles, RefreshCw, Eye, Tag, DollarSign, Layers,
  ChevronRight, AlertCircle, Upload, ShieldCheck
} from "lucide-react";
import { useProductStore, useBannerStore, useAuthStore } from "../../store";
import { formatINR } from "../../lib/utils";
import categoriesData from "../../data/categories.json";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { products, addProduct, updateProduct, deleteProduct, resetProducts } = useProductStore();
  const {
    topAnnouncement,
    heroBanner,
    promoBanner,
    updateTopAnnouncement,
    updateHeroBanner,
    updatePromoBanner,
    resetBanners,
  } = useBannerStore();

  const [activeTab, setActiveTab] = useState("products");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [toast, setToast] = useState(null);

  // Modal state for Add/Edit Product
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    category: "amigurumi",
    price: "",
    comparePrice: "",
    stock: "15",
    description: "",
    materials: "100% premium soft cotton yarn, hypoallergenic fiberfill",
    imageUrl: "",
    isBestseller: false,
    isNew: true,
    isCustomizable: true,
  });

  // Local Banner form state
  const [bannerForm, setBannerForm] = useState({
    topAnnouncement: { ...topAnnouncement },
    heroBanner: { ...heroBanner },
    promoBanner: { ...promoBanner },
  });

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  // Open Add Product
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      category: "amigurumi",
      price: "",
      comparePrice: "",
      stock: "15",
      description: "Handcrafted with premium yarn, made with love and precision.",
      materials: "100% premium soft cotton yarn, hypoallergenic fiberfill",
      imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop",
      isBestseller: false,
      isNew: true,
      isCustomizable: true,
    });
    setIsProductModalOpen(true);
  };

  // Open Edit Product
  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      category: p.category,
      price: p.price,
      comparePrice: p.comparePrice || "",
      stock: p.stock,
      description: p.description || "",
      materials: p.materials || "",
      imageUrl: p.images?.[0] || "",
      isBestseller: Boolean(p.isBestseller),
      isNew: Boolean(p.isNew),
      isCustomizable: Boolean(p.isCustomizable),
    });
    setIsProductModalOpen(true);
  };

  // Handle local image file upload -> convert to base64 data URL
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, imageUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit product
  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price) {
      alert("Please provide at least a Product Name and Price");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      category: formData.category,
      price: Number(formData.price),
      comparePrice: formData.comparePrice ? Number(formData.comparePrice) : null,
      stock: Number(formData.stock) || 1,
      description: formData.description,
      materials: formData.materials,
      images: [formData.imageUrl || "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop"],
      isBestseller: formData.isBestseller,
      isNew: formData.isNew,
      isCustomizable: formData.isCustomizable,
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, payload);
      showToast(`Updated product "${payload.name}"!`);
    } else {
      addProduct(payload);
      showToast(`Added new product "${payload.name}" to store!`);
    }

    setIsProductModalOpen(false);
  };

  // Delete product
  const handleDeleteProduct = (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteProduct(id);
      showToast(`Product "${name}" deleted.`);
    }
  };

  // Save Banner changes
  const handleSaveBanners = () => {
    updateTopAnnouncement(bannerForm.topAnnouncement);
    updateHeroBanner(bannerForm.heroBanner);
    updatePromoBanner(bannerForm.promoBanner);
    showToast("Banner settings saved! Changes are now live on the storefront.");
  };

  // Filtered products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === "all" || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleLogout = () => {
    logout();
    navigate("/account");
  };

  return (
    <>
      <Helmet>
        <title>Admin Dashboard — Sri Yarn &amp; Tales</title>
      </Helmet>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 right-6 z-50 bg-cocoa text-white px-5 py-3 rounded-2xl shadow-rose-lg flex items-center gap-3 border border-white/20"
          >
            <div className="w-6 h-6 rounded-full bg-sage flex items-center justify-center text-white">
              <Check size={14} />
            </div>
            <span className="text-sm font-medium">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-oatmeal/40 pb-20">
        {/* Top Admin Header Bar */}
        <header className="bg-white border-b border-border/60 sticky top-0 z-30 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 gap-4">
              {/* Brand & Badge */}
              <div className="flex items-center gap-3">
                <Link to="/" className="flex items-center gap-2 group">
                  <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm font-bold text-sm">
                    🧶
                  </div>
                  <span className="font-heading font-bold text-lg text-cocoa">
                    Sri Yarn &amp; Tales
                  </span>
                </Link>
                <span className="bg-primary-light text-primary text-xs font-bold px-2.5 py-1 rounded-full border border-primary/20 flex items-center gap-1">
                  <ShieldCheck size={13} /> Admin Console
                </span>
              </div>

              {/* Actions & User */}
              <div className="flex items-center gap-3">
                <Link
                  to="/"
                  className="btn-secondary btn-sm flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open storefront in new tab to see live changes"
                >
                  <Eye size={14} /> View Storefront <ExternalLink size={12} />
                </Link>

                <div className="h-6 w-px bg-border hidden sm:block" />

                <div className="flex items-center gap-2">
                  <img
                    src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop"}
                    alt="Admin"
                    className="w-8 h-8 rounded-full object-cover border border-primary-light"
                  />
                  <div className="hidden md:block text-left">
                    <p className="text-xs font-bold text-cocoa leading-tight">Admin Manager</p>
                    <p className="text-[10px] text-warmgray">Store Administrator</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 text-warmgray hover:text-error hover:bg-red-50 rounded-lg transition-colors ml-1"
                    title="Sign Out"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Admin Container */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-3xl p-5 border border-border/50 shadow-xs">
              <div className="flex items-center justify-between text-warmgray mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Products</span>
                <Package size={18} className="text-primary" />
              </div>
              <p className="font-heading font-bold text-3xl text-cocoa">{products.length}</p>
              <p className="text-[11px] text-sage font-medium mt-1">Live in store database</p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-border/50 shadow-xs">
              <div className="flex items-center justify-between text-warmgray mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Categories</span>
                <Layers size={18} className="text-butter-dark" />
              </div>
              <p className="font-heading font-bold text-3xl text-cocoa">{categoriesData.length}</p>
              <p className="text-[11px] text-warmgray mt-1">Product lines active</p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-border/50 shadow-xs">
              <div className="flex items-center justify-between text-warmgray mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Active Banners</span>
                <ImageIcon size={18} className="text-primary-dark" />
              </div>
              <p className="font-heading font-bold text-3xl text-cocoa">3 Sections</p>
              <p className="text-[11px] text-primary font-medium mt-1">Hero, Promo &amp; Top bar</p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-border/50 shadow-xs">
              <div className="flex items-center justify-between text-warmgray mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Inventory Status</span>
                <Check size={18} className="text-sage" />
              </div>
              <p className="font-heading font-bold text-3xl text-cocoa">
                {products.filter((p) => p.stock > 0).length} in stock
              </p>
              <p className="text-[11px] text-sage font-medium mt-1">All items available</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-border/60 mb-8 pb-3">
            <button
              onClick={() => setActiveTab("products")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                activeTab === "products"
                  ? "bg-cocoa text-white shadow-sm"
                  : "bg-white text-warmgray hover:text-cocoa hover:bg-white/80"
              }`}
            >
              <Package size={16} /> Products Management ({products.length})
            </button>

            <button
              onClick={() => setActiveTab("banners")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                activeTab === "banners"
                  ? "bg-cocoa text-white shadow-sm"
                  : "bg-white text-warmgray hover:text-cocoa hover:bg-white/80"
              }`}
            >
              <ImageIcon size={16} /> Banners &amp; Hero Editor
            </button>
          </div>

          {/* TAB 1: PRODUCTS MANAGEMENT */}
          {activeTab === "products" && (
            <div className="space-y-6">
              {/* Header and Controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-3xl border border-border/50 shadow-xs">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warmgray" />
                  <input
                    type="text"
                    placeholder="Search products by name or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input pl-10 py-2 text-sm w-full"
                  />
                </div>

                {/* Category Filter */}
                <div className="flex items-center gap-3">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="input py-2 text-sm bg-white"
                  >
                    <option value="all">All Categories</option>
                    {categoriesData.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.emoji} {c.name}
                      </option>
                    ))}
                  </select>

                  {/* Add Product Button */}
                  <button
                    onClick={handleOpenAdd}
                    className="btn-primary py-2.5 px-4 rounded-2xl text-sm font-semibold flex items-center gap-2 whitespace-nowrap shadow-rose-lg"
                  >
                    <Plus size={16} /> Add New Product
                  </button>
                </div>
              </div>

              {/* Products Grid / Table */}
              <div className="bg-white rounded-3xl border border-border/50 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border/40 bg-cream/50 text-[11px] font-bold uppercase tracking-wider text-warmgray">
                        <th className="py-4 px-6">Product</th>
                        <th className="py-4 px-4">Category</th>
                        <th className="py-4 px-4">Price</th>
                        <th className="py-4 px-4">Stock</th>
                        <th className="py-4 px-4">Badges</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30 text-sm">
                      {filteredProducts.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-12 text-warmgray">
                            <p className="font-heading text-lg text-cocoa">No products found</p>
                            <p className="text-xs mt-1">Try clearing your search or add a new product</p>
                          </td>
                        </tr>
                      ) : (
                        filteredProducts.map((p) => (
                          <tr key={p.id} className="hover:bg-cream/30 transition-colors">
                            {/* Product Info */}
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3.5">
                                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-oatmeal flex-shrink-0 border border-border/40">
                                  <img
                                    src={p.images?.[0] || "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=120&h=120&fit=crop"}
                                    alt={p.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <Link
                                    to={`/product/${p.slug}`}
                                    className="font-heading font-bold text-cocoa hover:text-primary transition-colors truncate block"
                                    target="_blank"
                                  >
                                    {p.name}
                                  </Link>
                                  <p className="text-xs text-warmgray line-clamp-1 mt-0.5">
                                    {p.description || "No description provided"}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Category */}
                            <td className="py-4 px-4 whitespace-nowrap">
                              <span className="capitalize text-xs font-semibold px-2.5 py-1 rounded-full bg-oatmeal text-cocoa">
                                {p.category}
                              </span>
                            </td>

                            {/* Price */}
                            <td className="py-4 px-4 whitespace-nowrap">
                              <div className="font-bold text-cocoa">{formatINR(p.price)}</div>
                              {p.comparePrice && (
                                <div className="text-[11px] text-warmgray line-through">
                                  {formatINR(p.comparePrice)}
                                </div>
                              )}
                            </td>

                            {/* Stock */}
                            <td className="py-4 px-4 whitespace-nowrap">
                              <span
                                className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                                  p.stock > 5
                                    ? "bg-sage/15 text-sage-dark"
                                    : "bg-red-50 text-error"
                                }`}
                              >
                                {p.stock} units
                              </span>
                            </td>

                            {/* Badges */}
                            <td className="py-4 px-4 whitespace-nowrap">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {p.isBestseller && (
                                  <span className="bg-butter/40 text-cocoa text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                    <Star size={10} fill="currentColor" /> Bestseller
                                  </span>
                                )}
                                {p.isNew && (
                                  <span className="bg-primary-light text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    New
                                  </span>
                                )}
                                {p.isCustomizable && (
                                  <span className="bg-oatmeal text-warmgray text-[10px] font-medium px-2 py-0.5 rounded-full">
                                    Customizable
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="py-4 px-6 whitespace-nowrap text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Link
                                  to={`/product/${p.slug}`}
                                  target="_blank"
                                  className="p-2 rounded-xl text-warmgray hover:text-cocoa hover:bg-oatmeal transition-colors"
                                  title="View on site"
                                >
                                  <Eye size={16} />
                                </Link>
                                <button
                                  onClick={() => handleOpenEdit(p)}
                                  className="p-2 rounded-xl text-warmgray hover:text-primary hover:bg-primary-light/50 transition-colors"
                                  title="Edit product"
                                >
                                  <Edit3 size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p.id, p.name)}
                                  className="p-2 rounded-xl text-warmgray hover:text-error hover:bg-red-50 transition-colors"
                                  title="Delete product"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Footer with Reset to Default */}
                <div className="p-4 bg-cream/40 border-t border-border/40 flex items-center justify-between text-xs text-warmgray">
                  <span>Showing {filteredProducts.length} of {products.length} products</span>
                  <button
                    onClick={() => {
                      if (window.confirm("Reset all products back to original demo catalog?")) {
                        resetProducts();
                        showToast("Products reset to demo defaults.");
                      }
                    }}
                    className="hover:text-cocoa flex items-center gap-1 underline"
                  >
                    <RefreshCw size={12} /> Reset to Demo Products
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BANNERS & HERO EDITOR */}
          {activeTab === "banners" && (
            <div className="space-y-8">
              {/* Top Announcement Bar Editor */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border/50 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-border/40 pb-4">
                  <div>
                    <h2 className="font-heading font-bold text-xl text-cocoa flex items-center gap-2">
                      <Tag size={20} className="text-primary" /> Top Announcement Bar
                    </h2>
                    <p className="text-xs text-warmgray mt-0.5">
                      The top promotional bar shown at the very top of every page.
                    </p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-cocoa">
                    <input
                      type="checkbox"
                      checked={bannerForm.topAnnouncement.enabled}
                      onChange={(e) =>
                        setBannerForm((prev) => ({
                          ...prev,
                          topAnnouncement: { ...prev.topAnnouncement, enabled: e.target.checked },
                        }))
                      }
                      className="rounded text-primary focus:ring-primary w-4 h-4"
                    />
                    Enable Announcement Bar
                  </label>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Announcement Text</label>
                    <input
                      type="text"
                      className="input"
                      value={bannerForm.topAnnouncement.text}
                      onChange={(e) =>
                        setBannerForm((prev) => ({
                          ...prev,
                          topAnnouncement: { ...prev.topAnnouncement, text: e.target.value },
                        }))
                      }
                      placeholder="e.g. Free shipping on orders above ₹999 🧶"
                    />
                  </div>

                  <div>
                    <label className="label">Highlight / Coupon Note</label>
                    <input
                      type="text"
                      className="input"
                      value={bannerForm.topAnnouncement.badgeText || ""}
                      onChange={(e) =>
                        setBannerForm((prev) => ({
                          ...prev,
                          topAnnouncement: { ...prev.topAnnouncement, badgeText: e.target.value },
                        }))
                      }
                      placeholder="e.g. Use code WELCOME10 for 10% off"
                    />
                  </div>
                </div>

                {/* Live Preview */}
                <div className="mt-2">
                  <p className="text-xs font-bold text-warmgray mb-1.5 uppercase tracking-wider">Live Preview</p>
                  <div
                    className="text-white text-xs text-center py-2.5 px-4 font-medium rounded-xl shadow-xs"
                    style={{ backgroundColor: bannerForm.topAnnouncement.bgColor || "#D4768A" }}
                  >
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-white mr-2 align-middle animate-pulse" />
                    {bannerForm.topAnnouncement.text} {bannerForm.topAnnouncement.badgeText && `· ${bannerForm.topAnnouncement.badgeText}`}
                  </div>
                </div>
              </div>

              {/* Hero Banner Section Editor */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border/50 shadow-xs space-y-6">
                <div className="border-b border-border/40 pb-4">
                  <h2 className="font-heading font-bold text-xl text-cocoa flex items-center gap-2">
                    <Sparkles size={20} className="text-butter-dark" /> Main Hero Banner (Homepage)
                  </h2>
                  <p className="text-xs text-warmgray mt-0.5">
                    Customize the primary hero headline, subtext, and showcase images on the Home page.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Hero Eyebrow Tag</label>
                    <input
                      type="text"
                      className="input"
                      value={bannerForm.heroBanner.eyebrow}
                      onChange={(e) =>
                        setBannerForm((prev) => ({
                          ...prev,
                          heroBanner: { ...prev.heroBanner, eyebrow: e.target.value },
                        }))
                      }
                      placeholder="e.g. Crafted with love in India"
                    />
                  </div>

                  <div>
                    <label className="label">Main Headline</label>
                    <input
                      type="text"
                      className="input"
                      value={bannerForm.heroBanner.headline}
                      onChange={(e) =>
                        setBannerForm((prev) => ({
                          ...prev,
                          heroBanner: { ...prev.heroBanner, headline: e.target.value },
                        }))
                      }
                      placeholder="e.g. Handmade Crochet, Woven With Love"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Hero Description Subtext</label>
                  <textarea
                    rows={2}
                    className="input"
                    value={bannerForm.heroBanner.subtext}
                    onChange={(e) =>
                      setBannerForm((prev) => ({
                        ...prev,
                        heroBanner: { ...prev.heroBanner, subtext: e.target.value },
                      }))
                    }
                    placeholder="Describe your craft and offer..."
                  />
                </div>

                {/* Hero Showcase Images */}
                <div>
                  <label className="label mb-2">Hero Showcase Images (4 Collage Photos)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {bannerForm.heroBanner.heroImages?.map((url, index) => (
                      <div key={index} className="space-y-1.5">
                        <div className="aspect-square rounded-2xl overflow-hidden bg-oatmeal border border-border/50 relative group">
                          <img src={url} alt={`Hero ${index + 1}`} className="w-full h-full object-cover" />
                        </div>
                        <input
                          type="text"
                          className="input text-xs py-1.5 px-2"
                          value={url}
                          onChange={(e) => {
                            const newArr = [...bannerForm.heroBanner.heroImages];
                            newArr[index] = e.target.value;
                            setBannerForm((prev) => ({
                              ...prev,
                              heroBanner: { ...prev.heroBanner, heroImages: newArr },
                            }));
                          }}
                          placeholder={`Image ${index + 1} URL`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mid-Page Promotional Banner Editor */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border/50 shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-border/40 pb-4">
                  <div>
                    <h2 className="font-heading font-bold text-xl text-cocoa flex items-center gap-2">
                      <ImageIcon size={20} className="text-sage-dark" /> Mid-Page Promotional Banner
                    </h2>
                    <p className="text-xs text-warmgray mt-0.5">
                      Highlighted promotional banner featured on the homepage.
                    </p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-cocoa">
                    <input
                      type="checkbox"
                      checked={bannerForm.promoBanner.enabled}
                      onChange={(e) =>
                        setBannerForm((prev) => ({
                          ...prev,
                          promoBanner: { ...prev.promoBanner, enabled: e.target.checked },
                        }))
                      }
                      className="rounded text-primary focus:ring-primary w-4 h-4"
                    />
                    Enable Promo Banner
                  </label>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Banner Title</label>
                    <input
                      type="text"
                      className="input"
                      value={bannerForm.promoBanner.title}
                      onChange={(e) =>
                        setBannerForm((prev) => ({
                          ...prev,
                          promoBanner: { ...prev.promoBanner, title: e.target.value },
                        }))
                      }
                      placeholder="e.g. Handmade with Love, Ready to Gift"
                    />
                  </div>

                  <div>
                    <label className="label">Promo Tag / Badge</label>
                    <input
                      type="text"
                      className="input"
                      value={bannerForm.promoBanner.tag}
                      onChange={(e) =>
                        setBannerForm((prev) => ({
                          ...prev,
                          promoBanner: { ...prev.promoBanner, tag: e.target.value },
                        }))
                      }
                      placeholder="e.g. Festive Season Special ✨"
                    />
                  </div>

                  <div>
                    <label className="label">Coupon Code / Discount</label>
                    <input
                      type="text"
                      className="input"
                      value={bannerForm.promoBanner.couponCode}
                      onChange={(e) =>
                        setBannerForm((prev) => ({
                          ...prev,
                          promoBanner: { ...prev.promoBanner, couponCode: e.target.value },
                        }))
                      }
                      placeholder="e.g. HANDMADE15"
                    />
                  </div>

                  <div>
                    <label className="label">Banner Image URL</label>
                    <input
                      type="text"
                      className="input"
                      value={bannerForm.promoBanner.imageUrl}
                      onChange={(e) =>
                        setBannerForm((prev) => ({
                          ...prev,
                          promoBanner: { ...prev.promoBanner, imageUrl: e.target.value },
                        }))
                      }
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Subtitle / Description</label>
                  <input
                    type="text"
                    className="input"
                    value={bannerForm.promoBanner.subtitle}
                    onChange={(e) =>
                      setBannerForm((prev) => ({
                        ...prev,
                        promoBanner: { ...prev.promoBanner, subtitle: e.target.value },
                      }))
                    }
                    placeholder="Description text on the promotional banner..."
                  />
                </div>

                {/* Banner Preview */}
                <div>
                  <p className="text-xs font-bold text-warmgray mb-2 uppercase tracking-wider">Live Banner Preview</p>
                  <div className="relative rounded-3xl overflow-hidden shadow-warm bg-cocoa text-white min-h-[200px] flex items-center p-8">
                    <img
                      src={bannerForm.promoBanner.imageUrl}
                      alt="Banner Preview"
                      className="absolute inset-0 w-full h-full object-cover opacity-35"
                    />
                    <div className="relative z-10 max-w-xl space-y-3">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-primary text-white">
                        {bannerForm.promoBanner.tag}
                      </span>
                      <h3 className="font-heading font-bold text-2xl sm:text-3xl">
                        {bannerForm.promoBanner.title}
                      </h3>
                      <p className="text-white/80 text-sm">{bannerForm.promoBanner.subtitle}</p>
                      <div className="pt-2 flex items-center gap-3">
                        <span className="btn-primary text-xs py-2 px-4 pointer-events-none">
                          {bannerForm.promoBanner.ctaText || "Explore Collection"}
                        </span>
                        {bannerForm.promoBanner.couponCode && (
                          <span className="text-xs font-mono bg-white/20 px-3 py-1.5 rounded-xl border border-white/30">
                            Use code: <strong>{bannerForm.promoBanner.couponCode}</strong>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save & Reset Buttons */}
              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Reset banners to original defaults?")) {
                      resetBanners();
                      setBannerForm({ ...useBannerStore.getState() });
                      showToast("Banners reset to defaults.");
                    }
                  }}
                  className="btn-ghost text-xs text-warmgray flex items-center gap-1.5"
                >
                  <RefreshCw size={14} /> Reset Banners to Default
                </button>

                <button
                  type="button"
                  onClick={handleSaveBanners}
                  className="btn-primary py-3 px-8 text-base font-semibold shadow-rose-lg flex items-center gap-2"
                >
                  <Check size={18} /> Save &amp; Publish Banners Live
                </button>
              </div>
            </div>
          )}
        </main>

        {/* ADD / EDIT PRODUCT MODAL */}
        <AnimatePresence>
          {isProductModalOpen && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-4xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-border/40 relative max-h-[90vh] overflow-y-auto"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-6">
                  <div>
                    <h3 className="font-heading font-bold text-2xl text-cocoa">
                      {editingProduct ? "Edit Product" : "Add New Crochet Product"}
                    </h3>
                    <p className="text-xs text-warmgray mt-0.5">
                      Fill out the product details. It will immediately appear on the storefront.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsProductModalOpen(false)}
                    className="w-9 h-9 rounded-full bg-oatmeal text-warmgray hover:text-cocoa flex items-center justify-center transition-colors"
                  >
                    ✕
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSaveProduct} className="space-y-5">
                  <div>
                    <label className="label">Product Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Daisy Flower Crochet Sling Bag"
                      className="input font-medium"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Category *</label>
                      <select
                        className="input bg-white"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        {categoriesData.map((c) => (
                          <option key={c.slug} value={c.slug}>
                            {c.emoji} {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="label">Stock Units *</label>
                      <input
                        type="number"
                        min="0"
                        className="input"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Price (₹) *</label>
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder="e.g. 799"
                        className="input font-semibold"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="label">Compare / Original Price (₹)</label>
                      <input
                        type="number"
                        min="1"
                        placeholder="e.g. 1099 (optional discount)"
                        className="input"
                        value={formData.comparePrice}
                        onChange={(e) => setFormData({ ...formData, comparePrice: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Image Options: URL or File Upload */}
                  <div className="p-4 rounded-3xl bg-cream/60 border border-border/50 space-y-3">
                    <label className="label">Product Image</label>
                    <div className="flex gap-4 items-start">
                      {/* Image Preview */}
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-oatmeal flex-shrink-0 border border-border/60 shadow-xs">
                        {formData.imageUrl ? (
                          <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-warmgray text-xs">
                            No image
                          </div>
                        )}
                      </div>

                      <div className="flex-1 space-y-2">
                        {/* URL input */}
                        <input
                          type="text"
                          placeholder="Paste image URL (https://...)"
                          className="input text-xs py-2"
                          value={formData.imageUrl}
                          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        />

                        {/* Local file upload */}
                        <div className="flex items-center gap-2">
                          <label className="btn-secondary text-xs py-1.5 px-3 rounded-xl cursor-pointer flex items-center gap-1.5">
                            <Upload size={13} /> Upload from Computer
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                          </label>
                          <span className="text-[11px] text-warmgray">Supports JPG, PNG, WEBP</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="label">Description</label>
                    <textarea
                      rows={3}
                      className="input text-sm"
                      placeholder="Describe the handmade piece, yarn softness, size, etc."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  {/* Materials & Care */}
                  <div>
                    <label className="label">Materials</label>
                    <input
                      type="text"
                      className="input text-sm"
                      placeholder="e.g. 100% premium cotton yarn, hypoallergenic fiberfill"
                      value={formData.materials}
                      onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
                    />
                  </div>

                  {/* Badges / Checkboxes */}
                  <div className="flex items-center gap-6 pt-1 flex-wrap">
                    <label className="flex items-center gap-2 text-sm text-cocoa cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isBestseller}
                        onChange={(e) => setFormData({ ...formData, isBestseller: e.target.checked })}
                        className="rounded text-primary focus:ring-primary w-4 h-4"
                      />
                      ⭐ Mark as Bestseller
                    </label>

                    <label className="flex items-center gap-2 text-sm text-cocoa cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isNew}
                        onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                        className="rounded text-primary focus:ring-primary w-4 h-4"
                      />
                      🆕 Mark as New Arrival
                    </label>

                    <label className="flex items-center gap-2 text-sm text-cocoa cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isCustomizable}
                        onChange={(e) => setFormData({ ...formData, isCustomizable: e.target.checked })}
                        className="rounded text-primary focus:ring-primary w-4 h-4"
                      />
                      ✂️ Customizable
                    </label>
                  </div>

                  {/* Submit / Cancel Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/40">
                    <button
                      type="button"
                      onClick={() => setIsProductModalOpen(false)}
                      className="btn-ghost py-2.5 px-5 text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary py-2.5 px-6 rounded-2xl text-sm font-semibold shadow-rose-lg flex items-center gap-2"
                    >
                      <Check size={16} /> {editingProduct ? "Update Product" : "Save & Publish"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

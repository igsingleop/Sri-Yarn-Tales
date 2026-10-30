import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Package, Image as ImageIcon, Plus, Trash2, Edit3,
  ExternalLink, LogOut, Check, ArrowLeft, Search, Star,
  Sparkles, RefreshCw, Eye, Tag, Layers,
  AlertCircle, Upload, ShieldCheck, Lock,
  Key, EyeOff, User, FileSpreadsheet, Download,
  CheckSquare, FileText, X
} from "lucide-react";
import { useProductStore, useBannerStore, useAuthStore } from "../../store";
import { formatINR } from "../../lib/utils";
import categoriesData from "../../data/categories.json";

// Image compression utility to ensure images fit in localStorage and render instantly
function compressImage(file, maxWidth = 900, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) {
      reject(new Error("Please upload an image file (JPG, PNG, WEBP)."));
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => reject(new Error("Failed to load image file."));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.readAsDataURL(file);
  });
}

// CSV Parser for bulk product upload
function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const splitLine = (line) => {
    const result = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const rawHeaders = splitLine(lines[0]);
  const headers = rawHeaders.map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ""));

  const parsed = [];
  for (let i = 1; i < lines.length; i++) {
    const values = splitLine(lines[i]);
    if (values.length === 0 || values.every((v) => !v)) continue;

    const row = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || "";
    });

    const name = row.name || row.title || row.productname || "";
    const price = Number(row.price || row.cost || row.amount || 0);

    if (name && !isNaN(price) && price > 0) {
      parsed.push({
        name,
        category: (row.category || "amigurumi").toLowerCase(),
        price,
        comparePrice: row.compareprice ? Number(row.compareprice) : null,
        stock: row.stock ? Number(row.stock) : 10,
        description: row.description || "Handcrafted with premium soft yarn, made with love and precision.",
        materials: row.materials || "100% premium cotton yarn, hypoallergenic fiberfill",
        imageUrl: row.imageurl || row.image || row.images || "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop",
        isBestseller: row.isbestseller === "true" || row.bestseller === "true" || row.isbestseller === "1",
        isNew: row.isnew !== "false" && row.isnew !== "0",
        isCustomizable: row.iscustomizable === "true" || row.customizable === "true" || row.iscustomizable === "1",
        tags: row.tags ? row.tags.split(";").map((t) => t.trim()) : ["handmade", "crochet"],
      });
    }
  }

  return parsed;
}

// JSON Parser for bulk product upload
function parseJSON(text) {
  const data = JSON.parse(text);
  const items = Array.isArray(data) ? data : (Array.isArray(data?.products) ? data.products : []);
  return items
    .filter((item) => item && (item.name || item.title) && item.price !== undefined)
    .map((item) => ({
      name: item.name || item.title,
      category: (item.category || "amigurumi").toLowerCase(),
      price: Number(item.price) || 499,
      comparePrice: item.comparePrice ? Number(item.comparePrice) : null,
      stock: item.stock !== undefined ? Number(item.stock) : 10,
      description: item.description || "Handcrafted with premium soft yarn, made with love and precision.",
      materials: item.materials || "100% premium cotton yarn, hypoallergenic fiberfill",
      imageUrl: item.imageUrl || (Array.isArray(item.images) ? item.images[0] : "") || "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop",
      isBestseller: Boolean(item.isBestseller),
      isNew: item.isNew !== undefined ? Boolean(item.isNew) : true,
      isCustomizable: Boolean(item.isCustomizable),
      tags: Array.isArray(item.tags) ? item.tags : ["handmade", "crochet"],
    }));
}

// Download Sample CSV template
function downloadSampleCSV() {
  const csvContent =
`name,category,price,comparePrice,stock,description,materials,imageUrl,isBestseller,isNew,isCustomizable,tags
"Lavender Bunny Plushie",amigurumi,649,899,15,"Cute hand-crocheted lavender bunny with floppy ears and soft tail","100% organic cotton yarn, hypoallergenic fiberfill","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop",true,true,true,"bunny;amigurumi;cute"
"Sunburst Crochet Tote Bag",bags,1299,1599,8,"Boho-style hand-woven granny square tote bag with durable handles","100% premium mercerized cotton yarn","https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop",true,false,false,"tote;bag;grannysquare"
"Pastel Coaster Set of 4",home-decor,399,499,25,"Charming floral coasters in pastel hues for tea mugs and cups","Durable washable cotton yarn","https://images.unsplash.com/photo-1568760970073-ce3f8af8cb72?w=600&h=600&fit=crop",false,true,true,"coasters;homedecor;kitchen"
"Boho Crochet Bucket Hat",wearables,849,1099,10,"Breathable summer bucket hat in earthy crochet pattern","100% soft cotton yarn","https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=600&h=600&fit=crop",false,true,false,"hat;summer;boho"`;

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "sri_yarn_products_template.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Download Sample JSON template
function downloadSampleJSON() {
  const sample = [
    {
      name: "Pastel Daisy Keychain",
      category: "accessories",
      price: 249,
      comparePrice: 349,
      stock: 20,
      description: "Miniature crochet daisy flower keychain with golden ring.",
      materials: "100% combed cotton yarn, brass alloy ring",
      imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop",
      isBestseller: true,
      isNew: true,
      isCustomizable: true,
      tags: ["keychain", "accessories", "flower"]
    },
    {
      name: "Handmade Baby Booties",
      category: "baby",
      price: 499,
      comparePrice: 699,
      stock: 12,
      description: "Ultra-soft baby booties crafted with hypoallergenic baby yarn.",
      materials: "Special sensitive skin baby yarn",
      imageUrl: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&h=600&fit=crop",
      isBestseller: false,
      isNew: true,
      isCustomizable: true,
      tags: ["baby", "booties", "gift"]
    }
  ];
  const blob = new Blob([JSON.stringify(sample, null, 2)], { type: "application/json;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "sri_yarn_products_template.json");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function AdminDashboard() {
  const { user, adminUser, login, loginAdmin, logoutAdmin, logout } = useAuthStore();
  const activeAdmin = adminUser || (user?.role === "admin" ? user : null);
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    deleteMultipleProducts,
    addMultipleProducts,
    resetProducts,
  } = useProductStore();
  const {
    topAnnouncement,
    heroBanner,
    promoBanner,
    updateTopAnnouncement,
    updateHeroBanner,
    updatePromoBanner,
    resetBanners,
  } = useBannerStore();

  // Admin Credentials Gate State
  const [adminUsername, setAdminUsername] = useState("admin");
  const [adminPassword, setAdminPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [adminError, setAdminError] = useState("");

  const [activeTab, setActiveTab] = useState("products");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [toast, setToast] = useState(null);

  // Multiple Selection & Delete State
  const [selectedProductIds, setSelectedProductIds] = useState(new Set());

  // Bulk Upload Modal State
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkParsedProducts, setBulkParsedProducts] = useState([]);
  const [bulkParseError, setBulkParseError] = useState("");
  const [isParsingBulk, setIsParsingBulk] = useState(false);

  // Modal state for Add/Edit Product
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form state for Product
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

  // Local Banner form state with defensive default fallbacks
  const [bannerForm, setBannerForm] = useState({
    topAnnouncement: { enabled: true, text: "", badgeText: "", bgColor: "#D4768A", ...(topAnnouncement || {}) },
    heroBanner: { eyebrow: "", headline: "", subtext: "", heroImages: [], ...(heroBanner || {}) },
    promoBanner: { enabled: true, tag: "", title: "", subtitle: "", couponCode: "", imageUrl: "", ...(promoBanner || {}) },
  });

  // Keep bannerForm in sync with store state (including cross-tab updates)
  useEffect(() => {
    setBannerForm({
      topAnnouncement: { enabled: true, text: "", badgeText: "", bgColor: "#D4768A", ...(topAnnouncement || {}) },
      heroBanner: { eyebrow: "", headline: "", subtext: "", heroImages: [], ...(heroBanner || {}) },
      promoBanner: { enabled: true, tag: "", title: "", subtitle: "", couponCode: "", imageUrl: "", ...(promoBanner || {}) },
    });
  }, [topAnnouncement, heroBanner, promoBanner]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  };

  // Admin Credentials Authentication handler
  const handleAdminLoginSubmit = (e) => {
    e?.preventDefault();
    setAdminError("");

    if (!adminUsername.trim()) {
      setAdminError("Please enter your administrator username or email.");
      return;
    }

    const res = loginAdmin
      ? loginAdmin(adminUsername.trim(), adminPassword)
      : login(adminUsername.trim(), adminPassword);

    if (res.success && res.role === "admin") {
      showToast("Admin credentials verified! Welcome to the Admin Console.");
    } else {
      setAdminError(res.error || "Invalid administrator credentials. Please check your username and password.");
    }
  };

  // Quick 1-click Demo Admin Login
  const handleQuickAdminDemo = () => {
    const res = loginAdmin
      ? loginAdmin("admin", "admin123")
      : login("admin", "admin123");

    if (res.success && res.role === "admin") {
      showToast("Signed in as Admin Manager via quick credentials.");
    }
  };

  // Sign out handler
  const handleLogout = () => {
    if (logoutAdmin) logoutAdmin();
    else logout();
    showToast("Signed out of administrator console.");
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

  // Handle local image file upload for product
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 900);
        setFormData((prev) => ({ ...prev, imageUrl: compressed }));
        showToast("Product photo uploaded and optimized for live display!");
      } catch (err) {
        alert(err.message || "Failed to process photo");
      }
    }
  };

  // Handle local image upload for hero images
  const handleHeroImageUpload = async (index, file) => {
    if (file) {
      try {
        const compressed = await compressImage(file, 600);
        const newArr = [...bannerForm.heroBanner.heroImages];
        newArr[index] = compressed;
        const nextHero = { ...bannerForm.heroBanner, heroImages: newArr };
        setBannerForm((prev) => ({
          ...prev,
          heroBanner: nextHero,
        }));
        updateHeroBanner(nextHero);
        showToast(`Hero photo ${index + 1} published live to storefront!`);
      } catch (_err) {
        alert("Failed to process photo");
      }
    }
  };

  // Handle local image upload for promotional banner
  const handlePromoImageUpload = async (file) => {
    if (file) {
      try {
        const compressed = await compressImage(file, 1200);
        const nextPromo = { ...bannerForm.promoBanner, imageUrl: compressed };
        setBannerForm((prev) => ({
          ...prev,
          promoBanner: nextPromo,
        }));
        updatePromoBanner(nextPromo);
        showToast("Promotional banner photo published live to storefront!");
      } catch (_err) {
        alert("Failed to process photo");
      }
    }
  };

  // Submit product (Add or Update)
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
      showToast(`Product "${payload.name}" updated! Changes are live on the store.`);
    } else {
      addProduct(payload);
      showToast(`Added new product "${payload.name}" to store! Live immediately.`);
    }

    setIsProductModalOpen(false);
  };

  // Delete product
  const handleDeleteProduct = (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}" from the store catalog?`)) {
      deleteProduct(id);
      if (selectedProductIds.has(id)) {
        const next = new Set(selectedProductIds);
        next.delete(id);
        setSelectedProductIds(next);
      }
      showToast(`Product "${name}" deleted from store.`);
    }
  };

  // Safe products list
  const productList = Array.isArray(products) ? products : [];

  // Filtered products (computed safely before selection helpers)
  const filteredProducts = productList.filter((p) => {
    if (!p) return false;
    const name = String(p.name || "").toLowerCase();
    const cat = String(p.category || "").toLowerCase();
    const q = (searchTerm || "").toLowerCase().trim();
    const matchesSearch = !q || name.includes(q) || cat.includes(q);
    const matchesCat = selectedCategory === "all" || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Multiple Selection Helpers
  const isAllSelected =
    filteredProducts.length > 0 &&
    filteredProducts.every((p) => p && selectedProductIds.has(p.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedProductIds(new Set());
    } else {
      setSelectedProductIds(new Set(filteredProducts.map((p) => p.id)));
    }
  };

  const toggleSelectProduct = (id) => {
    const next = new Set(selectedProductIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedProductIds(next);
  };

  const clearSelection = () => {
    setSelectedProductIds(new Set());
  };

  const handleDeleteMultiple = () => {
    const count = selectedProductIds.size;
    if (count === 0) return;
    if (
      window.confirm(
        `Are you sure you want to delete ${count} selected product${
          count > 1 ? "s" : ""
        }? This will immediately remove them from the store catalog.`
      )
    ) {
      deleteMultipleProducts(Array.from(selectedProductIds));
      clearSelection();
      showToast(`Deleted ${count} product${count > 1 ? "s" : ""} from store.`);
    }
  };

  // Bulk Upload File Handler
  const handleBulkFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBulkFile(file);
    setBulkParseError("");
    setIsParsingBulk(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        let parsed = [];
        if (file.name.endsWith(".json") || file.type.includes("json")) {
          parsed = parseJSON(text);
        } else {
          parsed = parseCSV(text);
        }

        if (parsed.length === 0) {
          setBulkParseError(
            "No valid product records found in the file. Please verify column headers (name, price, category, etc.) and check that rows have at least a name and price."
          );
          setBulkParsedProducts([]);
        } else {
          setBulkParsedProducts(parsed);
          setBulkParseError("");
        }
      } catch (err) {
        setBulkParseError("Failed to parse file: " + (err.message || "Invalid file format"));
        setBulkParsedProducts([]);
      } finally {
        setIsParsingBulk(false);
      }
    };

    reader.onerror = () => {
      setBulkParseError("Could not read file from disk.");
      setIsParsingBulk(false);
    };

    reader.readAsText(file);
  };

  // Confirm and Import Bulk Products
  const handleConfirmBulkImport = () => {
    if (bulkParsedProducts.length === 0) return;
    addMultipleProducts(bulkParsedProducts);
    showToast(`Successfully imported ${bulkParsedProducts.length} products to store catalog!`);
    setIsBulkUploadOpen(false);
    setBulkFile(null);
    setBulkParsedProducts([]);
    setBulkParseError("");
  };

  // Save all Banner changes
  const handleSaveBanners = () => {
    updateTopAnnouncement(bannerForm.topAnnouncement);
    updateHeroBanner(bannerForm.heroBanner);
    updatePromoBanner(bannerForm.promoBanner);
    showToast("All banner settings saved! Live across all storefront tabs.");
  };

  // Individual section save handlers
  const handleSaveAnnouncementOnly = () => {
    updateTopAnnouncement(bannerForm.topAnnouncement);
    showToast("Top announcement bar updated and published live!");
  };

  const handleSaveHeroOnly = () => {
    updateHeroBanner(bannerForm.heroBanner);
    showToast("Hero banner updated and published live!");
  };

  const handleSavePromoOnly = () => {
    updatePromoBanner(bannerForm.promoBanner);
    showToast("Promotional banner updated and published live!");
  };

  // =========================================================================
  // IF NOT AUTHENTICATED AS ADMIN: SHOW ADMIN CREDENTIALS GATE
  // =========================================================================
  if (!activeAdmin) {
    return (
      <>
        <Helmet>
          <title>Admin Portal Access — Sri Yarn &amp; Tales</title>
        </Helmet>

        <div className="min-h-screen bg-gradient-to-b from-cream via-oatmeal/40 to-cream flex flex-col justify-center items-center px-4 py-12">
          {/* Top Return link */}
          <div className="w-full max-w-md mb-6 flex justify-between items-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-warmgray hover:text-cocoa transition-colors"
            >
              <ArrowLeft size={16} /> Return to Storefront
            </Link>
            <div className="flex items-center gap-1.5 text-xs text-primary font-semibold">
              <ShieldCheck size={14} /> Admin Access Gate
            </div>
          </div>

          {/* Admin Credentials Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md bg-white rounded-4xl p-7 sm:p-9 shadow-2xl border border-border/50"
          >
            {/* Header / Brand */}
            <div className="text-center space-y-3 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-cocoa text-butter flex items-center justify-center mx-auto shadow-rose-lg">
                <Lock size={26} className="text-butter" />
              </div>

              <div>
                <span className="text-xs font-bold tracking-widest text-primary uppercase">
                  Sri Yarn &amp; Tales
                </span>
                <h1 className="font-heading font-bold text-2xl text-cocoa mt-1">
                  Administrator Console
                </h1>
                <p className="text-xs text-warmgray mt-1 leading-relaxed">
                  Enter your store administrator credentials to unlock and manage products, banners, and storefront settings.
                </p>
              </div>
            </div>

            {/* If currently logged in as a customer */}
            {user && user.role !== "admin" && (
              <div className="mb-5 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Customer Session Active</p>
                  <p className="text-amber-800">
                    You are signed in as <strong>{user.name}</strong> ({user.email}). Administrator credentials are required to open this console.
                  </p>
                </div>
              </div>
            )}

            {/* Error Message Alert */}
            {adminError && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-error text-xs flex items-center gap-2.5"
              >
                <AlertCircle size={16} className="text-error flex-shrink-0" />
                <span>{adminError}</span>
              </motion.div>
            )}

            {/* Credentials Login Form */}
            <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
              <div>
                <label className="label text-xs">Admin Username or Email</label>
                <div className="relative">
                  <User size={16} className="text-warmgray absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    placeholder="admin or admin@sriyarn.com"
                    className="input pl-10 text-sm"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="label text-xs flex items-center justify-between">
                  <span>Admin Password</span>
                  <span className="text-[11px] text-warmgray font-normal">(Demo: admin123)</span>
                </label>
                <div className="relative">
                  <Key size={16} className="text-warmgray absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="input pl-10 pr-10 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-warmgray hover:text-cocoa"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary w-full py-3.5 rounded-2xl text-sm font-semibold shadow-rose-lg flex items-center justify-center gap-2 mt-2"
              >
                <ShieldCheck size={18} /> Unlock Admin Dashboard
              </button>
            </form>

            {/* Quick Demo Access Box */}
            <div className="mt-6 pt-6 border-t border-border/50 text-center">
              <div className="p-4 rounded-2xl bg-cream border border-border/60 text-left space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                    <Sparkles size={12} /> Default Demo Credentials
                  </span>
                  <span className="text-[10px] bg-primary-light text-primary font-bold px-2 py-0.5 rounded-full">
                    Instant Access
                  </span>
                </div>
                <div className="text-xs text-cocoa font-mono bg-white/80 p-2 rounded-xl border border-border/40 flex justify-between items-center">
                  <span>User: <strong>admin</strong></span>
                  <span>Pass: <strong>admin123</strong></span>
                </div>
                <button
                  type="button"
                  onClick={handleQuickAdminDemo}
                  className="w-full mt-1 bg-cocoa text-white hover:bg-primary py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <Key size={13} className="text-butter" /> Quick One-Click Admin Sign In
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </>
    );
  }

  // =========================================================================
  // AUTHENTICATED: RENDER FULL ADMIN DASHBOARD
  // =========================================================================
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
                  className="btn-secondary btn-sm flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open storefront in new tab to see live changes side-by-side"
                >
                  <Eye size={14} /> View Storefront <ExternalLink size={12} />
                </Link>

                <div className="h-6 w-px bg-border hidden sm:block" />

                <div className="flex items-center gap-2">
                  <img
                    src={activeAdmin?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop"}
                    alt="Admin"
                    className="w-8 h-8 rounded-full object-cover border border-primary-light"
                  />
                  <div className="hidden md:block text-left">
                    <p className="text-xs font-bold text-cocoa leading-tight">{activeAdmin?.name || "Admin Manager"}</p>
                    <p className="text-[10px] text-warmgray">Store Administrator</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 text-warmgray hover:text-error hover:bg-red-50 rounded-lg transition-colors ml-1"
                    title="Sign Out of Admin Console"
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
          <div className="flex items-center justify-between border-b border-border/60 mb-8 pb-3 flex-wrap gap-3">
            <div className="flex items-center gap-2">
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

            {/* Quick Live Preview pill */}
            <div className="text-xs font-medium text-sage flex items-center gap-1.5 bg-sage/10 px-3 py-1.5 rounded-full border border-sage/20">
              <span className="w-2 h-2 rounded-full bg-sage animate-ping" />
              Live Sync Active: Changes reflect instantly
            </div>
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

                {/* Category Filter, Bulk Upload & Add Button */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="input py-2 text-sm bg-white"
                  >
                    <option value="all">All Categories</option>
                    {categoriesData.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => setIsBulkUploadOpen(true)}
                    className="btn-secondary py-2 px-3.5 text-sm font-semibold flex items-center gap-1.5 rounded-2xl shadow-xs whitespace-nowrap"
                    title="Upload multiple products at once via CSV spreadsheet or JSON file"
                  >
                    <FileSpreadsheet size={16} className="text-cocoa" /> Bulk Upload
                  </button>

                  <button
                    onClick={handleOpenAdd}
                    className="btn-primary py-2 px-4 text-sm font-semibold flex items-center gap-1.5 rounded-2xl shadow-rose-sm whitespace-nowrap"
                  >
                    <Plus size={16} /> Add Product
                  </button>
                </div>
              </div>

              {/* Multiple Selection Action Toolbar */}
              <AnimatePresence>
                {selectedProductIds.size > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-3.5 px-5 rounded-3xl bg-cocoa text-white flex items-center justify-between shadow-rose-lg flex-wrap gap-3 border border-white/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center font-bold text-xs text-butter">
                        {selectedProductIds.size}
                      </div>
                      <span className="text-sm font-semibold">
                        {selectedProductIds.size} product{selectedProductIds.size > 1 ? "s" : ""} selected
                      </span>
                      <span className="text-xs text-white/60 hidden sm:inline">
                        — you can delete these selected items in a single action
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={clearSelection}
                        className="text-xs text-white/70 hover:text-white px-3 py-1.5 rounded-xl transition-colors hover:bg-white/10"
                      >
                        Deselect All
                      </button>
                      <button
                        type="button"
                        onClick={handleDeleteMultiple}
                        className="bg-error hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
                      >
                        <Trash2 size={14} /> Delete Selected ({selectedProductIds.size})
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Products Table Card */}
              <div className="bg-white rounded-3xl border border-border/50 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-cream/60 border-b border-border/60 text-xs font-semibold text-warmgray uppercase tracking-wider">
                        <th className="py-4 px-4 w-12 text-center">
                          <input
                            type="checkbox"
                            checked={isAllSelected}
                            onChange={toggleSelectAll}
                            className="rounded text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                            title={isAllSelected ? "Deselect all products" : "Select all filtered products"}
                          />
                        </th>
                        <th className="py-4 px-4">Product</th>
                        <th className="py-4 px-4">Category</th>
                        <th className="py-4 px-4">Price</th>
                        <th className="py-4 px-4">Stock</th>
                        <th className="py-4 px-4">Badges</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {filteredProducts.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-warmgray">
                            <p className="text-base font-semibold text-cocoa">No products match your search</p>
                            <p className="text-xs mt-1">Try searching for something else or add a new product</p>
                          </td>
                        </tr>
                      ) : (
                        filteredProducts.map((p) => {
                          const isSelected = selectedProductIds.has(p.id);
                          return (
                            <tr
                              key={p.id}
                              className={`transition-colors ${
                                isSelected
                                  ? "bg-primary/5 hover:bg-primary/10"
                                  : "hover:bg-oatmeal/20"
                              }`}
                            >
                              {/* Selection Checkbox */}
                              <td className="py-4 px-4 text-center">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleSelectProduct(p.id)}
                                  className="rounded text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                                  aria-label={`Select ${p.name}`}
                                />
                              </td>

                              {/* Product Info */}
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={p.images?.[0] || "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop"}
                                    alt={p.name}
                                    className="w-12 h-12 rounded-2xl object-cover bg-oatmeal border border-border/60 flex-shrink-0"
                                  />
                                  <div>
                                    <Link
                                      to={`/product/${p.slug}`}
                                      target="_blank"
                                      className="font-bold text-cocoa hover:text-primary transition-colors flex items-center gap-1 leading-snug"
                                    >
                                      {p.name}
                                    <ExternalLink size={12} className="text-warmgray" />
                                  </Link>
                                  <p className="text-xs text-warmgray line-clamp-1 max-w-xs">{p.description}</p>
                                </div>
                              </div>
                            </td>

                            {/* Category */}
                            <td className="py-4 px-4">
                              <span className="capitalize text-xs bg-cream px-2.5 py-1 rounded-full border border-border/60 text-cocoa font-medium">
                                {p.category}
                              </span>
                            </td>

                            {/* Price */}
                            <td className="py-4 px-4">
                              <div className="font-bold text-cocoa">{formatINR(p.price)}</div>
                              {p.comparePrice && (
                                <div className="text-xs text-warmgray line-through">
                                  {formatINR(p.comparePrice)}
                                </div>
                              )}
                            </td>

                            {/* Stock */}
                            <td className="py-4 px-4">
                              <span
                                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                                  p.stock > 5
                                    ? "bg-sage/20 text-sage-dark"
                                    : p.stock > 0
                                    ? "bg-butter/30 text-cocoa"
                                    : "bg-red-100 text-error"
                                }`}
                              >
                                {p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}
                              </span>
                            </td>

                            {/* Badges */}
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {p.isBestseller && (
                                  <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-0.5">
                                    <Star size={10} className="fill-amber-800" /> Bestseller
                                  </span>
                                )}
                                {p.isNew && (
                                  <span className="bg-primary-light text-primary text-[10px] font-bold px-2 py-0.5 rounded-md">
                                    New
                                  </span>
                                )}
                                {p.isCustomizable && (
                                  <span className="bg-oatmeal text-cocoa text-[10px] font-medium px-2 py-0.5 rounded-md">
                                    Custom
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="py-4 px-6 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleOpenEdit(p)}
                                  className="p-2 text-warmgray hover:text-cocoa hover:bg-oatmeal rounded-xl transition-colors"
                                  title="Edit Product"
                                >
                                  <Edit3 size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p.id, p.name)}
                                  className="p-2 text-warmgray hover:text-error hover:bg-red-50 rounded-xl transition-colors"
                                  title="Delete Product"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
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
              {/* Sticky Top Action Bar */}
              <div className="bg-white p-4 rounded-3xl border border-border/50 shadow-xs flex items-center justify-between flex-wrap gap-3 sticky top-20 z-20">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-sage" />
                  <span className="text-xs font-bold text-cocoa">Banners Live Syncing</span>
                  <span className="text-xs text-warmgray hidden sm:inline">— changes save directly to all active store sessions</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("Reset all banners back to original defaults?")) {
                        resetBanners();
                        showToast("Banners reset to defaults.");
                      }
                    }}
                    className="btn-ghost text-xs py-2 px-3 text-warmgray flex items-center gap-1"
                  >
                    <RefreshCw size={13} /> Reset Defaults
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveBanners}
                    className="btn-primary py-2 px-5 text-sm font-semibold rounded-2xl shadow-rose-sm flex items-center gap-1.5"
                  >
                    <Check size={16} /> Save &amp; Publish All Banners Live
                  </button>
                </div>
              </div>

              {/* 1. Top Announcement Bar Editor */}
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
                  <div className="flex items-center gap-4">
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
                      Enable Bar
                    </label>
                    <button
                      type="button"
                      onClick={handleSaveAnnouncementOnly}
                      className="btn-secondary text-xs py-1.5 px-3 rounded-xl flex items-center gap-1 font-semibold"
                    >
                      <Check size={13} /> Save Top Bar
                    </button>
                  </div>
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
                    className="text-white text-xs text-center py-2.5 px-4 font-medium rounded-xl shadow-xs transition-colors"
                    style={{ backgroundColor: bannerForm.topAnnouncement.bgColor || "#D4768A" }}
                  >
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-white mr-2 align-middle animate-pulse" />
                    {bannerForm.topAnnouncement.text} {bannerForm.topAnnouncement.badgeText && `· ${bannerForm.topAnnouncement.badgeText}`}
                  </div>
                </div>
              </div>

              {/* 2. Hero Banner Section Editor */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border/50 shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-border/40 pb-4">
                  <div>
                    <h2 className="font-heading font-bold text-xl text-cocoa flex items-center gap-2">
                      <Sparkles size={20} className="text-butter-dark" /> Main Hero Banner (Homepage)
                    </h2>
                    <p className="text-xs text-warmgray mt-0.5">
                      Customize the primary hero headline, subtext, and showcase images on the Home page.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveHeroOnly}
                    className="btn-secondary text-xs py-1.5 px-3 rounded-xl flex items-center gap-1 font-semibold"
                  >
                    <Check size={13} /> Save Hero Banner
                  </button>
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
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {bannerForm.heroBanner.heroImages?.map((url, index) => (
                      <div key={index} className="space-y-2 p-3 bg-cream/40 rounded-2xl border border-border/40">
                        <div className="aspect-square rounded-xl overflow-hidden bg-oatmeal border border-border/50 relative group">
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
                        <label className="btn-ghost text-[11px] py-1 px-2 rounded-lg cursor-pointer flex items-center justify-center gap-1 border border-border/50 w-full hover:bg-white">
                          <Upload size={11} /> Upload Photo
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleHeroImageUpload(index, e.target.files?.[0])}
                            className="hidden"
                          />
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. Mid-Page Promotional Banner Editor */}
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
                  <div className="flex items-center gap-4">
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
                    <button
                      type="button"
                      onClick={handleSavePromoOnly}
                      className="btn-secondary text-xs py-1.5 px-3 rounded-xl flex items-center gap-1 font-semibold"
                    >
                      <Check size={13} /> Save Promo Banner
                    </button>
                  </div>
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
                    <label className="label">Banner Image URL / Local Photo</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="input text-xs"
                        value={bannerForm.promoBanner.imageUrl}
                        onChange={(e) =>
                          setBannerForm((prev) => ({
                            ...prev,
                            promoBanner: { ...prev.promoBanner, imageUrl: e.target.value },
                          }))
                        }
                        placeholder="https://..."
                      />
                      <label className="btn-secondary text-xs py-2 px-3 rounded-xl cursor-pointer flex items-center gap-1 whitespace-nowrap">
                        <Upload size={13} /> Upload
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handlePromoImageUpload(e.target.files?.[0])}
                          className="hidden"
                        />
                      </label>
                    </div>
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
                  <div className="relative rounded-3xl overflow-hidden bg-cocoa text-white p-6 sm:p-8">
                    <img
                      src={bannerForm.promoBanner.imageUrl}
                      alt="Banner Preview"
                      className="absolute inset-0 w-full h-full object-cover opacity-25"
                    />
                    <div className="relative z-10 max-w-lg space-y-2">
                      <span className="inline-block bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                        {bannerForm.promoBanner.tag}
                      </span>
                      <h3 className="font-heading font-bold text-2xl text-white">
                        {bannerForm.promoBanner.title}
                      </h3>
                      <p className="text-xs text-white/80 leading-relaxed">
                        {bannerForm.promoBanner.subtitle}
                      </p>
                      <div className="pt-2 flex items-center gap-2">
                        <span className="font-mono text-xs bg-white/10 px-3 py-1 rounded-lg border border-white/20">
                          {bannerForm.promoBanner.couponCode}
                        </span>
                        <span className="text-xs font-bold text-butter">
                          {bannerForm.promoBanner.discountBadge || "Special Promo"}
                        </span>
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
                  className="btn-primary py-3 px-8 text-base font-semibold shadow-rose-lg flex items-center gap-2 rounded-2xl"
                >
                  <Check size={18} /> Save &amp; Publish All Banners Live
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
                      {editingProduct ? "Edit Product" : "Add New Handcrafted Product"}
                    </h3>
                    <p className="text-xs text-warmgray mt-0.5">
                      {editingProduct
                        ? "Make changes below and hit Update to publish live immediately."
                        : "Fill in the details to publish a new crochet product live to the store."}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsProductModalOpen(false)}
                    className="w-8 h-8 rounded-full bg-oatmeal hover:bg-border/60 text-warmgray hover:text-cocoa flex items-center justify-center text-sm font-bold"
                  >
                    ✕
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSaveProduct} className="space-y-4">
                  <div>
                    <label className="label">Product Name *</label>
                    <input
                      type="text"
                      required
                      className="input"
                      placeholder="e.g. Daisy Flower Bouquet or Amigurumi Sleepy Fox"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="label">Category</label>
                      <select
                        className="input bg-white capitalize"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        {categoriesData.map((c) => (
                          <option key={c.slug} value={c.slug}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="label">Price (₹) *</label>
                      <input
                        type="number"
                        required
                        className="input"
                        placeholder="499"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="label">Compare Price (₹)</label>
                      <input
                        type="number"
                        className="input"
                        placeholder="799"
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

                        {/* Local file upload with auto-compression */}
                        <div className="flex items-center gap-2">
                          <label className="btn-secondary text-xs py-1.5 px-3 rounded-xl cursor-pointer flex items-center gap-1.5 font-medium">
                            <Upload size={13} /> Upload from Computer
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                          </label>
                          <span className="text-[11px] text-warmgray">Auto-compressed JPG, PNG, WEBP</span>
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

        {/* BULK PRODUCT UPLOAD MODAL */}
        <AnimatePresence>
          {isBulkUploadOpen && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-4xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-border/40 relative max-h-[92vh] overflow-y-auto"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-cocoa text-butter flex items-center justify-center shadow-xs">
                      <FileSpreadsheet size={20} />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-2xl text-cocoa">
                        Bulk Product Upload
                      </h3>
                      <p className="text-xs text-warmgray mt-0.5">
                        Import multiple handmade crochet products at once via CSV spreadsheet or JSON file.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsBulkUploadOpen(false);
                      setBulkFile(null);
                      setBulkParsedProducts([]);
                      setBulkParseError("");
                    }}
                    className="w-8 h-8 rounded-full bg-oatmeal hover:bg-border/60 text-warmgray hover:text-cocoa flex items-center justify-center text-sm font-bold"
                  >
                    ✕
                  </button>
                </div>

                {/* Templates & Guidelines Banner */}
                <div className="mb-6 p-4 rounded-3xl bg-cream/70 border border-border/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-cocoa flex items-center gap-1.5 uppercase tracking-wider">
                      <Download size={14} className="text-primary" /> Download Sample Templates
                    </h4>
                    <p className="text-xs text-warmgray mt-0.5">
                      Need a sample file to get started? Download our ready-to-fill templates:
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={downloadSampleCSV}
                      className="btn-secondary text-xs py-1.5 px-3 rounded-xl flex items-center gap-1 font-semibold whitespace-nowrap bg-white"
                    >
                      <Download size={13} /> Sample CSV
                    </button>
                    <button
                      type="button"
                      onClick={downloadSampleJSON}
                      className="btn-secondary text-xs py-1.5 px-3 rounded-xl flex items-center gap-1 font-semibold whitespace-nowrap bg-white"
                    >
                      <Download size={13} /> Sample JSON
                    </button>
                  </div>
                </div>

                {/* File Upload Dropzone */}
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-border/80 hover:border-primary/60 rounded-3xl p-6 sm:p-8 text-center bg-oatmeal/20 transition-colors relative">
                    <input
                      type="file"
                      accept=".csv, .json, text/csv, application/json, text/plain"
                      onChange={handleBulkFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-border/60 flex items-center justify-center text-primary shadow-xs">
                        <Upload size={24} />
                      </div>
                      <p className="font-semibold text-cocoa text-sm">
                        {bulkFile ? bulkFile.name : "Click or drag & drop your CSV or JSON file here"}
                      </p>
                      <p className="text-xs text-warmgray">
                        Supports CSV (comma-separated with headers) and JSON arrays
                      </p>
                    </div>
                  </div>

                  {/* Parsing Spinner */}
                  {isParsingBulk && (
                    <div className="p-4 text-center text-xs text-warmgray flex items-center justify-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      Parsing file contents...
                    </div>
                  )}

                  {/* Parse Error Alert */}
                  {bulkParseError && (
                    <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-error text-xs flex items-center gap-2.5">
                      <AlertCircle size={16} className="text-error flex-shrink-0" />
                      <span>{bulkParseError}</span>
                    </div>
                  )}

                  {/* Parsed Products Preview Table */}
                  {bulkParsedProducts.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-sage-dark bg-sage/15 px-3 py-1 rounded-full border border-sage/20 flex items-center gap-1.5">
                          <Check size={13} /> {bulkParsedProducts.length} Products Ready to Import
                        </span>
                        <span className="text-xs text-warmgray">Review products below before confirming</span>
                      </div>

                      <div className="border border-border/60 rounded-2xl overflow-hidden max-h-60 overflow-y-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-cream sticky top-0 border-b border-border/60 text-warmgray font-semibold">
                            <tr>
                              <th className="py-2.5 px-3">#</th>
                              <th className="py-2.5 px-3">Product Name</th>
                              <th className="py-2.5 px-3">Category</th>
                              <th className="py-2.5 px-3">Price</th>
                              <th className="py-2.5 px-3">Stock</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/30">
                            {bulkParsedProducts.map((p, idx) => (
                              <tr key={idx} className="hover:bg-oatmeal/30">
                                <td className="py-2.5 px-3 font-mono text-warmgray">{idx + 1}</td>
                                <td className="py-2.5 px-3 font-semibold text-cocoa">{p.name}</td>
                                <td className="py-2.5 px-3 capitalize">
                                  <span className="bg-cream px-2 py-0.5 rounded-md border border-border/40">
                                    {p.category}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 font-bold text-cocoa">{formatINR(p.price)}</td>
                                <td className="py-2.5 px-3">{p.stock}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Modal Action Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/40">
                    <button
                      type="button"
                      onClick={() => {
                        setIsBulkUploadOpen(false);
                        setBulkFile(null);
                        setBulkParsedProducts([]);
                        setBulkParseError("");
                      }}
                      className="btn-ghost py-2.5 px-5 text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={bulkParsedProducts.length === 0}
                      onClick={handleConfirmBulkImport}
                      className={`btn-primary py-2.5 px-6 rounded-2xl text-sm font-semibold shadow-rose-lg flex items-center gap-2 ${
                        bulkParsedProducts.length === 0 ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <Check size={16} /> Import {bulkParsedProducts.length > 0 ? `${bulkParsedProducts.length} Products` : "Products"} Live
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

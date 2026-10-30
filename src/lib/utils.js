// Utility functions
export const formatINR = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatNumber = (num) => {
  return new Intl.NumberFormat("en-IN").format(num);
};

export const getDiscountPercent = (price, comparePrice) => {
  if (!comparePrice) return 0;
  return Math.round(((comparePrice - price) / comparePrice) * 100);
};

export const slugify = (str) =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const truncate = (str, length = 80) =>
  str.length > length ? str.slice(0, length) + "..." : str;

export const getRatingLabel = (rating) => {
  if (rating >= 4.8) return "Exceptional";
  if (rating >= 4.5) return "Excellent";
  if (rating >= 4.0) return "Great";
  if (rating >= 3.5) return "Good";
  return "Average";
};

export const generateOrderId = () =>
  `SYT-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;

export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

import React, { useState, useRef, useEffect, useCallback } from "react";
import { X, RotateCw, ZoomIn, ZoomOut, Check, RefreshCw } from "lucide-react";

const ASPECT_OPTIONS = [
  { label: "1:1 Square", value: 1 },
  { label: "4:5 Portrait", value: 4 / 5 },
  { label: "4:3 Landscape", value: 4 / 3 },
  { label: "Original", value: null },
];

export default function ImageCropModal({ isOpen, imageSrc, onCancel, onApply }) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [aspect, setAspect] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });
  const [dragging, setDragging] = useState(false);
  const [applying, setApplying] = useState(false);

  const dragStartRef = useRef({ x: 0, y: 0 });
  const offsetStartRef = useRef({ x: 0, y: 0 });
  const imgRef = useRef(null);

  const VIEWPORT_SIZE = 320;

  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
      setAspect(1);
      setOffset({ x: 0, y: 0 });
      setApplying(false);
    }
  }, [isOpen, imageSrc]);

  const handleImageLoad = (e) => {
    setImgSize({
      width: e.currentTarget.naturalWidth,
      height: e.currentTarget.naturalHeight,
    });
  };

  const getCropBoxDimensions = useCallback(() => {
    const ratio =
      aspect ??
      (imgSize.width && imgSize.height ? imgSize.width / imgSize.height : 1);
    if (ratio >= 1) {
      return { width: VIEWPORT_SIZE, height: Math.round(VIEWPORT_SIZE / ratio) };
    }
    return { width: Math.round(VIEWPORT_SIZE * ratio), height: VIEWPORT_SIZE };
  }, [aspect, imgSize]);

  const cropBox = getCropBoxDimensions();

  const startDrag = (clientX, clientY) => {
    setDragging(true);
    dragStartRef.current = { x: clientX, y: clientY };
    offsetStartRef.current = { ...offset };
  };

  const moveDrag = useCallback(
    (clientX, clientY) => {
      if (!dragging) return;
      setOffset({
        x: offsetStartRef.current.x + (clientX - dragStartRef.current.x),
        y: offsetStartRef.current.y + (clientY - dragStartRef.current.y),
      });
    },
    [dragging]
  );

  const stopDrag = useCallback(() => {
    setDragging(false);
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const onMouseMove = (e) => moveDrag(e.clientX, e.clientY);
    const onTouchMove = (e) => {
      if (e.touches[0]) moveDrag(e.touches[0].clientX, e.touches[0].clientY);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", stopDrag);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", stopDrag);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", stopDrag);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", stopDrag);
    };
  }, [dragging, moveDrag, stopDrag]);

  const handleApplyCrop = async () => {
    if (!imgRef.current) return;
    setApplying(true);

    try {
      const img = imgRef.current;
      const rad = (rotation * Math.PI) / 180;
      const isRotated90 = rotation % 180 !== 0;
      const natW = img.naturalWidth;
      const natH = img.naturalHeight;

      // Base scale to cover the cropBox at zoom = 1
      const effW = isRotated90 ? natH : natW;
      const effH = isRotated90 ? natW : natH;
      const coverScale = Math.max(cropBox.width / effW, cropBox.height / effH);
      const totalScale = coverScale * zoom;

      // Output canvas size (max 900px)
      const maxOut = 900;
      const outScale = Math.min(maxOut / cropBox.width, maxOut / cropBox.height);
      const outW = Math.round(cropBox.width * outScale);
      const outH = Math.round(cropBox.height * outScale);

      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, outW, outH);

      ctx.save();
      ctx.translate(outW / 2 + offset.x * outScale, outH / 2 + offset.y * outScale);
      ctx.rotate(rad);
      ctx.scale(totalScale * outScale, totalScale * outScale);
      ctx.drawImage(img, -natW / 2, -natH / 2, natW, natH);
      ctx.restore();

      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.85)
      );
      const file = blob
        ? new File([blob], `cropped-${Date.now()}.jpg`, { type: "image/jpeg" })
        : null;

      await onApply({ dataUrl, file });
    } catch (err) {
      alert("Could not crop this image. If it is from an external URL, try uploading from your computer.");
    } finally {
      setApplying(false);
    }
  };

  if (!isOpen || !imageSrc) return null;

  const isRotated90 = rotation % 180 !== 0;
  const effW = isRotated90 ? imgSize.height : imgSize.width;
  const effH = isRotated90 ? imgSize.width : imgSize.height;
  const coverScale =
    effW && effH ? Math.max(cropBox.width / effW, cropBox.height / effH) : 1;

  return (
    <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-zinc-950 dark:text-white">
              Crop &amp; Edit Image
            </h3>
            <p className="text-[11px] text-zinc-500">
              Drag to reposition · Scroll or slide to zoom
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
            aria-label="Close cropper"
          >
            <X size={16} />
          </button>
        </div>

        {/* Aspect Ratio Presets */}
        <div className="px-5 pt-3 flex flex-wrap gap-1.5">
          {ASPECT_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => {
                setAspect(opt.value);
                setOffset({ x: 0, y: 0 });
              }}
              className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider border transition-colors ${
                aspect === opt.value
                  ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                  : "bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Crop Viewport */}
        <div className="p-5 flex items-center justify-center bg-zinc-100 dark:bg-zinc-900/70 my-3 mx-5 rounded-xl select-none">
          <div
            style={{ width: cropBox.width, height: cropBox.height }}
            className="relative overflow-hidden border-2 border-white shadow-lg bg-zinc-950 cursor-grab active:cursor-grabbing rounded-sm"
            onMouseDown={(e) => {
              e.preventDefault();
              startDrag(e.clientX, e.clientY);
            }}
            onTouchStart={(e) => {
              if (e.touches[0]) startDrag(e.touches[0].clientX, e.touches[0].clientY);
            }}
          >
            <img
              ref={imgRef}
              src={imageSrc}
              crossOrigin="anonymous"
              alt="Crop preview"
              onLoad={handleImageLoad}
              draggable={false}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                maxWidth: "none",
                maxHeight: "none",
                width: imgSize.width || "auto",
                height: imgSize.height || "auto",
                transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg) scale(${coverScale * zoom})`,
                transformOrigin: "center center",
              }}
            />
            {/* Rule of thirds grid overlay */}
            <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="border border-white/20" />
              ))}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="px-5 pb-4 space-y-3">
          <div className="flex items-center gap-3">
            <ZoomOut size={15} className="text-zinc-500 flex-shrink-0" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full accent-black dark:accent-white"
              aria-label="Zoom image"
            />
            <ZoomIn size={15} className="text-zinc-500 flex-shrink-0" />
            <span className="text-xs font-mono text-zinc-500 w-10 text-right">
              {zoom.toFixed(1)}x
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
              >
                <RotateCw size={13} /> Rotate 90°
              </button>
              <button
                type="button"
                onClick={() => {
                  setZoom(1);
                  setRotation(0);
                  setOffset({ x: 0, y: 0 });
                }}
                className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1.5"
              >
                <RefreshCw size={13} /> Reset
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="btn-secondary text-xs py-2 px-4"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={applying}
                onClick={handleApplyCrop}
                className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
              >
                <Check size={14} /> {applying ? "Applying..." : "Apply Crop"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { useWeb3 } from "@/components/web3/Web3Provider";
import { ethers } from "ethers";
import {
  Package,
  DollarSign,
  Leaf,
  CalendarDays,
  ShieldCheck,
  ImagePlus,
  X,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import styles from "./productNew.module.css";

// Fallback empty contract data if not deployed yet
let contractData = { address: "", abi: [] };
try {
  contractData = require("@/components/web3/contractData.json");
} catch (e) {
  console.warn("Contract data not found. Please deploy the smart contract first.");
}

const UNITS = [
  { value: "kg", label: "Kilogram (kg)" },
  { value: "g", label: "Gram (g)" },
  { value: "litre", label: "Litre (L)" },
  { value: "ml", label: "Millilitre (ml)" },
  { value: "piece", label: "Piece" },
  { value: "dozen", label: "Dozen" },
  { value: "quintal", label: "Quintal" },
  { value: "bundle", label: "Bundle" },
  { value: "crate", label: "Crate" },
];

const QUALITY_GRADES = [
  { value: "Premium", label: "Premium" },
  { value: "Grade A", label: "Grade A" },
  { value: "Grade B", label: "Grade B" },
  { value: "Standard", label: "Standard" },
  { value: "Organic Certified", label: "Organic Certified" },
];

const FARMING_METHODS = [
  { value: "organic", label: "Organic" },
  { value: "conventional", label: "Conventional" },
  { value: "hydroponic", label: "Hydroponic" },
  { value: "natural", label: "Natural Farming" },
  { value: "biodynamic", label: "Biodynamic" },
];

const CERTIFICATION_OPTIONS = [
  "FSSAI",
  "India Organic",
  "APEDA",
  "ISO 22000",
  "Fair Trade",
  "GAP Certified",
];

const WEIGHT_UNITS = [
  { value: "g", label: "g" },
  { value: "kg", label: "kg" },
  { value: "ml", label: "ml" },
  { value: "L", label: "L" },
];

const STEPS = [
  { id: 1, label: "Basic Info", icon: Package },
  { id: 2, label: "Pricing", icon: DollarSign },
  { id: 3, label: "Agriculture", icon: Leaf },
  { id: 4, label: "Dates", icon: CalendarDays },
  { id: 5, label: "Certifications", icon: ShieldCheck },
  { id: 6, label: "Images", icon: ImagePlus },
];

interface FormErrors {
  [key: string]: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const { provider, signer, address, connect, isConnecting } = useWeb3();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [vendorId, setVendorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [categories, setCategories] = useState<any[]>([]);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("1");
  const [unit, setUnit] = useState("kg");
  const [minOrderQty, setMinOrderQty] = useState("1");
  const [qualityGrade, setQualityGrade] = useState("Standard");
  const [farmingMethod, setFarmingMethod] = useState("conventional");
  const [originLocation, setOriginLocation] = useState("");
  const [weightValue, setWeightValue] = useState("");
  const [weightUnit, setWeightUnit] = useState("kg");
  const [harvestDate, setHarvestDate] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [certifications, setCertifications] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("vendor_profiles")
        .select("id")
        .eq("user_id", session.user.id)
        .single();

      if (error || !data) {
        setSubmitError("You must be a registered seller to list products.");
      } else {
        setVendorId(data.id);
      }

      // Fetch categories
      const { data: cats } = await supabase
        .from("categories")
        .select("id, name, slug")
        .order("sort_order", { ascending: true });

      if (cats) setCategories(cats);
    };

    init();
  }, [supabase, router]);

  const getTodayString = () => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  };

  const toggleCertification = (cert: string) => {
    setCertifications((prev) =>
      prev.includes(cert) ? prev.filter((c) => c !== cert) : [...prev, cert]
    );
  };

  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = [...images, ...files].slice(0, 5);
    setImages(newImages);
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Validation per step
  const validateStep = useCallback(
    (step: number): boolean => {
      const newErrors: FormErrors = {};

      switch (step) {
        case 1:
          if (!title.trim()) newErrors.title = "Product title is required";
          else if (title.trim().length < 3) newErrors.title = "Title must be at least 3 characters";
          else if (title.trim().length > 120) newErrors.title = "Title must be under 120 characters";
          if (!description.trim()) newErrors.description = "Description is required";
          else if (description.trim().length < 100)
            newErrors.description = "Description must be at least 100 characters";
          else if (description.trim().length > 2000)
            newErrors.description = "Description must be under 2000 characters";
          if (!categoryId) newErrors.categoryId = "Please select a category";
          break;

        case 2:
          if (!price || parseFloat(price) <= 0)
            newErrors.price = "Price must be greater than 0";
          if (!stock || parseInt(stock) < 1)
            newErrors.stock = "Stock must be at least 1";
          if (minOrderQty && parseInt(minOrderQty) > parseInt(stock))
            newErrors.minOrderQty = "Min order can't exceed stock";
          break;

        case 3:
          // Agricultural details are optional but validate if filled
          if (weightValue && parseFloat(weightValue) <= 0)
            newErrors.weightValue = "Weight must be a positive number";
          break;

        case 4:
          if (harvestDate && new Date(harvestDate) > new Date())
            newErrors.harvestDate = "Harvest date can't be in the future";
          if (expirationDate && new Date(expirationDate) <= new Date())
            newErrors.expirationDate = "Expiration date must be in the future";
          if (
            harvestDate &&
            expirationDate &&
            new Date(expirationDate) <= new Date(harvestDate)
          )
            newErrors.expirationDate = "Expiration must be after harvest date";
          break;

        case 5:
          // Certifications are optional
          break;

        case 6:
          if (images.length === 0)
            newErrors.images = "At least one product image is required";
          break;
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [title, description, categoryId, price, stock, minOrderQty, weightValue, harvestDate, expirationDate, images]
  );

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((s) => Math.min(s + 1, 6));
    }
  };

  const prevStep = () => {
    setErrors({});
    setCurrentStep((s) => Math.max(s - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;
    if (!vendorId) return setSubmitError("Vendor profile not found");
    if (!address || !signer || !provider) {
      connect();
      return;
    }
    if (!contractData.address)
      return setSubmitError("Smart contract not deployed");

    setLoading(true);
    setSubmitError(null);

    try {
      // 1. Upload images to IPFS
      const imageUrls: string[] = [];
      let firstCid = "";

      for (const img of images) {
        const formData = new FormData();
        formData.append("file", img);

        const uploadRes = await fetch("/api/ipfs/upload", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();

        if (!uploadRes.ok) throw new Error(uploadData.error || "IPFS Upload failed");
        imageUrls.push(uploadData.gatewayUrl);
        if (!firstCid) firstCid = uploadData.cid;
      }

      // 2. Call Smart Contract `listProduct`
      const contract = new ethers.Contract(
        contractData.address,
        contractData.abi,
        signer
      );
      const priceWei = ethers.parseEther(price);

      const tx = await contract.listProduct(priceWei, firstCid);
      const receipt = await tx.wait();

      let smartContractProductId = 1;
      try {
        const event = receipt.logs.find((log: any) => {
          try {
            return (
              contract.interface.parseLog({
                topics: [...log.topics],
                data: log.data,
              })?.name === "ProductListed"
            );
          } catch {
            return false;
          }
        });
        if (event) {
          const parsedLog = contract.interface.parseLog({
            topics: [...event.topics],
            data: event.data,
          });
          smartContractProductId = Number(parsedLog?.args[0]);
        }
      } catch (e) {
        console.warn("Could not parse ProductListed event", e);
      }

      // 3. Save to Supabase DB
      const productData: any = {
        vendor_id: vendorId,
        category_id: categoryId || null,
        title: title.trim(),
        description: description.trim(),
        price: parseFloat(price),
        currency: "INR",
        stock_quantity: parseInt(stock),
        unit,
        min_order_qty: parseInt(minOrderQty) || 1,
        quality_grade: qualityGrade,
        farming_method: farmingMethod,
        origin_location: originLocation.trim() || null,
        weight_value: weightValue ? parseFloat(weightValue) : null,
        weight_unit: weightUnit,
        harvest_date: harvestDate || null,
        expiration_date: expirationDate || null,
        certifications,
        image_urls: imageUrls,
        ipfs_origin_cid: firstCid,
        origin_metadata: { smartContractProductId },
      };

      const { error: dbError } = await supabase
        .from("products")
        .insert(productData);

      if (dbError) throw new Error("Database error: " + dbError.message);

      setSuccessMsg("Product listed successfully on the blockchain!");
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setSubmitError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const renderFieldError = (field: string) => {
    if (!errors[field]) return null;
    return (
      <p className={styles.fieldError}>
        <AlertCircle size={14} />
        {errors[field]}
      </p>
    );
  };

  return (
    <div className={styles.page}>
      <div className={`${styles.container} animate-fade-in-up`}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerBadge}>
            <Leaf size={16} />
            Seller Dashboard
          </div>
          <h1 className={styles.title}>List a New Product</h1>
          <p className={styles.subtitle}>
            Add your fresh agricultural produce to the blockchain marketplace.
          </p>
        </div>

        {/* Step Indicators */}
        <div className={styles.stepper}>
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            return (
              <div key={step.id} className={styles.stepItem}>
                <button
                  type="button"
                  className={`${styles.stepBtn} ${isActive ? styles.stepActive : ""} ${isCompleted ? styles.stepDone : ""}`}
                  onClick={() => {
                    // Allow going back freely, forward only if valid
                    if (step.id < currentStep) {
                      setErrors({});
                      setCurrentStep(step.id);
                    }
                  }}
                >
                  {isCompleted ? (
                    <CheckCircle2 size={18} />
                  ) : (
                    <Icon size={18} />
                  )}
                  <span className={styles.stepLabel}>{step.label}</span>
                </button>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`${styles.stepLine} ${isCompleted ? styles.stepLineDone : ""}`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Success Message */}
        {successMsg && (
          <div className={styles.success}>
            <CheckCircle2 size={20} />
            {successMsg}
          </div>
        )}

        {/* Error */}
        {submitError && (
          <div className={styles.error}>
            <AlertCircle size={18} />
            {submitError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className={styles.stepContent}>
              <h2 className={styles.sectionTitle}>Basic Information</h2>
              <p className={styles.sectionDesc}>
                Tell buyers what you&apos;re selling. A clear title and detailed
                description help your product stand out.
              </p>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Product Title <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`${styles.input} ${errors.title ? styles.inputError : ""}`}
                  placeholder="e.g. Organic Alphonso Mangoes — Premium Grade, Ratnagiri"
                  maxLength={120}
                />
                <div className={styles.inputMeta}>
                  {renderFieldError("title")}
                  <span className={styles.charCount}>
                    {title.length}/120
                  </span>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Description <span className={styles.required}>*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`${styles.input} ${styles.textarea} ${errors.description ? styles.inputError : ""}`}
                  placeholder="Describe your product in detail — quality, taste, growing conditions, best uses, storage tips..."
                  maxLength={2000}
                />
                <div className={styles.inputMeta}>
                  {renderFieldError("description")}
                  <span className={styles.charCount}>
                    {description.length}/2000
                  </span>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Category <span className={styles.required}>*</span>
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className={`${styles.input} ${styles.select} ${errors.categoryId ? styles.inputError : ""}`}
                >
                  <option value="">Select a category…</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {renderFieldError("categoryId")}
              </div>
            </div>
          )}

          {/* Step 2: Pricing & Inventory */}
          {currentStep === 2 && (
            <div className={styles.stepContent}>
              <h2 className={styles.sectionTitle}>Pricing & Inventory</h2>
              <p className={styles.sectionDesc}>
                Set competitive pricing and manage your stock levels.
              </p>

              <div className={styles.gridTwo}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Price (₹ INR) <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.inputWithIcon}>
                    <DollarSign size={18} className={styles.inputIcon} />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className={`${styles.input} ${styles.inputIconPad} ${errors.price ? styles.inputError : ""}`}
                      placeholder="250"
                    />
                  </div>
                  {renderFieldError("price")}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Stock Quantity <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className={`${styles.input} ${errors.stock ? styles.inputError : ""}`}
                    placeholder="50"
                  />
                  {renderFieldError("stock")}
                </div>
              </div>

              <div className={styles.gridTwo}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Unit of Measurement</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className={`${styles.input} ${styles.select}`}
                  >
                    {UNITS.map((u) => (
                      <option key={u.value} value={u.value}>
                        {u.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Minimum Order Qty</label>
                  <input
                    type="number"
                    min="1"
                    value={minOrderQty}
                    onChange={(e) => setMinOrderQty(e.target.value)}
                    className={`${styles.input} ${errors.minOrderQty ? styles.inputError : ""}`}
                    placeholder="1"
                  />
                  {renderFieldError("minOrderQty")}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Agricultural Details */}
          {currentStep === 3 && (
            <div className={styles.stepContent}>
              <h2 className={styles.sectionTitle}>Agricultural Details</h2>
              <p className={styles.sectionDesc}>
                Help buyers understand the quality and origin of your produce.
              </p>

              <div className={styles.gridTwo}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Quality Grade</label>
                  <select
                    value={qualityGrade}
                    onChange={(e) => setQualityGrade(e.target.value)}
                    className={`${styles.input} ${styles.select}`}
                  >
                    {QUALITY_GRADES.map((g) => (
                      <option key={g.value} value={g.value}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Farming Method</label>
                  <select
                    value={farmingMethod}
                    onChange={(e) => setFarmingMethod(e.target.value)}
                    className={`${styles.input} ${styles.select}`}
                  >
                    {FARMING_METHODS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Origin / Farm Location</label>
                <input
                  type="text"
                  value={originLocation}
                  onChange={(e) => setOriginLocation(e.target.value)}
                  className={styles.input}
                  placeholder="e.g. Nashik, Maharashtra"
                />
                <p className={styles.helpText}>
                  Where was this product grown or produced?
                </p>
              </div>

              <div className={styles.gridTwo}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Net Weight / Volume</label>
                  <div className={styles.compoundInput}>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={weightValue}
                      onChange={(e) => setWeightValue(e.target.value)}
                      className={`${styles.input} ${styles.compoundMain} ${errors.weightValue ? styles.inputError : ""}`}
                      placeholder="1.0"
                    />
                    <select
                      value={weightUnit}
                      onChange={(e) => setWeightUnit(e.target.value)}
                      className={`${styles.input} ${styles.compoundSuffix}`}
                    >
                      {WEIGHT_UNITS.map((u) => (
                        <option key={u.value} value={u.value}>
                          {u.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {renderFieldError("weightValue")}
                </div>
                <div />
              </div>
            </div>
          )}

          {/* Step 4: Dates & Freshness */}
          {currentStep === 4 && (
            <div className={styles.stepContent}>
              <h2 className={styles.sectionTitle}>Dates & Freshness</h2>
              <p className={styles.sectionDesc}>
                Freshness matters. Let buyers know when your product was
                harvested and its shelf life.
              </p>

              <div className={styles.gridTwo}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Harvest Date</label>
                  <input
                    type="date"
                    value={harvestDate}
                    max={getTodayString()}
                    onChange={(e) => setHarvestDate(e.target.value)}
                    className={`${styles.input} ${errors.harvestDate ? styles.inputError : ""}`}
                  />
                  {renderFieldError("harvestDate")}
                  <p className={styles.helpText}>When was this produce harvested?</p>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Expiration / Best Before</label>
                  <input
                    type="date"
                    value={expirationDate}
                    min={getTodayString()}
                    onChange={(e) => setExpirationDate(e.target.value)}
                    className={`${styles.input} ${errors.expirationDate ? styles.inputError : ""}`}
                  />
                  {renderFieldError("expirationDate")}
                  <p className={styles.helpText}>When does this product expire?</p>
                </div>
              </div>

              {(harvestDate || expirationDate) && (
                <div className={styles.freshnessPreview}>
                  <p className={styles.previewLabel}>Freshness Preview:</p>
                  <div className={styles.previewBadge}>
                    {(() => {
                      // Inline freshness preview
                      const now = new Date();
                      if (harvestDate) {
                        const days = Math.floor(
                          (now.getTime() - new Date(harvestDate).getTime()) /
                            (1000 * 60 * 60 * 24)
                        );
                        if (days <= 7) return <span className={styles.previewFresh}>🟢 Fresh — {days}d since harvest</span>;
                        if (days <= 30) return <span className={styles.previewGood}>🟡 Good — {days}d since harvest</span>;
                        return <span className={styles.previewFair}>🟠 Fair — {days}d since harvest</span>;
                      }
                      if (expirationDate) {
                        const days = Math.ceil(
                          (new Date(expirationDate).getTime() - now.getTime()) /
                            (1000 * 60 * 60 * 24)
                        );
                        if (days <= 3) return <span className={styles.previewExpiring}>🔴 Expiring in {days}d</span>;
                        return <span className={styles.previewGood}>✅ {days} days until expiry</span>;
                      }
                      return null;
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 5: Certifications */}
          {currentStep === 5 && (
            <div className={styles.stepContent}>
              <h2 className={styles.sectionTitle}>Certifications</h2>
              <p className={styles.sectionDesc}>
                Select any certifications your product holds. Certified
                products build buyer trust.
              </p>

              <div className={styles.certGrid}>
                {CERTIFICATION_OPTIONS.map((cert) => (
                  <button
                    key={cert}
                    type="button"
                    className={`${styles.certChip} ${certifications.includes(cert) ? styles.certSelected : ""}`}
                    onClick={() => toggleCertification(cert)}
                  >
                    {certifications.includes(cert) ? (
                      <CheckCircle2 size={16} />
                    ) : (
                      <ShieldCheck size={16} />
                    )}
                    {cert}
                  </button>
                ))}
              </div>

              {certifications.length > 0 && (
                <p className={styles.certCount}>
                  {certifications.length} certification{certifications.length > 1 ? "s" : ""} selected
                </p>
              )}
            </div>
          )}

          {/* Step 6: Product Images */}
          {currentStep === 6 && (
            <div className={styles.stepContent}>
              <h2 className={styles.sectionTitle}>Product Images</h2>
              <p className={styles.sectionDesc}>
                Upload up to 5 high-quality images. The first image will be
                your hero/primary image.
              </p>

              {/* Image previews grid */}
              {images.length > 0 && (
                <div className={styles.imageGrid}>
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className={`${styles.imagePreviewCard} ${idx === 0 ? styles.imagePrimary : ""}`}
                    >
                      <img
                        src={URL.createObjectURL(img)}
                        alt={`Preview ${idx + 1}`}
                        className={styles.previewImg}
                      />
                      {idx === 0 && (
                        <span className={styles.primaryLabel}>Primary</span>
                      )}
                      <button
                        type="button"
                        className={styles.removeImgBtn}
                        onClick={() => removeImage(idx)}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload area */}
              {images.length < 5 && (
                <div className={styles.fileArea}>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    multiple
                    onChange={handleImageAdd}
                    className={styles.fileInput}
                  />
                  <div style={{ pointerEvents: "none" }}>
                    <div className={styles.fileIcon}>
                      <ImagePlus size={28} />
                    </div>
                    <p className={styles.fileName}>
                      Click to upload or drag and drop
                    </p>
                    <p className={styles.fileSub}>
                      PNG, JPG, WebP up to 5MB each •{" "}
                      {5 - images.length} slot{5 - images.length !== 1 ? "s" : ""} remaining
                    </p>
                  </div>
                </div>
              )}
              {renderFieldError("images")}
            </div>
          )}

          {/* Navigation Footer */}
          <div className={styles.footer}>
            <div className={styles.footerLeft}>
              {currentStep > 1 && (
                <button
                  type="button"
                  className={styles.backBtn}
                  onClick={prevStep}
                >
                  Back
                </button>
              )}
            </div>

            <div className={styles.footerRight}>
              {currentStep < 6 ? (
                <button
                  type="button"
                  className={styles.nextBtn}
                  onClick={nextStep}
                >
                  Continue
                  <ChevronRight size={18} />
                </button>
              ) : !address ? (
                <button
                  type="button"
                  onClick={connect}
                  disabled={isConnecting}
                  className={styles.walletBtn}
                >
                  {isConnecting ? "Connecting..." : "🦊 Connect MetaMask"}
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading || !vendorId}
                  className={styles.submitBtn}
                >
                  {loading ? (
                    <>
                      <div className={styles.spinner}></div>
                      Listing on Blockchain...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={18} />
                      List Product
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import {
  Search,
  MapPin,
  Star,
  SlidersHorizontal,
  X,
  ChevronDown,
  Leaf,
  ShieldCheck,
  Package,
  Filter,
} from "lucide-react";
import FreshnessIndicator from "@/components/products/FreshnessIndicator";
import BackButton from "@/components/ui/BackButton";
import styles from "./marketplace.module.css";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "freshest", label: "Freshest" },
];

const QUALITY_GRADES = ["Premium", "Grade A", "Grade B", "Standard", "Organic Certified"];
const FARMING_METHODS = [
  { value: "organic", label: "Organic" },
  { value: "conventional", label: "Conventional" },
  { value: "hydroponic", label: "Hydroponic" },
  { value: "natural", label: "Natural" },
  { value: "biodynamic", label: "Biodynamic" },
];

export default function MarketplacePage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [selectedMethods, setSelectedMethods] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const [productsRes, catsRes] = await Promise.all([
        supabase
          .from("products")
          .select(
            `*, vendor_profiles ( business_name, location ), categories ( name, slug )`
          )
          .eq("is_active", true)
          .order("created_at", { ascending: false }),
        supabase
          .from("categories")
          .select("id, name, slug")
          .order("sort_order", { ascending: true }),
      ]);

      if (productsRes.error) {
        setError("Failed to load products.");
      } else {
        setProducts(productsRes.data || []);
      }

      if (catsRes.data) setCategories(catsRes.data);
      setLoading(false);
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.origin_location?.toLowerCase().includes(q)
      );
    }

    // Category
    if (selectedCategory) {
      filtered = filtered.filter((p) => p.category_id === selectedCategory);
    }

    // Quality grades
    if (selectedGrades.length > 0) {
      filtered = filtered.filter((p) =>
        selectedGrades.includes(p.quality_grade)
      );
    }

    // Farming methods
    if (selectedMethods.length > 0) {
      filtered = filtered.filter((p) =>
        selectedMethods.includes(p.farming_method)
      );
    }

    // Price range
    if (priceMin) {
      filtered = filtered.filter((p) => p.price >= parseFloat(priceMin));
    }
    if (priceMax) {
      filtered = filtered.filter((p) => p.price <= parseFloat(priceMax));
    }

    // Sort
    switch (sortBy) {
      case "price_asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => (b.rating_avg || 0) - (a.rating_avg || 0));
        break;
      case "freshest":
        filtered.sort((a, b) => {
          const dateA = a.harvest_date ? new Date(a.harvest_date).getTime() : 0;
          const dateB = b.harvest_date ? new Date(b.harvest_date).getTime() : 0;
          return dateB - dateA;
        });
        break;
      default:
        filtered.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }

    return filtered;
  }, [products, searchQuery, selectedCategory, selectedGrades, selectedMethods, sortBy, priceMin, priceMax]);

  const toggleGrade = (grade: string) => {
    setSelectedGrades((prev) =>
      prev.includes(grade) ? prev.filter((g) => g !== grade) : [...prev, grade]
    );
  };

  const toggleMethod = (method: string) => {
    setSelectedMethods((prev) =>
      prev.includes(method)
        ? prev.filter((m) => m !== method)
        : [...prev, method]
    );
  };

  const activeFilterCount =
    (selectedCategory ? 1 : 0) +
    selectedGrades.length +
    selectedMethods.length +
    (priceMin ? 1 : 0) +
    (priceMax ? 1 : 0);

  const clearAllFilters = () => {
    setSelectedCategory("");
    setSelectedGrades([]);
    setSelectedMethods([]);
    setPriceMin("");
    setPriceMax("");
    setSearchQuery("");
  };

  // Skeleton cards for loading state
  const SkeletonCard = () => (
    <div className={styles.skeletonCard}>
      <div className={styles.skeletonImg} />
      <div className={styles.skeletonBody}>
        <div className={styles.skeletonLine} style={{ width: "75%" }} />
        <div className={styles.skeletonLine} style={{ width: "50%" }} />
        <div className={styles.skeletonLine} style={{ width: "35%" }} />
      </div>
    </div>
  );

  return (
    <div className={styles.page}>
      {/* Header / Search Bar */}
      <div className={styles.header}>
        <div className={styles.headerContainer}>
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <BackButton fallback="/dashboard" label="Back to Dashboard" />
            </div>
            <div className={styles.badge}>
              <span className={styles.pulseWrap}>
                <span className={styles.pulseBg}></span>
                <span className={styles.pulseDot}></span>
              </span>
              Live Network
            </div>
            <h1 className={styles.title}>Marketplace</h1>
            <p className={styles.subtitle}>
              Discover fresh, blockchain-verified agricultural products directly
              from farmers.
            </p>
          </div>

          <div className={styles.searchAndSort}>
            <div className={styles.searchForm}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, farms, locations..."
                className={styles.searchInput}
              />
              <Search className={styles.searchIcon} size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Category Chips + Controls */}
      <div className={styles.controlsBar}>
        <div className={styles.controlsContainer}>
          {/* Category chips */}
          <div className={styles.categoryChips}>
            <button
              className={`${styles.categoryChip} ${!selectedCategory ? styles.chipActive : ""}`}
              onClick={() => setSelectedCategory("")}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`${styles.categoryChip} ${selectedCategory === cat.id ? styles.chipActive : ""}`}
                onClick={() =>
                  setSelectedCategory(
                    selectedCategory === cat.id ? "" : cat.id
                  )
                }
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className={styles.controlsRight}>
            {/* Sort */}
            <div className={styles.sortWrap}>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={styles.sortSelect}
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className={styles.sortIcon} />
            </div>

            {/* Filter Toggle */}
            <button
              className={`${styles.filterToggle} ${showFilters ? styles.filterToggleActive : ""}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal size={16} />
              Filters
              {activeFilterCount > 0 && (
                <span className={styles.filterBadge}>{activeFilterCount}</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className={styles.filterPanel}>
          <div className={styles.filterContainer}>
            {/* Price Range */}
            <div className={styles.filterSection}>
              <h4 className={styles.filterTitle}>Price Range (₹)</h4>
              <div className={styles.priceInputs}>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  placeholder="Min"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  className={styles.priceInput}
                />
                <span className={styles.priceDash}>—</span>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  placeholder="Max"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  className={styles.priceInput}
                />
              </div>
            </div>

            {/* Quality Grade */}
            <div className={styles.filterSection}>
              <h4 className={styles.filterTitle}>Quality Grade</h4>
              <div className={styles.filterChips}>
                {QUALITY_GRADES.map((grade) => (
                  <button
                    key={grade}
                    className={`${styles.filterChip} ${selectedGrades.includes(grade) ? styles.filterChipActive : ""}`}
                    onClick={() => toggleGrade(grade)}
                  >
                    {grade}
                  </button>
                ))}
              </div>
            </div>

            {/* Farming Method */}
            <div className={styles.filterSection}>
              <h4 className={styles.filterTitle}>Farming Method</h4>
              <div className={styles.filterChips}>
                {FARMING_METHODS.map((m) => (
                  <button
                    key={m.value}
                    className={`${styles.filterChip} ${selectedMethods.includes(m.value) ? styles.filterChipActive : ""}`}
                    onClick={() => toggleMethod(m.value)}
                  >
                    <Leaf size={14} />
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {activeFilterCount > 0 && (
              <button className={styles.clearFilters} onClick={clearAllFilters}>
                <X size={14} />
                Clear all filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Product Grid */}
      <div className={styles.content}>
        {/* Results count */}
        {!loading && !error && (
          <div className={styles.resultsBar}>
            <p className={styles.resultsCount}>
              <strong>{filteredProducts.length}</strong>{" "}
              {filteredProducts.length === 1 ? "product" : "products"} found
              {searchQuery && (
                <span>
                  {" "}
                  for &quot;<em>{searchQuery}</em>&quot;
                </span>
              )}
            </p>
          </div>
        )}

        {loading ? (
          <div className={styles.grid}>
            {[...Array(8)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : error ? (
          <div className={styles.errorState}>{error}</div>
        ) : filteredProducts.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <Package size={44} />
            </div>
            <h3 className={styles.emptyTitle}>No products found</h3>
            <p className={styles.emptyText}>
              {activeFilterCount > 0
                ? "Try adjusting your filters or search terms."
                : "Check back later for fresh produce from our farmers."}
            </p>
            {activeFilterCount > 0 && (
              <button
                className={styles.emptyClearBtn}
                onClick={clearAllFilters}
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className={styles.grid}>
            {filteredProducts.map((product: any, index: number) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className={styles.cardLink}
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className={styles.card}>
                  <div className={styles.imgWrapper}>
                    {product.image_urls?.[0] ? (
                      <img
                        src={product.image_urls[0]}
                        alt={product.title}
                        className={styles.img}
                      />
                    ) : (
                      <div className={styles.noImg}>No Image</div>
                    )}
                    <div className={styles.gradientOverlay}></div>

                    {/* Category overlay badge */}
                    {product.categories?.name && (
                      <span className={styles.categoryOverlay}>
                        {product.categories.name}
                      </span>
                    )}

                    {/* Quality grade badge */}
                    {product.quality_grade &&
                      product.quality_grade !== "Standard" && (
                        <span className={styles.gradeOverlay}>
                          {product.quality_grade}
                        </span>
                      )}
                  </div>

                  <div className={styles.cardBody}>
                    {/* Freshness indicator */}
                    <div className={styles.freshnessRow}>
                      <FreshnessIndicator
                        harvestDate={product.harvest_date}
                        expirationDate={product.expiration_date}
                        size="sm"
                      />
                    </div>

                    <div className={styles.cardTitleWrap}>
                      <h3 className={styles.cardTitle}>{product.title}</h3>
                    </div>

                    <div className={styles.meta}>
                      <div className={styles.rating}>
                        <Star
                          size={14}
                          fill={
                            product.rating_avg > 0 ? "currentColor" : "none"
                          }
                          color={
                            product.rating_avg > 0 ? "#facc15" : "#cbd5e1"
                          }
                        />
                        <span
                          className={
                            product.rating_avg > 0 ? styles.ratingValue : ""
                          }
                        >
                          {product.rating_avg > 0
                            ? Number(product.rating_avg).toFixed(1)
                            : "New"}
                        </span>
                        {product.review_count > 0 && (
                          <span className={styles.reviewCount}>
                            ({product.review_count})
                          </span>
                        )}
                      </div>

                      {(product.origin_location ||
                        product.vendor_profiles?.location) && (
                        <div className={styles.location}>
                          <MapPin size={12} />
                          <span>
                            {product.origin_location ||
                              product.vendor_profiles?.location ||
                              "India"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Farming method tag */}
                    {product.farming_method &&
                      product.farming_method !== "conventional" && (
                        <div className={styles.methodTag}>
                          <Leaf size={12} />
                          {product.farming_method.charAt(0).toUpperCase() +
                            product.farming_method.slice(1)}
                        </div>
                      )}

                    <div className={styles.cardFooter}>
                      <div className={styles.seller}>
                        <div className={styles.sellerAvatar}>
                          {product.vendor_profiles?.business_name?.charAt(0) ||
                            "F"}
                        </div>
                        <span className={styles.sellerName}>
                          {product.vendor_profiles?.business_name ||
                            "Unknown Seller"}
                        </span>
                      </div>
                      <div className={styles.priceWrap}>
                        <span className={styles.priceValue}>
                          ₹{product.price}
                        </span>
                        <span className={styles.priceUnit}>
                          
                          {product.unit && product.unit !== "piece"
                            ? ` / ${product.unit}`
                            : ""}
                        </span>
                      </div>
                    </div>

                    {/* Stock urgency */}
                    {product.stock_quantity > 0 &&
                      product.stock_quantity <= 10 && (
                        <p className={styles.stockUrgency}>
                          Only {product.stock_quantity} left — order soon!
                        </p>
                      )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

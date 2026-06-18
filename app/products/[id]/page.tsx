import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Link from "next/link";
import BuyNowButton from "@/components/products/BuyNowButton";
import FreshnessIndicator from "@/components/products/FreshnessIndicator";
import BackButton from "@/components/ui/BackButton";
import DeleteProductButton from "@/components/products/DeleteProductButton";
import {
  MapPin,
  ShieldCheck,
  Star,
  ChevronRight,
  Leaf,
  Calendar,
  Package,
  Award,
  Scale,
  AlertTriangle,
} from "lucide-react";
import styles from "./productDetail.module.css";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const { data: product, error } = await supabase
    .from("products")
    .select(
      `
      *,
      vendor_profiles ( user_id, business_name, description, location, business_type, rating_avg, verified ),
      categories ( name, slug ),
      reviews (
        id, rating, comment, created_at, profiles ( full_name )
      )
    `
    )
    .eq("id", id)
    .single();

  if (error || !product) {
    return (
      <div className={styles.notFound}>
        <div className={styles.notFoundCard}>
          <div className={styles.notFoundIcon}>
            <Package size={40} />
          </div>
          <h1 className={styles.notFoundTitle}>Product not found</h1>
          <p className={styles.notFoundText}>
            This item might have been removed or is no longer available.
          </p>
          <Link href="/products" className={styles.notFoundLink}>
            ← Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  // Compute some display values
  const formatDate = (date: string | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const farmingMethodLabel = (method: string | null) => {
    if (!method) return null;
    const labels: Record<string, string> = {
      organic: "Organic",
      conventional: "Conventional",
      hydroponic: "Hydroponic",
      natural: "Natural Farming",
      biodynamic: "Biodynamic",
    };
    return labels[method] || method;
  };

  const heroImage = product.image_urls?.[0];
  const additionalImages = product.image_urls?.slice(1) || [];
  const allImages = product.image_urls || [];
  const isLowStock =
    product.stock_quantity > 0 && product.stock_quantity <= 10;
  const isOutOfStock = product.stock_quantity === 0;

  // Build product attributes for the Amazon-style table
  const attributes: { label: string; value: string; icon: any }[] = [];

  if (product.categories?.name) {
    attributes.push({
      label: "Category",
      value: product.categories.name,
      icon: Package,
    });
  }
  if (product.quality_grade) {
    attributes.push({
      label: "Quality Grade",
      value: product.quality_grade,
      icon: Award,
    });
  }
  if (product.farming_method) {
    attributes.push({
      label: "Farming Method",
      value: farmingMethodLabel(product.farming_method) || product.farming_method,
      icon: Leaf,
    });
  }
  if (product.origin_location) {
    attributes.push({
      label: "Origin",
      value: product.origin_location,
      icon: MapPin,
    });
  }
  if (product.weight_value) {
    attributes.push({
      label: "Net Weight",
      value: `${product.weight_value} ${product.weight_unit || "kg"}`,
      icon: Scale,
    });
  }
  if (product.unit) {
    attributes.push({
      label: "Sold By",
      value: product.unit.charAt(0).toUpperCase() + product.unit.slice(1),
      icon: Package,
    });
  }
  if (product.harvest_date) {
    attributes.push({
      label: "Harvest Date",
      value: formatDate(product.harvest_date) || "",
      icon: Calendar,
    });
  }
  if (product.expiration_date) {
    attributes.push({
      label: "Best Before",
      value: formatDate(product.expiration_date) || "",
      icon: Calendar,
    });
  }
  if (product.certifications && product.certifications.length > 0) {
    attributes.push({
      label: "Certifications",
      value: product.certifications.join(", "),
      icon: ShieldCheck,
    });
  }

  return (
    <div className={styles.page}>
      {/* Top Bar / Breadcrumb */}
      <div className={styles.topBar}>
        <div className={styles.topBarInner}>
          <div className={styles.breadcrumbInner}>
            <BackButton fallback="/products" label="Back to Marketplace" />
            <ChevronRight size={14} className={styles.breadcrumbSep} />
            {product.categories?.name && (
              <>
                <span className={styles.breadcrumbLink}>
                  {product.categories.name}
                </span>
                <ChevronRight size={14} className={styles.breadcrumbSep} />
              </>
            )}
            <span className={styles.breadcrumbCurrent}>{product.title}</span>
          </div>
          
          {user && user.id === product.vendor_profiles?.user_id && (
            <div className={styles.ownerActions}>
              <DeleteProductButton productId={product.id} productTitle={product.title} />
            </div>
          )}
        </div>
      </div>

      <div className={styles.container}>
        {/* Top Section: Image + Details */}
        <div className={styles.splitLayout}>
          {/* Left: Image Gallery */}
          <div className={styles.imageCol}>
            <div className={styles.imageWrapper}>
              {heroImage ? (
                <img
                  src={heroImage}
                  alt={product.title}
                  className={styles.heroImg}
                />
              ) : (
                <div className={styles.noImg}>No Image Available</div>
              )}
              <div className={styles.imgOverlay}></div>
            </div>

            {/* Thumbnail Strip */}
            {allImages.length > 1 && (
              <div className={styles.thumbnailStrip}>
                {allImages.map((url: string, idx: number) => (
                  <div
                    key={idx}
                    className={`${styles.thumbnail} ${idx === 0 ? styles.thumbActive : ""}`}
                  >
                    <img
                      src={url}
                      alt={`${product.title} - ${idx + 1}`}
                      className={styles.thumbImg}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Trust Badges */}
            <div className={styles.trustBadges}>
              <div className={`${styles.badgeItem} ${styles.green}`}>
                <ShieldCheck size={18} />
                <span>Smart Contract Escrow</span>
              </div>
              <div className={styles.divider}></div>
              <div className={styles.badgeItem}>
                <div className={styles.pulseDot}></div>
                Blockchain Verified
              </div>
            </div>
          </div>

          {/* Right: Product Info */}
          <div className={styles.infoCol}>
            {/* Tags row */}
            <div className={styles.topTags}>
              {product.categories?.name && (
                <span className={styles.catTag}>{product.categories.name}</span>
              )}
              {product.quality_grade &&
                product.quality_grade !== "Standard" && (
                  <span className={styles.gradeTag}>
                    {product.quality_grade}
                  </span>
                )}
              {product.farming_method &&
                product.farming_method !== "conventional" && (
                  <span className={styles.methodBadge}>
                    <Leaf size={13} />
                    {farmingMethodLabel(product.farming_method)}
                  </span>
                )}
            </div>

            {/* Title */}
            <h1 className={styles.title}>{product.title}</h1>

            {/* Rating */}
            <div className={styles.ratingRow}>
              <div className={styles.stars}>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    fill={
                      i < Math.round(product.rating_avg || 0)
                        ? "currentColor"
                        : "none"
                    }
                    className={
                      i < Math.round(product.rating_avg || 0)
                        ? styles.starFilled
                        : styles.starEmpty
                    }
                  />
                ))}
              </div>
              <span className={styles.ratingText}>
                {product.rating_avg > 0
                  ? `${Number(product.rating_avg).toFixed(1)}`
                  : "No ratings yet"}
              </span>
              {product.review_count > 0 && (
                <span className={styles.reviewCountText}>
                  ({product.review_count}{" "}
                  {product.review_count === 1 ? "review" : "reviews"})
                </span>
              )}
            </div>

            {/* Freshness */}
            <div className={styles.freshnessRow}>
              <FreshnessIndicator
                harvestDate={product.harvest_date}
                expirationDate={product.expiration_date}
                size="lg"
              />
            </div>

            {/* Price */}
            <div className={styles.priceSection}>
              <div className={styles.priceMain}>
                <span className={styles.priceValue}>₹{product.price}</span>
                <span className={styles.priceCurrency}>INR</span>
                {product.unit && product.unit !== "piece" && (
                  <span className={styles.priceUnit}>/ {product.unit}</span>
                )}
              </div>
              {product.min_order_qty > 1 && (
                <p className={styles.minOrder}>
                  Minimum order: {product.min_order_qty} {product.unit || "units"}
                </p>
              )}
            </div>

            {/* Stock Status */}
            <div className={styles.stockSection}>
              {isOutOfStock ? (
                <div className={styles.outOfStock}>
                  <AlertTriangle size={16} />
                  Currently out of stock
                </div>
              ) : isLowStock ? (
                <div className={styles.lowStock}>
                  <AlertTriangle size={16} />
                  Only {product.stock_quantity} left in stock — order soon!
                </div>
              ) : (
                <div className={styles.inStock}>
                  <ShieldCheck size={16} />
                  In Stock
                </div>
              )}
            </div>

            {/* Buy Section */}
            <div className={styles.buySection}>
              <BuyNowButton product={product} />
            </div>

            {/* Seller Info */}
            <div className={styles.sellerSection}>
              <h3 className={styles.sellerLabel}>Verified Seller</h3>
              <div className={styles.sellerCard}>
                <div className={styles.sellerAvatar}>
                  {product.vendor_profiles?.business_name?.charAt(0) || "S"}
                </div>
                <div className={styles.sellerInfo}>
                  <div className={styles.sellerName}>
                    {product.vendor_profiles?.business_name || "Unknown Seller"}
                    {product.vendor_profiles?.verified && (
                      <ShieldCheck
                        size={14}
                        className={styles.verifiedIcon}
                      />
                    )}
                  </div>
                  <div className={styles.sellerDesc}>
                    {product.vendor_profiles?.description ||
                      "Sustainable Farming Partner"}
                  </div>
                  {product.vendor_profiles?.location && (
                    <div className={styles.sellerLocation}>
                      <MapPin size={12} />
                      {product.vendor_profiles.location}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Section */}
        <div className={styles.detailsGrid}>
          {/* Attributes Table */}
          {attributes.length > 0 && (
            <div className={styles.attributesCard}>
              <h2 className={styles.detailsTitle}>Product Details</h2>
              <table className={styles.attrTable}>
                <tbody>
                  {attributes.map((attr, idx) => {
                    const Icon = attr.icon;
                    return (
                      <tr key={idx} className={styles.attrRow}>
                        <td className={styles.attrLabel}>
                          <Icon size={15} className={styles.attrIcon} />
                          {attr.label}
                        </td>
                        <td className={styles.attrValue}>{attr.value}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* About This Product */}
          <div className={styles.aboutCard}>
            <h2 className={styles.detailsTitle}>About This Product</h2>
            <div className={styles.aboutContent}>
              {product.description?.split("\n").map((para: string, i: number) => (
                <p key={i} className={styles.aboutParagraph}>
                  {para}
                </p>
              ))}
            </div>

            {product.certifications && product.certifications.length > 0 && (
              <div className={styles.certBadges}>
                {product.certifications.map((cert: string, idx: number) => (
                  <span key={idx} className={styles.certBadge}>
                    <ShieldCheck size={13} />
                    {cert}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className={styles.reviewsSection}>
          <div className={styles.reviewsHeader}>
            <h2 className={styles.reviewsTitle}>Customer Reviews</h2>
            <p className={styles.reviewsSubtitle}>
              Verified experiences from the FarmDirect community.
            </p>
          </div>

          {product.reviews && product.reviews.length > 0 ? (
            <div className={styles.reviewsGrid}>
              {product.reviews.map((review: any, index: number) => (
                <div
                  key={review.id}
                  className={styles.reviewCard}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={styles.reviewHead}>
                    <div className={styles.reviewer}>
                      <div className={styles.reviewerAvatar}>
                        {(review.profiles?.full_name || "A").charAt(0)}
                      </div>
                      <div className={styles.reviewerName}>
                        {review.profiles?.full_name || "Anonymous"}
                      </div>
                    </div>
                    <div className={styles.reviewStars}>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={
                            i < review.rating
                              ? styles.starFilled
                              : styles.starEmpty
                          }
                          fill="currentColor"
                        />
                      ))}
                    </div>
                  </div>
                  <p className={styles.reviewText}>{review.comment}</p>
                  <div className={styles.reviewDate}>
                    {new Date(review.created_at).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyReviews}>
              <div className={styles.emptyRevIcon}>
                <Star size={24} color="#cbd5e1" />
              </div>
              <h3 className={styles.emptyRevTitle}>No reviews yet</h3>
              <p className={styles.emptyRevText}>
                Be the first to review this product after your purchase!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

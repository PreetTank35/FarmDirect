import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import BuyNowButton from "@/components/products/BuyNowButton";
import { MapPin, ShieldCheck, Star } from "lucide-react";
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

  const { data: product, error } = await supabase
    .from("products")
    .select(`
      *,
      vendor_profiles ( business_name, description, location ),
      reviews (
        id, rating, comment, created_at, profiles ( full_name )
      )
    `)
    .eq("id", id)
    .single();

  if (error || !product) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-neutral-500)' }}>
        <h1 style={{ fontSize: '1.5rem', color: 'var(--color-neutral-900)' }}>Product not found</h1>
        <p>This item might have been removed or is no longer available.</p>
        <Link href="/products" style={{ color: 'var(--color-primary-600)', marginTop: '1rem', display: 'inline-block' }}>Back to Marketplace</Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        
        {/* Top Section: Image and Details */}
        <div className={styles.splitLayout}>
          
          {/* Image */}
          <div className={styles.imageCol}>
            <div className={styles.imageWrapper}>
              {product.image_urls?.[0] ? (
                <img 
                  src={product.image_urls[0]} 
                  alt={product.title} 
                  className={styles.img}
                />
              ) : (
                <div className={styles.noImg}>No Image</div>
              )}
              {/* Subtle inner gradient */}
              <div className={styles.imgOverlay}></div>
            </div>
            
            {/* Trust Badges */}
            <div className={styles.trustBadges}>
              <div className={`${styles.badgeItem} ${styles.green}`}>
                <ShieldCheck size={20} />
                <span>Smart Contract Escrow</span>
              </div>
              <div className={styles.divider}></div>
              <div className={styles.badgeItem}>
                <div className={styles.pulseDot}></div>
                Blockchain Verified
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className={styles.infoCol}>
            <div className={styles.metaTags}>
              <div className={styles.metaTag}>
                <MapPin size={16} color="#94a3b8" />
                <span>{product.vendor_profiles?.location || "India"}</span>
              </div>
              <div className={`${styles.metaTag} ${styles.rating}`}>
                <Star size={14} fill="currentColor" />
                {product.rating_avg > 0 ? product.rating_avg : "New"}
              </div>
            </div>
            
            <h1 className={styles.title}>{product.title}</h1>
            
            <div className={styles.priceWrap}>
              <div className={styles.price}>
                {product.price}
              </div>
              <div className={styles.currency}>ETH</div>
            </div>

            <div className={styles.description}>
              <p>{product.description}</p>
            </div>

            <div className={styles.actions}>
              <div className={styles.sellerSection}>
                <h3 className={styles.sellerLabel}>Verified Seller</h3>
                <div className={styles.sellerCard}>
                  <div className={styles.sellerAvatar}>
                    {product.vendor_profiles?.business_name?.charAt(0) || "S"}
                  </div>
                  <div>
                    <div className={styles.sellerName}>{product.vendor_profiles?.business_name || "Unknown Seller"}</div>
                    <div className={styles.sellerDesc}>{product.vendor_profiles?.description || "Sustainable Farming Partner"}</div>
                  </div>
                </div>
              </div>

              <div className={styles.buyBtnWrapper}>
                <BuyNowButton product={product} />
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className={styles.reviewsSection}>
          <div className={styles.reviewsHeader}>
            <h2 className={styles.reviewsTitle}>Customer Reviews</h2>
            <p className={styles.reviewsSubtitle}>Verified experiences from the FarmDirect community.</p>
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
                      <div className={styles.reviewerName}>{review.profiles?.full_name || "Anonymous"}</div>
                    </div>
                    <div className={styles.stars}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} className={i < review.rating ? styles.starFilled : styles.starEmpty} fill="currentColor" />
                      ))}
                    </div>
                  </div>
                  <p className={styles.reviewText}>{review.comment}</p>
                  <div className={styles.reviewDate}>
                    {new Date(review.created_at).toLocaleDateString()}
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
              <p className={styles.emptyRevText}>Be the first to review this product after your purchase!</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

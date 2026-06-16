import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import Link from "next/link";
import { Search, MapPin, Star } from "lucide-react";

import styles from "./marketplace.module.css";

export const revalidate = 0; // Disable static rendering for this page to always show fresh products

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
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

  const query = searchParams.q || "";

  let dbQuery = supabase
    .from("products")
    .select(`
      *,
      vendor_profiles (
        business_name,
        location
      )
    `)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (query) {
    dbQuery = dbQuery.ilike("title", `%${query}%`);
  }

  const { data: products, error } = await dbQuery;

  return (
    <div className={styles.page}>
      {/* Header / Search Bar */}
      <div className={styles.header}>
        <div className={styles.headerContainer}>
          <div>
            <div className={styles.badge}>
              <span className={styles.pulseWrap}>
                <span className={styles.pulseBg}></span>
                <span className={styles.pulseDot}></span>
              </span>
              Live Network
            </div>
            <h1 className={styles.title}>Marketplace</h1>
            <p className={styles.subtitle}>Discover fresh, blockchain-verified products directly from sellers.</p>
          </div>
          
          <form className={styles.searchForm} method="GET" action="/products">
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search products..."
              className={styles.searchInput}
            />
            <Search className={styles.searchIcon} size={22} />
          </form>
        </div>
      </div>

      {/* Product Grid */}
      <div className={styles.content}>
        {error ? (
          <div className={styles.error}>Failed to load products.</div>
        ) : products?.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <Search size={40} />
            </div>
            <h3 className={styles.emptyTitle}>No products found</h3>
            <p className={styles.emptyText}>Try adjusting your search terms or checking back later.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {products?.map((product: any, index: number) => (
              <Link 
                key={product.id} 
                href={`/products/${product.id}`} 
                className={styles.cardLink}
                style={{ animationDelay: `${index * 100}ms` }}
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
                      <div className={styles.noImg}>
                        No Image
                      </div>
                    )}
                    <div className={styles.gradientOverlay}></div>
                  </div>
                  
                  <div className={styles.cardBody}>
                    <div className={styles.cardTitleWrap}>
                      <h3 className={styles.cardTitle}>{product.title}</h3>
                    </div>
                    
                    <div className={styles.meta}>
                      <div className={styles.rating}>
                        <Star size={16} fill={product.rating_avg > 0 ? "currentColor" : "none"} color={product.rating_avg > 0 ? "#facc15" : "#cbd5e1"} />
                        <span className={product.rating_avg > 0 ? styles.ratingValue : ""}>{product.rating_avg > 0 ? product.rating_avg : "New"}</span>
                      </div>
                      <div className={styles.location}>
                        <MapPin size={14} color="#94a3b8" />
                        <span>{product.vendor_profiles?.location || "India"}</span>
                      </div>
                    </div>

                    <div className={styles.footer}>
                      <div className={styles.seller}>
                        <div className={styles.sellerAvatar}>
                          {product.vendor_profiles?.business_name?.charAt(0) || "U"}
                        </div>
                        <span className={styles.sellerName}>{product.vendor_profiles?.business_name || "Unknown Seller"}</span>
                      </div>
                      <div className={styles.priceWrap}>
                        {product.price} <span className={styles.priceCurrency}>ETH</span>
                      </div>
                    </div>
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

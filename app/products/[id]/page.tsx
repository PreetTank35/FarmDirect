import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import BuyNowButton from "@/components/products/BuyNowButton";
import { MapPin, ShieldCheck, Star } from "lucide-react";

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
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
      vendor_profiles (
        business_name,
        location,
        description
      ),
      reviews (
        id,
        rating,
        comment,
        created_at,
        profiles ( full_name )
      )
    `)
    .eq("id", params.id)
    .single();

  if (error || !product) {
    notFound();
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Top Section: Image and Details */}
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Image */}
          <div className="lg:w-1/2">
            <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden border border-gray-200">
              {product.image_urls?.[0] ? (
                <img 
                  src={product.image_urls[0]} 
                  alt={product.title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
              )}
            </div>
            
            {/* Trust Badges */}
            <div className="mt-6 flex items-center gap-4 text-sm text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex items-center gap-1.5 text-green-700 font-medium">
                <ShieldCheck size={18} />
                <span>Smart Contract Escrow</span>
              </div>
              <div className="w-px h-4 bg-gray-300"></div>
              <span>Blockchain Verified</span>
            </div>
          </div>

          {/* Product Info */}
          <div className="lg:w-1/2 flex flex-col">
            <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
              <MapPin size={16} />
              <span>{product.vendor_profiles?.location || "India"}</span>
            </div>
            
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">{product.title}</h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="text-3xl font-bold text-green-700">{product.price} ETH</div>
              <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2.5 py-1 rounded-full text-sm font-medium border border-yellow-200">
                <Star size={14} className="fill-yellow-500 text-yellow-500" />
                {product.rating_avg > 0 ? product.rating_avg : "New"}
              </div>
            </div>

            <div className="prose prose-green text-gray-600 mb-8 max-w-none">
              <p>{product.description}</p>
            </div>

            <div className="mt-auto pt-8 border-t border-gray-100">
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Sold By</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 text-green-700 flex items-center justify-center rounded-full font-bold text-lg">
                    {product.vendor_profiles?.business_name?.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{product.vendor_profiles?.business_name}</div>
                    <div className="text-sm text-gray-500 line-clamp-1">{product.vendor_profiles?.description || "Verified Farmer"}</div>
                  </div>
                </div>
              </div>

              <BuyNowButton product={product} />
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 border-b border-gray-200 pb-4">Customer Reviews</h2>
          
          {product.reviews && product.reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {product.reviews.map((review: any) => (
                <div key={review.id} className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-semibold text-gray-900">{review.profiles?.full_name || "Anonymous"}</div>
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} className={i < review.rating ? "fill-current" : "text-gray-300"} />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                  <div className="text-xs text-gray-400 mt-4">
                    {new Date(review.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
              <h3 className="text-lg font-medium text-gray-900">No reviews yet</h3>
              <p className="text-gray-500 mt-1">Be the first to review this product after purchase!</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

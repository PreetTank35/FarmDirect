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
    <div className="bg-gray-50/50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in-up">
        
        {/* Top Section: Image and Details */}
        <div className="flex flex-col lg:flex-row gap-16 glass rounded-[3rem] p-8 lg:p-12 shadow-xl border border-white/60">
          
          {/* Image */}
          <div className="lg:w-1/2">
            <div className="aspect-square bg-gray-100 rounded-[2rem] overflow-hidden border border-gray-200/50 relative shadow-inner group">
              {product.image_urls?.[0] ? (
                <img 
                  src={product.image_urls[0]} 
                  alt={product.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
              )}
              {/* Subtle inner gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
            
            {/* Trust Badges */}
            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-600 bg-white/60 backdrop-blur-sm p-5 rounded-2xl border border-white/80 shadow-sm animate-fade-in delay-2">
              <div className="flex items-center gap-2 text-green-700 font-bold">
                <ShieldCheck size={20} className="text-green-500" />
                <span>Smart Contract Escrow</span>
              </div>
              <div className="w-px h-6 bg-gray-300"></div>
              <div className="font-medium flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                Blockchain Verified
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="lg:w-1/2 flex flex-col justify-center">
            <div className="mb-4 flex items-center gap-3 text-sm text-gray-500 font-medium">
              <div className="flex items-center gap-1.5 bg-gray-100/80 px-3 py-1.5 rounded-lg border border-gray-200/50">
                <MapPin size={16} className="text-gray-400" />
                <span>{product.vendor_profiles?.location || "India"}</span>
              </div>
              <div className="flex items-center gap-1 bg-yellow-50/80 text-yellow-700 px-3 py-1.5 rounded-lg border border-yellow-200/50 font-bold">
                <Star size={14} className="fill-yellow-500 text-yellow-500" />
                {product.rating_avg > 0 ? product.rating_avg : "New"}
              </div>
            </div>
            
            <h1 className="text-5xl font-black text-gray-900 mb-6 tracking-tight leading-tight">{product.title}</h1>
            
            <div className="flex items-end gap-4 mb-8">
              <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-800 tracking-tight">
                {product.price}
              </div>
              <div className="text-xl font-bold text-gray-400 mb-2">ETH</div>
            </div>

            <div className="prose prose-lg prose-green text-gray-600 mb-10 max-w-none leading-relaxed">
              <p>{product.description}</p>
            </div>

            <div className="mt-auto pt-8 border-t border-gray-200/50">
              <div className="mb-8">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Verified Seller</h3>
                <div className="flex items-center gap-4 bg-white/40 p-4 rounded-2xl border border-white/60">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 text-green-800 flex items-center justify-center rounded-xl font-black text-2xl shadow-inner border border-green-300/30">
                    {product.vendor_profiles?.business_name?.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-lg text-gray-900">{product.vendor_profiles?.business_name}</div>
                    <div className="text-sm text-gray-500 font-medium">{product.vendor_profiles?.description || "Sustainable Farming Partner"}</div>
                  </div>
                </div>
              </div>

              <div className="animate-fade-in delay-3">
                <BuyNowButton product={product} />
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-24 max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Customer Reviews</h2>
            <p className="text-gray-500 font-medium">Verified experiences from the FarmDirect community.</p>
          </div>
          
          {product.reviews && product.reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {product.reviews.map((review: any, index: number) => (
                <div 
                  key={review.id} 
                  className={`glass rounded-[2rem] p-8 border border-white/60 shadow-sm hover:shadow-md transition-shadow animate-fade-in-up delay-${Math.min((index % 6) + 1, 6)}`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-sm">
                        {(review.profiles?.full_name || "A").charAt(0)}
                      </div>
                      <div className="font-bold text-gray-900">{review.profiles?.full_name || "Anonymous"}</div>
                    </div>
                    <div className="flex text-yellow-400 bg-yellow-50/50 px-2 py-1 rounded-full">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} className={i < review.rating ? "fill-current" : "text-gray-300"} />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 leading-relaxed font-medium">{review.comment}</p>
                  <div className="text-xs font-bold text-gray-400 mt-6 uppercase tracking-wider">
                    {new Date(review.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 glass rounded-[3rem] border border-white/60 shadow-sm max-w-2xl mx-auto animate-fade-in-up">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star size={24} className="text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">No reviews yet</h3>
              <p className="text-gray-500 mt-2 font-medium">Be the first to review this product after your purchase!</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

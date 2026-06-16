import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import Link from "next/link";
import { Search, MapPin, Star } from "lucide-react";

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
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header / Search Bar */}
      <div className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
              <p className="text-gray-500 mt-1">Discover fresh products directly from sellers.</p>
            </div>
            
            <form className="w-full md:w-96 relative" method="GET" action="/products">
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              />
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            </form>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {error ? (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg">Failed to load products.</div>
        ) : products?.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-lg font-medium text-gray-900">No products found</h3>
            <p className="text-gray-500 mt-1">Try adjusting your search terms.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products?.map((product: any) => (
              <Link key={product.id} href={`/products/${product.id}`} className="group block">
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 transition-all hover:shadow-md hover:-translate-y-1">
                  <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                    {product.image_urls?.[0] ? (
                      <img 
                        src={product.image_urls[0]} 
                        alt={product.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900 line-clamp-1">{product.title}</h3>
                      <span className="font-bold text-green-700 whitespace-nowrap ml-2">
                        {product.price} ETH
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-3 gap-3">
                      <div className="flex items-center gap-1">
                        <Star size={14} className={product.rating_avg > 0 ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
                        <span>{product.rating_avg > 0 ? product.rating_avg : "New"}</span>
                      </div>
                      <div className="flex items-center gap-1 line-clamp-1">
                        <MapPin size={14} />
                        <span>{product.vendor_profiles?.location || "India"}</span>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 border-t border-gray-100 pt-3">
                      By <span className="font-medium text-gray-900">{product.vendor_profiles?.business_name}</span>
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

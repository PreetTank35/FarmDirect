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
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Header / Search Bar */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/60 pt-16 pb-10 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in-down">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider border border-green-200 mb-4">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Live Network
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">Marketplace</h1>
              <p className="text-lg text-gray-500 mt-2 font-medium">Discover fresh, blockchain-verified products directly from sellers.</p>
            </div>
            
            <form className="w-full md:w-96 relative group" method="GET" action="/products">
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Search products..."
                className="w-full pl-12 pr-4 py-3.5 bg-gray-100/50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all shadow-sm group-focus-within:shadow-md"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors" size={22} />
            </form>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {error ? (
          <div className="p-4 bg-red-50/80 border border-red-100 text-red-700 rounded-xl animate-fade-in">Failed to load products.</div>
        ) : products?.length === 0 ? (
          <div className="text-center py-24 glass rounded-3xl animate-fade-in-up border border-white/60">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search size={40} className="text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500">Try adjusting your search terms or checking back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products?.map((product: any, index: number) => (
              <Link 
                key={product.id} 
                href={`/products/${product.id}`} 
                className={`group block animate-fade-in-up delay-${Math.min((index % 6) + 1, 6)}`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100/80 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:border-green-200">
                  <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                    {product.image_urls?.[0] ? (
                      <img 
                        src={product.image_urls[0]} 
                        alt={product.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3 gap-2">
                      <h3 className="font-extrabold text-lg text-gray-900 line-clamp-2 leading-tight group-hover:text-green-700 transition-colors">{product.title}</h3>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-4 gap-4">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Star size={16} className={product.rating_avg > 0 ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
                        <span className={product.rating_avg > 0 ? "text-gray-900" : ""}>{product.rating_avg > 0 ? product.rating_avg : "New"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 line-clamp-1 font-medium bg-gray-50 px-2 py-1 rounded-md">
                        <MapPin size={14} className="text-gray-400" />
                        <span>{product.vendor_profiles?.location || "India"}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">
                          {product.vendor_profiles?.business_name?.charAt(0)}
                        </div>
                        <span className="text-xs font-medium text-gray-600 line-clamp-1 max-w-[100px]">{product.vendor_profiles?.business_name}</span>
                      </div>
                      <div className="font-black text-xl text-green-700">
                        {product.price} <span className="text-sm text-gray-500 font-medium">ETH</span>
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

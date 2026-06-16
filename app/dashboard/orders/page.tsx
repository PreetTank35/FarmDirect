"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Package, ExternalLink, Star } from "lucide-react";
import Link from "next/link";
import ReviewForm from "@/components/reviews/ReviewForm";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  
  const [reviewOrderId, setReviewOrderId] = useState<string | null>(null);
  const [reviewProductId, setReviewProductId] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
        
      setRole(profile?.role || 'customer');

      let query = supabase.from('orders').select(`
        *,
        vendor_profiles ( business_name ),
        profiles ( full_name )
      `).order('created_at', { ascending: false });

      if (profile?.role === 'vendor') {
        const { data: vp } = await supabase
          .from('vendor_profiles')
          .select('id')
          .eq('user_id', session.user.id)
          .single();
          
        if (vp) {
          query = query.eq('vendor_id', vp.id);
        }
      } else {
        query = query.eq('customer_id', session.user.id);
      }

      const { data, error } = await query;
      if (!error && data) {
        setOrders(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading orders...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-10 animate-fade-in-down">
          <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-500/20">
            <Package size={28} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {role === 'vendor' ? "Sales Dashboard" : "My Orders"}
            </h1>
            <p className="text-gray-500 mt-1">Track and manage your blockchain transactions.</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20 glass rounded-3xl border border-white/40 shadow-sm animate-fade-in-up">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500 mb-6">Looks like you haven't made any transactions yet.</p>
            {role !== 'vendor' && (
              <Link href="/products" className="inline-flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-green-500/30">
                Start Shopping →
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order, index) => (
              <div 
                key={order.id} 
                className={`glass rounded-3xl p-6 border border-white/60 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 animate-fade-in-up delay-${Math.min((index % 6) + 1, 6)}`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="font-mono text-sm font-bold text-gray-900 bg-gray-100/80 px-3 py-1 rounded-lg">
                    {order.order_number}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border
                    ${order.status === 'paid' ? 'bg-blue-50/80 text-blue-700 border-blue-200' : 
                      order.status === 'completed' ? 'bg-green-50/80 text-green-700 border-green-200' : 
                      'bg-gray-100 text-gray-700 border-gray-200'}`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center text-sm border-b border-gray-100/50 pb-3">
                    <span className="text-gray-500 font-medium">Date</span>
                    <span className="text-gray-900 font-semibold">{new Date(order.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-gray-100/50 pb-3">
                    <span className="text-gray-500 font-medium">{role === 'vendor' ? 'Buyer' : 'Seller'}</span>
                    <span className="text-gray-900 font-semibold truncate max-w-[150px]">
                      {role === 'vendor' ? order.profiles?.full_name : order.vendor_profiles?.business_name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-medium">Total</span>
                    <span className="text-xl font-black text-green-700">{order.total} ETH</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100/80 flex items-center justify-between mt-auto">
                  {order.blockchain_tx_hash ? (
                    <a 
                      href={`https://etherscan.io/tx/${order.blockchain_tx_hash}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-xs font-semibold text-blue-600 flex items-center gap-1.5 hover:text-blue-800 transition-colors bg-blue-50 px-3 py-1.5 rounded-lg"
                    >
                      <ExternalLink size={14} /> Etherscan
                    </a>
                  ) : <div></div>}

                  {role === 'customer' && order.status === 'paid' && (
                    <button 
                      onClick={() => {
                        setReviewOrderId(order.id);
                        setReviewProductId(order.vendor_id);
                      }}
                      className="text-xs font-bold flex items-center gap-1.5 text-yellow-700 bg-yellow-100 hover:bg-yellow-200 transition-colors px-4 py-2 rounded-lg shadow-sm"
                    >
                      <Star size={14} className="fill-current" />
                      Review
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {reviewOrderId && (
          <ReviewForm 
            orderId={reviewOrderId} 
            productId={reviewProductId || ""} 
            onClose={() => setReviewOrderId(null)} 
            onSuccess={() => {
              setReviewOrderId(null);
              alert("Review submitted successfully!");
              fetchOrders();
            }} 
          />
        )}
      </div>
    </div>
  );
}

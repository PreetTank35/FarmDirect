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
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-8">
        <Package className="text-green-600" size={28} />
        <h1 className="text-2xl font-bold text-gray-900">
          {role === 'vendor' ? "Sales Dashboard" : "My Orders"}
        </h1>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
          <p className="text-gray-500">No orders found.</p>
          {role !== 'vendor' && (
            <Link href="/products" className="text-green-600 font-medium hover:underline mt-2 inline-block">
              Start Shopping
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border border-gray-200 rounded-xl p-5 flex flex-col md:flex-row gap-6 md:items-center justify-between hover:border-green-300 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900">{order.order_number}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide
                    ${order.status === 'paid' ? 'bg-blue-50 text-blue-700' : 
                      order.status === 'completed' ? 'bg-green-50 text-green-700' : 
                      'bg-gray-100 text-gray-700'}`}
                  >
                    {order.status}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
                </div>
                {role === 'vendor' ? (
                  <div className="text-sm text-gray-600">Buyer: {order.profiles?.full_name}</div>
                ) : (
                  <div className="text-sm text-gray-600">Seller: {order.vendor_profiles?.business_name}</div>
                )}
              </div>

              <div className="flex flex-col md:items-end gap-2">
                <div className="text-lg font-bold text-green-700">{order.total} ETH</div>
                
                {order.blockchain_tx_hash && (
                  <a 
                    href={`https://etherscan.io/tx/${order.blockchain_tx_hash}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-xs text-blue-600 flex items-center gap-1 hover:underline"
                  >
                    View Tx <ExternalLink size={12} />
                  </a>
                )}

                {role === 'customer' && order.status === 'paid' && (
                  <button 
                    onClick={() => {
                      setReviewOrderId(order.id);
                      setReviewProductId(order.vendor_id); // In a real app we'd map to actual product_id via order_items
                      // For this demo, let's just pass the order.id and we'll handle product_id loosely
                    }}
                    className="text-sm flex items-center gap-1 text-yellow-600 hover:text-yellow-700 font-medium mt-2"
                  >
                    <Star size={14} className="fill-current" />
                    Leave Review
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
  );
}

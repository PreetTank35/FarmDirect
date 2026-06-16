"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Package, ExternalLink, Star } from "lucide-react";
import Link from "next/link";
import ReviewForm from "@/components/reviews/ReviewForm";
import styles from "./orders.module.css";

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
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-neutral-500)' }}>Loading orders...</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.iconWrap}>
            <Package size={28} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className={styles.title}>
              {role === 'vendor' ? "Sales Dashboard" : "My Orders"}
            </h1>
            <p className={styles.subtitle}>Track and manage your blockchain transactions.</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <Package size={32} />
            </div>
            <h3 className={styles.emptyTitle}>No orders found</h3>
            <p className={styles.emptyText}>Looks like you haven't made any transactions yet.</p>
            {role !== 'vendor' && (
              <Link href="/products" className={styles.shopBtn}>
                Start Shopping →
              </Link>
            )}
          </div>
        ) : (
          <div className={styles.grid}>
            {orders.map((order, index) => (
              <div 
                key={order.id} 
                className={styles.card}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.orderNum}>
                    {order.order_number}
                  </div>
                  <span className={`${styles.status} ${order.status === 'paid' ? styles.statusPaid : order.status === 'completed' ? styles.statusCompleted : styles.statusDefault}`}>
                    {order.status}
                  </span>
                </div>

                <div className={styles.details}>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Date</span>
                    <span className={styles.detailValue}>{new Date(order.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>{role === 'vendor' ? 'Buyer' : 'Seller'}</span>
                    <span className={styles.detailValue}>
                      {role === 'vendor' ? order.profiles?.full_name : order.vendor_profiles?.business_name}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Total</span>
                    <span className={styles.totalValue}>{order.total} ETH</span>
                  </div>
                </div>

                <div className={styles.footer}>
                  {order.blockchain_tx_hash ? (
                    <a 
                      href={`https://etherscan.io/tx/${order.blockchain_tx_hash}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className={styles.txLink}
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
                      className={styles.reviewBtn}
                    >
                      <Star size={14} fill="currentColor" />
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

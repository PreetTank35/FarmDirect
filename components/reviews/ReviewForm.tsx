"use client";

import { useState } from "react";
import { Star, X } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

export default function ReviewForm({ 
  orderId, 
  productId,
  onClose,
  onSuccess
}: { 
  orderId: string;
  productId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      // In a real app we'd get the actual product_id from the order_items table.
      // For this demo, if productId is empty or just vendor ID, we might need to fetch it.
      // Let's look up the product id from order_items if we don't have it.
      let finalProductId = productId;
      if (!finalProductId || finalProductId.length < 10) {
          const { data: orderItems } = await supabase
            .from('order_items')
            .select('product_id')
            .eq('order_id', orderId)
            .limit(1);
          if (orderItems && orderItems.length > 0) {
              finalProductId = orderItems[0].product_id;
          } else {
              // Fallback to getting a product by the vendor_id of the order
              const { data: order } = await supabase.from('orders').select('vendor_id').eq('id', orderId).single();
              if (order) {
                  const { data: product } = await supabase.from('products').select('id').eq('vendor_id', order.vendor_id).limit(1);
                  if (product && product.length > 0) finalProductId = product[0].id;
              }
          }
      }

      if (!finalProductId) throw new Error("Could not determine product to review.");

      const { error: dbError } = await supabase
        .from('reviews')
        .insert({
          product_id: finalProductId,
          customer_id: session.user.id,
          order_id: orderId,
          rating,
          comment,
          verified_purchase: true
        });

      if (dbError) throw new Error(dbError.message);

      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-lg">Write a Review</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</div>}
          
          <div className="mb-6 flex flex-col items-center">
            <div className="text-sm font-medium text-gray-700 mb-2">Overall Rating</div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 focus:outline-none transition-transform hover:scale-110"
                >
                  <Star 
                    size={32} 
                    className={`${(hoverRating || rating) >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} transition-colors`} 
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Review</label>
            <textarea
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="What did you like or dislike? How was the quality?"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      </div>
    </div>
  );
}

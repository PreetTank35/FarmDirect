"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Trash2, AlertTriangle, X } from "lucide-react";
import styles from "./deleteProductButton.module.css";

interface DeleteProductButtonProps {
  productId: string;
  productTitle: string;
}

export default function DeleteProductButton({ productId, productTitle }: DeleteProductButtonProps) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      // Soft delete: set is_active to false
      const { error: dbError } = await supabase
        .from("products")
        .update({ is_active: false })
        .eq("id", productId);

      if (dbError) throw new Error(dbError.message);

      // On success, close modal and redirect to marketplace
      setShowConfirm(false);
      alert("Product successfully removed from marketplace.");
      router.push("/products");
      router.refresh(); // Refresh the data
    } catch (err: any) {
      console.error("Delete error:", err);
      setError(err.message || "Failed to delete product.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button 
        className={styles.deleteBtn} 
        onClick={() => setShowConfirm(true)}
        aria-label="Delete product"
      >
        <Trash2 size={16} />
        Delete Listing
      </button>

      {showConfirm && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <div className={styles.header}>
              <div className={styles.warningIcon}>
                <AlertTriangle size={24} />
              </div>
              <h2 className={styles.title}>Remove Product?</h2>
            </div>
            
            <p className={styles.message}>
              Are you sure you want to remove <strong>{productTitle}</strong> from the marketplace? 
              This will hide the product from buyers, but keep historical order data intact.
            </p>

            {error && <p className={styles.error}>{error}</p>}

            <div className={styles.actions}>
              <button 
                className={styles.cancelBtn} 
                onClick={() => setShowConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                className={styles.confirmBtn} 
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Removing..." : "Yes, Remove It"}
              </button>
            </div>
            
            <button 
              className={styles.closeBtn} 
              onClick={() => setShowConfirm(false)}
              disabled={isDeleting}
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

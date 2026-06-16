"use client";

import { useState } from "react";
import { useWeb3 } from "@/components/web3/Web3Provider";
import { ethers } from "ethers";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { ShoppingBag, Minus, Plus } from "lucide-react";
import styles from "./buyButton.module.css";

let contractData = { address: "", abi: [] };
try {
  contractData = require("@/components/web3/contractData.json");
} catch (e) {
  // Ignore
}

export default function BuyNowButton({ 
  product 
}: { 
  product: any 
}) {
  const router = useRouter();
  const { provider, signer, address, connect } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const totalEth = (product.price * quantity).toFixed(4);

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(q => q - 1);
  };

  const handleIncrease = () => {
    if (quantity < (product.stock_quantity || 99)) setQuantity(q => q + 1);
  };

  const handleBuy = async () => {
    if (!address || !signer || !provider) {
      connect();
      return;
    }
    
    if (!contractData.address) {
      setError("Smart contract not deployed yet.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Get user session to record order
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      // 2. Call Smart Contract
      const contract = new ethers.Contract(contractData.address, contractData.abi, signer);
      const priceWei = ethers.parseEther(totalEth.toString());
      const scProductId = product.origin_metadata?.smartContractProductId || 1;
      
      let txHash;
      try {
        const tx = await contract.buyProduct(scProductId, quantity, { value: priceWei });
        const receipt = await tx.wait();
        txHash = receipt.hash;
      } catch (err: any) {
        console.warn("Contract buy failed, falling back to direct transfer.", err);
        const tx = await signer.sendTransaction({
          to: product.vendor_profiles?.custodial_wallet_address || contractData.address, 
          value: priceWei
        });
        const receipt = await tx.wait();
        txHash = receipt?.hash || tx.hash;
      }

      // 3. Record order in Supabase
      const { data: orderData, error: dbError } = await supabase
        .from("orders")
        .insert({
          customer_id: session.user.id,
          vendor_id: product.vendor_id,
          subtotal: parseFloat(totalEth),
          total: parseFloat(totalEth),
          shipping_address: { address: "123 Buyer St" }, 
          blockchain_tx_hash: txHash,
          status: 'paid'
        })
        .select()
        .single();

      if (dbError) throw new Error("Order save failed: " + dbError.message);

      const { error: itemError } = await supabase
        .from("order_items")
        .insert({
          order_id: orderData.id,
          product_id: product.id,
          quantity: quantity,
          unit_price: product.price
        });

      if (itemError) throw new Error("Order items save failed: " + itemError.message);

      alert("Purchase Successful!");
      router.push("/dashboard/orders");
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Transaction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.quantitySelector}>
        <button onClick={handleDecrease} disabled={quantity <= 1 || loading} className={styles.qtyBtn}>
          <Minus size={16} />
        </button>
        <span className={styles.qtyDisplay}>{quantity}</span>
        <button onClick={handleIncrease} disabled={quantity >= (product.stock_quantity || 99) || loading} className={styles.qtyBtn}>
          <Plus size={16} />
        </button>
      </div>

      <button
        onClick={handleBuy}
        disabled={loading || product.stock_quantity === 0}
        className={styles.button}
      >
        {loading ? (
          <span className={styles.spinner}></span>
        ) : (
          <ShoppingBag size={24} />
        )}
        {loading ? "Processing..." : !address ? "Connect Wallet to Buy" : `Buy Now for ${totalEth} ETH`}
      </button>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}

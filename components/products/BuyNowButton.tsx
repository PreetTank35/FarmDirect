"use client";

import { useState } from "react";
import { useAccount, useWriteContract, useSendTransaction, useConnect } from "wagmi";
import { parseEther } from "viem";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { ShoppingBag, Minus, Plus } from "lucide-react";
import styles from "./buyButton.module.css";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let contractData: { address: `0x${string}`; abi: any[] } = { address: "0x", abi: [] };
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  contractData = require("@/components/web3/contractData.json");
} catch {
  // Contract not deployed yet
}

export default function BuyNowButton({
  product,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  product: any;
}) {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { writeContractAsync } = useWriteContract();
  const { sendTransactionAsync } = useSendTransaction();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const totalEth = (product.price * quantity).toFixed(2);

  const handleDecrease = () => {
    if (quantity > 1) setQuantity((q) => q - 1);
  };

  const handleIncrease = () => {
    if (quantity < (product.stock_quantity || 99)) setQuantity((q) => q + 1);
  };

  const handleBuy = async () => {
    if (!isConnected || !address) {
      if (openConnectModal) {
        openConnectModal();
      } else {
        setError("Please connect your wallet first.");
      }
      return;
    }

    if (!contractData.address || contractData.address === "0x") {
      setError("Smart contract not deployed yet.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Get user session to record order
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      // Convert INR to ETH (approx rate for MVP demo: 1 ETH = ₹300,000)
      const priceInEth = (parseFloat(totalEth) / 300000).toFixed(6);
      const priceWei = parseEther(priceInEth.toString());
      
      const scProductId = product.origin_metadata?.smartContractProductId || 1;

      let txHash: string;
      let fromAddress: string = address;
      let toAddress: string = contractData.address;

      try {
        const hash = await writeContractAsync({
          address: contractData.address,
          abi: contractData.abi,
          functionName: 'buyProduct',
          args: [scProductId, quantity],
          value: priceWei,
        });
        txHash = hash;
      } catch (err: any) {
        console.warn(
          "Contract buy failed, attempting fallback to direct transfer.",
          err
        );
        
        const sellerAddress = product.vendor_profiles?.custodial_wallet_address;
        
        if (!sellerAddress || !sellerAddress.startsWith("0x")) {
          throw new Error(
            "Transaction failed: Product might not be listed on the current network's smart contract, and the seller has no direct wallet address configured."
          );
        }

        const hash = await sendTransactionAsync({
          to: sellerAddress as `0x${string}`,
          value: priceWei,
        });
        txHash = hash;
        toAddress = sellerAddress;
      }

      // 3. Record order in Supabase with blockchain metadata
      const { data: orderData, error: dbError } = await supabase
        .from("orders")
        .insert({
          customer_id: session.user.id,
          vendor_id: product.vendor_id,
          subtotal: parseFloat(totalEth),
          total: parseFloat(totalEth),
          shipping_address: { address: "Blockchain Direct" },
          blockchain_tx_hash: txHash,
          block_number: null, // Removed wait() blockNumber for simplicity on mobile bridging
          from_address: fromAddress,
          to_address: toAddress,
          gas_used: "", // Gas info isn't instantly available without waiting for receipt, which we skip to keep UI fast on mobile
          chain_id: 11155111, // Sepolia
          status: "paid",
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
          unit_price: product.price,
        });

      if (itemError)
        throw new Error("Order items save failed: " + itemError.message);

      // 4. Decrease stock quantity in the database using RPC to bypass RLS
      const { error: stockError } = await supabase.rpc("decrement_product_stock", {
        p_id: product.id,
        p_quantity: quantity
      });

      if (stockError) {
        console.warn("Failed to update stock quantity via RPC:", stockError);
      }

      alert("Purchase Successful! 🎉");
      router.push("/dashboard/orders");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        <button
          onClick={handleDecrease}
          disabled={quantity <= 1 || loading}
          className={styles.qtyBtn}
        >
          <Minus size={16} />
        </button>
        <span className={styles.qtyDisplay}>{quantity}</span>
        <button
          onClick={handleIncrease}
          disabled={
            quantity >= (product.stock_quantity || 99) || loading
          }
          className={styles.qtyBtn}
        >
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
        {loading
          ? "Processing..."
          : !address
            ? "Connect Wallet to Buy"
            : `Buy Now for ₹${totalEth}`}
      </button>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { useWeb3 } from "@/components/web3/Web3Provider";
import { ethers } from "ethers";

import styles from "./productNew.module.css";

// Fallback empty contract data if not deployed yet
let contractData = { address: "", abi: [] };
try {
  contractData = require("@/components/web3/contractData.json");
} catch (e) {
  console.warn("Contract data not found. Please deploy the smart contract first.");
}

export default function NewProductPage() {
  const router = useRouter();
  const { provider, signer, address, connect, isConnecting } = useWeb3();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [vendorId, setVendorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(""); // ETH
  const [stock, setStock] = useState("1");
  const [image, setImage] = useState<File | null>(null);

  useEffect(() => {
    // Check if user is a vendor
    const checkVendor = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      
      const { data, error } = await supabase
        .from('vendor_profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .single();
        
      if (error || !data) {
        setError("You must be a registered seller to list products.");
      } else {
        setVendorId(data.id);
      }
    };
    
    checkVendor();
  }, [supabase, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorId) return setError("Vendor profile not found");
    if (!address || !signer || !provider) {
      connect();
      return;
    }
    if (!contractData.address) return setError("Smart contract not deployed");
    if (!image) return setError("Please select an image");

    setLoading(true);
    setError(null);

    try {
      // 1. Upload image to IPFS
      const formData = new FormData();
      formData.append("file", image);
      
      const uploadRes = await fetch("/api/ipfs/upload", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();
      
      if (!uploadRes.ok) throw new Error(uploadData.error || "IPFS Upload failed");
      const ipfsCid = uploadData.cid;
      const imageUrl = uploadData.gatewayUrl;

      // 2. Call Smart Contract `listProduct`
      const contract = new ethers.Contract(contractData.address, contractData.abi, signer);
      const priceWei = ethers.parseEther(price);
      
      const tx = await contract.listProduct(priceWei, ipfsCid);
      const receipt = await tx.wait(); // Wait for confirmation
      
      let smartContractProductId = 1;
      try {
        const event = receipt.logs.find((log: any) => {
          try { return contract.interface.parseLog({ topics: [...log.topics], data: log.data })?.name === "ProductListed"; } catch { return false; }
        });
        if (event) {
          const parsedLog = contract.interface.parseLog({ topics: [...event.topics], data: event.data });
          smartContractProductId = Number(parsedLog?.args[0]);
        }
      } catch (e) {
        console.warn("Could not parse ProductListed event", e);
      }
      
      // 3. Save to Supabase DB
      const { error: dbError } = await supabase
        .from("products")
        .insert({
          vendor_id: vendorId,
          title,
          description,
          price: parseFloat(price),
          currency: "ETH",
          stock_quantity: parseInt(stock),
          image_urls: [imageUrl],
          ipfs_origin_cid: ipfsCid,
          origin_metadata: { smartContractProductId }
        });

      if (dbError) throw new Error("Database error: " + dbError.message);

      router.push("/dashboard");
      router.refresh();
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={`${styles.container} animate-fade-in-up`}>
        <div className={styles.header}>
          <h1 className={styles.title}>List a New Product</h1>
          <p className={styles.subtitle}>Add your fresh produce to the blockchain marketplace.</p>
        </div>
        
        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Product Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={styles.input}
              placeholder="e.g. Organic Honey 500g"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Description</label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              className={`${styles.input} ${styles.textarea}`}
              placeholder="Describe your product (100-500 characters)"
            />
            <p style={{ textAlign: 'right', fontSize: '12px', color: 'var(--color-neutral-500)', marginTop: '4px' }}>
              {description.length}/500
            </p>
          </div>

          <div className={styles.grid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Price (ETH)</label>
              <input
                type="number"
                required
                step="0.0001"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={styles.input}
                placeholder="0.05"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Stock Quantity</label>
              <input
                type="number"
                required
                min="1"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className={styles.input}
                placeholder="10"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Product Image</label>
            <div className={styles.fileArea}>
              <input
                type="file"
                required={!image}
                accept="image/png, image/jpeg, image/jpg"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
                className={styles.fileInput}
              />
              <div style={{ pointerEvents: 'none' }}>
                {image ? (
                  <div className={styles.previewContainer}>
                    <img 
                      src={URL.createObjectURL(image)} 
                      alt="Preview" 
                      className={styles.previewImage} 
                    />
                    <p className={styles.fileName}>{image.name}</p>
                    <p className={styles.changeText}>Click to change image</p>
                  </div>
                ) : (
                  <>
                    <div className={styles.fileIcon}>
                      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className={styles.fileName}>Click to upload or drag and drop</p>
                    <p className={styles.fileSub}>PNG, JPG up to 5MB</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className={styles.footer}>
            {!address ? (
              <button
                type="button"
                onClick={connect}
                disabled={isConnecting}
                className={styles.submitBtn}
                style={{ background: '#f6851b', color: 'white', border: 'none' }}
              >
                {isConnecting ? "Connecting..." : "🦊 Connect MetaMask"}
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading || !vendorId}
                className={styles.submitBtn}
              >
                {loading ? (
                  <>
                    <div className={styles.spinner}></div>
                    Listing...
                  </>
                ) : (
                  "List Product"
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

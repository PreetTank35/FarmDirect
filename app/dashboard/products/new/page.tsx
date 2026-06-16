"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { useWeb3 } from "@/components/web3/Web3Provider";
import { ethers } from "ethers";

// Fallback empty contract data if not deployed yet
let contractData = { address: "", abi: [] };
try {
  contractData = require("@/components/web3/contractData.json");
} catch (e) {
  console.warn("Contract data not found. Please deploy the smart contract first.");
}

export default function NewProductPage() {
  const router = useRouter();
  const { provider, signer, address } = useWeb3();
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
    if (!address || !signer || !provider) return setError("Please connect MetaMask");
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
      await tx.wait(); // Wait for confirmation
      
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
          ipfs_origin_cid: ipfsCid
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
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">List a New Product</h1>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-shadow"
            placeholder="e.g. Organic Honey 500g"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            maxLength={500}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-shadow resize-none"
            placeholder="Describe your product (100-500 characters)"
          />
          <p className="text-xs text-gray-500 mt-1 text-right">{description.length}/500</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (ETH)</label>
            <input
              type="number"
              required
              step="0.0001"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-shadow"
              placeholder="0.05"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
            <input
              type="number"
              required
              min="1"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-shadow"
              placeholder="10"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
          <input
            type="file"
            required
            accept="image/png, image/jpeg, image/jpg"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-shadow file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
          />
          <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB.</p>
        </div>

        <div className="pt-4 border-t border-gray-100 mt-6 flex justify-end">
          <button
            type="submit"
            disabled={loading || !vendorId}
            className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                Listing Product...
              </>
            ) : (
              "List Product"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

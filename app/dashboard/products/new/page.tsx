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
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto glass animate-fade-in-up rounded-3xl p-8 sm:p-10 shadow-lg border border-white/40">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">List a New Product</h1>
          <p className="text-gray-500">Add your fresh produce to the blockchain marketplace.</p>
        </div>
        
        {error && (
          <div className="mb-8 p-4 bg-red-50/80 border border-red-100 text-red-700 rounded-xl text-sm animate-fade-in">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-green-600">Product Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-5 py-3 bg-white/60 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              placeholder="e.g. Organic Honey 500g"
            />
          </div>

          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-green-600">Description</label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={500}
              className="w-full px-5 py-3 bg-white/60 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all resize-none"
              placeholder="Describe your product (100-500 characters)"
            />
            <p className="text-xs text-gray-400 mt-2 text-right font-medium">{description.length}/500</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-green-600">Price (ETH)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Ξ</span>
                <input
                  type="number"
                  required
                  step="0.0001"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full pl-10 pr-5 py-3 bg-white/60 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  placeholder="0.05"
                />
              </div>
            </div>
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-green-600">Stock Quantity</label>
              <input
                type="number"
                required
                min="1"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full px-5 py-3 bg-white/60 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                placeholder="10"
              />
            </div>
          </div>

          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-green-600">Product Image</label>
            <div className="relative border-2 border-dashed border-gray-300 rounded-2xl p-6 bg-white/40 hover:bg-white/60 transition-colors text-center group-focus-within:border-green-500 group-focus-within:bg-green-50/30">
              <input
                type="file"
                required
                accept="image/png, image/jpeg, image/jpg"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="pointer-events-none">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-3">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </span>
                <p className="text-sm font-medium text-gray-900">{image ? image.name : "Click to upload or drag and drop"}</p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
              </div>
            </div>
          </div>

          <div className="pt-8 mt-8 border-t border-gray-200/60">
            <button
              type="submit"
              disabled={loading || !vendorId}
              className="w-full sm:w-auto sm:ml-auto px-8 py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 hover:-translate-y-1 hover:shadow-lg hover:shadow-green-500/30 active:translate-y-0"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                  Listing on Blockchain...
                </>
              ) : (
                "List Product"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

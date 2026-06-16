"use client";

import { useWeb3 } from "./Web3Provider";
import { Wallet, LogOut } from "lucide-react";

export default function ConnectWallet() {
  const { address, connect, disconnect, isConnecting, error } = useWeb3();

  if (address) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded-full font-medium border border-green-200">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <button
          onClick={disconnect}
          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
          title="Disconnect Wallet"
        >
          <LogOut size={18} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end">
      <button
        onClick={connect}
        disabled={isConnecting}
        className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-70"
      >
        <Wallet size={18} />
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </button>
      {error && (
        <span className="text-red-500 text-xs mt-1 absolute -bottom-5 right-0 whitespace-nowrap">
          {error}
        </span>
      )}
    </div>
  );
}

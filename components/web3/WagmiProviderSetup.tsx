"use client";

import React, { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { sepolia, hardhat } from "wagmi/chains";

import "@rainbow-me/rainbowkit/styles.css";

// 1. Get WalletConnect Project ID from environment variables
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";

if (!projectId) {
  console.warn("NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set!");
}

// 2. Configure Wagmi and RainbowKit
const config = getDefaultConfig({
  appName: "FarmDirect Marketplace",
  projectId: projectId,
  chains: [sepolia, hardhat],
  ssr: true, // If using Next.js SSR
});

// 3. Initialize React Query
const queryClient = new QueryClient();

export function WagmiProviderSetup({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#10b981", // Emerald 500
            accentColorForeground: "white",
            borderRadius: "medium",
            fontStack: "system",
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

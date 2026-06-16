import type { Metadata } from "next";
import React from "react";
import "./globals.css";
import ToastProvider from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "FarmDirect — From Farm to Your Door, No Middleman",
  description:
    "A decentralized direct-to-consumer marketplace connecting farmers and manufacturers straight to everyday shoppers. Blockchain-verified origin, smart contract escrow, and AI-powered product discovery.",
  keywords: [
    "farm direct",
    "d2c marketplace",
    "blockchain marketplace",
    "direct to consumer",
    "farmer marketplace",
    "organic produce",
    "smart contract escrow",
  ],
  openGraph: {
    title: "FarmDirect — From Farm to Your Door, No Middleman",
    description:
      "Buy directly from farmers and manufacturers with blockchain-verified transparency and smart contract escrow payments.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}

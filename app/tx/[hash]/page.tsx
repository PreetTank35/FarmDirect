import { ethers } from "ethers";
import { ShieldCheck, AlertTriangle, ExternalLink } from "lucide-react";
import styles from "./txDetail.module.css";

interface PageProps {
  params: Promise<{ hash: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { hash } = await params;
  return {
    title: `Transaction ${hash.slice(0, 10)}... — FarmDirect Verification`,
    description: `Blockchain transaction verification for ${hash}`,
  };
}

export default async function TransactionPage({ params }: PageProps) {
  const { hash } = await params;
  const etherscanUrl = process.env.NEXT_PUBLIC_ETHERSCAN_URL || "https://sepolia.etherscan.io";
  const rpcUrl = process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL;

  if (!rpcUrl) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.errorCard}>
            <div className={styles.errorIcon}>
              <AlertTriangle size={32} />
            </div>
            <h1 className={styles.errorTitle}>Configuration Error</h1>
            <p className={styles.errorText}>RPC endpoint not configured.</p>
          </div>
        </div>
      </div>
    );
  }

  let tx = null;
  let receipt = null;
  let block = null;

  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    tx = await provider.getTransaction(hash);
    if (tx) {
      receipt = await provider.getTransactionReceipt(hash);
      if (tx.blockNumber) {
        block = await provider.getBlock(tx.blockNumber);
      }
    }
  } catch (err) {
    console.error("Failed to fetch transaction:", err);
  }

  if (!tx) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.errorCard}>
            <div className={styles.errorIcon}>
              <AlertTriangle size={32} />
            </div>
            <h1 className={styles.errorTitle}>Transaction Not Found</h1>
            <p className={styles.errorText}>
              The transaction hash <code>{hash.slice(0, 16)}...</code> was not found on the Sepolia network.
              It may still be pending or the hash may be incorrect.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const status = receipt ? (receipt.status === 1 ? "Success" : "Failed") : "Pending";
  const timestamp = block ? new Date(block.timestamp * 1000).toLocaleString() : "Pending";
  const valueEth = ethers.formatEther(tx.value);
  const gasUsed = receipt ? receipt.gasUsed.toString() : "Pending";
  const gasPrice = tx.gasPrice ? ethers.formatUnits(tx.gasPrice, "gwei") : "N/A";

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.card}>
          {/* Banner */}
          <div className={styles.banner}>
            <div className={styles.bannerIcon}>
              <ShieldCheck size={32} />
            </div>
            <h1 className={styles.bannerTitle}>Transaction Verified</h1>
            <p className={styles.bannerSubtitle}>
              This purchase is recorded on the Ethereum Sepolia blockchain
            </p>
            <span className={`${styles.statusBadge} ${status === "Success" ? styles.statusSuccess : styles.statusFailed}`}>
              {status === "Success" ? "✓" : "✗"} {status}
            </span>
          </div>

          {/* Body */}
          <div className={styles.body}>
            {/* Transaction Info */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Transaction Details</h2>
              <div className={styles.detailGrid}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Tx Hash</span>
                  <span className={`${styles.detailValue} ${styles.fullHash}`}>{hash}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Block</span>
                  <span className={styles.detailValue}>{tx.blockNumber || "Pending"}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Timestamp</span>
                  <span className={styles.detailValue}>{timestamp}</span>
                </div>
              </div>
            </div>

            {/* Addresses */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Addresses</h2>
              <div className={styles.detailGrid}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>From</span>
                  <span className={styles.detailValue} title={tx.from}>
                    {tx.from.slice(0, 8)}...{tx.from.slice(-6)}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>To</span>
                  <span className={styles.detailValue} title={tx.to || "Contract Creation"}>
                    {tx.to ? `${tx.to.slice(0, 8)}...${tx.to.slice(-6)}` : "Contract Creation"}
                  </span>
                </div>
              </div>
            </div>

            {/* Value & Gas */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Value & Gas</h2>
              <div className={styles.detailGrid}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Value</span>
                  <span className={styles.detailValue}>{valueEth} ETH</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Gas Used</span>
                  <span className={styles.detailValue}>{gasUsed}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Gas Price</span>
                  <span className={styles.detailValue}>{gasPrice} Gwei</span>
                </div>
              </div>
            </div>

            {/* Etherscan Link */}
            <a
              href={`${etherscanUrl}/tx/${hash}`}
              target="_blank"
              rel="noreferrer"
              className={styles.etherscanLink}
            >
              <ExternalLink size={18} />
              View on Etherscan
            </a>
          </div>

          {/* Footer */}
          <div className={styles.footer}>
            Verified by FarmDirect — Blockchain-powered transparency
          </div>
        </div>
      </div>
    </div>
  );
}

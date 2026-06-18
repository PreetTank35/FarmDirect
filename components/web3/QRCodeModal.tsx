"use client";

import { QRCodeSVG } from "qrcode.react";
import { X, ShieldCheck, ExternalLink } from "lucide-react";
import styles from "./qrModal.module.css";

interface QRCodeModalProps {
  txHash: string;
  orderNumber: string;
  total: string;
  date: string;
  onClose: () => void;
}

export default function QRCodeModal({ txHash, orderNumber, total, date, onClose }: QRCodeModalProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const etherscanUrl = process.env.NEXT_PUBLIC_ETHERSCAN_URL || "https://sepolia.etherscan.io";
  const verificationUrl = `${appUrl}/tx/${txHash}`;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={16} />
        </button>

        <div className={styles.header}>
          <div className={styles.badge}>
            <ShieldCheck size={14} />
            Blockchain Verified
          </div>
          <h2 className={styles.title}>Transaction QR Code</h2>
          <p className={styles.subtitle}>Scan to verify this purchase on the blockchain</p>
        </div>

        <div className={styles.qrWrap}>
          <QRCodeSVG
            value={verificationUrl}
            size={200}
            level="H"
            includeMargin
            bgColor="#ffffff"
            fgColor="#0f172a"
          />
        </div>

        <div className={styles.details}>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Order</span>
            <span className={styles.detailValue}>{orderNumber}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Amount</span>
            <span className={styles.detailValue}>₹{total}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Date</span>
            <span className={styles.detailValue}>{date}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Tx Hash</span>
            <span className={styles.detailValue} title={txHash}>
              {txHash.slice(0, 10)}...{txHash.slice(-8)}
            </span>
          </div>
        </div>

        <a
          href={`${etherscanUrl}/tx/${txHash}`}
          target="_blank"
          rel="noreferrer"
          className={styles.viewLink}
        >
          <ExternalLink size={16} />
          View on Etherscan
        </a>
      </div>
    </div>
  );
}

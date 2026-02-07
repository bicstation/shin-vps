import React from "react";
import Link from "next/link";
import { COLORS } from "@/shared/styles/constants";
import styles from "./ProductLayout.module.css";

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  const primaryColor = COLORS?.SITE_COLOR || '#007bff';
  const bgColor = COLORS?.BACKGROUND || '#f4f7f9';

  return (
    <div className={styles.container} style={{ backgroundColor: bgColor }}>
      {/* 📢 期間限定バナー */}
      <div 
        className={styles.promoBanner}
        style={{ background: `${primaryColor}10`, color: primaryColor, borderBottom: `1px solid ${primaryColor}20` }}
      >
        📢 期間限定：今なら公式サイトでクーポン配布中！
      </div>
      
      {children}
      
      {/* 🚩 詳細ページ用フッターCTA */}
      <div className={styles.footerSection}>
        <p className={styles.footerText}>お探しのスペックが見つかりませんか？</p>
        <Link href="/contact" className={styles.consultLink} style={{ color: primaryColor }}>
          コンシェルジュに相談する →
        </Link>
      </div>
    </div>
  );
}
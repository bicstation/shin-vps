import React from "react";
import Link from "next/link";
import { COLORS } from "@/constants";
import styles from "./BrandLayout.module.css";

export default function BrandLayout({ children }: { children: React.ReactNode }) {
  const primaryColor = COLORS?.SITE_COLOR || '#007bff';
  const bgColor = COLORS?.BACKGROUND || '#f4f7f9';

  return (
    <div className={styles.container} style={{ backgroundColor: bgColor }}>
      {/* 🚀 共通セールバナー */}
      <div 
        className={styles.banner} 
        style={{ background: `${primaryColor}10`, color: primaryColor, borderBottom: `1px solid ${primaryColor}20` }}
      >
        🚀 各メーカーの最新セール・学割情報を反映済み！お得なモデルをチェック
      </div>
      
      {children}
      
      {/* 🚩 相談CTAセクション */}
      <div className={styles.ctaSection}>
        <h3 className={styles.ctaTitle}>自分にぴったりの構成に迷ったら</h3>
        <p className={styles.ctaDescription}>
          専門スタッフがチャットやメールで最適な一台をご提案します。
        </p>
        <Link href="/contact" className={styles.ctaButton} style={{ backgroundColor: primaryColor }}>
          無料でスペック相談する →
        </Link>
      </div>
    </div>
  );
}
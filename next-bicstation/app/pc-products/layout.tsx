"use client"; // 🚩 これを追加

import React from "react";
import Link from "next/link";
import { COLORS } from "@shared/styles/constants";
import styles from "./BrandLayout.module.css";

export default function BrandLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const primaryColor = COLORS?.SITE_COLOR || '#007bff';
  const bgColor = COLORS?.BACKGROUND || '#f4f7f9';

  // 🚩 yml等で設定されたベースパスを取得 (例: /bicstation)
  // NEXT_PUBLIC_BASE_PATH が空ならルート、あればそのパスを起点にします
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

  return (
    <div className={styles.container} style={{ backgroundColor: bgColor }}>
      
      {/* 🚩 お知らせバナー */}
      <aside 
        className={styles.banner} 
        style={{ 
          background: `${primaryColor}10`, 
          color: primaryColor,
          borderBottom: `1px solid ${primaryColor}20`
        }}
      >
        <span role="img" aria-label="rocket">🚀</span> 各メーカーの最新セール・学割情報を反映済み！お得なモデルをチェック
      </aside>
      
      {/* 🚩 ページ本体：最小高さを確保 */}
      <main className={styles.mainContent} style={{ minHeight: '70vh' }}>
        {children}
      </main>
      
      {/* 🚩 下部の共通セクション（CTA） */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaInner}>
          <h3 className={styles.ctaTitle}>自分にぴったりの構成に迷ったら</h3>
          <p className={styles.ctaDescription}>
            「このメーカーの中で一番コスパが良いのはどれ？」「用途に合うスペックは？」<br />
            専門スタッフがチャットやメールで最適な一台をご提案します。
          </p>
          <div className={styles.ctaAction}>
            {/* 🚩 Linkのパスをベースパスに対応させる */}
            <Link 
              href={`${basePath}/contact`} 
              className={styles.ctaButton}
              style={{ backgroundColor: primaryColor }}
            >
              無料でスペック相談する →
            </Link>
          </div>
        </div>
      </section>

      <style jsx>{`
        .${styles.mainContent} {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
        }
      `}</style>
    </div>
  );
}
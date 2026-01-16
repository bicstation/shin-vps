import React from "react";
import Link from "next/link";
import { COLORS } from "@/constants";
import styles from "./BrandLayout.module.css";

// 💡 [slug] フォルダ名に合わせて params の型を定義
interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function BrandLayout({ children, params }: LayoutProps) {
  // paramsをawaitして解決
  const resolvedParams = await params;
  const brandSlug = resolvedParams?.slug || "";

  const primaryColor = COLORS?.SITE_COLOR || '#28a745'; // サイトカラーに合わせる
  const bgColor = COLORS?.BACKGROUND || '#f8f9fa';

  return (
    <div style={{ backgroundColor: bgColor, width: '100%', minHeight: '100vh' }}>
      <div className={styles.container}>
        
        {/* 🚀 セールバナー：MainPageのDNAを継承したデザイン */}
        <div 
          className={styles.banner} 
          style={{ 
              background: `${primaryColor}10`, 
              color: primaryColor, 
              borderColor: `${primaryColor}30` 
          }}
        >
          <span className={styles.emoji}>🚀</span> 
          <strong>{brandSlug.toUpperCase()}</strong> の最新セール・学割情報を反映済み！お得なモデルをチェック
        </div>

        {/* 🍞 パンくずリスト：1600pxの左端にピタッと合わせる */}
        <nav className={styles.breadcrumb}>
          <Link href="/">ホーム</Link>
          <span className={styles.separator}>&gt;</span>
          <span className={styles.current}>{brandSlug.toUpperCase()} の製品一覧</span>
        </nav>

        {/* 📦 ブランド個別の中身（ここが page.tsx の内容になる） */}
        <main className={styles.mainWrapper}>
          {children}
        </main>
        
        {/* 🚩 相談CTAセクション：ページ最下部で共通表示 */}
        <section className={styles.ctaSection}>
          <div className={styles.ctaInner}>
            <h3 className={styles.ctaTitle}>自分にぴったりの構成に迷ったら</h3>
            <p className={styles.ctaDescription}>
              専門スタッフがチャットやメールで、あなたの用途に最適な一台をご提案します。
            </p>
            <Link 
              href="/contact" 
              className={styles.ctaButton} 
              style={{ backgroundColor: primaryColor }}
            >
              無料でスペック相談する →
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
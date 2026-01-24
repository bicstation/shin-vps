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
  
  // 💡 URLエンコードされた文字列を日本語にデコード
  // トレンドマイクロなどの日本語はデコードし、英単語はそのまま大文字にできるように処理
  const decodedBrandName = decodeURIComponent(brandSlug);
  
  // 表示用の名前を生成（英単語なら大文字、日本語ならそのまま）
  const brandDisplayName = /^[a-zA-Z0-9-]*$/.test(decodedBrandName) 
    ? decodedBrandName.toUpperCase() 
    : decodedBrandName;

  const primaryColor = COLORS?.SITE_COLOR || '#28a745'; // サイトカラーに合わせる
  const bgColor = COLORS?.BACKGROUND || '#f8f9fa';

  return (
    <div style={{ backgroundColor: bgColor, width: '100%', minHeight: '100vh' }}>
      <div className={styles.container}>
        
        {/* 🚀 セールバナー：デコード済みの日本語名を表示 */}
        <div 
          className={styles.banner} 
          style={{ 
              background: `${primaryColor}10`, 
              color: primaryColor, 
              borderColor: `${primaryColor}30` 
          }}
        >
          <span className={styles.emoji}>🚀</span> 
          <strong>{brandDisplayName}</strong> の最新セール・学割情報を反映済み！お得なモデルをチェック
        </div>

        {/* 🍞 パンくずリスト：日本語で表示 */}
        <nav className={styles.breadcrumb}>
          <Link href="/">ホーム</Link>
          <span className={styles.separator}>&gt;</span>
          <span className={styles.current}>{brandDisplayName} の製品一覧</span>
        </nav>

        {/* 📦 ブランド個別の中身 */}
        <main className={styles.mainWrapper}>
          {children}
        </main>
        
        {/* 🚩 相談CTAセクション */}
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
import React from "react";
import Link from "next/link";
import { COLORS } from "@shared/styles/constants";
import styles from "./BrandLayout.module.css";

/**
 * 💡 Next.js 15 用の型定義
 * [slug] ディレクトリ配下の layout は params を Promise で受け取ります。
 */
interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function BrandLayout({ children, params }: LayoutProps) {
  // 1. params を非同期で解決（Next.js 15 の必須処理）
  const resolvedParams = await params;
  const brandSlug = resolvedParams?.slug || "";
  
  // 2. 💡 URLデコード処理
  // 日本語スラッグ（例: %E3%83%88%E3%83%AC%E3%83%B3%E3%83%89...）を「トレンドマイクロ」に復元
  let decodedBrandName = "";
  try {
    decodedBrandName = decodeURIComponent(brandSlug);
  } catch (e) {
    decodedBrandName = brandSlug; // デコード失敗時のフォールバック
  }
  
  // 3. 💡 表示名の正規化
  // 英単語のみの場合は大文字（DELL, HP等）、日本語混じりの場合はそのまま表示
  const brandDisplayName = /^[a-zA-Z0-9-]*$/.test(decodedBrandName) 
    ? decodedBrandName.toUpperCase() 
    : decodedBrandName;

  // 🎨 カラー設定
  const primaryColor = COLORS?.SITE_COLOR || '#28a745';
  const bgColor = COLORS?.BACKGROUND || '#f8f9fa';

  return (
    <div style={{ backgroundColor: bgColor, width: '100%', minHeight: '100vh' }}>
      <div className={styles.container}>
        
        {/* 🚀 セールバナー：視認性を高めた配色設計 */}
        <div 
          className={styles.banner} 
          role="alert"
          style={{ 
              background: `${primaryColor}08`, // 透過度を調整して背景に馴染ませる
              color: primaryColor, 
              border: `1px solid ${primaryColor}25` 
          }}
        >
          <span className={styles.emoji} aria-hidden="true">🚀</span> 
          <p className={styles.bannerText}>
            <strong>{brandDisplayName}</strong> の最新セール・学割情報を反映済み！お得なモデルをチェック
          </p>
        </div>

        {/* 🍞 パンくずリスト：SEOに配慮した構造化タグ */}
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <ol className={styles.breadcrumbList} style={{ listStyle: 'none', display: 'flex', padding: 0 }}>
            <li>
              <Link href="/">ホーム</Link>
            </li>
            <li className={styles.separator} aria-hidden="true">&gt;</li>
            <li>
              <span className={styles.current} aria-current="page">
                {brandDisplayName} の製品一覧
              </span>
            </li>
          </ol>
        </nav>

        {/* 📦 メインコンテンツ：ブランド個別の一覧（page.tsx）がここに描画される */}
        <main className={styles.mainWrapper}>
          {children}
        </main>
        
        {/* 🚩 相談CTAセクション：コンバージョン率を意識した設計 */}
        <section className={styles.ctaSection} aria-labelledby="cta-title">
          <div className={styles.ctaInner}>
            <h3 id="cta-title" className={styles.ctaTitle}>
              {brandDisplayName} の構成に迷ったら
            </h3>
            <p className={styles.ctaDescription}>
              専門スタッフが、あなたの用途に最適な <strong>{brandDisplayName}</strong> のカスタマイズ構成をご提案します。
            </p>
            <div className={styles.ctaAction}>
              <Link 
                href="/contact" 
                className={styles.ctaButton} 
                style={{ 
                  backgroundColor: primaryColor,
                  boxShadow: `0 4px 14px ${primaryColor}40`
                }}
              >
                無料スペック相談 (チャット・メール) →
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
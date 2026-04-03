/**
 * =====================================================================
 * 🏛️ RootLayout (Maya's Universe v6.0) - Tiper.live Edition
 * 🛡️ Next.js 15 Async APIs & Unified Theme Control
 * 🚀 Fixed: Metadata Host-Aware Detection
 * =====================================================================
 */
/* eslint-disable @next/next/no-img-element */

import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import { headers } from "next/headers";
import styles from "./layout.module.css";

/**
 * ✅ 1. スタイルのインポート
 */
import '@/shared/styles/globals.css';

/**
 * ✅ 2. 共通設定とコンポーネント
 */
import { getSiteMetadata, getSiteColor } from '@/shared/lib/utils/siteConfig';

// 🚀 共通コンポーネント
import Header from '@/shared/components/organisms/common/Header';
import Footer from '@/shared/components/organisms/common/Footer';

/**
 * ✅ 3. サイドバーラッパー
 */
import SidebarWrapper from '@/shared/layout/Sidebar/SidebarWrapper';

/**
 * ✅ 4. SEO設定 (constructMetadata は内部でホスト判定を行う)
 */
import { constructMetadata } from '@/shared/lib/utils/metadata';

/**
 * ✅ 5. ページ遷移プログレスバー
 */
import RouteProgressBar from '@/shared/components/atoms/RouteProgressBar';

const inter = Inter({ subsets: ["latin"] });

/**
 * 🛰️ [FIXED] generateMetadata
 * 実行時のホスト名を明示的にキャッチし、Tiperとしてのアイデンティティを確定させます。
 */
export async function generateMetadata(): Promise<Metadata> {
  const headerList = await headers();
  const host = headerList.get('host') || "tiper.live"; 
  
  // constructMetadataに現在のホスト名を注入し、正しいサイト名(Tiper等)を取得
  return constructMetadata({ host });
}

/**
 * 💡 Next.js 15 レンダリングポリシー
 * 常に最新の動的コンテンツを配信するため、キャッシュを無効化。
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  /**
   * ✅ 1. コンテキスト取得
   * headers() を await して実行環境（ホスト）を特定します。
   */
  const headerList = await headers();
  const host = headerList.get('host') || "tiper.live";
  const site = getSiteMetadata(host);
  
  /**
   * 🚩 フォールバック設定
   * tiper.live は基幹システムのため、デフォルト値を "Tiper" に固定。
   */
  const siteName = site?.site_name || "Tiper"; 
  const themeColor = getSiteColor(siteName);

  // Tiperの象徴的な「深淵」の黒
  const BG_COLOR = "#06060a";

  return (
    <html lang="ja" style={{ height: '100%', backgroundColor: BG_COLOR }}>
      <body 
        className={`${inter.className} ${styles.bodyWrapper}`}
        style={{
          backgroundColor: BG_COLOR,
          color: "#ffffff",
          margin: 0,
          padding: 0,
          overflowX: "hidden",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          // @ts-ignore
          "--site-theme-color": themeColor,
          "--bg-deep": BG_COLOR,
        } as React.CSSProperties}
      >
        {/* 🚀 クライアントサイド・プログレスバー */}
        <Suspense fallback={null}>
          {RouteProgressBar && <RouteProgressBar />}
        </Suspense>

        {/* 背景のシステムグリッド演出 */}
        <div className={styles.systemGrid} />

        {/* ① 共通ヘッダー */}
        <Header />

        {/* ② 告知バー（広告情報の透明性確保） */}
        <div className={styles.adDisclosure}>
          <div className={styles.adDisclosureInner}>
            <span className={styles.prLabel}>【PR】</span>本サイトはアフィリエイト広告を利用して運営されています。
            {site?.site_group === 'adult' && (
              <span className={styles.ageLimit}>
                ※18歳未満の閲覧は固く禁止されています。
              </span>
            )}
          </div>
        </div>

        {/* ③ メインレイアウト構造 (Sidebar + Main Content) */}
        <div className={styles.layoutContainer}>
          <div className={styles.layoutWrapper}>
            
            {/* 🛰️ 左翼：システムサイドバー */}
            <aside className={styles.sidebarArea}>
              <div className={styles.sidebarSticky}>
                <Suspense fallback={<div className={styles.sidebarLoading} />}>
                  {SidebarWrapper ? <SidebarWrapper /> : <div style={{width: '280px'}} />}
                </Suspense>
              </div>
            </aside>

            {/* 🖥️ 中央：メインデータストリーム */}
            <main className={styles.mainContent}>
              <Suspense fallback={
                <div className={styles.loadingWrapper}>
                  <div className={styles.loadingPulse}>SYNCING_DATA_STREAM...</div>
                </div>
              }>
                {children}
              </Suspense>
            </main>

          </div>
        </div>

        {/* ④ 共通フッター */}
        <Footer />
      </body>
    </html>
  );
}
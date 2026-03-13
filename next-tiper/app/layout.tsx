/* /app/layout.tsx */
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
 * ✅ 2. 共通設定とコンポーネント (物理パス同期)
 */
import { getSiteMetadata, getSiteColor } from '@/shared/lib/utils/siteConfig';

// 🚀 発見された物理パスに合わせて修正
import Header from '@/shared/components/organisms/common/Header';
import Footer from '@/shared/components/organisms/common/Footer';

/**
 * ✅ 3. サイドバーラッパー
 */
import SidebarWrapper from '@/shared/layout/Sidebar/SidebarWrapper';

/**
 * ✅ 4. SEO設定
 */
import { constructMetadata } from '@/shared/lib/utils/metadata';

/**
 * ✅ 5. ページ遷移プログレスバー
 */
import RouteProgressBar from '@/shared/components/atoms/RouteProgressBar';

const inter = Inter({ subsets: ["latin"] });

/**
 * 💡 メタデータの動的生成
 */
export async function generateMetadata(): Promise<Metadata> {
  return constructMetadata();
}

/**
 * 💡 強制的動的レンダリングの設定
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  /**
   * ✅ サイト設定の取得 (Next.js 15 Async Request APIs 対応)
   */
  const headerList = await headers();
  const host = headerList.get('host') || "localhost";
  const site = getSiteMetadata(host);
  const themeColor = getSiteColor(site.site_name);

  // システムのベースカラー（深宇宙ブラック）
  const BG_COLOR = "#06060a";

  return (
    <html lang="ja" style={{ height: '100%' }}>
      <body 
        className={`${inter.className} ${styles.bodyWrapper}`}
        style={{
          backgroundColor: BG_COLOR,
          color: "#ffffff",
          margin: 0,
          padding: 0,
          overflowX: "hidden",
          overflowY: "visible",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          // CSS変数としてテーマカラーを注入
          // @ts-ignore
          "--site-theme-color": themeColor,
          "--bg-deep": BG_COLOR,
          "--grid-color": "rgba(233, 69, 96, 0.03)",
        } as React.CSSProperties}
      >
        {/* 🚀 ページ遷移時のプログレスバー */}
        <RouteProgressBar />

        {/* 背景のシステムグリッド・エフェクト */}
        <div className={styles.systemGrid} />

        {/* 1. 共通ヘッダー */}
        <Header />

        {/* 2. 告知バー */}
        <div className={styles.adDisclosure}>
          <div className={styles.adDisclosureInner}>
            <span className={styles.prLabel}>【PR】</span>本サイトは広告を利用しています。
            {site.site_group === 'adult' && (
              <span className={styles.ageLimit}>
                ※18歳未満の閲覧は固く禁止されています。
              </span>
            )}
          </div>
        </div>

        {/* 3. メインレイアウト構造 */}
        <div className={styles.layoutContainer}>
          <div className={styles.layoutWrapper}>
            
            {/* 🏛️ 共通サイドバーエリア */}
            <aside className={styles.sidebarArea}>
              <div className={styles.sidebarSticky}>
                <Suspense fallback={
                  <div className={styles.sidebarLoading}>
                    <div className={styles.loadingSpinner}></div>
                    <span className={styles.loadingPulse}>LOADING_SYSTEM_MATRIX...</span>
                  </div>
                }>
                  <SidebarWrapper />
                </Suspense>
              </div>
            </aside>

            {/* 🏗️ コンテンツストリーム */}
            <main className={styles.mainContent}>
              <Suspense 
                fallback={
                  <div className={styles.loadingWrapper}>
                    <div className={styles.loadingPulse}>SYNCING_UNIFIED_GATEWAY...</div>
                  </div>
                }
              >
                {children}
              </Suspense>
            </main>

          </div>
        </div>

        {/* 4. 共通フッター */}
        <Suspense fallback={<div style={{ height: '200px', backgroundColor: BG_COLOR }} />}>
          <Footer />
        </Suspense>
      </body>
    </html>
  );
}
/**
 * =====================================================================
 * 🏛️ RootLayout (Maya's Universe v6.0)
 * 🛡️ Next.js 15 Async APIs & Unified Theme Control
 * 🚀 Fixed: Metadata Host-Aware Detection (Bic Station Issue Resolved)
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
 * ✅ 4. SEO設定
 */
import { constructMetadata } from '@/shared/lib/utils/metadata';

/**
 * ✅ 5. ページ遷移プログレスバー
 */
import RouteProgressBar from '@/shared/components/atoms/RouteProgressBar';

const inter = Inter({ subsets: ["latin"] });

/**
 * 🛰️ [FIXED] generateMetadata
 * Next.js 15のサーバーコンポーネントでは、明示的にheadersからホスト名を取得しない限り、
 * constructMetadata内部の判定ロジックがデフォルト(Bic Station)に流れてしまいます。
 */
export async function generateMetadata(): Promise<Metadata> {
  const headerList = await headers();
  const host = headerList.get('host') || "tiper.live"; // 判定不能時のデフォルトをTiperに設定
  
  // constructMetadataに現在のホスト名を注入し、正しいサイト名(Tiper等)を取得させます
  return constructMetadata({ host });
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  /**
   * ✅ サイト設定の取得
   */
  const headerList = await headers();
  const host = headerList.get('host') || "localhost";
  const site = getSiteMetadata(host);
  
  /**
   * 🚩 ガード: site が取得できなかった場合のフォールバック
   * ここを "Tiper" に変更することで、万が一判定が漏れても
   * ユーザーに "Bic Station" が表示される事故を防ぎます。
   */
  const siteName = site?.site_name || "Tiper"; 
  const themeColor = getSiteColor(siteName);

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
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          // @ts-ignore
          "--site-theme-color": themeColor,
          "--bg-deep": BG_COLOR,
        } as React.CSSProperties}
      >
        {/* 🚀 RouteProgressBar 存在チェック */}
        {RouteProgressBar && <RouteProgressBar />}

        <div className={styles.systemGrid} />

        {/* 1. 共通ヘッダー */}
        <Header />

        {/* 2. 告知バー */}
        <div className={styles.adDisclosure}>
          <div className={styles.adDisclosureInner}>
            <span className={styles.prLabel}>【PR】</span>本サイトは広告を利用しています。
            {site?.site_group === 'adult' && (
              <span className={styles.ageLimit}>
                ※18歳未満の閲覧は固く禁止されています。
              </span>
            )}
          </div>
        </div>

        {/* 3. メインレイアウト構造 */}
        <div className={styles.layoutContainer}>
          <div className={styles.layoutWrapper}>
            
            <aside className={styles.sidebarArea}>
              <div className={styles.sidebarSticky}>
                <Suspense fallback={<div className={styles.sidebarLoading} />}>
                  {/* SidebarWrapper 安全レンダリング */}
                  {SidebarWrapper ? <SidebarWrapper /> : <div style={{width: '280px'}} />}
                </Suspense>
              </div>
            </aside>

            <main className={styles.mainContent}>
              <Suspense fallback={<div className={styles.loadingWrapper} />}>
                {children}
              </Suspense>
            </main>

          </div>
        </div>

        {/* 4. 共通フッター */}
        <Footer />
      </body>
    </html>
  );
}
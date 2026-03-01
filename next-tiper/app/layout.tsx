/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import { headers } from "next/headers";
import styles from "./layout.module.css";

/**
 * ✅ 1. スタイルのインポート
 */
import '@shared/styles/globals.css';

/**
 * ✅ 2. 共通設定とコンポーネント
 */
import { getSiteMetadata, getSiteColor } from '@shared/lib/siteConfig';
import Header from '@shared/layout/Header';
import Footer from '@shared/layout/Footer';

/**
 * ✅ 3. サイドバーラッパー
 * 内部でホスト判定を行い、適切なサイドバー（AdultSidebar / AdultSidebarAvFlash）を
 * 呼び出すサーバーコンポーネント。非同期でのデータ取得を内包します。
 */
import SidebarWrapper from '@shared/layout/Sidebar/SidebarWrapper';

/**
 * ✅ 4. SEO設定
 */
import { constructMetadata } from '@shared/lib/metadata';

/**
 * ✅ 5. ページ遷移プログレスバー
 */
import RouteProgressBar from '@shared/common/RouteProgressBar';

const inter = Inter({ subsets: ["latin"] });

/**
 * 💡 強制的動的レンダリングの設定
 * ユーザーのホスト名（ドメイン）によって表示やブランド設定を切り替えるため、
 * 静的生成（SSG）ではなく dynamic 必須となります。
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * 💡 メタデータの動的生成
 */
export async function generateMetadata(): Promise<Metadata> {
  return constructMetadata();
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  /**
   * ✅ サイト設定の取得
   * リクエストヘッダーからホスト名を取得し、siteConfig からブランド情報を特定します。
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
          // CSS変数としてテーマカラーを注入。CSS側で var(--site-theme-color) として利用可能。
          // @ts-ignore
          "--site-theme-color": themeColor,
          "--bg-deep": BG_COLOR,
          "--grid-color": "rgba(233, 69, 96, 0.03)",
        } as React.CSSProperties}
      >
        {/* 🚀 ページ遷移時のプログレスバー & インジケーター */}
        <RouteProgressBar />

        {/* 背景のシステムグリッド・エフェクト */}
        <div className={styles.systemGrid} />

        {/* 1. 共通ヘッダー（サイト名等は内部で getSiteMetadata により自動解決） */}
        <Header />

        {/* 2. 告知バー（広告・年齢制限） */}
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

        {/* 3. メインレイアウト構造（サイドバー固定 + コンテンツ可変） */}
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
                  {/* SidebarWrapper自体が非同期サーバーコンポーネントです。
                    ホスト判定を行い、Tiper用(Sidebar) か AV Flash用(AdultSidebarAvFlash) を自動返却します。
                  */}
                  <SidebarWrapper />
                </Suspense>
              </div>
            </aside>

            {/* 🏗️ コンテンツストリーム（メイン表示領域） */}
            <main className={styles.mainContent}>
              <Suspense 
                fallback={
                  <div className={styles.loadingWrapper}>
                    <div className={styles.loadingPulse}>SYNCING_UNIFIED_GATEWAY...</div>
                  </div>
                }
              >
                {/* 各ページコンポーネント (page.tsx) */}
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
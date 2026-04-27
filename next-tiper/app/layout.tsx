/* eslint-disable @next/next/no-img-element */

import React, { Suspense } from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import styles from "./layout.module.css";

/**
 * 共通スタイル
 */
import '@/shared/styles/globals.css';

/**
 * 設定
 */
import { getSiteMetadata, getSiteColor } from '@/shared/lib/utils/siteConfig';

/**
 * コンポーネント
 */
import Header from '@/shared/components/organisms/common/Header';
import Footer from '@/shared/components/organisms/common/Footer';
import SidebarWrapper from '@/shared/layout/Sidebar/SidebarWrapper';
import RouteProgressBar from '@/shared/components/atoms/RouteProgressBar';

import { constructMetadata } from '@/shared/lib/utils/metadata';

const inter = Inter({ subsets: ["latin"] });

/**
 * ✅ metadata（修正済み）
 */
export async function generateMetadata(): Promise<Metadata> {
  const host = "tiper.live"; // ← 固定

  return constructMetadata({
    manualHost: host // ← ここ重要
  });
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  // ✅ headers完全削除
  const host = "tiper.live";

  const site = getSiteMetadata(host);

  const siteName = site?.site_name || "Tiper";
  const themeColor = getSiteColor(host); // ← 修正（siteNameじゃなくhost）

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
        }}
      >
        {/* Progress */}
        <Suspense fallback={null}>
          <RouteProgressBar />
        </Suspense>

        <div className={styles.systemGrid} />

        {/* Header */}
        <Header />

        {/* Ad */}
        <div className={styles.adDisclosure}>
          <div className={styles.adDisclosureInner}>
            <span className={styles.prLabel}>【PR】</span>
            本サイトはアフィリエイト広告を利用しています。
            {site?.site_group === 'adult' && (
              <span className={styles.ageLimit}>
                ※18歳未満の閲覧は禁止されています。
              </span>
            )}
          </div>
        </div>

        {/* Layout */}
        <div className={styles.layoutContainer}>
          <div className={styles.layoutWrapper}>

            {/* Sidebar */}
            <aside className={styles.sidebarArea}>
              <div className={styles.sidebarSticky}>
                <Suspense fallback={<div />}>
                  <SidebarWrapper />
                </Suspense>
              </div>
            </aside>

            {/* Main */}
            <main className={styles.mainContent}>
              <Suspense fallback={<div>Loading...</div>}>
                {children}
              </Suspense>
            </main>

          </div>
        </div>

        {/* Footer */}
        <Footer />
      </body>
    </html>
  );
}
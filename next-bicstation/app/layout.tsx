/**
 * =====================================================================
 * 🏗️ BICSTATION Root Layout (v5.9 Optimized)
 * 🛡️ Maya's Logic: 物理構造 v5.9 完全同期・Next.js 15 対応版
 * =====================================================================
 */
/* eslint-disable @next/next/no-img-element */

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import { headers } from "next/headers";

// ✅ 共通スタイル・設定
import '@/shared/styles/globals.css';
import { getSiteMetadata, getSiteColor } from '@/shared/lib/utils/siteConfig';

// ✅ レイアウト & サイドバー (PCSidebar は BicStation の心臓部)
import ClientStyles from '@/shared/components/atoms/ClientStyles';
import PCSidebar from '@/shared/layout/Sidebar/PCSidebar';

// ✅ 共通コンポーネント (共通ディレクトリからインポート)
import Header from '@/shared/components/organisms/common/Header';
import Footer from '@/shared/components/organisms/common/Footer';
import ChatBot from '@/shared/components/organisms/common/ChatBot';

import styles from "./layout.module.css";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
});

/**
 * 💡 SEO設定
 */
export const metadata: Metadata = {
  metadataBase: new URL("https://bicstation.com"),
  title: {
    template: "%s | BICSTATION PCカタログ",
    default: "BICSTATION - 最安PC・スペック比較ポータル",
  },
  description: "主要メーカーのノートPC・デスクトップPCをリアルタイムに比較。最新の価格、在庫状況、詳細スペックを網羅したPC専門ポータルサイトです。",
  keywords: ["PC比較", "レノボ", "ノートパソコン", "最安値", "スペック確認", "Bicstation", "中古PC"],
  authors: [{ name: "BICSTATION Team" }],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: "https://bicstation.com/",
    siteName: "BICSTATION",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "BICSTATION PCカタログ" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "BICSTATION PCカタログ",
    description: "最新PCの価格とスペックをリアルタイム比較",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#007bff",
};

/**
 * 💡 強制的動的レンダリング（マルチドメイン判定のため必須）
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  /**
   * ✅ Next.js 15 Async Header 対応
   * ホスト名を取得し、適切なテーマカラーを抽出
   */
  const headerList = await headers();
  const host = headerList.get('host') || "localhost";
  const site = getSiteMetadata(host);
  const themeColor = getSiteColor(site?.site_name || "bicstation");

  return (
    <html lang="ja">
      <body
        className={`${inter.className} ${styles.bodyWrapper}`}
        style={{
          backgroundColor: "#f4f7f9", // Bicstation特有のクリーンなグレー
          color: "#333",
          // CSS変数としてテーマカラーを注入
          // @ts-ignore
          "--site-theme-color": themeColor,
        } as React.CSSProperties}
      >
        {/* クライアントサイドでのスタイル補正 */}
        <ClientStyles themeColor={themeColor} />

        {/* 1. 固定ヘッダー */}
        <Suspense fallback={<div className="h-16 bg-white border-b border-gray-100 animate-pulse" />}>
          <Header />
        </Suspense>
        
        {/* 2. ステマ規制対応：告知バー */}
        <aside className={styles.adDisclosure} aria-label="広告告知">
          本サイトはアフィリエイト広告（広告・宣伝）を利用しています
        </aside>

        {/* --- 🏗️ メインレイアウト構造 --- */}
        <div className={styles.layoutContainer}>
          <div className={styles.layoutInner}>
            
            {/* 🚩 左側：スペック索引サイドバー（API/index.ts経由でデータを取得） */}
            <aside className={styles.sidebarSection}>
              <Suspense fallback={<div className="w-64 bg-gray-100 animate-pulse h-screen" />}>
                <PCSidebar />
              </Suspense>
            </aside>

            {/* 🚩 右側：カタログ・メインストリーム */}
            <main className={styles.mainContent}>
              <Suspense fallback={
                <div className={styles.loadingContainer}>
                  <div className={styles.spinner}></div>
                  <p>LOADING_PC_DATABASE...</p>
                </div>
              }>
                {children}
              </Suspense>
            </main>

          </div>
        </div>

        {/* 3. 共通フッター */}
        <Suspense fallback={<div className="h-40 bg-gray-50 animate-pulse" />}>
          <Footer />
        </Suspense>

        {/* 4. AIアシスタント (ChatBot) */}
        <Suspense fallback={null}>
          <ChatBot />
        </Suspense>
      </body>
    </html>
  );
}
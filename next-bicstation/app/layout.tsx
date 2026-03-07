/* eslint-disable @next/next/no-img-element */
/**
 * =====================================================================
 * 🏗️ BICSTATION Root Layout
 * 🛡️ Maya's Logic: 物理構造 v3.2 完全同期版
 * 修正内容: Header/Footer/ChatBot を common ディレクトリからインポート
 * =====================================================================
 */

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";

// ✅ 修正ポイント 1: グローバルCSS
import '@/shared/styles/globals.css';

// ✅ 修正ポイント 2: siteConfig は lib/utils/ 配下に存在
import { getSiteMetadata, getSiteColor } from '@/shared/lib/utils/siteConfig';

// ✅ 修正ポイント 3: layout 関連 (存在するパスのみインポート)
import ClientStyles from '@/shared/components/atoms/ClientStyles';
import PCSidebar from '@/shared/layout/Sidebar/PCSidebar';

// ✅ 修正ポイント 4: common ディレクトリから共通コンポーネントをインポート
import Header from '@/shared/components/organisms/common/Header';
import Footer from '@/shared/components/organisms/common/Footer';
import ChatBot from '@/shared/components/organisms/common/ChatBot';

import styles from "./layout.module.css";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
});

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 物理構造上の siteConfig.ts からデータを取得
  const site = getSiteMetadata();
  const themeColor = getSiteColor(site?.site_name || "bicstation");

  return (
    <html lang="ja">
      <body
        className={`${inter.className} ${styles.bodyWrapper}`}
        style={{
          backgroundColor: "#f4f7f9",
          color: "#333",
          // @ts-ignore
          "--site-theme-color": themeColor,
        } as React.CSSProperties}
      >
        <ClientStyles themeColor={themeColor} />

        <Suspense fallback={<div className="h-16 bg-white border-b border-gray-100 animate-pulse" />}>
          <Header />
        </Suspense>
        
        <aside className={styles.adDisclosure} aria-label="広告告知">
          本サイトはアフィリエイト広告（広告・宣伝）を利用しています
        </aside>

        {/* --- 🏗️ レイアウト構造 --- */}
        <div className={styles.layoutContainer}>
          <div className={styles.layoutInner}>
            
            {/* 🚩 左側：サイドバー */}
            <aside className={styles.sidebarSection}>
              <Suspense fallback={<div className="w-64 bg-gray-100 animate-pulse h-screen" />}>
                <PCSidebar />
              </Suspense>
            </aside>

            {/* 🚩 右側：メインコンテンツ */}
            <main className={styles.mainContent}>
              <Suspense fallback={
                <div className={styles.loadingContainer}>
                  <div className={styles.spinner}></div>
                  <p>Loading BICSTATION...</p>
                </div>
              }>
                {children}
              </Suspense>
            </main>

          </div>
        </div>

        <Suspense fallback={<div className="h-40 bg-gray-50 animate-pulse" />}>
          <Footer />
        </Suspense>

        <Suspense fallback={null}>
          <ChatBot />
        </Suspense>
      </body>
    </html>
  );
}
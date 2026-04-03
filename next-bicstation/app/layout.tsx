/**
 * =====================================================================
 * 🏗️ BICSTATION Root Layout (v6.5.0 Multi-Domain Master)
 * 🛡️ Maya's Logic: 司令塔機能搭載・ドメイン自動判別版
 * 💡 headers() からプロジェクトを特定し、全コンポーネントへ伝播させます。
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

// ✅ レイアウト & サイドバー
import ClientStyles from '@/shared/components/atoms/ClientStyles';
import PCSidebar from '@/shared/layout/Sidebar/PCSidebar';

// ✅ 共通コンポーネント
import Header from '@/shared/components/organisms/common/Header';
import Footer from '@/shared/components/organisms/common/Footer';
import ChatBot from '@/shared/components/organisms/common/ChatBot';

import styles from "./layout.module.css";
import Script from 'next/script';

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
});

/**
 * 💡 SEO設定 (最小構成)
 * 🚨 Digest エラー回避のため、Metadata API のみを使用。
 */
export const metadata: Metadata = {
  title: "BICSTATION - PCカタログ",
  description: "PC専門ポータルサイト",
  other: {
    "google-adsense-account": "ca-pub-9068876333048216",
  },
};

/**
 * 💡 Viewport 設定
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#007bff",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  /**
   * ✅ プロジェクト識別子の決定 (司令塔ロジック)
   */
  let themeColor = "#007bff"; 
  let currentProject = "bicstation"; // デフォルト

  try {
    const headerList = await headers();
    const host = headerList.get('host') || "bicstation.com";
    
    // 🛰️ ホスト名からサイト設定を解決
    const siteData = getSiteMetadata(host);
    currentProject = siteData?.site_name || "bicstation";
    
    // プロジェクトに基づいたカラーを決定
    themeColor = getSiteColor(currentProject);
  } catch (error) {
    console.error("Layout Async Resolution Error:", error);
  }

  return (
    <html lang="ja" suppressHydrationWarning data-project={currentProject}>
      <body
        className={`${inter.className} ${styles.bodyWrapper}`}
        suppressHydrationWarning={true} 
        style={{
          backgroundColor: "#f4f7f9",
          color: "#333",
          // @ts-ignore
          "--site-theme-color": themeColor,
          "--current-project": currentProject, // CSSから参照可能にする
        } as React.CSSProperties}
      >
        {/* AdSense スクリプト */}
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9068876333048216"
          crossOrigin="anonymous"
          strategy="afterInteractive" 
        />

        {/* クライアント側スタイル補正 (テーマカラー反映) */}
        <ClientStyles themeColor={themeColor} />

        {/* 1. ヘッダー (Suspense) */}
        <Suspense fallback={<div style={{ height: '64px', background: 'white' }} />}>
          <Header />
        </Suspense>
        
        {/* 2. ステマ規制対応 */}
        <aside className={styles.adDisclosure} aria-label="広告告知">
          本サイトはアフィリエイト広告を利用しています
        </aside>

        {/* --- 🏗️ メイン構造 --- */}
        <div className={styles.layoutContainer}>
          <div className={styles.layoutInner}>
            
            {/* サイドバー (Suspense) */}
            <aside className={styles.sidebarSection}>
              <Suspense fallback={<div style={{ width: '280px', height: '100vh', background: '#f8f9fa' }} />}>
                {/* 必要に応じて PCSidebar に currentProject を渡すことも可能 */}
                <PCSidebar />
              </Suspense>
            </aside>

            {/* メイン (Suspense) */}
            <main className={styles.mainContent}>
              <Suspense fallback={
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                  <p>LOADING ARCHIVE...</p>
                </div>
              }>
                {/* 💡 子要素 (page.tsx) は headers() を呼ぶことで、
                   この Layout と同じ currentProject 判定を共有できます。
                */}
                {children}
              </Suspense>
            </main>

          </div>
        </div>

        {/* 3. フッター (Suspense) */}
        <Suspense fallback={<div style={{ height: '200px', background: '#eee' }} />}>
          <Footer />
        </Suspense>

        {/* 4. AIチャットボット */}
        <Suspense fallback={null}>
          <ChatBot />
        </Suspense>
      </body>
    </html>
  );
}
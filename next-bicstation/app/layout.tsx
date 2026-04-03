/**
 * =====================================================================
 * 🏗️ BICSTATION Root Layout (v6.5.1 Multi-Domain Master)
 * 🛡️ Maya's Logic: 司令塔機能搭載・ビルド安全・ドメイン自動判別版
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
  title: "BICSTATION - PCカタログ & インテリジェンスアーカイブ",
  description: "次世代の知覚とPCデバイスの専門ポータルサイト",
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
   * 💡 ビルド時や headers() が未定義の環境でもクラッシュしないよう
   * 徹底的なフォールバックを構築しています。
   */
  let themeColor = "#007bff"; 
  let currentProject = "bicstation"; // デフォルト

  try {
    const headerList = await headers();
    const host = headerList.get('host') || "";
    
    // 🛰️ ホスト名からサイト設定を解決
    const siteData = getSiteMetadata(host);
    currentProject = siteData?.site_name || "bicstation";
    
    // プロジェクトに基づいたカラーを決定
    themeColor = getSiteColor(currentProject);
  } catch (error) {
    // ビルド時などはここを通るため、静的なデフォルト値を維持
    console.warn("Layout Async Resolution: Using static fallback during build.");
  }

  return (
    <html lang="ja" suppressHydrationWarning data-project={currentProject}>
      <head>
        {/* プロジェクト固有のテーマカラー反映用メタタグ */}
        <meta name="theme-color" content={themeColor} />
      </head>
      <body
        className={`${inter.className} ${styles.bodyWrapper}`}
        suppressHydrationWarning={true} 
        style={{
          backgroundColor: "#f4f7f9",
          color: "#333",
          // ✅ TypeScriptの型エラーを回避しつつ、CSS変数として注入
          // @ts-ignore
          "--site-theme-color": themeColor,
          "--current-project": currentProject, 
        } as React.CSSProperties}
      >
        {/* AdSense スクリプト (検証済みコード) */}
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9068876333048216"
          crossOrigin="anonymous"
          strategy="afterInteractive" 
        />

        {/* クライアント側スタイル補正 (スクロールバー等のテーマカラー化) */}
        <ClientStyles themeColor={themeColor} />

        {/* 1. ヘッダー (Suspense) */}
        <Suspense fallback={<div className="h-16 bg-white border-b border-gray-100" />}>
          <Header />
        </Suspense>
        
        {/* 2. ステマ規制対応：透明性確保のための常設表示 */}
        <aside className={styles.adDisclosure} aria-label="広告告知">
          本サイトはアフィリエイト広告を利用しています
        </aside>

        {/* --- 🏗️ メイン構造 --- */}
        <div className={styles.layoutContainer}>
          <div className={styles.layoutInner}>
            
            {/* サイドバー：プロジェクトごとに中身が動的に変わる PCSidebar */}
            <aside className={styles.sidebarSection}>
              <Suspense fallback={
                <div className="w-[280px] h-screen bg-gray-50 border-r border-gray-100 animate-pulse" />
              }>
                <PCSidebar />
              </Suspense>
            </aside>

            {/* メインコンテンツ：page.tsx の内容が展開される */}
            <main className={styles.mainContent}>
              <Suspense fallback={
                <div className="flex flex-col items-center justify-center p-20 text-gray-400">
                  <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="font-mono text-xs tracking-widest uppercase">Initializing Intelligence...</p>
                </div>
              }>
                {children}
              </Suspense>
            </main>

          </div>
        </div>

        {/* 3. フッター：ドメイン共通の基本情報を表示 */}
        <Suspense fallback={<div className="h-64 bg-gray-900" />}>
          <Footer />
        </Suspense>

        {/* 4. AIチャットボット：Maya または BicStation AI が起動 */}
        <Suspense fallback={null}>
          <ChatBot />
        </Suspense>
      </body>
    </html>
  );
}
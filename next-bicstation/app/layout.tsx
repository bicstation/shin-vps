/* eslint-disable @next/next/no-img-element */

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import { headers } from "next/headers";

import '@/shared/styles/globals.css';
// ✅ siteConfig v21.4 を使用
import { getSiteMetadata, getSiteColor } from '@/shared/lib/utils/siteConfig';
import ClientStyles from '@/shared/components/atoms/ClientStyles';
import PCSidebar from '@/shared/layout/Sidebar/PCSidebar';
import Header from '@/shared/components/organisms/common/Header';
import Footer from '@/shared/components/organisms/common/Footer';
import ChatBot from '@/shared/components/organisms/common/ChatBot';
import styles from "./layout.module.css";
import Script from 'next/script';

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
});

// メタデータは別途 constructMetadata を使うのが理想ですが、一旦静的に定義
export const metadata: Metadata = {
  title: "BICSTATION - PCカタログ & インテリジェンスアーカイブ",
  description: "次世代の知覚とPCデバイスの専門ポータルサイト",
  other: {
    "google-adsense-account": "ca-pub-9068876333048216",
  },
};

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
  
  // ✅ 初期値の設定
  let themeColor = "#007bff"; 
  let currentProjectTag = "bicstation"; 
  let siteName = "Bic Station";

  try {
    const headerList = await headers();
    // host を取得 (例: api-bicstation-host:3000 -> bicstation-host)
    const host = headerList.get('host')?.split(':')[0] || "bicstation.com";
    
    // 🛰️ ホスト名からサイト設定を解決
    const siteData = getSiteMetadata(host);
    
    if (siteData) {
      currentProjectTag = siteData.site_tag; // "bicstation"
      siteName = siteData.site_name;         // "Bic Station"
      
      // 🔥 重要: getSiteColor は 'site_name' を引数に取る設計になっています
      themeColor = getSiteColor(siteData.site_name);
    }
  } catch (error) {
    console.warn("Layout Async Resolution: Fallback used.", error);
  }

  return (
    <html lang="ja" suppressHydrationWarning data-project={currentProjectTag}>
      <head>
        <meta name="theme-color" content={themeColor} />
      </head>
      <body
        className={`${inter.className} ${styles.bodyWrapper}`}
        suppressHydrationWarning={true} 
        style={{
          backgroundColor: "#f4f7f9",
          color: "#333",
          // ✅ CSS変数の適用
          "--site-theme-color": themeColor,
          "--current-project-tag": currentProjectTag, 
        } as React.CSSProperties}
      >
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9068876333048216"
          crossOrigin="anonymous"
          strategy="afterInteractive" 
        />

        <ClientStyles themeColor={themeColor} />

        {/* ヘッダー */}
        <Suspense fallback={<div className="h-16 bg-white border-b border-gray-100" />}>
          <Header />
        </Suspense>
        
        <aside className={styles.adDisclosure} aria-label="広告告知">
          本サイトはアフィリエイト広告を利用しています
        </aside>

        <div className={styles.layoutContainer}>
          <div className={styles.layoutInner}>
            
            {/* サイドバー */}
            <aside className={styles.sidebarSection}>
              <Suspense fallback={<div className="w-[280px] h-screen bg-gray-50 border-r border-gray-100 animate-pulse" />}>
                <PCSidebar />
              </Suspense>
            </aside>

            {/* メインコンテンツ */}
            <main className={styles.mainContent}>
              <Suspense fallback={
                <div className="flex flex-col items-center justify-center p-20 text-gray-400">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="font-mono text-xs tracking-widest uppercase">Initializing {siteName}...</p>
                </div>
              }>
                {children}
              </Suspense>
            </main>

          </div>
        </div>

        {/* フッター */}
        <Suspense fallback={<div className="h-64 bg-gray-900" />}>
          <Footer />
        </Suspense>

        <Suspense fallback={null}>
          <ChatBot />
        </Suspense>
      </body>
    </html>
  );
}
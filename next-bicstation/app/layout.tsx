/* eslint-disable @next/next/no-img-element */

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import '@/shared/styles/globals.css';

// ✅ 最小限のインポートに留める
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

/**
 * 🛰️ 基本メタデータ (各 page.tsx の generateMetadata で上書きされます)
 */
export const metadata: Metadata = {
  title: "Integrated Fleet Portal",
  description: "Multi-Tenant Intelligence Network",
  other: {
    "google-adsense-account": "ca-pub-9068876333048216",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  /**
   * 🛡️ レイアウト側では重い判定を行わず、
   * 基本的な HTML 構造の維持に専念します。
   */
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        {/* Adsense 等のグローバルスクリプトのみ維持 */}
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9068876333048216"
          crossOrigin="anonymous"
          strategy="afterInteractive" 
        />
      </head>
      <body
        className={`${inter.className} ${styles.bodyWrapper}`}
        suppressHydrationWarning={true} 
      >
        {/* ヘッダー */}
        <Suspense fallback={<div className="h-16 bg-white border-b" />}>
          <Header />
        </Suspense>
        
        {/* 広告告知エリア */}
        <aside className={styles.adDisclosure}>
          本サイトはアフィリエイト広告を利用しています
        </aside>

        <div className={styles.layoutContainer}>
          <div className={styles.layoutInner}>
            
            {/* サイドバーセクション */}
            <aside className={styles.sidebarSection}>
              <Suspense fallback={<div className="w-[280px] h-screen bg-gray-50 animate-pulse" />}>
                <PCSidebar />
              </Suspense>
            </aside>

            {/* メインコンテンツ: ここに各 page.tsx の内容が入ります */}
            <main className={styles.mainContent}>
              <Suspense fallback={
                <div className="flex flex-col items-center justify-center p-20 text-gray-400">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="font-mono text-xs tracking-widest uppercase">Initializing Stream...</p>
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

        {/* 共通機能 */}
        <Suspense fallback={null}>
          <ChatBot />
        </Suspense>
      </body>
    </html>
  );
}
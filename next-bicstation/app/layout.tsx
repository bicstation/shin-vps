/* eslint-disable @next/next/no-img-element */
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import '@/shared/styles/globals.css';

// ✅ 修正: PCSidebar を直接呼ぶのではなく、自動振り分けの Wrapper を呼ぶ
import SidebarWrapper from '@/shared/layout/Sidebar/SidebarWrapper'; 
import Header from '@/shared/components/organisms/common/Header';
import Footer from '@/shared/components/organisms/common/Footer';
import ChatBot from '@/shared/components/organisms/common/ChatBot';
import styles from "./layout.module.css";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
});

/**
 * 🛰️ 基本メタデータ
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
  
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        {/* 🛡️ AdSense Critical Fix */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9068876333048216"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body
        className={`${inter.className} ${styles.bodyWrapper}`}
        suppressHydrationWarning={true} 
      >
        {/* ヘッダーセクション */}
        <Suspense fallback={<div className="h-16 bg-white border-b" />}>
          <Header />
        </Suspense>
        
        {/* 広告告知エリア */}
        <aside className={styles.adDisclosure}>
          本サイトはアフィリエイト広告を利用しています
        </aside>

        <div className={styles.layoutContainer}>
          <div className={styles.layoutInner}>
            
            {/* 🛸 サイドバーセクション: サイト種別に応じて自動切り替え */}
            <aside className={styles.sidebarSection}>
              <Suspense fallback={
                <div className="w-[280px] h-screen bg-gray-50 animate-pulse flex flex-col p-4 gap-4">
                  <div className="h-8 w-3/4 bg-gray-200 rounded" />
                  <div className="h-32 w-full bg-gray-200 rounded" />
                  <div className="h-32 w-full bg-gray-200 rounded" />
                </div>
              }>
                {/* ここで SidebarWrapper がドメインを判定し、PCSidebar か GeneralSidebar を選択します */}
                <SidebarWrapper />
              </Suspense>
            </aside>

            {/* メインコンテンツ */}
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

        {/* フッターセクション */}
        <Suspense fallback={<div className="h-64 bg-gray-900" />}>
          <Footer />
        </Suspense>

        {/* AIチャットボット */}
        <Suspense fallback={null}>
          <ChatBot />
        </Suspense>
      </body>
    </html>
  );
}
/* eslint-disable @next/next/no-img-element */

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import '@/shared/styles/globals.css';

import { getSiteMetadata } from '@/shared/lib/utils/siteConfig';
import LazySidebar from '@/shared/layout/Sidebar/LazySidebar';
import Header from '@/shared/components/organisms/common/HeaderLite';
import Footer from '@/shared/components/organisms/common/Footer';
import ChatBotLoader from '@/shared/components/organisms/common/ChatBotLoader';

import styles from "./layout.module.css";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
});

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

/**
 * ✅ 安全なコンテキスト取得（完全固定）
 */
function getPageContext() {
  const host = "bicstation.com"; // ← 固定（重要）

  const siteMeta = getSiteMetadata(host) || { site_group: 'general' };

  // 🚫 URL判定は一旦無効（安全優先）
  const isAdminPage = false;

  return {
    isAdminPage,
    isAdult: siteMeta.site_group === 'adult',
    siteTag: siteMeta.site_tag || 'default'
  };
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const { isAdminPage, isAdult } = getPageContext();

  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9068876333048216"
          crossOrigin="anonymous"
        ></script>
      </head>

      <body
        className={`${inter.className} ${styles.bodyWrapper} ${isAdult ? 'is-adult-theme' : 'is-general-theme'}`}
        suppressHydrationWarning={true}
      >

        {/* ヘッダー */}
        <Header />

        {/* 広告表記 */}
        {!isAdminPage && (
          <aside className={styles.adDisclosure}>
            本サイトはアフィリエイト広告を利用しています
          </aside>
        )}

        {/* レイアウト */}
        <div className={styles.layoutContainer}>
          <div className={`${styles.layoutInner} ${isAdminPage ? styles.adminLayout : ''}`}>

            {/* サイドバー */}
            {!isAdminPage && (
              <aside className={`${styles.sidebarSection} hidden md:block`}>
                <LazySidebar />
              </aside>
            )}

            {/* メイン */}
            <main className={`${styles.mainContent} ${isAdminPage ? styles.fullWidth : ''}`}>
              <Suspense fallback={
                <div className="flex flex-col items-center justify-center min-h-[60vh] p-20 text-gray-400">
                  <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mb-4" />
                  <p className="font-mono text-xs tracking-widest uppercase animate-pulse">
                    Initializing Interface...
                  </p>
                </div>
              }>
                {children}
              </Suspense>
            </main>

          </div>
        </div>

        {/* フッター + チャットボット */}
        {!isAdminPage && (
          <>
            <Suspense fallback={<div className="h-64 bg-gray-900 w-full" />}>
              <Footer />
            </Suspense>

            <ChatBotLoader />
          </>
        )}

      </body>
    </html>
  );
}
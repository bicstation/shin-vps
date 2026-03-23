/**
 * =====================================================================
 * 🏗️ BICSTATION Root Layout (v6.4.0 Lean)
 * 🛡️ Maya's Logic: メタデータ最小化・構造保護版
 * 💡 Digestエラーを回避するため、SEO設定を極限までシンプルにしました。
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
 * 🚨 Digest エラー回避のため、OGP画像や template 判定を一旦すべて削除しました。
 */
export const metadata: Metadata = {
  title: "BICSTATION - PCカタログ",
  // title: "1111111111 - 接続テスト", // ここを書き換える
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

/**
 * 💡 実行設定
 */
// export const dynamic = 'force-dynamic';
// export const revalidate = 0;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  /**
   * ✅ 非同期情報の取得
   * 💡 失敗してもテーマカラーだけは死守します。
   */
  let themeColor = "#007bff"; 

  try {
    const headerList = await headers();
    const host = headerList.get('host') || "bicstation-host";
    const siteData = getSiteMetadata(host);
    themeColor = getSiteColor(siteData?.site_name || "bicstation");
  } catch (error) {
    console.error("Layout Async Resolution Error:", error);
  }

  return (
    <html lang="ja" suppressHydrationWarning>
      {/* 🚨 <head> は Metadata API に任せるため、ここには書きません */}
      <body
        className={`${inter.className} ${styles.bodyWrapper}`}
        suppressHydrationWarning={true} 
        style={{
          backgroundColor: "#f4f7f9",
          color: "#333",
          // @ts-ignore
          "--site-theme-color": themeColor,
        } as React.CSSProperties}
      >
        {/* AdSense スクリプト */}
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9068876333048216"
          crossOrigin="anonymous"
          strategy="afterInteractive" 
        />

        {/* クライアント側スタイル補正 */}
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
                <PCSidebar />
              </Suspense>
            </aside>

            {/* メイン (Suspense) */}
            <main className={styles.mainContent}>
              <Suspense fallback={
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                  <p>LOADING...</p>
                </div>
              }>
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
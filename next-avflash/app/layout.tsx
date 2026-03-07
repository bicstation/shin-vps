/* eslint-disable @next/next/no-img-element */
// /home/maya/dev/shin-vps/next-avflash/app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import React, { Suspense } from 'react'; 
import { headers } from "next/headers";
import styles from "./layout.module.css";

/**
 * ✅ 1. スタイルのインポート
 */
import '@shared/styles/globals.css';

/**
 * ✅ 2. 共通ロジックのインポート
 * 修正: @shared/utils/siteConfig -> @shared/lib/utils/siteConfig
 */
import { getSiteMetadata, getSiteColor } from '@shared/lib/utils/siteConfig';

/**
 * ✅ 3. 共通レイアウトコンポーネントのインポート
 */
import Header from '@shared/components/organisms/common/Header';
import Footer from '@shared/components/organisms/common/Footer';

/**
 * ✅ 4. サイドバー
 * 修正: 不要な拡張子 (.tsx) を削除
 */
import SidebarWrapper from '@shared/layout/Sidebar/SidebarWrapper';

/**
 * ✅ 5. チャットボット・プログレスバー
 * 修正: 物理階層 components/ を追加
 */
import ChatBot from '@shared/components/organisms/common/ChatBot';
import RouteProgressBar from '@shared/components/atoms/RouteProgressBar';

const inter = Inter({
  subsets: ["latin"],
});

/**
 * 💡 強制的動的レンダリングの設定
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * 💡 SEOメタデータの設定 (AV FLASH 専用)
 */
export const metadata: Metadata = {
  metadataBase: new URL("https://avflash.xyz"),
  title: {
    template: "%s | AV FLASH - 新作・人気動画カタログ",
    default: "AV FLASH - 新作作品の最安比較ポータル",
  },
  description: "最新作から人気作までを網羅。価格比較、出演者情報、AI解析による属性情報をリアルタイムに集約したアダルトエンタメポータルです。",
  keywords: ["新作AV", "動画比較", "アダルトアフィリエイト", "AV FLASH", "サンプル動画"],
  authors: [{ name: "AV FLASH Team" }],
  robots: {
    index: true,
    follow: true,
    nocache: true,
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: "https://avflash.xyz/",
    siteName: "AV FLASH",
    title: "AV FLASH - 新作動画・作品情報ポータル",
    description: "人気作品を独自の視点で紹介。あなたの好みの作品がすぐに見つかる動画カタログサイト。",
    images: [
      {
        url: "/og-image-adult.png",
        width: 1200,
        height: 630,
        alt: "AV FLASH",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AV FLASH",
    description: "最新の動画作品情報をリアルタイム更新",
  },
};

/**
 * 💡 ビューポート設定
 */
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#ffc107",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // ✅ 共通設定からサイト情報を取得
  const headerList = await headers();
  const host = headerList.get('host') || "avflash.xyz";
  
  // 💡 siteConfig の関数を使用して動的にテーマを決定
  const site = getSiteMetadata(host);
  const themeColor = getSiteColor(site.site_name);

  // システムのベースカラー
  const BG_COLOR = "#0f0f0f";

  return (
    <html lang="ja" style={{ height: '100%', backgroundColor: BG_COLOR }}>
      <body
        className={`${inter.className} ${styles.bodyWrapper}`}
        style={{
          backgroundColor: BG_COLOR,
          color: "#ffffff",
          margin: 0,
          padding: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          // CSS変数としてテーマカラーを注入
          // @ts-ignore
          "--site-theme-color": themeColor,
          "--bg-deep": BG_COLOR,
        } as React.CSSProperties}
      >
        {/* 🚀 ページ遷移プログレスバー */}
        <RouteProgressBar />

        {/* 1. 共通ヘッダー */}
        <Suspense fallback={<div style={{ height: '60px', backgroundColor: '#1a1a1a' }} />}>
          <Header />
        </Suspense>

        {/* 2. 告知バー（広告・年齢制限） */}
        <div className={styles.adDisclosure}>
          <div className={styles.adDisclosureInner}>
            【PR】本サイトはアフィリエイト広告を利用しています。
            <span style={{ marginLeft: '10px', opacity: 0.8 }}>
              ※18歳未満の方の閲覧は固くお断りいたします。
            </span>
          </div>
        </div>

        {/* 3. メインレイアウト構造 (2カラム構成) */}
        <div className={styles.layoutContainer}>
          <div className={styles.layoutInner}>
            
            {/* 🏛️ 共通サイドバーエリア */}
            <aside className={styles.sidebarArea}>
              <div className={styles.sidebarSticky}>
                <Suspense fallback={
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <span className={styles.loadingPulse}>LOADING_SYSTEM_MATRIX...</span>
                  </div>
                }>
                  <SidebarWrapper />
                </Suspense>
              </div>
            </aside>

            {/* 🏗️ メインコンテンツ領域 */}
            <main className={styles.mainContent}>
              <Suspense fallback={
                <div style={{ padding: '40px' }}>
                  <span className={styles.loadingPulse}>SYNCING_GATEWAY...</span>
                </div>
              }>
                {children}
              </Suspense>
            </main>

          </div>
        </div>

        {/* 4. 共通フッター */}
        <Suspense fallback={<div style={{ height: '200px', backgroundColor: '#0a0a0a' }} />}>
          <Footer />
        </Suspense>

        {/* 5. チャットボット */}
        <Suspense fallback={null}>
          <ChatBot />
        </Suspense>
      </body>
    </html>
  );
}
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */
// @ts-nocheck
// /home/maya/dev/shin-vps/next-bic-saving/app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import React, { Suspense } from "react";
import { headers } from 'next/headers';
import Script from "next/script";
import styles from "./layout.module.css";

/**
 * ✅ 1. スタイルのインポート
 */
import '@shared/styles/globals.css';

/**
 * ✅ 2. 共通設定・サイドバーラッパーのインポート
 */
import { getSiteMetadata, getSiteColor } from '@shared/lib/utils/siteConfig';
import SidebarWrapper from '@shared/layout/Sidebar/SidebarWrapper';

/**
 * ✅ 3. 共通コンポーネント
 */
import Header from '@shared/components/organisms/common/Header';
import Footer from '@shared/components/organisms/common/Footer';
import ChatBot from '@shared/components/organisms/common/ChatBot';

const inter = Inter({ subsets: ["latin"] });

/**
 * 💡 Next.js 15 用の動的レンダリング設定
 * キャッシュによる情報の古色化を防ぎ、常に最新の節約情報を届けます。
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://bic-saving.com'),
  title: {
    template: "%s | ビック的節約生活",
    default: "ビック的節約生活 - 賢い買い物と最新テックで暮らしを最適化",
  },
  description: "日常の買い物から最新ガジェット、ネット回線の選び方まで。AI解析を活用して、あなたの生活コストを下げ、クオリティを上げる節約術を提案します。",
  other: {
    "google-adsense-account": "ca-pub-9068876333048216",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#ffcc00",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // ✅ 1. Next.js 15 仕様: headers() を await してコンテキストを確定
  let host = "bic-saving.com";
  let siteName = "bic-saving";
  let themeColor = "#ffcc00"; // Default Yellow

  try {
    const headerList = await headers();
    host = headerList.get('host') || "bic-saving.com";
    const site = getSiteMetadata(host);
    siteName = site?.site_name || "bic-saving";
    themeColor = getSiteColor(siteName);
  } catch (error) {
    // ビルド時はここを通るが、デフォルト値で継続
    console.log("[Layout] Using default theme context for build.");
  }

  return (
    <html lang="ja" style={{ height: '100%' }}>
      <head>
        {/* Google AdSense: 節約サイトの生命線 */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9068876333048216"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body 
        className={`${inter.className} ${styles.bodyWrapper}`}
        style={{ 
          '--site-theme-color': themeColor,
          '--bg-primary': '#ffffff',
          '--text-primary': '#333333',
          margin: 0,
          padding: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        } as React.CSSProperties}
      >
        {/* ① ヘッダー: サイト共通の顔 */}
        <Suspense fallback={<div style={{ height: '60px', backgroundColor: '#fff' }} />}>
          <Header />
        </Suspense>

        {/* ② 告知バー: 法令遵守・透明性の確保 */}
        <div style={{ 
          padding: "8px 15px", fontSize: "11px", textAlign: "center", 
          backgroundColor: "#fef9c3", color: "#854d0e", borderBottom: "1px solid #fde047",
          fontWeight: '500'
        }}>
          【PR】本サイトはアフィリエイト広告を利用して運営されています。
        </div>

        {/* ③ メインレイアウト領域 (Sidebar + Main Content) */}
        <div style={{ 
          display: 'flex', 
          flex: 1, 
          width: '100%', 
          maxWidth: '100vw',
          overflowX: 'hidden' 
        }}>
          {/* 🛰️ 司令部直轄: サイドバーラッパー（PC表示時に有効） */}
          <Suspense fallback={<div style={{ width: '280px', backgroundColor: '#f9fafb' }} />}>
            <SidebarWrapper />
          </Suspense>

          {/* コンテンツ本体: 読みやすさを重視した背景設定 */}
          <main style={{ 
            flexGrow: 1, 
            minWidth: 0, 
            backgroundColor: '#f4f4f5', // 落ち着いたグレー
            padding: '20px'
          }}>
            <Suspense fallback={
              <div style={{ padding: '50px', textAlign: 'center', color: '#a1a1aa', fontMono: 'true' }}>
                INITIALIZING_CONTENT_STREAM...
              </div>
            }>
              {children}
            </Suspense>
          </main>
        </div>

        {/* ④ フッター */}
        <Suspense fallback={<div className="h-40 bg-gray-50" />}>
          <Footer />
        </Suspense>

        {/* ⑤ チャットボット: AI節約アドバイザー */}
        <Suspense fallback={null}>
          <ChatBot />
        </Suspense>
      </body>
    </html>
  );
}
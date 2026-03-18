/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import React, { Suspense } from "react";
import { headers } from "next/headers";
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
import SidebarWrapper from '@shared/layout/Sidebar/SidebarWrapper'; // 👈 追加

/**
 * ✅ 3. 共通コンポーネント
 */
import Header from '@shared/components/organisms/common/Header';
import Footer from '@shared/components/organisms/common/Footer';
import ChatBot from '@shared/components/organisms/common/ChatBot';

const inter = Inter({ subsets: ["latin"] });

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
  // ✅ ホスト情報の取得とメタデータ判定
  const headerList = await headers();
  const host = headerList.get('host') || "bic-saving.com";
  
  const site = getSiteMetadata(host);
  const themeColor = getSiteColor(site.site_name);

  return (
    <html lang="ja" style={{ height: '100%' }}>
      <head>
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
        {/* ① ヘッダー */}
        <Suspense fallback={<div style={{ height: '60px', backgroundColor: '#fff' }} />}>
          <Header />
        </Suspense>

        {/* ② 告知バー */}
        <div style={{ 
          padding: "8px 15px", fontSize: "12px", textAlign: "center", 
          backgroundColor: "#f8f9fa", color: "#666", borderBottom: "1px solid #eee" 
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
          {/* 🛰️ 司令部直轄: サイドバーラッパー */}
          <Suspense fallback={<div style={{ width: '280px', backgroundColor: '#f4f4f4' }} />}>
            <SidebarWrapper />
          </Suspense>

          {/* コンテンツ本体 */}
          <main style={{ 
            flexGrow: 1, 
            minWidth: 0, // Flexboxの崩れ防止
            backgroundColor: site.site_group === 'adult' ? '#000' : '#f4f4f4',
            padding: '20px'
          }}>
            <Suspense fallback={
              <div style={{ padding: '50px', textAlign: 'center', color: '#999' }}>コンテンツを読み込み中...</div>
            }>
              {children}
            </Suspense>
          </main>
        </div>

        {/* ④ フッター */}
        <Suspense fallback={<div className="h-40 bg-gray-50" />}>
          <Footer />
        </Suspense>

        {/* ⑤ チャットボット */}
        <Suspense fallback={null}>
          <ChatBot />
        </Suspense>
      </body>
    </html>
  );
}
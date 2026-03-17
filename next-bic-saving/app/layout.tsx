/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import React, { Suspense } from "react";
import { headers } from "next/headers";
import Script from "next/script"; // ✅ 必須: Scriptコンポーネント
import styles from "./layout.module.css";

/**
 * ✅ 1. スタイルのインポート
 */
import '@shared/styles/globals.css';

/**
 * ✅ 2. 共通設定のインポート
 */
import { getSiteMetadata, getSiteColor } from '@shared/lib/utils/siteConfig';

/**
 * ✅ 3. 共通レイアウトコンポーネントのインポート
 */
import Header from '@shared/components/organisms/common/Header';
import Footer from '@shared/components/organisms/common/Footer';
import ChatBot from '@shared/components/organisms/common/ChatBot';

const inter = Inter({ subsets: ["latin"] });

/**
 * 💡 強制的動的レンダリングの設定 (Next.js 15)
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * 💡 SEOメタデータの設定
 */
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://bic-saving.com'),
  title: {
    template: "%s | ビック professional的節約生活",
    default: "ビック的節約生活 - 賢い買い物と最新テックで暮らしを最適化",
  },
  description: "日常の買い物から最新ガジェット、ネット回線の選び方まで。AI解析を活用して、あなたの生活コストを下げ、クオリティを上げる節約術を提案します。",
  keywords: ["節約術", "ポイ活", "ガジェット比較", "生活最適化", "ビック的節約生活"],
  // ✅ 4. Google AdSense 所有権確認タグの追加
  other: {
    "google-adsense-account": "ca-pub-9068876333048216",
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: "https://bic-saving.com/",
    siteName: "ビック的節約生活",
    title: "ビック的節約生活 - 賢い買い物ガイド",
    description: "AI解析で最適な節約プランを提案するライフスタイルメディア",
  },
};

/**
 * 💡 ビューポート設定
 */
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#ffcc00",
};

/**
 * 🏠 ルートレイアウトコンポーネント
 */
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // ✅ 共通設定から現在のホスト情報を取得 (Next.js 15 対応)
  const headerList = await headers();
  const host = headerList.get('host') || "bic-saving.com";
  
  const site = getSiteMetadata(host);
  const themeColor = getSiteColor(site.site_name);

  return (
    <html lang="ja" style={{ height: '100%' }}>
      <head>
        {/* ✅ 5. Google AdSense 審査・配信スクリプトの配置 */}
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
          // @ts-ignore -- CSSカスタムプロパティの注入
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
        {/* ① 共通ヘッダー */}
        <Suspense fallback={<div style={{ height: '60px', backgroundColor: '#fff' }} />}>
          <Header />
        </Suspense>

        {/* ② 告知バー (PR表記など) */}
        <div className={styles.adDisclosure} style={{ 
          padding: "8px 15px", 
          fontSize: "12px", 
          textAlign: "center", 
          backgroundColor: "#f8f9fa", 
          color: "#666", 
          borderBottom: "1px solid #eee" 
        }}>
          【PR】本サイトはアフィリエイト広告を利用して運営されています。
        </div>

        {/* ③ メインコンテンツ領域 */}
        <div className={styles.layoutContainer} style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Suspense fallback={
            <div style={{ padding: '50px', textAlign: 'center', color: '#999' }}>
              コンテンツを読み込み中...
            </div>
          }>
            <main style={{ flexGrow: 1 }}>
              {children}
            </main>
          </Suspense>
        </div>

        {/* ④ フッター */}
        <Suspense fallback={<div className="h-40 bg-gray-50 animate-pulse" />}>
          <Footer />
        </Suspense>

        {/* ⑤ AIチャットコンシェルジュ */}
        <Suspense fallback={null}>
          <ChatBot />
        </Suspense>
      </body>
    </html>
  );
}
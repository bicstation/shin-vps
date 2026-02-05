import type { Metadata } from "next";
import { Inter } from "next/font/google";
import React, { Suspense } from 'react'; // 💡 Suspense を追加
import styles from "./layout.module.css";

/**
 * ✅ 1. スタイルのインポート
 */
import '@shared/styles/globals.css';

/*
 * ✅ 2. 共通ロジックのインポート
 */
import { getSiteMetadata, getSiteColor } from '@shared/lib/siteConfig';

/**
 * ✅ 3. 共通レイアウトコンポーネントのインポート
 */
import Header from '@shared/layout/Header';
import Footer from '@shared/layout/Footer';
import Sidebar from '@shared/layout/Sidebar';

/**
 * ✅ 4. チャットボットコンポーネントのインポート
 */
import ChatBot from '@shared/common/ChatBot';

const inter = Inter({
  subsets: ["latin"],
});

/**
 * 💡 SEOメタデータの設定
 */
export const metadata: Metadata = {
  metadataBase: new URL("https://avflash.xyz"),
  title: {
    template: "%s | AV FLASH - 新作・人気動画カタログ",
    default: "AV FLASH - MGS動画・新作作品の最安比較ポータル",
  },
  description: "MGS（ミュージック・グラビア・ソフトウェア）の最新作から人気作までを網羅。価格比較、出演者情報、ユーザーレビューをリアルタイムに集約したアダルトエンタメポータルです。",
  keywords: ["MGS動画", "新作AV", "動画比較", "アダルトアフィリエイト", "AV FLASH", "サンプル動画"],
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
    description: "MGSの人気作品を独自の視点で紹介。あなたの好みの作品がすぐに見つかる動画カタログサイト。",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // ✅ 共通設定からサイト情報を取得
  const site = getSiteMetadata();
  const themeColor = getSiteColor(site.site_name);

  return (
    <html lang="ja">
      <body
        className={`${inter.className} ${styles.bodyWrapper}`}
        style={{
          backgroundColor: "#0f0f0f",
          color: "#ffffff",
          // @ts-ignore
          "--site-theme-color": themeColor,
        } as React.CSSProperties}
      >
        {/* 💡 動的なフック（URL取得など）を含む可能性があるコンポーネントを 
             Suspense で囲むことで、ビルドエラーを回避します */}
        <Suspense fallback={<div style={{ height: '60px', backgroundColor: '#1a1a1a' }} />}>
          <Header />
        </Suspense>

        <div 
          className={styles.adDisclosure} 
          style={{ backgroundColor: "#1a1a1a", borderBottom: "1px solid #333", color: "#ccc", padding: "8px 15px", fontSize: "12px", textAlign: "center" }}
        >
          【PR】本サイトはアフィリエイト広告を利用しています。
          <span style={{ marginLeft: "10px", color: "#ff4444", fontWeight: "bold" }}>
            ※18歳未満の方の閲覧は固くお断りいたします。
          </span>
        </div>

        <div className={styles.layoutContainer}>
          <div className={styles.layoutInner}>
            {/* 💡 Sidebar も動的なリンク生成を含む可能性があるためラップ */}
            <Suspense fallback={<div style={{ width: '250px' }} />}>
              <Sidebar />
            </Suspense>

            <main className={styles.mainContent}>
              {/* 💡 ページ本体も Suspense で囲むのが Next.js 15 ビルドの定石です */}
              <Suspense fallback={<div>Loading content...</div>}>
                {children}
              </Suspense>
            </main>
          </div>
        </div>

        <Footer />

        {/* 💡 ChatBot は確実に useSearchParams 等を使うため必須 */}
        <Suspense fallback={null}>
          <ChatBot />
        </Suspense>
      </body>
    </html>
  );
}
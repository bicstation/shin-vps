import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import styles from "./layout.module.css";

/**
 * ✅ 1. スタイルのインポート
 * プロジェクト構成に合わせた globals.css の参照
 */
import '@shared/styles/globals.css';

/**
 * ✅ 2. 共通設定・ライブラリ
 */
import { getSiteMetadata, getSiteColor } from '@shared/lib/siteConfig';

/**
 * ✅ 3. 共通コンポーネント (shared)
 */
import Header from '@shared/layout/Header';
import Footer from '@shared/layout/Footer';
import ChatBot from '@shared/common/ChatBot';
import ClientStyles from '@shared/layout/ClientStyles';

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
});

/**
 * 💡 SEOメタデータの設定 (BICSTATION 固有)
 */
export const metadata: Metadata = {
  metadataBase: new URL("https://bicstation.com"),
  title: {
    template: "%s | BICSTATION PCカタログ",
    default: "BICSTATION - 最安PC・スペック比較ポータル",
  },
  description: "Lenovoをはじめとする主要メーカーのノートPC・デスクトップPCをリアルタイムに比較。最新の価格、在庫状況、詳細スペックを網羅したPC専門ポータルサイトです。",
  keywords: ["PC比較", "レノボ", "ノートパソコン", "最安値", "スペック確認", "Bicstation", "中古PC", "ワークステーション"],
  authors: [{ name: "BICSTATION Team" }],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: "https://bicstation.com/",
    siteName: "BICSTATION",
    title: "BICSTATION - 最安PC・スペック比較ポータル",
    description: "メーカー直販サイトをスクレイピングし、最新のPC情報を集約。あなたの最適な1台が見つかる比較サイト。",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BICSTATION PCカタログ",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BICSTATION PCカタログ",
    description: "最新PCの価格とスペックをリアルタイム比較",
  },
};

/**
 * 💡 ビューポート設定 (Next.js 15 仕様)
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#007bff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // ✅ 共通ロジックからサイト情報を取得
  const site = getSiteMetadata();
  const themeColor = getSiteColor(site.site_name);

  return (
    <html lang="ja">
      <body
        className={`${inter.className} ${styles.bodyWrapper}`}
        style={{
          backgroundColor: "#f4f7f9",
          color: "#333",
          // ✅ サーバーコンポーネントで動的なテーマカラーを扱うためのCSS変数注入
          // @ts-ignore
          "--site-theme-color": themeColor,
        } as React.CSSProperties}
      >
        {/* クライアント側での動的スタイル適用（プログレスバーやテーマ調整用） */}
        <ClientStyles themeColor={themeColor} />

        {/* ✅ 修正ポイント: Header を Suspense でラップ 
          Header内で useSearchParams や usePathname を使用している場合のビルドエラー（404ページ生成時など）を防ぎます。
        */}
        <Suspense fallback={<div className="h-16 bg-white border-b border-gray-100 animate-pulse" />}>
          <Header />
        </Suspense>
        
        {/* 📢 広告表記（リーガル対応） */}
        <aside className={styles.adDisclosure} aria-label="広告告知">
          本サイトはアフィリエイト広告（広告・宣伝）を利用しています
        </aside>

        <div className={styles.layoutContainer}>
          <div className={styles.layoutInner}>
            <Suspense fallback={
              <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Loading BICSTATION...</p>
              </div>
            }>
              <main className={styles.mainContentFull}>
                {children}
              </main>
            </Suspense>
          </div>
        </div>

        <Footer />

        {/* ✅ ChatBotは navigation Hook を使用するため Suspense で保護 */}
        <Suspense fallback={null}>
          <ChatBot />
        </Suspense>
      </body>
    </html>
  );
}
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import styles from "./layout.module.css";

/**
 * ✅ 1. スタイルのインポート
 * 整理後の shared/styles/globals.css を参照
 */
import '@shared/components/styles/globals.css';

/**
 * ✅ 2. 共通設定ライブラリ
 * 整理後の shared/lib/siteConfig.tsx を参照
 */
import { getSiteMetadata, getSiteColor } from '@shared/components/lib/siteConfig';

/**
 * ✅ 3. 共通コンポーネント (shared)
 * 整理後の shared/layout/ フォルダを参照
 */
import Header from '@shared/components/layout/Header';
import Footer from '@shared/components/layout/Footer';
import Sidebar from '@shared/components/layout/Sidebar';
import ChatBot from '@shared/components/common/ChatBot';

/**
 * ✅ 4. プロジェクト内コンポーネント
 * shared/layout/ に移動した ClientStyles を参照
 */
import ClientStyles from '@shared/components/layout/ClientStyles';

const inter = Inter({
  subsets: ["latin"],
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
 * 💡 ビューポート設定
 */
export const viewport = {
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
          // ✅ サーバーコンポーネントで動的な色を扱うためのCSS変数注入
          // @ts-ignore
          "--site-theme-color": themeColor,
        } as React.CSSProperties}
      >
        <Header />
        
        <div className={styles.adDisclosure} style={{ padding: "8px 15px", fontSize: "12px", textAlign: "center", backgroundColor: "#e9ecef", color: "#666" }}>
          本サイトはアフィリエイト広告（広告・宣伝）を利用しています
        </div>

        <div className={styles.layoutContainer}>
          <div className={styles.layoutInner}>
            {/* ✅ 根本解決：Sidebarとchildrenを一括でSuspenseで囲む 
                 これがないと build 時に useSearchParams エラーで停止します */}
            <Suspense fallback={<div className={styles.loading}>Loading...</div>}>
              <Sidebar />
              <main className={styles.mainContent}>
                {children}
              </main>
            </Suspense>
          </div>
        </div>

        <Footer />

        {/* ✅ ChatBotも navigation Hook を使う可能性があるため Suspense で保護 */}
        <Suspense fallback={null}>
          <ChatBot />
        </Suspense>

        {/* 💡 クライアント側で実行するスタイル注入 ('@shared/layout/ClientStyles' を使用) */}
        <ClientStyles themeColor={themeColor} />
      </body>
    </html>
  );
}
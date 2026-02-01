// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import styles from "./layout.module.css";

/**
 * ✅ 1. スタイルのインポート
 * shared/components/styles/globals.css を参照
 */
import '@shared/components/styles/globals.css';

/*
 * ✅ 2. 共通ロジックのインポート
 * shared/components/lib/ フォルダの設定ファイルを読み込み
 */
import { getSiteMetadata, getSiteColor } from '@shared/components/lib/siteConfig';

/**
 * ✅ 3. 共通レイアウトコンポーネントのインポート
 * shared/components/layout/ フォルダから読み込み
 */
import Header from '@shared/components/layout/Header';
import Footer from '@shared/components/layout/Footer';
import Sidebar from '@shared/components/layout/Sidebar';

/**
 * ✅ 4. チャットボットコンポーネントのインポート
 * 💡 修正ポイント: shared/components/common/ChatBot.tsx を参照
 */
import ChatBot from '@shared/components/common/ChatBot';

const inter = Inter({
  subsets: ["latin"],
});

/**
 * 💡 SEOメタデータの設定
 * サーバーコンポーネントである layout.tsx でのみ定義可能。
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
  // ✅ 共通設定からサイト情報を取得（shared/components/lib/siteConfig.tsx を使用）
  const site = getSiteMetadata();
  const themeColor = getSiteColor(site.site_name);

  return (
    <html lang="ja">
      <body
        className={`${inter.className} ${styles.bodyWrapper}`}
        style={{
          backgroundColor: "#0f0f0f",
          color: "#ffffff",
          // 💡 CSS 変数を style プロパティで注入（サイトごとに色が自動で変わる）
          // @ts-ignore (CSS変数を渡すための型回避)
          "--site-theme-color": themeColor,
        } as React.CSSProperties}
      >
        {/* 1. 共通ヘッダー */}
        <Header />

        {/* 2. ⚖️ 広告表記・年齢制限バー */}
        <div 
          className={styles.adDisclosure} 
          style={{ backgroundColor: "#1a1a1a", borderBottom: "1px solid #333", color: "#ccc", padding: "8px 15px", fontSize: "12px", textAlign: "center" }}
        >
          【PR】本サイトはアフィリエイト広告を利用しています。
          <span style={{ marginLeft: "10px", color: "#ff4444", fontWeight: "bold" }}>
            ※18歳未満の方の閲覧は固くお断りいたします。
          </span>
        </div>

        {/* 3. 🚩 メインレイアウト構造 */}
        <div className={styles.layoutContainer}>
          <div className={styles.layoutInner}>
            <Sidebar />

            <main className={styles.mainContent}>
              {children}
            </main>
          </div>
        </div>

        {/* 4. 共通フッター */}
        <Footer />

        {/* 5. AIチャットコンシェルジュ */}
        <ChatBot />
      </body>
    </html>
  );
}
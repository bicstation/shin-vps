import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import styles from "./layout.module.css"; // ✅ CSSモジュールのインポート

// ✅ パス・エイリアス (@/) を使用してインポート
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// ✅ AIチャットコンシェルジュコンポーネントをインポート
import ChatBot from "@/components/common/ChatBot";

// ✅ 共通カラー設定をインポート
import { COLORS } from "@/constants";

const inter = Inter({
  subsets: ["latin"],
});

/**
 * 💡 SEOメタデータの設定
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
  themeColor: COLORS?.SITE_COLOR || "#007bff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${inter.className} ${styles.bodyWrapper}`}
        style={{
          backgroundColor: COLORS?.BACKGROUND || "#f4f7f9",
        }}
      >
        {/* 全ページ共通ヘッダー */}
        <Header />

        {/* ⚖️ ステマ規制対策：PR表記 */}
        <div className={styles.adDisclosure}>
          本サイトはアフィリエイト広告（広告・宣伝）を利用しています
        </div>

        {/* 🚩 メインコンテンツ
          flexGrow: 1 により、コンテンツが少ないページでもフッターが最下部に固定されます
        */}
        <main className={styles.mainContainer}>
          {children}
        </main>

        {/* 全ページ共通フッター */}
        <Footer />

        {/* ✅ AIチャットコンシェルジュ */}
        <ChatBot />
      </body>
    </html>
  );
}
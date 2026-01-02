import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// ✅ パス・エイリアス (@/) を使用してインポート
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// ✅ 共通カラー設定をインポート（constants.ts がある場合）
// もし作成していない場合は、直接 "#007bff" と書いてもOKです
import { COLORS } from "@/constants";

const inter = Inter({ 
  subsets: ["latin"],
});

/**
 * 💡 SEOメタデータの設定
 */
export const metadata: Metadata = {
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
    description: "メーカー直販サイトをスクレイピングし, 最新のPC情報を集約。あなたの最適な1台が見つかる比較サイト。",
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
  maximumScale: 1,
  // ✅ 共通カラーから取得
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
        className={inter.className} 
        style={{ 
          margin: 0, 
          padding: 0, 
          // ✅ 背景色も共通設定に合わせると統一感が出ます
          backgroundColor: COLORS?.BACKGROUND || "#f4f7f9", 
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column"
        }}
      >
        {/* 全ページ共通ヘッダー */}
        <Header />

        {/* メインコンテンツエリア */}
        <main style={{ flexGrow: 1 }}>
          {children}
        </main>

        {/* 全ページ共通フッター */}
        <Footer />
      </body>
    </html>
  );
}
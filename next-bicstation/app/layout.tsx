import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// ✅ 外部JS読み込み用の Script コンポーネントは不要になったため削除

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
        className={inter.className} 
        style={{ 
          margin: 0, 
          padding: 0, 
          backgroundColor: COLORS?.BACKGROUND || "#f4f7f9", 
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* 全ページ共通ヘッダー */}
        <Header />

        {/* 🚩 重要修正ポイント: 
          mainに flex-direction: column を直接書くと、
          中の page.tsx の Sidebar と Main が縦に並んでしまいます。
          ここは中身の自由度を保つために最低限の flexGrow だけにします。
        */}
        <main style={{ flexGrow: 1 }}>
          {children}
        </main>

        {/* 全ページ共通フッター */}
        <Footer />

        {/* ✅ AIチャットコンシェルジュ */}
        <ChatBot />

        {/* ❌ 外部JS (/scripts/common-utils.js) の読み込みを削除しました。
           今後は utils/format.ts などに定義した decodeHtml 関数を 
           各コンポーネントで import して使用する形式に移行します。
        */}
      </body>
    </html>
  );
}
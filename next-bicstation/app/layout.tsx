import type { Metadata } from "next"; // Viewportのインポートを削除
import { Inter } from "next/font/google";
import "./globals.css";

// ✅ パス・エイリアス (@/) を使用してインポート
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// ✅ 共通カラー設定をインポート
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
 * 型指定 (: Viewport) を削除してビルドエラーを回避
 */
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5, // ユーザーがピンチズーム（拡大）できるようにし、アクセシビリティを向上
  themeColor: COLORS?.SITE_COLOR || "#007bff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        {/* スマホ特有の横揺れを根本から防ぐためのグローバルスタイル */}
        <style dangerouslySetInnerHTML={{ __html: `
          html, body {
            overflow-x: hidden;
            width: 100%;
            -webkit-text-size-adjust: 100%; /* iOSの勝手なフォントサイズ変更を防止 */
          }
          main {
            width: 100%;
            max-width: 100vw;
            overflow-x: hidden;
          }
          /* モバイル環境でのタップ時の青い枠線を消す */
          * {
            -webkit-tap-highlight-color: transparent;
          }
        `}} />
      </head>
      <body 
        className={inter.className} 
        style={{ 
          margin: 0, 
          padding: 0, 
          backgroundColor: COLORS?.BACKGROUND || "#f4f7f9", 
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          position: "relative"
        }}
      >
        {/* 全ページ共通ヘッダー */}
        <Header />

        {/* メインコンテンツエリア 
            スマホ時に左右に適度な余白ができるよう、各ページのコンテナ側で制御するのが理想ですが、
            ここでは全体を包む flex コンテナとして定義します */}
        <main style={{ 
          flexGrow: 1, 
          display: "flex", 
          flexDirection: "column" 
        }}>
          {children}
        </main>

        {/* 全ページ共通フッター */}
        <Footer />
      </body>
    </html>
  );
}
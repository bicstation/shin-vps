import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// ✅ 外部JS読み込み用の Script コンポーネントをインポート
import Script from "next/script";

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
 * metadataBaseを設定することで、OGP画像などの相対パスが正しく解決されます。
 * title.templateにより、各個別ページのタイトルが自動的に「製品名 | BICSTATION...」の形式になります。
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
      {/* 🚩 headタグは書きません。Next.jsがmetadataオブジェクトから自動生成し、適切な順序で挿入します */}
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

        {/* メインコンテンツエリア */}
        <main style={{ 
          flexGrow: 1, 
          display: "flex", 
          flexDirection: "column" 
        }}
        >
          {children}
        </main>

        {/* 全ページ共通フッター */}
        <Footer />

        {/* ✅ AIチャットコンシェルジュを全ページに配置 */}
        <ChatBot />

        {/* ✅ 外部JSの読み込み (common-utils.js) 
            strategy="afterInteractive" を指定することで、メインコンテンツの表示を妨げずに読み込みます。
        */}
        <Script 
          src="/scripts/common-utils.js" 
          strategy="afterInteractive" 
        />
      </body>
    </html>
  );
}
import type { Metadata } from "next";
import { Inter } from "next/font/google";
// ✅ shared へのパスを ../../ に修正
import "../../shared/globals.css"; 
import styles from "./layout.module.css";

// ✅ 共通設定ライブラリ
import { getSiteMetadata, getSiteColor } from "../../shared/siteConfig";

// ✅ 共通コンポーネント (shared)
import Header from "../../shared/layout/Header";
import Footer from "../../shared/layout/Footer";
import Sidebar from "../../shared/layout/Sidebar";
import ChatBot from "../../shared/components/ChatBot";

// ✅ プロジェクト内コンポーネント (app/components/)
import ClientStyles from "../components/ClientStyles";

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
  themeColor: "#007bff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const site = getSiteMetadata();
  const themeColor = getSiteColor(site.site_name);

  return (
    <html lang="ja">
      <body
        className={`${inter.className} ${styles.bodyWrapper}`}
        style={{
          backgroundColor: "#f4f7f9",
          color: "#333",
        }}
      >
        <Header />
        <div className={styles.adDisclosure}>
          本サイトはアフィリエイト広告（広告・宣伝）を利用しています
        </div>
        <div className={styles.layoutContainer}>
          <div className={styles.layoutInner}>
            <Sidebar />
            <main className={styles.mainContent}>
              {children}
            </main>
          </div>
        </div>
        <Footer />
        <ChatBot />
        {/* 💡 クライアント側で実行するスタイル注入 */}
        <ClientStyles themeColor={themeColor} />
      </body>
    </html>
  );
}
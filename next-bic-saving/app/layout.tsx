import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../shared/globals.css"; // ✅ shared直下の共通CSSを読み込み
import styles from "./layout.module.css";

// ✅ shared (共通ライブラリ) からサイト設定をインポート
import { getSiteMetadata, getSiteColor } from "../shared/siteConfig";

// ✅ shared/layout フォルダに集約した共通コンポーネントをインポート
import Header from "../shared/layout/Header";
import Footer from "../shared/layout/Footer";
import Sidebar from "../shared/layout/Sidebar";

// ✅ 各サイト固有のコンポーネント（必要に応じて shared 移動も検討）
import ChatBot from "../shared/components/ChatBot";

const inter = Inter({ subsets: ["latin"] });

/**
 * 💡 SEOメタデータの設定 (ビック的節約生活)
 */
export const metadata: Metadata = {
  metadataBase: new URL("https://bic-saving.com"),
  title: {
    template: "%s | ビック的節約生活",
    default: "ビック的節約生活 - 賢い買い物と最新テックで暮らしを最適化",
  },
  description: "日常の買い物から最新ガジェット、ネット回線の選び方まで。AI解析を活用して、あなたの生活コストを下げ、クオリティを上げる節約術を提案します。",
  keywords: ["節約術", "ポイ活", "ガジェット比較", "生活最適化", "ビック的節約生活"],
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: "https://bic-saving.com/",
    siteName: "ビック的節約生活",
    title: "ビック host的節約生活 - 賢い買い物ガイド",
    description: "AI解析で最適な節約プランを提案するライフスタイルメディア",
  },
};

/**
 * 💡 ビューポート設定
 */
export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2ecc71", // 節約・クリーンをイメージしたグリーン系
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // ✅ 共通設定からサイト名に基づいたカラー等を取得
  const site = getSiteMetadata();
  const themeColor = getSiteColor(site.site_name);

  return (
    <html lang="ja">
      <body className={`${inter.className} ${styles.bodyWrapper}`}>
        {/* 1. 共通ヘッダー (shared/layout) */}
        <Header />

        {/* 2. 告知バー (PR表記) */}
        <div className={styles.adDisclosure}>
          【PR】本サイトはアフィリエイト広告を利用して運営されています。
        </div>

        {/* 3. レイアウト構造 (サイドバー + メイン) */}
        <div className={styles.layoutContainer}>
          <div className={styles.layoutInner}>
            {/* 共通サイドバー (shared/layout) */}
            <Sidebar />

            {/* メインページ内容 */}
            <main className={styles.mainContent}>
              {children}
            </main>
          </div>
        </div>

        {/* 4. 共通フッター (shared/layout) */}
        <Footer />

        {/* 5. AIチャットコンシェルジュ */}
        <ChatBot />

        {/* 💡 動的スタイルの注入 (一般サイト用の明るい配色) */}
        <style jsx global>{`
          :root {
            --site-theme-color: ${themeColor};
            --bg-primary: #ffffff;
            --text-primary: #333333;
          }
          body {
            background-color: var(--bg-primary);
            color: var(--text-primary);
          }
          a {
            color: ${themeColor};
            text-decoration: none;
            transition: opacity 0.2s;
          }
          a:hover {
            opacity: 0.7;
          }
          
          /* 節約サイト用のクリーンなスクロールバー */
          ::-webkit-scrollbar {
            width: 8px;
          }
          ::-webkit-scrollbar-track {
            background: #f1f1f1;
          }
          ::-webkit-scrollbar-thumb {
            background: #ccc;
            border-radius: 4px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: ${themeColor};
          }
        `}</style>
      </body>
    </html>
  );
}
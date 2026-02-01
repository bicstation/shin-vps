// 💡 Linter と TypeScript のチェックを無効化
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import styles from "./layout.module.css";

/**
 * ✅ 1. スタイルのインポート
 * 共通デザインシステム（shared/components/styles/globals.css）を適用
 */
import '@shared/components/styles/globals.css';

/**
 * ✅ 2. 共通設定のインポート
 * サイトごとのメタデータやテーマカラーを動的に取得
 */
import { getSiteMetadata, getSiteColor } from '@shared/components/lib/siteConfig';

/**
 * ✅ 3. 共通レイアウトコンポーネントのインポート
 * Header, Footer, ChatBot は全ページ共通。Sidebarは page.tsx 側で個別に制御
 */
import Header from '@shared/components/layout/Header';
import Footer from '@shared/components/layout/Footer';
import ChatBot from '@shared/components/common/ChatBot';

const inter = Inter({ subsets: ["latin"] });

/**
 * 💡 SEOメタデータの設定
 * metadataBase は、OGP画像などの絶対パス解決に使用されます。
 */
export const metadata: Metadata = {
  // metadataBase: new URL("https://bic-saving.com"),
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    template: "%s | ビック professional的節約生活",
    default: "ビック的節約生活 - 賢い買い物と最新テックで暮らしを最適化",
  },
  description: "日常の買い物から最新ガジェット、ネット回線の選び方まで。AI解析を活用して、あなたの生活コストを下げ、クオリティを上げる節約術を提案します。",
  keywords: ["節約術", "ポイ活", "ガジェット比較", "生活最適化", "ビック的節約生活"],
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: "https://bic-saving.com/",
    siteName: "ビック的節約生活",
    title: "ビック적節約生活 - 賢い買い物ガイド",
    description: "AI解析で最適な節約プランを提案するライフスタイルメディア",
  },
};

/**
 * 💡 ビューポート設定
 */
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#2ecc71",
};

/**
 * 🏠 ルートレイアウトコンポーネント
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 共通ロジックから現在のサイト情報を取得
  const site = getSiteMetadata();
  const themeColor = getSiteColor(site.site_name);

  return (
    <html lang="ja">
      <body 
        className={`${inter.className} ${styles.bodyWrapper}`}
        style={{ 
          // @ts-ignore -- CSSカスタムプロパティの注入
          '--site-theme-color': themeColor,
          '--bg-primary': '#ffffff',
          '--text-primary': '#333333',
          margin: 0,
          padding: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column'
        } as React.CSSProperties}
      >
        {/* ① 共通ヘッダー */}
        <Header />

        {/* ② 告知バー (PR表記など) */}
        <div className={styles.adDisclosure} style={{ 
          padding: "8px 15px", 
          fontSize: "12px", 
          textAlign: "center", 
          backgroundColor: "#f8f9fa", 
          color: "#666", 
          borderBottom: "1px solid #eee" 
        }}>
          【PR】本サイトはアフィリエイト広告を利用して運営されています。
        </div>

        {/* ③ メインコンテンツ領域
            flexGrow: 1 を指定することで、コンテンツが少ない場合でもフッターを最下部に押し下げます。
            layoutContainer 自体も flex 構造にすることで、内部の children (page.tsx) との整合性を取ります。
        */}
        <div className={styles.layoutContainer} style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Suspense fallback={
            <div style={{ padding: '50px', textAlign: 'center', color: '#999' }}>
              コンテンツを読み込み中...
            </div>
          }>
            {/* ここに各ページの Sidebar + MainContent が流し込まれます */}
            {children}
          </Suspense>
        </div>

        {/* ④ 共通フッター */}
        <Footer />

        {/* ⑤ AIチャットコンシェルジュ (クライアントサイドでの読み込みを想定) */}
        <Suspense fallback={null}>
          <ChatBot />
        </Suspense>
      </body>
    </html>
  );
}
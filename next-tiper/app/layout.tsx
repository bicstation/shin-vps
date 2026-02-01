/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import styles from "./layout.module.css";

/**
 * ✅ 1. スタイルのインポート
 * 共有ディレクトリ shared/styles/globals.css を参照
 * Tailwind CSS や共通のリセットスタイルが含まれます
 */
import '@shared/styles/globals.css';

/**
 * ✅ 2. 共通設定とコンポーネント
 * getSiteMetadata: 現在のサイト名を取得
 * getSiteColor: サイト名に応じたテーマカラー(Hex)を取得
 */
import { getSiteMetadata, getSiteColor } from '@shared/components/lib/siteConfig';
import Header from '@shared/components/layout/Header';
import Footer from '@shared/components/layout/Footer';
import Sidebar from '@shared/components/layout/Sidebar';

/**
 * ✅ 3. SEO設定
 * shared 内の共通ロジックでメタデータを構築
 */
import { constructMetadata } from '@shared/components/lib/metadata';

const inter = Inter({ subsets: ["latin"] });

/**
 * 💡 メタデータの生成
 * 各サイト共通の SEO 基本設定を適用
 */
export const metadata: Metadata = constructMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // ✅ サイト設定の取得
  const site = getSiteMetadata();
  const themeColor = getSiteColor(site.site_name);

  return (
    <html lang="ja">
      <body 
        className={`${inter.className} ${styles.bodyWrapper}`}
        style={{
          backgroundColor: "#111122",
          color: "#ffffff",
          // ✅ CSS変数 (--site-theme-color) を注入。
          // これにより CSS Modules 内で var(--site-theme-color) が使用可能になる
          // @ts-ignore
          "--site-theme-color": themeColor,
          "--bg-deep": "#111122",
        } as React.CSSProperties}
      >
        {/* 1. 共通ヘッダー (shared から読み込み) */}
        <Header />

        {/* 2. アダルトサイト特有の告知・年齢制限バー */}
        <div 
          className={styles.adDisclosure} 
          style={{ 
            padding: "8px 15px", 
            fontSize: "12px", 
            textAlign: "center", 
            backgroundColor: "#1a1a2e", 
            color: "#888",
            borderBottom: "1px solid #3d3d6650"
          }}
        >
          【PR】本サイトは広告を利用しています。
          <span 
            className={styles.ageLimit} 
            style={{ 
              marginLeft: "10px", 
              color: "#ff4444", 
              fontWeight: "bold" 
            }}
          >
            ※18歳未満の閲覧は固く禁止されています。
          </span>
        </div>

        {/* 3. メインレイアウト構造 */}
        <div className={styles.layoutContainer}>
          <div className={styles.layoutInner}>
            {/* ✅ 重要：Suspense によるラップ
               Sidebar 内で useSearchParams 等を使用している際の 
               Server-side rendering 時のハイドレーションエラーを防止します。
            */}
            <Suspense 
              fallback={
                <div style={{ color: '#666', padding: '20px', textAlign: 'center' }}>
                  Loading Layout Content...
                </div>
              }
            >
              {/* 共通サイドバー */}
              <Sidebar />
              
              {/* メインコンテンツエリア */}
              <main className={styles.mainContent}>
                {children}
              </main>
            </Suspense>
          </div>
        </div>

        {/* 4. 共通フッター (shared から読み込み) */}
        <Footer />
      </body>
    </html>
  );
}
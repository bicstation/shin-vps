/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import styles from "./layout.module.css";

/**
 * ✅ 1. スタイルのインポート
 * 共有ディレクトリ shared/styles/globals.css を参照
 */
import '@shared/styles/globals.css';

/**
 * ✅ 2. 共通設定とコンポーネント
 */
import { getSiteMetadata, getSiteColor } from '@shared/components/lib/siteConfig';
import Header from '@shared/components/layout/Header';
import Footer from '@shared/components/layout/Footer';
import Sidebar from '@shared/components/layout/Sidebar';

/**
 * ✅ 3. SEO設定
 */
import { constructMetadata } from '@shared/components/lib/metadata';

const inter = Inter({ subsets: ["latin"] });

/**
 * 💡 強制的動的レンダリングの設定
 * これにより、ビルド時の固定情報ではなく、アクセス時のホスト名に基づいた判定を強制します。
 * ハイドレーションエラーを根本から解決するための最重要設定です。
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * 💡 メタデータの動的生成
 * 引数なしの getSiteMetadata() を使用し、ホスト名から自動判定させます。
 */
export async function generateMetadata(): Promise<Metadata> {
  const site = getSiteMetadata();
  return constructMetadata(
    undefined, 
    undefined, 
    undefined, 
    "" // ホスト名運用なのでプレフィックスは不要
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // ✅ サイト設定の取得
  // 💡 引数を削除。siteConfig.tsx 内のホスト名判定ロジックにすべて任せます。
  const site = getSiteMetadata();
  const themeColor = getSiteColor(site.site_name);

  return (
    <html lang="ja">
      <body 
        className={`${inter.className} ${styles.bodyWrapper}`}
        style={{
          backgroundColor: "#111122",
          color: "#ffffff",
          // ✅ CSS変数を動的に注入
          // @ts-ignore
          "--site-theme-color": themeColor,
          "--bg-deep": "#111122",
        } as React.CSSProperties}
      >
        {/* 1. 共通ヘッダー */}
        <Header />

        {/* 2. アダルトサイト特有の告知・年齢制限バー (サイト名が Tiper / AV Flash の場合のみ表示などの条件分岐も可能) */}
        {site.site_group === 'adult' && (
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
        )}

        {/* 3. メインレイアウト構造 */}
        <div className={styles.layoutContainer}>
          <div className={styles.layoutInner}>
            {/* ✅ SidebarやMain内での不一致を防ぐSuspense */}
            <Suspense 
              fallback={
                <div style={{ color: '#666', padding: '20px', textAlign: 'center' }}>
                  Loading Layout Content...
                </div>
              }
            >
              <Sidebar />
              
              {/* メインコンテンツエリア */}
              <main className={styles.mainContent}>
                {children}
              </main>
            </Suspense>
          </div>
        </div>

        {/* 4. 共通フッター */}
        <Footer />
      </body>
    </html>
  );
}
/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import { headers } from "next/headers";
import styles from "./layout.module.css";

/**
 * ✅ 1. スタイルのインポート
 */
import '@shared/styles/globals.css';

/**
 * ✅ 2. 共通設定とコンポーネント
 */
import { getSiteMetadata, getSiteColor } from '@shared/lib/siteConfig';
import Header from '@shared/layout/Header';
import Footer from '@shared/layout/Footer';
import Sidebar from '@shared/layout/Sidebar';

// ✅ APIから統計データを取得する関数（既存のAPIライブラリからインポート想定）
// もし未作成の場合は、仮のデータ構造を定義します
import { getAdultSidebarStats } from '@shared/lib/api/django';

/**
 * ✅ 3. SEO設定
 */
import { constructMetadata } from '@shared/lib/metadata';

const inter = Inter({ subsets: ["latin"] });

/**
 * 💡 強制的動的レンダリングの設定
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * 💡 メタデータの動的生成
 */
export async function generateMetadata(): Promise<Metadata> {
  const headerList = await headers();
  const host = headerList.get('host') || "localhost";
  return constructMetadata();
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  /**
   * ✅ サイト設定の取得
   */
  const headerList = await headers();
  const host = headerList.get('host') || "localhost";
  const site = getSiteMetadata(host);
  const themeColor = getSiteColor(site.site_name);

  // 💡 サイドバーに表示する統計データをサーバーサイドで取得
  let sidebarData = { makers: [], actresses: [], series: [] };
  try {
    if (site.site_group === 'adult') {
      // Django API等から実際のカウントデータを取得
      sidebarData = await getAdultSidebarStats();
    }
  } catch (e) {
    console.error("Sidebar data fetch failed:", e);
  }

  return (
    <html lang="ja">
      <body 
        className={`${inter.className} ${styles.bodyWrapper}`}
        style={{
          backgroundColor: "#111122",
          color: "#ffffff",
          // @ts-ignore
          "--site-theme-color": themeColor,
          "--bg-deep": "#111122",
        } as React.CSSProperties}
      >
        {/* 1. 共通ヘッダー */}
        <Header />

        {/* 2. アダルトサイト特有の告知バー */}
        {site.site_group === 'adult' && (
          <div 
            className={styles.adDisclosure} 
            style={{ 
              padding: "8px 15px", 
              fontSize: "12px", 
              text-align: "center", 
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
            {/* 💡 Suspenseで包むことで、サイドバーの読み込みを待機可能に */}
            <Suspense 
              fallback={
                <div style={{ color: '#666', padding: '20px', textAlign: 'center' }}>
                  Loading Layout...
                </div>
              }
            >
              {/* ✅ サイドバーに取得したデータを渡す 
                  makersだけでなくactressesやseriesも渡せるようにPropsを拡張
              */}
              <Sidebar 
                makers={sidebarData.makers} 
                recentPosts={[]} 
              />
              
              {/* 各ページのコンテンツ */}
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
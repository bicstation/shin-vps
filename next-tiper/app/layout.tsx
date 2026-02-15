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

  // 背景色や基本定数を一元管理
  const BG_COLOR = "#06060a";

  return (
    <html lang="ja" style={{ height: '100%' }}>
      <body 
        className={`${inter.className} ${styles.bodyWrapper}`}
        style={{
          backgroundColor: BG_COLOR,
          color: "#ffffff",
          margin: 0,
          padding: 0,
          // 💡 重要: sticky が機能するには body 自体に overflow: visible が必要 (hiddenは厳禁)
          overflowX: "hidden",
          overflowY: "visible",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          // @ts-ignore
          "--site-theme-color": themeColor,
          "--bg-deep": BG_COLOR,
          "--grid-color": "rgba(233, 69, 96, 0.03)",
        } as React.CSSProperties}
      >
        {/* 背景のシステムグリッド */}
        <div className={styles.systemGrid} />

        {/* 1. 共通ヘッダー */}
        <Header />

        {/* 2. 告知バー（広告・年齢制限） */}
        {site.site_group === 'adult' && (
          <div 
            className={styles.adDisclosure} 
            style={{ 
              width: '100%',
              padding: "8px 15px", 
              fontSize: "11px", 
              textAlign: "center",
              backgroundColor: "rgba(0, 0, 0, 0.85)", 
              color: "#94a3b8",
              borderBottom: "1px solid rgba(233, 69, 96, 0.3)",
              backdropFilter: "blur(12px)",
              zIndex: 1000,
              position: "relative",
              fontFamily: "'JetBrains Mono', monospace"
            }}
          >
            【PR】本サイトは広告を利用しています。
            <span 
              className={styles.ageLimit} 
              style={{ 
                marginLeft: "10px", 
                color: "#e94560", 
                fontWeight: "900",
                letterSpacing: "0.1em"
              }}
            >
              ※18歳未満の閲覧は固く禁止されています。
            </span>
          </div>
        )}

        {/* 3. メインレイアウト構造 */}
        {/* 💡 解決の鍵: 
          layoutContainer が「画面の高さを下限」として自動で伸びるように flex: 1 0 auto を設定。
          alignItems: stretch により、page.tsx 内のサイドバーとメインが「同じ高さ」を共有できるようにします。
        */}
        <div 
          className={styles.layoutContainer} 
          style={{ 
            flex: "1 0 auto", 
            display: "flex", 
            flexDirection: "column",
            width: "100%",
            position: "relative"
          }}
        >
          <main 
            className={styles.mainContent} 
            style={{ 
              flex: "1 0 auto", 
              display: "flex", 
              flexDirection: "column",
              width: "100%"
            }}
          >
            <Suspense 
              fallback={
                <div 
                  style={{ 
                    flex: 1, 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    minHeight: "60vh",
                    fontFamily: "'JetBrains Mono', monospace",
                    color: "#e94560"
                  }}
                >
                  <div className={styles.loadingPulse}>INITIALIZING_DATABASE_LINK...</div>
                </div>
              }
            >
              {/* page.tsx の中身 (wrapper) がここに展開される */}
              {children}
            </Suspense>
          </main>
        </div>

        {/* 4. 共通フッター */}
        {/* 💡 フッターがサイドバーに被らないよう、適切な余白を確保 */}
        <Suspense fallback={<div style={{ height: '200px', backgroundColor: BG_COLOR }} />}>
          <Footer />
        </Suspense>
      </body>
    </html>
  );
}
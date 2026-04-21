/* eslint-disable @next/next/no-img-element */
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import { headers } from "next/headers";
import '@/shared/styles/globals.css';

/**
 * ✅ 内部ライブラリのインポート
 * ヘッダーで使用している判定ロジックを共有するために getSiteMetadata を利用
 */
import { getSiteMetadata } from '@/shared/lib/utils/siteConfig';
import SidebarWrapper from '@/shared/layout/Sidebar/SidebarWrapper'; 
import Header from '@/shared/components/organisms/common/Header';
import Footer from '@/shared/components/organisms/common/Footer';
import ChatBot from '@/shared/components/organisms/common/ChatBot';
import styles from "./layout.module.css";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Integrated Fleet Portal",
  description: "Multi-Tenant Intelligence Network",
  other: {
    "google-adsense-account": "ca-pub-9068876333048216",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

/**
 * 🛡️ Maya's Logic 継承版: 高精度サイト・ページ判定
 * サーバーサイドで「どのサイト」の「どのページ」かを確定させます。
 */
async function getPageContext() {
  const headersList = await headers();
  
  // 1. サイト・アイデンティティの特定
  const host = headersList.get("host") || "";
  const siteMeta = getSiteMetadata(host) || { site_group: 'general' };
  
  // 2. パスの特定
  const fullPath = headersList.get("x-url") || headersList.get("x-invoke-path") || "";
  
  // 3. 管理画面フラグの判定（Hardened Edition）
  // - パスによる判定
  const isTargetRoot = fullPath.includes('/admin') || fullPath.includes('/console') || fullPath.includes('/dashboard');
  
  // - 認証関連ページ（これらは管理機能の一部であってもサイドバーを出す場合がある）
  const isAuthPage = 
    fullPath.includes('/login') || 
    fullPath.includes('/signup') || 
    fullPath.includes('/logout') ||
    fullPath.includes('/register');

  // - ポート 8083 (管理用) または サブドメイン等のホスト名判定
  const isSpecificAdminHost = host.includes(":8083") || host.startsWith("admin.");

  // 最終的な「管理ページ（フルワイド表示）」判定
  // 「管理ルート」かつ「認証中ではない」、または「管理専用ホスト」の場合
  const isAdminPage = isSpecificAdminHost || (isTargetRoot && !isAuthPage);

  return {
    isAdminPage,
    isAdult: siteMeta.site_group === 'adult',
    siteTag: siteMeta.site_tag || 'default'
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // コンテキストの取得
  const { isAdminPage, isAdult } = await getPageContext();

  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9068876333048216"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body
        className={`${inter.className} ${styles.bodyWrapper} ${isAdult ? 'is-adult-theme' : 'is-general-theme'}`}
        suppressHydrationWarning={true} 
      >
        {/* ヘッダー：全画面共通判定ロジックを内包しているため、常に表示 */}
        <Suspense fallback={<div className="h-[70px] bg-black border-b border-gray-800" />}>
          <Header />
        </Suspense>
        
        {/* 広告免責事項：一般ユーザー向けの非管理ページのみ表示 */}
        {!isAdminPage && (
          <aside className={styles.adDisclosure}>
            本サイトはアフィリエイト広告を利用しています
          </aside>
        )}

        <div className={styles.layoutContainer}>
          <div className={`${styles.layoutInner} ${isAdminPage ? styles.adminLayout : ''}`}>
            
            {/* サイドバー：isAdminPage（管理画面内部）でない場合に表示 */}
            {!isAdminPage && (
              <aside className={styles.sidebarSection}>
                <Suspense fallback={
                  <div className="w-[280px] h-screen bg-gray-50/50 animate-pulse flex flex-col p-4 gap-4 border-r">
                    <div className="h-8 w-3/4 bg-gray-200 rounded" />
                    <div className="h-32 w-full bg-gray-200 rounded" />
                    <div className="h-32 w-full bg-gray-200 rounded" />
                  </div>
                }>
                  <SidebarWrapper />
                </Suspense>
              </aside>
            )}

            {/* メインコンテンツ：管理画面内部の場合は fullWidth スタイルを適用 */}
            <main className={`${styles.mainContent} ${isAdminPage ? styles.fullWidth : ''}`}>
              <Suspense fallback={
                <div className="flex flex-col items-center justify-center min-h-[60vh] p-20 text-gray-400">
                  <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mb-4" />
                  <p className="font-mono text-xs tracking-widest uppercase animate-pulse">Initializing Interface...</p>
                </div>
              }>
                {children}
              </Suspense>
            </main>

          </div>
        </div>

        {/* フッターとチャットボット：管理ページ以外、かつ一般公開ページでのみ表示 */}
        {!isAdminPage && (
          <>
            <Suspense fallback={<div className="h-64 bg-gray-900 w-full" />}>
              <Footer />
            </Suspense>

            {/* チャットボットはオーバーレイなので Suspense 最小限 */}
            <Suspense fallback={null}>
              <ChatBot />
            </Suspense>
          </>
        )}
      </body>
    </html>
  );
}
/* eslint-disable @next/next/no-img-element */

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import { headers } from "next/headers";

import '@/shared/styles/globals.css';

import { getSiteMetadata } from '@/shared/lib/utils/siteConfig';
import Header from '@/shared/components/organisms/common/HeaderLite';
import Footer from '@/shared/components/organisms/common/Footer';
import ChatBotLoader from '@/shared/components/organisms/common/ChatBotLoader';

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

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * ✅ siteConfigを“必ず通す”コンテキスト取得
 */
async function getPageContext() {
  let host = "bicstation.com";

  try {
    const h = await headers();
    host = h.get("host") || host;
  } catch {}

  const siteMeta = getSiteMetadata(host) || { site_group: 'general' };

  return {
    isAdminPage: false,
    isAdult: siteMeta.site_group === 'adult',
    siteTag: siteMeta.site_tag || 'default'
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

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
        suppressHydrationWarning
      >

        {/* 🔹 最小ヘッダー（弱くする） */}
        <Header />

        {/* 🔹 メイン（集中領域） */}
        <main
          style={{
            maxWidth: '720px',
            margin: '0 auto',
            padding: '16px',
          }}
        >
          <Suspense
            fallback={
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400">
                <div className="w-8 h-8 border-4 border-gray-300 border-t-orange-500 rounded-full animate-spin mb-3" />
                <p className="text-xs tracking-widest uppercase animate-pulse">
                  Loading...
                </p>
              </div>
            }
          >
            {children}
          </Suspense>
        </main>

        {/* 🔹 PR表記（下に移動） */}
        {!isAdminPage && (
          <div
            style={{
              fontSize: '11px',
              textAlign: 'center',
              color: '#888',
              marginTop: '24px',
            }}
          >
            ※本サイトはアフィリエイト広告を利用しています
          </div>
        )}

        {/* 🔹 フッター */}
        {!isAdminPage && (
          <Suspense fallback={<div className="h-32 bg-gray-900 w-full" />}>
            <Footer />
          </Suspense>
        )}

        {/* 🔹 チャット（軽量維持） */}
        {!isAdminPage && <ChatBotLoader />}

      </body>
    </html>
  );
}
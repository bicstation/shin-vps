/* eslint-disable @next/next/no-img-element */

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import '@/shared/styles/globals.css';
import '@/shared/styles/markdown.css';

import Header from '@/shared/components/organisms/common/Header';
import Footer from '@/shared/components/organisms/common/Footer';
// import ChatBotLoader from '@/shared/components/organisms/common/ChatBotLoader';

import styles from "./layout.module.css";

/**
 * =====================================================================
 * 🌐 Font
 * =====================================================================
 */

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
});

/**
 * =====================================================================
 * 🛰️ Metadata
 * =====================================================================
 */

export const metadata: Metadata = {
  metadataBase:
    new URL(
      'https://bicstation.com'
    ),
  title:
    '用途別にわかるおすすめPC比較 | BIC STATION',
  description:
    'AI画像生成・ゲーム・動画編集・普段使いまで。用途別におすすめPCをわかりやすく比較できるPC選びサポートサイト。',
  other: {
    'google-adsense-account':
      'ca-pub-9068876333048216',
  },
}
/**
 * =====================================================================
 * 📱 Viewport
 * =====================================================================
 */

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

/**
 * =====================================================================
 * 🚀 Root Layout
 * =====================================================================
 *
 * IMPORTANT:
 * - No headers()
 * - No async layout
 * - No force-dynamic
 * - No revalidate
 *
 * Keep root layout PURE for stable prerendering.
 * =====================================================================
 */

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  /**
   * =================================================================
   * Temporary Static Context
   * =================================================================
   */

  const isAdminPage = false;
  const isAdult = false;

  return (
    <html
      lang="ja"
      suppressHydrationWarning
    >
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9068876333048216"
          crossOrigin="anonymous"
        />
      </head>

      <body
        className={`
          ${inter.className}
          ${styles.bodyWrapper}
          ${isAdult ? 'is-adult-theme' : 'is-general-theme'}
        `}
        suppressHydrationWarning
      >

        {/* =========================================================
           🔹 Header
        ========================================================= */}

        <Header />

        {/* =========================================================
           🔹 Main Content
        ========================================================= */}

        <main
          style={{
            maxWidth: '720px',
            margin: '0 auto',
            padding: '16px',
          }}
        >
          {children}
        </main>

        {/* =========================================================
           🔹 Affiliate Notice
        ========================================================= */}

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

        {/* =========================================================
           🔹 Footer
        ========================================================= */}

        {!isAdminPage && (
          <Footer />
        )}

        {/* =========================================================
           🔹 ChatBot
        ========================================================= */}

        {/*
        <ChatBotLoader />
        */}

      </body>
    </html>
  );
}
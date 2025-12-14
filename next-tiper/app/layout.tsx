// ファイル名: C:\dev\SHIN-VPS\next-tiper\app\layout.tsx (最終版)

import type { Metadata } from "next";
import { Inter } from "next/font/google"; 
import "./globals.css";
import React from 'react';
import Link from 'next/link';

// Inter フォントを定義
const inter = Inter({ 
  subsets: ["latin"],
});

// メタデータは共通
export const metadata: Metadata = {
  title: "Tiper Live Staging",
  description: "Next.js App Router Layout for Staging Deployment Check",
};

// RootLayoutのコンポーネント定義
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  // デモ用タイトル (環境変数から取得するなど、実際のタイトルに合わせてください)
  // NEXT_PUBLIC_APP_TITLEはビルド時に注入されます
  const title = process.env.NEXT_PUBLIC_APP_TITLE || "Tiper Live (STAGING)";

  // === スタイル定義（かっこいいダークテーマ） ===

  const headerStyle: React.CSSProperties = {
    background: '#1f1f3a', // Dark header
    color: '#e94560', // Accent color for text
    padding: '15px 20px',
    borderBottom: '3px solid #e94560', // Red accent line
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.5)',
  };

  const asideStyle: React.CSSProperties = {
    width: '200px',
    background: '#2b2b4d', // Dark sidebar background
    padding: '20px',
    borderRight: '1px solid #3d3d66',
    color: 'white',
    flexShrink: 0,
    minHeight: 'calc(100vh - 120px)' // ヘッダーとフッターを引いた高さ
  };

  const linkStyle: React.CSSProperties = {
    textDecoration: 'none',
    color: '#99e0ff', // Light blue link color
    display: 'block',
    padding: '8px 0',
    transition: 'color 0.2s',
    fontWeight: 'bold',
  };

  const footerStyle: React.CSSProperties = {
    background: '#1f1f3a',
    color: '#99e0ff',
    padding: '10px 20px',
    textAlign: 'center',
    borderTop: '3px solid #e94560',
    boxShadow: '0 -2px 5px rgba(0, 0, 0, 0.5)',
  };

  return (
    // 💡 HTMLタグ全体にダークな背景色とフォントクラスを設定
    <html lang="ja" style={{ backgroundColor: '#111122' }}> 
      <body className={inter.className} style={{ margin: 0, padding: 0 }}>
        <div style={{ fontFamily: 'Arial, sans-serif', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          
          {/* 1. ヘッダー (共通) */}
          <header style={headerStyle}>
            <h1 style={{ margin: 0, fontSize: '1.8em' }}>{title}</h1>
            <p style={{ margin: '5px 0 0 0', fontSize: '0.9em', color: '#ccc' }}>全ページ共通のナビゲーションエリア</p>
          </header>

          {/* 2. メインコンテンツとサイドバーのコンテナ */}
          <div style={{ display: 'flex', flexGrow: 1 }}>
            
            {/* 3. サイドバー (共通) */}
            <aside style={asideStyle}>
              <h3 style={{ marginTop: 0, color: '#e94560' }}>ナビゲーション</h3>
              <ul style={{ listStyleType: 'none', padding: 0 }}>
                <li><Link href="/" style={linkStyle}>メインダッシュボード</Link></li>
                <li><Link href="/tiper/" style={linkStyle}>Tiperトップへ</Link></li>
                <li><Link href="/saving/" style={linkStyle}>Savingへ</Link></li>
                <li style={{ marginTop: '15px', fontSize: '0.8em', color: '#aaa' }}>（App Routerデモ共通部）</li>
              </ul>
            </aside>

            {/* 4. メインエリア (page.tsxの内容が children に渡される) */}
            <main style={{ flexGrow: 1, padding: '20px', backgroundColor: '#111122', color: 'white' }}>
              {children} 
            </main>
          </div>

          {/* 5. フッター (共通) */}
          <footer style={footerStyle}>
            <p style={{ margin: 0 }}>&copy; {new Date().getFullYear()} {title} | Powering Next-Gen Services</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
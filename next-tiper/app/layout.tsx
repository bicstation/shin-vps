// ファイル名: C:\dev\SHIN-VPS\next-tiper\app\layout.tsx (フッターリンク追加版)

import type { Metadata } from "next";
import { Inter } from "next/font/google"; 
import "./globals.css";
import Link from 'next/link'; // 内部ナビゲーション用。今回はヘッダーで使用。

const inter = Inter({ 
  subsets: ["latin"],
});

// メタデータは共通
export const metadata: Metadata = {
  title: "Tiper Live", 
  description: "Tiper Live Data Hub and Content Platform",
};

// 仮のHeader/Footerスタイル (globals.cssに移行予定)
const commonStyle: React.CSSProperties = {
    background: '#1f1f3a', // Dark header/footer
    color: '#e94560', // Accent color
    padding: '15px 20px',
    borderBottom: '3px solid #e94560',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.5)',
};

// RootLayoutのコンポーネント定義
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  const title = process.env.NEXT_PUBLIC_APP_TITLE || "Tiper Live";

  return (
    // HTMLタグ全体にダークな背景色とフォントクラスを設定
    <html lang="ja" style={{ backgroundColor: '#111122' }}> 
      <body className={inter.className} style={{ margin: 0, padding: 0 }}>
        <div style={{ fontFamily: 'Arial, sans-serif', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          
          {/* 1. Header Component (共通) */}
          <header style={commonStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ margin: 0, fontSize: '1.8em' }}>{title}</h1>
                
                {/* 共通ナビゲーションエリア (仮) */}
                <nav>
                    <Link href="/" style={{ color: '#99e0ff', margin: '0 10px', textDecoration: 'none' }}>TOP</Link>
                    <Link href="/category" style={{ color: '#99e0ff', margin: '0 10px', textDecoration: 'none' }}>カテゴリ</Link>
                    <Link href="/static" style={{ color: '#99e0ff', margin: '0 10px', textDecoration: 'none' }}>静的ページ</Link>
                </nav>
            </div>
          </header>

          {/* 2. メインコンテナ - childrenがページ固有のレイアウトを定義する */}
          <main style={{ flexGrow: 1, backgroundColor: '#111122', color: 'white' }}>
            {children} 
          </main>

          {/* 3. Footer Component (共通) */}
          <footer style={{...commonStyle, borderTop: commonStyle.borderBottom, borderBottom: 'none'}}>
            
            {/* 💡 4つの外部ドメインリンクを追加 (プレースホルダーURLを使用) */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: '25px', 
                marginBottom: '15px', // コピーライトの上にスペース
                fontSize: '0.95em'
            }}>
                {/* target="_blank" で新しいタブで開く */}
                <a href="https://stg.tiper.live" target="_blank" rel="noopener noreferrer" style={{ color: '#99e0ff', textDecoration: 'none' }}>Tiper Main Site</a>
                <a href="https://stg.bic-saving.com" target="_blank" rel="noopener noreferrer" style={{ color: '#99e0ff', textDecoration: 'none' }}>Tiper Blog</a>
                <a href="https://stg.bicstaton.com" target="_blank" rel="noopener noreferrer" style={{ color: '#99e0ff', textDecoration: 'none' }}>Tiper Management</a>
                <a href="https://stg.avflash.xyz" target="_blank" rel="noopener noreferrer" style={{ color: '#99e0ff', textDecoration: 'none' }}>Tiper Community</a>
            </div>

            <p style={{ margin: 0, textAlign: 'center', fontSize: '0.8em' }}>&copy; {new Date().getFullYear()} {title} | All Rights Reserved.</p>
          </footer>
          
        </div>
      </body>
    </html>
  );
}
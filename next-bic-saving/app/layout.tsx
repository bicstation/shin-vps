// ファイル名: C:\dev\SHIN-VPS\next-bic-saving\app\layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google"; 
import "./globals.css"; // グローバルCSSをインポート

// Inter フォントを定義
const inter = Inter({ 
  subsets: ["latin"],
});

// 💡 サイト名に合わせて Metadata を修正
export const metadata: Metadata = {
  title: "ビック的節約生活 - Next.js",
  description: "ビック的節約生活サイトのトップページと記事詳細ページ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 日本語を設定
    <html lang="ja">
      {/* bodyタグにフォントクラスを適用 */}
      <body className={inter.className}>
        {/* 全てのページコンテンツ (page.tsxなど) がここに挿入されます */}
        {children}
      </body>
    </html>
  );
}
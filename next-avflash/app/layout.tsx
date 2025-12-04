import type { Metadata } from "next";
// 修正点: Geist フォントを削除し、Google Fonts の Inter を使用
import { Inter } from "next/font/google"; 
import "./globals.css";

// Inter フォントを定義
const inter = Inter({ 
  subsets: ["latin"],
  // 修正点: 変数名はinterに統一（classNameに直接適用するため）
});

export const metadata: Metadata = {
  title: "Next.js App Router Demo",
  description: "Next.js App Router Layout",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 修正点: フォントクラスを Inter に変更
    <html lang="ja">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
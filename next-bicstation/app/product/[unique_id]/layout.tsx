import React from "react";
import Link from "next/link";
// ✅ 共通カラー設定をインポート
import { COLORS } from "@/constants";

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 共通のカラーを使用（未定義時はデフォルト値）
  const primaryColor = COLORS?.SITE_COLOR || '#007bff';
  const bgColor = COLORS?.BACKGROUND || '#f4f7f9';

  return (
    <div style={{ minHeight: "100vh", backgroundColor: bgColor }}>
      {/* 🚩 詳細ページ共通のバナー：背景色をプライマリカラーの透過色に変更 */}
      <div style={{ 
        background: `${primaryColor}10`, // プライマリカラーに透明度(10)を付与
        padding: '10px', 
        textAlign: 'center', 
        fontSize: '0.85em', 
        color: primaryColor,
        borderBottom: `1px solid ${primaryColor}20`
      }}>
        📢 期間限定：今なら公式サイトでクーポン配布中！
      </div>
      
      {/* ページ本体 */}
      {children}
      
      {/* 🚩 詳細ページ下部の共通セクション */}
      <div style={{ 
        maxWidth: '1100px', 
        margin: '60px auto 40px', 
        padding: '40px 20px', 
        textAlign: 'center',
        borderTop: '1px solid #eee'
      }}>
        <p style={{ color: '#888', marginBottom: '12px' }}>お探しのスペックが見つかりませんか？</p>
        <Link href="/contact" style={{ 
          color: primaryColor, 
          fontWeight: 'bold',
          fontSize: '1.1em',
          textDecoration: 'none'
        }}>
          コンシェルジュに相談する →
        </Link>
      </div>
    </div>
  );
}
// app/brand/[slug]/layout.tsx
import React from "react";
import Link from "next/link";
import { COLORS } from "@/constants";

export default function BrandLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const primaryColor = COLORS?.SITE_COLOR || '#007bff';
  const bgColor = COLORS?.BACKGROUND || '#f4f7f9';

  return (
    <div style={{ minHeight: "100vh", backgroundColor: bgColor }}>
      {/* 🚩 ブランド一覧共通バナー：一覧から探しているユーザーへアピール */}
      <div style={{ 
        background: `${primaryColor}10`, 
        padding: '12px', 
        textAlign: 'center', 
        fontSize: '0.9em', 
        color: primaryColor,
        borderBottom: `1px solid ${primaryColor}20`,
        fontWeight: '500'
      }}>
        🚀 各メーカーの最新セール・学割情報を反映済み！お得なモデルをチェック
      </div>
      
      {/* ページ本体（ここが page.tsx の内容になります） */}
      {children}
      
      {/* 🚩 下部の共通セクション：一覧で迷っているユーザーへのサポート */}
      <div style={{ 
        maxWidth: '1200px', 
        margin: '60px auto 40px', 
        padding: '60px 20px', 
        textAlign: 'center',
        background: '#fff',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
      }}>
        <h3 style={{ fontSize: '1.4rem', color: '#333', marginBottom: '16px' }}>
          自分にぴったりの構成に迷ったら
        </h3>
        <p style={{ color: '#666', marginBottom: '24px', lineHeight: '1.6' }}>
          「このメーカーの中で一番コスパが良いのはどれ？」「用途に合うスペックは？」<br />
          専門スタッフがチャットやメールで最適な一台をご提案します。
        </p>
        <Link href="/contact" style={{ 
          display: 'inline-block',
          backgroundColor: primaryColor,
          color: '#fff', 
          padding: '12px 32px',
          borderRadius: '30px',
          fontWeight: 'bold',
          fontSize: '1.1em',
          textDecoration: 'none',
          transition: 'transform 0.2s'
        }}>
          無料でスペック相談する →
        </Link>
      </div>
    </div>
  );
}
import React from "react";
import Link from "next/link";

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ minHeight: "100vh" }}>
      {/* 🚩 詳細ページ共通のバナーや告知をここに追加できる */}
      <div style={{ background: '#eef6ff', padding: '10px', textAlign: 'center', fontSize: '0.8em', color: '#0056b3' }}>
        📢 期間限定：今なら公式サイトでクーポン配布中！
      </div>
      
      {/* ページ本体 */}
      {children}
      
      {/* 🚩 詳細ページ下部に必ず出したい「お問い合わせ」などを共通化できる */}
      <div style={{ maxWidth: '1100px', margin: '40px auto', padding: '20px', textAlign: 'center' }}>
        <p style={{ color: '#888' }}>お探しのスペックが見つかりませんか？</p>
        <Link href="/contact" style={{ color: '#007bff', fontWeight: 'bold' }}>
          コンシェルジュに相談する
        </Link>
      </div>
    </div>
  );
}
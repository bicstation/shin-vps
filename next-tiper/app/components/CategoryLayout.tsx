// ファイル名: C:\dev\SHIN-VPS\next-tiper\app\components\CategoryLayout.tsx

import React from 'react';
import Link from 'next/link'; // サイドバーのナビゲーション用

// サイドバーとメインコンテンツの2カラムレイアウトを提供するコンポーネント
export default function CategoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const sidebarStyle: React.CSSProperties = {
    width: '280px',
    padding: '20px',
    backgroundColor: '#1f1f3a', // ヘッダー/フッターと同じ背景色
    borderRight: '1px solid #3d3d66',
    boxShadow: '2px 0 5px rgba(0, 0, 0, 0.5)',
    flexShrink: 0, // サイズが変わらないように固定
  };

  const mainContentStyle: React.CSSProperties = {
    flexGrow: 1, // 残りのスペースをすべて占有
    padding: '20px 40px',
    backgroundColor: '#111122',
  };

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 80px)' }}> {/* ヘッダーとフッターの高さを引く */}
      
      {/* 1. サイドバー (共通ナビゲーション) */}
      <aside style={sidebarStyle}>
        <h3 style={{ color: '#e94560', borderBottom: '1px solid #e94560', paddingBottom: '5px' }}>
            カテゴリ
        </h3>
        <nav style={{ marginTop: '15px' }}>
          <Link href="/category/sub1" style={{ color: '#99e0ff', display: 'block', padding: '8px 0', textDecoration: 'none' }}>- サブカテゴリ 1</Link>
          <Link href="/category/sub2" style={{ color: '#99e0ff', display: 'block', padding: '8px 0', textDecoration: 'none' }}>- サブカテゴリ 2</Link>
          <Link href="/category/sub3" style={{ color: '#99e0ff', display: 'block', padding: '8px 0', textDecoration: 'none' }}>- サブカテゴリ 3</Link>
          <Link href="/popular" style={{ color: '#e94560', display: 'block', padding: '8px 0', textDecoration: 'none' }}>- 🔥 人気記事</Link>
        </nav>
      </aside>

      {/* 2. メインコンテンツエリア */}
      <div style={mainContentStyle}>
        {children}
      </div>
    </div>
  );
}
// E:\shin-vps\next-tiper\app\category\page.tsx

/* eslint-disable react/no-unescaped-entities */
// @ts-nocheck
import React from 'react';
import Link from 'next/link';

export const metadata = {
    title: 'カテゴリ一覧 | Tiper Live',
    description: '記事のカテゴリ一覧ページです。',
};

export default function CategoryPage() {
  const containerStyle: React.CSSProperties = {
    padding: '60px 20px',
    maxWidth: '1200px',
    margin: '0 auto',
    backgroundColor: '#111122',
    color: 'white',
    minHeight: '100vh',
  };

  return (
    <div style={containerStyle}>
        <div style={{ backgroundColor: '#1f1f3a', padding: '30px', borderRadius: '10px' }}>
            <h2 style={{ color: '#e94560', borderBottom: '2px solid #3d3d66', paddingBottom: '10px' }}>
                記事カテゴリのトップ
            </h2>
            <p style={{ color: '#ccc', marginTop: '20px' }}>
                現在、カテゴリページを再構成中です。最新情報はトップページをご確認ください。
            </p>
            <div style={{ marginTop: '20px' }}>
                <Link href="/" style={{ color: '#99e0ff', textDecoration: 'none' }}>
                    ← TOPページへ戻る
                </Link>
            </div>
        </div>
    </div>
  );
}
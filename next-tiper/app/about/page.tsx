// ファイル名: C:\dev\SHIN-VPS\next-tiper\app\static\page.tsx

import React from 'react';

// 静的ページのメタデータ
export const metadata = {
    title: '静的情報 | Tiper Live',
    description: 'このサイトに関する情報が記載されています。',
};

// 静的ページ（例: About Us）
export default function StaticPage() {
  return (
    <div style={{ padding: '40px 80px', maxWidth: '900px', margin: '0 auto', color: 'white' }}>

      {/* 1. ページタイトル */}
      <h1 style={{ 
          color: '#99e0ff', 
          fontSize: '2.2em', 
          borderBottom: '2px solid #3d3d66', 
          paddingBottom: '10px',
          marginBottom: '30px'
      }}>
        会社概要 (静的ページ)
      </h1>

      {/* 2. コンテンツ */}
      <div style={{ lineHeight: '1.7', fontSize: '1.05em' }}>
        <p>
            このページは、Next.jsのルーティングにおける静的ページ（1カラム）の表示をテストするためのエリアです。
            `/static` のルート直下に `page.tsx` を配置することで、全幅のレイアウトが適用されます。
        </p>
        
        <h2 style={{ color: '#e94560', marginTop: '40px', borderBottom: '1px solid #3d3d66', paddingBottom: '5px' }}>
            ミッション
        </h2>
        <p>
            Tiper Liveは、最先端のデータとテクノロジーを駆使し、ユーザーに価値ある情報と体験を提供することを目指しています。
            正確で信頼性の高い情報を、誰でもアクセスしやすい形で提供します。
        </p>

        <h2 style={{ color: '#e94560', marginTop: '40px', borderBottom: '1px solid #3d3d66', paddingBottom: '5px' }}>
            技術スタック
        </h2>
        <ul style={{ listStyleType: 'disc', marginLeft: '20px' }}>
            <li>フロントエンド: Next.js (App Router)</li>
            <li>バックエンド/API: Django (Dockerコンテナ)</li>
            <li>データベース: PostgreSQL (Dockerコンテナ)</li>
            <li>リバースプロキシ: Traefik</li>
        </ul>
        
      </div>

    </div>
  );
}
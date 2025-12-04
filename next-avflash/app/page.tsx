// C:\dev\SHIN-VPS\next-tiper\app\page.tsx

import React from 'react';
// 💡 Linkコンポーネントをインポートします
import Link from 'next/link'; 

// Pageファイルは async Server Component にします
export default async function Page() {
 
 // 💡 修正: 環境変数からタイトルを取得
 // NEXT_PUBLIC_から始まる変数はServer Componentでも利用可能
 const title = process.env.NEXT_PUBLIC_APP_TITLE || 'デモタイトルが見つかりません';

 return (
  <div style={{ fontFamily: 'Arial, sans-serif', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
   
   {/* 1. トップ (ヘッダー) */}
   <header style={{ background: '#333', color: 'white', padding: '15px 20px', borderBottom: '3px solid #007bff' }}>
    <h1 style={{ margin: 0, fontSize: '1.5em' }}>{title}</h1>
    <p style={{ margin: '5px 0 0 0', fontSize: '0.9em' }}>App Router (RSC) によるレンダリング</p>
   </header>

   {/* 2. メインコンテンツとサイドバーのコンテナ */}
   <div style={{ display: 'flex', flexGrow: 1, backgroundColor: '#f4f4f4' }}>
    
    {/* 3. サイドバー */}
    <aside style={{ width: '200px', background: '#e0e0e0', padding: '20px', borderRight: '1px solid #ccc' }}>
     <h3 style={{ marginTop: 0, color: '#007bff' }}>サイドバー</h3>
     <ul style={{ listStyleType: 'none', padding: 0 }}>
      {/* メインへ戻る (ルートアプリへ) */}
      <li><Link href="/" style={{ textDecoration: 'none', color: '#333' }}>メインへ戻る</Link></li>
      {/* 🚨 修正: Tiperのトップページへ戻るリンクを <Link> に変更 */}
      <li><Link href="/tiper/" style={{ textDecoration: 'none', color: '#333' }}>Tiperトップへ</Link></li>
      {/* Savingアプリへ */}
      <li><Link href="/saving/" style={{ textDecoration: 'none', color: '#333' }}>Savingへ</Link></li>
      <li style={{ marginTop: '10px', fontSize: '0.8em', color: '#666' }}>（App Routerデモ）</li>
     </ul>
    </aside>

    {/* 4. メインエリア */}
    <main style={{ flexGrow: 1, padding: '20px' }}>
     <h2 style={{ color: '#007bff' }}>メインコンテンツエリア</h2>
     <p>このエリアは、**{title}** の固有のロジックやデータを表示します。</p>
     <div style={{ background: 'white', padding: '15px', border: '1px solid #ddd' }}>
      <p>ここに複雑なUIコンポーネントや動的なデータが表示されます。</p>
      <p style={{ fontStyle: 'italic', color: '#999' }}>Next.jsコンテナ: {title} (App Router)</p>
     </div>
    </main>
   </div>

   {/* 5. フッター */}
   <footer style={{ background: '#333', color: 'white', padding: '10px 20px', textAlign: 'center', borderTop: '3px solid #007bff' }}>
    <p style={{ margin: 0 }}>&copy; {new Date().getFullYear()} {title} | フッター情報</p>
   </footer>
  </div>
 );
};
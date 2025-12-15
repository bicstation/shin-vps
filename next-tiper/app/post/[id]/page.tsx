// ファイル名: C:\dev\SHIN-VPS\next-tiper\app\post/[id]/page.tsx

import React from 'react';

// Next.jsの動的ルートからパラメータを受け取るための型定義
interface PostPageProps {
  params: {
    id: string; // URLから渡される記事ID (例: '1', 'post-slug')
  };
}

// 💡 ダミーのデータ取得関数
// 将来的には、ここで 'http://api_django_v2:8000/api/posts/${postId}' のようにDjango APIを呼び出します。
async function fetchPostData(postId: string) {
  // 開発環境ではローカルホストを使用
  const API_URL = process.env.NODE_ENV === 'development'
    ? `http://localhost:8000/api/posts/${postId}`
    : `http://api_django_v2:8000/api/posts/${postId}`; // Dockerコンテナ名を使用

  // 実際のAPIからのデータ構造をシミュレーション
  const dummyData = {
    id: postId,
    title: `【${postId}】Next.jsとDjango連携テスト記事`,
    author: 'Tiper Dev Team',
    date: new Date().toLocaleDateString('ja-JP'),
    content: `
      <p style="color: #ccc; line-height: 1.8;">
        この記事は、Next.jsのServer ComponentからDjango API（またはダミーデータ）を呼び出すテスト用に作成されました。<br/>
        **この記事ID (${postId})** は、URLパラメータとして動的に取得され、タイトルに反映されています。
      </p>
      <h3 style="color: #99e0ff; margin-top: 30px;">データ取得の検証</h3>
      <ul style="color: #ccc;">
        <li>**データソース:** Django API (現在はダミー)</li>
        <li>**取得方法:** Server Componentでの非同期処理 (async/await)</li>
        <li>**レンダリング:** サーバーサイドレンダリング (SSR)</li>
      </ul>
      <p style="margin-top: 20px;">
        レイアウトは全幅（1カラム）になっています。これは、ルートのすぐ下にレイアウトコンポーネントを配置していないためです。
      </p>
    `,
  };

  // 実際のfetch処理の代わりにダミーデータを返す
  // 💡 ここに fetch(API_URL, ...) のロジックを将来記述します
  return dummyData;
}

// Next.js Server Component (async function)
export default async function PostPage({ params }: PostPageProps) {
  
  // 記事IDを取得
  const postId = params.id;
  
  // データを取得
  const post = await fetchPostData(postId);

  return (
    <div style={{ padding: '40px 80px', maxWidth: '1000px', margin: '0 auto' }}>

      {/* 1. 記事タイトルとメタ情報 */}
      <h1 style={{ 
          color: '#e94560', 
          fontSize: '2.5em', 
          borderBottom: '3px solid #3d3d66', 
          paddingBottom: '10px' 
      }}>
        {post.title}
      </h1>
      <div style={{ color: '#aaa', fontSize: '0.9em', marginBottom: '30px' }}>
        <span>著者: {post.author}</span>
        <span style={{ marginLeft: '20px' }}>公開日: {post.date}</span>
        <span style={{ marginLeft: '20px', color: '#e94560' }}>動的ID: {post.id}</span>
      </div>

      {/* 2. 記事コンテンツ (危険なインラインHTMLを使用しないよう注意が必要ですが、ここではデモとして使用) */}
      <div 
        style={{ fontSize: '1.05em' }}
        dangerouslySetInnerHTML={{ __html: post.content }} 
      />
      
      {/* 3. コメントや関連情報のプレースホルダー */}
      <div style={{ marginTop: '50px', paddingTop: '20px', borderTop: '1px solid #3d3d66' }}>
        <h3 style={{ color: '#99e0ff' }}>コメントセクション (仮)</h3>
        <p style={{ color: '#ccc' }}>この下にコメントフォームや関連記事が表示されます。</p>
      </div>

    </div>
  );
};

// 💡 個別ページでは、カテゴリページで使用した CategoryLayout は適用されません。
// そのため、全幅の1カラムレイアウトになります。
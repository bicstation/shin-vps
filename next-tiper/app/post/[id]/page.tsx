// ファイル名: C:\dev\SHIN-VPS\next-tiper\app\post\[id]\page.tsx

import React from 'react';
import { notFound } from 'next/navigation';

// 💡 WordPress APIから取得する記事データの型定義 (簡略化)
interface WpPost {
  id: number;
  slug: string; // 記事のパーマリンクに使用されるスラッグ
  title: {
    rendered: string; // HTMLタグを含むタイトル
  };
  date: string; // 記事の公開日時 (YYYY-MM-DDTHH:MM:SS)
  content: {
    rendered: string; // 記事本文のHTML
  };
  author: string; // 著者名を取得するロジックは後述
  // カテゴリ情報は複雑なため、今回は最初のカテゴリ名を取得するための埋め込み情報を使用
  _embedded?: {
    'wp:term'?: {
      name: string;
    }[][];
    // 著者情報が含まれる場合
    author?: {
      name: string;
    }[];
  };
}

// Next.jsの動的ルートからパラメータを受け取るための型定義
interface PostPageProps {
  params: {
    id: string; // URLから渡される記事スラッグ (例: 'post-slug', '%E3%83%86%E3%82%B9%E3%83%88')
  };
}

// 💡 データを取得するサーバー関数 (WordPress API向け)
// **注意: この関数はデコードされたスラッグ (postId) を受け取ることを想定**
async function fetchPostData(postSlug: string): Promise<WpPost | null> {
  // Tiper.live のカスタム投稿タイプ 'tiper' をスラッグで検索
  // slugパラメータを使って記事を検索します。結果は配列で返るため、per_page=1 で1件に絞ります。
  const WP_API_URL = `http://nginx-wp-v2/wp-json/wp/v2/tiper?slug=${postSlug}&_embed&per_page=1`; 

  try {
    const res = await fetch(WP_API_URL, {
      // 修正箇所: Hostヘッダーを追加して、WordPressに正しいドメイン名を伝える
      headers: {
        'Host': 'stg.blog.tiper.live' 
      },
      // 記事は頻繁に更新されないため、リバリデートを長めに設定 (例: 1時間 = 3600秒)
      next: { revalidate: 3600 } 
    });

    if (!res.ok) {
      console.error(`WordPress API Error: ${res.status} ${res.statusText}`);
      return null;
    }
    
    // WordPressがJSON配列を返すことを期待
    const data: WpPost[] = await res.json();
    
    if (data.length === 0) {
        return null; // 記事が見つからない
    }

    // 取得した記事データ (単一)
    const post = data[0];

    // 著者名を取得
    const authorName = post._embedded?.author?.[0]?.name || '不明な著者';

    // 著者名を post オブジェクトに追加して返す (型 WpPost に author プロパティを定義済み)
    return { ...post, author: authorName };

  } catch (error) {
    console.error("Failed to fetch post from WordPress API:", error);
    return null; 
  }
}

// ユーティリティ関数: HTMLエンティティをデコード
const decodeHtml = (html: string) => {
    const map: { [key: string]: string } = { '&nbsp;': ' ', '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>' };
    return html.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec)).replace(/&[a-z]+;/gi, (match) => map[match] || match);
};

// ユーティリティ関数: 日付フォーマット (例: 2025/12/16)
const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).replace(/\//g, '/');
};


// Next.js Server Component (async function)
export default async function PostPage({ params }: PostPageProps) {
  
  // 🚨 修正点: URLから取得したエンコード済みのID (スラッグ) をデコードする
  const postSlug = decodeURIComponent(params.id);
  
  // データを取得 (デコードされたスラッグを使用)
  const post = await fetchPostData(postSlug);

  // 記事が見つからなかった場合は 404 ページを表示
  if (!post) {
    notFound(); 
  }
  
  const postTitle = decodeHtml(post.title.rendered);
  const postDate = formatDate(post.date);

  return (
    <div style={{ padding: '40px 80px', maxWidth: '1000px', margin: '0 auto' }}>

      {/* 1. 記事タイトルとメタ情報 */}
      <h1 style={{ 
          color: '#e94560', 
          fontSize: '2.5em', 
          borderBottom: '3px solid #3d3d66', 
          paddingBottom: '10px' 
      }}>
        {postTitle}
      </h1>
      <div style={{ color: '#aaa', fontSize: '0.9em', marginBottom: '30px' }}>
        <span>著者: {post.author}</span>
        <span style={{ marginLeft: '20px' }}>公開日: {postDate}</span>
        {/* スラッグを表示 */}
        <span style={{ marginLeft: '20px', color: '#99e0ff' }}>スラッグ: {post.slug}</span>
      </div>

      {/* 2. 記事コンテンツ */}
      {/* WordPressの content.rendered には記事本文の HTML が含まれる */}
      <div 
        style={{ fontSize: '1.05em', lineHeight: '1.7', color: '#ccc' }}
        dangerouslySetInnerHTML={{ __html: post.content.rendered }} 
      />
      
      {/* 3. コメントや関連情報のプレースホルダー */}
      <div style={{ marginTop: '50px', paddingTop: '20px', borderTop: '1px solid #3d3d66' }}>
        <h3 style={{ color: '#99e0ff' }}>コメントセクション (仮)</h3>
        <p style={{ color: '#ccc' }}>この下にコメントフォームや関連記事が表示されます。</p>
      </div>

    </div>
  );
};
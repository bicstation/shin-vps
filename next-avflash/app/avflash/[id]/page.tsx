// ファイル名: app/avflash/[id]/page.tsx

/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/no-danger */
// @ts-nocheck 

import React from 'react';
import { notFound } from 'next/navigation';
import styles from './post.module.css';

// ✅ api.ts から現在利用可能な関数をインポート
// 💡 fetchPostList は WordPress API からデータを取得するために使用
import { decodeHtml } from '@shared/components/lib/decode';

/**
 * 💡 ユーティリティ: 日付フォーマット
 * decode.ts に存在しない場合のエラーを回避するため内部で定義
 */
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

/**
 * 💡 WordPress 記事取得関数 (内部定義または api.ts の fetchPostList を拡張)
 */
async function getWpPostDetail(slug: string) {
  // avflash カテゴリ(カスタム投稿タイプ)から特定のスラッグの記事を取得
  const WP_API_URL = `http://nginx-wp-v2/wp-json/wp/v2/avflash?_embed&slug=${slug}`;
  try {
    const res = await fetch(WP_API_URL, {
      headers: { 'Host': 'stg.blog.tiper.live' },
      next: { revalidate: 3600 } // 1時間キャッシュ
    });
    if (!res.ok) return null;
    const posts = await res.json();
    return posts.length > 0 ? posts[0] : null;
  } catch (error) {
    console.error("WP API Fetch Error:", error);
    return null;
  }
}

/**
 * 💡 静的パスの生成 (generateStaticParams)
 * ビルド時に WordPress から最新記事のスラッグを取得して静的ページ化します
 */
export async function generateStaticParams() {
  try {
    const WP_API_URL = `http://nginx-wp-v2/wp-json/wp/v2/avflash?_embed&per_page=20`;
    const res = await fetch(WP_API_URL, {
      headers: { 'Host': 'stg.blog.tiper.live' }
    });
    const allPosts = await res.json();
    
    if (!Array.isArray(allPosts)) return [];
    
    return allPosts.map((post) => ({
      id: post.slug,
    }));
  } catch (error) {
    console.error("StaticParams generation failed:", error);
    return [];
  }
}

interface PostPageProps {
  params: { id: string };
}

/**
 * 💡 記事詳細ページ メインコンポーネント
 */
export default async function PostPage({ params }: PostPageProps) {
  // URLパラメータ(id)はスラッグなのでデコードして使用
  const postSlug = decodeURIComponent(params.id);

  // ✅ 記事データを取得
  const post = await getWpPostDetail(postSlug);

  // 記事が見つからない場合は 404
  if (!post) {
    notFound();
  }

  // 著者情報の抽出
  const authorName = post._embedded?.author?.[0]?.name || 'AV FLASH 編集部';

  return (
    <article className={styles.container}>
      {/* 1. 記事ヘッダー */}
      <header className={styles.header} style={{ marginBottom: '40px' }}>
        <h1 className={styles.title} style={{ fontSize: '2.4rem', color: '#fff', marginBottom: '20px' }}>
          {decodeHtml(post.title.rendered)}
        </h1>
        
        <div className={styles.meta} style={{ display: 'flex', gap: '20px', color: '#aaa', fontSize: '0.9rem' }}>
          <div className={styles.metaItem}>
            👤 <span>{authorName}</span>
          </div>
          <div className={styles.metaItem}>
            📅 <time>{formatDate(post.date)}</time>
          </div>
        </div>
      </header>

      {/* 2. アイキャッチ画像があれば表示 */}
      {post._embedded?.['wp:featuredmedia']?.[0]?.source_url && (
        <div className={styles.featuredImage} style={{ marginBottom: '40px', borderRadius: '12px', overflow: 'hidden' }}>
          <img 
            src={post._embedded['wp:featuredmedia'][0].source_url} 
            alt="" 
            style={{ width: '100%', height: 'auto', display: 'block' }} 
          />
        </div>
      )}

      {/* 3. 記事メインコンテンツ */}
      {/* WordPressから取得したHTMLを流し込み。スタイルの適用には post.module.css または global.css を使用 */}
      <div 
        className={styles.content}
        style={{ lineHeight: '1.8', fontSize: '1.1rem', color: '#eee' }}
        dangerouslySetInnerHTML={{ __html: post.content.rendered }} 
      />

      {/* 4. 記事フッター */}
      <footer className={styles.footerSection} style={{ marginTop: '60px', padding: '30px', background: '#1a1a1a', borderRadius: '12px' }}>
        <h3 className={styles.footerTitle} style={{ color: '#ff4500', marginBottom: '15px' }}>おすすめの関連記事</h3>
        <p style={{ color: '#888', fontSize: '0.9rem' }}>
          現在、この記事に関連するレビュー記事を準備中です。
          最新の動画作品はトップページからご確認いただけます。
        </p>
      </footer>
    </article>
  );
}
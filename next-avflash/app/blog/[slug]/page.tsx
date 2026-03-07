/* eslint-disable react/no-danger */
/* eslint-disable @next/next/no-img-element */
/**
 * =====================================================================
 * 📄 AV Flash 記事詳細 (Hybrid Markdown Edition)
 * 🛡️ Maya's Logic: Markdown 優先検索 + Django v3 バックアップ
 * =====================================================================
 */

import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';

/**
 * ✅ 物理パスに基づいた正しいインポート
 * tree構造に従い、@shared/lib 配下の階層を正確に指定。
 * TypeScriptの標準規則に従い、インポート時の拡張子 (.ts) は削除しています。
 */
import { getSiteMetadata, getSiteColor } from '@shared/lib/utils/siteConfig';
import { decodeHtml } from '@shared/lib/utils/decode';
import { fetchPostData, getWpFeaturedImage } from '@shared/lib/api/django-bridge';
import { getPostBySlug } from '@shared/lib/utils/markdown';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

interface PostPageProps {
  // ディレクトリ名に合わせて slug を受け取る
  params: Promise<{ slug: string }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug: rawSlug } = await params;
  const postSlug = decodeURIComponent(rawSlug);

  const headerList = await headers();
  const host = headerList.get('x-forwarded-host') || headerList.get('host') || '';
  const siteData = getSiteMetadata(host);
  const SITE_COLOR = getSiteColor(siteData.site_name);

  // --- 🔍 探索フェーズ 1: ローカル Markdown (.md) ---
  const localPost = getPostBySlug('content/avflash', postSlug);
  
  let post: any = null;
  let featuredImageUrl = '';
  let contentHtml = '';
  let isMarkdown = false;

  if (localPost) {
    // Markdown データの整形
    post = {
      title: { rendered: localPost.title },
      date: localPost.date,
    };
    contentHtml = localPost.content;
    featuredImageUrl = localPost.thumbnail || ''; // md のフロントマターから取得
    isMarkdown = true;
  } else {
    // --- 🔍 探索フェーズ 2: Django API ---
    // AV Flash なら 'avflash' エンドポイントを指定
    const endpoint = siteData.site_name === 'AV Flash' ? 'avflash' : 'posts';
    const apiPost = await fetchPostData(endpoint, postSlug);
    
    if (!apiPost) {
      notFound();
    }
    
    post = apiPost;
    contentHtml = apiPost.content.rendered;
    featuredImageUrl = getWpFeaturedImage(apiPost, 'large');
  }

  return (
    <article style={{ padding: '40px 20px', maxWidth: '850px', margin: '0 auto', backgroundColor: '#fff', minHeight: '80vh' }}>
      
      {/* ヘッダーセクション */}
      <header style={{ marginBottom: '40px' }}>
        {isMarkdown && (
          <span style={{ 
            backgroundColor: SITE_COLOR, 
            color: '#fff', 
            padding: '2px 10px', 
            fontSize: '0.75rem', 
            borderRadius: '4px', 
            fontWeight: 'bold',
            display: 'inline-block',
            marginBottom: '10px'
          }}>
            LOCAL ARTICLE
          </span>
        )}
        <h1 style={{ 
          color: '#333', 
          fontSize: '2.2rem', 
          fontWeight: 'bold',
          borderLeft: `10px solid ${SITE_COLOR}`, 
          paddingLeft: '20px',
          lineHeight: '1.4',
          marginBottom: '20px'
        }}>
          {decodeHtml(post.title.rendered)}
        </h1>

        <div style={{ color: '#666', fontSize: '0.95rem', borderBottom: '1px solid #eee', paddingBottom: '15px', display: 'flex', gap: '20px' }}>
          <time dateTime={post.date}>📅 {new Date(post.date).toLocaleDateString('ja-JP')}</time>
          <span>🏷️ {siteData.site_name} Official</span>
        </div>
      </header>

      {/* メイン画像 */}
      {featuredImageUrl && (
        <figure style={{ marginBottom: '30px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <img 
            src={featuredImageUrl} 
            alt={post.title.rendered} 
            style={{ width: '100%', height: 'auto', display: 'block' }} 
          />
        </figure>
      )}

      {/* 記事本文 */}
      <section 
        className="entry-content" 
        style={{ 
          fontSize: '1.15rem', 
          lineHeight: '2.0', 
          color: '#222',
          wordBreak: 'break-word'
        }}
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
      
      {/* フッター案内 */}
      <footer style={{ marginTop: '60px', paddingTop: '40px', borderTop: `4px solid ${SITE_COLOR}` }}>
        <h3 style={{ color: '#333', fontSize: '1.5rem', marginBottom: '10px' }}>
          {siteData.site_name} Review
        </h3>
        <p style={{ color: '#666', marginBottom: '30px', lineHeight: '1.7' }}>
          {siteData.site_name} では最新のAV機器やトレンド情報を深掘りして解説しています。
        </p>
        
        <Link href="/" style={{ 
          display: 'inline-block',
          backgroundColor: '#fff',
          color: SITE_COLOR, 
          textDecoration: 'none', 
          fontWeight: 'bold',
          border: `2px solid ${SITE_COLOR}`,
          padding: '12px 35px',
          borderRadius: '50px',
          transition: 'all 0.3s ease'
        }}>
          ← 記事一覧に戻る
        </Link>
      </footer>
    </article>
  );
}
/* eslint-disable react/no-danger */
/* eslint-disable @next/next/no-img-element */
/**
 * =====================================================================
 * 📄 Bic Saving 記事詳細 (Hybrid Markdown Edition)
 * 🛡️ Maya's Logic: v3 物理構造最適化版
 * =====================================================================
 */
// 物理パス: /home/maya/dev/shin-vps/next-bic-saving/app/blog/[slug]/page.tsx

import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';

/**
 * ✅ 1. 共通ライブラリのパス修正 (lib/utils/...)
 */
import { getSiteMetadata, getSiteColor } from '@shared/lib/utils/siteConfig';
import { decodeHtmlEntities } from '@shared/lib/utils/decode';
import { getPostBySlug as getLocalMarkdownPost } from '@shared/lib/utils/markdown';

/**
 * ✅ 2. 統合 API への差し替え
 * wordpress 専用ライブラリは廃止し、統合された api.ts (または api/index.ts) を使用します。
 */
import { fetchPostData } from '@shared/lib/api';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug: rawSlug } = await params;
  const postSlug = decodeURIComponent(rawSlug);

  const headerList = await headers();
  const host = headerList.get('x-forwarded-host') || headerList.get('host') || '';
  
  // utils/siteConfig から取得
  const siteData = getSiteMetadata(host);
  const SITE_COLOR = getSiteColor(siteData.site_name);

  // --- 🔍 探索フェーズ 1: ローカル Markdown (.md) ---
  // 物理パス: shared/lib/utils/markdown.ts 内の関数
  const localPost = getLocalMarkdownPost('content/bic-saving', postSlug);
  
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
    featuredImageUrl = localPost.thumbnail || '';
    isMarkdown = true;
  } else {
    // --- 🔍 探索フェーズ 2: Django API ---
    // 統合 API (shared/lib/api.ts) を使用
    const apiPost = await fetchPostData('posts', postSlug);
    
    if (!apiPost) {
      notFound();
    }
    
    post = apiPost;
    contentHtml = apiPost.content.rendered;
    
    // アイキャッチ画像の取得 (WP embed 構造から抽出)
    featuredImageUrl = apiPost._embedded?.['wp:featuredmedia']?.[0]?.source_url || '';
  }

  return (
    <article style={{ padding: '40px 20px', maxWidth: '850px', margin: '0 auto', backgroundColor: '#fff', minHeight: '80vh' }}>
      
      {/* ヘッダーセクション */}
      <header style={{ marginBottom: '40px' }}>
        {isMarkdown && (
          <div style={{ marginBottom: '10px' }}>
            <span style={{ 
              backgroundColor: SITE_COLOR, 
              color: '#fff', 
              padding: '2px 10px', 
              fontSize: '0.75rem', 
              borderRadius: '4px', 
              fontWeight: 'bold'
            }}>
              LOCAL GUIDE
            </span>
          </div>
        )}
        <h1 style={{ 
          color: '#333', 
          fontSize: '2.1rem', 
          fontWeight: 'bold',
          borderLeft: `10px solid ${SITE_COLOR}`, 
          paddingLeft: '15px',
          lineHeight: '1.4',
          marginBottom: '20px'
        }}>
          {/* utils/decode.ts の関数を使用 */}
          {decodeHtmlEntities(post.title.rendered)}
        </h1>

        <div style={{ color: '#666', fontSize: '0.95rem', borderBottom: '1px solid #eee', paddingBottom: '15px', display: 'flex', gap: '20px' }}>
          <time dateTime={post.date}>📅 {new Date(post.date).toLocaleDateString('ja-JP')}</time>
          <span>🏷️ {siteData.site_name} 節約コラム</span>
        </div>
      </header>

      {/* アイキャッチ画像 */}
      {featuredImageUrl && (
        <figure style={{ marginBottom: '35px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
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
          lineHeight: '1.9', 
          color: '#333',
          wordBreak: 'break-word'
        }}
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
      
      {/* フッター・ネクストアクション */}
      <footer style={{ marginTop: '60px', paddingTop: '40px', borderTop: `4px solid ${SITE_COLOR}` }}>
        <h3 style={{ color: '#333', fontSize: '1.4rem', marginBottom: '15px' }}>
          {siteData.site_name}
        </h3>
        <p style={{ color: '#666', marginBottom: '30px', lineHeight: '1.7' }}>
          お得なキャンペーン情報や、日々の暮らしに役立つ節約術を随時更新しています。
        </p>
        
        <Link href="/" style={{ 
          display: 'inline-block',
          backgroundColor: '#fff',
          color: SITE_COLOR, 
          textDecoration: 'none', 
          fontWeight: 'bold',
          border: `2px solid ${SITE_COLOR}`,
          padding: '10px 30px',
          borderRadius: '50px',
          transition: 'all 0.2s ease'
        }}>
          ← 記事一覧に戻る
        </Link>
      </footer>
    </article>
  );
}
/* eslint-disable react/no-danger */
/**
 * =====================================================================
 * 📄 Tiper 記事詳細 (Hybrid Markdown Edition)
 * 🛡️ Build Error Fix: 物理ディレクトリ構造に完全準拠
 * ---------------------------------------------------------------------
 * 修正内容:
 * - import パスを lib/utils および lib/api/django-bridge 等へ修正
 * - エイリアスを "@/shared" に統一
 * =====================================================================
 */

import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';

/**
 * ✅ 物理構造ツリーに基づくインポートパスの修正
 * shared/lib/utils/siteConfig.ts
 * shared/lib/utils/decode.ts
 * shared/lib/utils/markdown.ts
 */
import { getSiteMetadata, getSiteColor } from '@/shared/lib/utils/siteConfig';
import { decodeHtml } from '@/shared/lib/utils/decode';
import { getPostBySlug } from '@/shared/lib/utils/markdown';

/**
 * ✅ API 関連
 * wordpress.ts が api 直下にない場合は django-bridge や 
 * api/index.ts からのエクスポートを確認してください。
 * ここではツリーに基づき api/ 以下の適切なファイルを想定。
 */
import { fetchPostData, getWpFeaturedImage } from '@/shared/lib/api/index'; 

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug: rawSlug } = await params;
  const postSlug = decodeURIComponent(rawSlug);

  const headerList = await headers();
  // x-forwarded-host を優先して取得（プロキシ環境下での安定性向上）
  const host = headerList.get('x-forwarded-host') || headerList.get('host') || '';
  
  // siteConfig の返り値ガード
  const siteData = getSiteMetadata(host) || { site_name: 'TIPER' };
  const SITE_COLOR = getSiteColor(siteData.site_name) || '#ff4500';

  // --- 🔍 探索フェーズ 1: ローカル Markdown (.md) ---
  // ツリー上の shared/lib/utils/markdown.ts が正しく動作することを想定
  const localPost = getPostBySlug('content/tiper', postSlug);
  
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
    // shared/lib/api/index.ts 内の fetchPostData を使用
    try {
      const apiPost = await fetchPostData('tiper', postSlug);
      
      if (!apiPost) {
        notFound();
      }
      
      post = apiPost;
      contentHtml = apiPost.content?.rendered || '';
      featuredImageUrl = getWpFeaturedImage ? getWpFeaturedImage(apiPost, 'large') : '';
    } catch (e) {
      console.error("API Fetch Error:", e);
      notFound();
    }
  }

  if (!post) notFound();

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
              fontSize: '0.7rem', 
              borderRadius: '4px', 
              fontWeight: 'bold',
              letterSpacing: '0.05em'
            }}>
              LOCAL CONTENT
            </span>
          </div>
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
          {decodeHtml(post.title?.rendered || '')}
        </h1>

        <div style={{ color: '#666', fontSize: '0.95rem', borderBottom: '1px solid #eee', paddingBottom: '15px', display: 'flex', gap: '20px' }}>
          <time dateTime={post.date}>📅 {post.date ? new Date(post.date).toLocaleDateString('ja-JP') : ''}</time>
          <span>🏷️ {siteData.site_name} Review</span>
        </div>
      </header>

      {/* メインビジュアル */}
      {featuredImageUrl && (
        <figure style={{ marginBottom: '40px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 6px 20px rgba(0,0,0,0.07)' }}>
          <img 
            src={featuredImageUrl} 
            alt={post.title?.rendered || ''} 
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
      
      {/* フッターセクション */}
      <footer style={{ marginTop: '60px', paddingTop: '40px', borderTop: `4px solid ${SITE_COLOR}` }}>
        <h3 style={{ color: '#333', fontSize: '1.6rem', marginBottom: '15px' }}>
          About {siteData.site_name}
        </h3>
        <p style={{ color: '#555', marginBottom: '35px', lineHeight: '1.8' }}>
          {siteData.site_name} では、皆様の生活を豊かにする最新のレビューやトレンド情報を、独自の視点で毎日お届けしています。
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
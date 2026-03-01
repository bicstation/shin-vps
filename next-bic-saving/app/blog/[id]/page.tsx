/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/no-danger */
// @ts-nocheck 

import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';

import { getSiteMetadata, getSiteColor } from '@shared/lib/siteConfig';
import { decodeHtml } from '@shared/lib/decode';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

async function getWpPostDetail(slug: string, siteName: string) {
  const endpointMap: Record<string, string> = {
    'Tiper': 'tiper',
    'AV Flash': 'avflash',
    'Bic Saving': 'posts',
    'Blog': 'posts'
  };

  const endpoint = endpointMap[siteName] || 'posts';
  const targetWpHost = 'stg.blog.tiper.live'; 
  const WP_API_URL = `http://nginx-wp-v2/wp-json/wp/v2/${endpoint}?_embed&slug=${slug}`;

  try {
    const res = await fetch(WP_API_URL, {
      headers: { 'Host': targetWpHost },
      next: { revalidate: 3600 } 
    });
    
    if (!res.ok) return null;
    const posts = await res.json();
    return posts.length > 0 ? posts : null;
  } catch (error) {
    console.error(`[${siteName}] WP Fetch Error:`, error);
    return null;
  }
}

export async function generateStaticParams() {
  return [];
}

interface PostPageProps {
  params: Promise<{ id: string }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params;
  const postSlug = decodeURIComponent(id);

  const headerList = await headers();
  const host = headerList.get('host') || '';
  const siteData = getSiteMetadata(host);
  const SITE_COLOR = getSiteColor(siteData.site_name);

  const post = await getWpPostDetail(postSlug, siteData.site_name);

  if (!post) {
    notFound();
  }

  // ✅ 安全な抽出方法に変更（?.?. を完全に排除）
  let featuredImageUrl = '';
  if (post._embedded && post._embedded['wp:featuredmedia']) {
    const media = post._embedded['wp:featuredmedia'];
    if (Array.isArray(media) && media.length > 0) {
      featuredImageUrl = media.source_url || '';
    }
  }

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto', backgroundColor: '#fff', minHeight: '80vh' }}>
      
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ 
          color: '#333', 
          fontSize: '2.2rem', 
          fontWeight: 'bold',
          borderLeft: `8px solid ${SITE_COLOR}`, 
          paddingLeft: '15px',
          marginBottom: '20px',
          lineHeight: '1.3'
        }}>
          {decodeHtml(post.title.rendered)}
        </h1>

        <div style={{ color: '#666', fontSize: '0.9em', borderBottom: '1px solid #eee', paddingBottom: '15px', display: 'flex', gap: '15px' }}>
          <span>📅 {new Date(post.date).toLocaleDateString('ja-JP')}</span>
          <span>🏷️ {siteData.site_name}</span>
        </div>
      </header>

      {featuredImageUrl && (
        <div style={{ marginBottom: '30px', borderRadius: '8px', overflow: 'hidden' }}>
          <img 
            src={featuredImageUrl} 
            alt="" 
            style={{ width: '100%', height: 'auto', display: 'block' }} 
          />
        </div>
      )}

      <div 
        className="entry-content" 
        style={{ 
          fontSize: '1.1rem', 
          lineHeight: '1.9', 
          color: '#333',
          wordBreak: 'break-word'
        }}
        dangerouslySetInnerHTML={{ __html: post.content.rendered }}
      />
      
      <div style={{ marginTop: '60px', paddingTop: '30px', borderTop: `4px solid ${SITE_COLOR}` }}>
        <h3 style={{ color: '#333', fontSize: '1.4rem', marginBottom: '10px' }}>
          {siteData.site_name}
        </h3>
        <p style={{ color: '#666', marginBottom: '20px', lineHeight: '1.6' }}>
          {siteData.site_name === 'Bic Saving' 
            ? '節約に関する latest information や、お得なキャンペーン情報を随時更新しています。' 
            : `${siteData.site_name} の最新レビューやおすすめ作品情報を随時更新中です。`}
        </p>
        <Link href="/" style={{ 
          display: 'inline-block',
          color: SITE_COLOR, 
          textDecoration: 'none', 
          fontWeight: 'bold',
          border: `1px solid ${SITE_COLOR}`,
          padding: '8px 20px',
          borderRadius: '5px'
        }}>
          ← トップページへ戻る
        </Link>
      </div>
    </div>
  );
};
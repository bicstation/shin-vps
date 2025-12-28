/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/no-danger-to-js */
// @ts-nocheck

import React from 'react';
import Link from 'next/link';
import ProductCard from './components/ProductCard'; 
import { getAdultProducts } from '../lib/api'; 

export const dynamic = 'force-dynamic';

// --- 型定義 (WordPress) ---
interface WpPost {
  id: number;
  slug: string;
  title: { rendered: string };
  date: string;
  _embedded?: {
    'wp:term'?: { name: string }[][];
  };
}

// WordPress 記事取得関数
async function getLatestPosts(): Promise<WpPost[]> {
  const WP_API_URL = "http://nginx-wp-v2/wp-json/wp/v2/tiper?_embed&per_page=5";
  try {
    const res = await fetch(WP_API_URL, {
      headers: { 'Host': 'stg.blog.tiper.live' },
      cache: 'no-store' 
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("WordPress API Error:", error);
    return [];
  }
}

// --- ユーティリティ ---
const decodeHtml = (html: string) => {
  const map: { [key: string]: string } = { '&nbsp;': ' ', '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>' };
  return html.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec)).replace(/&[a-z]+;/gi, (match) => map[match] || map[match] || match);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

// ====================================================
// TOPページコンポーネント
// ====================================================
export default async function Home({ searchParams }: { searchParams: { page?: string } }) {
  // ページング設定
  const currentPage = Number(searchParams.page) || 1;
  const limit = 20;
  const offset = (currentPage - 1) * limit;

  const [latestPosts, productData] = await Promise.all([
    getLatestPosts(),
    getAdultProducts({ limit, offset })
  ]);

  const products = productData?.results || [];
  const totalCount = productData?.count || 0;
  const totalPages = Math.ceil(totalCount / limit);
  const basePath = process.env.NEXT_PUBLIC_BASE_TIPER || '';

  // --- スタイル定義 ---
  const sectionStyle: React.CSSProperties = {
    padding: '40px 5%',
    backgroundColor: '#111122',
    borderBottom: '1px solid #3d3d66',
    color: 'white',
  };

  const titleStyle: React.CSSProperties = {
    color: '#e94560',
    fontSize: '2em',
    borderBottom: '2px solid #3d3d66',
    paddingBottom: '10px',
    marginBottom: '30px',
  };

  const paginationButtonStyle: React.CSSProperties = {
    padding: '10px 20px',
    backgroundColor: '#1f1f3a',
    color: 'white',
    borderRadius: '5px',
    textDecoration: 'none',
    border: '1px solid #3d3d66'
  };

  return (
    <div style={{ backgroundColor: '#111122', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      
      {/* 1. ヒーローセクション */}
      <section style={{...sectionStyle, textAlign: 'center', backgroundColor: '#1f1f3a', borderBottomColor: '#e94560'}}>
        <h1 style={{ color: 'white', fontSize: '3em', margin: '0 0 10px 0' }}>Tiper Live</h1>
        <p style={{ color: '#99e0ff', fontSize: '1.2em', marginBottom: '30px' }}>
          Django V2 API Data Integration
        </p>
      </section>

      {/* 2. Django 商品データセクション (ページング付き) */}
      <section style={sectionStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{...titleStyle, borderBottom: 'none', marginBottom: 0, color: '#00d1b2'}}>🔥 最新コンテンツ ({totalCount}件)</h2>
          <div style={{ color: '#aaa' }}>Page {currentPage} / {totalPages}</div>
        </div>

        {products.length > 0 ? (
          <>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
              gap: '20px' 
            }}>
              {products.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* ページングナビゲーション */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '40px' }}>
              {currentPage > 1 && (
                <Link href={`${basePath}/?page=${currentPage - 1}`} style={paginationButtonStyle}>← 前のページ</Link>
              )}
              {currentPage < totalPages && (
                <Link href={`${basePath}/?page=${currentPage + 1}`} style={{...paginationButtonStyle, backgroundColor: '#e94560', border: 'none'}}>次のページ →</Link>
              )}
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', background: '#1a1a2e', borderRadius: '10px' }}>
            <p style={{ color: '#ccc' }}>データが取得できませんでした。</p>
          </div>
        )}
      </section>

      {/* 3. WordPress ニュースフィード */}
      <section style={sectionStyle}>
        <h2 style={titleStyle}>🆕 最新ブログ記事</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {latestPosts.map(post => {
            const categoryName = post._embedded?.['wp:term']?.[0]?.[0]?.name || '未分類';
            return (
              <li key={post.id} style={{ padding: '15px 0', borderBottom: '1px solid #3d3d66', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link href={`/tiper/${decodeURIComponent(post.slug)}`} style={{ color: 'white', textDecoration: 'none', fontSize: '1.1em' }}>
                  {decodeHtml(post.title.rendered)}
                </Link>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ color: '#99e0ff', fontSize: '0.8em', display: 'block' }}>{categoryName}</span>
                  <span style={{ color: '#aaa', fontSize: '0.8em' }}>{formatDate(post.date)}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

    </div>
  );
}
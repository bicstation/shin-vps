// E:\shin-vps\next-tiper\app\page.tsx

/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/no-danger-to-js */
// @ts-nocheck

import React from 'react';
import Link from 'next/link';
// FeaturedCard のインポートを削除しました（存在しないため）
import ProductCard from './components/ProductCard'; 
import { getAdultProducts } from '../lib/api'; 

// ページ全体を常に最新の状態で生成
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
export default async function Home() {
  const [latestPosts, productData] = await Promise.all([
    getLatestPosts(),
    getAdultProducts({ limit: 10 })
  ]);

  const products = productData?.results || [];

  // --- スタイル定義 ---
  const sectionStyle: React.CSSProperties = {
    padding: '60px 80px',
    backgroundColor: '#111122',
    borderBottom: '1px solid #3d3d66',
    color: 'white',
  };

  const titleStyle: React.CSSProperties = {
    color: '#e94560',
    fontSize: '2.5em',
    borderBottom: '2px solid #3d3d66',
    paddingBottom: '10px',
    marginBottom: '30px',
  };

  const featuredCategories = [
    { name: 'データ分析', link: '/category/data', color: '#99e0ff' },
    { name: '開発ログ', link: '/category/dev', color: '#e94560' },
    { name: 'マーケティング', link: '/category/marketing', color: '#00d1b2' },
    { name: '技術トレンド', link: '/category/trend', color: '#ffdd57' },
  ];

  return (
    <div style={{ backgroundColor: '#111122', minHeight: '100vh' }}>
      
      {/* 1. ヒーローセクション */}
      <section style={{...sectionStyle, textAlign: 'center', backgroundColor: '#1f1f3a', borderBottomColor: '#e94560'}}>
        <h2 style={{ color: 'white', fontSize: '3.5em', margin: '0 0 10px 0' }}>Tiper Live Hub</h2>
        <p style={{ color: '#99e0ff', fontSize: '1.5em', marginBottom: '30px' }}>
          WordPress ニュースと Django リアルタイム商品データの統合
        </p>
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
          <Link href="/tiper" style={{ padding: '12px 30px', backgroundColor: '#e94560', color: 'white', borderRadius: '5px', fontWeight: 'bold', textDecoration: 'none' }}>記事一覧</Link>
          <Link href="/adults" style={{ padding: '12px 30px', backgroundColor: '#00d1b2', color: 'white', borderRadius: '5px', fontWeight: 'bold', textDecoration: 'none' }}>作品を探す</Link>
        </div>
      </section>

      {/* 2. Django 商品データセクション */}
      <section style={sectionStyle}>
        <h2 style={{...titleStyle, color: '#00d1b2', borderBottomColor: '#00d1b2'}}>🔥 最新アダルトコンテンツ</h2>
        {products.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '24px' }}>
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', background: '#1a1a2e', borderRadius: '10px' }}>
            <p style={{ color: '#ccc' }}>Django API (api_django_v2) との通信を確立中、またはデータがありません。</p>
          </div>
        )}
      </section>

      {/* 3. WordPress ニュースフィード */}
      <section style={sectionStyle}>
        <h2 style={titleStyle}>🆕 最新ニュースフィード</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {latestPosts.length > 0 ? (
            latestPosts.map(post => {
              const categoryName = post._embedded?.['wp:term']?.[0]?.[0]?.name || '未分類';
              const decodedSlug = decodeURIComponent(post.slug);
              return (
                <li key={post.id} style={{ padding: '15px 0', borderBottom: '1px solid #3d3d66', display: 'flex', justifyContent: 'space-between' }}>
                  <Link href={`/tiper/${decodedSlug}`} style={{ color: 'white', textDecoration: 'none', fontSize: '1.1em' }}>
                    {decodeHtml(post.title.rendered)}
                  </Link>
                  <span style={{ color: '#aaa', fontSize: '0.9em' }}>
                    <span style={{ color: '#99e0ff', marginRight: '10px' }}>[{categoryName}]</span> 
                    {formatDate(post.date)}
                  </span>
                </li>
              );
            })
          ) : (
            <li style={{ padding: '20px 0', textAlign: 'center', color: '#ccc' }}>WordPress 記事が見つかりません。</li>
          )}
        </ul>
      </section>
      
      {/* 4. 注目カテゴリ (FeaturedCard の代わりのインライン実装) */}
      <section style={sectionStyle}>
        <h2 style={titleStyle}>✨ 注目カテゴリ</h2>
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          {featuredCategories.map((cat) => (
            <Link 
              key={cat.name} 
              href={cat.link} 
              style={{
                flex: '1',
                minWidth: '200px',
                padding: '30px',
                backgroundColor: '#1f1f3a',
                borderRadius: '10px',
                border: `1px solid ${cat.color}`,
                textDecoration: 'none',
                textAlign: 'center',
                transition: 'transform 0.2s'
              }}
            >
              <h3 style={{ color: cat.color, margin: '0 0 10px 0' }}>{cat.name}</h3>
              <p style={{ color: '#ccc', fontSize: '0.9em' }}>関連情報をチェック →</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
// @ts-nocheck 

/**
 * 💡 Next.jsのキャッシュを無効化し、常に最新データを取得
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import React from 'react';
import Link from 'next/link';
// 💡 コンポーネントのインポート
import ProductCard from '../components/product/ProductCard';
import Sidebar from '../components/layout/Sidebar';

// --- 型定義 (TypeScript) ---

interface WpPost {
    id: number;
    slug: string;
    title: { rendered: string };
    date: string;
}

interface PCProduct {
    id: number;
    unique_id: string;
    site_prefix: string;
    maker: string;
    name: string;
    price: number;
    image_url: string;
    url: string;
    stock_status: string;
    unified_genre: string;
}

interface PCProductResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: PCProduct[];
}

// --- ユーティリティ ---

const decodeHtml = (html: string) => {
    if (!html) return '';
    const map: { [key: string]: string } = { '&nbsp;': ' ', '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>' };
    return html.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
        .replace(/&[a-z]+;/gi, (match) => map[match] || map[match.toLowerCase()] || match);
};

// --- データ取得関数 (サーバーサイド) ---

async function fetchPostList(): Promise<WpPost[]> {
    /**
     * 💡 ローカル・VPS両対応
     * サービス名は統一した「nginx-wp-v2」を使用。
     * カスタム投稿タイプ「bicstation」のエンドポイントを指定。
     */
    const WP_API_URL = `http://nginx-wp-v2/wp-json/wp/v2/bicstation?_embed&per_page=5`;

    try {
        const res = await fetch(WP_API_URL, {
            headers: { 
                // 💡 Nginxが識別できるよう本番ドメインをHostに指定
                'Host': 'blog.tiper.live' 
            },
            cache: 'no-store'
        });

        if (!res.ok) {
            console.error(`WordPress API Error: ${res.status}`);
            return [];
        }

        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("WordPress API Fetch Error:", error);
        return [];
    }
}

async function fetchPCProducts(offset = 0): Promise<{ data: PCProductResponse | null, debugUrl: string }> {
    const isServer = typeof window === 'undefined';
    
    /**
     * 💡 ローカル・VPS両対応
     * サーバーサイド: Docker内部ネットワーク名「django-v2」
     * クライアントサイド: 公開URL「https://bicstation.com/api」
     */
    const API_BASE_URL = isServer 
        ? 'http://django-v2:8000/api' 
        : 'https://bicstation.com/api'; 
        
    const DJANGO_API_URL = `${API_BASE_URL}/pc-products/?maker=Lenovo&limit=10&offset=${offset}`;

    try {
        const res = await fetch(DJANGO_API_URL, {
            cache: 'no-store',
            headers: { 
                'Accept': 'application/json',
                'Host': 'bicstation.com' 
            }
        });
        if (!res.ok) return { data: null, debugUrl: DJANGO_API_URL };
        const data = await res.json();
        return { data, debugUrl: DJANGO_API_URL };
    } catch (error) {
        return { data: null, debugUrl: DJANGO_API_URL };
    }
}

// --- メインページコンポーネント ---

export default async function Page({ searchParams }: { searchParams: Promise<{ offset?: string }> }) {
    const params = await searchParams;
    const currentOffset = parseInt(params.offset || '0', 10);
    const limit = 10;

    // WordPress記事とDjango製品データを並列取得
    const [posts, { data: pcData, debugUrl }] = await Promise.all([
        fetchPostList(),
        fetchPCProducts(currentOffset)
    ]);

    const currentPage = Math.floor(currentOffset / limit) + 1;
    const totalPages = pcData ? Math.ceil(pcData.count / limit) : 0;
    
    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
            
            {/* 1. 共通サイドバー */}
            <Sidebar activeMenu="lenovo" />

            <main style={{ flexGrow: 1, padding: '40px', maxWidth: '1200px' }}>
                
                {/* 🛠️ デバッグパネル */}
                <div style={{ background: '#fff3cd', padding: '10px 20px', borderRadius: '8px', marginBottom: '30px', fontSize: '0.8em', color: '#856404', border: '1px solid #ffeeba' }}>
                    <strong>API Status:</strong> {pcData ? `✅ OK (${pcData.count} items)` : '❌ Failed'} | 
                    <strong> WP Posts:</strong> {posts.length > 0 ? `✅ ${posts.length} items` : '⚠️ No data'} |
                    <strong> URL:</strong> <code>{debugUrl}</code>
                </div>

                {/* WordPress お知らせセクション (カスタム投稿タイプ bicstation) */}
                <section style={{ marginBottom: '50px' }}>
                    <h2 style={{ fontSize: '1.2em', marginBottom: '15px', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                        <span style={{ marginRight: '8px' }}>📢</span> 最新のお知らせ
                    </h2>
                    <div style={{ background: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        {posts.length === 0 ? (
                            <p style={{ padding: '20px', color: '#999' }}>現在、新しいお知らせはありません。</p>
                        ) : (
                            posts.map((post) => (
                                <Link 
                                    href={`/news/${post.slug}`} 
                                    key={post.id} 
                                    style={{ display: 'block', padding: '15px 20px', textDecoration: 'none', color: '#333', borderBottom: '1px solid #f0f0f0', transition: 'background 0.2s' }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <div style={{ fontSize: '0.85em', color: '#888', marginBottom: '4px' }}>
                                        {new Date(post.date).toLocaleDateString('ja-JP')}
                                    </div>
                                    <div style={{ fontWeight: '500' }}>{decodeHtml(post.title.rendered)}</div>
                                </Link>
                            ))
                        )}
                    </div>
                </section>

                {/* Django 製品一覧セクション */}
                <section>
                    <h2 style={{ fontSize: '1.4em', marginBottom: '25px', display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
                        <span style={{ background: '#28a745', width: '6px', height: '24px', marginRight: '12px', borderRadius: '2px' }}></span>
                        Lenovo 製品ラインナップ
                    </h2>

                    {!pcData ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#666', background: '#fff', borderRadius: '10px' }}>
                            <p>データを読み込み中、または取得に失敗しました。</p>
                        </div>
                    ) : (
                        <>
                            {/* 商品グリッド */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
                                {pcData.results.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>

                            {/* ページネーション */}
                            <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
                                {pcData.previous && (
                                    <Link href={`/?offset=${currentOffset - limit}`} style={{ padding: '10px 24px', background: '#fff', border: '1px solid #ddd', borderRadius: '8px', textDecoration: 'none', color: '#444', fontWeight: '500' }}>
                                        ← 前のページ
                                    </Link>
                                )}
                                <span style={{ fontSize: '0.95em', color: '#666', fontWeight: 'bold' }}>
                                    {currentPage} / {totalPages}
                                </span>
                                {pcData.next && (
                                    <Link href={`/?offset=${currentOffset + limit}`} style={{ padding: '10px 24px', background: '#fff', border: '1px solid #ddd', borderRadius: '8px', textDecoration: 'none', color: '#444', fontWeight: '500' }}>
                                        次のページ →
                                    </Link>
                                )}
                            </div>
                        </>
                    )}
                </section>
            </main>
        </div>
    );
}
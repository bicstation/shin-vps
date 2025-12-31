/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
// @ts-nocheck 

/**
 * 💡 Next.jsのキャッシュを無効化し、常にDjango APIから最新を取得
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
    // 💡 修正ポイント：エンドポイントを 'posts' から 'bicstation' に変更
    const WP_API_URL = `http://nginx-wp-v2/wp-json/wp/v2/bicstation?_embed&per_page=5`;

    try {
        const res = await fetch(WP_API_URL, {
            // Hostヘッダーは本番ドメイン
            headers: { 'Host': 'blog.tiper.live' },
            cache: 'no-store'
        });

        if (!res.ok) {
            console.error(`WordPress API Error: ${res.status} (Endpoint may be wrong)`);
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
    const API_BASE_URL = isServer ? 'http://django-v2:8000/api' : 'http://localhost:8083/api';
    const DJANGO_API_URL = `${API_BASE_URL}/pc-products/?maker=Lenovo&limit=10&offset=${offset}`;

    try {
        const res = await fetch(DJANGO_API_URL, {
            cache: 'no-store',
            headers: { 'Accept': 'application/json', 'Host': 'localhost' }
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

    const [posts, { data: pcData, debugUrl }] = await Promise.all([
        fetchPostList(),
        fetchPCProducts(currentOffset)
    ]);

    const currentPage = Math.floor(currentOffset / limit) + 1;
    const totalPages = pcData ? Math.ceil(pcData.count / limit) : 0;
    
    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            
            {/* 1. 共通サイドバー */}
            <Sidebar activeMenu="lenovo" />

            <main style={{ flexGrow: 1, padding: '40px', maxWidth: '1200px' }}>
                
                {/* 🛠️ デバッグパネル */}
                <div style={{ background: '#fff3cd', padding: '10px 20px', borderRadius: '8px', marginBottom: '30px', fontSize: '0.8em', color: '#856404', border: '1px solid #ffeeba' }}>
                    <strong>API Status:</strong> {pcData ? `✅ OK (${pcData.count} items)` : '❌ Failed'} | 
                    <strong> URL:</strong> <code>{debugUrl}</code>
                </div>

                {/* WordPress お知らせセクション */}
                <section style={{ marginBottom: '50px' }}>
                    <h2 style={{ fontSize: '1.2em', marginBottom: '15px', fontWeight: 'bold' }}>📢 最新のお知らせ</h2>
                    <div style={{ background: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        {posts.map((post) => (
                            <Link href={`/news/${post.slug}`} key={post.id} style={{ display: 'block', padding: '12px 20px', textDecoration: 'none', color: '#444', borderBottom: '1px solid #f0f0f0' }}>
                                <span style={{ fontSize: '0.9em' }}>{decodeHtml(post.title.rendered)}</span>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Django 製品一覧セクション */}
                <section>
                    <h2 style={{ fontSize: '1.4em', marginBottom: '25px', display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
                        <span style={{ background: '#28a745', width: '6px', height: '24px', marginRight: '12px', borderRadius: '2px' }}></span>
                        Lenovo 製品ラインナップ
                    </h2>

                    {!pcData ? (
                        <p>データを読み込み中、または取得に失敗しました。</p>
                    ) : (
                        <>
                            {/* 💡 商品グリッド (ProductCardを使用) */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
                                {pcData.results.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>

                            {/* ページネーション */}
                            <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
                                {pcData.previous && (
                                    <Link href={`/?offset=${currentOffset - limit}`} style={{ padding: '8px 20px', background: '#fff', border: '1px solid #ddd', borderRadius: '6px', textDecoration: 'none', color: '#666' }}>← 前へ</Link>
                                )}
                                <span style={{ fontSize: '0.9em', color: '#888' }}>{currentPage} / {totalPages}</span>
                                {pcData.next && (
                                    <Link href={`/?offset=${currentOffset + limit}`} style={{ padding: '8px 20px', background: '#fff', border: '1px solid #ddd', borderRadius: '6px', textDecoration: 'none', color: '#666' }}>次へ →</Link>
                                )}
                            </div>
                        </>
                    )}
                </section>
            </main>
        </div>
    );
}
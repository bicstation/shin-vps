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

/**
 * HTMLエンティティをデコードする
 */
const decodeHtml = (html: string) => {
    if (!html) return '';
    const map: { [key: string]: string } = { '&nbsp;': ' ', '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>' };
    return html.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
        .replace(/&[a-z]+;/gi, (match) => map[match] || map[match.toLowerCase()] || match);
};

/**
 * 日付を日本語形式に変換
 */
const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

/**
 * URLの末尾にある '#' や '?' 以降を削除してリンクを綺麗にする
 */
const cleanUrl = (url: string) => {
    if (!url) return '#';
    return url.split('#')[0].split('?')[0];
};

const SITE_COLOR = '#007bff';

// --- データ取得関数 (サーバーサイド) ---

async function fetchPostList(): Promise<WpPost[]> {
    const WP_API_URL = `http://nginx-wp-v2/wp-json/wp/v2/posts?_embed&per_page=5`;
    try {
        const res = await fetch(WP_API_URL, {
            headers: { 'Host': 'stg.blog.tiper.live' },
            cache: 'no-store'
        });
        return res.ok ? await res.json() : [];
    } catch (error) {
        console.error("WordPress API Error:", error);
        return [];
    }
}

async function fetchPCProducts(offset = 0): Promise<{ data: PCProductResponse | null, debugUrl: string }> {
    const isServer = typeof window === 'undefined';

    // サーバーサイド (Next.js コンテナ) -> django-v2:8000 (内部通信)
    // クライアントサイド (ブラウザ) -> localhost:8083 (Traefik 経由)
    const API_BASE_URL = isServer
        ? 'http://django-v2:8000/api'
        : 'http://localhost:8083/api';

    const DJANGO_API_URL = `${API_BASE_URL}/pc-products/?maker=Lenovo&limit=10&offset=${offset}`;

    try {
        const res = await fetch(DJANGO_API_URL, {
            cache: 'no-store',
            headers: {
                'Accept': 'application/json',
                'Host': 'localhost' // Traefikのルーティング維持に必要
            }
        });

        if (!res.ok) {
            console.error(`❌ API Fetch Error: ${res.status} URL: ${DJANGO_API_URL}`);
            return { data: null, debugUrl: DJANGO_API_URL };
        }

        const data = await res.json();
        return { data, debugUrl: DJANGO_API_URL };
    } catch (error) {
        console.error("🚨 Django API Connection Failed:", error);
        return { data: null, debugUrl: DJANGO_API_URL };
    }
}

// --- メインページコンポーネント ---

export default async function Page({ searchParams }: { searchParams: Promise<{ offset?: string }> }) {
    const title = process.env.NEXT_PUBLIC_APP_TITLE || 'Bicstation';

    // Next.js 15+ では searchParams は Promise なので await する
    const params = await searchParams;
    const currentOffset = parseInt(params.offset || '0', 10);
    const limit = 10;

    // 並列でデータを取得
    const [posts, { data: pcData, debugUrl }] = await Promise.all([
        fetchPostList(),
        fetchPCProducts(currentOffset)
    ]);

    // ページ計算
    const currentPage = Math.floor(currentOffset / limit) + 1;
    const totalPages = pcData ? Math.ceil(pcData.count / limit) : 0;

    return (
        <div style={{ fontFamily: 'sans-serif', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>

            {/* 🛠️ デバッグ用パネル */}
            <div style={{ background: '#fff3cd', padding: '10px 40px', borderBottom: '1px solid #ffeeba', fontSize: '0.8em', color: '#856404' }}>
                <strong>🛠️ API Debug Info:</strong><br />
                Fetching from: <code>{debugUrl}</code><br />
                Status: {pcData ? `✅ OK (${pcData.count} items in DB)` : '❌ Fetch Failed'} |
                Page: {currentPage} / {totalPages}
            </div>

            {/* 1. ヘッダー */}
            <header style={{ background: '#222', color: 'white', padding: '15px 40px', borderBottom: `4px solid ${SITE_COLOR}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.6em', letterSpacing: '1px' }}>{title.toUpperCase()}</h1>
                    <p style={{ margin: 0, fontSize: '0.7em', color: '#aaa' }}>Next.js 15 SSR Mode</p>
                </div>
            </header>

            <div style={{ display: 'flex', flexGrow: 1 }}>

                {/* 2. サイドバー */}
                <aside style={{ width: '240px', background: '#fff', padding: '30px 20px', borderRight: '1px solid #dee2e6' }}>
                    <h3 style={{ fontSize: '0.9em', color: '#888', marginBottom: '15px', borderLeft: `4px solid ${SITE_COLOR}`, paddingLeft: '10px' }}>MENU</h3>
                    <ul style={{ listStyle: 'none', padding: 0, lineHeight: '2.5', fontSize: '0.95em' }}>
                        <li><Link href="/" style={{ color: SITE_COLOR, textDecoration: 'none', fontWeight: 'bold' }}>🏠 ホーム</Link></li>
                        <li><span style={{ color: '#ccc' }}>💻 PC製品 (Lenovo)</span></li>
                    </ul>
                </aside>

                {/* 3. メインエリア */}
                <main style={{ flexGrow: 1, padding: '40px', maxWidth: '1100px' }}>

                    {/* WordPress セクション */}
                    <section style={{ marginBottom: '50px' }}>
                        <h2 style={{ fontSize: '1.3em', marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
                            <span style={{ width: '8px', height: '24px', background: SITE_COLOR, marginRight: '12px' }}></span>
                            最新のお知らせ
                        </h2>
                        <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', border: '1px solid #eee' }}>
                            {posts.length === 0 ? <p style={{ padding: '20px' }}>お知らせはありません</p> : posts.map((post, idx) => (
                                <Link href={`/news/${post.slug}`} key={post.id} style={{ display: 'block', padding: '15px 20px', textDecoration: 'none', color: '#333', borderBottom: idx === posts.length - 1 ? 'none' : '1px solid #f0f0f0' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontWeight: '500' }}>{decodeHtml(post.title.rendered)}</span>
                                        <span style={{ color: '#999', fontSize: '0.85em' }}>{formatDate(post.date)}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>

                    {/* Django PC製品 セクション */}
                    <section>
                        <h2 style={{ fontSize: '1.3em', marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
                            <span style={{ width: '8px', height: '24px', background: '#28a745', marginRight: '12px' }}></span>
                            LENOVO 製品カタログ
                        </h2>

                        {!pcData || pcData.results.length === 0 ? (
                            <div style={{ padding: '20px', background: '#fff', border: '1px dashed #ccc', textAlign: 'center' }}>
                                <p>製品データが見つかりません。</p>
                            </div>
                        ) : (
                            <>
                                {/* 商品グリッド */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '25px' }}>
                                    {pcData.results.map((product) => (
                                        <div key={product.id} style={{ background: 'white', border: '1px solid #eee', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                                            <div style={{ height: '160px', marginBottom: '15px', textAlign: 'center' }}>
                                                <img src={product.image_url} alt={product.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                                <span style={{ fontSize: '0.75em', fontWeight: 'bold', color: SITE_COLOR }}>{product.maker}</span>
                                                <span style={{ fontSize: '0.7em', padding: '2px 8px', borderRadius: '4px', background: '#e6f7ff', color: '#1890ff' }}>{product.stock_status}</span>
                                            </div>
                                            <h4 style={{ fontSize: '0.95em', margin: '0 0 15px 0', height: '3em', overflow: 'hidden', lineHeight: '1.4' }}>{product.name}</h4>
                                            <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '15px', marginTop: 'auto' }}>
                                                <p style={{ color: '#d9534f', fontSize: '1.2em', fontWeight: 'bold', margin: '0 0 15px 0' }}>
                                                    {product.price > 0 ? `¥${product.price.toLocaleString()}` : "価格情報なし"}
                                                </p>
                                                <a
                                                    href={cleanUrl(product.url)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ display: 'block', textAlign: 'center', padding: '10px', background: '#333', color: 'white', textDecoration: 'none', borderRadius: '6px', fontSize: '0.85em' }}
                                                >
                                                    詳細を見る
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* ページ送り (Pagination) */}
                                <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                                    <div style={{ display: 'flex', gap: '15px' }}>
                                        {/* 「前へ」ボタン */}
                                        {pcData.previous ? (
                                            <Link
                                                href={`/bicstation?offset=${Math.max(0, currentOffset - limit)}`}
                                                style={{ padding: '10px 25px', border: '1px solid #ccc', borderRadius: '6px', textDecoration: 'none', color: '#333', background: '#fff' }}
                                            >
                                                ← 前へ
                                            </Link>
                                        ) : (
                                            <span style={{ padding: '10px 25px', border: '1px solid #eee', borderRadius: '6px', color: '#ccc', background: '#f9f9f9', cursor: 'not-allowed' }}>← 前へ</span>
                                        )}

                                        {/* 「次へ」ボタン */}
                                        {pcData.next ? (
                                            <Link
                                                href={`/bicstation?offset=${currentOffset + limit}`}
                                                style={{ padding: '10px 25px', background: SITE_COLOR, color: 'white', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold' }}>
                                                次へ →
                                            </Link>
                                        ) : (
                                            <span style={{ padding: '10px 25px', background: '#e0e0e0', color: '#aaa', borderRadius: '6px', cursor: 'not-allowed' }}>次へ →</span>
                                        )}
                                    </div>
                                    <div style={{ fontSize: '0.9em', color: '#666' }}>
                                        {currentPage} / {totalPages} ページ (合計 {pcData.count} 件)
                                    </div>
                                </div>
                            </>
                        )}
                    </section>
                </main>
            </div>

            <footer style={{ background: '#222', color: '#777', padding: '30px', textAlign: 'center', fontSize: '0.85em' }}>
                <p>&copy; {new Date().getFullYear()} {title}</p>
            </footer>
        </div>
    );
}
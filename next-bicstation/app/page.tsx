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
    stock_status: string; // 💡 追加：在庫/受注状況
    unified_genre: string; // 💡 追加：統合ジャンル
}

interface PCProductResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: PCProduct[];
}

// --- データ取得関数 (サーバーサイド) ---

/**
 * WordPressからお知らせを取得
 */
async function fetchPostList(): Promise<WpPost[]> {
    const WP_API_URL = `http://nginx-wp-v2/wp-json/wp/v2/bicstation?_embed&per_page=5`;
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

/**
 * Django APIからPC製品一覧を取得
 * 💡 site=lenovo パラメータを付与してフィルタリング
 */
async function fetchPCProducts(offset = 0): Promise<PCProductResponse | null> {
    // Bicstation用なので lenovo を指定。全体を見たい場合は site パラメータを外す
    const DJANGO_API_URL = `http://django-v2:8000/api/pc-products/?site=lenovo&limit=10&offset=${offset}`;
    
    try {
        const res = await fetch(DJANGO_API_URL, { 
            cache: 'no-store',
            headers: { 
                'Host': 'stg.tiper.live',
                'Accept': 'application/json'
            } 
        });

        if (!res.ok) return null;
        return await res.json();
    } catch (error) {
        console.error("Django API Fetch Exception:", error);
        return null;
    }
}

// --- ユーティリティ ---

const decodeHtml = (html: string) => {
    if (!html) return '';
    const map: { [key: string]: string } = { '&nbsp;': ' ', '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>' };
    return html.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
               .replace(/&[a-z]+;/gi, (match) => map[match] || map[match.toLowerCase()] || match);
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

const SITE_COLOR = '#007bff'; // Bicstationのテーマカラー

// --- メインページコンポーネント ---

export default async function Page({ searchParams }: { searchParams: { offset?: string } }) {
    const title = process.env.NEXT_PUBLIC_APP_TITLE || 'Bicstation';
    const currentOffset = parseInt(searchParams.offset || '0', 10);
    
    // データを並列取得
    const [posts, pcData] = await Promise.all([
        fetchPostList(),
        fetchPCProducts(currentOffset)
    ]);

    return (
        <div style={{ fontFamily: 'sans-serif', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
            
            {/* 1. ヘッダー */}
            <header style={{ background: '#222', color: 'white', padding: '15px 40px', borderBottom: `4px solid ${SITE_COLOR}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.6em', letterSpacing: '1px' }}>{title.toUpperCase()}</h1>
                    <p style={{ margin: 0, fontSize: '0.7em', color: '#aaa' }}>Production Environment: {process.env.NODE_ENV}</p>
                </div>
                <nav style={{ fontSize: '0.9em' }}>
                    Django DB & WordPress Hybrid Portal
                </nav>
            </header>

            <div style={{ display: 'flex', flexGrow: 1 }}>
                
                {/* 2. サイドバー */}
                <aside style={{ width: '240px', background: '#fff', padding: '30px 20px', borderRight: '1px solid #dee2e6' }}>
                    <h3 style={{ fontSize: '0.9em', color: '#888', marginBottom: '15px', borderLeft: `4px solid ${SITE_COLOR}`, paddingLeft: '10px' }}>CATEGORIES</h3>
                    <ul style={{ listStyle: 'none', padding: 0, lineHeight: '2.5', fontSize: '0.95em' }}>
                        <li><Link href="/" style={{ color: SITE_COLOR, textDecoration: 'none', fontWeight: 'bold' }}>🏠 ホーム</Link></li>
                        <li><span style={{ color: '#ccc' }}>💻 ノートPC (Coming soon)</span></li>
                        <li><span style={{ color: '#ccc' }}>🖥️ デスクトップ (Coming soon)</span></li>
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
                            {posts.map((post, idx) => (
                                <Link href={`/news/${post.slug}`} key={post.id} style={{ display: 'block', padding: '15px 20px', textDecoration: 'none', color: '#333', borderBottom: idx === posts.length - 1 ? 'none' : '1px solid #f0f0f0', transition: 'background 0.2s' }}>
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
                            <p>製品データを取得中、またはデータがありません。</p>
                        ) : (
                            <>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '25px' }}>
                                    {pcData.results.map((product) => (
                                        <div key={product.id} style={{ background: 'white', border: '1px solid #eee', borderRadius: '12px', padding: '20px', transition: 'transform 0.2s', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                                            <div style={{ height: '160px', marginBottom: '15px', textAlign: 'center' }}>
                                                <img src={product.image_url} alt={product.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                                            </div>
                                            
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                                <span style={{ fontSize: '0.75em', fontWeight: 'bold', color: SITE_COLOR, textTransform: 'uppercase' }}>{product.maker}</span>
                                                {/* 💡 受注ステータスの表示ロジック */}
                                                <span style={{ 
                                                    fontSize: '0.7em', 
                                                    padding: '2px 8px', 
                                                    borderRadius: '4px', 
                                                    background: product.stock_status === '受注停止中' ? '#ff4d4f' : '#e6f7ff',
                                                    color: product.stock_status === '受注停止中' ? 'white' : '#1890ff'
                                                }}>
                                                    {product.stock_status}
                                                </span>
                                            </div>

                                            <h4 style={{ fontSize: '0.95em', margin: '0 0 15px 0', height: '3em', overflow: 'hidden', color: '#222', lineHeight: '1.4' }}>
                                                {product.name}
                                            </h4>

                                            <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '15px', marginTop: 'auto' }}>
                                                <p style={{ color: '#d9534f', fontSize: '1.2em', fontWeight: 'bold', margin: '0 0 15px 0' }}>
                                                    ¥{product.price.toLocaleString()} <span style={{ fontSize: '0.6em', color: '#999', fontWeight: 'normal' }}>税込</span>
                                                </p>
                                                <a href={product.url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', textAlign: 'center', padding: '10px', background: '#333', color: 'white', textDecoration: 'none', borderRadius: '6px', fontSize: '0.85em' }}>
                                                    詳細を見る
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* ページネーション */}
                                <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
                                    {pcData.previous && (
                                        <Link href={`/?offset=${currentOffset - 10}`} style={{ padding: '10px 20px', border: '1px solid #ccc', borderRadius: '6px', textDecoration: 'none', color: '#666' }}>← 前のページ</Link>
                                    )}
                                    {pcData.next && (
                                        <Link href={`/?offset=${currentOffset + 10}`} style={{ padding: '10px 20px', background: SITE_COLOR, color: 'white', borderRadius: '6px', textDecoration: 'none' }}>次のページ →</Link>
                                    )}
                                </div>
                            </>
                        )}
                    </section>
                </main>
            </div>

            <footer style={{ background: '#222', color: '#777', padding: '30px', textAlign: 'center', fontSize: '0.85em' }}>
                <p>&copy; {new Date().getFullYear()} {title} - Data Aggregation System</p>
            </footer>
        </div>
    );
}
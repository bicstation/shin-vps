// ファイル名: next-bicstation/app/page.tsx

/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/no-danger-to-js */
// @ts-nocheck 

/**
 * 💡 Next.jsの強力なキャッシュを無効化し、
 * アクセスのたびにDjango APIから最新データを取得する設定
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
    link: string;
}

interface PCProduct {
    id: number;
    unique_id: string;
    maker: string;
    name: string;
    price: number;
    image_url: string;
    url: string;
}

interface PCProductResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: PCProduct[];
}

// --- データ取得関数 (サーバーサイド) ---

/**
 * WordPressからカスタム投稿(bicstation)を取得
 * 内部ネットワーク nginx-wp-v2 を経由
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
 * Django APIからPC製品一覧を取得 (内部ネットワークを使用)
 * stg.tiper.live ではなく django-v2:8000 を直接叩くことで、
 * SSL証明書や外部DNSの解決問題を回避します。
 */
async function fetchPCProducts(offset = 0): Promise<PCProductResponse | null> {
    const DJANGO_API_URL = `http://django-v2:8000/api/pc-products/?limit=10&offset=${offset}`;
    
    try {
        const res = await fetch(DJANGO_API_URL, { 
            cache: 'no-store',
            // DjangoのALLOWED_HOSTSをパスするためにHostヘッダーを明示的に指定
            headers: { 
                'Host': 'stg.tiper.live',
                'Accept': 'application/json'
            } 
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error(`Django API Error: Status ${res.status}`, errorText);
            return null;
        }

        return await res.json();
    } catch (error) {
        console.error("Django API Fetch Exception:", error);
        return null;
    }
}

// --- ユーティリティ ---

const decodeHtml = (html: string) => {
    const map: { [key: string]: string } = { '&nbsp;': ' ', '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>' };
    return html.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
               .replace(/&[a-z]+;/gi, (match) => map[match] || map[match.toLowerCase()] || match);
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

const SITE_COLOR = '#007bff';

// --- メインページコンポーネント ---

export default async function Page({ searchParams }: { searchParams: { offset?: string } }) {
    const title = process.env.NEXT_PUBLIC_APP_TITLE || 'Bicstation';
    
    // クエリパラメータからオフセットを取得
    const currentOffset = parseInt(searchParams.offset || '0', 10);
    
    // WPとDjangoの両方からデータを並列取得
    const [posts, pcData] = await Promise.all([
        fetchPostList(),
        fetchPCProducts(currentOffset)
    ]);

    return (
        <div style={{ fontFamily: 'Arial, sans-serif', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f4f4f4' }}>
            
            {/* 1. ヘッダー */}
            <header style={{ background: '#333', color: 'white', padding: '15px 20px', borderBottom: `3px solid ${SITE_COLOR}` }}>
                <h1 style={{ margin: 0, fontSize: '1.5em' }}>{title}</h1>
                <p style={{ margin: '5px 0 0 0', fontSize: '0.8em', color: '#ccc' }}>stg.bicstation.com - Dynamic Catalog</p>
            </header>

            <div style={{ display: 'flex', flexGrow: 1 }}>
                
                {/* 2. サイドバー */}
                <aside style={{ width: '220px', background: '#e0e0e0', padding: '20px', borderRight: '1px solid #ccc' }}>
                    <h3 style={{ marginTop: 0, color: SITE_COLOR }}>メニュー</h3>
                    <ul style={{ listStyleType: 'none', padding: 0 }}>
                        <li>
                            <Link href="/" style={{ textDecoration: 'none', color: '#333', fontWeight: 'bold' }}>ホーム</Link>
                        </li>
                        <li style={{ marginTop: '20px' }}>
                             <span style={{ fontSize: '0.8em', color: '#666', fontWeight: 'bold' }}>DATA SOURCE</span>
                             <ul style={{ paddingLeft: '10px', fontSize: '0.85em', marginTop: '5px', lineHeight: '1.8' }}>
                                 <li style={{ color: '#28a745' }}>● Django API (Internal)</li>
                                 <li style={{ color: SITE_COLOR }}>● WordPress API (Internal)</li>
                             </ul>
                        </li>
                    </ul>
                </aside>

                {/* 3. メインエリア */}
                <main style={{ flexGrow: 1, padding: '20px', maxWidth: '1200px' }}>
                    
                    {/* WordPress セクション */}
                    <section style={{ marginBottom: '40px' }}>
                        <h2 style={{ color: SITE_COLOR, borderBottom: '2px solid #ddd', paddingBottom: '10px', fontSize: '1.2em' }}>
                            お知らせ (WordPress)
                        </h2>
                        {posts.length === 0 ? (
                            <p style={{ color: '#666', fontSize: '0.9em' }}>記事が見つかりませんでした。</p>
                        ) : (
                            <ul style={{ listStyleType: 'none', padding: 0 }}>
                                {posts.map((post) => (
                                    <li key={post.id} style={{ marginBottom: '10px', padding: '12px', background: 'white', border: '1px solid #eee', borderRadius: '4px' }}>
                                        <Link href={`/bicstation/${post.slug}`} style={{ textDecoration: 'none', color: '#333', fontWeight: 'bold' }}>
                                            {decodeHtml(post.title.rendered)}
                                        </Link>
                                        <span style={{ marginLeft: '15px', color: '#999', fontSize: '0.8em' }}>{formatDate(post.date)}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    {/* Django PC製品 セクション */}
                    <section>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #ddd', paddingBottom: '10px', marginBottom: '20px' }}>
                            <h2 style={{ color: '#28a745', margin: 0, fontSize: '1.2em' }}>
                                PC製品カタログ ({pcData?.count || 0}件)
                            </h2>
                            <span style={{ fontSize: '0.8em', background: '#28a745', color: 'white', padding: '2px 8px', borderRadius: '10px' }}>
                                Page {Math.floor(currentOffset / 10) + 1}
                            </span>
                        </div>
                        
                        {!pcData || pcData.results.length === 0 ? (
                            <div style={{ padding: '40px', textAlign: 'center', background: '#fff', borderRadius: '8px', border: '1px dashed #ccc' }}>
                                <p style={{ color: '#d9534f', fontWeight: 'bold' }}>製品データを読み込めませんでした。</p>
                                <p style={{ fontSize: '0.85em', color: '#666' }}>APIサーバー (django-v2) への接続を確認してください。</p>
                            </div>
                        ) : (
                            <>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
                                    {pcData.results.map((product) => (
                                        <div key={product.id} style={{ background: 'white', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                                            <div style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px', background: '#f9f9f9', borderRadius: '4px' }}>
                                                <img 
                                                    src={product.image_url} 
                                                    alt={product.name} 
                                                    style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} 
                                                />
                                            </div>
                                            <p style={{ fontSize: '0.7em', color: '#007bff', fontWeight: 'bold', margin: '0 0 5px 0' }}>{product.maker}</p>
                                            <h4 style={{ fontSize: '0.9em', margin: '0 0 10px 0', height: '3.6em', overflow: 'hidden', lineHeight: '1.2' }}>
                                                {product.name}
                                            </h4>
                                            <div style={{ marginTop: 'auto' }}>
                                                <p style={{ color: '#d9534f', fontWeight: 'bold', fontSize: '1.1em', margin: '0 0 10px 0' }}>
                                                    ¥{product.price.toLocaleString()}
                                                </p>
                                                <a 
                                                    href={product.url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    style={{ display: 'block', textAlign: 'center', padding: '8px', background: '#f8f9fa', border: '1px solid #ddd', textDecoration: 'none', color: '#333', fontSize: '0.85em', borderRadius: '4px' }}
                                                >
                                                    公式サイトで確認
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* ページネーションコントロール */}
                                <div style={{ marginTop: '30px', display: 'flex', gap: '15px', alignItems: 'center', justifyContent: 'center', paddingBottom: '40px' }}>
                                    {pcData.previous && (
                                        <Link 
                                            href={`/?offset=${currentOffset - 10}`} 
                                            style={{ padding: '10px 20px', background: '#6c757d', color: 'white', textDecoration: 'none', borderRadius: '4px', fontSize: '0.9em' }}
                                        >
                                            ← 前の10件
                                        </Link>
                                    )}
                                    
                                    <div style={{ padding: '10px 20px', background: '#fff', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.9em', fontWeight: 'bold' }}>
                                        {currentOffset + 1} - {Math.min(currentOffset + 10, pcData.count)} 件目を表示中
                                    </div>

                                    {pcData.next && (
                                        <Link 
                                            href={`/?offset=${currentOffset + 10}`} 
                                            style={{ padding: '10px 20px', background: SITE_COLOR, color: 'white', textDecoration: 'none', borderRadius: '4px', fontSize: '0.9em' }}
                                        >
                                            次の10件 →
                                        </Link>
                                    )}
                                </div>
                            </>
                        )}
                    </section>
                </main>
            </div>

            {/* 4. フッター */}
            <footer style={{ background: '#333', color: 'white', padding: '15px 20px', textAlign: 'center', borderTop: `3px solid ${SITE_COLOR}`, fontSize: '0.8em' }}>
                <p style={{ margin: 0 }}>&copy; {new Date().getFullYear()} {title} Admin Portal. All Rights Reserved.</p>
            </footer>
        </div>
    );
}
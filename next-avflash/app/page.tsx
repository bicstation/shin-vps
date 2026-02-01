// ファイル名: app/page.tsx

/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/no-danger */
// @ts-nocheck 

import React from 'react';
import Link from 'next/link';
import { getAdultProductsByMaker } from '@shared/components/lib/api';
import AdultProductCard from '@shared/components/cards/AdultProductCard';
import { decodeHtml } from '@shared/components/lib/decode';

// 💡 日付フォーマット用のヘルパー
const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('ja-JP');
};

interface WpPost {
    id: number;
    slug: string;
    title: { rendered: string };
    date: string;
    _embedded?: {
        'wp:featuredmedia'?: Array<{ source_url: string }>;
    };
}

/**
 * 💡 WordPress 記事取得
 */
async function fetchPostList(): Promise<WpPost[]> {
    const WP_API_URL = `http://nginx-wp-v2/wp-json/wp/v2/avflash?_embed&per_page=4`;
    try {
        const res = await fetch(WP_API_URL, {
            headers: { 'Host': 'stg.blog.tiper.live' },
            next: { revalidate: 60 }
        });
        return res.ok ? await res.json() : [];
    } catch (error) {
        console.error("WP API Error:", error);
        return [];
    }
}

/**
 * 💡 メインページコンポーネント
 * 🚨 注意: viewport 設定などは layout.tsx に集約したため、ここでは定義しません
 */
export default async function Page() {
    const title = process.env.NEXT_PUBLIC_APP_TITLE || 'AVFLASH.xyz';
    
    // データ取得
    const [posts, products] = await Promise.all([
        fetchPostList(),
        getAdultProductsByMaker('mgs', 12) 
    ]);

    const SITE_COLOR = '#ff4500';

    return (
        <div style={{ backgroundColor: '#0f0f0f', color: '#fff', minHeight: '100vh' }}>
            
            {/* --- ヒーローセクション --- */}
            <section style={{ 
                padding: '60px 20px', 
                textAlign: 'center', 
                background: 'linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%)',
                borderBottom: `1px solid #333`
            }}>
                <h1 style={{ fontSize: '3rem', color: SITE_COLOR, marginBottom: '10px', fontWeight: 'bold' }}>
                    {title}
                </h1>
                <p style={{ color: '#aaa', fontSize: '1.2rem' }}>
                    MGS動画・新作作品の最速比較ポータル
                </p>
            </section>

            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px' }}>
                
                {/* --- 商品セクション --- */}
                <section style={{ marginBottom: '60px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                        <h2 style={{ borderLeft: `6px solid ${SITE_COLOR}`, paddingLeft: '15px', margin: 0 }}>
                            NEW RELEASES
                        </h2>
                    </div>
                    
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                        gap: '30px' 
                    }}>
                        {products && products.length > 0 ? (
                            products.map((item) => (
                                <AdultProductCard key={item.id} product={item} />
                            ))
                        ) : (
                            <p style={{ color: '#888' }}>最新作品がありません。</p>
                        )}
                    </div>
                </section>

                {/* --- カラムセクション --- */}
                <section>
                    <h2 style={{ borderLeft: `6px solid ${SITE_COLOR}`, paddingLeft: '15px', marginBottom: '25px' }}>
                        AVFLASH COLUMN
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '25px' }}>
                        {posts && posts.length > 0 ? (
                            posts.map((post) => (
                                <article key={post.id} style={{ 
                                    display: 'flex', 
                                    background: '#1a1a1a', 
                                    borderRadius: '12px', 
                                    overflow: 'hidden',
                                    border: '1px solid #222'
                                }}>
                                    <div style={{ width: '180px', flexShrink: 0 }}>
                                        <img 
                                            src={post._embedded?.['wp:featuredmedia']?.[0]?.source_url || '/no-image.png'} 
                                            alt="" 
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </div>
                                    <div style={{ padding: '20px', flex: 1 }}>
                                        <Link href={`/avflash/${post.slug}`} style={{ textDecoration: 'none' }}>
                                            <h3 style={{ color: '#fff', fontSize: '1.2rem', margin: '0 0 10px 0' }}>
                                                {decodeHtml(post.title.rendered)}
                                            </h3>
                                        </Link>
                                        <span style={{ fontSize: '0.8rem', color: '#666' }}>{formatDate(post.date)}</span>
                                    </div>
                                </article>
                            ))
                        ) : (
                            <p style={{ color: '#555' }}>記事を準備中です。</p>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/no-danger */
// @ts-nocheck 

import React from 'react';
import Link from 'next/link';
import { getAdultProductsByMaker } from '@shared/lib/api';
import AdultProductCard from '@shared/cards/AdultProductCard';
import { decodeHtml } from '@shared/lib/decode';

/**
 * 💡 日付フォーマット用のヘルパー
 */
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
 * 💡 WordPress 記事取得 (AV FLASH 専用カテゴリ)
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
 * 🚀 DUGA の新作をメインストリームに据えた構成
 */
export default async function Page() {
    // サイトタイトルの取得
    const title = process.env.NEXT_PUBLIC_APP_TITLE || 'AVFLASH.xyz';
    
    // 1. WP記事と 2. DUGAの新作商品（api_source: 'duga'）を並列取得
    const [posts, products] = await Promise.all([
        fetchPostList(),
        getAdultProductsByMaker('duga', 12) // 🚀 MGSからDUGAへ変更
    ]);

    // AV FLASH のテーマカラー（ゴールド/イエロー系）
    const SITE_COLOR = '#ffc107'; 

    return (
        <div style={{ backgroundColor: '#0f0f0f', color: '#fff', minHeight: '100vh' }}>
            
            {/* --- 🛸 ヒーローセクション: 視認性の高いフラッシュ・ヘッダー --- */}
            <section style={{ 
                padding: '80px 20px', 
                textAlign: 'center', 
                background: 'radial-gradient(circle at center, #1a1a1a 0%, #080808 100%)',
                borderBottom: `1px solid #222`,
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* 装飾用バックライト */}
                <div style={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    width: '300px', height: '300px', backgroundColor: SITE_COLOR,
                    filter: 'blur(120px)', opacity: 0.05, pointerEvents: 'none'
                }} />

                <h1 style={{ 
                    fontSize: 'clamp(2.5rem, 8vw, 4rem)', 
                    color: SITE_COLOR, 
                    marginBottom: '15px', 
                    fontWeight: '900',
                    letterSpacing: '0.1em',
                    textShadow: `0 0 20px ${SITE_COLOR}44`
                }}>
                    {title}
                </h1>
                <p style={{ color: '#888', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
                    DUGA動画・新作作品のAI解析 ＆ 最速比較ポータル
                </p>
            </section>

            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px' }}>
                
                {/* --- 💎 NEW RELEASES: DUGAの最新トレンド --- */}
                <section style={{ marginBottom: '80px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px' }}>
                        <div>
                            <h2 style={{ 
                                fontSize: '1.8rem', 
                                borderLeft: `6px solid ${SITE_COLOR}`, 
                                paddingLeft: '20px', 
                                margin: 0,
                                lineHeight: 1
                            }}>
                                NEW RELEASES
                            </h2>
                            <p style={{ color: '#555', fontSize: '0.9rem', marginTop: '8px', paddingLeft: '26px' }}>
                                最新のDUGA配信作品を独自のスコアでリストアップ
                            </p>
                        </div>
                        <Link href="/brand/duga" style={{ color: SITE_COLOR, textDecoration: 'none', fontSize: '0.9rem' }}>
                            VIEW ALL DUGA →
                        </Link>
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
                            <div style={{ padding: '40px', textAlign: 'center', background: '#111', borderRadius: '12px', gridColumn: '1/-1' }}>
                                <p style={{ color: '#555' }}>[!] データ解析中... しばらくお待ちください。</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* --- 📝 AVFLASH COLUMN: WordPress連携 --- */}
                <section style={{ paddingBottom: '60px' }}>
                    <div style={{ marginBottom: '30px' }}>
                        <h2 style={{ 
                            fontSize: '1.8rem', 
                            borderLeft: `6px solid ${SITE_COLOR}`, 
                            paddingLeft: '20px', 
                            margin: 0,
                            lineHeight: 1
                        }}>
                            AVFLASH COLUMN
                        </h2>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '25px' }}>
                        {posts && posts.length > 0 ? (
                            posts.map((post) => (
                                <article key={post.id} style={{ 
                                    display: 'flex', 
                                    background: '#161616', 
                                    borderRadius: '12px', 
                                    overflow: 'hidden',
                                    border: '1px solid #222',
                                    transition: 'border-color 0.3s'
                                }}>
                                    <div style={{ width: '160px', flexShrink: 0 }}>
                                        <img 
                                            src={post._embedded?.['wp:featuredmedia']?.?.source_url || '/no-image.png'} 
                                            alt="" 
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </div>
                                    <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                        <Link href={`/news/${post.slug}`} style={{ textDecoration: 'none' }}>
                                            <h3 style={{ 
                                                color: '#eee', 
                                                fontSize: '1.1rem', 
                                                margin: '0 0 10px 0',
                                                lineHeight: '1.4',
                                                transition: 'color 0.2s'
                                            }}>
                                                {decodeHtml(post.title.rendered)}
                                            </h3>
                                        </Link>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span style={{ fontSize: '0.75rem', color: SITE_COLOR, fontWeight: 'bold' }}>REPORT</span>
                                            <span style={{ fontSize: '0.75rem', color: '#555' }}>{formatDate(post.date)}</span>
                                        </div>
                                    </div>
                                </article>
                            ))
                        ) : (
                            <p style={{ color: '#555' }}>最新のレポートはありません。</p>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
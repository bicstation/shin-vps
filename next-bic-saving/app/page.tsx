/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */
// @ts-nocheck
// /home/maya/dev/shin-vps/next-bic-saving/app/page.tsx

import React from 'react';
import Link from 'next/link';
// ✅ Django Bridge からハイブリッド取得用をインポート
import { fetchPostList } from '@/shared/lib/api/django-bridge'; 

/**
 * 💡 Next.js 15 用の動的レンダリング設定
 */
export const dynamic = 'force-dynamic'; 
export const revalidate = 0;

/**
 * 📝 アドセンス審査・ビルド時ガード用：モックデータ
 */
const MOCK_POSTS = [
    {
        id: 101,
        slug: 'tech-saving-2026',
        title: '【2026年版】最新テックで固定費を「自動」で削る3つのステップ',
        created_at: '2026-03-18T10:00:00',
    },
    {
        id: 102,
        slug: 'grocery-shopping-hacks',
        title: '食費を月1万円ダウン！失敗しない「買い物リスト」構築術',
        created_at: '2026-03-17T12:00:00',
    },
    {
        id: 103,
        slug: 'smart-gadget-selection',
        title: '安物買いの銭失いを防ぐ！リセールバリューを意識したガジェット選び',
        created_at: '2026-03-16T15:00:00',
    }
];

// ユーティリティ
const decodeHtml = (html: string) => html?.replace(/&[^;]+;/g, ' ') || '';
const formatDate = (dateString: string) => 
    dateString ? new Date(dateString).toLocaleDateString('ja-JP') : 'RECENT';

/**
 * 🏠 BICSTATION / ビック的節約生活 メインコンテンツ
 */
export default async function Page() {
    const title = process.env.NEXT_PUBLIC_APP_TITLE || 'ビック的な最新記事';

    let posts = [];
    try {
        /**
         * 🛰️ ハイブリッド取得
         * 'saving' カテゴリの投稿を 10 件取得します。
         * ビルド環境（Django未稼働）でも例外をキャッチして MOCK を流します。
         */
        const response = await fetchPostList('saving', 10, 0);
        posts = response?.results?.length > 0 ? response.results : MOCK_POSTS;
    } catch (error) {
        console.warn("[FrontPage] API connection deferred. Loading standby data.");
        posts = MOCK_POSTS; 
    }

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <header style={{ marginBottom: '30px' }}>
                <h2 style={{ 
                    color: '#333', 
                    borderLeft: '5px solid #ffcc00', 
                    padding: '5px 15px',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    letterSpacing: '-0.02em'
                }}>
                    {title}
                </h2>
            </header>
            
            <div style={{ 
                display: 'grid', 
                gap: '24px', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' 
            }}>
                {posts.map((post) => {
                    // IDまたはSlugを選択
                    const identifier = post.slug || post.id;
                    const displayTitle = typeof post.title === 'object' ? post.title.rendered : post.title;
                    const displayDate = post.created_at || post.date;

                    return (
                        <article key={identifier} style={{ 
                            background: 'white', 
                            border: '1px solid #e5e7eb', 
                            borderRadius: '16px', 
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)',
                            transition: 'transform 0.2s ease'
                        }}>
                            <div style={{ padding: '24px', flexGrow: 1 }}>
                                <div style={{ 
                                    color: '#ffaa00', 
                                    fontSize: '0.7rem', 
                                    fontWeight: '800', 
                                    marginBottom: '8px',
                                    textTransform: 'uppercase'
                                }}>
                                    {post.category || 'SAVING_STRATEGY'}
                                </div>
                                <Link href={`/saving/${identifier}`} style={{ textDecoration: 'none' }}>
                                    <h3 style={{ 
                                        color: '#111', 
                                        fontSize: '1.15rem', 
                                        fontWeight: '800', 
                                        margin: '0 0 12px 0',
                                        lineHeight: '1.4'
                                    }}>
                                        {decodeHtml(displayTitle)}
                                    </h3>
                                </Link>
                                <div style={{ color: '#9ca3af', fontSize: '0.8rem', fontMono: 'true' }}>
                                    📅 {formatDate(displayDate)}
                                </div>
                            </div>
                            
                            <Link href={`/saving/${identifier}`} style={{ 
                                padding: '14px', 
                                textAlign: 'center', 
                                background: '#fefce8', // 非常に薄いイエロー
                                color: '#a16207', 
                                fontSize: '0.85rem', 
                                fontWeight: '700', 
                                textDecoration: 'none',
                                borderTop: '1px solid #fef08a',
                                transition: 'background 0.2s'
                            }}>
                                詳細レポートを閲覧する →
                            </Link>
                        </article>
                    );
                })}
            </div>

            <footer style={{ 
                marginTop: '60px', 
                padding: '20px 0',
                borderTop: '1px dashed #e5e7eb',
                fontSize: '10px', 
                color: '#9ca3af', 
                textAlign: 'center',
                fontFamily: 'monospace'
            }}>
                SYSTEM_NODE: BIC_SAVING_FRONT / PROTOCOL: NEXT_JS_15_STABLE
            </footer>
        </div>
    );
}
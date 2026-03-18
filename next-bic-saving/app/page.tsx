/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

import React from 'react';
import Link from 'next/link';
import { fetchPostList } from '@shared/lib/api'; 

// 💡 Next.js 15 用の動的レンダリング設定
export const dynamic = 'force-dynamic'; 
export const revalidate = 0;

/**
 * 📝 アドセンス審査用：モックデータ
 */
const MOCK_POSTS = [
    {
        id: 101,
        slug: 'tech-saving-2026',
        title: { rendered: '【2026年版】最新テックで固定費を「自動」で削る3つのステップ' },
        date: '2026-03-18T10:00:00',
    },
    {
        id: 102,
        slug: 'grocery-shopping-hacks',
        title: { rendered: '食費を月1万円ダウン！失敗しない「買い物リスト」構築術' },
        date: '2026-03-17T12:00:00',
    },
    {
        id: 103,
        slug: 'smart-gadget-selection',
        title: { rendered: '安物買いの銭失いを防ぐ！リセールバリューを意識したガジェット選び' },
        date: '2026-03-16T15:00:00',
    }
];

// ユーティリティ
const decodeHtml = (html) => html?.replace(/&[^;]+;/g, ' ') || '';
const formatDate = (dateString) => new Date(dateString).toLocaleDateString('ja-JP');

/**
 * 🏠 BICSTATION / ビック的節約生活 メインコンテンツ
 */
export default async function Page() {
    const title = process.env.NEXT_PUBLIC_APP_TITLE || 'ビック的な最新記事';

    let posts = [];
    try {
        const response = await fetchPostList('saving', 10);
        posts = response?.results?.length > 0 ? response.results : MOCK_POSTS;
    } catch (error) {
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
                    fontWeight: 'bold'
                }}>
                    {title}
                </h2>
            </header>
            
            <div style={{ 
                display: 'grid', 
                gap: '20px', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' 
            }}>
                {posts.map((post) => (
                    <article key={post.id || Math.random()} style={{ 
                        background: 'white', 
                        border: '1px solid #eee', 
                        borderRadius: '12px', 
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
                    }}>
                        <div style={{ padding: '20px', flexGrow: 1 }}>
                            <Link href={`/saving/${post.slug || post.id}`} style={{ textDecoration: 'none' }}>
                                <h3 style={{ color: '#222', fontSize: '1.1rem', fontWeight: 'bold', margin: '0 0 12px 0' }}>
                                    {decodeHtml(post.title?.rendered || post.title)}
                                </h3>
                            </Link>
                            <div style={{ color: '#888', fontSize: '0.8rem' }}>
                                📅 {formatDate(post.date)}
                            </div>
                        </div>
                        <Link href={`/saving/${post.slug || post.id}`} style={{ 
                            padding: '12px', textAlign: 'center', background: '#f9f9f9',
                            color: '#555', fontSize: '0.85rem', fontWeight: 'bold', textDecoration: 'none',
                            borderTop: '1px solid #eee'
                        }}>
                            記事を読む →
                        </Link>
                    </article>
                ))}
            </div>

            <footer style={{ marginTop: '40px', fontSize: '11px', color: '#bbb', textAlign: 'center' }}>
                BIC的節約生活 Node-Container-V3 / Next.js 15
            </footer>
        </div>
    );
}
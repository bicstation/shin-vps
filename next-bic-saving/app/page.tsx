// 💡 Linter と TypeScript のチェックを無効化
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

import React from 'react';
import Link from 'next/link';

/**
 * ✅ 共通コンポーネントと共通APIのインポート
 * 物理パス: shared/layout/Sidebar/index.tsx (または SidebarWrapper)
 * 物理パス: shared/lib/api.ts
 */
import Sidebar from '@shared/layout/Sidebar';
import { fetchPostList } from '@shared/lib/api'; 

// 💡 Next.js 15 用の動的レンダリング設定
export const dynamic = 'force-dynamic'; 
export const revalidate = 0;

/**
 * ユーティリティ: HTMLエンティティのデコード
 */
const decodeHtml = (html: string) => {
    if (!html) return '';
    const map: { [key: string]: string } = { 
        '&nbsp;': ' ', '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>' 
    };
    return html.replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec)).replace(/&[a-z]+;/gi, (m) => map[m] || m);
};

/**
 * ユーティリティ: 日付フォーマット
 */
const formatDate = (dateString: string) => {
    try {
        if (!dateString) return '----/--/--';
        return new Date(dateString).toLocaleDateString('ja-JP', { 
            year: 'numeric', month: '2-digit', day: '2-digit' 
        });
    } catch (e) {
        return '----/--/--';
    }
};

/**
 * 🏠 BICSTATION メインページ (Server Component)
 */
export default async function Page() {
    // サイトタイトルを環境変数から取得
    const title = process.env.NEXT_PUBLIC_APP_TITLE || 'ビック的節約生活';

    /**
     * ✅ 共通APIを使用して WordPress (Django経由等) から記事を取得
     */
    let posts = [];
    try {
        // 'saving' カテゴリの記事を 10件 取得
        const response = await fetchPostList('saving', 10);
        posts = response?.results || [];
    } catch (error) {
        console.error("[BICSTATION] API fetch failed:", error);
        posts = []; 
    }

    return (
        <div style={{ display: 'flex', flexGrow: 1, backgroundColor: '#f4f4f4', width: '100%', minHeight: '100vh' }}> 
            
            {/* ✅ 1. 共通サイドバー */}
            <Sidebar />
            
            {/* ✅ 2. メインコンテンツエリア */}
            <main style={{ flexGrow: 1, padding: '20px', minWidth: 0 }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <header style={{ marginBottom: '30px' }}>
                        <h2 style={{ 
                            color: '#333', 
                            borderLeft: '5px solid #ffcc00', 
                            padding: '5px 15px',
                            marginTop: 0,
                            fontSize: '1.5rem',
                            fontWeight: 'bold'
                        }}>
                            {title} 最新記事
                        </h2>
                    </header>
                    
                    {/* 記事グリッド表示 */}
                    {!posts || posts.length === 0 ? (
                        <div style={{ 
                            padding: '60px 20px', 
                            textAlign: 'center', 
                            background: 'white', 
                            borderRadius: '12px', 
                            border: '1px solid #eee' 
                        }}>
                            <p style={{ color: '#666', fontSize: '1.1rem' }}>現在、新しい記事を準備中です。</p>
                            <p style={{ color: '#999', fontSize: '0.85rem', marginTop: '10px' }}>
                                しばらくしてから再度アクセスしてください。
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                            {posts.map((post) => (
                                <article key={post.id} style={{ 
                                    padding: '0', 
                                    background: 'white', 
                                    border: '1px solid #eee', 
                                    borderRadius: '12px', 
                                    overflow: 'hidden',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                                    transition: 'transform 0.2s, box-shadow 0.2s'
                                }} className="hover-card">
                                    <div style={{ padding: '20px', flexGrow: 1 }}>
                                        <Link href={`/saving/${post.slug}`} style={{ textDecoration: 'none' }}>
                                            <h3 style={{ 
                                                color: '#222', 
                                                fontSize: '1.15rem', 
                                                fontWeight: 'bold',
                                                lineHeight: '1.5',
                                                margin: '0 0 12px 0'
                                            }}>
                                                {decodeHtml(post?.title?.rendered || '無題の記事')}
                                            </h3>
                                        </Link>
                                        <div style={{ color: '#888', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span>📅</span>
                                            <time dateTime={post.date}>{formatDate(post.date)}</time>
                                        </div>
                                    </div>
                                    <Link href={`/saving/${post.slug}`} style={{ 
                                        display: 'block',
                                        padding: '12px',
                                        textAlign: 'center',
                                        background: '#f9f9f9',
                                        color: '#555',
                                        fontSize: '0.85rem',
                                        fontWeight: 'bold',
                                        borderTop: '1px solid #eee',
                                        textDecoration: 'none'
                                    }}>
                                        記事を読む →
                                    </Link>
                                </article>
                            ))}
                        </div>
                    )}
                </div>

                <footer style={{ marginTop: '40px', fontSize: '11px', color: '#bbb', textAlign: 'center' }}>
                    BICSTATION Node-Container-V3 / Next.js 15
                </footer>
            </main>
        </div>
    );
}
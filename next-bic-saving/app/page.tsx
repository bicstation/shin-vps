// 💡 Linter と TypeScript のチェックを無効化
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

import React from 'react';
import Link from 'next/link';

// ✅ 共通コンポーネントと共通APIのインポート
import Sidebar from '@shared/components/layout/Sidebar';
import { fetchPostList } from '@shared/components/lib/api'; 

// 💡 ビルド時の静的生成エラーを回避するための設定
export const dynamic = 'force-dynamic'; 
export const fetchCache = 'force-no-store';

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
 * Next.js Server Component: メインページ
 * レイアウト（Header/Footer）は RootLayout に任せ、
 * このページ独自の構成（Sidebar + Main）を構築します。
 */
export default async function Page() {
    const title = process.env.NEXT_PUBLIC_APP_TITLE || 'ビック的な節約生活';

    /**
     * ✅ 共通APIを使用して記事を取得
     * shared/api.ts の fetchPostList('postType', limit) を利用
     */
    let posts = [];
    try {
        const response = await fetchPostList('saving', 5);
        if (response && response.results && Array.isArray(response.results)) {
            posts = response.results;
        }
    } catch (error) {
        console.warn("[Build Warning] API fetch failed. Using empty list for prerender.");
        posts = []; 
    }

    return (
        <div style={{ display: 'flex', flexGrow: 1, backgroundColor: '#f4f4f4', width: '100%' }}> 
            
            {/* ✅ 1. サイドバー（内容によって中身を変えたい場合は、ここを専用コンポーネントに差し替える） */}
            <Sidebar />
            
            {/* ✅ 2. メインコンテンツエリア */}
            <main style={{ flexGrow: 1, padding: '20px', minWidth: 0 }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <h2 style={{ 
                        color: '#ffcc00', 
                        borderBottom: '2px solid #ddd', 
                        paddingBottom: '10px',
                        marginTop: 0,
                        fontSize: '1.5rem'
                    }}>
                        {title} 最新記事一覧
                    </h2>
                    
                    {/* 記事リストまたはエラー表示 */}
                    {posts.length === 0 ? (
                        <div style={{ 
                            padding: '40px', 
                            textAlign: 'center', 
                            background: 'white', 
                            borderRadius: '8px', 
                            border: '1px dashed #ccc' 
                        }}>
                            <p style={{ color: '#666', fontWeight: 'bold' }}>現在、表示できる記事はありません。</p>
                            <p style={{ color: '#999', fontSize: '0.85em' }}>
                                記事が公開されているか、またはWordPressの接続設定を確認してください。
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '15px' }}>
                            {posts.map((post) => (
                                <article key={post.id} style={{ 
                                    padding: '20px', 
                                    background: 'white', 
                                    border: '1px solid #ddd', 
                                    borderRadius: '8px', 
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                    transition: 'transform 0.2s'
                                }}>
                                    <Link href={`/saving/${post.slug}`} style={{ 
                                        textDecoration: 'none', 
                                        color: '#007bff', 
                                        fontSize: '1.2rem', 
                                        fontWeight: 'bold',
                                        display: 'block'
                                    }}>
                                        {decodeHtml(post?.title?.rendered || '無題の記事')}
                                    </Link>
                                    <div style={{ color: '#888', fontSize: '0.85rem', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <span>📅</span>
                                        <time dateTime={post.date}>{formatDate(post.date)}</time>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
                <div>新しいページです。テスト</div>
            </main>
        </div>
    );
}
// ファイル名: C:\dev\SHIN-VPS\next-bicstation\app\page.tsx

// 💡 Linter と TypeScript のチェックを無効化 (赤線対策)
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/no-danger-to-js */
// @ts-nocheck 

import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

// 💡 WordPress APIから取得する記事データの型定義 (簡略化)
interface WpPost {
    id: number;
    slug: string; // 記事のパーマリンクに使用されるスラッグ
    title: {
        rendered: string; // HTMLタグを含むタイトル
    };
    date: string; // 記事の公開日時
    link: string; // 記事へのWordPress上のURL
}

// 💡 データを取得するサーバー関数 (記事一覧向け)
async function fetchPostList(): Promise<WpPost[]> {
    // 🚨 修正点1: カスタム投稿タイプ 'bicstation_post' を指定
    const WP_API_URL = `http://nginx-wp-v2/wp-json/wp/v2/bicstation_post?_embed&per_page=5`; // 最新5件を取得

    try {
        const res = await fetch(WP_API_URL, {
            // 🚨 修正点2: Hostヘッダーを「Bicstation」のドメインに設定
            headers: {
                'Host': 'stg.blog.bicstation.com' 
            },
            // リバリデートを長めに設定 (例: 3600秒 = 1時間)
            next: { revalidate: 3600 } 
        });

        if (!res.ok) {
            console.error(`WordPress API Error: ${res.status} ${res.statusText}`);
            return [];
        }
        
        // WordPressがJSON配列を返すことを期待
        const data: WpPost[] = await res.json();
        return data;

    } catch (error) {
        console.error("Failed to fetch post list from WordPress API:", error);
        return []; 
    }
}

// ユーティリティ関数: HTMLエンティティをデコード
const decodeHtml = (html: string) => {
    const map: { [key: string]: string } = { '&nbsp;': ' ', '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>' };
    return html.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec)).replace(/&[a-z]+;/gi, (match) => map[match] || match);
};

// ユーティリティ関数: 日付フォーマット (例: 2025/12/16)
const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).replace(/\//g, '/');
};

// 💡 Bicstationのブランドカラー (元のコードの #007bff を使用)
const SITE_COLOR = '#007bff'; 


// Next.js Server Component (async function)
export default async function Page() {
    
    const title = process.env.NEXT_PUBLIC_APP_TITLE || 'Bicstation デモタイトル';
    const posts = await fetchPostList(); // 記事一覧を取得

    return (
        <div style={{ fontFamily: 'Arial, sans-serif', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f4f4f4' }}>
            
            {/* 1. トップ (ヘッダー) */}
            <header style={{ background: '#333', color: 'white', padding: '15px 20px', borderBottom: `3px solid ${SITE_COLOR}` }}>
                <h1 style={{ margin: 0, fontSize: '1.5em' }}>{title}</h1>
                <p style={{ margin: '5px 0 0 0', fontSize: '0.9em' }}>App Router (RSC) によるレンダリング</p>
            </header>

            {/* 2. メインコンテンツとサイドバーのコンテナ */}
            <div style={{ display: 'flex', flexGrow: 1 }}>
                
                {/* 3. サイドバー */}
                <aside style={{ width: '200px', background: '#e0e0e0', padding: '20px', borderRight: '1px solid #ccc' }}>
                    <h3 style={{ marginTop: 0, color: SITE_COLOR }}>カテゴリ</h3>
                    <ul style={{ listStyleType: 'none', padding: 0 }}>
                        <li><a href="/" style={{ textDecoration: 'none', color: '#333' }}>メインへ戻る</a></li>
                        <li style={{ marginTop: '10px', fontSize: '0.8em', color: '#666' }}>（App Routerデモ）</li>
                    </ul>
                </aside>

                {/* 4. メインエリア - 記事一覧 */}
                <main style={{ flexGrow: 1, padding: '20px' }}>
                    <h2 style={{ color: SITE_COLOR, borderBottom: '2px solid #ddd', paddingBottom: '10px' }}>最新記事一覧</h2>
                    
                    {posts.length === 0 ? (
                        <p style={{ color: '#666' }}>現在、**Bicstation**の記事は登録されていません。</p>
                    ) : (
                        <ul style={{ listStyleType: 'none', padding: 0 }}>
                            {posts.map((post) => (
                                <li key={post.id} style={{ marginBottom: '15px', padding: '10px', background: 'white', border: '1px solid #ddd', borderRadius: '5px' }}>
                                    {/* 記事詳細ページへのリンク */}
                                    {/* 🚨 リンク先URLをカスタム投稿タイプのパス構造に合わせる */}
                                    <Link href={`/bicstation/${post.slug}`} style={{ textDecoration: 'none', color: SITE_COLOR, fontSize: '1.2em', fontWeight: 'bold' }}>
                                        {decodeHtml(post.title.rendered)}
                                    </Link>
                                    <p style={{ color: '#999', fontSize: '0.9em', margin: '5px 0 0 0' }}>
                                        公開日: {formatDate(post.date)} | スラッグ: {post.slug}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    )}
                    
                </main>
            </div>

            {/* 5. フッター */}
            <footer style={{ background: '#333', color: 'white', padding: '10px 20px', textAlign: 'center', borderTop: `3px solid ${SITE_COLOR}` }}>
                <p style={{ margin: 0 }}>&copy; {new Date().getFullYear()} {title} | フッター情報</p>
            </footer>
        </div>
    );
};
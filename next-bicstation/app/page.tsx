// ファイル名: C:\dev\SHIN-VPS\next-bicstation\app\page.tsx

// 💡 Linter と TypeScript のチェックを無効化 (赤線対策)
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/no-danger-to-js */
// @ts-nocheck 

import React from 'react';
import Link from 'next/link';

// 💡 WordPress APIから取得する記事データの型定義
interface WpPost {
    id: number;
    slug: string;
    title: {
        rendered: string;
    };
    date: string;
    link: string;
}

// 💡 データを取得するサーバー関数
async function fetchPostList(): Promise<WpPost[]> {
    // 🚨 修正点1: 先ほど疎通確認した 'bicstation' エンドポイントを指定
    const WP_API_URL = `http://nginx-wp-v2/wp-json/wp/v2/bicstation?_embed&per_page=5`;

    try {
        const res = await fetch(WP_API_URL, {
            // 🚨 修正点2: WordPressコンテナが認識する実際のホスト名を指定
            headers: {
                'Host': 'stg.blog.tiper.live' 
            },
            // 開発中は revalidate: 0 (キャッシュなし) にすると更新がすぐ反映されます
            next: { revalidate: 60 } 
        });

        if (!res.ok) {
            console.error(`WordPress API Error: ${res.status} ${res.statusText}`);
            return [];
        }
        
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

// ユーティリティ関数: 日付フォーマット
const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
};

const SITE_COLOR = '#007bff'; 

export default async function Page() {
    
    const title = process.env.NEXT_PUBLIC_APP_TITLE || 'Bicstation デモタイトル';
    const posts = await fetchPostList(); 

    return (
        <div style={{ fontFamily: 'Arial, sans-serif', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f4f4f4' }}>
            
            {/* 1. ヘッダー */}
            <header style={{ background: '#333', color: 'white', padding: '15px 20px', borderBottom: `3px solid ${SITE_COLOR}` }}>
                <h1 style={{ margin: 0, fontSize: '1.5em' }}>{title}</h1>
                <p style={{ margin: '5px 0 0 0', fontSize: '0.9em' }}>WordPress REST API 連携済み</p>
            </header>

            <div style={{ display: 'flex', flexGrow: 1 }}>
                
                {/* 2. サイドバー */}
                <aside style={{ width: '200px', background: '#e0e0e0', padding: '20px', borderRight: '1px solid #ccc' }}>
                    <h3 style={{ marginTop: 0, color: SITE_COLOR }}>メニュー</h3>
                    <ul style={{ listStyleType: 'none', padding: 0 }}>
                        <li><a href="/" style={{ textDecoration: 'none', color: '#333' }}>ホーム</a></li>
                        <li style={{ marginTop: '10px', fontSize: '0.8em', color: '#666' }}>（Custom Post Type: bicstation）</li>
                    </ul>
                </aside>

                {/* 3. メインエリア */}
                <main style={{ flexGrow: 1, padding: '20px' }}>
                    <h2 style={{ color: SITE_COLOR, borderBottom: '2px solid #ddd', paddingBottom: '10px' }}>最新のお知らせ</h2>
                    
                    {posts.length === 0 ? (
                        <p style={{ color: '#666' }}>現在、表示できる記事はありません。WordPress管理画面から投稿を確認してください。</p>
                    ) : (
                        <ul style={{ listStyleType: 'none', padding: 0 }}>
                            {posts.map((post) => (
                                <li key={post.id} style={{ marginBottom: '15px', padding: '15px', background: 'white', border: '1px solid #ddd', borderRadius: '5px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                    <Link href={`/bicstation/${post.slug}`} style={{ textDecoration: 'none', color: SITE_COLOR, fontSize: '1.2em', fontWeight: 'bold' }}>
                                        {decodeHtml(post.title.rendered)}
                                    </Link>
                                    <p style={{ color: '#999', fontSize: '0.85em', margin: '8px 0 0 0' }}>
                                        公開日: {formatDate(post.date)}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    )}
                </main>
            </div>

            {/* 4. フッター */}
            <footer style={{ background: '#333', color: 'white', padding: '10px 20px', textAlign: 'center', borderTop: `3px solid ${SITE_COLOR}` }}>
                <p style={{ margin: 0 }}>&copy; {new Date().getFullYear()} {title}</p>
            </footer>
        </div>
    );
};
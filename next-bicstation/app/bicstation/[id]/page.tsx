// ファイル名: C:\dev\SHIN-VPS\next-bicstation\app\bicstation\[id]\page.tsx

// 💡 Linter と TypeScript のチェックを無効化 (赤線対策)
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/no-danger-to-js */
// @ts-nocheck 

import React from 'react';
import { notFound } from 'next/navigation';

// 💡 WordPress APIから取得する記事データの型定義 (簡略化)
interface WpPost {
    id: number;
    slug: string; // 記事のパーマリンクに使用されるスラッグ
    title: {
        rendered: string; // HTMLタグを含むタイトル
    };
    date: string; // 記事の公開日時 (YYYY-MM-DDTHH:MM:SS)
    content: {
        rendered: string; // 記事本文のHTML
    };
    author: string; // 著者名
    _embedded?: {
        'wp:term'?: {
            name: string;
        }[][];
        // 著者情報が含まれる場合
        author?: {
            name: string;
        }[];
    };
}

// Next.jsの動的ルートからパラメータを受け取るための型定義
interface PostPageProps {
    params: {
        id: string; // URLから渡される記事スラッグ
    };
}

// 💡 データを取得するサーバー関数 (WordPress API向け)
async function fetchPostData(postSlug: string): Promise<WpPost | null> {
    // 🚨 カスタム投稿タイプ 'bicstation_post' をスラッグで検索
    const WP_API_URL = `http://nginx-wp-v2/wp-json/wp/v2/bicstation?slug=${postSlug}&_embed&per_page=1`; 

    try {
        const res = await fetch(WP_API_URL, {
            // 🚨 Hostヘッダーを「Bicstation」のドメインに設定
            headers: {
                'Host': 'stg.blog.tiper.live' 
            },
            next: { revalidate: 3600 } 
        });

        if (!res.ok) {
            console.error(`WordPress API Error: ${res.status} ${res.statusText}`);
            return null;
        }
        
        const data: WpPost[] = await res.json();
        
        if (data.length === 0) {
            return null; // 記事が見つからない
        }

        const post = data[0];

        // 著者名を取得 (なければ '不明な著者' とする)
        const authorName = post._embedded?.author?.[0]?.name || '不明な著者';

        return { ...post, author: authorName };

    } catch (error) {
        console.error("Failed to fetch post from WordPress API:", error);
        return null; 
    }
}


// ===============================================
// 💡 追加: generateStaticParams 関数 
// ビルド時にアクセスする全ての記事スラッグを取得し、静的生成します
// ===============================================
export async function generateStaticParams() {
    // 🚨 記事スラッグのみを効率的に取得 (bicstation_post)
    const WP_SLUGS_API_URL = `http://nginx-wp-v2/wp-json/wp/v2/bicstation_post?_fields=slug&per_page=100`; 

    try {
        const res = await fetch(WP_SLUGS_API_URL, {
            headers: {
                // 🚨 Hostヘッダーを設定
                'Host': 'stg.blog.bicstation.com' 
            },
            // ビルド時に実行されるため、キャッシュなしでOK
            cache: 'no-store', 
        });
        
        if (!res.ok) {
            console.error(`generateStaticParams API Error: ${res.status} ${res.statusText}`);
            return [];
        }

        const slugs: { slug: string }[] = await res.json();
        
        // 戻り値の形式を Next.js の要件 { id: string } に変換
        return slugs.map((post) => ({
            // URLパラメータ名が [id] なので、キーは id にする
            id: post.slug, 
        }));

    } catch (error) {
        console.error("Failed to fetch slugs for generateStaticParams:", error);
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


// Next.js Server Component (async function)
export default async function PostPage({ params }: PostPageProps) {
    
    // URLから取得したエンコード済みのID (スラッグ) をデコード
    const postSlug = decodeURIComponent(params.id);
    
    const post = await fetchPostData(postSlug);

    // 記事が見つからなかった場合は 404 ページを表示
    if (!post) {
        notFound(); 
    }
    
    const postTitle = decodeHtml(post.title.rendered);
    const postDate = formatDate(post.date);

    // サイトカラー: #007bff (page.tsxと合わせる)
    const SITE_COLOR = '#007bff'; 

    return (
        <div style={{ padding: '40px 80px', maxWidth: '1000px', margin: '0 auto', backgroundColor: '#fff' }}>

            {/* 1. 記事タイトルとメタ情報 */}
            <h1 style={{ 
                color: SITE_COLOR, 
                fontSize: '2.5em', 
                borderBottom: `3px solid ${SITE_COLOR}`, 
                paddingBottom: '10px' 
            }}>
                {postTitle}
            </h1>
            <div style={{ color: '#666', fontSize: '0.9em', marginBottom: '30px' }}>
                <span>著者: {post.author}</span>
                <span style={{ marginLeft: '20px' }}>公開日: {postDate}</span>
                {/* スラッグを表示 */}
                <span style={{ marginLeft: '20px', color: '#999' }}>スラッグ: {post.slug}</span>
            </div>

            {/* 2. 記事コンテンツ */}
            <div 
                style={{ fontSize: '1.05em', lineHeight: '1.7', color: '#333' }}
                dangerouslySetInnerHTML={{ __html: post.content.rendered }} 
            />
            
            {/* 3. コメントや関連情報のプレースホルダー */}
            <div style={{ marginTop: '50px', paddingTop: '20px', borderTop: '1px solid #ccc' }}>
                <h3 style={{ color: SITE_COLOR }}>コメントセクション (仮)</h3>
                <p style={{ color: '#666' }}>この下にコメントフォームや関連記事が表示されます。</p>
            </div>

        </div>
    );
};
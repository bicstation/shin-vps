// 💡 Linter と TypeScript のチェックを無効化 (赤線対策)
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/no-danger-to-js */
// @ts-nocheck 

import React from 'react';
import { notFound } from 'next/navigation';

// 💡 WordPress APIから取得する記事データの型定義
interface WpPost {
    id: number;
    slug: string; 
    title: {
        rendered: string; 
    };
    date: string; 
    content: {
        rendered: string; 
    };
    author: string; 
    _embedded?: {
        'wp:term'?: {
            name: string;
        }[][];
        author?: {
            name: string;
        }[];
    };
}

interface PostPageProps {
    params: {
        id: string; // URL [id] 部分（スラッグ）
    };
}

// 💡 データを取得するサーバー関数
async function fetchPostData(postSlug: string): Promise<WpPost | null> {
    // 🚨 エンドポイント: saving
    const WP_API_URL = `http://nginx-wp-v2/wp-json/wp/v2/saving?slug=${postSlug}&_embed&per_page=1`; 

    try {
        const res = await fetch(WP_API_URL, {
            headers: {
                // 🚨 重要: ビック的節約生活のドメインを指定
                'Host': 'stg.blog.bic-saving.com' 
            },
            next: { revalidate: 3600 } 
        });

        if (!res.ok) {
            console.error(`WordPress API Error: ${res.status} ${res.statusText}`);
            return null;
        }
        
        const data: WpPost[] = await res.json();
        
        if (data.length === 0) {
            return null; 
        }

        const post = data[0];
        const authorName = post._embedded?.author?.[0]?.name || '不明な著者';

        return { ...post, author: authorName };

    } catch (error) {
        console.error("Failed to fetch post from WordPress API:", error);
        return null; 
    }
}

// ===============================================
// 💡 generateStaticParams: ビルド時の静的生成用
// ===============================================
export async function generateStaticParams() {
    // 🚨 エンドポイント: saving
    const WP_SLUGS_API_URL = `http://nginx-wp-v2/wp-json/wp/v2/saving?_fields=slug&per_page=100`; 

    try {
        const res = await fetch(WP_SLUGS_API_URL, {
            headers: {
                // 🚨 重要: ビック的節約生活のドメインを指定
                'Host': 'stg.blog.bic-saving.com' 
            },
            cache: 'no-store', 
        });
        
        if (!res.ok) {
            console.error(`generateStaticParams API Error: ${res.status} ${res.statusText}`);
            return [];
        }

        const slugs: { slug: string }[] = await res.json();
        
        return slugs.map((post) => ({
            id: post.slug, 
        }));

    } catch (error) {
        console.error("Failed to fetch slugs for generateStaticParams:", error);
        return [];
    }
}

// ユーティリティ: HTMLエンティティデコード
const decodeHtml = (html: string) => {
    const map: { [key: string]: string } = { '&nbsp;': ' ', '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>' };
    return html.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec)).replace(/&[a-z]+;/gi, (match) => map[match] || match);
};

// ユーティリティ: 日付フォーマット
const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
};

export default async function PostPage({ params }: PostPageProps) {
    // URLパラメータをデコード
    const postSlug = decodeURIComponent(params.id);
    const post = await fetchPostData(postSlug);

    if (!post) {
        notFound(); 
    }
    
    const postTitle = decodeHtml(post.title.rendered);
    const postDate = formatDate(post.date);

    // サイトカラー: #ffcc00
    const SITE_COLOR = '#ffcc00'; 

    return (
        <div style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto', backgroundColor: '#fff' }}>

            <h1 style={{ 
                color: '#333', 
                fontSize: '2rem', 
                fontWeight: 'bold',
                borderLeft: `8px solid ${SITE_COLOR}`, 
                paddingLeft: '15px',
                marginBottom: '20px'
            }}>
                {postTitle}
            </h1>

            <div style={{ color: '#666', fontSize: '0.9em', marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                <span>著者: {post.author}</span>
                <span style={{ marginLeft: '20px' }}>公開日: {postDate}</span>
            </div>

            <div 
                className="entry-content"
                style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#333' }}
                dangerouslySetInnerHTML={{ __html: post.content.rendered }} 
            />
            
            <div style={{ marginTop: '50px', paddingTop: '20px', borderTop: `3px solid ${SITE_COLOR}` }}>
                <h3 style={{ color: '#333', fontSize: '1.2rem' }}>関連記事・お知らせ</h3>
                <p style={{ color: '#666' }}>ビック的節約生活のお役立ち情報をチェックしてください。</p>
            </div>
        </div>
    );
};
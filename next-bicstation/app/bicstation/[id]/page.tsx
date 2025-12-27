/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/no-danger-to-js */
// @ts-nocheck 

import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';

// --- 型定義 ---
interface WpPost {
    id: number;
    slug: string;
    title: { rendered: string };
    date: string;
    content: { rendered: string };
    author_name: string;
}

const SITE_COLOR = '#007bff';

// --- データ取得関数 ---
async function fetchPostData(postSlug: string): Promise<WpPost | null> {
    // カスタム投稿タイプ 'posts' (または 'bicstation') を想定
    const WP_API_URL = `http://nginx-wp-v2/wp-json/wp/v2/posts?slug=${postSlug}&_embed&per_page=1`; 

    try {
        const res = await fetch(WP_API_URL, {
            headers: { 'Host': 'stg.blog.tiper.live' },
            next: { revalidate: 3600 } 
        });

        if (!res.ok) return null;
        
        const data = await res.json();
        if (data.length === 0) return null;

        const post = data[0];
        return {
            ...post,
            author_name: post._embedded?.author?.[0]?.name || 'BICSTATION 編集部'
        };
    } catch (error) {
        return null; 
    }
}

/**
 * 💡 SEO対策: 記事タイトルをメタデータに反映
 */
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    const post = await fetchPostData(decodeURIComponent(params.id));
    if (!post) return { title: "記事が見つかりません" };

    return {
        title: decodeHtml(post.title.rendered),
        description: post.content.rendered.replace(/<[^>]*>/g, '').substring(0, 120) + '...',
    };
}

// ユーティリティ
const decodeHtml = (html: string) => {
    if (!html) return '';
    return html.replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
               .replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
        year: 'numeric', month: '2-digit', day: '2-digit'
    });
};

/**
 * ブログ記事詳細ページ
 */
export default async function PostPage({ params }: { params: { id: string } }) {
    const postSlug = decodeURIComponent(params.id);
    const post = await fetchPostData(postSlug);

    if (!post) notFound(); 
    
    return (
        <article style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
            {/* 記事ヘッダーエリア */}
            <header style={{ 
                background: '#f8f9fa', 
                padding: '60px 20px', 
                borderBottom: '1px solid #eee',
                textAlign: 'center' 
            }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <div style={{ color: SITE_COLOR, fontWeight: 'bold', marginBottom: '15px', fontSize: '0.9em' }}>
                        NEWS & COLUMN
                    </div>
                    <h1 style={{ 
                        fontSize: '2.2em', 
                        lineHeight: '1.4', 
                        color: '#222', 
                        margin: '0 0 20px 0',
                        fontWeight: '800'
                    }}>
                        {decodeHtml(post.title.rendered)}
                    </h1>
                    <div style={{ color: '#888', fontSize: '0.9em', display: 'flex', justifyContent: 'center', gap: '20px' }}>
                        <span>👤 {post.author_name}</span>
                        <span>📅 {formatDate(post.date)}</span>
                    </div>
                </div>
            </header>

            {/* 記事本文エリア */}
            <div style={{ 
                padding: '60px 20px', 
                maxWidth: '800px', 
                margin: '0 auto',
                lineHeight: '1.8',
                fontSize: '1.1em',
                color: '#333'
            }}>
                {/* 💡 WordPressからのHTMLをレンダリング 
                    実際の運用では、globals.css に .wp-content p { ... } のような
                    スタイルを定義しておくと綺麗になります。
                */}
                <div 
                    className="wp-content"
                    dangerouslySetInnerHTML={{ __html: post.content.rendered }} 
                />
                
                {/* 戻るボタン */}
                <div style={{ marginTop: '60px', textAlign: 'center' }}>
                    <Link href="/bicstation" style={{ 
                        display: 'inline-block',
                        padding: '12px 30px',
                        border: `2px solid ${SITE_COLOR}`,
                        color: SITE_COLOR,
                        textDecoration: 'none',
                        borderRadius: '30px',
                        fontWeight: 'bold',
                        transition: '0.2s'
                    }}>
                        ← 記事一覧に戻る
                    </Link>
                </div>
            </div>
        </article>
    );
};
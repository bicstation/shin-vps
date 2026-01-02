/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */

import { notFound } from 'next/navigation';
import { PostHeader } from '@/components/blog/PostHeader';
import { PostSidebar } from '@/components/blog/PostSidebar';
import { COLORS } from '@/constants';
import { fetchPostData } from '@/lib/api'; // ✅ APIをインポート
import styles from './PostPage.module.css';

// --- ユーティリティ ---

/**
 * HTMLデコード用
 */
const decodeHtml = (html: string) => {
    if (!html) return '';
    const map: { [key: string]: string } = { 
        '&nbsp;': ' ', '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>' 
    };
    return html.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(parseInt(dec, 10)))
               .replace(/&[a-z]+;/gi, (match) => map[match] || map[match.toLowerCase()] || match);
};

/**
 * 日付フォーマット用
 */
const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
};

/**
 * 目次生成ロジック
 */
function getTableOfContents(content: string) {
    const h2Matches = content.match(/<h2[^>]*>(.*?)<\/h2>/g) || [];
    return h2Matches.map(tag => tag.replace(/<[^>]*>/g, ''));
}

// --- メインのコンポーネント ---

export default async function PostPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    
    // ✅ lib/api.ts からデータを取得
    const post = await fetchPostData(decodeURIComponent(params.id));
    
    if (!post) notFound();

    // 目次の生成
    const toc = getTableOfContents(post.content.rendered);

    return (
        <article className={styles.article} style={{ backgroundColor: COLORS.BACKGROUND }}>
            
            {/* 記事ヘッダー（タイトル・カテゴリ・投稿日） */}
            <PostHeader 
                post={post} 
                decodeHtml={decodeHtml} 
                formatDate={formatDate} 
                SITE_COLOR={COLORS.SITE_COLOR} 
            />
            
            <div className={styles.container}>
                {/* メインコンテンツ（本文） */}
                <main className={styles.mainContent}>
                    <div 
                        className={`${styles.wpContent} animate-in`} 
                        dangerouslySetInnerHTML={{ __html: post.content.rendered }} 
                    />
                </main>
                
                {/* サイドバー（目次・バナー等） */}
                <aside className={styles.sidebarWrapper}>
                    <PostSidebar 
                        toc={toc} 
                        SITE_COLOR={COLORS.SITE_COLOR} 
                        ACCENT_COLOR={COLORS.ACCENT_COLOR} 
                    />
                </aside>
            </div>
        </article>
    );
}
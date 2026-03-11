// /home/maya/dev/shin-vps/next-bicstation/app/news/[id]/page.tsx

import React from 'react';
import { notFound } from 'next/navigation';
import { fetchPostData } from '@/shared/lib/api';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';

/**
 * 💡 AI 生成の独自タグを HTML の装飾コンポーネントに変換する
 */
const renderAiContent = (text: string) => {
    if (!text) return null;

    let content = text;
    // [SUMMARY_BOX] をリッチな注釈ボックスに変換
    content = content.replace(
        /\[SUMMARY_BOX\]([\s\S]*?)\[\/SUMMARY_BOX\]/g,
        '<div class="my-8 p-6 bg-pink-50 border-l-4 border-pink-500 rounded-r-xl shadow-sm"><strong class="text-pink-600 block mb-2">✨ 今回の作品の見どころ</strong><div class="text-gray-700 italic">$1</div></div>'
    );
    // その他のシステムタグを消去して整理
    content = content
        .replace(/\[TITLE_GENERAL\][\s\S]*?\[\/TITLE_GENERAL\]/g, '') // タイトル重複防止
        .replace(/\[CONTENT_GENERAL\]/g, '<div class="mt-8">')
        .replace(/\[\/CONTENT_GENERAL\]/g, '</div>')
        .replace(/\[CAT\].*?\[\/CAT\]/g, '')
        .replace(/\[TAG\].*?\[\/TAG\]/g, '');

    return (
        <div 
            className="ai-custom-content prose prose-pink max-w-none"
            dangerouslySetInnerHTML={{ __html: content }} 
        />
    );
};

export default async function NewsDetailPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const post = await fetchPostData('post', id);

    if (!post) notFound();

    // 画像と日付のフォールバック処理
    const displayImage = post.image || post.main_image_url;
    const displayDate = post.date || (post.created_at ? new Date(post.created_at).toLocaleDateString('ja-JP') : '');
    const isAiGenerated = post.body_text?.includes('[CONTENT_GENERAL]');

    return (
        <article className="max-w-4xl mx-auto px-4 py-12">
            {/* ナビゲーション */}
            <nav className="mb-12">
                <Link href="/news" className="group text-sm font-bold text-gray-400 hover:text-pink-600 transition-colors flex items-center gap-2">
                    <span className="group-hover:-translate-x-1 transition-transform">←</span> 
                    BACK TO FEED
                </Link>
            </nav>

            <header className="mb-12 text-center">
                {(post.category || post.site_display) && (
                    <span className="inline-block bg-gray-900 text-white text-[10px] font-black px-3 py-1 rounded-full mb-6 uppercase tracking-[0.2em]">
                        {post.category || post.site_display?.replace('bicstation_', '')}
                    </span>
                )}
                <h1 className="text-4xl md:text-6xl font-black text-gray-900 leading-[1.1] mb-8 tracking-tighter">
                    {post.title}
                </h1>
                <div className="flex items-center justify-center gap-4 text-sm font-bold text-gray-400">
                    <time>{displayDate}</time>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span>BY SHIN-VPS EDITOR</span>
                </div>
            </header>

            {/* アイキャッチ画像 */}
            {displayImage && (
                <div className="mb-16 rounded-[2rem] overflow-hidden shadow-2xl shadow-pink-100 rotate-[-1deg]">
                    <img 
                        src={displayImage} 
                        alt={post.title} 
                        className="w-full h-auto object-cover max-h-[600px] scale-[1.02]"
                    />
                </div>
            )}

            {/* 本文エリア */}
            <div className="px-2 md:px-6">
                {isAiGenerated ? (
                    // AI 生成記事 (Django) の場合
                    renderAiContent(post.body_text)
                ) : (
                    // Markdown 記事 (Local) の場合
                    <div className="prose prose-lg prose-blue max-w-none">
                        <ReactMarkdown>{post.body_text}</ReactMarkdown>
                    </div>
                )}
            </div>

            {/* フッター：著者・免責 */}
            <footer className="mt-20">
                <div className="bg-black text-white rounded-[2rem] p-10 md:p-16 relative overflow-hidden">
                    <div className="relative z-10">
                        <h4 className="text-2xl font-black mb-4 tracking-tighter">BICSTATION INTELLIGENCE</h4>
                        <p className="text-gray-400 leading-relaxed max-w-2xl">
                            この記事は SHIN-VPS の統合 AI ネットワークによって解析・生成、または編集部によって執筆されました。
                            最新のトレンドを独自の視点で切り取り、あなたのデジタルライフを刺激します。
                        </p>
                    </div>
                    {/* 装飾用背景文字 */}
                    <div className="absolute -bottom-10 -right-10 text-[12rem] font-black text-white/[0.03] pointer-events-none uppercase">
                        Shin
                    </div>
                </div>
            </footer>
        </article>
    );
}
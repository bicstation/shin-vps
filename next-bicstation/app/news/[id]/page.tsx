// /home/maya/dev/shin-vps/next-bicstation/app/news/[id]/page.tsx

import React from 'react';
import { notFound } from 'next/navigation';
import { fetchPostData } from '@/shared/lib/api';
import ReactMarkdown from 'react-markdown'; // 👈 npm install react-markdown が必要です
import Link from 'next/link';

/**
 * 📝 ニュース個別記事ページ
 * URL: /news/[id] (例: /news/test)
 */
export default async function NewsDetailPage({ params }: { params: { id: string } }) {
    const { id } = params;

    // 💡 django-bridge.ts の fetchPostData を呼び出し (MDファイルを優先取得)
    const post = await fetchPostData('post', id);

    // 記事が見つからない場合は 404
    if (!post) {
        notFound();
    }

    return (
        <article className="max-w-4xl mx-auto px-4 py-12">
            {/* 戻るリンク */}
            <div className="mb-8">
                <Link href="/news" className="text-sm text-blue-600 hover:underline flex items-center">
                    ← ニュース一覧に戻る
                </Link>
            </div>

            {/* ヘッダーエリア */}
            <header className="mb-10 text-center">
                {post.category && (
                    <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-widest">
                        {post.category}
                    </span>
                )}
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-6">
                    {post.title}
                </h1>
                <time className="text-gray-500 font-medium">
                    公開日: {post.date}
                </time>
            </header>

            {/* メインビジュアル (アイキャッチ) */}
            {post.image && (
                <div className="mb-12 rounded-2xl overflow-hidden shadow-xl">
                    <img 
                        src={post.image} 
                        alt={post.title} 
                        className="w-full h-auto object-cover max-h-[500px]"
                    />
                </div>
            )}

            {/* 記事本文 (Markdown 変換エリア) */}
            <div className="prose prose-lg prose-blue max-w-none px-2 md:px-0">
                <ReactMarkdown>
                    {post.body_text}
                </ReactMarkdown>
            </div>

            {/* フッターエリア */}
            <footer className="mt-16 pt-8 border-t border-gray-100">
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                    <h4 className="font-bold text-gray-800 mb-2">SHIN-VPS Intelligence</h4>
                    <p className="text-sm text-gray-600">
                        最新のテクノロジーと自作PCのトレンドを独自の視点で分析してお届けします。
                    </p>
                </div>
            </footer>
        </article>
    );
}
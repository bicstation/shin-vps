// /home/maya/dev/shin-vps/next-bicstation/app/news/page.tsx

import React from 'react';
import Link from 'next/link';
import { getSiteMainPosts } from '@/shared/lib/api';

/**
 * 💡 AIタグやMarkdown記号を除去してプレビュー用のテキストを生成するヘルパー
 */
const getCleanExcerpt = (post: any) => {
    // descriptionがあれば優先、なければbody_textから抜粋
    const text = post.description || post.body_text || "";
    return text
        .replace(/\[.*?\]/g, '')      // [TAG] 形式を削除
        .replace(/[#*`]/g, '')       // MD記号を削除
        .replace(/<.*?>/g, '')       // HTMLタグを削除
        .replace(/\n+/g, ' ')        // 改行をスペースに
        .trim()
        .substring(0, 120) + "...";
};

export default async function NewsListPage() {
    // Bridge経由で12件取得（MD優先、なければDjango API）
    const { results: posts, count } = await getSiteMainPosts('post', 12, 0);

    return (
        <main className="max-w-6xl mx-auto px-4 py-10">
            {/* ヘッダーセクション */}
            <div className="mb-12 border-b border-gray-100 pb-6 flex flex-col md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-gray-900 flex items-center gap-2">
                        Latest News
                        <span className="bg-pink-100 text-pink-600 text-xs px-2 py-1 rounded-md">LIVE</span>
                    </h1>
                    <p className="mt-3 text-gray-500 font-medium">
                        最新のレビューとガジェット情報を {count} 件配信中
                    </p>
                </div>
            </div>

            {/* 記事グリッド */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {posts.map((post: any) => {
                    // Django APIからの場合は image ではなく main_image_url を参照する場合があるためのフォールバック
                    const displayImage = post.image || post.main_image_url || '/images/common/no-image.jpg';
                    
                    return (
                        <article 
                            key={post.id} 
                            className="group flex flex-col bg-white rounded-2xl overflow-hidden hover:translate-y-[-4px] transition-all duration-300"
                        >
                            {/* 画像エリア */}
                            <div className="aspect-[16/10] relative overflow-hidden bg-gray-100 rounded-2xl shadow-sm">
                                <img
                                    src={displayImage}
                                    alt={post.title}
                                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                                />
                                {/* カテゴリバッジ */}
                                {(post.category || post.site_display) && (
                                    <div className="absolute top-4 left-4 flex gap-2">
                                        <span className="bg-white/90 backdrop-blur-md text-gray-900 text-[10px] font-black px-2.5 py-1 rounded-lg shadow-sm uppercase tracking-widest">
                                            {post.category || post.site_display.replace('bicstation_', '')}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* コンテンツエリア */}
                            <div className="pt-6 flex flex-col flex-grow">
                                <div className="flex items-center gap-2 mb-3">
                                    <time className="text-[11px] font-bold text-gray-400">
                                        {post.date || new Date(post.created_at).toLocaleDateString('ja-JP')}
                                    </time>
                                    <span className="h-px w-4 bg-gray-200"></span>
                                    <span className="text-[10px] text-pink-500 font-bold uppercase tracking-tighter">New Update</span>
                                </div>

                                <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 leading-tight group-hover:text-pink-600 transition-colors">
                                    <Link href={`/news/${post.id}`}>
                                        {post.title}
                                    </Link>
                                </h2>

                                <p className="text-sm text-gray-500 line-clamp-3 mb-6 leading-relaxed">
                                    {getCleanExcerpt(post)}
                                </p>
                                
                                <div className="mt-auto">
                                    <Link 
                                        href={`/news/${post.id}`}
                                        className="inline-flex items-center text-xs font-black text-gray-900 group-hover:gap-3 transition-all gap-2"
                                    >
                                        VIEW DETAILS
                                        <span className="w-8 h-px bg-gray-300 group-hover:w-12 group-hover:bg-pink-500 transition-all"></span>
                                    </Link>
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>

            {/* 記事がない場合 */}
            {posts.length === 0 && (
                <div className="text-center py-32 rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200">
                    <p className="text-gray-400 font-bold">FEEDS ARE EMPTY AT THE MOMENT.</p>
                </div>
            )}
        </main>
    );
}
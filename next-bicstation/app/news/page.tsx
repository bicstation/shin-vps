// /home/maya/dev/shin-vps/next-bicstation/app/news/page.tsx

import React from 'react';
import Link from 'next/link';
import { getSiteMainPosts } from '@/shared/lib/api';

/**
 * 📡 SHIN-VPS News Feed (Markdown & Django Hybrid)
 * このページは /content/posts フォルダの MD ファイルを優先的に表示します。
 */
export default async function NewsListPage() {
    // 💡 django-bridge.ts で定義した fetchPostList (Alias: getSiteMainPosts) を呼び出し
    const { results: posts, count } = await getSiteMainPosts('post', 12, 0);

    return (
        <main className="max-w-6xl mx-auto px-4 py-10">
            <div className="mb-10 border-b pb-5">
                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
                    Latest News
                </h1>
                <p className="mt-2 text-lg text-gray-500">
                    自作PC・ガジェットの最新情報を {count} 件配信中
                </p>
            </div>

            {/* 記事カードグリッド */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post: any) => (
                    <article 
                        key={post.id} 
                        className="group flex flex-col bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300"
                    >
                        {/* アイキャッチ画像 (MDの Frontmatter: image を使用) */}
                        <div className="aspect-video relative overflow-hidden rounded-t-xl bg-gray-100">
                            <img
                                src={post.image || '/images/common/no-image.jpg'}
                                alt={post.title}
                                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                            />
                            {post.category && (
                                <span className="absolute top-3 left-3 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase">
                                    {post.category}
                                </span>
                            )}
                        </div>

                        {/* テキストコンテンツ */}
                        <div className="p-5 flex flex-col flex-grow">
                            <time className="text-xs text-gray-400 mb-2">
                                {post.date}
                            </time>
                            <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                <Link href={`/news/${post.id}`}>
                                    {post.title}
                                </Link>
                            </h2>
                            <p className="text-sm text-gray-600 line-clamp-3 mb-6 flex-grow">
                                {post.description || post.body_text?.substring(0, 120).replace(/[#*`]/g, '')}
                            </p>
                            
                            <div className="mt-auto pt-4 border-t border-gray-50">
                                <Link 
                                    href={`/news/${post.id}`}
                                    className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800"
                                >
                                    詳しく読む
                                    <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    </article>
                ))}
            </div>

            {/* 記事がない場合の表示 */}
            {posts.length === 0 && (
                <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <p className="text-gray-400">まだニュース記事がありません。</p>
                </div>
            )}
        </main>
    );
}
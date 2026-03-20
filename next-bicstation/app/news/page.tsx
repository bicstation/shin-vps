/* /app/news/page.tsx (BICSTATION) */
import React from 'react';
import Link from 'next/link';
import { getSiteMainPosts } from '@/shared/lib/api';

interface PageProps {
    searchParams: Promise<{ page?: string }>;
}

/**
 * 💡 プレビュー用のテキストを生成するヘルパー（MarkdownやAIタグを除去）
 */
const getCleanExcerpt = (post: any) => {
    const text = post.description || post.body_text || "";
    return text
        .replace(/\[.*?\]/g, '')      // [TAG] 形式を削除
        .replace(/[#*`]/g, '')       // MD記号を削除
        .replace(/<.*?>/g, '')       // HTMLタグを削除
        .replace(/\s+/g, ' ')        // 連続空白・改行をスペース1つに
        .trim()
        .substring(0, 110) + "...";
};

export default async function NewsListPage({ searchParams }: PageProps) {
    // 1. ページ番号の取得（デフォルトは1）
    const sParams = await searchParams;
    const currentPage = parseInt(sParams.page || '1', 10);
    const limit = 12;
    const offset = (currentPage - 1) * limit;

    // 2. Bridge経由でデータ取得（オフセット指定でページネーション対応）
    const { results: posts, count } = await getSiteMainPosts('post', limit, offset);

    // 3. ページネーション計算
    const totalPages = Math.ceil(count / limit);
    const hasNext = currentPage < totalPages;
    const hasPrev = currentPage > 1;

    return (
        <main className="min-h-screen bg-[#fcfcfc] selection:bg-pink-100 relative overflow-hidden">
            {/* 🌌 背景アクセント */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-gray-100/50 to-transparent -z-10" />

            <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
                
                {/* --- 🏁 ヘッダーセクション --- */}
                <div className="relative mb-20">
                    <div className="inline-flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100 mb-6">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
                        </span>
                        <span className="text-[10px] font-black tracking-[0.2em] text-gray-500 uppercase">Intelligence Feed: Live</span>
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl font-[900] tracking-tight text-gray-900 leading-[0.9] uppercase italic">
                        Latest <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-pink-600 to-gray-900">Reports.</span>
                    </h1>
                    
                    <div className="mt-8 flex flex-col md:flex-row md:items-center gap-4 text-gray-500">
                        <p className="font-medium text-lg border-l-2 border-pink-500 pl-4">
                            AIが解析した最新のテクノロジー情報を提供中。
                            全 <span className="text-gray-900 font-bold">{count}</span> 件のアーカイブ
                        </p>
                    </div>
                </div>

                {/* --- 📰 記事グリッド --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                    {posts.map((post: any) => {
                        const identifier = post.slug || post.id;
                        const displayImage = post.image || post.main_image_url || '/images/common/no-image.jpg';
                        const displayDate = post.date || (post.created_at ? new Date(post.created_at).toLocaleDateString('ja-JP') : '');
                        
                        return (
                            <article 
                                key={post.id} 
                                className="group flex flex-col h-full relative"
                            >
                                {/* 画像カード */}
                                <div className="relative aspect-[16/10] mb-6 overflow-hidden rounded-[2rem] bg-gray-200 shadow-xl shadow-gray-200/50 group-hover:shadow-pink-200/50 transition-all duration-500">
                                    <img
                                        src={displayImage}
                                        alt={post.title}
                                        className="object-cover w-full h-full scale-100 group-hover:scale-110 transition-transform duration-700 ease-out"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    
                                    {(post.category || post.site) && (
                                        <div className="absolute bottom-4 left-4 overflow-hidden rounded-lg">
                                            <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 shadow-lg">
                                                <span className="text-[10px] font-black tracking-widest text-gray-900 uppercase">
                                                    {post.category || post.site}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* コンテンツ情報 */}
                                <div className="flex flex-col flex-grow px-2">
                                    <div className="flex items-center gap-3 mb-4">
                                        <time className="text-[11px] font-black tracking-widest text-gray-400 uppercase">
                                            {displayDate}
                                        </time>
                                        <span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span>
                                        <span className="text-[10px] font-black tracking-tighter text-pink-500 uppercase italic">Analysis Verified</span>
                                    </div>

                                    <h2 className="text-2xl font-black text-gray-900 mb-4 line-clamp-2 leading-[1.2] group-hover:text-pink-600 transition-colors duration-300 uppercase tracking-tighter">
                                        <Link href={`/news/${identifier}`}>
                                            {post.title}
                                        </Link>
                                    </h2>

                                    <p className="text-[15px] text-gray-500 line-clamp-3 mb-8 leading-relaxed font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                                        {getCleanExcerpt(post)}
                                    </p>

                                    <div className="mt-auto">
                                        <Link 
                                            href={`/news/${identifier}`}
                                            className="inline-flex items-center text-xs font-black tracking-[0.2em] text-gray-900 group/link uppercase"
                                        >
                                            <span className="relative">
                                                View Report
                                                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-pink-500 group-hover/link:w-full transition-all duration-300"></span>
                                            </span>
                                            <svg className="w-4 h-4 ml-2 group-hover/link:translate-x-2 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                            </svg>
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>

                {/* --- 🕹️ ページネーションコントロール --- */}
                {totalPages > 1 && (
                    <div className="mt-32 flex flex-col items-center border-t border-gray-100 pt-16">
                        <div className="flex items-center gap-4">
                            {hasPrev ? (
                                <Link 
                                    href={`/news?page=${currentPage - 1}`}
                                    className="px-8 py-4 bg-white border border-gray-200 rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase hover:bg-black hover:text-white hover:border-black transition-all shadow-sm"
                                >
                                    ← Previous
                                </Link>
                            ) : (
                                <span className="px-8 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase text-gray-300 cursor-not-allowed">
                                    ← Previous
                                </span>
                            )}

                            <div className="flex items-center gap-2 mx-4">
                                <span className="text-sm font-black text-gray-900">{currentPage}</span>
                                <span className="text-xs font-bold text-gray-300">/</span>
                                <span className="text-sm font-bold text-gray-400">{totalPages}</span>
                            </div>

                            {hasNext ? (
                                <Link 
                                    href={`/news?page=${currentPage + 1}`}
                                    className="px-8 py-4 bg-white border border-gray-200 rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase hover:bg-black hover:text-white hover:border-black transition-all shadow-sm"
                                >
                                    Next →
                                </Link>
                            ) : (
                                <span className="px-8 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase text-gray-300 cursor-not-allowed">
                                    Next →
                                </span>
                            )}
                        </div>
                        <p className="mt-8 text-[10px] font-bold text-gray-400 tracking-widest uppercase opacity-50">
                            End of Intelligence Stream
                        </p>
                    </div>
                )}

                {/* --- 📭 空状態 --- */}
                {posts.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-40 rounded-[3rem] bg-white border border-gray-100 shadow-sm">
                        <h3 className="text-xl font-black text-gray-900 mb-2 uppercase">Data Terminal Empty</h3>
                        <p className="text-gray-400 font-medium italic">該当するインテリジェンスは見つかりませんでした。</p>
                        <Link href="/news" className="mt-6 text-pink-600 font-bold text-sm underline decoration-2 underline-offset-4">
                            初期ページに戻る
                        </Link>
                    </div>
                )}
            </div>
        </main>
    );
}
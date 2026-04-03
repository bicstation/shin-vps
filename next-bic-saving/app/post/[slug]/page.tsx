/* /app/post/[slug]/page.tsx */
// /home/maya/shin-dev/shin-vps/next-bic-saving/app/post/[slug]/page.tsx

import React from 'react';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { fetchPostData } from '@/shared/lib/api/django-bridge';
import { getSiteMetadata } from '@/shared/lib/utils/siteConfig';
import Link from 'next/link';

/**
 * 💡 Next.js 15 用の動的レンダリング設定
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SavingsDetailPage({ 
    params 
}: { 
    params: Promise<{ slug: string }> 
}) {
    // 1. Next.js 15 仕様: params を await
    const { slug } = await params;
    
    // 2. ホスト判定 (bic-saving コンテキストの確定)
    let currentProject = 'bic-saving';
    try {
        const headerList = await headers();
        const host = headerList.get('host') || "bic-saving.com";
        currentProject = getSiteMetadata(host)?.site_name || 'bic-saving';
    } catch (e) {
        // Build time fallback
    }

    // 3. データ取得
    let post = null;
    try {
        post = await fetchPostData('saving', slug, currentProject);
    } catch (e) {
        console.warn(`[Detail] Connection deferred for slug: ${slug}`);
    }

    if (!post) notFound();

    const displayImage = post.image || post.main_image_url || '/no-image.jpg';
    const displayDate = post.created_at 
        ? new Date(post.created_at).toLocaleDateString('ja-JP') 
        : (post.date || '2026-03-18');

    /**
     * 🖋️ 本文のパース & HTML変換ロジック (Savings Edition)
     * 節約サイト向けに、よりクリーンで強調が分かりやすいスタイルに調整。
     */
    const renderContentHtml = (text: string) => {
        if (!text) return "";

        let html = text
            .replace(/\[\/?CONTENT_GENERAL\]/g, '')
            .replace(/\[TITLE_GENERAL\][\s\S]*?\[\/TITLE_GENERAL\]/g, '')
            .replace(/\[CAT\].*?\[\/CAT\]/g, '')
            .replace(/\[TAG\].*?\[\/TAG\]/g, '')
            .replace(/\[SUMMARY_BOX\]/g, '<div style="margin: 2rem 0; padding: 2rem; background: #fffbeb; border: 1px solid #fef08a; border-left: 5px solid #eab308; border-radius: 8px; color: #713f12;">')
            .replace(/\[\/SUMMARY_BOX\]/g, '</div>')
            .replace(/!\[.*?\]\((.*?)\)/g, '<img src="$1" style="width:100%; border-radius:12px; margin:2.5rem 0; box-shadow:0 10px 30px rgba(0,0,0,0.1);" alt="savings_asset" />')
            .replace(/^## (.*$)/gim, '<h2 style="font-size: 1.75rem; font-weight: 800; color: #1f2937; margin-top: 4rem; margin-bottom: 1.5rem; padding-bottom: 0.5rem; border-bottom: 3px solid #fde047;">$1</h2>')
            .replace(/^### (.*$)/gim, '<h3 style="font-size: 1.35rem; font-weight: 700; color: #374151; margin-top: 2.5rem; margin-bottom: 1.25rem; padding-left: 1rem; border-left: 4px solid #facc15;">$1</h3>')
            .replace(/^\* (.*$)/gim, '<div style="display: flex; align-items: flex-start; gap: 0.75rem; margin-bottom: 0.75rem; color: #4b5563;"><span style="color:#eab308;">✔</span><span>$1</span></div>')
            .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 800; color: #c2410c; background: linear-gradient(transparent 70%, #fef08a 70%);">$1</strong>')
            .replace(/\n\n/g, '<br/><br/>');

        return html;
    };

    const contentHtml = renderContentHtml(post.body_text || post.content);

    return (
        <div className="min-h-screen bg-white text-gray-800 font-sans selection:bg-yellow-200" suppressHydrationWarning={true}>
            {/* 🛰️ ナビゲーション */}
            <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
                    <Link href="/news" className="text-xs font-bold tracking-tight text-gray-400 hover:text-yellow-600 transition-all flex items-center gap-2">
                        ← BACK TO FEED
                    </Link>
                    <div className="text-[10px] font-mono text-yellow-600 bg-yellow-50 px-2 py-1 rounded border border-yellow-100">
                        SECURE_SAVINGS_DATA_LINK
                    </div>
                </div>
            </nav>

            <article className="max-w-4xl mx-auto px-6 pt-12 pb-32">
                {/* 🏷️ ヘッダー */}
                <header className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="bg-yellow-400 text-yellow-900 text-[10px] px-2.5 py-1 font-bold rounded-full uppercase tracking-wider">
                            {post.category || 'SAVING_STRATEGY'}
                        </span>
                        <time className="text-xs font-mono text-gray-400">[{displayDate}]</time>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight tracking-tight mb-6">
                        {post.title}
                    </h1>
                </header>

                {/* 📸 メインビジュアル */}
                <div className="relative aspect-video w-full mb-12 overflow-hidden rounded-2xl border border-gray-100 shadow-xl">
                    <img 
                        src={displayImage} 
                        alt={post.title} 
                        className="w-full h-full object-cover" 
                    />
                </div>

                {/* ✨ AI SUMMARY (節約アドバイス) */}
                {post.extra_metadata?.summary && (
                    <section className="mb-16 p-8 bg-gray-50 border border-gray-200 rounded-2xl relative">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-xl">💡</span>
                            <h2 className="text-xs font-bold text-gray-500 tracking-widest uppercase">
                                Quick_Analysis_Summary
                            </h2>
                        </div>
                        <div 
                            className="text-gray-700 text-base md:text-lg leading-relaxed italic"
                            dangerouslySetInnerHTML={{ __html: post.extra_metadata.summary }} 
                        />
                    </section>
                )}

                {/* 🖋️ 本文エリア */}
                <div className="max-w-none">
                    <div 
                        className="article-rich-text text-lg leading-loose text-gray-700"
                        dangerouslySetInnerHTML={{ __html: contentHtml }} 
                    />
                </div>

                {/* 🏁 フッター / CTA */}
                <section className="mt-32 p-1 bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-600 rounded-3xl">
                    <div className="bg-white p-10 md:p-16 text-center rounded-[20px]">
                        <p className="text-gray-900 text-2xl md:text-3xl font-black mb-10 tracking-tight">
                            賢い選択で、あなたの暮らしを最適化。
                        </p>
                        
                        <div className="flex flex-col md:flex-row justify-center gap-4">
                            {post.source_url && (
                                <a 
                                    href={post.source_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="px-10 py-4 font-bold text-white bg-gray-900 hover:bg-black transition-all rounded-xl shadow-lg text-sm"
                                >
                                    詳細・公式サイトを確認する
                                </a>
                            )}
                            <Link 
                                href="/news" 
                                className="px-10 py-4 font-bold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all rounded-xl text-sm"
                            >
                                記事一覧に戻る
                            </Link>
                        </div>
                    </div>
                </section>

                <footer className="mt-20 pt-8 border-t border-gray-100 font-mono text-[10px] text-gray-400 flex justify-between items-center">
                    <div>
                        NODE: {currentProject.toUpperCase()} / REF_ID: {slug.substring(0, 8)}
                    </div>
                    <div>© BIC_SAVING_NETWORK_2026</div>
                </footer>
            </article>
        </div>
    );
}
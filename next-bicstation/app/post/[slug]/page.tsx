/**
 * =====================================================================
 * 🛰️ BICSTATION Intelligence Detail Master (v7.6.0)
 * 🛡️ Maya's Logic: ビルドエラー回避 & ドメイン明示的同期版
 * 💡 ページ層でドメインを特定し、Bridgeへ確実にプロジェクト名をパスします。
 * =====================================================================
 */

import React from 'react';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers'; // ✅ ページ層でのみ使用（安全）
import { fetchPostData } from '@/shared/lib/api/django-bridge';
import { getSiteMetadata } from '@/shared/lib/utils/siteConfig';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function NewsDetailPage({ params }: { params: { id: string } }) {
    const { id } = params;

    /**
     * 🛰️ ドメイン識別子の解決
     * サーバーサイドでのみ実行されるため、ビルドエラーを回避しつつ
     * ホスト名に基づいたプロジェクト特定を行います。
     */
    const headerList = await headers();
    const host = headerList.get('host') || "";
    const siteData = getSiteMetadata(host);
    const currentProject = siteData?.site_name || 'bicstation';

    /**
     * 📡 データ取得
     * 第3引数に解決した currentProject を渡すことで、
     * Bridge 側での headers() 依存を不要にしています。
     */
    const post = await fetchPostData('news', id, currentProject);

    if (!post) notFound();

    // 🛠️ データの正規化
    const displayImage = post.main_image_url || post.image || '/no-image.jpg';
    const displayDate = post.date || (post.created_at ? new Date(post.created_at).toLocaleDateString('ja-JP') : '2026-04-03');
    const displaySite = post.site_display?.split('(')[0] || post.site || 'INTELLIGENCE';

    /**
     * 🖋️ 本文のパース & HTML変換ロジック
     */
    const renderContentHtml = (text: string) => {
        if (!text) return "";

        return text
            .replace(/\[\/?CONTENT_GENERAL\]/g, '')
            .replace(/\[TITLE_GENERAL\][\s\S]*?\[\/TITLE_GENERAL\]/g, '')
            .replace(/\[CAT\].*?\[\/CAT\]/g, '')
            .replace(/\[TAG\].*?\[\/TAG\]/g, '')
            .replace(/\[SUMMARY_BOX\]/g, '<div style="margin: 3rem 0; padding: 2rem; background: rgba(232,62,140,0.05); border-left: 4px solid #e83e8c; border-radius: 4px; font-style: italic; color: #e5e7eb;">')
            .replace(/\[\/SUMMARY_BOX\]/g, '</div>')
            .replace(/!\[.*?\]\((.*?)\)/g, '<img src="$1" style="width:100%; border-radius:4px; margin:3rem 0; box-shadow:0 20px 50px rgba(0,0,0,0.8); border:1px solid rgba(255,255,255,0.1);" alt="intelligence_asset" />')
            .replace(/^## (.*$)/gim, '<h2 style="font-size: 2rem; font-weight: 900; color: #ffffff; margin-top: 5rem; margin-bottom: 2rem; padding-bottom: 0.5rem; border-bottom: 2px solid rgba(232,62,140,0.5); font-style: italic; letter-spacing: -0.05em;">$1</h2>')
            .replace(/^### (.*$)/gim, '<h3 style="font-size: 1.5rem; font-weight: 800; color: #f3f4f6; margin-top: 3rem; margin-bottom: 1.5rem; padding-left: 1rem; border-left: 4px solid #e83e8c;">$1</h3>')
            .replace(/^\* (.*$)/gim, '<div style="display: flex; align-items: flex-start; gap: 0.75rem; margin-bottom: 1rem; color: #d1d5db;"><span style="color:#e83e8c;">⚡</span><span>$1</span></div>')
            .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 900; color: #ff4500; text-shadow: 0 0 10px rgba(255,69,0,0.2);">$1</strong>')
            .replace(/\n\n/g, '<br/><br/>');
    };

    const rawContent = post.body_text || post.body_main || post.content || "";
    const contentHtml = renderContentHtml(rawContent);

    return (
        <div className="min-h-screen bg-[#020202] text-gray-300 font-sans selection:bg-pink-600/40" suppressHydrationWarning={true}>
            <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
                    <Link href="/post" className="text-[10px] font-mono tracking-widest text-gray-500 hover:text-pink-500 transition-all flex items-center gap-2 uppercase">
                        « Back to Archive Index
                    </Link>
                    <div className="text-[9px] font-mono text-pink-600/50 animate-pulse tracking-tighter uppercase">
                        Domain: {currentProject.toUpperCase()} // Secure Session
                    </div>
                </div>
            </nav>

            <article className="max-w-4xl mx-auto px-6 pt-12 pb-32">
                <header className="mb-16 border-l-4 border-pink-600 pl-8 py-2">
                    <div className="flex items-center gap-4 mb-6">
                        <span className="bg-pink-600 text-white text-[10px] px-3 py-1 font-black tracking-tighter rounded-sm uppercase">
                            {displaySite}
                        </span>
                        <time className="text-[11px] font-mono text-gray-500 tracking-widest">[{displayDate}]</time>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.05] tracking-tighter mb-4 italic drop-shadow-[0_0_15px_rgba(232,62,140,0.2)] uppercase">
                        {post.title}
                    </h1>
                </header>

                <div className="relative aspect-video w-full mb-12 overflow-hidden rounded-sm border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.8)]">
                    <img 
                        src={displayImage} 
                        alt={post.title} 
                        className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-1000" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-transparent to-transparent opacity-80" />
                </div>

                {(post.extra_metadata?.summary || post.summary) && (
                    <section className="mb-16 p-6 bg-pink-900/5 border border-pink-900/20 rounded-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-2 text-[8px] font-mono text-pink-900/40 uppercase tracking-widest">
                            AI_Generated_Analysis
                        </div>
                        <div className="flex items-center gap-2 mb-6">
                            <span className="w-1.5 h-1.5 bg-pink-600 rounded-full animate-ping"></span>
                            <h2 className="text-[10px] font-mono font-bold text-pink-600 tracking-[0.3em] uppercase">
                                Analysis_Results
                            </h2>
                        </div>
                        <div 
                            className="text-gray-300 text-sm md:text-base leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: post.extra_metadata?.summary || post.summary }} 
                        />
                    </section>
                )}

                <div className="max-w-none px-2">
                    <div 
                        className="article-rich-text text-lg md:text-xl leading-[2.2] text-gray-300"
                        dangerouslySetInnerHTML={{ __html: contentHtml }} 
                    />
                </div>

                <section className="mt-32 p-[1px] bg-gradient-to-r from-pink-900/50 via-pink-500 to-pink-900/50 rounded-lg overflow-hidden">
                    <div className="bg-[#080808] p-10 md:p-16 text-center rounded-lg shadow-2xl">
                        <h4 className="text-pink-500 font-mono text-[10px] tracking-[0.5em] mb-6 uppercase animate-pulse">
                            Authentication Required
                        </h4>
                        <p className="text-white text-2xl md:text-4xl font-black mb-12 tracking-tighter italic">
                            その「悦び」の続きを、あなたの肉眼で。
                        </p>
                        <div className="flex flex-col md:flex-row justify-center gap-6">
                            {(post.source_url || post.affiliate_url) && (
                                <a 
                                    href={post.affiliate_url || post.source_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="px-12 py-5 font-black text-white bg-pink-600 hover:bg-pink-500 transition-all rounded-sm shadow-[0_10px_40px_rgba(232,62,140,0.4)] text-sm tracking-widest uppercase text-center"
                                >
                                    Access Full Content _
                                </a>
                            )}
                            <Link 
                                href="/post" 
                                className="px-12 py-5 font-black text-gray-400 border border-white/10 hover:bg-white/5 transition-all rounded-sm text-sm tracking-widest uppercase text-center"
                            >
                                Return to Archive
                            </Link>
                        </div>
                    </div>
                </section>

                <footer className="mt-20 pt-8 border-t border-white/5 font-mono text-[10px] text-gray-700 flex justify-between items-center italic">
                    <div className="flex items-center gap-3">
                        <span className="w-2 h-2 bg-pink-600 rounded-full animate-ping"></span>
                        FILE_STATUS: READ_ONLY / NODE: {currentProject.toUpperCase()} / ID: {id}
                    </div>
                    <div className="tracking-[0.2em]">© SHIN_NETWORK_2026</div>
                </footer>
            </article>
        </div>
    );
}
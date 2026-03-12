// /home/maya/shin-dev/shin-vps/next-bicstation/app/news/[id]/page.tsx

import React from 'react';
import { notFound } from 'next/navigation';
import { fetchPostData } from '@/shared/lib/api';
import Link from 'next/link';

export default async function NewsDetailPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const post = await fetchPostData('post', id);

    if (!post) notFound();

    const displayImage = post.image || post.main_image_url;
    const displayDate = post.date || (post.created_at ? new Date(post.created_at).toLocaleDateString('ja-JP') : '');

    // 💡 本文のクリーンアップと整形ロジック
    const renderContent = (text: string) => {
        if (!text) return null;

        // 1. 不要なAIシステムタグを削除
        let cleaned = text
            .replace(/\[\/?CONTENT_GENERAL\]/g, '')
            .replace(/\[TITLE_GENERAL\][\s\S]*?\[\/TITLE_GENERAL\]/g, '')
            .replace(/\[CAT\].*?\[\/CAT\]/g, '')
            .replace(/\[TAG\].*?\[\/TAG\]/g, '')
            // 二重に出ている重要ポイントボックスなどを正規化（もしあれば）
            .replace(/\[SUMMARY_BOX\]/g, '<div class="ai-summary-box">')
            .replace(/\[\/SUMMARY_BOX\]/g, '</div>');

        // 2. Markdownの基本要素を簡易HTML置換（ビルドエラー回避のため）
        // ※ 本格的なパースが必要な場合は remark-html 等が必要ですが、
        // 今回は dangerouslySetInnerHTML で AI生成HTMLをそのまま活かす方針にします。
        const finalHtml = cleaned
            .replace(/^## (.*$)/gim, '<h2 class="text-3xl font-black text-gray-900 mt-20 mb-8 pb-4 border-b-4 border-gray-100 italic">$1</h2>')
            .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold text-gray-800 mt-12 mb-6 pl-4 border-l-4 border-pink-500">$1</h3>')
            .replace(/^\* (.*$)/gim, '<li class="flex items-start gap-3 mb-3 font-bold text-gray-700 before:content-[\'⚡\'] before:text-pink-500">$1</li>')
            .replace(/\*\*(.*)\*\*/gim, '<strong class="font-black text-gray-900 bg-yellow-50 px-1">$1</strong>');

        return (
            <div 
                className="article-rich-text text-[18px] leading-[2.2] text-gray-800"
                dangerouslySetInnerHTML={{ __html: finalHtml }} 
            />
        );
    };

    return (
        <article className="min-h-screen bg-white pb-32 selection:bg-pink-100">
            {/* 🌌 ナビゲーション */}
            <div className="max-w-5xl mx-auto px-6 pt-12">
                <Link href="/news" className="inline-flex items-center text-[10px] font-black tracking-[0.3em] text-gray-400 hover:text-pink-600 transition-all gap-4 group uppercase">
                    <span className="w-8 h-px bg-gray-200 group-hover:w-12 group-hover:bg-pink-500 transition-all"></span>
                    Back to Feed
                </Link>
            </div>

            {/* 🏷️ ヘッダー */}
            <header className="max-w-4xl mx-auto px-6 mt-16 text-center">
                <div className="flex justify-center gap-2 mb-8">
                    <span className="bg-pink-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-pink-200">
                        {post.category || post.site_display?.replace('bicstation_', '') || 'NEWS'}
                    </span>
                    <span className="bg-gray-100 text-gray-500 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">AI Verified</span>
                </div>
                <h1 className="text-4xl md:text-7xl font-black text-gray-900 leading-[1.1] mb-12 tracking-tighter italic uppercase">
                    {post.title}
                </h1>
                <div className="flex items-center justify-center gap-6 text-[11px] font-black text-gray-400 tracking-widest uppercase">
                    <time>{displayDate}</time>
                    <span className="w-1.5 h-1.5 bg-pink-500 rounded-full"></span>
                    <span>By Bicstation AI Engine</span>
                </div>
            </header>

            {/* 📸 メインビジュアル */}
            {displayImage && (
                <div className="max-w-6xl mx-auto px-6 mt-20">
                    <div className="relative rounded-[4rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)] rotate-[-0.5deg] bg-gray-50 border border-gray-100">
                        <img 
                            src={displayImage} 
                            alt={post.title} 
                            className="w-full h-auto object-cover max-h-[750px] hover:scale-[1.03] transition-transform duration-1000" 
                        />
                    </div>
                </div>
            )}

            {/* 🖋️ 本文エリア */}
            <div className="max-w-3xl mx-auto px-6 mt-24">
                <style dangerouslySetInnerHTML={{ __html: `
                    .ai-summary-box { 
                        margin: 3rem 0;
                        padding: 2.5rem;
                        background: #fffdfd;
                        border: 2px solid #ffe4e6;
                        border-radius: 2.5rem;
                        box-shadow: inset 0 2px 10px rgba(255,192,203,0.2);
                    }
                    .article-rich-text p { margin-bottom: 2rem; }
                `}} />
                {renderContent(post.body_text)}
            </div>

            {/* 🏁 フッター */}
            <footer className="max-w-5xl mx-auto px-6 mt-40">
                <div className="bg-[#0c0c0c] text-white rounded-[4rem] p-12 md:p-20 relative overflow-hidden group shadow-2xl">
                    <div className="relative z-10 grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h4 className="text-4xl font-black mb-6 tracking-tighter leading-none italic uppercase">
                                Bicstation<br/>
                                <span className="text-pink-600">Intelligence</span>
                            </h4>
                            <p className="text-gray-400 text-sm font-medium max-w-sm">
                                このコンテンツは次世代AIネットワークによって解析・最適化されました。最新のトレンドを独自のアルゴリズムで提供します。
                            </p>
                        </div>
                        <div className="flex flex-col gap-4">
                            {post.source_url && (
                                <a href={post.source_url} target="_blank" className="bg-white text-black text-center py-5 rounded-2xl font-black text-[10px] tracking-[0.2em] hover:bg-pink-600 hover:text-white transition-all shadow-xl shadow-white/5 uppercase">Visit Source</a>
                            )}
                            <Link href="/news" className="border border-white/20 text-white text-center py-5 rounded-2xl font-black text-[10px] tracking-[0.2em] hover:bg-white/10 transition-all uppercase">Back to Feeds</Link>
                        </div>
                    </div>
                    <div className="absolute -bottom-10 -right-10 text-[18rem] font-black text-white/[0.02] italic pointer-events-none uppercase">Shin</div>
                </div>
            </footer>
        </article>
    );
}
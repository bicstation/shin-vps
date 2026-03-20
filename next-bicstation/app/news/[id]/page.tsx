/* /app/news/[id]/page.tsx */
// @ts-nocheck
import React from 'react';
import { notFound } from 'next/navigation';
// ✅ 整備したAPIブリッジからハイブリッド取得関数をインポート
import { fetchPostData } from '@/shared/lib/api/django-bridge';
import Link from 'next/link';
import SafeImage from '@/shared/components/atoms/SafeImage';

export default async function NewsDetailPage({ params }: { params: { id: string } }) {
    // Next.js 15等の仕様に合わせてparamsをawait（必要に応じて）
    const { id } = await params;
    
    /**
     * 🛰️ ハイブリッド・データ取得
     * idが数値ならDjango API、文字列ならMarkdownファイルを見に行きます。
     */
    const post = await fetchPostData('post', id);

    if (!post) notFound();

    const displayImage = post.image || post.main_image_url;
    const displayDate = post.date || (post.created_at ? new Date(post.created_at).toLocaleDateString('ja-JP') : '');

    /**
     * 🖋️ 本文のパース & HTML変換ロジック
     * サーバーサイドでライブラリ依存なしにMarkdown風の記述をリッチなHTMLへ変換します。
     */
    const renderContentHtml = (text: string) => {
        if (!text) return "";

        let html = text
            // 1. システムタグ・不要なメタ情報の除去
            .replace(/\[\/?CONTENT_GENERAL\]/g, '')
            .replace(/\[TITLE_GENERAL\][\s\S]*?\[\/TITLE_GENERAL\]/g, '')
            .replace(/\[CAT\].*?\[\/CAT\]/g, '')
            .replace(/\[TAG\].*?\[\/TAG\]/g, '')
            
            // 2. 特殊ボックス [SUMMARY_BOX] のHTML化
            .replace(/\[SUMMARY_BOX\]/g, '<div style="margin: 3rem 0; padding: 2.5rem; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 2rem; border-left: 8px solid #db2777;">')
            .replace(/\[\/SUMMARY_BOX\]/g, '</div>')

            // 3. Markdown記法の変換
            // 画像 ![alt](url)
            .replace(/!\[.*?\]\((.*?)\)/g, '<img src="$1" style="width:100%; border-radius:1.5rem; margin:2rem 0; box-shadow:0 20px 40px rgba(0,0,0,0.05);" alt="content_image" />')
            // 見出し ##
            .replace(/^## (.*$)/gim, '<h2 style="font-size: 2rem; font-weight: 900; color: #111827; margin-top: 4rem; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 2px solid #f3f4f6; letter-spacing: -0.02em;">$1</h2>')
            // 見出し ###
            .replace(/^### (.*$)/gim, '<h3 style="font-size: 1.5rem; font-weight: 800; color: #1f2937; margin-top: 3rem; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;"><span style="color:#db2777;">■</span> $1</h3>')
            // リスト * または -
            .replace(/^[*-] (.*$)/gim, '<li style="list-style:none; display: flex; align-items: flex-start; gap: 0.75rem; margin-bottom: 0.75rem; color: #374151;"><span style="color:#db2777; font-weight:bold;">•</span><span>$1</span></li>')
            // 太字 **text**
            .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 800; color: #111827; background: linear-gradient(transparent 70%, #fce7f3 70%);">$1</strong>')
            // 改行処理
            .replace(/\n\n/g, '<br/><br/>')
            .replace(/\n/g, '<br/>');

        return html;
    };

    const contentHtml = renderContentHtml(post.body_text || post.content || "");

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
                        {post.category || 'ANALYSIS'}
                    </span>
                    <span className="bg-gray-100 text-gray-500 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
                        {post.site || 'Internal'}
                    </span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-gray-900 leading-[1.15] mb-12 tracking-tighter uppercase">
                    {post.title}
                </h1>
                <div className="flex items-center justify-center gap-6 text-[11px] font-black text-gray-400 tracking-widest uppercase">
                    <time>{displayDate}</time>
                    <span className="w-1.5 h-1.5 bg-pink-500 rounded-full"></span>
                    <span>AI Intelligence Report</span>
                </div>
            </header>

            {/* 📸 メインビジュアル */}
            {displayImage && (
                <div className="max-w-5xl mx-auto px-6 mt-20">
                    <div className="relative rounded-[3rem] overflow-hidden shadow-2xl bg-gray-50 border border-gray-100">
                        <SafeImage 
                            src={displayImage} 
                            alt={post.title} 
                            className="w-full h-auto object-cover max-h-[700px]" 
                            fallback="/no-image.jpg"
                        />
                    </div>
                </div>
            )}

            {/* 🖋️ 本文エリア */}
            <div className="max-w-3xl mx-auto px-6 mt-24">
                <div 
                    className="article-rich-text text-[17px] md:text-[19px] leading-[2.1] text-gray-800"
                    dangerouslySetInnerHTML={{ __html: contentHtml }} 
                />
            </div>

            {/* 🏁 フッター（アクションエリア） */}
            <footer className="max-w-5xl mx-auto px-6 mt-40">
                <div className="bg-[#0c0c0c] text-white rounded-[3rem] p-10 md:p-20 relative overflow-hidden group shadow-2xl">
                    <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h4 className="text-3xl font-black mb-6 tracking-tighter leading-none uppercase">
                                Analysis<br/>
                                <span className="text-pink-600">Complete</span>
                            </h4>
                            <p className="text-gray-400 text-xs font-medium max-w-sm leading-relaxed">
                                このレポートは自動解析システムによって生成されました。
                                元データとの整合性はAIによって検証済みです。
                            </p>
                        </div>
                        <div className="flex flex-col gap-4">
                            {post.source_url && (
                                <a 
                                    href={post.source_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="bg-white text-black text-center py-5 rounded-2xl font-black text-[10px] tracking-[0.2em] hover:bg-pink-600 hover:text-white transition-all uppercase"
                                >
                                    Source Terminal
                                </a>
                            )}
                            <Link href="/news" className="border border-white/20 text-white text-center py-5 rounded-2xl font-black text-[10px] tracking-[0.2em] hover:bg-white/10 transition-all uppercase">
                                Return to Feed
                            </Link>
                        </div>
                    </div>
                    <div className="absolute -bottom-10 -right-10 text-[15rem] font-black text-white/[0.03] italic pointer-events-none uppercase">
                        Lab
                    </div>
                </div>
            </footer>
        </article>
    );
}
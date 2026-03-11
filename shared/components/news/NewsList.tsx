// components/news/NewsList.tsx
import { fetchNewsArticles } from '@/shared/lib/api';
import Link from 'next/link';

/**
 * 💡 AIタグやHTMLタグを除去してプレビュー用の純粋なテキストを抽出する
 */
const getCleanPreview = (text: string, length: number = 100) => {
    if (!text) return "";
    const cleanText = text
        .replace(/\[.*?\]/g, '') // [TITLE_GENERAL] などの AI タグを除去
        .replace(/<.*?>/g, '')  // 万が一の HTML タグを除去
        .replace(/\n+/g, ' ')   // 改行をスペースに置換
        .trim();
    
    return cleanText.length > length 
        ? cleanText.substring(0, length) + "..." 
        : cleanText;
};

export default async function NewsList() {
    // 最新 6 件を取得
    const { results: articles } = await fetchNewsArticles(6, 0);

    if (!articles || articles.length === 0) {
        return (
            <div className="py-10 text-center">
                <p className="text-gray-400">最新の官能レビューを準備中です...</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article: any) => (
                <article 
                    key={article.id} 
                    className="group flex flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                >
                    {/* 画像エリア */}
                    <div className="relative h-52 w-full overflow-hidden bg-gray-200">
                        {article.main_image_url ? (
                            <img 
                                src={article.main_image_url} 
                                alt={article.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                        )}
                        <div className="absolute top-3 left-3">
                            <span className="bg-black/60 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider">
                                {article.site_display || 'Exclusive'}
                            </span>
                        </div>
                    </div>

                    {/* コンテンツエリア */}
                    <div className="p-5 flex flex-col flex-grow">
                        <header>
                            <h3 className="text-lg font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-pink-600 transition-colors">
                                {article.title}
                            </h3>
                        </header>
                        
                        <p className="mt-3 text-sm text-gray-600 line-clamp-3 leading-relaxed flex-grow">
                            {getCleanPreview(article.body_text)}
                        </p>

                        <footer className="mt-5 pt-4 border-t border-gray-50 flex items-center justify-between">
                            <span className="text-[11px] text-gray-400 font-medium">
                                {new Date(article.created_at).toLocaleDateString('ja-JP')}
                            </span>
                            <Link 
                                href={`/news/${article.id}`} 
                                className="inline-flex items-center text-sm font-bold text-gray-900 group-hover:text-pink-600"
                            >
                                詳細を読む
                                <svg className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </Link>
                        </footer>
                    </div>
                </article>
            ))}
        </div>
    );
}
/* shared/components/news/LocalIntelligenceList.tsx */
// @ts-nocheck
import Link from 'next/link';
import SafeImage from '@shared/components/atoms/SafeImage';

/**
 * 💡 プレビューテキストを抽出
 */
const getCleanPreview = (content: string, length: number = 90) => {
    if (!content) return "";
    const cleanText = content
        .replace(/---[\s\S]*?---/, '') // Frontmatter除去
        .replace(/<[^>]*>?/gm, '')    // HTMLタグ除去
        .replace(/\[.*?\]/g, '')       // Markdownリンク除去
        .replace(/[#*`]/g, '')         // 装飾記号除去
        .replace(/\n+/g, ' ')          // 改行をスペースに
        .trim();
    
    return cleanText.length > length 
        ? cleanText.substring(0, length) + "..." 
        : cleanText;
};

/**
 * 🛰️ Django APIから記事を取得 (Imperial Edition: Project bicstation対応)
 */
async function getApiPosts() {
    // 🌟 修正: 現在のメインコンテナ django-v3 に向け、プロジェクト名を bicstation に固定
    const apiUrl = process.env.INTERNAL_API_URL || 'http://django-v3:8000';
    const projectSlug = process.env.PROJECT_NAME || 'bicstation';

    try {
        const res = await fetch(`${apiUrl}/api/articles/?project=${projectSlug}&limit=6`, {
            next: { revalidate: 60 },
            headers: { 'Content-Type': 'application/json' }
        });

        if (!res.ok) throw new Error(`HTTP_ERROR: ${res.status}`);

        const data = await res.json();
        
        return data.results.map((article: any) => {
            // 🌟 画像補完ロジック: 画像がない、または /no-image.jpg の場合にテック系画像を割り当て
            let finalImage = article.thumbnail || article.featured_image;
            if (!finalImage || finalImage === '/no-image.jpg') {
                const k = ["technology", "computing", "ai", "network", "cyber"][Math.floor(Math.random() * 5)];
                finalImage = `https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800&q=${article.id}`;
            }

            return {
                id: article.id,
                slug: article.slug,
                title: article.title,
                date: article.created_at || article.date,
                image: finalImage,
                content: article.content
            };
        });
    } catch (e) {
        console.error("❌ FAILED_TO_LOAD_API_POSTS:", e);
        return [];
    }
}

export default async function LocalIntelligenceList() {
    const articles = await getApiPosts();

    if (articles.length === 0) {
        return (
            <div className="py-10 text-center border border-dashed border-gray-800 rounded-xl">
                <p className="text-gray-500 font-mono text-xs italic">[DATABASE_OFFLINE]: NO_ARTICLES_FOUND_FOR_PROJECT_BICSTATION</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
                <article 
                    key={article.id} 
                    className="group flex flex-col bg-[#0a0a0a] border border-gray-800 rounded-xl overflow-hidden hover:border-blue-500/40 transition-all duration-500 shadow-lg"
                >
                    {/* 🖼️ 画像エリア */}
                    <Link href={`/news/${article.slug}`} className="relative h-44 w-full overflow-hidden bg-gray-900 block">
                        <SafeImage 
                            src={article.image} 
                            alt={article.title}
                            className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                        />
                        <div className="absolute top-2 left-2">
                            <span className="bg-blue-600/80 backdrop-blur-sm text-white text-[9px] px-2 py-0.5 rounded-sm font-bold tracking-tighter uppercase border border-blue-400/30">
                                BIC_STATION_NODE
                            </span>
                        </div>
                    </Link>

                    {/* 🖋️ コンテンツエリア */}
                    <div className="p-4 flex flex-col flex-grow">
                        <header>
                            <Link href={`/news/${article.slug}`}>
                                <h3 className="text-sm font-bold text-gray-200 line-clamp-2 leading-snug group-hover:text-blue-400 transition-colors font-mono">
                                    {article.title}
                                </h3>
                            </Link>
                        </header>
                        
                        <p className="mt-2 text-[11px] text-gray-500 line-clamp-3 leading-relaxed flex-grow italic">
                            {getCleanPreview(article.content)}
                        </p>

                        <footer className="mt-4 pt-3 border-t border-gray-900 flex items-center justify-between">
                            <span className="text-[9px] text-gray-600 font-mono uppercase">
                                [{new Date(article.date).toLocaleDateString('ja-JP')}]
                            </span>
                            <Link 
                                href={`/news/${article.slug}`} 
                                className="inline-flex items-center text-[10px] font-bold text-blue-500 hover:text-blue-300 transition-colors uppercase tracking-widest"
                            >
                                Read_More →
                            </Link>
                        </footer>
                    </div>
                </article>
            ))}
        </div>
    );
}
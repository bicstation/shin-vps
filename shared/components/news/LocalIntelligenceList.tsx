/* shared/components/news/LocalIntelligenceList.tsx */
// @ts-nocheck
import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import SafeImage from '@shared/components/atoms/SafeImage';

/**
 * 💡 プレビューテキストを抽出
 * HTMLタグ、Markdown記法、Frontmatterをすべて除去して純粋なテキストのみにする
 */
const getCleanPreview = (content: string, length: number = 90) => {
    if (!content) return "";
    const cleanText = content
        .replace(/---[\s\S]*?---/, '') // Frontmatter除去
        .replace(/<[^>]*>?/gm, '')    // HTMLタグ除去 (追加)
        .replace(/\[.*?\]/g, '')       // Markdownリンク/タグ除去
        .replace(/[#*`]/g, '')         // 装飾記号除去
        .replace(/\n+/g, ' ')          // 改行をスペースに
        .trim();
    
    return cleanText.length > length 
        ? cleanText.substring(0, length) + "..." 
        : cleanText;
};

/**
 * 🛰️ コンテナ内のMarkdownを取得
 */
async function getLocalPosts() {
    const postsDirectory = '/usr/src/app/content/posts';
    try {
        if (!fs.existsSync(postsDirectory)) return [];
        const fileNames = fs.readdirSync(postsDirectory);
        
        const posts = fileNames.filter(fn => fn.endsWith('.md')).map(fileName => {
            const fullPath = path.join(postsDirectory, fileName);
            const fileContent = fs.readFileSync(fullPath, 'utf8');
            
            // 改良版メタデータ抽出 (ダブルクォートの有無に対応)
            const getMeta = (key: string) => {
                const match = fileContent.match(new RegExp(`${key}:\\s*["']?(.*?)["']?(\\n|$)`));
                return match ? match[1].trim() : null;
            };

            // サムネイル優先、なければ featured_image
            const image = getMeta('thumbnail') || getMeta('featured_image') || '/no-image.jpg';

            return {
                id: fileName,
                slug: fileName.replace(/\.md$/, ''),
                title: getMeta('title') || 'INTELLIGENCE_REPORT',
                date: getMeta('date') || '2026-03-20',
                image: image,
                content: fileContent
            };
        });
        
        // 最新順にソートして上位6件
        return posts.sort((a, b) => (new Date(b.date).getTime() - new Date(a.date).getTime())).slice(0, 6);
    } catch (e) {
        console.error("❌ FAILED_TO_LOAD_LOCAL_POSTS:", e);
        return [];
    }
}

export default async function LocalIntelligenceList() {
    const articles = await getLocalPosts();

    if (articles.length === 0) {
        return (
            <div className="py-10 text-center border border-dashed border-gray-800 rounded-xl">
                <p className="text-gray-500 font-mono text-xs italic">[DATABASE_OFFLINE]: NO_LOCAL_FILES_FOUND</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
                <article 
                    key={article.id} 
                    className="group flex flex-col bg-[#0a0a0a] border border-gray-800 rounded-xl overflow-hidden hover:border-pink-500/40 transition-all duration-500 shadow-lg"
                >
                    {/* 🖼️ 画像エリア */}
                    <Link href={`/news/${article.slug}`} className="relative h-44 w-full overflow-hidden bg-gray-900 block">
                        <SafeImage 
                            src={article.image} 
                            alt={article.title}
                            className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                        />
                        <div className="absolute top-2 left-2">
                            <span className="bg-pink-600/80 backdrop-blur-sm text-white text-[9px] px-2 py-0.5 rounded-sm font-bold tracking-tighter uppercase border border-pink-400/30">
                                Report_Node
                            </span>
                        </div>
                    </Link>

                    {/* 🖋️ コンテンツエリア */}
                    <div className="p-4 flex flex-col flex-grow">
                        <header>
                            <Link href={`/news/${article.slug}`}>
                                <h3 className="text-sm font-bold text-gray-200 line-clamp-2 leading-snug group-hover:text-pink-400 transition-colors font-mono">
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
                                className="inline-flex items-center text-[10px] font-bold text-pink-500 hover:text-pink-300 transition-colors uppercase tracking-widest"
                            >
                                Access_File →
                            </Link>
                        </footer>
                    </div>
                </article>
            ))}
        </div>
    );
}
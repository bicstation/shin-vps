// components/news/NewsList.tsx
import { fetchNewsArticles } from '@/shared/lib/api';
import Link from 'next/link';

export default async function NewsList() {
    // 💡 さっき作った Bridge 経由の関数で最新 6 件を取得
    const { results: articles } = await fetchNewsArticles(6, 0);

    if (!articles || articles.length === 0) {
        return <p className="text-gray-500">現在、最新ニュースを準備中です...</p>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article: any) => (
                <div key={article.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
                    {article.main_image_url && (
                        <img 
                            src={article.main_image_url} 
                            alt={article.title}
                            className="w-full h-48 object-cover"
                        />
                    )}
                    <div className="p-4">
                        <span className="text-xs text-blue-600 font-bold uppercase">Latest News</span>
                        <h3 className="text-lg font-bold mt-1 mb-2 line-clamp-2">
                            {article.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                            {article.body_text.substring(0, 100)}...
                        </p>
                        <Link 
                            href={`/news/${article.id}`} 
                            className="text-sm font-medium text-black hover:underline"
                        >
                            記事を読む →
                        </Link>
                    </div>
                </div>
            ))}
        </div>
    );
}
/**
 * 📝 Markdown 記事詳細ページ (PostPage)
 * 🛡️ Maya's Logic: Next.js 15 Async Params & Path Optimization
 * 物理パス: app/blog/[slug]/page.tsx
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

// 💡 内部関数: 記事データを取得
async function getPostData(slug: string) {
  // ✅ 修正ポイント 1: コンテンツ配置場所を環境に合わせて調整
  // 以前のビルドログから、'content/bicstation' または 'content/posts' が想定されます
  const postsDirectory = path.join(process.cwd(), 'content/bicstation');
  const fullPath = path.join(postsDirectory, `${slug}.md`);

  // ファイルが存在しない場合は null を返す
  if (!fs.existsSync(fullPath)) return null;

  try {
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    // MarkdownをHTMLに変換
    const processedContent = await remark().use(html).process(content);
    const contentHtml = processedContent.toString();

    return {
      slug,
      contentHtml,
      title: data.title || '無題の記事',
      date: data.date ? String(data.date) : '',
      category: data.category || 'PCトピックス',
      thumbnail: data.thumbnail || '/no-image.png',
    };
  } catch (error) {
    console.error(`[Markdown Parse Error]: ${slug}`, error);
    return null;
  }
}

/**
 * 💡 SEOメタデータの動的生成
 */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; // ✅ Next.js 15 では params は Promise です
  const post = await getPostData(slug);
  
  if (!post) return { title: 'Post Not Found' };

  return {
    title: `${post.title} - BICSTATION`,
    description: `${post.title}についての詳細記事です。`,
    openGraph: {
      images: [post.thumbnail],
    },
  };
}

// メインコンポーネント
export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  // ✅ 修正ポイント 2: Next.js 15 の非同期 params 対応
  const { slug } = await params;
  const post = await getPostData(slug);

  if (!post) {
    notFound(); // 記事がない場合は404を表示
  }

  return (
    <article className="max-w-4xl mx-auto px-6 py-12 bg-white dark:bg-transparent">
      {/* 🌌 記事ヘッダー */}
      <header className="mb-10 border-b border-gray-200 dark:border-gray-800 pb-8">
        <div className="flex items-center gap-4 mb-4">
          <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded">
            {post.category}
          </span>
          <time className="text-sm text-gray-500">
            {post.date}
          </time>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
          {post.title}
        </h1>
        {post.thumbnail && (
          <div className="rounded-xl overflow-hidden aspect-video mb-8">
            <img 
              src={post.thumbnail} 
              alt={post.title} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </header>
      
      {/* 📦 記事本文: Tailwind Typography (prose) */}
      <div 
        className="prose prose-lg md:prose-xl max-w-none prose-slate dark:prose-invert 
                   prose-headings:font-bold prose-a:text-blue-600 prose-img:rounded-xl"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }} 
      />

      <footer className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800">
        <button 
          onClick={() => window.history.back()} 
          className="text-blue-600 hover:underline font-medium"
        >
          ← 記事一覧に戻る
        </button>
      </footer>
    </article>
  );
}
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { notFound } from 'next/navigation';

// 記事データを取得する内部関数
async function getPostData(slug: string) {
  const postsDirectory = path.join(process.cwd(), 'content/posts');
  const fullPath = path.join(postsDirectory, `${slug}.md`);

  // ファイルが存在しない場合は null を返す
  if (!fs.existsSync(fullPath)) return null;

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  // MarkdownをHTMLに変換
  const processedContent = await remark().use(html).process(content);
  const contentHtml = processedContent.toString();

  return {
    slug,
    contentHtml,
    title: data.title || '無題の記事',
    date: data.date || '',
    category: data.category || '未分類',
  };
}

// メインコンポーネント
export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPostData(params.slug);

  if (!post) {
    notFound(); // 記事がない場合は404を表示
  }

  return (
    <article className="max-w-4xl mx-auto px-6 py-12">
      <header className="mb-10 border-b pb-8">
        <div className="text-blue-600 font-bold mb-2">{post.category}</div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
          {post.title}
        </h1>
        <time className="text-gray-500">{post.date}</time>
      </header>
      
      {/* Tailwind Typography (prose) を使って美しく表示 */}
      <div 
        className="prose prose-lg md:prose-xl max-w-none prose-slate"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }} 
      />
    </article>
  );
}
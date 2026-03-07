/**
 * =====================================================================
 * 📝 Markdown 取得ライブラリ (shared/lib/markdown.ts)
 * 🚀 ローカルの .md ファイルを解析して記事データとして提供します。
 * =====================================================================
 */
// /home/maya/shin-dev/shin-vps/shared/lib/markdown.ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface PostData {
  slug: string;
  title: string;
  date: string;
  content: string;
  [key: string]: any;
}

/**
 * 📂 指定されたフォルダから Markdown 記事一覧を取得
 * @param folderPath プロジェクトルートからの相対パス (例: 'content/posts')
 */
export function getPostsFromFolder(folderPath: string): PostData[] {
  // 実行環境のルートパスを取得
  const fullPath = path.join(process.cwd(), folderPath);
  
  // フォルダが存在しない場合は空配列を返す（ビルドエラー防止）
  if (!fs.existsSync(fullPath)) {
    console.warn(`⚠️ [Markdown] Folder not found: ${fullPath}`);
    return [];
  }

  try {
    const fileNames = fs.readdirSync(fullPath);
    
    const allPostsData = fileNames
      .filter((fileName) => fileName.endsWith('.md'))
      .map((fileName) => {
        const slug = fileName.replace(/\.md$/, '');
        const filePath = path.join(fullPath, fileName);
        const fileContents = fs.readFileSync(filePath, 'utf8');
        
        // Frontmatter (YAML) と本文を分離
        const { data, content } = matter(fileContents);

        return {
          slug,
          content,
          title: data.title || '無題の記事',
          date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
          ...data,
        } as PostData;
      });

    // 日付の新しい順（降順）にソート
    return allPostsData.sort((a, b) => (new Date(b.date).getTime() - new Date(a.date).getTime()));
  } catch (error) {
    console.error(`❌ [Markdown] Error reading posts:`, error);
    return [];
  }
}

/**
 * 📄 特定のスラッグから単一の Markdown 記事を取得
 */
export function getPostBySlug(folderPath: string, slug: string): PostData | null {
  const posts = getPostsFromFolder(folderPath);
  return posts.find((post) => post.slug === slug) || null;
}
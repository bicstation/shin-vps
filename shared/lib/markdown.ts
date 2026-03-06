import fs from 'fs';
import path from 'path';
import matter from 'gray-matter'; // 'npm install gray-matter' が必要です

export interface PostData {
  slug: string;
  title: string;
  date: string;
  content: string;
  [key: string]: any;
}

export function getPostsFromFolder(folderPath: string): PostData[] {
  // 指定されたフォルダ内の .md ファイルを取得
  const fullPath = path.resolve(process.cwd(), folderPath);
  if (!fs.existsSync(fullPath)) return [];

  const fileNames = fs.readdirSync(fullPath);
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, '');
      const fileContents = fs.readFileSync(path.join(fullPath, fileName), 'utf8');
      const { data, content } = matter(fileContents);

      return {
        slug,
        content,
        title: data.title || '無題の記事',
        date: data.date || new Date().toISOString(),
        ...data,
      };
    });

  // 日付の新しい順に並び替え
  return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}
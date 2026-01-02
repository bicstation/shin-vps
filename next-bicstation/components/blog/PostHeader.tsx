// components/blog/PostHeader.tsx
import React from 'react';
import styles from './PostHeader.module.css'; // ✅ CSS Moduleをインポート

interface PostHeaderProps {
  post: any;
  decodeHtml: (html: string) => string;
  formatDate: (dateString: string) => string;
  SITE_COLOR?: string; 
}

export const PostHeader = ({ 
  post, 
  decodeHtml, 
  formatDate, 
  SITE_COLOR = "#007bff"
}: PostHeaderProps) => {
  return (
    // インラインスタイルで --site-color 変数だけをCSSに渡します
    <header className={styles.header} style={{ '--site-color': SITE_COLOR } as React.CSSProperties}>
      <div className={`animate-in ${styles.container}`}>
        
        {/* カテゴリ表示 */}
        <div className={styles.categoryList}>
          {post.categories_names?.map((cat: string) => (
            <span key={cat} className={styles.categoryTag}>
              {cat}
            </span>
          ))}
        </div>

        {/* 記事タイトル */}
        <h1 className={styles.title}>
          {decodeHtml(post.title.rendered)}
        </h1>

        {/* 投稿情報 */}
        <div className={styles.meta}>
          👤 {post.author_name || 'Admin'} ｜ 📅 {formatDate(post.date)}
        </div>
      </div>
    </header>
  );
};
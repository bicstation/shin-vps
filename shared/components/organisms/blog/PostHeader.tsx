import React from 'react';
import styles from './PostHeader.module.css';

interface PostHeaderProps {
  post: any;
  decodeHtml: (html: string) => string;
  formatDate: (dateString: string) => string;
  SITE_COLOR?: string;
}

/**
 * 💡 ブログ記事のヘッダーコンポーネント
 * SEO対策としてH1タグを適切に配置し、Googleが好む「更新日」を表示します。
 */
export const PostHeader = ({
  post,
  decodeHtml,
  formatDate,
  SITE_COLOR = "#007bff"
}: PostHeaderProps) => {
  
  // 公開日と更新日が異なる場合に更新日を表示するための判定
  const hasUpdated = post.modified && post.date !== post.modified;

  return (
    <header 
      className={styles.header} 
      style={{ '--site-color': SITE_COLOR } as React.CSSProperties}
    >
      <div className={`animate-in ${styles.container}`}>
        
        {/* 1. カテゴリ表示（パンくずリストに近い役割） */}
        {post.categories_names && post.categories_names.length > 0 && (
          <div className={styles.categoryList}>
            {post.categories_names.map((cat: string) => (
              <span key={cat} className={styles.categoryTag}>
                {cat}
              </span>
            ))}
          </div>
        )}

        {/* 2. 記事タイトル（SEOの最重要項目: ページに1つだけのH1） */}
        <h1 className={styles.title}>
          {decodeHtml(post.title.rendered)}
        </h1>

        {/* 3. 投稿・更新メタ情報 */}
        <div className={styles.meta}>
          <span className={styles.metaItem}>
            <span className={styles.icon}>👤</span>
            {post.author_name || 'BICSTATION 編集部'}
          </span>
          
          <span className={styles.metaItem}>
            <span className={styles.icon}>📅</span>
            公開: {formatDate(post.date)}
          </span>

          {/* 💡 更新日がある場合は表示（Googleの評価アップに繋がります） */}
          {hasUpdated && (
            <span className={styles.metaItem}>
              <span className={styles.icon}>🔄</span>
              更新: {formatDate(post.modified)}
            </span>
          )}
        </div>
      </div>
    </header>
  );
};
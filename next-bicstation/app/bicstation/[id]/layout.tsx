import React from 'react';
// ✅ サイト共通設定（色など）をインポート
import { COLORS } from '@shared/styles/constants'; 

interface PostLayoutProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * 💡 ブログ記事表示用の共通レイアウトコンポーネント
 * * 役割:
 * 1. 記事本文全体のラッパーとして機能。
 * 2. サイトのテーマカラーをCSS変数 (--site-theme-color) として流し込む。
 * 3. 外部CSS (PostContent.module.css 等) と組み合わせて、h2, h3, a タグを制御。
 */
export default function PostLayout({
  children,
  className = "",
}: PostLayoutProps) {
  
  // 🎨 テーマカラーの取得（フォールバックを確実に設定）
  const primaryColor = COLORS?.SITE_COLOR || '#3b82f6';

  return (
    <article 
      className={`post-body-content ${className}`}
      style={{ 
        // 💡 インラインスタイルはこのCSS変数の定義だけに留めるのがスマート
        '--site-theme-color': primaryColor 
      } as React.CSSProperties}
    >
      {/* 💡 children 内に含まれる HTML（WordPress等からの生のHTML）は、
         親要素である .post-body-content を起点とした子孫セレクタで
         外部CSSからスタイルを当てます。
         例: .post-body-content h2 { color: var(--site-theme-color); }
      */}
      {children}
    </article>
  );
}
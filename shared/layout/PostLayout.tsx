import React from 'react';
import styles from './PostLayout.module.css';

interface PostLayoutProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * 🚀 全ドメイン共通：WordPress記事本文用レイアウトコンポーネント
 * CSSモジュールを使用してスタイルを分離管理します。
 */
const PostLayout: React.FC<PostLayoutProps> = ({ children, className }) => {
  return (
    <div className={`${styles.postContainer} ${className || ''}`}>
      {children}
    </div>
  );
};

export default PostLayout;
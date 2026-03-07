import React from 'react';
import styles from './PostSidebar.module.css';

// --- 型定義 ---
interface PostSidebarProps {
  toc: string[];
  SITE_COLOR?: string;   // 親から受け取るカラー設定
  ACCENT_COLOR?: string; // 親から受け取るアクセントカラー
}

export const PostSidebar = ({ 
  toc, 
  SITE_COLOR = '#007bff', 
  ACCENT_COLOR = '#00c6ff' 
}: PostSidebarProps) => {
  return (
    <aside className="animate-in">
      {/* CSS変数 (--site-color) を style 属性で渡すことで、
        CSS Modules 側で動的に色を適用できるようにします
      */}
      <div 
        className={styles.sidebarCard} 
        style={{ '--site-color': SITE_COLOR } as React.CSSProperties}
      >
        <h3 className={styles.indexTitle}>INDEX</h3>
        <nav>
          {toc.map((text, i) => (
            <span key={i} className={styles.tocItem}>
              <span className={styles.tocNumber}>
                {String(i + 1).padStart(2, '0')}
              </span> 
              {text}
            </span>
          ))}
        </nav>

        {/* 宣伝カード：受け取った色をグラデーションに適用 */}
        <div 
          className={styles.promotionCard}
          style={{ 
            background: `linear-gradient(135deg, ${SITE_COLOR}, ${ACCENT_COLOR})` 
          }}
        >
          <h4 className={styles.promoTitle}>BICSTATION</h4>
          <p className={styles.promoText}>
            最新のテクノロジーとクリエイティブな視点を提案します。
          </p>
        </div>
      </div>
    </aside>
  );
};
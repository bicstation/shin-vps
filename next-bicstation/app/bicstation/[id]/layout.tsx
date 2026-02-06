import React from 'react';
// ✅ shared/lib/siteConfig 等から色を取得する形に合わせるとより汎用的です
import { COLORS } from '@shared/styles/constants'; 

/**
 * ブログ記事表示用の共通レイアウト
 * 💡 インラインの <style> を排除し、CSS変数のみを制御します。
 */
export default function PostLayout({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  // サイト共通カラーを取得（フォールバック付き）
  const primaryColor = COLORS?.SITE_COLOR || '#3b82f6';

  return (
    <article 
      className={`post-content-container ${className}`} // ✅ 専用のクラスを付与
      style={{ 
        // 💡 CSS変数のみをインラインで定義
        '--site-theme-color': primaryColor 
      } as React.CSSProperties}
    >
      {/* この children（記事本文）内の h2, h3, a タグなどは、
         外部 CSS 側で var(--site-theme-color) を通じて着色されます。
      */}
      {children}
    </article>
  );
}
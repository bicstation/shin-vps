import React from 'react';
import { COLORS } from '@/constants';

/**
 * ブログ記事表示用の共通レイアウト
 * 💡 インラインの <style> タグを globals.css へ移動し、HTMLを軽量化しました。
 */
export default function PostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 共通のプライマリカラーを取得
  const primaryColor = COLORS?.SITE_COLOR || '#3b82f6';

  return (
    <section 
      style={{ 
        // CSS変数 (--site-color) だけを動的に渡すことで、
        // インラインスタイルを最小限（この1行だけ）に抑えます。
        '--site-color': primaryColor 
      } as React.CSSProperties}
    >
      {/* ✅ インラインの巨大な <style> は削除されました。
          これにより、ページのソースを表示した際に「中身（記事本文）」が
          検索エンジンから見つけやすくなります。
      */}
      {children}
    </section>
  );
}
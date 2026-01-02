import React from 'react';
// ✅ 共通カラー設定をインポート
import { COLORS } from '@/constants';

export default function PostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 共通のプライマリカラーを適用（未定義時はデフォルト色）
  const primaryColor = COLORS?.SITE_COLOR || '#007bff';

  return (
    <section>
      {/* 💡 記事ページ専用の高度な装飾スタイル */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-in {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        
        /* 記事本文内の見出しデザインを詳細ページ用に強化 */
        .wp-content h2 {
          font-size: 1.8rem;
          border-left: 8px solid ${primaryColor};
          padding: 0.5em 0.8em;
          margin: 2.5em 0 1.2em;
          background: linear-gradient(90deg, rgba(0, 123, 255, 0.05) 0%, rgba(255, 255, 255, 0) 100%);
          font-weight: 800;
          line-height: 1.4;
          display: flex;
          align-items: center;
        }

        /* 記事内のリンクにアクセントカラーを適用 */
        .wp-content a {
          color: ${primaryColor};
          text-decoration: underline;
          font-weight: 500;
        }

        .wp-content a:hover {
          opacity: 0.7;
          text-decoration: none;
        }
      `}} />
      
      {/* ページの中身を表示 */}
      {children}
    </section>
  );
}
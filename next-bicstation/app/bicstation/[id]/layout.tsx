import React from 'react';
// ✅ 共通カラー設定をインポート
import { COLORS } from '@/constants';

export default function PostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 共通のプライマリカラーを適用
  const primaryColor = COLORS?.SITE_COLOR || '#3b82f6';

  return (
    <section>
      {/* 💡 スマホ対応を強化した共通スタイル定義 */}
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --site-color: ${primaryColor};
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-in {
          animation: fadeInUp 0.6s ease-out forwards;
        }

        /* --- スマホ・PC共通の基本ルール --- */
        .wp-content {
          word-break: break-word; /* 長い英単語などが画面外にはみ出すのを防ぐ */
          overflow-wrap: break-word;
        }

        .wp-content a {
          color: var(--site-color);
          text-decoration: underline;
          transition: opacity 0.2s;
        }

        /* --- スマホ専用の調整 (メディアクエリ) --- */
        @media (max-width: 768px) {
          /* スマホでは文字サイズを少し落として読みやすくする */
          .wp-content {
            font-size: 1rem;
            line-height: 1.8;
          }

          /* 見出しがスマホで巨大化しないように調整 */
          .wp-content h2 {
            font-size: 1.4rem !important; /* module.cssより優先させたい場合 */
            margin: 2em 0 1em !important;
          }

          .wp-content h3 {
            font-size: 1.25rem !important;
          }

          /* スマホでの画像余白を最適化 */
          .wp-content img {
            margin: 1.5rem 0;
            border-radius: 12px;
          }

          /* 表（Table）がはみ出す場合の対策 */
          .wp-content table {
            display: block;
            overflow-x: auto;
            white-space: nowrap;
            -webkit-overflow-scrolling: touch;
          }
        }
      `}} />
      
      {/* ページの中身（PostPage）を表示 */}
      {children}
    </section>
  );
}
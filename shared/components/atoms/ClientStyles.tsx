"use client";

/**
 * =====================================================================
 * 🧱 [ATOM] ClientStyles
 * サーバーから受け取ったテーマカラーを、CSS変数として全域に注入します。
 * styled-jsx を使用するため 'use client' が必須です。
 * =====================================================================
 */
// /home/maya/shin-dev/shin-vps/shared/components/atoms/ClientStyles.tsx
export default function ClientStyles({ themeColor }: { themeColor: string }) {
  return (
    <style jsx global>{`
      :root {
        /* ✅ メインテーマカラーをCSS変数化 */
        --site-theme-color: ${themeColor};
        
        /* ✅ 共通のデザインシステム変数 */
        --bg-primary: #f4f7f9;
        --text-primary: #333333;
        --transition-speed: 0.3s;
      }

      /* ✅ リンクのグローバル定義 */
      a {
        color: var(--site-theme-color);
        text-decoration: none;
        transition: color var(--transition-speed);
      }
      
      a:hover {
        text-decoration: underline;
        opacity: 0.8;
      }

      /* ✅ スクロールバーのカスタマイズ（サイトの一体感を醸成） */
      ::-webkit-scrollbar { 
        width: 8px; 
      }
      ::-webkit-scrollbar-track { 
        background: #eef2f5; 
      }
      ::-webkit-scrollbar-thumb { 
        background: #ccc; 
        border-radius: 4px; 
      }
      ::-webkit-scrollbar-thumb:hover { 
        background: var(--site-theme-color); 
      }

      /* ✅ 選択テキストの色もテーマに合わせる（爆速プロ仕様のディテール） */
      ::selection {
        background-color: var(--site-theme-color);
        color: white;
      }
    `}</style>
  );
}
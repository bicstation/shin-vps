"use client";

/**
 * 💡 styled-jsx を使用するためにクライアントコンポーネントとして分離
 */
export default function ClientStyles({ themeColor }: { themeColor: string }) {
  return (
    <style jsx global>{`
      :root {
        --site-theme-color: ${themeColor};
        --bg-primary: #f4f7f9;
        --text-primary: #333333;
      }
      a {
        color: ${themeColor};
        text-decoration: none;
      }
      a:hover {
        text-decoration: underline;
      }

      /* PCカタログサイト用のスクロールバー */
      ::-webkit-scrollbar { width: 8px; }
      ::-webkit-scrollbar-track { background: #eef2f5; }
      ::-webkit-scrollbar-thumb { background: #ccc; border-radius: 4px; }
      ::-webkit-scrollbar-thumb:hover { background: ${themeColor}; }
    `}</style>
  );
}
// /home/maya/shin-dev/shin-vps/shared/lib/decode.ts

/**
 * HTMLエンティティ（&amp; 等）を通常の文字に変換する
 */
export const decodeHtml = (html: string): string => {
  if (!html) return '';

  // サーバーサイド（Node.js環境）でのフォールバック
  if (typeof window === 'undefined') {
    return html
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  }

  // クライアントサイド
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  return doc.documentElement.textContent || '';
};
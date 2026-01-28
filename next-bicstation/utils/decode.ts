// utils/decode.ts

/**
 * HTMLエンティティ（&amp; 等）を通常の文字に変換する
 */
export const decodeHtml = (html: string): string => {
  if (!html || typeof window === 'undefined') return html || '';

  // DOMParserを使ってブラウザに解析を任せる（最も確実な方法）
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  return doc.documentElement.textContent || '';
};
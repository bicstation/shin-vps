// /shared/lib/domain/product/transform.ts
// @ts-nocheck

// # テキスト短縮
const shorten = (text: string = '', max = 40) => {
  if (!text) return 'おすすめ商品';
  return text.length > max ? text.slice(0, max) + '...' : text;
};

// # ラベル変換
const convertLabel = (label?: string) => {
  if (!label) return '';

  if (label.includes('迷ったら')) return '👑 人気No.1';
  if (label.includes('ハイエンド')) return '🚀 ハイスペック';
  if (label.includes('ゲーミング')) return '🎮 ゲーム最強';
  if (label.includes('コスパ')) return '💰 コスパ最強';

  return label;
};

// # タグ正規化
const normalizeTags = (tags?: any) => {
  if (!Array.isArray(tags)) return [];
  return tags.filter(Boolean);
};

// # 価格
const normalizePrice = (price?: any) => {
  if (!price || isNaN(price)) return 0;
  return Number(price);
};

// # URL
const normalizeUrl = (url?: string) => {
  if (!url) return '';
  return url;
};

/**
 * # メイン変換
 */
export const transformProduct = (p: any) => {
  if (!p) return null;

  const tags = normalizeTags(p.tags);

  return {
    id: p.id,

    // # 一意ID
    unique_id: p.unique_id || String(p.id),

    // # タイトル
    title: p.title || 'おすすめ商品',
    shortTitle: shorten(p.title),

    // 🔥 画像（そのまま使う）
    image: p.image || '/no-image.png',

    // # 価格
    price: normalizePrice(p.price),

    // # URL
    url: normalizeUrl(p.url),

    // # ラベル
    label: p.label || '',
    displayLabel: convertLabel(p.label),

    // # タグ
    tags,
    mainTag: tags[0] || '',

    // # スコア
    rankingScore: p.ranking_score ?? 0,
  };
};

export const transformProducts = (list: any[] = []) => {
  return list.map(transformProduct).filter(Boolean);
};
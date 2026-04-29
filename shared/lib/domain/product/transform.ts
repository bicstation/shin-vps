// /shared/lib/domain/product/transform.ts
// @ts-nocheck

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ||
  'http://localhost:8083';

const shorten = (text: string = '', max = 40) => {
  if (!text) return 'おすすめ商品';
  return text.length > max ? text.slice(0, max) + '...' : text;
};

const normalizeImage = (image?: string | null) => {
  if (!image) return '/images/no-image.png';

  if (image.startsWith('http')) return image;

  if (image.startsWith('/media')) {
    return `${API_BASE}${image}`;
  }

  return `${API_BASE}${image}`;
};

const convertLabel = (label?: string) => {
  if (!label) return '';

  if (label.includes('迷ったら')) return '👑 人気No.1';
  if (label.includes('ハイエンド')) return '🚀 ハイスペック';
  if (label.includes('ゲーミング')) return '🎮 ゲーム最強';
  if (label.includes('コスパ')) return '💰 コスパ最強';

  return label;
};

const normalizeTags = (tags?: any) => {
  if (!Array.isArray(tags)) return [];
  return tags.filter(Boolean);
};

const normalizePrice = (price?: any) => {
  if (!price || isNaN(price)) return 0;
  return Number(price);
};

const normalizeUrl = (url?: string) => {
  if (!url) return '';
  return url;
};

/**
 * 🚀 メイン変換（ここが重要）
 */
export const transformProduct = (p: any) => {
  if (!p) return null;

  const tags = normalizeTags(p.tags);

  return {
    id: p.id,

    // 🔥 ここ追加（最重要）
    unique_id: p.unique_id || String(p.id),

    // 🎯 表示系
    title: p.title || 'おすすめ商品',
    shortTitle: shorten(p.title),

    // 🖼
    image: normalizeImage(p.image),

    // 💰
    price: normalizePrice(p.price),

    // 🔗
    url: normalizeUrl(p.url),

    // 🏷
    label: p.label || '',
    displayLabel: convertLabel(p.label),

    // 🏷 tags
    tags,
    mainTag: tags[0] || '',

    // 📊
    rankingScore: p.ranking_score ?? 0,
  };
};

export const transformProducts = (list: any[] = []) => {
  return list.map(transformProduct).filter(Boolean);
};
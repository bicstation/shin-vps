// /shared/lib/domain/product/transform.ts
// @ts-nocheck

// # API用（データ取得専用）
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ||
  'http://localhost:8083';

// # 現在ドメイン取得（マルチドメイン対応）
const getMediaBase = () => {
  // # ブラウザ側
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // # SSR側（fallback）
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
    'http://localhost:3000';
};

// # テキスト短縮
const shorten = (text: string = '', max = 40) => {
  if (!text) return 'おすすめ商品';
  return text.length > max ? text.slice(0, max) + '...' : text;
};

// # 画像URL正規化（最終版）
const normalizeImage = (image?: string | null) => {
  const MEDIA_BASE = getMediaBase();

  if (!image) return '/images/no-image.png';

  // # 既にhttpsならそのまま
  if (image.startsWith('https://')) return image;

  // # httpはhttpsへ強制変換
  if (image.startsWith('http://')) {
    image = image.replace('http://', 'https://');
  }

  // # docker内部URL対策
  if (
    image.includes('django-v3') ||
    image.includes('django-api-host')
  ) {
    const path = image.replace(/^.*\/media/, '/media');
    return `${MEDIA_BASE}${path}`;
  }

  // # /mediaパス
  if (image.startsWith('/media')) {
    return `${MEDIA_BASE}${image}`;
  }

  // # ルート相対
  if (image.startsWith('/')) {
    return `${MEDIA_BASE}${image}`;
  }

  // # 相対パス（保険）
  return `${MEDIA_BASE}/${image}`;
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

    // # 画像（最重要）
    image: normalizeImage(p.image),

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
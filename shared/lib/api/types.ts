/**
 * =====================================================================
 * 📋 統合型定義 (shared/lib/api/types.ts)
 * =====================================================================
 */

/**
 * 📊 レーダーチャート用共通データ構造
 */
export interface RadarChartData {
  subject: string;
  value: number;
  fullMark: number;
}

/**
 * 🏷️ 共通マスターデータ (Maker, Label, Genre, Actress等)
 */
export interface MasterBase {
  id: number;
  name: string;
  slug?: string;
  api_source?: string;
}

/**
 * 🏷️ 属性タグ (PCAttribute / AdultAttribute)
 */
export interface ProductAttribute extends MasterBase {
  attr_type: string;
  order: number;
}

/**
 * 💻 PC製品型定義
 */
export interface PCProduct {
  id: number;
  unique_id: string;
  site_prefix: string;
  maker: MasterBase | string; // オブジェクトまたは文字列
  name: string;
  price: number | null;
  image_url: string;
  affiliate_url: string;
  description?: string;
  
  // AI生成・解析
  ai_content?: string;
  ai_summary?: string;
  target_segment?: string;
  spec_score: number; // 0-100
  
  // スコア詳細 (Radar Chart用)
  score_cpu?: number;
  score_gpu?: number;
  score_ai?: number;
  score_cost?: number;
  score_portable?: number;

  // ハードウェアスペック
  stock_status: 'instock' | 'outofstock' | 'preorder';
  unified_genre?: string;
  cpu_model?: string;
  gpu_model?: string;
  memory_gb?: number;
  storage_gb?: number;
  display_info?: string;
  is_ai_pc?: boolean;
  
  attributes?: ProductAttribute[];
  updated_at: string;
}

/**
 * 🔞 アダルト製品型定義
 * PCProductと共通の構造を持ちつつ、アダルト特有のフィールドを網羅
 */
export interface AdultProduct {
  id: number;
  product_id_unique: string;
  api_source: string;
  title: string;
  price: number | null;
  release_date: string | null;
  affiliate_url: string;
  image_url_list: string[];
  sample_movie_url: string | null; // 🎥 追加

  // リレーション (シリアライザで入れ子にされたオブジェクト)
  maker: MasterBase | null;
  label: MasterBase | null;
  series: MasterBase | null;
  director: MasterBase | null;
  actresses: MasterBase[];
  genres: MasterBase[];
  attributes: ProductAttribute[]; // 🏷️ 属性タグ

  // AI解析・評価
  ai_summary?: string;
  ai_content?: string;
  target_segment?: string;
  spec_score: number; // 総合点
  
  // 📊 5軸評価 (Radar Chart用)
  score_visual: number;
  score_story: number;
  score_cost: number;
  score_erotic: number;
  score_rarity: number;

  is_active: boolean;
  is_posted: boolean;
  updated_at: string;
}

/**
 * 📝 WordPress 投稿用型定義
 */
export interface WPPost {
  id: number;
  date: string;
  slug: string;
  status: string;
  type: string;
  link: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  featured_media: number;
  _embedded?: {
    'wp:featuredmedia'?: Array<{ source_url: string; alt_text: string }>;
    'wp:term'?: any[][];
  };
}
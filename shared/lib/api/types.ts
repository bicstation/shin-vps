/**
 * =====================================================================
 * 📋 統合型定義 (shared/lib/api/types.ts)
 * 🛡️ Maya's Logic: マルチドメイン・循環参照防止・AI対応版
 * =====================================================================
 */

/**
 * 📊 レーダーチャート用共通データ構造
 */
export interface RadarChartData {
  subject: string;   // 項目名 (例: "性能", "コスパ")
  value: number;     // スコア
  fullMark: number;  // 最大値 (通常 100)
}

/**
 * 🏷️ 共通マスターデータ (Maker, Label, Genre, Actress等)
 */
export interface MasterBase {
  id: number;
  name: string;
  slug?: string;
  api_source?: string; // DMM, FANZA, DUGA, etc.
}

/**
 * 📊 統計・カウント用
 */
export interface MakerCount {
  maker: string;
  count: number;
}

/**
 * 🏷️ 属性タグ (PCAttribute / AdultAttribute)
 */
export interface ProductAttribute extends MasterBase {
  attr_type: string;
  order: number;
}

/**
 * 💻 PC製品型定義 (BicStation等)
 */
export interface PCProduct {
  id: number;
  unique_id: string;
  site_prefix: string;
  maker: MasterBase | string; 
  name: string;
  price: number | null;
  image_url: string;
  affiliate_url: string;
  description?: string;
  
  // 🧠 AI生成・解析コンテンツ
  ai_content?: string;
  ai_summary?: string;
  target_segment?: string; 
  spec_score: number;      // 0-100 の総合評価
  
  // 📈 スコア詳細 (5軸レーダーチャート用)
  score_cpu?: number;
  score_gpu?: number;
  score_ai?: number;
  score_cost?: number;
  score_portable?: number;
  radar_chart?: RadarChartData[]; // ✅ 追加: コンポーネント用

  // ⚙️ ハードウェアスペック
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
 * 🔞 アダルト製品型定義 (AVFLASH, TIPER等)
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
  sample_movie_url: string | null; 

  // 🔗 リレーション
  maker: MasterBase | null;
  label: MasterBase | null;
  series: MasterBase | null;
  director: MasterBase | null;
  actresses: MasterBase[];
  genres: MasterBase[];
  attributes: ProductAttribute[];

  // 🧠 AI解析・評価
  ai_summary?: string;
  ai_content?: string;
  target_segment?: string;
  spec_score: number; 
  
  // 📊 5軸評価スコア
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
 * 📝 WordPress 投稿用型定義 (旧WP記事 / Bridge用)
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

/**
 * 📦 Django API 共通レスポンスラップ
 * ✅ これを追加することで bridge.ts や client.ts の戻り値を型安全に扱えます
 */
export interface DjangoApiResponse<T> {
  results: T[];
  count: number;
  _error?: string | number;
  _debug?: any;
}
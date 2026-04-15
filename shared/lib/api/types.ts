/**
 * =====================================================================
 * 📋 統合型定義 (shared/lib/api/types.ts)
 * 🛡️ Maya's Zenith v12.1: [TYPE_SAFE_HARDENING]
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
  id: string | number; // 🛡️ IDは数値・文字列どちらも許容
  name: string;
  slug?: string;
  api_source?: string; 
}

/**
 * 📊 統計・カウント用
 */
export interface MakerCount {
  maker: string;
  count: number;
}

/**
 * 🏷️ 属性タグ
 */
export interface ProductAttribute extends MasterBase {
  attr_type: string;
  order: number;
}

/**
 * 📰 統合投稿型定義 (UnifiedPost) ✅ v7.7 カテゴリ完全同期
 */
export interface UnifiedPost {
  id: string;             // 文字列化されたID
  slug: string;           
  title: string;
  image: string;          
  content: string;        
  summary?: string;       // 💡 要約プロパティを明示
  site: string;           
  is_adult: boolean;      
  content_type: string;   
  created_at: string;
  updated_at: string;
  
  // 🛡️ カテゴリ・ガード
  category: {
    id: string | number;
    name: string;
    slug: string;
  };

  // 🛡️ 著者情報
  author: string;
  
  // --- 以下、APIの生データ保持用 ---
  main_image_url?: string;
  extra_metadata?: any;
  images_json?: { url: string; type: string }[];
  videos_json?: any[];
  site_display?: string;
  content_type_display?: string;
  source_url?: string;
}

/**
 * 💻 PC製品型定義
 */
export interface PCProduct {
  id: string | number;     // 🛡️
  unique_id: string;
  site_prefix?: string;    // optional化
  maker: MasterBase | string; 
  name: string;
  price: number | null;
  image_url: string;
  affiliate_url: string;
  description?: string;
  
  ai_content?: string;
  ai_summary?: string;
  target_segment?: string; 
  spec_score: number;      
  
  score_cpu?: number;
  score_gpu?: number;
  score_ai?: number;
  score_cost?: number;
  score_portable?: number;
  radar_chart?: RadarChartData[]; 

  stock_status: 'instock' | 'outofstock' | 'preorder' | string; // 文字列許容
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
 */
export interface AdultProduct {
  id: string | number;     // 🛡️ APIによって混在するため
  product_id_unique: string;
  api_source: string;
  title: string;
  price: number | null;
  release_date: string | null;
  affiliate_url: string;
  image_url_list: string[];
  sample_movie_url: string | null; 

  is_adult: boolean;
  site: string;

  // 🔗 リレーション
  maker: MasterBase | null;
  label: MasterBase | null;
  series: MasterBase | null;
  director: MasterBase | null;
  actresses: MasterBase[];
  genres: MasterBase[];
  attributes: ProductAttribute[];

  ai_summary?: string;
  ai_content?: string;
  target_segment?: string;
  spec_score: number; 
  
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
 * 📦 Django API 共通レスポンスラップ
 */
export interface DjangoApiResponse<T> {
  results: T[];
  count: number;
  _error?: string | number;
  _debug?: any;
}
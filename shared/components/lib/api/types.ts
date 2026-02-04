/**
 * =====================================================================
 * 📋 統合型定義 (shared/lib/api/types.ts)
 * =====================================================================
 */

export interface RadarChartData {
    subject: string;
    value: number;
    fullMark: number;
}

export interface PCProduct {
    id: number;
    unique_id: string;
    site_prefix: string;
    maker: string;
    maker_name?: string;
    name: string;
    price: number;
    image_url: string;
    url: string;
    affiliate_url: string;
    description: string;
    ai_content: string;
    ai_summary?: string;
    stock_status: string;
    unified_genre: string;
    cpu_model?: string;
    gpu_model?: string;
    memory_gb?: number;
    storage_gb?: number;
    display_info?: string;
    spec_score?: number;
    radar_chart?: RadarChartData[];
}

export interface AdultProduct extends Omit<PCProduct, 'cpu_model' | 'gpu_model'> {
    actress?: string;
    label?: string;
}

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
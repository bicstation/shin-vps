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
    score_cpu?: number;
    score_gpu?: number;
    score_cost?: number;
    score_portable?: number;
    score_ai?: number;
}

export interface MakerCount {
    maker: string;
    count: number;
}
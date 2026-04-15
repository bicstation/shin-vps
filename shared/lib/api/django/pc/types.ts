// @ts-nocheck

export interface RadarChartData {
    subject: string;
    value: number;
    fullMark: number;
}

export interface PCProduct {
    // 🛡️ IDはAPIの仕様変更（UUID化など）に備えて string | number を推奨
    id: number | string;
    unique_id: string;
    site_prefix: string;
    
    // 🛡️ maker は文字列(ID)の場合とオブジェクトの場合があるため
    maker: any; 
    maker_name?: string;
    
    name: string;
    
    // 🛡️ 価格は null (オープン価格) を許容しないと runtime error の元です
    price: number | null; 
    
    image_url: string;
    url: string;           
    affiliate_url: string; 
    description: string;
    
    // 🛡️ AI系は生成待ちで空になることがあるため optional か空文字保証
    ai_content?: string;    
    ai_summary?: string;
    
    stock_status: string;
    unified_genre: string;
    
    // ⚙️ スペック詳細
    cpu_model?: string;
    gpu_model?: string;
    memory_gb?: number;
    storage_gb?: number;
    display_info?: string;
    
    // 📈 スコア系
    spec_score?: number;   
    radar_chart?: RadarChartData[]; 
    score_cpu?: number;
    score_gpu?: number;
    score_cost?: number;
    score_portable?: number;
    score_ai?: number;

    // 🛡️ 追加: デバッグ用
    _debug?: any;
}

export interface MakerCount {
    maker: string;
    count: number;
}
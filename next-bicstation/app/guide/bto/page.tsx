/**
 * =====================================================================
 * 🖥️ BICSTATION: BTO_DYNAMIC_GUIDE_V1.0
 * 🛡️ Maya's Logic: 物理構造 v3.2 完全同期版
 * =====================================================================
 */

import React from 'react';
import { headers } from 'next/headers';
import { fetchDjangoBridgeContent } from '@/shared/lib/api/django-bridge'; // 既存のブリッジを利用

// 型定義
interface BtoModel {
    id: string;
    rank_label: string; // "コスパ最強" など
    title: string;
    target_usage: string;
    cpu_spec: string;
    gpu_spec: string;
    price_start: string;
    analysis_point: string;
    recommend_vendor: string;
    theme_color: string; // border-blue-500 等のクラス名
}

/**
 * 🛠️ サーバーサイドデータ取得
 */
async function getBtoGuideData(host: string): Promise<BtoModel[]> {
    try {
        // Django側の 'bto-models' エンドポイントから取得
        // 実際には fetchDjangoBridgeContent('bto-models') のような形で呼び出し
        const response = await fetchDjangoBridgeContent('bto-guide', 0, { host });
        return response?.results || [];
    } catch (e) {
        console.error("🚨 BTO_GUIDE_FETCH_ERROR:", e);
        return []; // フォールバック
    }
}

export default async function BtoGuidePage() {
    const headerList = await headers();
    const host = headerList.get('host') || "bicstation.com";
    
    // DBからデータを抽出
    const btoModels = await getBtoGuideData(host);

    // 日付生成 (2026年4月度などの表示用)
    const now = new Date();
    const dateString = `${now.getFullYear()}年${now.getMonth() + 1}月度`;

    return (
        <div className="max-w-6xl mx-auto px-4 py-12 bg-white">
            <header className="text-center mb-16">
                <h1 className="text-4xl font-extrabold text-slate-900 mb-6 font-mono">
                    🖥️ BIC-STATION: BTO_INTEL_ARCHIVE
                </h1>
                <div className="inline-block bg-blue-900 text-blue-100 px-6 py-2 rounded-sm text-xs font-mono mb-6 tracking-tighter">
                    STATUS: ONLINE // {dateString}: LIVE_MARKET_DATA_SYNCED
                </div>
                <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
                    「最新＝正解」ではない。Bic StationのDBは、各パーツの性能スコアと実売価格をリアルタイム解析。<br />
                    **1円あたりの投資効率（ROI）が最も高い構成**を抽出しました。
                </p>
            </header>

            {/* メインカード・グリッド */}
            <div className="grid lg:grid-cols-3 gap-8">
                {btoModels.length > 0 ? (
                    btoModels.map((model) => (
                        <div key={model.id} className={`flex flex-col border-t-4 ${model.theme_color || 'border-slate-800'} bg-slate-50 rounded-lg overflow-hidden shadow-sm transition-all hover:shadow-xl hover:-translate-y-1`}>
                            <div className="p-6 bg-white border-b border-slate-100">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">{model.rank_label}</span>
                                <h3 className="text-xl font-bold text-slate-900 mt-1">{model.title}</h3>
                            </div>
                            
                            <div className="p-6 flex-grow">
                                <div className="space-y-4 text-sm">
                                    <div className="flex justify-between items-start">
                                        <span className="text-slate-400 font-mono text-[10px]">TARGET</span>
                                        <span className="font-bold text-slate-800 text-right w-2/3">{model.target_usage}</span>
                                    </div>
                                    <div className="flex justify-between border-t border-slate-200 pt-2">
                                        <span className="text-slate-400 font-mono text-[10px]">CPU</span>
                                        <span className="font-medium text-slate-700">{model.cpu_spec}</span>
                                    </div>
                                    <div className="flex justify-between border-t border-slate-200 pt-2">
                                        <span className="text-slate-400 font-mono text-[10px]">GPU</span>
                                        <span className="font-medium text-slate-700">{model.gpu_spec}</span>
                                    </div>
                                </div>

                                <div className="mt-8 p-4 bg-slate-900 rounded-sm">
                                    <p className="text-[10px] text-blue-400 font-mono mb-2">ANALYSIS_REPORT_01:</p>
                                    <p className="text-xs text-slate-300 leading-relaxed font-sans">{model.analysis_point}</p>
                                </div>
                            </div>

                            <div className="p-6 bg-white text-center">
                                <div className="mb-4">
                                    <span className="text-2xl font-black text-slate-900">{model.price_start}</span>
                                    <span className="text-[10px] text-slate-400 ml-1">tax incl.</span>
                                </div>
                                <p className="text-[10px] text-slate-400 mb-6">NODE: {model.recommend_vendor}</p>
                                <a 
                                    href={`/catalog?id=${model.id}`} 
                                    className="block w-full bg-blue-600 text-white py-3 rounded-sm font-mono text-xs hover:bg-blue-700 transition-colors uppercase tracking-widest"
                                >
                                    Access_Database
                                </a>
                            </div>
                        </div>
                    ))
                ) : (
                    // ローディングまたはデータなしのプレースホルダー
                    <div className="col-span-3 py-20 text-center font-mono text-slate-400 animate-pulse">
                        RETRIEVING_BTO_RECORDS...
                    </div>
                )}
            </div>

            {/* フッター */}
            <footer className="mt-20 text-center border-t border-slate-100 pt-12">
                <p className="text-slate-400 font-mono text-[10px] mb-8 uppercase tracking-widest">
                    Data integrity confirmed // Price fluctuations updated hourly
                </p>
                <div className="flex justify-center gap-8 text-[10px] font-mono">
                    <a href="/guide/parts" className="text-slate-500 hover:text-blue-600">← PARTS_ANALYSIS</a>
                    <a href="/guide/peripherals" className="text-slate-500 hover:text-blue-600">PERIPHERALS_DB →</a>
                </div>
            </footer>
        </div>
    );
}
/**
 * =====================================================================
 * ⚙️ BICSTATION: PARTS_STRATEGY_DYNAMIC_V1.0
 * 🛡️ Maya's Logic: リアルタイム・コスパ解析エンジンの実装
 * =====================================================================
 */

import React from 'react';
import { Database, Cpu, HardDrive, LayoutGrid, AlertTriangle, ArrowRight } from 'lucide-react';
import { fetchDjangoBridgeContent } from '@/shared/lib/api/django-bridge';

// 型定義：戦略的パーツ情報
interface PartStrategy {
    category: string;
    title: string;
    description: string;
    best_buy_model: string; // 例: "i5-13400"
    best_buy_score: string; // コスパスコア
    check_point: string;
    theme_color_hex: string;
    update_at: string;
}

/**
 * 🛠️ サーバーサイドでパーツ戦略データを抽出
 */
async function getPartsStrategy(): Promise<PartStrategy[]> {
    try {
        // Djangoの 'parts-strategy' エンドポイントから取得
        const response = await fetchDjangoBridgeContent('parts-strategy', 0);
        return response?.results || [];
    } catch (e) {
        console.error("🚨 PARTS_STRATEGY_FETCH_ERROR:", e);
        return [];
    }
}

export default async function PartsGuidePage() {
    const strategies = await getPartsStrategy();
    const updateDate = new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' });

    return (
        <div className="max-w-6xl mx-auto px-4 py-12 bg-[#f8fafc] min-h-screen font-sans">
            {/* 🛰️ システムヘッダー */}
            <header className="mb-12 relative overflow-hidden bg-slate-900 text-white p-10 rounded-2xl shadow-2xl">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4 text-blue-400 font-mono text-sm">
                        <Database size={16} />
                        <span>STRATEGIC_ARCHIVE_ACTIVE</span>
                    </div>
                    <h1 className="text-4xl font-black mb-4 tracking-tighter">
                        PARTS_STRATEGY：性能損益分岐点
                    </h1>
                    <p className="text-slate-400 max-w-2xl leading-relaxed">
                        「最安」は追わない。「最高効率」を追う。{updateDate}現在の市場データから、1円あたりの演算能力を最大化するパーツ構成を抽出。
                    </p>
                </div>
                {/* 装飾用背景 */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
            </header>

            {/* 戦略カード・リスト */}
            <div className="grid gap-8">
                {strategies.length > 0 ? (
                    strategies.map((item, index) => (
                        <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row transition-all hover:border-blue-300 hover:shadow-md">
                            {/* カテゴリ・インジケーター */}
                            <div className="md:w-1/4 p-8 flex flex-col justify-center items-center bg-slate-50 border-r border-slate-100">
                                <span className="text-[10px] font-mono font-bold text-slate-400 mb-2 uppercase tracking-[0.3em]">Sector</span>
                                <h2 className="text-4xl font-black text-slate-900 font-mono italic">
                                    {item.category === 'CPU' && <Cpu className="inline mr-2 mb-1" />}
                                    {item.category === 'SSD/RAM' && <HardDrive className="inline mr-2 mb-1" />}
                                    {item.category}
                                </h2>
                            </div>
                            
                            {/* 詳細情報 */}
                            <div className="md:w-3/4 p-8">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-bold text-slate-900">{item.title}</h3>
                                    <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded font-mono">ROI_SCORE: {item.best_buy_score}</span>
                                </div>
                                <p className="text-slate-500 text-sm mb-8 leading-relaxed italic">
                                    "{item.description}"
                                </p>
                                
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* 推奨パーツ */}
                                    <div className="bg-slate-900 text-white p-5 rounded-lg relative overflow-hidden group">
                                        <div className="relative z-10">
                                            <p className="text-[10px] text-blue-400 font-mono font-bold mb-2 uppercase tracking-widest">Bic's Best Buy</p>
                                            <p className="text-xl font-black tracking-tight">{item.best_buy_model}</p>
                                        </div>
                                        <Database className="absolute bottom-[-10px] right-[-10px] text-white/5 group-hover:text-blue-500/10 transition-colors" size={100} />
                                    </div>
                                    
                                    {/* 注意点 */}
                                    <div className="bg-amber-50 p-5 rounded-lg border border-amber-100 flex gap-4">
                                        <AlertTriangle className="text-amber-600 shrink-0" size={20} />
                                        <div>
                                            <p className="text-[10px] text-amber-700 font-bold mb-1 uppercase font-mono">Check Point</p>
                                            <p className="text-sm font-bold text-amber-900 leading-tight">{item.check_point}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 flex justify-end">
                                    <a href={`/catalog?cat=${item.category}`} className="group flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">
                                        VIEW_REALTIME_PRICE_DB 
                                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-20 text-center text-slate-400 font-mono animate-pulse">
                        ACCESSING_DATABASE...
                    </div>
                )}
            </div>

            {/* 再生術セクション (ここもDBから「Tips」として抽出可能) */}
            <section className="mt-20 relative">
                <div className="absolute inset-0 bg-blue-600/5 -skew-y-2 rounded-3xl"></div>
                <div className="relative p-12 text-center">
                    <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter">🛠 1万円の「PC延命アーカイブ」</h2>
                    <p className="text-slate-500 max-w-xl mx-auto text-sm mb-12">
                        買い換える前に。最小投資で最大のリターンを得る「BIC流リビルド」の推奨ログ。
                    </p>
                    <div className="grid md:grid-cols-2 gap-8 text-left">
                        {/* 実際にはここも map で回せます */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                            <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-lg">
                                <div className="w-2 h-6 bg-blue-600"></div> 起動・レスポンス改善
                            </h4>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Gen3からGen4、あるいはSATAからNVMeへの移行。OS起動速度の短縮は、最も体感的な「時間短縮」をもたらします。
                            </p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                            <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-lg">
                                <div className="w-2 h-6 bg-blue-600"></div> マルチタスクの物理拡張
                            </h4>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                8GBメモリの束縛から解放。DDR4/DDR5の増設は、ブラウザとアプリを並行させる現代のワークフローにおいて必須の投資です。
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
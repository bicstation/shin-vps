/**
 * =====================================================================
 * 🖱️ BICSTATION: PERIPHERALS_TRACKER_V1.0
 * 🛡️ Maya's Logic: 市場底値と連動した投資判断エンジンの実装
 * =====================================================================
 */

import React from 'react';
import { Monitor, MousePointer2, Link, TrendingDown, Clock, ChevronRight } from 'lucide-react';
import { fetchDjangoBridgeContent } from '@/shared/lib/api/django-bridge';

// 周辺機器グループの型
interface PeripheralGroup {
    category: string;
    title: string;
    description: string;
    strategy: string;
    theme_color: string;
    items: { label: string; name: string }[];
}

// 底値トラッカーの型
interface PriceTrackItem {
    id: string;
    name: string;
    current_price: number;
    target_price: number;
    status: 'HOT' | 'WAIT'; // 買い時か待ちか
    last_updated: string;
}

/**
 * 🛠️ データを一括取得（実際はDjangoのエンドポイントから）
 */
async function getPeripheralsData() {
    try {
        // 並列でデータを取得
        const [groups, tracker] = await Promise.all([
            fetchDjangoBridgeContent('peripheral-groups', 0),
            fetchDjangoBridgeContent('price-tracker', 0)
        ]);
        return { 
            groups: groups?.results || [], 
            tracker: tracker?.results || [] 
        };
    } catch (e) {
        console.error("🚨 PERIPHERALS_FETCH_ERROR:", e);
        return { groups: [], tracker: [] };
    }
}

export default async function PeripheralsGuidePage() {
    const { groups, tracker } = await getPeripheralsData();
    const now = new Date();

    return (
        <div className="max-w-6xl mx-auto px-4 py-12 bg-white min-h-screen font-sans">
            {/* 🛰️ システムヘッダー */}
            <header className="mb-16 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black tracking-widest mb-6">
                    <Clock size={12} />
                    <span>SYSTEM_SYNC: {now.toLocaleTimeString()}</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tighter">
                    PERIPHERALS：底値買い出しアーカイブ
                </h1>
                <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
                    「良い道具は、時間を生み出す投資である」<br />
                    Bic StationのDBが、主要ECサイトの価格推移から**「投資価値のある逸品」**を自動選別します。
                </p>
            </header>

            {/* 📋 カテゴリ別・投資戦略 */}
            <div className="grid md:grid-cols-3 gap-8 mb-24">
                {groups.map((group: PeripheralGroup, idx: number) => (
                    <div key={idx} className={`bg-[#fbfcfd] p-8 rounded-2xl border-t-4 ${group.theme_color} shadow-sm hover:shadow-xl transition-all group`}>
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{group.category}</span>
                            {group.category === 'Monitor' && <Monitor size={18} className="text-slate-300" />}
                            {group.category === 'Input' && <MousePointer2 size={18} className="text-slate-300" />}
                            {group.category === 'Connectivity' && <Link size={18} className="text-slate-300" />}
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors">{group.title}</h2>
                        <p className="text-sm text-slate-500 leading-relaxed mb-8 h-12 overflow-hidden">{group.description}</p>
                        
                        <div className="space-y-3 mb-8">
                            {group.items.map((item, i) => (
                                <div key={i} className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
                                    <span className="text-[10px] text-blue-500 font-bold block mb-1 uppercase italic">{item.label}</span>
                                    <span className="text-sm font-bold text-slate-800">{item.name}</span>
                                </div>
                            ))}
                        </div>

                        <div className="bg-slate-900 text-white p-5 rounded-xl text-[11px] leading-relaxed relative overflow-hidden">
                            <div className="relative z-10">
                                <span className="text-amber-400 font-black block mb-2 tracking-widest uppercase">Bic's Strategy</span>
                                {group.strategy}
                            </div>
                            <TrendingDown className="absolute right-[-10px] bottom-[-10px] text-white/5" size={60} />
                        </div>
                    </div>
                ))}
            </div>

            {/* 📉 リアルタイム底値トラッカー（DB直結） */}
            <section className="bg-slate-900 rounded-[2rem] p-8 md:p-16 text-white shadow-2xl relative overflow-hidden">
                {/* 装飾 */}
                <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.1),transparent)] pointer-events-none"></div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 relative z-10">
                    <div>
                        <h2 className="text-3xl font-black mb-2 flex items-center gap-3 italic">
                            <TrendingDown className="text-blue-400" />
                            REALTIME_PRICE_TRACKER
                        </h2>
                        <p className="text-slate-400 text-sm font-mono">
                            Monitoring: Amazon / Rakuten / Yahoo_Shopping / Kakaku_DB
                        </p>
                    </div>
                    <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-md text-[10px] font-mono text-blue-400">
                        LAST_INDEX_UPDATE: {now.toISOString().split('T')[0]}
                    </div>
                </div>

                <div className="overflow-x-auto relative z-10">
                    <table className="w-full text-left font-mono">
                        <thead>
                            <tr className="border-b border-white/10 text-slate-500 text-[10px] uppercase tracking-widest">
                                <th className="py-6 px-4">Item_Identity</th>
                                <th className="py-6 px-4 text-center">Market_Avg</th>
                                <th className="py-6 px-4 text-center">Target_ROI</th>
                                <th className="py-6 px-4 text-right">Decision</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {tracker.map((product: PriceTrackItem) => (
                                <tr key={product.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="py-6 px-4">
                                        <div className="font-bold text-white group-hover:text-blue-400 transition-colors">{product.name}</div>
                                        <div className="text-[10px] text-slate-500">ID: {product.id}</div>
                                    </td>
                                    <td className="py-6 px-4 text-center text-slate-400 italic">¥{product.current_price.toLocaleString()}</td>
                                    <td className="py-6 px-4 text-center font-bold text-blue-400">¥{product.target_price.toLocaleString()}</td>
                                    <td className="py-6 px-4 text-right">
                                        <span className={`px-4 py-1.5 rounded-sm text-[10px] font-black tracking-tighter ${
                                            product.status === 'HOT' 
                                            ? 'bg-blue-600 text-white animate-pulse' 
                                            : 'bg-slate-800 text-slate-500'
                                        }`}>
                                            {product.status === 'HOT' ? 'BUY_NOW' : 'HOLD_WAIT'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* 👣 ナビゲーション */}
            <div className="mt-20 flex justify-center gap-8">
                <a href="/" className="group flex items-center gap-2 font-mono text-xs font-bold text-slate-400 hover:text-slate-900 transition-all">
                    RETURN_TO_BASE
                </a>
            </div>
        </div>
    );
}
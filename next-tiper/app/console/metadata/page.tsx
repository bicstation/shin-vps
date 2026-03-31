"use client";

import React, { useState, Suspense } from 'react';
import { 
  BrainCircuit, Sparkles, Wand2, ArrowRight, 
  CheckCircle2, RefreshCw, Eye, Zap, MessageSquareQuote, ShieldCheck
} from 'lucide-react';

/**
 * 💡 AIリライト・同期 メインコンテンツ
 */
function AIMetaSyncContent() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [promptMode, setPromptMode] = useState('creative'); // creative, seo, professional

  // 🧪 リライトのシミュレーションデータ
  const [metaData, setMetaData] = useState({
    originalTitle: "高性能ゲーミングPC Z-1 Black Edition / Core i9 / RTX 4090",
    originalDesc: "最新のCPUとGPUを搭載したデスクトップPCです。非常に高い性能を持っており、ゲームや動画編集に最適です。黒いケースを採用しています。",
    aiTitle: "極限の没入感。究極のパワーを纏った、漆黒の覇者「Z-1 Black Edition」",
    aiDesc: "第14世代Core i9とRTX 4090が織りなす、異次元のパフォーマンス。あらゆるクリエイティビティを加速させ、勝利を確約するゲーミング・モンスター、ここに降臨。",
  });

  const handleSync = () => {
    setIsProcessing(true);
    // 擬似的なAI処理待ち
    setTimeout(() => setIsProcessing(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* 🚀 ヘッダーエリア */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-400 mb-2 font-black text-[10px] tracking-[0.3em] uppercase bg-purple-500/10 w-fit px-2 py-0.5 rounded">
            AI Cognitive <Sparkles size={10} /> Syncing
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase italic flex items-center gap-3">
            <BrainCircuit className="text-purple-500" /> AI Meta Sync
          </h1>
          <p className="text-slate-400 mt-1 text-sm font-medium">収集データの最適化とAIによるリライト生成</p>
        </div>
        
        <div className="flex gap-3">
          <select 
            value={promptMode}
            onChange={(e) => setPromptMode(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs font-bold text-slate-300 focus:outline-none focus:border-purple-500/50 appearance-none cursor-pointer hover:bg-slate-800 transition-colors"
          >
            <option value="creative">Creative Mode</option>
            <option value="seo">SEO Optimized</option>
            <option value="professional">Professional</option>
          </select>
          <button 
            onClick={handleSync}
            disabled={isProcessing}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900 px-6 py-3 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] text-xs text-white uppercase active:scale-95 disabled:scale-100"
          >
            {isProcessing ? <RefreshCw size={16} className="animate-spin" /> : <Wand2 size={16} />} 
            {isProcessing ? 'Processing...' : 'Run Global Sync'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 📥 Original Data (Raw) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <Eye size={16} className="text-slate-500" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Source Data (Raw)</span>
          </div>
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl space-y-6 opacity-60">
            <div>
              <label className="text-[9px] font-black text-slate-600 uppercase block mb-2">Original Title</label>
              <div className="bg-slate-950/50 rounded-xl p-4 text-sm text-slate-400 font-medium border border-slate-800/50">
                {metaData.originalTitle}
              </div>
            </div>
            <div>
              <label className="text-[9px] font-black text-slate-600 uppercase block mb-2">Original Description</label>
              <div className="bg-slate-950/50 rounded-xl p-4 text-sm text-slate-400 leading-relaxed border border-slate-800/50 min-h-[120px]">
                {metaData.originalDesc}
              </div>
            </div>
          </div>
        </div>

        {/* 📤 AI Optimized Data (Refined) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-purple-400" />
              <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">AI Generated (Optimized)</span>
            </div>
            <div className={`text-[9px] font-black px-2 py-0.5 rounded border border-purple-500/20 text-purple-400 bg-purple-500/5 animate-pulse ${isProcessing ? 'block' : 'hidden'}`}>
              GENERATING...
            </div>
          </div>
          <div className="bg-purple-900/5 border border-purple-500/20 p-6 rounded-3xl space-y-6 shadow-[0_0_40px_rgba(168,85,247,0.05)]">
            <div className="animate-in slide-in-from-right-4 duration-500">
              <label className="text-[9px] font-black text-purple-500 uppercase block mb-2 tracking-widest flex items-center gap-1">
                Optimized Title <CheckCircle2 size={10} />
              </label>
              <div className="bg-slate-950 border border-purple-500/30 rounded-xl p-4 text-sm text-white font-bold shadow-inner">
                {metaData.aiTitle}
              </div>
            </div>
            <div className="animate-in slide-in-from-right-8 duration-700">
              <label className="text-[9px] font-black text-purple-500 uppercase block mb-2 tracking-widest flex items-center gap-1">
                Optimized Description <CheckCircle2 size={10} />
              </label>
              <div className="bg-slate-950 border border-purple-500/30 rounded-xl p-4 text-sm text-slate-200 leading-relaxed shadow-inner min-h-[120px]">
                {metaData.aiDesc}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🧠 Prompt Configuration Panel */}
      <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
        <h3 className="text-lg font-black text-white italic uppercase flex items-center gap-3 mb-6 tracking-tight">
          <MessageSquareQuote className="text-purple-500" /> AI Prompt Strategy
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <PromptCard 
            icon={<Zap size={20} className="text-amber-400" />}
            title="Focus keywords"
            desc="SEOを意識し、検索ボリュームの多いキーワードを優先的に配置します。"
          />
          <PromptCard 
            icon={<Sparkles size={20} className="text-purple-400" />}
            title="Emotional Tone"
            desc="ユーザーの感情に訴えかける「刺さる」キャッチコピーを生成します。"
          />
          <PromptCard 
            icon={<ShieldCheck size={20} className="text-emerald-400" />}
            title="Clean Filter"
            desc="不適切な表現やプラットフォームの規約に触れるワードを自動で排除・置換します。"
          />
        </div>
      </div>
    </div>
  );
}

/**
 * 🎨 サポートコンポーネント: PromptCard
 */
function PromptCard({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="bg-slate-950/50 border border-slate-800/60 p-5 rounded-2xl hover:border-purple-500/30 transition-all group hover:bg-slate-900/50">
      <div className="mb-3 group-hover:scale-110 transition-transform">{icon}</div>
      <h4 className="text-xs font-black text-slate-200 uppercase tracking-widest mb-2">{title}</h4>
      <p className="text-xs text-slate-500 leading-relaxed font-medium">{desc}</p>
    </div>
  );
}

/**
 * ✅ ページエントリポイント
 * CSR Bailout 防止と、管理画面共通のローディングUXのための Suspense ラップ
 */
export default function AIMetaSync() {
  return (
    <Suspense fallback={
      <div className="flex flex-col justify-center items-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(168,85,247,0.4)]"></div>
        <p className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.3em] animate-pulse">Initializing AI Cognitive Engine...</p>
      </div>
    }>
      <AIMetaSyncContent />
    </Suspense>
  );
}
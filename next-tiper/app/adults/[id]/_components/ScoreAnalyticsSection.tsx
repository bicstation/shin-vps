/* ScoreAnalyticsSection.tsx */
import React from 'react';

export default function ScoreAnalyticsSection({ data }) {
  // 表示したい項目とラベルの定義
  const stats = [
    { label: 'VISUAL', score: data.score_visual, color: 'bg-blue-500' },
    { label: 'STORY', score: data.score_story, color: 'bg-purple-500' },
    { label: 'EROTIC', score: data.score_erotic, color: 'bg-pink-500' },
    { label: 'RARITY', score: data.score_rarity, color: 'bg-yellow-500' },
    { label: 'COST', score: data.score_cost_performance, color: 'bg-green-500' },
    { label: 'FETISH', score: data.score_fetish, color: 'bg-orange-500' },
  ];

  return (
    <section className="bg-slate-900 rounded-2xl p-6 md:p-8 shadow-xl border border-slate-700 my-8 font-mono">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-cyan-400 text-xs font-bold tracking-widest uppercase">
          Neural_Score_Breakdown
        </h3>
        <span className="text-slate-500 text-[10px]">VER: 3.27b_ANALYSIS</span>
      </div>

      <div className="space-y-5">
        {stats.map((stat, i) => (
          <div key={i} className="group">
            <div className="flex justify-between mb-1.5">
              <span className="text-slate-300 text-[10px] font-bold tracking-tighter">
                {stat.label}
              </span>
              <span className="text-cyan-400 text-[10px] font-bold">
                {stat.score}%
              </span>
            </div>
            
            {/* 棒グラフの土台 */}
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
              {/* スコアバー：アニメーション付き */}
              <div 
                className={`h-full ${stat.color} transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(0,0,0,0.5)]`}
                style={{ width: `${stat.score}%` }}
              >
                {/* バーの中の光沢エフェクト */}
                <div className="w-full h-full bg-white/10 skew-x-12 transform translate-x-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center">
        <div className="text-[9px] text-slate-500">
          TOTAL_SPEC_AVG
        </div>
        <div className="text-lg font-black text-white italic">
          {data.spec_score}<span className="text-xs ml-1 text-slate-400">pts</span>
        </div>
      </div>
    </section>
  );
}
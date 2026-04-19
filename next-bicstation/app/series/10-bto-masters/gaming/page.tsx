// /home/maya/shin-dev/shin-vps/next-bicstation/app/series/10-bto-masters/gaming/page.tsx

import React from 'react';
import Link from 'next/link';
import { 
  Cpu, 
  Layers, 
  Zap, 
  ShieldCheck, 
  ChevronRight, 
  Terminal, 
  LayoutGrid,
  Activity,
  Box
} from 'lucide-react';

// ✅ 共通シリーズ設定
import { BTO_SERIES_CONFIG } from '../data';

export default function BtoMastersIndexPage() {
  const config = BTO_SERIES_CONFIG.gaming;

  return (
    <div className="bg-black min-h-screen text-zinc-300 font-sans selection:bg-blue-600/40">
      {/* 🌌 背景演出 */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.05),transparent)]" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-24">
        
        {/* 📟 ヒーローセクション */}
        <header className="mb-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="px-3 py-1 bg-blue-600/10 border border-blue-500/30 rounded text-blue-500 text-[10px] font-mono font-bold tracking-widest uppercase">
              Project_BTO_Masters
            </div>
            <div className="h-px flex-1 bg-zinc-800" />
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tighter italic leading-none">
            GAMING<br />
            <span className="text-blue-600">ARCHIVE.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-zinc-500 max-w-2xl leading-relaxed font-light border-l-2 border-blue-600 pl-6">
            究極のゲーミングPCを構築するための全40ステップ。
            パーツ選定からオーバークロック、静音化、そして美学まで、
            Mayaが導く最強のBTO構築ロードマップ。
          </p>
        </header>

        {/* 🗺️ ロードマップ・グリッド */}
        <div className="grid grid-cols-1 gap-16">
          {config.phases.map((phase, phaseIndex) => {
            const Icon = [Cpu, Layers, Zap, ShieldCheck][phaseIndex] || Box;
            
            return (
              <section key={phaseIndex} className="relative">
                {/* フェーズヘッダー */}
                <div className="flex items-end gap-6 mb-10">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-blue-500 group">
                    <Icon size={32} className="group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono font-bold text-zinc-600 tracking-[0.4em] uppercase mb-1">
                      Phase_{String(phaseIndex + 1).padStart(2, '0')}
                    </div>
                    <h2 className="text-3xl font-black text-white tracking-tighter italic">
                      {phase.label}
                    </h2>
                  </div>
                </div>

                {/* 記事カードグリッド */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Array.from({ length: 10 }, (_, i) => {
                    const volNum = phase.volRange[0] + i;
                    return (
                      <Link 
                        key={volNum}
                        href={`/series/10-bto-masters/gaming/${volNum}`}
                        className="group relative aspect-square bg-zinc-900/30 border border-zinc-800 rounded-xl p-4 hover:border-blue-500/50 hover:bg-zinc-900/80 transition-all overflow-hidden"
                      >
                        {/* 背景の巻数番号 */}
                        <div className="absolute -right-2 -bottom-4 text-7xl font-black text-white/[0.03] italic group-hover:text-blue-500/5 transition-colors">
                          {volNum}
                        </div>

                        <div className="relative z-10 h-full flex flex-col justify-between">
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] font-mono font-bold text-zinc-600 group-hover:text-blue-500 transition-colors">
                              VOL.{volNum}
                            </span>
                            <Activity size={12} className="text-zinc-800 group-hover:text-blue-500/50 animate-pulse" />
                          </div>
                          
                          <div>
                            <div className="text-[11px] text-zinc-400 group-hover:text-white font-bold leading-tight line-clamp-2 mb-2">
                              {/* ここに各巻のタイトルを入れる場合はconfigを拡張してください */}
                              Operation_Node_{volNum}
                            </div>
                            <div className="flex items-center gap-1 text-[9px] font-mono text-zinc-600 uppercase">
                              Access <ChevronRight size={8} />
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        {/* 📟 ステータスフッター */}
        <footer className="mt-32 pt-16 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">System_Status</span>
              <span className="text-xs text-green-500 font-mono">ALL_NODES_ONLINE</span>
            </div>
            <div className="w-px h-8 bg-zinc-800" />
            <div className="flex flex-col">
              <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">Total_Volumes</span>
              <span className="text-xs text-white font-mono">40 / 40</span>
            </div>
          </div>

          <div className="text-[10px] font-mono text-zinc-700">
            &copy; 2024 NEXT-BICSTATION / ARCHIVE_DEPT.
          </div>
        </footer>

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}} />
    </div>
  );
}
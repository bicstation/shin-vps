// /home/maya/shin-vps/next-bicstation/app/series/10-bto-masters/trading/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { LineChart, BarChart3, Cpu, Crown, ChevronRight, Activity, Lock, Unlock, Zap, ShieldCheck } from 'lucide-react';
import { BTO_SERIES_CONFIG } from '../data';
import { TRADING_SERIES_DETAIL } from './data';
import styles from './trading.module.css';

export default function TradingSeriesIndexPage() {
  const config = BTO_SERIES_CONFIG.trading;
  const detail = TRADING_SERIES_DETAIL;
  
  // トレーディング向けアイコン：監視、分析、演算、支配
  const icons = [LineChart, BarChart3, Cpu, Crown];

  return (
    <div className={styles.container}>
      <div className={styles.bgWrapper}>
        <div className={styles.heroImage} />
        <div className={styles.overlay} />
        <div className={styles.scanline} />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-24 z-10">
        <header className="mb-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="px-3 py-1 bg-amber-600/10 border border-amber-500/30 rounded text-amber-500 text-[10px] font-mono font-bold tracking-[0.3em] uppercase">
              Module_Trading_Fortress
            </div>
            <div className="h-px flex-1 bg-zinc-800/50" />
          </div>
          
          <h1 className="text-6xl md:text-9xl font-black text-white mb-8 tracking-tighter italic leading-[0.8] uppercase">
            Trading<br /><span className="text-amber-500">Archive.</span>
          </h1>
          
          <div className="grid md:grid-cols-2 gap-12 mt-12 border-l-4 border-amber-600 pl-8 bg-amber-950/10 py-6">
            <p className="text-xl text-zinc-100 leading-relaxed font-bold italic">
              「{config.concept}」
            </p>
            <div className="flex flex-col justify-end items-start md:items-end gap-2 text-zinc-500 font-mono text-xs">
              <p>Network_Priority: <span className="text-zinc-300 uppercase tracking-widest">{config.priorityDevice}</span></p>
              <p>System_Core: <span className="text-amber-500 font-bold">MAYA_FINANCIAL_V3</span></p>
            </div>
          </div>
        </header>

        <div className="space-y-40">
          {config.phases.map((phase, phaseIndex) => {
            const Icon = icons[phaseIndex] || LineChart;
            return (
              <section key={phaseIndex}>
                <div className="flex items-center gap-6 mb-12 group">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-amber-900/30 flex items-center justify-center text-amber-500 group-hover:border-amber-500/50 transition-all shadow-lg shadow-amber-900/10">
                    <Icon size={32} />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-amber-600 tracking-[0.5em] uppercase">Phase_0{phaseIndex + 1}</span>
                    <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">{phase.label}</h2>
                    <p className="text-zinc-400 text-sm font-medium mt-1">Investment_Target: {phase.focus}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {detail.episodes
                    .filter(e => e.volume >= phase.volRange[0] && e.volume <= phase.volRange[1])
                    .map((episode) => (
                      <Link 
                        key={episode.volume} 
                        href={`/series/10-bto-masters/trading/${episode.slug}`} 
                        className={styles.card}
                      >
                        <div className={styles.volNumber}>{episode.volume}</div>
                        
                        <div className="relative z-10">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-mono font-bold text-amber-500/80 tracking-widest uppercase">Node_{episode.volume}</span>
                            {episode.isFurnitureUnlocked ? (
                              <Unlock size={12} className="text-amber-500/60" />
                            ) : (
                              <ShieldCheck size={12} className="text-zinc-700" />
                            )}
                          </div>
                          <h3 className={styles.title}>{episode.title.split(': ')[1]}</h3>
                        </div>

                        <div className="relative z-10">
                          <p className={styles.hint}>{episode.technicalHint}</p>
                          <div className="flex items-center justify-between mt-4 text-[9px] font-mono text-zinc-600 uppercase pt-2 border-t border-zinc-900">
                            <span className="flex items-center gap-1.5">
                              <Zap size={10} className="text-amber-500 animate-pulse" /> 
                              Stable
                            </span>
                            <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                        <div className={styles.accentBar} />
                      </Link>
                    ))}
                </div>
              </section>
            );
          })}
        </div>

        <footer className="mt-40 pt-16 border-t border-zinc-900/50 flex flex-col md:flex-row justify-between text-zinc-600 font-mono text-[10px]">
          <div className="flex gap-8 items-center">
            <p className="flex items-center gap-2">
              <Activity size={10} className="text-amber-500" /> 
              STATUS: TRADING_SYSTEM_STABLE
            </p>
            <p>UPTIME: 99.99%</p>
          </div>
          <p>© 2024 NEXT-BICSTATION // BTO_MASTERS_PROJECT</p>
        </footer>
      </div>
    </div>
  );
}
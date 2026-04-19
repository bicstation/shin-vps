// app/series/10-bto-masters/gaming/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { Cpu, Layers, Zap, ShieldCheck, ChevronRight, Activity, Box, Lock, Unlock } from 'lucide-react';
import { BTO_SERIES_CONFIG } from '../data';
import { GAMING_SERIES_DETAIL } from './data';
import styles from './gaming.module.css';

export default function BtoMastersIndexPage() {
  const config = BTO_SERIES_CONFIG.gaming;
  const detail = GAMING_SERIES_DETAIL;

  return (
    <div className={styles.container}>
      <div className={styles.bgEffects}>
        <div className={styles.scanline} />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-24">
        {/* 📟 Header */}
        <header className="mb-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="px-3 py-1 bg-blue-600/10 border border-blue-500/30 rounded text-blue-500 text-[10px] font-mono font-bold tracking-[0.3em] uppercase">
              Project_BTO_Masters_v3
            </div>
            <div className="h-px flex-1 bg-zinc-800/50" />
          </div>
          
          <h1 className="text-6xl md:text-9xl font-black text-white mb-8 tracking-tighter italic leading-[0.8] uppercase">
            Gaming<br /><span className="text-blue-600">Archive.</span>
          </h1>
          
          <div className="grid md:grid-cols-2 gap-12 mt-12 border-l-2 border-blue-600 pl-8">
            <p className="text-xl text-zinc-300 leading-relaxed font-medium">
              {config.concept}
            </p>
            <div className="flex flex-col justify-end items-start md:items-end gap-2 text-zinc-500 font-mono text-xs">
              <p>Priority: <span className="text-zinc-300 tracking-widest">{config.priorityDevice}</span></p>
              <p>System: <span className="text-blue-500">MAYA_BTO_LAB_V3</span></p>
            </div>
          </div>
        </header>

        {/* 🗺️ Roadmap */}
        <div className="space-y-32">
          {config.phases.map((phase, phaseIndex) => {
            const Icon = [ShieldCheck, Zap, Cpu, Layers][phaseIndex] || Box;
            
            return (
              <section key={phaseIndex}>
                <div className="flex items-center gap-6 mb-12">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-blue-500 shadow-lg shadow-blue-500/5">
                    <Icon size={32} />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-blue-500 tracking-[0.5em] uppercase">
                      Phase_0{phaseIndex + 1}
                    </span>
                    <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">
                      {phase.label}
                    </h2>
                    <p className="text-zinc-500 text-sm font-mono mt-1">Focus: {phase.focus}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {detail.episodes
                    .filter(e => e.volume >= phase.volRange[0] && e.volume <= phase.volRange[1])
                    .map((episode) => (
                      <Link 
                        key={episode.volume}
                        href={`/series/10-bto-masters/gaming/${episode.slug}`}
                        className={styles.card}
                      >
                        <div className={styles.volNumberBg}>{episode.volume}</div>

                        <div className="relative z-10">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-mono font-bold text-zinc-500 group-hover:text-blue-500">
                              VOL.{episode.volume}
                            </span>
                            {episode.isFurnitureUnlocked ? (
                              <Unlock size={12} className="text-amber-500/50" />
                            ) : (
                              <Lock size={12} className="text-zinc-800" />
                            )}
                          </div>
                          <h3 className={styles.episodeTitle}>
                            {episode.title.split(': ')[1]}
                          </h3>
                        </div>

                        <div className="relative z-10">
                          <p className={styles.techHint}>{episode.technicalHint}</p>
                          <div className="flex items-center justify-between mt-4 text-[9px] font-mono text-zinc-600 uppercase">
                            <span className="flex items-center gap-1">
                              <Activity size={10} className="text-blue-900 animate-pulse" />
                              Active
                            </span>
                            <ChevronRight size={12} />
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 transform scale-x-0 transition-transform origin-left group-hover:scale-x-100" />
                      </Link>
                    ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* 📟 Footer */}
        <footer className="mt-40 pt-16 border-t border-zinc-900 flex flex-col md:flex-row justify-between text-zinc-600 font-mono text-[10px]">
          <div className="flex gap-8">
            <p>STATUS: <span className="text-blue-500">ALL_NODES_READABLE</span></p>
            <p>PROGRESS: 40/40</p>
          </div>
          <p>© 2024 NEXT-BICSTATION ARCHIVE</p>
        </footer>
      </div>
    </div>
  );
}
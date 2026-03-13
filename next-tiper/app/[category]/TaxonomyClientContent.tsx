'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';

/**
 * 🏷️ TaxonomyClientContent
 * 🎨 機能: クライアントサイド・ソート、50音グループ化、クイックアクセス
 */
export default function TaxonomyClientContent({ initialData, category, totalCount }: any) {
  // ソート状態管理: 'kana' (50音), 'count_desc' (多い順), 'count_asc' (少ない順)
  const [sortBy, setSortBy] = useState<'kana' | 'count_desc' | 'count_asc'>('kana');

  // 1. ソート実行
  const sortedItems = useMemo(() => {
    const data = [...initialData];
    if (sortBy === 'count_desc') return data.sort((a, b) => (b.product_count || 0) - (a.product_count || 0));
    if (sortBy === 'count_asc') return data.sort((a, b) => (a.product_count || 0) - (b.product_count || 0));
    // デフォルト（50音）は初期データの順序（通常API側でソート済み）を維持
    return data;
  }, [initialData, sortBy]);

  // 2. 50音グループ化ロジック
  const groupedResults = useMemo(() => {
    const groups: Record<string, any[]> = {
      'あ': [], 'か': [], 'さ': [], 'た': [], 'な': [], 'は': [], 'ま': [], 'や': [], 'ら': [], 'わ': [], 'OTH': []
    };
    const kanaMap: Record<string, RegExp> = {
      'あ': /^[あ-おア-オ]/, 'か': /^[か-こカ-コ]/, 'さ': /^[さ-そサ-ソ]/, 'た': /^[た-とタ-ト]/,
      'な': /^[な-のナ-ノ]/, 'は': /^[は-ほハ-ホ]/, 'ま': /^[ま-もマ-モ]/, 'や': /^[や-よヤ-ヨ]/,
      'ら': /^[ら-ろラ-ロ]/, 'わ': /^[わ-んワ-ン]/,
    };

    sortedItems.forEach(item => {
      let matched = false;
      for (const [k, r] of Object.entries(kanaMap)) {
        if (r.test(item.name)) { 
          groups[k].push(item); 
          matched = true; 
          break; 
        }
      }
      if (!matched) groups['OTH'].push(item);
    });
    return groups;
  }, [sortedItems]);

  return (
    <div className="flex flex-col lg:flex-row gap-10">
      <main className="flex-1 min-w-0">
        {/* 📟 ヘッダーエリア */}
        <div className="mb-12">
          <h1 className="text-4xl lg:text-5xl font-black italic tracking-tighter text-gray-900 dark:text-white mb-2 uppercase">
            {category} <span className="text-pink-500 text-2xl not-italic ml-2 opacity-80">// REGISTRY</span>
          </h1>
          <div className="flex items-center gap-3">
            <span className="w-8 h-[1px] bg-pink-500"></span>
            <p className="text-gray-500 text-[10px] font-mono tracking-[0.3em] uppercase">
              Total {totalCount.toLocaleString()} entities synchronized.
            </p>
          </div>
        </div>

        {sortBy === 'kana' ? (
          <>
            {/* 📍 50音クイックアクセスバー (Sticky) */}
            <nav className="no-scrollbar overflow-x-auto flex gap-2 mb-12 py-4 sticky top-0 lg:top-4 z-30 backdrop-blur-md bg-white/10 dark:bg-black/10 rounded-2xl px-2 border border-white/10">
              {Object.keys(groupedResults).map(kana => groupedResults[kana].length > 0 && (
                <a 
                  key={kana} 
                  href={`#${kana}`} 
                  className="shrink-0 w-11 h-11 flex items-center justify-center text-sm font-black rounded-xl bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-white/5 shadow-sm hover:bg-pink-500 hover:text-white hover:shadow-[0_0_20px_rgba(236,72,153,0.4)] transition-all transform hover:-translate-y-1 active:scale-95"
                >
                  {kana}
                </a>
              ))}
            </nav>

            {/* 📑 グループ別リスト */}
            <div className="space-y-20">
              {Object.entries(groupedResults).map(([kana, items]) => items.length > 0 && (
                <section key={kana} id={kana} className="scroll-mt-24 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-center gap-6 mb-8">
                    <h2 className="text-7xl font-black text-gray-100 dark:text-white/5 leading-none select-none">{kana}</h2>
                    <div className="h-[2px] flex-1 bg-gradient-to-r from-pink-500/50 via-pink-500/5 to-transparent"></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {items.map((item: any) => (
                      <ItemCard key={item.id} item={item} category={category} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </>
        ) : (
          /* 📈 数値ソート時のフラット表示 */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {sortedItems.map((item: any) => (
              <ItemCard key={item.id} item={item} category={category} />
            ))}
          </div>
        )}
      </main>

      {/* ⚙️ サイドバー: 操作パネル */}
      <aside className="w-full lg:w-72 shrink-0">
        <div className="sticky top-24 space-y-4">
          <div className="bg-white dark:bg-[#0a0a12] border border-gray-100 dark:border-white/5 p-6 rounded-3xl shadow-2xl relative overflow-hidden group">
            {/* バックグラウンド装飾 */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-pink-500/10 blur-3xl rounded-full group-hover:bg-pink-500/20 transition-all duration-700"></div>
            
            <h3 className="text-[10px] font-black tracking-[0.25em] text-pink-500 uppercase mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-pulse"></span>
              Node Control Panel
            </h3>
            
            <div className="space-y-3">
              {[
                { id: 'kana', label: 'Alphabetical', icon: '🔤' },
                { id: 'count_desc', label: 'Popularity (Desc)', icon: '🔥' },
                { id: 'count_asc', label: 'Niche (Asc)', icon: '🧊' }
              ].map(opt => (
                <button 
                  key={opt.id} 
                  onClick={() => setSortBy(opt.id as any)}
                  className={`w-full group flex items-center gap-4 p-4 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all border ${
                    sortBy === opt.id 
                    ? 'bg-pink-500 text-white border-pink-500 shadow-xl shadow-pink-500/20 translate-x-1' 
                    : 'bg-gray-50 dark:bg-white/5 border-transparent hover:border-pink-500/30 text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <span className={`text-lg transition-transform duration-300 ${sortBy === opt.id ? 'scale-110' : 'group-hover:rotate-12'}`}>
                    {opt.icon}
                  </span>
                  {opt.label}
                </button>
              ))}
            </div>

            {/* ステータス情報 */}
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5">
              <div className="flex justify-between text-[9px] font-mono text-gray-400 uppercase">
                <span>Memory_Usage</span>
                <span className="text-pink-500">{(sortedItems.length * 0.12).toFixed(2)} KB</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

/**
 * 🃏 各タクソノミー（タグ・出演者等）のカード
 */
function ItemCard({ item, category }: any) {
  // slugが数値のみの場合や欠落している場合のフォールバック
  const linkPath = `/${category}/${item.slug || item.id}`;

  return (
    <Link 
      href={linkPath} 
      className="group flex items-center justify-between p-4 bg-white dark:bg-[#0d0d18] border border-gray-100 dark:border-white/5 rounded-2xl hover:border-pink-500/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgb(236,72,153,0.05)] transition-all duration-300"
    >
      <div className="flex flex-col min-w-0 pr-2">
        <span className="text-[13px] font-bold text-gray-800 dark:text-gray-200 truncate group-hover:text-pink-500 transition-colors">
          {item.name}
        </span>
      </div>
      <div className="shrink-0 flex items-center gap-2">
        <div className="px-2.5 py-1 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-white/5 text-[9px] font-black text-gray-400 group-hover:bg-pink-500 group-hover:text-white group-hover:border-pink-500 transition-all duration-300">
          {(item.product_count || 0).toLocaleString()}
        </div>
      </div>
    </Link>
  );
}
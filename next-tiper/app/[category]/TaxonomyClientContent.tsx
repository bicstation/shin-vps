'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';

export default function TaxonomyClientContent({ initialData, category, totalCount }: any) {
  const [sortBy, setSortBy] = useState<'kana' | 'count_desc' | 'count_asc'>('kana');

  const sortedItems = useMemo(() => {
    const data = [...initialData];
    if (sortBy === 'count_desc') return data.sort((a, b) => (b.product_count || 0) - (a.product_count || 0));
    if (sortBy === 'count_asc') return data.sort((a, b) => (a.product_count || 0) - (b.product_count || 0));
    return data;
  }, [initialData, sortBy]);

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
      let m = false;
      for (const [k, r] of Object.entries(kanaMap)) {
        if (r.test(item.name)) { groups[k].push(item); m = true; break; }
      }
      if (!m) groups['OTH'].push(item);
    });
    return groups;
  }, [sortedItems]);

  return (
    <div className="flex flex-col lg:flex-row gap-10">
      <main className="flex-1 min-w-0">
        {/* ヘッダーエリア */}
        <div className="mb-12">
          <h1 className="text-4xl font-black italic tracking-tighter text-gray-900 dark:text-white mb-2 uppercase">
            {category} <span className="text-pink-500 text-2xl not-italic ml-2">// Registry</span>
          </h1>
          <p className="text-gray-500 text-sm font-mono tracking-widest uppercase">
            Captured {totalCount.toLocaleString()} entities in high-fidelity database.
          </p>
        </div>

        {sortBy === 'kana' ? (
          <>
            {/* 50音クイックアクセス - ネオンデザイン */}
            <nav className="no-scrollbar overflow-x-auto flex gap-2 mb-12 p-2 sticky top-24 z-20 backdrop-blur-md">
              {Object.keys(groupedResults).map(kana => groupedResults[kana].length > 0 && (
                <a key={kana} href={`#${kana}`} 
                  className="shrink-0 w-12 h-12 flex items-center justify-center text-sm font-black rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-800 shadow-sm hover:bg-pink-500 hover:text-white hover:shadow-[0_0_15px_rgba(236,72,153,0.4)] transition-all">
                  {kana}
                </a>
              ))}
            </nav>

            <div className="space-y-20">
              {Object.entries(groupedResults).map(([kana, items]) => items.length > 0 && (
                <section key={kana} id={kana} className="scroll-section">
                  <div className="flex items-end gap-4 mb-8">
                    <h2 className="text-6xl font-black text-gray-200 dark:text-gray-800 leading-none">{kana}</h2>
                    <div className="h-[1px] flex-1 bg-gradient-to-r from-pink-500 to-transparent mb-2"></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {items.map((item: any) => <ItemCard key={item.id} item={item} category={category} />)}
                  </div>
                </section>
              ))}
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {sortedItems.map((item: any) => <ItemCard key={item.id} item={item} category={category} />)}
          </div>
        )}
      </main>

      {/* サイドバー: 操作パネル */}
      <aside className="w-full lg:w-72 shrink-0">
        <div className="sticky top-24 space-y-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-3xl shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 blur-3xl rounded-full"></div>
            <h3 className="text-[10px] font-black tracking-[0.2em] text-pink-500 uppercase mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></span>
              Sort Configuration
            </h3>
            
            <div className="space-y-2">
              {[
                { id: 'kana', label: 'Alphabetical', icon: '🔤' },
                { id: 'count_desc', label: 'Popularity (Desc)', icon: '🔥' },
                { id: 'count_asc', label: 'Niche (Asc)', icon: '🧊' }
              ].map(opt => (
                <button key={opt.id} onClick={() => setSortBy(opt.id as any)}
                  className={`w-full group flex items-center gap-3 p-4 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border ${
                    sortBy === opt.id 
                    ? 'bg-pink-500 text-white border-pink-500 shadow-lg shadow-pink-500/20' 
                    : 'bg-gray-50 dark:bg-gray-800/50 border-transparent hover:border-pink-500/50 text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}>
                  <span className="text-base">{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

function ItemCard({ item, category }: any) {
  return (
    <Link href={`/${category}/${item.slug || item.id}`} 
      className="group flex items-center justify-between p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl hover:border-pink-500 hover:shadow-lg hover:shadow-pink-500/5 transition-all">
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate group-hover:text-pink-500 transition-colors">
          {item.name}
        </span>
      </div>
      <div className="ml-4 px-3 py-1 bg-gray-50 dark:bg-gray-800 rounded-full border border-gray-100 dark:border-gray-700 text-[10px] font-black text-gray-400 group-hover:bg-pink-500 group-hover:text-white group-hover:border-pink-500 transition-all">
        {(item.product_count || 0).toLocaleString()}
      </div>
    </Link>
  );
}
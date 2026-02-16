'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import SectionHeader from '@/shared/common/SectionHeader';

/** 50音グループ化ロジック */
function groupItemsByKana(items: any[]) {
    const groups: Record<string, any[]> = {
        'あ': [], 'か': [], 'さ': [], 'た': [], 'な': [], 'は': [], 'ま': [], 'や': [], 'ら': [], 'わ': [], '英数/他': []
    };
    const kanaMap: Record<string, RegExp> = {
        'あ': /^[あ-おア-オ]/, 'か': /^[か-こカ-コ]/, 'さ': /^[さ-そサ-ソ]/, 'た': /^[た-とタ-ト]/,
        'な': /^[な-のナ-ノ]/, 'は': /^[は-ほハ-ホ]/, 'ま': /^[ま-もマ-モ]/, 'や': /^[や-よヤ-ヨ]/,
        'ら': /^[ら-ろラ-ロ]/, 'わ': /^[わ-んワ-ン]/,
    };
    items.forEach(item => {
        let matched = false;
        for (const [key, regex] of Object.entries(kanaMap)) {
            if (regex.test(item.name)) { groups[key].push(item); matched = true; break; }
        }
        if (!matched) groups['英数/他'].push(item);
    });
    return groups;
}

export default function TaxonomyClientContent({ initialData, category, totalCount }: any) {
    const [sortBy, setSortBy] = useState<'kana' | 'count'>('kana');

    // ソート処理
    const sortedItems = useMemo(() => {
        const data = [...initialData];
        return sortBy === 'count' ? data.sort((a, b) => b.product_count - a.product_count) : data;
    }, [initialData, sortBy]);

    const groupedResults = useMemo(() => groupItemsByKana(sortedItems), [sortedItems]);

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            {/* ─── メインコンテンツ (左側: order-1) ─── */}
            <main className="flex-1 min-w-0 order-1">
                <SectionHeader 
                    title={`${category.toUpperCase()} INDEX`} 
                    subTitle={`${totalCount.toLocaleString()}件のデータを${sortBy === 'kana' ? '50音順' : '作品数順'}で表示中`}
                />

                {sortBy === 'kana' ? (
                    <>
                        {/* 50音クイックナビ */}
                        <nav className="flex flex-wrap gap-2 mb-10 p-5 bg-white dark:bg-gray-900 rounded-2xl sticky top-20 z-10 shadow-lg border border-gray-100 dark:border-gray-800">
                            {Object.keys(groupedResults).map(kana => groupedResults[kana].length > 0 && (
                                <a key={kana} href={`#section-${kana}`} className="px-4 py-2 text-xs font-black bg-gray-50 dark:bg-gray-800 hover:bg-pink-500 hover:text-white rounded-lg transition-all">
                                    {kana}
                                </a>
                            ))}
                        </nav>
                        <div className="space-y-16">
                            {Object.entries(groupedResults).map(([kana, items]) => items.length > 0 && (
                                <section key={kana} id={`section-${kana}`} className="scroll-mt-40">
                                    <div className="flex items-center gap-4 mb-8">
                                        <h3 className="text-3xl font-black text-gray-900 dark:text-white">{kana}</h3>
                                        <div className="h-[2px] flex-1 bg-gradient-to-r from-pink-500/50 to-transparent"></div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                        {items.map((item: any) => <ItemCard key={item.id} item={item} category={category} />)}
                                    </div>
                                </section>
                            ))}
                        </div>
                    </>
                ) : (
                    /* カウント順フラット表示 */
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                        {sortedItems.map((item: any) => <ItemCard key={item.id} item={item} category={category} />)}
                    </div>
                )}
            </main>

            {/* ─── サイドバー (右側: order-2) ─── */}
            <aside className="w-full lg:w-80 shrink-0 order-2">
                <div className="sticky top-20 space-y-6">
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl">
                        <h4 className="text-xs font-black text-pink-500 mb-6 tracking-widest uppercase italic">Display Settings</h4>
                        <div className="space-y-3">
                            <button onClick={() => setSortBy('kana')} className={`w-full p-4 rounded-xl text-left text-sm font-bold transition-all border ${sortBy === 'kana' ? 'bg-pink-500 text-white border-pink-500 shadow-lg shadow-pink-500/30' : 'bg-transparent border-gray-100 dark:border-gray-800 hover:border-pink-500'}`}>
                                🔤 あいうえお順 (Index)
                            </button>
                            <button onClick={() => setSortBy('count')} className={`w-full p-4 rounded-xl text-left text-sm font-bold transition-all border ${sortBy === 'count' ? 'bg-pink-500 text-white border-pink-500 shadow-lg shadow-pink-500/30' : 'bg-transparent border-gray-100 dark:border-gray-800 hover:border-pink-500'}`}>
                                🔥 作品数が多い順 (Rank)
                            </button>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    );
}

function ItemCard({ item, category }: any) {
    return (
        <Link href={`/${category}/${encodeURIComponent(item.slug)}`} className="group flex items-center justify-between p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl hover:ring-2 hover:ring-pink-500/30 hover:border-pink-500 transition-all shadow-sm">
            <span className="text-sm font-bold truncate group-hover:text-pink-600 dark:group-hover:text-pink-400">{item.name}</span>
            <span className="text-[10px] font-mono font-bold bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-500 group-hover:bg-pink-500 group-hover:text-white">{item.product_count}</span>
        </Link>
    );
}
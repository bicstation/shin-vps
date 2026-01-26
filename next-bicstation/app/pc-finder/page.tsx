"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

/**
 * =====================================================================
 * 💻 PC-FINDER ページコンポーネント
 * Djangoバックエンド + Next.js Route Handler 中継方式
 * =====================================================================
 */

export default function PCFinderPage() {
  // 🚀 状態管理：データベースから取得した製品リスト
  const [products, setProducts] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // 検索条件の状態管理
  const [filters, setFilters] = useState({
    budget: 300000,
    type: 'all',
    brand: 'all',
    size: 'all',
    ram: 0,
    npuRequired: false,
    gpuRequired: false,
  });

  // ソート状態の管理
  const [sortBy, setSortBy] = useState('newest');

  // 🚀 データベース連携：APIからデータを取得する関数
  const fetchProductsFromDatabase = useCallback(async () => {
    setIsLoading(true);
    try {
      // クエリパラメータの構築（Next.jsのRoute Handler経由でDjangoを叩く）
      const query = new URLSearchParams({
        budget: filters.budget.toString(),
        type: filters.type,
        brand: filters.brand,
        size: filters.size,
        ram: filters.ram.toString(),
        npu: filters.npuRequired.toString(),
        gpu: filters.gpuRequired.toString(),
        sort: sortBy, // Django側での ordering に対応
      });

      // ✅ /api/products (Route Handler) へリクエストを送信
      const response = await fetch(`/api/products?${query.toString()}`);
      if (!response.ok) throw new Error('Network response was not ok');
      
      const data = await response.json();
      
      // Route Handler の返却形式 { success: true, products: [], totalCount: X } に合わせる
      if (data.success) {
        setProducts(data.products || []);
        setTotalCount(data.totalCount || 0);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters, sortBy]);

  // 🚀 フィルタやソートが変更されたらデータを再取得
  useEffect(() => {
    fetchProductsFromDatabase();
  }, [fetchProductsFromDatabase]);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 md:px-6 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        
        {/* ヘッダーセクション */}
        <header className="mb-12 text-center">
          <div className="inline-block bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full mb-4 tracking-[0.2em]">BICSTATION LIVE DATABASE</div>
          <h1 className="text-5xl font-black mb-4 tracking-tighter italic uppercase">PC-FINDER</h1>
          <p className="text-slate-500 font-medium">Django データベース直結。AI解析スコアと価格をリアルタイム反映。</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* 左側：検索フィルターフォーム */}
          <aside className="lg:col-span-1 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 h-fit lg:sticky lg:top-8 max-h-[90vh] overflow-y-auto overflow-x-hidden">
            <div className="space-y-10">
              
              <section>
                <label className="text-[10px] font-black text-slate-400 block mb-6 uppercase tracking-widest">01. Budget (Max)</label>
                <input 
                  type="range" min="50000" max="500000" step="10000" 
                  value={filters.budget} 
                  onChange={(e) => setFilters({...filters, budget: Number(e.target.value)})}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="mt-4 flex justify-between items-baseline">
                  <span className="text-xs text-slate-400 font-bold">~ ¥{filters.budget.toLocaleString()}</span>
                  <span className="text-2xl font-black text-blue-600 tracking-tighter">¥{filters.budget >= 500000 ? "500,000+" : filters.budget.toLocaleString()}</span>
                </div>
              </section>

              <section>
                <label className="text-[10px] font-black text-slate-400 block mb-4 uppercase tracking-widest">02. Form Factor</label>
                <div className="grid grid-cols-3 gap-2">
                  {['all', 'laptop', 'desktop'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setFilters({...filters, type: t})}
                      className={`py-2 rounded-xl text-[11px] font-black transition-all border-2 ${filters.type === t ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                    >
                      {t === 'all' ? '全て' : t === 'laptop' ? 'ノート' : 'デスクトップ'}
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <label className="text-[10px] font-black text-slate-400 block mb-4 uppercase tracking-widest">03. Manufacturer</label>
                <select 
                  value={filters.brand}
                  onChange={(e) => setFilters({...filters, brand: e.target.value})}
                  className="w-full bg-slate-50 border-none p-4 rounded-2xl text-xs font-black text-slate-700 outline-none ring-2 ring-transparent focus:ring-blue-600 transition-all appearance-none"
                >
                  <option value="all">全てのブランド</option>
                  <option value="lenovo">Lenovo</option>
                  <option value="dell">DELL</option>
                  <option value="hp">HP</option>
                  <option value="apple">Apple</option>
                  <option value="mouse">Mouse (日本)</option>
                  <option value="asus">ASUS</option>
                </select>
              </section>

              <section>
                <label className="text-[10px] font-black text-slate-400 block mb-4 uppercase tracking-widest">04. Display Size</label>
                <div className="flex flex-wrap gap-2">
                  {['all', '13', '14', '15-16'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setFilters({...filters, size: s})}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${filters.size === s ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                    >
                      {s === 'all' ? '全て' : `${s}型`}
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <label className="text-[10px] font-black text-slate-400 block mb-4 uppercase tracking-widest">05. Memory (Min)</label>
                <div className="flex gap-2">
                  {[0, 16, 32].map((r) => (
                    <button
                      key={r}
                      onClick={() => setFilters({...filters, ram: r})}
                      className={`flex-1 py-2 rounded-xl text-[11px] font-black transition-all border-2 ${filters.ram === r ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-100 text-slate-400'}`}
                    >
                      {r === 0 ? '不問' : `${r}GB+`}
                    </button>
                  ))}
                </div>
              </section>

              <section className="pt-6 border-t border-slate-100 space-y-3">
                <label className="flex items-center group cursor-pointer">
                  <input type="checkbox" className="w-5 h-5 rounded-lg border-2 border-slate-200 accent-blue-600 mr-3" checked={filters.npuRequired} onChange={(e) => setFilters({...filters, npuRequired: e.target.checked})} />
                  <span className="text-[11px] font-black text-slate-600 group-hover:text-blue-600 transition-colors uppercase tracking-tight">AI PC (NPU 搭載)</span>
                </label>
                <label className="flex items-center group cursor-pointer">
                  <input type="checkbox" className="w-5 h-5 rounded-lg border-2 border-slate-200 accent-blue-600 mr-3" checked={filters.gpuRequired} onChange={(e) => setFilters({...filters, gpuRequired: e.target.checked})} />
                  <span className="text-[11px] font-black text-slate-600 group-hover:text-blue-600 transition-colors uppercase tracking-tight">独立GPU (RTX等) 搭載</span>
                </label>
              </section>
            </div>
          </aside>

          {/* 右側：検索結果表示 */}
          <main className="lg:col-span-3">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 px-4">
              <div>
                <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Search Results</div>
                <div className="text-sm font-black text-slate-900">
                  <span className="text-blue-600">{totalCount}</span> Products Found
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sort By:</span>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white border border-slate-200 rounded-full px-4 py-2 text-[11px] font-black text-slate-700 outline-none shadow-sm focus:border-blue-600 cursor-pointer transition-all"
                >
                  <option value="newest">発売日が新しい順</option>
                  <option value="price_asc">価格が安い順</option>
                  <option value="price_desc">価格が高い順</option>
                  <option value="spec_score">スペック評価が高い順</option>
                </select>
              </div>
            </div>

            {/* ロード中の表示 */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-slate-200 h-64 rounded-[2.5rem]"></div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {products.map(product => (
                  <div key={product.unique_id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 hover:border-blue-500 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
                    
                    <Link href={`/product/${product.unique_id}`} className="block mb-6">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">{product.maker_name || product.maker}</span>
                          <h3 className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-tight line-clamp-2">{product.name}</h3>
                          {product.spec_score && (
                            <div className="mt-2 flex items-center gap-2">
                              <span className="text-[9px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-black italic">AI SCORE: {product.spec_score}</span>
                            </div>
                          )}
                        </div>
                        <div className={`text-[10px] font-black px-3 py-1 rounded-full ${product.unified_genre === 'laptop' ? 'bg-orange-50 text-orange-600' : 'bg-purple-50 text-purple-600'}`}>
                          {(product.unified_genre || 'PC').toUpperCase()}
                        </div>
                      </div>
                    </Link>

                    <div className="flex flex-wrap gap-2 mb-8">
                      {product.cpu_model && <span className="bg-slate-50 text-slate-500 px-3 py-1.5 rounded-xl text-[10px] font-black border border-slate-100">{product.cpu_model}</span>}
                      {product.memory_gb && <span className="bg-slate-50 text-slate-500 px-3 py-1.5 rounded-xl text-[10px] font-black border border-slate-100">{product.memory_gb}GB RAM</span>}
                      {product.storage_gb && <span className="bg-slate-50 text-slate-500 px-3 py-1.5 rounded-xl text-[10px] font-black border border-slate-100">{product.storage_gb}GB SSD</span>}
                      {product.is_ai_pc && <span className="bg-emerald-500 text-white px-3 py-1.5 rounded-xl text-[10px] font-black animate-pulse shadow-lg shadow-emerald-200">AI / NPU READY</span>}
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                      <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase mb-1">Market Price</div>
                        <div className="text-3xl font-black text-slate-900 tracking-tighter">
                          {product.price ? `¥${product.price.toLocaleString()}` : '価格情報なし'}
                        </div>
                      </div>
                      <Link 
                        href={`/product/${product.unique_id}`}
                        className="bg-slate-900 text-white w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-blue-600 transition-all hover:rotate-90 shadow-lg"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-slate-200">
                <div className="text-5xl mb-6">🔍</div>
                <h3 className="text-xl font-black text-slate-900 mb-2">条件に一致する製品が見つかりませんでした</h3>
                <p className="text-slate-400 text-sm font-medium">予算を上げるか、ブランドを「全てのブランド」にしてみてください。</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
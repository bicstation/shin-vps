/* eslint-disable react/no-unescaped-entities */
/**
 * 📂 app/[category]/page.tsx
 * 🛡️ Tiper v3.2 物理構造 [STRUCTURE] 同期版
 * カテゴリ一覧（Index）ページ
 */

import React from 'react';
import { notFound } from 'next/navigation'; 
import { Metadata } from 'next';

// ✅ 修正: 物理構造に基づいたインポートパス
import TaxonomyClientContent from './TaxonomyClientContent';
import Sidebar from '@/shared/layout/Sidebar/AdultSidebar'; 
import SystemDiagnosticHero from '@/shared/components/molecules/SystemDiagnosticHero';

// ✅ 修正: WordPressを廃止し、Django Bridge / Unified APIへ統合
import { getDjangoPosts } from '@/shared/lib/api/django-bridge';
import { 
  fetchMakers, fetchGenres, fetchActresses, fetchSeries,
  fetchDirectors, fetchAuthors, fetchLabels
} from '@/shared/lib/api/django/adult';

/**
 * =============================================================================
 * ⚙️ サーバーセクション (Configuration)
 * =============================================================================
 */
export const dynamic = 'force-dynamic';

// 📂 カテゴリに応じた取得関数のマッピング
const API_MAP: Record<string, any> = {
  'genres': fetchGenres,
  'makers': fetchMakers,
  'actresses': fetchActresses,
  'series': fetchSeries,
  'directors': fetchDirectors,
  'authors': fetchAuthors,
  'labels': fetchLabels,
};

interface PageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ debug?: string }>;
}

/**
 * 💡 SEO メタデータ生成
 */
export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { category } = await props.params;
  const title = category.charAt(0).toUpperCase() + category.slice(1);
  
  return {
    title: `${title} 一覧 | TIPER - 次世代エンタメ・アーカイブ`,
    description: `${title}の全項目を一覧表示。最新のデータに基づいた詳細なアーカイブにアクセス。`,
  };
}

/**
 * 💡 メインページコンポーネント (Index)
 */
export default async function CategoryIndexPage(props: PageProps) {
  // 1. Next.js 15 非同期 Props の解決
  const { category } = await props.params;
  const searchParams = await props.searchParams;
  
  const isDebugMode = searchParams.debug === 'true';
  const fetchFn = API_MAP[category];
  
  // マッピングにないカテゴリは404
  if (!fetchFn) return notFound();

  // 2. 📡 データの並列取得 (Django Bridge経由)
  // getSiteMainPosts を getDjangoPosts に差し替え
  const [listRes, genresRes, makersRes, actressesRes, postsRes] = await Promise.all([
    fetchFn({ limit: 1000 }).catch(() => ({ results: [], count: 0 })),
    fetchGenres({ limit: 10 }).catch(() => ({ results: [] })),
    fetchMakers({ limit: 10 }).catch(() => ({ results: [] })),
    fetchActresses({ limit: 10 }).catch(() => ({ results: [] })),
    getDjangoPosts({ limit: 5 }).catch(() => ({ results: [] })),
  ]);

  const items = Array.isArray(listRes) ? listRes : (listRes?.results || []);
  const totalCount = listRes?.count || items.length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#05050a] transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        
        {/* 📟 デバッグモード時のみ表示 (System Analysis) */}
        {isDebugMode && (
          <div className="mb-8">
            <SystemDiagnosticHero 
              status="ACTIVE" 
              moduleName={`INDEX_EXPLORER: ${category.toUpperCase()}`} 
            />
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* ─── サイドバー (左側) ─── */}
          <aside className="w-full lg:w-80 shrink-0 order-2 lg:order-1">
            <div className="lg:sticky lg:top-24 space-y-8">
              
              {/* セクターインジケーター (現在のノード情報) */}
              <div className="px-6 py-5 bg-white dark:bg-[#0a0a12] rounded-2xl border-l-4 border-pink-500 shadow-sm border border-gray-100 dark:border-white/5">
                <p className="text-[10px] font-mono text-pink-500 uppercase tracking-[0.3em] mb-1 animate-pulse">
                  System Sector
                </p>
                <h2 className="text-2xl font-black dark:text-white uppercase tracking-tighter">
                  {category}
                </h2>
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-white/10 flex justify-between items-center">
                  <span className="text-[9px] font-mono text-gray-400 uppercase">Nodes Discovered:</span>
                  <span className="text-sm font-mono font-bold text-pink-500">{totalCount.toLocaleString()}</span>
                </div>
              </div>

              <Sidebar 
                genres={genresRes.results || []} 
                makers={makersRes.results || []}
                actresses={actressesRes.results || []}
                recentPosts={(postsRes?.results || []).map((p: any) => ({ 
                  id: String(p.id), 
                  title: p.title || 'Untitled', 
                  slug: p.slug 
                }))}
              />
            </div>
          </aside>

          {/* ─── メインコンテンツ (右側) ─── */}
          <main className="flex-1 min-w-0 order-1 lg:order-2">
            <div className="relative group">
              {/* 装飾用ネオン背景 */}
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-500/20 to-cyan-500/20 rounded-[2rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
              
              <div className="relative bg-white/70 dark:bg-[#0a0a12]/80 rounded-[1.8rem] p-4 lg:p-8 backdrop-blur-xl border border-white/20 dark:border-white/5 shadow-2xl">
                <TaxonomyClientContent 
                  initialData={items} 
                  category={category} 
                  totalCount={totalCount} 
                />
              </div>
            </div>

            {/* フッターデバッグ情報 (Terminal View) */}
            {isDebugMode && (
              <div className="mt-6 p-4 rounded-xl bg-black/40 border border-green-500/30 font-mono text-[10px] text-green-500 overflow-hidden">
                <p className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-green-500 rounded-full animate-ping"></span>
                  {`> DATA_STREAM_READY: ${items.length} units loaded into virtual DOM.`}
                </p>
                <p>{`> CATEGORY_MAP: ${category.toUpperCase()} -> API_MAP HIT`}</p>
                <p>{`> CACHE_STATUS: STANDBY`}</p>
                <p>{`> BRIDGE_TYPE: DJANGO_UNIFIED_API`}</p>
              </div>
            )}
          </main>

        </div>
      </div>
    </div>
  );
}
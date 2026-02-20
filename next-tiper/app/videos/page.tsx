/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import { Metadata } from 'next';

// スタイル & 共通コンポーネント
import styles from './videos.module.css';
import ProductCard from '@/shared/cards/AdultProductCard';
import Sidebar from '@/shared/layout/Sidebar/AdultSidebar'; 
import Pagination from '@/shared/common/Pagination';
import SystemDiagnosticHero from '@/shared/debug/SystemDiagnosticHero';

// API関数 (Django & WordPress)
import { getSiteMainPosts } from '@/shared/lib/api/wordpress';
import { 
  getUnifiedProducts, 
  fetchMakers, 
  fetchGenres, 
  fetchActresses, 
  fetchSeries,
  fetchDirectors,
  fetchAuthors, 
  fetchLabels
} from '@/shared/lib/api/django/adult';

// 型定義
import { AdultProduct } from '@/shared/lib/api/types';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

/**
 * 💡 メタデータ設定
 */
export const metadata: Metadata = {
  title: 'VIDEO_ARCHIVE | SYSTEM_CORE',
  description: '統合ビデオレジストリ - 全データの横断検索アーカイブ',
};

/**
 * 🎬 ビデオ一覧ページコンポーネント
 */
export default async function VideosPage(props: { 
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> 
}) {
  const searchParams = await props.searchParams;
  
  // --- 1. パラメータの解析 (URLから現在の状態を取得) ---
  const currentPage = Number(searchParams.page) || 1;
  const currentMaker = typeof searchParams.maker === 'string' ? searchParams.maker : undefined;
  const currentGenre = typeof searchParams.genre === 'string' ? searchParams.genre : undefined;
  const currentApiSource = typeof searchParams.api_source === 'string' ? searchParams.api_source : undefined;
  const currentSearch = typeof searchParams.q === 'string' ? searchParams.q : undefined;

  // --- 2. データ取得 (並列実行でパフォーマンスを最大化) ---
  const pageSize = 24; 
  
  const [
    productRes,
    wpData, 
    genresRes, 
    makersRes, 
    actressesRes,
    seriesRes,
    directorsRes,
    authorsRes, 
    labelsRes
  ] = await Promise.all([
    // メインのアーカイブデータ
    getUnifiedProducts({ 
      page: currentPage, 
      limit: pageSize,
      maker: currentMaker,
      genre: currentGenre,
      api_source: currentApiSource,
      q: currentSearch,
      ordering: '-release_date'
    }).catch(() => ({ results: [], count: 0 })),
    
    // サイドバー用の共通データ取得 (トップページと同一)
    getSiteMainPosts(0, 5).catch(() => ({ results: [] })),
    fetchGenres({ limit: 15 }).catch(() => ({ results: [] })),
    fetchMakers({ limit: 15 }).catch(() => ({ results: [] })),
    fetchActresses({ limit: 15 }).catch(() => ({ results: [] })),
    fetchSeries({ limit: 15 }).catch(() => ({ results: [] })),
    fetchDirectors({ limit: 15 }).catch(() => ({ results: [] })),
    fetchAuthors({ limit: 15 }).catch(() => ({ results: [] })), 
    fetchLabels({ limit: 15 }).catch(() => ({ results: [] })),
  ]);

  const items = (productRes?.results || []) as AdultProduct[];
  const totalCount = productRes?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // --- 3. サイドバーPropsの構築 (トップページとロジックを完全一致) ---
  const sidebarProps = {
    genres: genresRes?.results || [],
    makers: makersRes?.results || [],
    actresses: actressesRes?.results || [],
    series: seriesRes?.results || [],
    directors: directorsRes?.results || [],
    authors: authorsRes?.results || [], 
    labels: labelsRes?.results || [],   
    recentPosts: (wpData?.results || []).map((p: any) => ({
      id: p.id.toString(),
      title: p.title?.rendered || '',
      slug: p.slug
    }))
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.wrapper}>
        
        {/* 🏛️ 1. サイドバーエリア (共通のレイアウト設定を適用) */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarSticky}>
            <Sidebar {...sidebarProps} />
          </div>
        </aside>

        {/* 🏗️ 2. コンテンツメインストリーム */}
        <main className={styles.contentStream}>
          
          {/* 📊 システムステータス診断 (現在のクエリ状態を可視化) */}
          <section className={styles.debugSection}>
            <SystemDiagnosticHero 
              status="ACTIVE" 
              moduleName="VIDEO_ARCHIVE_REGISTRY" 
              latency="14ms"
              rawJson={{ 
                current_page: currentPage, 
                total_records: totalCount,
                active_filters: { 
                  maker: currentMaker || "ALL", 
                  genre: currentGenre || "ALL",
                  source: currentApiSource || "UNIFIED"
                }
              }} 
            />
          </section>

          {/* 📀 作品アーカイブセクション */}
          <section className={styles.archiveSection}>
            <div className={styles.sectionHeader}>
              <h1 className={styles.mainTitle}>
                <span className={styles.titleThin}>REGISTRY //</span> VIDEO_DATABASE
              </h1>
              <div className={styles.resultCount}>
                TOTAL_RECORDS: <span className={styles.countNumber}>{totalCount.toLocaleString()}</span>
              </div>
            </div>

            {items.length > 0 ? (
              <div className={styles.videoGrid}>
                {items.map((product: AdultProduct) => (
                  <ProductCard key={`${product.api_source}-${product.id}`} product={product} />
                ))}
              </div>
            ) : (
              <div className={styles.emptyArea}>
                <div className={styles.glitchText}>NO_DATA_STREAM_FOUND_IN_REGISTRY</div>
              </div>
            )}
          </section>

          {/* 📑 3. ページネーション (提供いただいたロジックを反映) */}
          {totalPages > 1 && (
            <footer className={styles.paginationFooter}>
              <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages}
                baseUrl="/videos"
                query={{
                    maker: currentMaker,
                    genre: currentGenre,
                    api_source: currentApiSource,
                    q: currentSearch
                }}
              />
            </footer>
          )}

        </main>
      </div>
    </div>
  );
}
/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import { Metadata } from 'next';

/**
 * ✅ 1. スタイル & 共通コンポーネント (物理パス同期)
 */
import styles from './videos.module.css';

// ❌ 以前のパス: organisms/product/AdultProductCard
// ✅ 正しい物理パス: organisms/cards/AdultProductCard
import ProductCard from '@/shared/components/organisms/cards/AdultProductCard';

// サイドバー
import Sidebar from '@/shared/layout/Sidebar/AdultSidebar'; 

// 共通パーツ
import Pagination from '@/shared/components/molecules/Pagination';
import SystemDiagnosticHero from '@/shared/components/molecules/SystemDiagnosticHero';

/**
 * ✅ 2. API関数 (Maya's Logic v3 統合版を使用)
 * 個別のファイルではなく、共通の index からインポートすることで
 * ビルド時の Module not found を回避し、Django v3 経由の通信を保証します。
 */
import { 
  getSiteMainPosts,    // 旧 getSiteMainPosts (WordPress互換)
  getUnifiedProducts,  // アダルト商品一覧
  fetchMakers         // メーカー一覧
} from '@/shared/lib/api';

// 🚨 物理的に存在しない個別の API ファイルからの直接インポートを
// 実在する adultApi.ts または統合 index.ts 経由に変更します。
import { 
  fetchGenres, 
  fetchActresses, 
  fetchSeries,
  fetchDirectors,
  fetchAuthors, 
  fetchLabels 
} from '@/shared/lib/api';

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
  
  // --- 1. パラメータの解析 ---
  const currentPage = Number(searchParams.page) || 1;
  const currentMaker = typeof searchParams.maker === 'string' ? searchParams.maker : undefined;
  const currentGenre = typeof searchParams.genre === 'string' ? searchParams.genre : undefined;
  const currentApiSource = typeof searchParams.api_source === 'string' ? searchParams.api_source : undefined;
  const currentSearch = typeof searchParams.q === 'string' ? searchParams.q : undefined;

  // --- 2. データ取得 (並列実行) ---
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
    getUnifiedProducts({ 
      offset: (currentPage - 1) * pageSize, // getUnifiedProducts内部でoffset計算が必要な場合に備え
      limit: pageSize,
      maker: currentMaker,
      genre: currentGenre,
      api_source: currentApiSource,
      q: currentSearch,
      ordering: '-release_date'
    }).catch(() => ({ results: [], count: 0 })),
    
    getSiteMainPosts('posts', 5).catch(() => ({ results: [] })),
    fetchGenres({ limit: 15 }).catch(() => ({ results: [] })),
    fetchMakers().catch(() => []), // fetchMakersは配列を返す想定
    fetchActresses({ limit: 15 }).catch(() => ({ results: [] })),
    fetchSeries({ limit: 15 }).catch(() => ({ results: [] })),
    fetchDirectors({ limit: 15 }).catch(() => ({ results: [] })),
    fetchAuthors({ limit: 15 }).catch(() => ({ results: [] })), 
    fetchLabels({ limit: 15 }).catch(() => ({ results: [] })),
  ]);

  const items = (productRes?.results || []) as AdultProduct[];
  const totalCount = productRes?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // --- 3. サイドバーPropsの構築 ---
  const sidebarProps = {
    genres: genresRes?.results || [],
    makers: Array.isArray(makersRes) ? makersRes : (makersRes as any)?.results || [],
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
        
        <aside className={styles.sidebar}>
          <div className={styles.sidebarSticky}>
            <Sidebar {...sidebarProps} />
          </div>
        </aside>

        <main className={styles.contentStream}>
          
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
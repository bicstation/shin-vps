/* eslint-disable react/no-unescaped-entities */
import React, { Suspense } from 'react';
import Link from 'next/link';
import { 
  getUnifiedProducts, 
  fetchAdultAttributes 
} from '@/shared/lib/api/django/adult';

import AdultProductCard from '@/shared/components/organisms/cards/AdultProductCard';
import SystemDiagnosticHero from '@/shared/components/molecules/SystemDiagnosticHero';
import styles from './products.module.css';

/**
 * =============================================================================
 * ⚙️ サーバーセクション (Configuration)
 * =============================================================================
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * 🚀 用語リマッピング (Brand Logic)
 */
const remapTitle = (name: string) => {
  const mapping: Record<string, string> = {
    '介護・看病': 'MEDICAL & NURSING（医療・奉仕）',
    '巨乳・フェチ': 'BUST & FETISH（肉体美・執着）',
    '痴漢・露出': 'PUBLIC & EXPOSURE（野外・禁忌）',
    '制服・コスプレ': 'UNIFORM & ROLEPLAY（制服・幻想）',
    '素人・ナンパ': 'AMATEUR & REALITY（未完成・現実）',
  };
  return mapping[name] || name;
};

interface Props {
  searchParams: Promise<{
    attribute?: string;
    attribute_id?: string;
    service?: string;
    floor?: string;
    page?: string;
    debug?: string;
    q?: string;
  }>;
}

/**
 * 🏗️ アーカイブストリーム・メインコンポーネント
 */
export default async function AdultProductListPage({ searchParams }: Props) {
  const params = await searchParams;
  
  const activeService = params.service || 'fanza';
  const activeFloor = params.floor || (activeService === 'fanza' ? 'videoa' : 'adult');
  const attrSlug = params.attribute || "";
  const attrId = params.attribute_id || "";
  const attrIdentifier = attrSlug || attrId;
  const isDebugMode = params.debug === 'true';
  const currentPage = Math.max(1, Number(params.page) || 1);
  const limit = 36; // 6x6 Grid optimization

  let mainProducts: any[] = [];
  let totalCount = 0;
  let sidebarAttributes: any[] = [];
  let errorMsg = "";

  // 📡 データの並列取得
  try {
    const [pData, attrData] = await Promise.all([
      getUnifiedProducts({
        ...params,
        service: activeService,
        floor: activeFloor,
        attribute: attrSlug,
        limit,
        offset: (currentPage - 1) * limit,
      }),
      fetchAdultAttributes().catch(() => []) 
    ]);

    mainProducts = Array.isArray(pData?.results) ? pData.results : [];
    totalCount = pData?.count || 0;
    sidebarAttributes = Array.isArray(attrData) ? attrData : [];
  } catch (error: any) {
    console.error("❌ STREAM_FETCH_ERROR:", error);
    errorMsg = error.message;
  }

  // 表示用タイトルの動的決定
  const currentAttr = sidebarAttributes?.find((a: any) => 
    (attrSlug && String(a.slug) === attrSlug) || 
    (attrId && String(a.id) === String(attrId))
  );
  
  const pageTitle = currentAttr 
    ? `#${remapTitle(currentAttr.name)}` 
    : params.q 
      ? `SEARCH: "${params.q}"` 
      : 'ALL_ARCHIVES';

  return (
    <div className={styles.container}>
      
      {/* 📟 SYSTEM_DIAGNOSTIC */}
      {isDebugMode && (
        <div className="mb-12 border-b border-pink-500/20 pb-8 overflow-hidden">
          <SystemDiagnosticHero 
            status="ACTIVE"
            moduleName={`ARCHIVE_STREAM: ${activeService.toUpperCase()}`}
            id={attrIdentifier || "ROOT"}
            source={`${activeService.toUpperCase()}_GATEWAY`}
            data={mainProducts.slice(0, 1)} 
            params={{ ...params, floor: activeFloor }}
            fetchError={errorMsg || undefined}
          />
        </div>
      )}

      <div className={styles.layoutMain}>
        <header className={styles.pageHeader}>
          <div className={styles.headerTop}>
            <div className={styles.indicator}>
              <span className={styles.pulseDot} />
              <span className={styles.sectorLabel}>STREAM: {activeService.toUpperCase()} // FLOOR: {activeFloor.toUpperCase()}</span>
            </div>
          </div>
          
          <div className={styles.titleContent}>
            <h1 className={styles.mainTitle}>{pageTitle}</h1>
            <div className={styles.counterBox}>
              <span className={styles.countLabel}>DETECTED:</span>
              <span className={styles.countValue}>{totalCount.toLocaleString()}</span>
            </div>
          </div>
          <div className={styles.headerUnderline} />
        </header>

        {/* 🟧 アーカイブグリッド */}
        <section className="mt-8">
          <Suspense fallback={<LoadingGrid />}>
            {mainProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-10">
                {mainProducts.map((product: any) => (
                  <div key={product.product_id_unique || product.id} className="transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1">
                    <AdultProductCard product={product} />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState />
            )}
          </Suspense>
        </section>

        {/* 💡 ページネーション */}
        {totalCount > limit && (
          <Pagination 
            current={currentPage} 
            total={Math.ceil(totalCount / limit)} 
            baseUrl="/adults/products"
            params={params}
          />
        )}
      </div>

      {/* 🚀 TERMINAL_FOOTER */}
      {isDebugMode && (
        <footer className="fixed bottom-0 left-0 w-full bg-black/90 backdrop-blur-xl border-t border-white/5 p-2 z-[9999] font-mono text-[9px]">
          <div className="flex justify-between px-4 text-gray-500">
            <span className="text-pink-500 animate-pulse">{`> GATEWAY_ACTIVE | LATENCY: OK`}</span>
            <span>{`UNIT_BUFFER: ${mainProducts.length} | TOTAL: ${totalCount}`}</span>
          </div>
        </footer>
      )}
    </div>
  );
}

/**
 * --- Sub-components (Server Side) ---
 */

function LoadingGrid() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center font-mono text-pink-500/50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" />
        <span className="animate-pulse tracking-widest">[ SYNCHRONIZING_DATA_STREAM... ]</span>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center border border-white/5 rounded-[2rem] bg-white/[0.02]">
      <p className="text-pink-500 font-mono text-lg mb-2 opacity-80">! NO_DATA_DETECTED</p>
      <Link href="/adults/products" className="mt-6 px-8 py-3 bg-white/5 border border-white/10 text-[10px] font-black hover:bg-pink-500 transition-all">
        RESET_SEARCH_QUERY
      </Link>
    </div>
  );
}

function Pagination({ current, total, baseUrl, params }: any) {
  // 簡易的なNext/Prevロジック
  const nextUrl = `${baseUrl}?service=${params.service || 'fanza'}&page=${current + 1}`;
  const prevUrl = `${baseUrl}?service=${params.service || 'fanza'}&page=${current - 1}`;

  return (
    <nav className="mt-24 mb-20 flex flex-col items-center gap-8">
      <div className="flex items-center gap-12">
        {current > 1 && (
          <Link href={prevUrl} className="group flex flex-col items-center">
            <span className="text-[10px] text-gray-600 mb-1">PREV_NODE</span>
            <div className="w-12 h-12 flex items-center justify-center border border-white/10 group-hover:border-pink-500 transition-all">«</div>
          </Link>
        )}
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-pink-500 font-mono tracking-[0.4em] mb-2 uppercase">Sequence</span>
          <div className="text-4xl font-black italic">
            {current}<span className="text-gray-800 mx-2">/</span><span className="text-gray-600 text-2xl">{total}</span>
          </div>
        </div>
        {current < total && (
          <Link href={nextUrl} className="group flex flex-col items-center">
            <span className="text-[10px] text-gray-600 mb-1">NEXT_NODE</span>
            <div className="w-12 h-12 flex items-center justify-center border border-white/10 group-hover:border-pink-500 transition-all">»</div>
          </Link>
        )}
      </div>
    </nav>
  );
}
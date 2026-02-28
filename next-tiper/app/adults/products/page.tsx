/* eslint-disable react/no-unescaped-entities */
// /home/maya/dev/shin-vps/app/adult/products/page.tsx
import React, { Suspense } from 'react';
import { 
  getUnifiedProducts, 
  fetchAdultAttributes 
} from '@/shared/lib/api/django/adult';

// 🛠️ 修正ポイント: 存在しない Grid ではなく、実在する Card をインポート
import { AdultProductCard } from '@/shared/cards/AdultProductCard';
import SystemDiagnosticHero from '@/shared/debug/SystemDiagnosticHero';
import styles from './products.module.css';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Props {
  searchParams: Promise<{
    attribute_id?: string;
    brand?: string;
    service?: string;
    floor?: string;
    page?: string;
    ordering?: string;
    debug?: string;
  }>;
}

export default async function AdultProductListPage({ searchParams }: Props) {
  const params = await searchParams;
  const attributeId = params.attribute_id;
  const isDebugMode = params.debug === 'true';
  const currentPage = Number(params.page) || 1;
  const limit = 24;

  // 📡 並列データ取得: 商品と属性マスタ
  const [productData, attributes] = await Promise.all([
    getUnifiedProducts({
      ...params,
      limit,
      offset: (currentPage - 1) * limit,
    }).catch(() => ({ results: [], count: 0 })),
    fetchAdultAttributes().catch(() => []),
  ]);

  const { results, count } = productData;

  // 💡 属性IDから名前を特定（サイドバーと連動）
  const currentAttr = attributes?.find((a: any) => String(a.id) === attributeId);
  const pageTitle = currentAttr 
    ? `#${currentAttr.name}` 
    : 'UNIFIED_DATA_STREAM';

  return (
    <div className={styles.container}>
      {/* 📟 DEBUG_HERO */}
      {isDebugMode && (
        <div className={styles.debugHeroWrapper}>
          <SystemDiagnosticHero 
            status="ACTIVE" 
            moduleName={`DATA_STREAM_EXPLORER: ${attributeId ? `ATTR_ID_${attributeId}` : 'ALL_UNITS'}`} 
          />
        </div>
      )}

      <div className={styles.layoutMain}>
        {/* 🏛️ SECTOR_HEADER */}
        <header className={styles.pageHeader}>
          <div className={styles.headerTop}>
            <div className={styles.indicator}>
              <span className={styles.pulseDot} />
              <span className={styles.sectorLabel}>SYSTEM_SECTOR_IDENTIFIED</span>
            </div>
          </div>
          
          <div className={styles.titleContent}>
            <h1 className={styles.mainTitle}>{pageTitle}</h1>
            <div className={styles.counterBox}>
              <span className={styles.countLabel}>DETECTED_UNITS:</span>
              <span className={styles.countValue}>{count.toLocaleString()}</span>
            </div>
          </div>
          <div className={styles.headerUnderline} />
        </header>

        {/* 🏗️ GRID_CONTENT */}
        <section className={styles.gridSection}>
          <div className={styles.glowCanvas} />
          <div className={styles.gridContainer}>
            <Suspense fallback={
              <div className={styles.loadingState}>
                <div className={styles.loadingPulse}>SYNCING_UNIFIED_GATEWAY...</div>
              </div>
            }>
              {results && results.length > 0 ? (
                /* 🚀 修正ポイント: 直接グリッドを構成し、AdultProductCard をループさせる */
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {results.map((product: any) => (
                    <AdultProductCard 
                      key={product.product_id_unique || product.id} 
                      product={product} 
                    />
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <span className={styles.emptyIcon}>[!]</span>
                  <p className={styles.emptyText}>NO_DATA_MATCHING_CRITERIA</p>
                  <p className={styles.emptySub}>Check your filter parameters or connection status.</p>
                </div>
              )}
            </Suspense>
          </div>
        </section>

        {/* 💡 SYSTEM_PAGINATION */}
        {count > limit && (
          <nav className={styles.pagination}>
            <div className={styles.pageInfo}>
              <span className={styles.pageLabel}>NODE:</span>
              <span className={styles.pageValue}>{currentPage} / {Math.ceil(count / limit)}</span>
            </div>
          </nav>
        )}
      </div>

      {/* 🚀 LOG_FOOTER */}
      {isDebugMode && (
        <div className={styles.footerLog}>
          <p>{`> STREAM_STATUS: 200_OK`}</p>
          <p>{`> MEMORY_LOAD: ${results.length} units`}</p>
          <p>{`> TARGET_ID: ${attributeId || 'NULL'}`}</p>
        </div>
      )}
    </div>
  );
}
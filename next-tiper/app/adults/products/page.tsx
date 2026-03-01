/* eslint-disable react/no-unescaped-entities */
import React, { Suspense } from 'react';
import { 
  getUnifiedProducts, 
  fetchAdultAttributes 
} from '@/shared/lib/api/django/adult';

import AdultProductCard from '@/shared/cards/AdultProductCard';
import SystemDiagnosticHero from '@/shared/debug/SystemDiagnosticHero';
import styles from './products.module.css';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * 🚀 用語リマッピング
 * APIの生データをソムリエ風の洗練された表現に変換します
 */
const remapTitle = (name: string) => {
  const mapping: { [key: string]: string } = {
    '介護・看病': 'MEDICAL & NURSING（医療・奉仕）',
    '巨乳・フェチ': 'BUST & FETISH（肉体美・執着）',
    '痴漢・露出': 'PUBLIC & EXPOSURE（野外・禁忌）',
    '制服・コスプレ': 'UNIFORM & ROLEPLAY（制服・幻想）'
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
  }>;
}

export default async function AdultProductListPage({ searchParams }: Props) {
  const params = await searchParams;
  
  // 成人向けフィルタリング設定
  const activeService = params.service || 'fanza';
  const activeFloor = params.floor || (activeService === 'fanza' ? 'videoa' : 'adult');
  
  const attrSlug = params.attribute || "";
  const attrId = params.attribute_id || "";
  const attrIdentifier = attrSlug || attrId;
  const isDebugMode = params.debug === 'true';
  const currentPage = Number(params.page) || 1;
  const limit = 30; // グリッド専用なので少し多めに表示

  let mainProducts: any[] = [];
  let totalCount = 0;
  let sidebarAttributes: any[] = [];
  let errorMsg = "";

  try {
    // データ取得
    const [pData, attrData] = await Promise.all([
      getUnifiedProducts({
        ...params,
        service: activeService,
        floor: activeFloor,
        attribute: attrSlug,
        limit,
        offset: (currentPage - 1) * limit,
      }),
      fetchAdultAttributes()
    ]);

    mainProducts = Array.isArray(pData?.results) ? pData.results : [];
    totalCount = pData?.count || 0;
    sidebarAttributes = Array.isArray(attrData) ? attrData : [];
  } catch (error: any) {
    console.error("DATA_FETCH_ERROR:", error);
    errorMsg = error.message;
  }

  // アクティブな属性の名前をリマップして取得
  const currentAttr = sidebarAttributes?.find((a: any) => 
    (attrSlug && String(a.slug) === attrSlug) || 
    (attrId && String(a.id) === String(attrId))
  );
  
  const pageTitle = currentAttr 
    ? `#${remapTitle(currentAttr.name)}` 
    : attrIdentifier 
      ? `#${attrIdentifier.toUpperCase()}` 
      : 'ALL_COLLECTIONS';

  return (
    <div className={styles.container}>
      {/* 📟 DEBUG_HERO: 開発時のみ表示 */}
      {isDebugMode && typeof SystemDiagnosticHero === 'function' && (
        <div className={styles.debugHeroWrapper} style={{ marginBottom: '2rem' }}>
          <SystemDiagnosticHero 
            id={attrIdentifier || "ALL_NODES"}
            source={`${activeService.toUpperCase()}_GATEWAY`}
            data={mainProducts.slice(0, 3)} 
            params={{ ...params, floor: activeFloor }}
            fetchError={errorMsg || undefined}
            componentPath="/app/adults/products/page.tsx"
          />
        </div>
      )}

      <div className={styles.layoutMain}>
        {/* 🏛️ ページヘッダー */}
        <header className={styles.pageHeader}>
          <div className={styles.headerTop}>
            <div className={styles.indicator}>
              <span className={styles.pulseDot} />
              <span className={styles.sectorLabel}>STREAM_ACTIVE: {activeService.toUpperCase()}</span>
            </div>
          </div>
          
          <div className={styles.titleContent}>
            <h1 className={styles.mainTitle}>{pageTitle}</h1>
            <div className={styles.counterBox}>
              <span className={styles.countLabel}>DETECTED_UNITS:</span>
              <span className={styles.countValue}>{totalCount.toLocaleString()}</span>
            </div>
          </div>
          <div className={styles.headerUnderline} />
        </header>

        {/* 🟧 商品グリッドエリア（サイドバーを削除し全幅へ） */}
        <section className={styles.gridSection} style={{ marginTop: '1rem' }}>
          <Suspense fallback={<div className={styles.loadingPulse}>SYNCING_ADULT_STREAM...</div>}>
            {mainProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {mainProducts.map((product: any) => (
                  typeof AdultProductCard === 'function' ? (
                    <AdultProductCard 
                      key={product.product_id_unique || product.id} 
                      product={product} 
                    />
                  ) : (
                    <div key={product.id} className="p-4 border border-red-900 bg-red-900/20 text-red-500 text-xs">
                      CARD_ENTITY_MISSING
                    </div>
                  )
                ))}
              </div>
            ) : (
              <div className={styles.emptyState} style={{ textAlign: 'center', padding: '100px 0' }}>
                <p style={{ color: '#0f0', fontSize: '1.2rem' }}>[!] NO_DATA_MATCHING_SECTOR</p>
                <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '10px' }}>
                  The requested stream contains no valid units at this time.
                </p>
              </div>
            )}
          </Suspense>
        </section>

        {/* 💡 ページネーション */}
        {totalCount > limit && (
          <nav className={styles.pagination} style={{ marginTop: '4rem', paddingBottom: '4rem', textAlign: 'center' }}>
            <div className={styles.pageInfo}>
              <span className={styles.pageLabel} style={{ color: '#444' }}>PAGE_NODE:</span>
              <span className={styles.pageValue} style={{ color: '#0f0', marginLeft: '10px' }}>
                {currentPage} / {Math.ceil(totalCount / limit)}
              </span>
            </div>
          </nav>
        )}
      </div>

      {/* 🚀 FOOTER_LOG */}
      {isDebugMode && (
        <div className={styles.footerLog} style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', background: 'rgba(0,0,0,0.9)', padding: '10px', borderTop: '1px solid #333', zIndex: 1000 }}>
          <p style={{ color: '#0f0', margin: 0, fontSize: '10px', fontFamily: 'monospace' }}>
            {`> STATUS: 200_OK | MEMORY: ${mainProducts.length} units | SERVICE: ${activeService} | FLOOR: ${activeFloor}`}
          </p>
        </div>
      )}
    </div>
  );
}
/* eslint-disable @next/next/no-img-element */
// @ts-nocheck
export const dynamic = 'force-dynamic';

import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import styles from './FanzaFloorList.module.css';

// ✅ 共通API・コンポーネント
import { getAdultProducts } from '@shared/lib/api/django';
import { constructMetadata } from '@shared/lib/metadata';
import AdultProductCard from '@shared/cards/AdultProductCard';

// ✅ 共通ページネーション
import Pagination from '@shared/common/Pagination'; 

/**
 * 💡 メタデータ生成
 */
export async function generateMetadata({ params }: { params: Promise<{ service: string; floor: string }> }): Promise<Metadata> {
  const { service, floor } = await params;
  const title = `FANZA ${service.toUpperCase()} - ${floor.toUpperCase()} AI解析一覧`;
  return constructMetadata(title, `FANZAの${service}内${floor}フロアからAI解析された最新アーカイブを表示しています。`);
}

/**
 * 🎬 FANZA フロア別一覧ページ
 */
export default async function FanzaFloorListPage(props: {
  params: Promise<{ service: string; floor: string }>;
  searchParams: Promise<{ page?: string; sort?: string; offset?: string }>;
}) {
  // 1. Next.js 15 非同期パラメータの解決
  const resolvedParams = await props.params;
  const resolvedSearchParams = await props.searchParams;

  const { service, floor } = resolvedParams;
  const sort = resolvedSearchParams?.sort || 'recent';
  const limit = 20;

  // 2. 徹底的な数値化 (NaNを根絶)
  // URLの offset > URLの page > デフォルト 0 の優先順位で確定させる
  let currentOffset = 0;
  if (resolvedSearchParams.offset) {
    currentOffset = Number(resolvedSearchParams.offset) || 0;
  } else if (resolvedSearchParams.page) {
    const pageNum = Number(resolvedSearchParams.page) || 1;
    currentOffset = (pageNum - 1) * limit;
  }

  // 3. Django API経由でデータ取得
  let data = { results: [], count: 0 };
  try {
    data = await getAdultProducts({
      api_source: 'fanza',
      service: service,
      floor: floor,
      offset: currentOffset,
      ordering: sort === 'recent' ? '-created_at' : sort === 'rank' ? '-views' : '-review_count',
      limit: limit
    });
  } catch (error) {
    console.error("Fetch Fanza Floor products error:", error);
  }

  // 該当なし判定
  if (!data?.results || data.results.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <div className={styles.emptyIcon}>📡</div>
        <h1 className={styles.emptyTitle}>NO_ARCHIVE_FOUND</h1>
        <p className={styles.emptyText}>FANZA / {service} / {floor} のノードにデータが存在しません。</p>
        <a href="/" className={styles.backBtn}>RETURN TO BASE</a>
      </div>
    );
  }

  // 4. ページネーション用数値の再確定
  const totalCount = Number(data.count) || 0;
  const displayCurrentPage = Math.floor(currentOffset / limit) + 1;
  const displayTotalPages = Math.ceil(totalCount / limit) || 1;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.pathInfo}>
          <span className={styles.root}>ARCHIVE</span>
          <span className={styles.sep}>/</span>
          <span className={styles.provider}>FANZA</span>
          <span className={styles.sep}>/</span>
          <span className={styles.service}>{service.toUpperCase()}</span>
        </div>
        
        <div className={styles.titleWrapper}>
          <h1 className={styles.titleMain}>
            {floor.toUpperCase()} <span className={styles.floorSub}>FLOOR</span>
          </h1>
          <div className={styles.itemCount}>
            <span className={styles.countNum}>{totalCount.toLocaleString()}</span> NODE_DETECTED
          </div>
        </div>

        {/* ツールバー / ソート */}
        <div className={styles.toolbar}>
          <div className={styles.sortGroup}>
            {[
              { id: 'recent', label: 'NEW_RELEASE' },
              { id: 'rank', label: 'POPULARITY' },
              { id: 'review', label: 'REVIEW_DESC' }
            ].map((s) => (
              <a 
                key={s.id} 
                href={`/fanza/${service}/${floor}?offset=0&sort=${s.id}`} 
                className={sort === s.id ? styles.sortActive : styles.sortBtn}
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </header>

      {/* メイングリッド */}
      <main className={styles.grid}>
        {data.results.map((product) => (
          <AdultProductCard key={product.id} product={product} />
        ))}
      </main>

      {/* ページネーション */}
      {totalCount > limit && (
        <div className={styles.paginationWrapper}>
          <Pagination 
            currentOffset={Number(currentOffset)} 
            limit={Number(limit)}
            totalCount={Number(totalCount)}
            basePath={`/fanza/${service}/${floor}`}
          />
          <div className={styles.streamStatus}>
            STREAM_STATUS: PAGE {Number(displayCurrentPage)} OF {Number(displayTotalPages)}
          </div>
        </div>
      )}
    </div>
  );
}
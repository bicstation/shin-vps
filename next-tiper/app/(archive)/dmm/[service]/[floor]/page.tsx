/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import styles from './FanzaFloorList.module.css';

// ✅ 共通API・コンポーネント
import { getAdultProducts, fetchMakers } from '@shared/lib/api/django';
import { fetchPostList } from '@shared/lib/api';
import { constructMetadata } from '@shared/lib/metadata';
import AdultProductCard from '@shared/cards/AdultProductCard';
import Sidebar from '@shared/layout/Sidebar';
import Pagination from '@shared/common/Pagination';

/**
 * 💡 1. メタデータ生成
 */
export async function generateMetadata({ params }: { params: Promise<{ service: string; floor: string }> }): Promise<Metadata> {
  const { service, floor } = await params;
  const title = `FANZA ${service.toUpperCase()} - ${floor.toUpperCase()} AI解析一覧 | TIPER LIVE`;
  return constructMetadata(
    title, 
    `FANZAの${service}内${floor}フロアからAI解析された最新アーカイブを表示しています。`
  );
}

export const dynamic = 'force-dynamic';
export const revalidate = 60;

interface PageProps {
  params: Promise<{ service: string; floor: string }>;
  searchParams: Promise<{ page?: string; sort?: string; offset?: string }>;
}

/**
 * 🎬 2. FANZA フロア別一覧ページ
 */
export default async function FanzaFloorListPage(props: PageProps) {
  // --- A. パラメータ解決 ---
  const resolvedParams = await props.params;
  const resolvedSearchParams = await props.searchParams;

  const { service, floor } = resolvedParams;
  const sort = (Array.isArray(resolvedSearchParams.sort) ? resolvedSearchParams.sort[0] : resolvedSearchParams.sort) || 'recent';
  const limit = 24;

  // 徹底的な数値化 (NaNを根絶)
  let currentOffset = 0;
  if (resolvedSearchParams.offset) {
    currentOffset = Number(resolvedSearchParams.offset) || 0;
  } else if (resolvedSearchParams.page) {
    const pageNum = Number(resolvedSearchParams.page) || 1;
    currentOffset = (pageNum - 1) * limit;
  }

  // --- B. 並行データフェッチ ---
  // サイドバー用のメーカーデータとWP記事も同時に取得
  const [dataRes, mRes, wRes] = await Promise.all([
    getAdultProducts({
      api_source: 'fanza',
      service: service,
      floor: floor,
      offset: currentOffset,
      ordering: sort === 'recent' ? '-release_date' : sort === 'rank' ? '-review_count' : '-review_count',
      limit: limit
    }).catch(() => ({ results: [], count: 0 })),
    fetchMakers().catch(() => []),
    fetchPostList(5).catch(() => ({ results: [] }))
  ]);

  const products = dataRes?.results || [];
  const totalCount = Number(dataRes?.count) || 0;
  const makersData = Array.isArray(mRes) ? mRes : (mRes as any)?.results || [];
  const wpPosts = Array.isArray(wRes) ? wRes : (wRes as any)?.results || [];

  // 該当なし判定
  if (products.length === 0 && currentOffset === 0) {
    return (
      <div className={styles.emptyContainer}>
        <div className={styles.emptyIcon}>📡</div>
        <h1 className={styles.emptyTitle}>NO_ARCHIVE_FOUND</h1>
        <p className={styles.emptyText}>FANZA / {service} / {floor} のノードに有効なデータが存在しません。</p>
        <Link href="/brand/fanza" className={styles.backBtn}>RETURN TO BASE</Link>
      </div>
    );
  }

  // ページネーション用
  const displayCurrentPage = Math.floor(currentOffset / limit) + 1;
  const displayTotalPages = Math.ceil(totalCount / limit) || 1;

  return (
    <div className={styles.pageWrapper}>
      {/* 🌌 ヘッダーエリア */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
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

          {/* 🛠️ ツールバー / ソート */}
          <div className={styles.toolbar}>
            <div className={styles.sortGroup}>
              {[
                { id: 'recent', label: 'NEW_RELEASE', val: 'recent' },
                { id: 'rank', label: 'POPULARITY', val: 'rank' },
              ].map((s) => (
                <Link 
                  key={s.id} 
                  href={`/fanza/${service}/${floor}?offset=0&sort=${s.val}`} 
                  className={sort === s.val ? styles.sortActive : styles.sortBtn}
                >
                  {s.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* 🏗️ メインレイアウト (サイドバーあり) */}
      <div className={styles.layoutContainer}>
        <aside className={styles.sidebar}>
          {/* プラットフォーム切り替えメニューを一番上に配置 */}
          <div className={styles.platformNav}>
            <h3 className={styles.sidebarTitle}>PLATFORM_SWITCH</h3>
            <div className={styles.platformButtons}>
              <Link href="/brand/fanza" className={styles.platformBtnActive}>FANZA</Link>
              <Link href="/brand/duga" className={styles.platformBtn}>DUGA</Link>
              <Link href="/brand/dmm" className={styles.platformBtn}>DMM</Link>
            </div>
          </div>

          <Sidebar 
            makers={makersData} 
            recentPosts={wpPosts.map((p: any) => ({
              id: p.id?.toString() || Math.random().toString(),
              title: p.title?.rendered || p.title || "Untitled",
              slug: p.slug || ""
            }))} 
          />
        </aside>

        <main className={styles.mainContent}>
          {/* グリッド表示 */}
          <div className={styles.grid}>
            {products.map((product: any) => (
              <AdultProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* ページネーション */}
          {totalCount > limit && (
            <div className={styles.paginationWrapper}>
              <Pagination 
                currentOffset={currentOffset} 
                limit={limit}
                totalCount={totalCount}
                basePath={`/fanza/${service}/${floor}`}
                extraParams={{ sort }}
              />
              <div className={styles.streamStatus}>
                STREAM_STATUS: PAGE {displayCurrentPage} OF {displayTotalPages}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */

import React, { Suspense } from 'react';
import { Metadata } from 'next';

import { fetchPCProductRanking } from '@/shared/lib/api/django/pc/stats';
import ProductCard from '@/shared/components/organisms/cards/ProductCard';
import HeroRankingCard from '@/shared/components/organisms/cards/HeroRankingCard';
import Pagination from '@/shared/components/molecules/Pagination';

import styles from './Ranking.module.css';

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const sParams = await props.searchParams;
  const page = sParams.page || '1';

  return {
    title: `【2026年最新】PCランキング 第${page}ページ | BICSTATION`,
    description: `AIスコアによるPCランキング`,
  };
}

export default function RankingPage(props: PageProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RankingContent {...props} />
    </Suspense>
  );
}

async function RankingContent(props: PageProps) {
  const sParams = await props.searchParams;
  const currentPage = parseInt(sParams.page || '1', 10);
  const limit = 20;

  const host = "bicstation.com";

  const rawData = await fetchPCProductRanking('score', host).catch(() => []);

  const productsArray = Array.isArray(rawData)
    ? rawData
    : (rawData?.results || []);

  const offset = (currentPage - 1) * limit;
  const products = productsArray.slice(offset, offset + limit);
  const totalPages = Math.ceil(productsArray.length / limit);

  // 👇 ここが重要
  const hero = products[0];
  const list = products.slice(1);

  return (
    <main className={styles.container}>

      {/* 🏆 HERO（1位だけ別格） */}
      {hero && (
        <div style={{ marginBottom: '24px' }}>
          <HeroRankingCard product={hero} />
        </div>
      )}

      {/* 📊 ランキング（2位以降） */}
      <div className={styles.grid}>
        {list.map((product: any, index: number) => {
          const rank = offset + index + 2;

          return (
            <div key={product.id || index}>
              <ProductCard product={product} rank={rank} />
            </div>
          );
        })}
      </div>

      {/* ページネーション */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        baseUrl="/ranking"
      />

    </main>
  );
}


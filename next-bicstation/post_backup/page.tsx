/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

import React from 'react';
import Link from 'next/link';

import UnifiedProductCard from '@/shared/components/organisms/cards/UnifiedProductCard';
import Pagination from '@/shared/components/molecules/Pagination';

import { fetchDjangoBridgeContent } from '@/shared/lib/api/django-bridge';
import { getSiteMetadata } from '@/shared/lib/utils/siteConfig';

import styles from './news.module.css';

export const dynamic = 'force-dynamic';

const POSTS_PER_PAGE = 12;

interface PageProps {
  searchParams?: {
    page?: string;
  };
}

export default async function ArchiveIndexPage({
  searchParams,
}: PageProps) {

  const host = 'bicstation.com';
  const siteConfig = getSiteMetadata(host);

  const currentPage = parseInt(searchParams?.page || '1', 10);

  const offset = (currentPage - 1) * POSTS_PER_PAGE;

  const response = await fetchDjangoBridgeContent(
    'posts',
    POSTS_PER_PAGE,
    {
      offset,
    }
  ).catch((e) => {
    console.error('🚨 [Archive Bridge Error]:', e);

    return {
      results: [],
      count: 0,
    };
  });

  const allPosts =
    response?.results ||
    (Array.isArray(response) ? response : []);

  const totalCount =
    response?.count ||
    allPosts.length ||
    0;

  const totalPages =
    Math.ceil(totalCount / POSTS_PER_PAGE) || 1;

  return (
    <div className={styles.archiveContainer}>

      <header className={styles.archiveHeader}>
        <h1 className={styles.mainTitle}>
          INTELLIGENCE_ARCHIVE
        </h1>

        <div className={styles.statusLine}>
          <span>
            TOTAL_NODES:
            {totalCount.toLocaleString()}
          </span>
        </div>
      </header>

      <main className={styles.contentGrid}>
        {allPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">

            {allPosts.map((post) => (
              <UnifiedProductCard
                key={post.id}
                data={post}
                siteConfig={siteConfig}
              />
            ))}

          </div>
        ) : (
          <div className={styles.noDataArea}>
            <p>No posts found.</p>

            <Link href="/">
              Back Home
            </Link>
          </div>
        )}
      </main>

      {totalPages > 1 && (
        <div className={styles.paginationWrapper}>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            baseUrl="/post"
          />
        </div>
      )}
    </div>
  );
}
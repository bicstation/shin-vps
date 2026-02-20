/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';

import styles from '../videos/videos.module.css';
import Sidebar from '@/shared/layout/Sidebar/AdultSidebar'; 
import SystemDiagnosticHero from '@/shared/debug/SystemDiagnosticHero';

import { getSiteMainPosts } from '@/shared/lib/api/wordpress';
import { 
  getPlatformAnalysis,
  fetchMakers, fetchGenres, fetchActresses, fetchSeries,
  fetchDirectors, fetchAuthors, fetchLabels
} from '@/shared/lib/api/django/adult';

export const dynamic = 'force-dynamic';

const API_MAP: Record<string, any> = {
  'genres': fetchGenres,
  'makers': fetchMakers,
  'actresses': fetchActresses,
  'series': fetchSeries,
  'directors': fetchDirectors,
  'authors': fetchAuthors,
  'labels': fetchLabels,
};

export default async function CategoryIndexPage(props: { 
  params: Promise<{ category: string }>;
}) {
  const { category } = await props.params;
  const fetchFn = API_MAP[category];
  if (!fetchFn) return notFound();

  const [listRes, analysisData, wpData] = await Promise.all([
    fetchFn({ limit: 500 }).catch(() => ({ results: [] })),
    getPlatformAnalysis('unified', { mode: 'summary' }).catch(() => null),
    getSiteMainPosts(0, 5).catch(() => ({ results: [] })),
  ]);

  const items = listRes?.results || [];

  // サイドバー用データ整形ロジック
  const extract = (key: string) => {
    const data = analysisData?.[key] || analysisData?.results?.[key];
    return Array.isArray(data) ? data : [];
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.wrapper}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarSticky}>
            <Sidebar 
              genres={extract('genres')} makers={extract('makers')}
              actresses={extract('actresses')} series={extract('series')}
              directors={extract('directors')} authors={extract('authors')}
              labels={extract('labels')}
              recentPosts={(wpData?.results || []).map((p: any) => ({ id: p.id, title: p.title.rendered, slug: p.slug }))}
            />
          </div>
        </aside>

        <main className={styles.contentStream}>
          <SystemDiagnosticHero status="ACTIVE" moduleName={`INDEX: ${category.toUpperCase()}`} />
          
          <section className={styles.archiveSection}>
            <div className={styles.sectionHeader}>
              <h1 className={styles.mainTitle}><span className={styles.titleThin}>MASTER_INDEX //</span> {category.toUpperCase()}</h1>
            </div>

            <div className={styles.indexGrid}>
              {items.map((item: any) => (
                <Link key={item.id} href={`/${category}/${item.id}`} className={styles.indexItem}>
                  <span className={styles.indexName}>{item.name}</span>
                  <span className={styles.indexCount}>{item.product_count}</span>
                </Link>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getSiteMetadata, getSiteColor } from '../../lib/siteConfig';
import styles from './Sidebar.module.css';

interface MasterItem {
  id: number;
  name: string;
  slug: string | null;
  product_count: number;
}

interface SidebarProps {
  makers?: MasterItem[];
  genres?: MasterItem[];
  series?: MasterItem[];
  directors?: MasterItem[];
  authors?: MasterItem[];
  recentPosts?: { id: string; title: string; slug?: string }[];
  product?: any;
}

export default function AdultSidebar({
  makers = [],
  genres = [],
  series = [],
  directors = [],
  authors = [],
  recentPosts = [],
  product
}: SidebarProps) {
  const site = getSiteMetadata();
  const siteColor = getSiteColor(site.site_name);
  const pathname = usePathname();

  // 現在のプラットフォーム判定
  const currentPlatform = useMemo(() => {
    if (pathname?.includes('/brand/duga')) return 'duga';
    if (pathname?.includes('/brand/dmm')) return 'dmm';
    return 'fanza';
  }, [pathname]);

  // セクション開閉管理（初期状態ですべて展開）
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'PLATFORMS': true,
    'GENRES': true,
    'SERIES': true,
    'MAKERS': true,
    'DIRECTORS': true,
    'AUTHORS': true,
    'LOGS': true
  });

  const toggleSection = (section: string) => 
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));

  // 各カテゴリの表示件数を上位10件に制限（メモリエラー防止 & 可読性向上）
  const topMakers = useMemo(() => makers.slice(0, 10), [makers]);
  const topGenres = useMemo(() => genres.slice(0, 10), [genres]);
  const topSeries = useMemo(() => series.slice(0, 10), [series]);
  const topDirectors = useMemo(() => directors.slice(0, 10), [directors]);
  const topAuthors = useMemo(() => authors.slice(0, 10), [authors]);

  const getSafeLink = (type: string, item: any) => 
    `/brand/${currentPlatform}/${type}/cat/${item.slug || item.id}`;

  return (
    <aside className={styles.sidebar}>
      
      {/* 🌐 1. PLATFORM SELECTOR (マトリックス・リンク) */}
      <section className={styles.sectionWrapper}>
        <div className={styles.sectionHeader} onClick={() => toggleSection('PLATFORMS')}>
          <h3 className={styles.headerTitle}>
            <span className={styles.icon}>📡</span> 
            <span className={styles.glitchText}>PLATFORM_MATRIX</span>
          </h3>
          <span className={styles.arrow}>{openSections['PLATFORMS'] ? '▲' : '▼'}</span>
        </div>
        {openSections['PLATFORMS'] && (
          <div className={styles.platformGrid}>
            {['DUGA', 'FANZA', 'DMM'].map((p) => (
              <Link 
                key={p} 
                href={`/brand/${p.toLowerCase()}`} 
                className={`${styles.platBtn} ${currentPlatform === p.toLowerCase() ? styles.active : ''}`}
              >
                <span className={styles.btnDot} />
                {p}
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 🛠️ 2-6. マスターデータセクション (TOP 10 厳選表示) */}
      {[
        { id: 'GENRES', type: 'genre', data: topGenres, icon: '🏷️', label: '主要カテゴリ' },
        { id: 'MAKERS', type: 'maker', data: topMakers, icon: '🏢', label: 'トップメーカー' },
        { id: 'SERIES', type: 'series', data: topSeries, icon: '🎞️', label: '人気シリーズ' },
        { id: 'DIRECTORS', type: 'director', data: topDirectors, icon: '🎬', label: '監督アーカイブ' },
        { id: 'AUTHORS', type: 'author', data: topAuthors, icon: '✍️', label: '著者レジストリ' }
      ].map((cat) => (
        <section key={cat.id} className={styles.sectionWrapper}>
          <div className={styles.sectionHeader} onClick={() => toggleSection(cat.id)}>
            <h3 className={styles.headerTitle}>
              <span className={styles.icon}>{cat.icon}</span> {cat.id}
            </h3>
            <span className={styles.subLabel}>/TOP10</span>
            <span className={styles.arrow}>{openSections[cat.id] ? '▲' : '▼'}</span>
          </div>
          {openSections[cat.id] && (
            <div className={styles.contentBody}>
              <ul className={styles.masterList}>
                {cat.data && cat.data.length > 0 ? (
                  cat.data.map(item => (
                    <li key={item.id} className={styles.masterListItem}>
                      <Link href={getSafeLink(cat.type, item)} className={styles.masterLink}>
                        <span className={styles.itemName}>{item.name}</span>
                        <span className={styles.itemCount}>{item.product_count.toLocaleString()}</span>
                      </Link>
                    </li>
                  ))
                ) : (
                  <li className={styles.emptyStatus}>[!] {cat.id}_NO_DATA</li>
                )}
              </ul>
              <Link href={`/brand/${currentPlatform}/${cat.type}`} className={styles.fullLink}>
                FULL_REGISTRY_ACCESS <span>→</span>
              </Link>
            </div>
          )}
        </section>
      ))}

      {/* 📄 7. INTEL LOGS (最新レポート) */}
      <section className={styles.sectionWrapper}>
        <div className={styles.sectionHeader} onClick={() => toggleSection('LOGS')}>
          <h3 className={styles.headerTitle}><span className={styles.icon}>📄</span> RECENT_REPORTS</h3>
          <span className={styles.arrow}>{openSections['LOGS'] ? '▲' : '▼'}</span>
        </div>
        {openSections['LOGS'] && (
          <div className={styles.logContainer}>
            {recentPosts && recentPosts.length > 0 ? (
              recentPosts.slice(0, 5).map(post => (
                <Link key={post.id} href={`/news/${post.slug || post.id}`} className={styles.logItem}>
                  <div className={styles.logIndicator}>REPT</div>
                  <div className={styles.logTitle}>{post.title}</div>
                </Link>
              ))
            ) : (
              <div className={styles.emptyStatus}>NO_LOG_RECORDS</div>
            )}
          </div>
        )}
      </section>

      {/* ⚙️ SYSTEM FOOTER (ターミナル風) */}
      <div className={styles.systemFooter}>
        <div className={styles.statusRow}>
          <div className={styles.blinkContainer}>
            <span className={styles.blinkDot} />
            <span className={styles.statusLabel}>SYS_CORE: OPERATIONAL</span>
          </div>
          <span className={styles.timestamp}>{new Date().toLocaleTimeString()}</span>
        </div>
        <div className={styles.sysMeta}>
          NODE: {currentPlatform.toUpperCase()} | STREAM: SYNCED
        </div>
        <div className={styles.scanlineEffect} />
      </div>
    </aside>
  );
}
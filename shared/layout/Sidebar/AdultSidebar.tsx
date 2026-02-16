'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { getSiteMetadata, getSiteColor } from '../../lib/siteConfig';
import styles from './AdultSidebar.module.css';

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
  const searchParams = useSearchParams();

  // --- 💡 状態管理 & マウント判定 (Hydration対策 / 昨日作成) ---
  const [mounted, setMounted] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'PLATFORMS': true,
    'GENRES': true,
    'SERIES': true,
    'MAKERS': true,
    'DIRECTORS': true,
    'AUTHORS': true,
    'LOGS': true
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  /**
   * 💡 ブランド（プラットフォーム）判定の統合
   * URLのクエリパラメータ ?brand= または パスに含まれるキーワードから判定
   */
  const currentPlatform = useMemo(() => {
    const brandParam = searchParams.get('brand');
    if (brandParam) return brandParam.toLowerCase();
    
    // パスベースのフォールバック (昨日作成のロジック)
    if (pathname?.includes('/brand/duga') || pathname?.includes('duga')) return 'duga';
    if (pathname?.includes('/brand/fanza') || pathname?.includes('fanza')) return 'fanza';
    if (pathname?.includes('/brand/dmm') || pathname?.includes('dmm')) return 'dmm';
    
    return null; // 指定なし（統合表示）
  }, [pathname, searchParams]);

  const toggleSection = (section: string) => 
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));

  // 表示件数制限 (TOP 10)
  const topMakers = useMemo(() => makers.slice(0, 10), [makers]);
  const topGenres = useMemo(() => genres.slice(0, 10), [genres]);
  const topSeries = useMemo(() => series.slice(0, 10), [series]);
  const topDirectors = useMemo(() => directors.slice(0, 10), [directors]);
  const topAuthors = useMemo(() => authors.slice(0, 10), [authors]);

  /**
   * 💡 統合リンク生成ロジック
   * パス: /[type]/[identifier]
   * クエリ: ?brand=... (プラットフォームが指定されている場合のみ付与)
   */
  const getSafeLink = (type: string, item: any) => {
    const identifier = item.slug || item.id;
    const baseUrl = `/${type}/${identifier}`;
    return currentPlatform ? `${baseUrl}?brand=${currentPlatform}` : baseUrl;
  };

  if (!mounted) return null; // Hydrationエラー防止

  return (
    <aside className={styles.sidebar}>
      
      {/* 🌐 1. PLATFORM SELECTOR */}
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
            <Link 
              href={pathname} 
              className={`${styles.platBtn} ${!currentPlatform ? styles.active : ''}`}
            >
              <span className={styles.btnDot} /> ALL
            </Link>
            {['FANZA', 'DUGA', 'DMM'].map((p) => (
              <Link 
                key={p} 
                href={`${pathname}?brand=${p.toLowerCase()}`} 
                className={`${styles.platBtn} ${currentPlatform === p.toLowerCase() ? styles.active : ''}`}
              >
                <span className={styles.btnDot} /> {p}
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 🛠️ 2-6. マスターデータセクション (昨日作成のデータマッピング) */}
      {[
        { id: 'GENRES', type: 'genre', data: topGenres, icon: '🏷️' },
        { id: 'MAKERS', type: 'maker', data: topMakers, icon: '🏢' },
        { id: 'SERIES', type: 'series', data: topSeries, icon: '🎞️' },
        { id: 'DIRECTORS', type: 'director', data: topDirectors, icon: '🎬' },
        { id: 'AUTHORS', type: 'author', data: topAuthors, icon: '✍️' }
      ].map((cat) => (
        <section key={cat.id} className={styles.sectionWrapper}>
          <div className={styles.sectionHeader} onClick={() => toggleSection(cat.id)}>
            <h3 className={styles.headerTitle}>
              <span className={styles.icon}>{cat.icon}</span> 
              {cat.id} 
              <span className={styles.subLabel}>{` > TOP10`}</span>
            </h3>
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
              <Link 
                href={currentPlatform ? `/${cat.type}?brand=${currentPlatform}` : `/${cat.type}`} 
                className={styles.fullLink}
              >
                FULL_REGISTRY_ACCESS <span>→</span>
              </Link>
            </div>
          )}
        </section>
      ))}

      {/* 📄 7. RECENT_REPORTS (昨日作成) */}
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

      {/* ⚙️ SYSTEM FOOTER */}
      <div className={styles.systemFooter}>
        <div className={styles.statusRow}>
          <div className={styles.blinkContainer}>
            <span className={styles.blinkDot} />
            <span className={styles.statusLabel}>SYS_CORE: OPERATIONAL</span>
          </div>
          <span className={styles.timestamp} suppressHydrationWarning>
            {mounted ? new Date().toLocaleTimeString() : '--:--:--'}
          </span>
        </div>
        <div className={styles.sysMeta}>
          NODE: {currentPlatform ? currentPlatform.toUpperCase() : 'INTEGRATED'} | STREAM: SYNCED
        </div>
      </div>
    </aside>
  );
}
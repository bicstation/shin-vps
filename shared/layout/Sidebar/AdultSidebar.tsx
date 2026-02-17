'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import styles from './AdultSidebar.module.css';

interface MasterItem {
  id: number;
  name: string;
  slug: string | null;
  product_count: number;
}

// 💡 Django API側のキー名（service_name等）とReact側のインターフェースを統合
interface OfficialFloor {
  id: string | number;
  name?: string;       // 旧
  floor_name?: string; // Django
  slug?: string;       // 旧
  floor_code?: string; // Django
}

interface OfficialService {
  id: string | number;
  name?: string;          // 旧
  service_name?: string;  // Django
  slug?: string;          // 旧
  service_code?: string;  // Django
  floors?: OfficialFloor[];
}

interface SidebarProps {
  officialHierarchy?: OfficialService[];
  makers?: MasterItem[];
  genres?: MasterItem[];
  series?: MasterItem[];
  directors?: MasterItem[];
  authors?: MasterItem[];
  recentPosts?: { id: string; title: string; slug?: string }[];
  product?: any;
}

export default function AdultSidebar({
  officialHierarchy = [],
  makers = [],
  genres = [],
  series = [],
  directors = [],
  authors = [],
  recentPosts = [],
  product
}: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [mounted, setMounted] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'OFFICIAL_NAV': true,
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

  const currentPlatform = useMemo(() => {
    if (pathname?.includes('/brand/fanza')) return 'fanza';
    if (pathname?.includes('/brand/dmm')) return 'dmm';
    if (pathname?.includes('/brand/duga')) return 'duga';
    const brandParam = searchParams.get('brand');
    if (brandParam) return brandParam.toLowerCase();
    return null; 
  }, [pathname, searchParams]);

  const toggleSection = (section: string) => 
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));

  const categories = [
    { id: 'GENRES', type: 'genres', data: genres.slice(0, 10), icon: '🏷️' },
    { id: 'MAKERS', type: 'makers', data: makers.slice(0, 10), icon: '🏢' },
    { id: 'SERIES', type: 'series', data: series.slice(0, 10), icon: '🎞️' },
    { id: 'DIRECTORS', type: 'directors', data: directors.slice(0, 10), icon: '🎬' },
    { id: 'AUTHORS', type: 'authors', data: authors.slice(0, 10), icon: '✍️' }
  ];

  const getSafeLink = (type: string, item: any) => {
    const identifier = item.slug || item.id;
    if (currentPlatform) {
      return `/brand/${currentPlatform}/cat/${type.replace(/s$/, '')}/${identifier}`;
    }
    return `/${type}/${identifier}`;
  };

  /**
   * 💡 サービス・フロア専用リンク生成
   * マッピング: slug または code を使用
   */
  const getOfficialLink = (serviceSlug: string, floorSlug?: string) => {
    const base = `/brand/${currentPlatform || 'fanza'}`;
    if (floorSlug) {
      return `${base}/svc/${serviceSlug}/${floorSlug}`;
    }
    return `${base}/svc/${serviceSlug}/all`;
  };

  if (!mounted) return null;

  return (
    <aside className={styles.sidebar}>
      
      {/* 🌐 1. PLATFORM_MATRIX */}
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
            <Link href="/" className={`${styles.platBtn} ${!currentPlatform ? styles.active : ''}`}>
              <span className={styles.btnDot} /> ALL_ROOT
            </Link>
            {['FANZA', 'DMM', 'DUGA'].map((p) => {
              const platId = p.toLowerCase();
              return (
                <Link key={p} href={`/brand/${platId}`} className={`${styles.platBtn} ${currentPlatform === platId ? styles.active : ''}`}>
                  <span className={styles.btnDot} /> {p}
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* 🚀 2. OFFICIAL_LAYERS (データ吸収ロジック搭載) */}
      {currentPlatform && officialHierarchy.length > 0 && (
        <section className={styles.sectionWrapper}>
          <div className={styles.sectionHeader} onClick={() => toggleSection('OFFICIAL_NAV')}>
            <h3 className={styles.headerTitle}>
              <span className={styles.icon}>⚡</span> OFFICIAL_LAYERS
            </h3>
            <span className={styles.arrow}>{openSections['OFFICIAL_NAV'] ? '▲' : '▼'}</span>
          </div>
          {openSections['OFFICIAL_NAV'] && (
            <div className={styles.contentBody}>
              <ul className={styles.serviceList}>
                {officialHierarchy.map((service) => {
                  // 💡 Django APIの service_name / service_code に対応
                  const sName = service.service_name || service.name;
                  const sSlug = service.service_code || service.slug;
                  if (!sSlug) return null;

                  return (
                    <li key={service.id || sSlug} className={styles.serviceItem}>
                      <Link 
                        href={getOfficialLink(sSlug)}
                        className={`${styles.serviceLink} ${pathname.includes(`/svc/${sSlug}`) ? styles.active : ''}`}
                      >
                        <span className={styles.serviceName}>// {sName}</span>
                      </Link>
                      
                      {service.floors && service.floors.length > 0 && (
                        <ul className={styles.floorList}>
                          {service.floors.map((floor) => {
                            const fName = floor.floor_name || floor.name;
                            const fSlug = floor.floor_code || floor.slug;
                            if (!fSlug) return null;

                            return (
                              <li key={floor.id || fSlug}>
                                <Link 
                                  href={getOfficialLink(sSlug, fSlug)}
                                  className={`${styles.floorLink} ${pathname.endsWith(`/${fSlug}`) ? styles.active : ''}`}
                                >
                                  <span className={styles.floorDash}>└</span> {fName}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* 🛠️ 3. マスターデータセクション (TOP 10 一覧表示を維持) */}
      {categories.map((cat) => (
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
                        <span className={styles.itemCount}>{(item.product_count || 0).toLocaleString()}</span>
                      </Link>
                    </li>
                  ))
                ) : (
                  <li className={styles.emptyStatus}>[!] {cat.id}_NO_DATA</li>
                )}
              </ul>
              <Link 
                href={currentPlatform ? `/brand/${currentPlatform}/cat/${cat.type}` : `/${cat.type}`} 
                className={styles.fullLink}
              >
                FULL_REGISTRY_ACCESS <span>→</span>
              </Link>
            </div>
          )}
        </section>
      ))}

      {/* 📄 4. RECENT_REPORTS */}
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
          <span className={styles.timestamp}>
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
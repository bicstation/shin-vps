'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import styles from './AdultSidebar.module.css';

// --- インターフェース定義 ---
interface MasterItem {
  id: number;
  name: string;
  slug: string | null;
  product_count: number;
}

interface OfficialFloor {
  id: string | number;
  name?: string;
  floor_name?: string;
  slug?: string;
  floor_code?: string;
  code?: string;
}

interface OfficialService {
  id: string | number;
  name?: string;
  service_name?: string;
  slug?: string;
  service_code?: string;
  code?: string;
  floors?: OfficialFloor[];
  items?: OfficialFloor[]; 
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
    'LOGS': true
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. 現在のプラットフォーム判定
  const currentPlatform = useMemo(() => {
    if (pathname?.includes('/brand/fanza')) return 'fanza';
    if (pathname?.includes('/brand/dmm')) return 'dmm';
    if (pathname?.includes('/brand/duga')) return 'duga';
    return searchParams.get('brand')?.toLowerCase() || 'fanza';
  }, [pathname, searchParams]);

  // 2. セクション開閉
  const toggleSection = (section: string) => 
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));

  /** * 💡 3. /svc/ パス形式リンク生成ロジック
   * 例: /brand/fanza/svc/digital/videoa
   */
  const getOfficialLink = (sCode: string, fCode?: string) => {
    const base = `/brand/${currentPlatform}/svc`;
    if (fCode) {
      return `${base}/${sCode}/${fCode}`;
    }
    return `${base}/${sCode}`;
  };

  /** * 💡 4. アクティブ判定ロジック
   */
  const isSvcActive = (sCode: string) => {
    return pathname?.includes(`/svc/${sCode}`);
  };

  const isFlrActive = (sCode: string, fCode: string) => {
    // パスが /svc/service/floor を含んでいるか厳密に判定
    return pathname?.includes(`/svc/${sCode}/${fCode}`);
  };

  const getSafeLink = (type: string, item: any) => {
    const identifier = item.slug || item.id;
    return `/brand/${currentPlatform}/cat/${type.replace(/s$/, '')}/${identifier}`;
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
            {['FANZA', 'DMM', 'DUGA'].map((p) => {
              const platId = p.toLowerCase();
              const isActive = currentPlatform === platId;
              return (
                <Link key={p} href={`/brand/${platId}`} className={`${styles.platBtn} ${isActive ? styles.active : ''}`}>
                  <span className={styles.btnDot} /> {p}
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* 🚀 2. OFFICIAL_LAYERS (/svc/ パス対応版) */}
      {currentPlatform && officialHierarchy.length > 0 && (
        <section className={styles.sectionWrapper}>
          <div className={styles.sectionHeader} onClick={() => toggleSection('OFFICIAL_NAV')}>
            <h3 className={styles.headerTitle}>
              <span className={styles.icon}>⚡</span> {currentPlatform.toUpperCase()}_LAYERS
            </h3>
            <span className={styles.arrow}>{openSections['OFFICIAL_NAV'] ? '▲' : '▼'}</span>
          </div>
          {openSections['OFFICIAL_NAV'] && (
            <div className={styles.contentBody}>
              <ul className={styles.masterList}>
                {officialHierarchy.map((service) => {
                  const sName = service.service_name || service.name;
                  const sCode = service.service_code || service.code || service.slug;
                  if (!sCode) return null;

                  const isServiceActive = isSvcActive(sCode);
                  const floors = service.floors || service.items || [];

                  return (
                    <React.Fragment key={`svc-${sCode}`}>
                      {/* 親サービス項目 */}
                      <li className={styles.masterListItem}>
                        <Link 
                          href={getOfficialLink(sCode)}
                          className={`${styles.masterLink} ${isServiceActive ? styles.active : ''}`}
                        >
                          <span className={styles.itemName} style={{ color: 'var(--accent)', fontWeight: 'bold' }}>
                             {sName}
                          </span>
                        </Link>
                      </li>
                      
                      {/* 子フロア項目 */}
                      {floors.map((floor) => {
                        const fName = floor.floor_name || floor.name;
                        const fCode = floor.floor_code || floor.code || floor.slug;
                        if (!fCode) return null;

                        const isFloorActive = isFlrActive(sCode, fCode);

                        return (
                          <li key={`flr-${fCode}`} className={styles.masterListItem}>
                            <Link 
                              href={getOfficialLink(sCode, fCode)}
                              className={`${styles.masterLink} ${isFloorActive ? styles.active : ''}`}
                              style={{ paddingLeft: '1.2rem', opacity: 0.9 }}
                            >
                              <span className={styles.itemName}>
                                <span style={{ color: 'var(--accent)', marginRight: '6px', opacity: 0.5 }}>└</span>
                                {fName}
                              </span>
                            </Link>
                          </li>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* 🛠️ 3. マスターデータセクション (GENRES / MAKERS / SERIES / etc...) */}
      {[
        { id: 'GENRES', type: 'genres', data: genres.slice(0, 10), icon: '🏷️' },
        { id: 'MAKERS', type: 'makers', data: makers.slice(0, 10), icon: '🏢' },
        { id: 'SERIES', type: 'series', data: series.slice(0, 5), icon: '📚' },
        { id: 'DIRECTORS', type: 'directors', data: directors.slice(0, 5), icon: '🎬' },
      ].map((cat) => (
        <section key={cat.id} className={styles.sectionWrapper}>
          <div className={styles.sectionHeader} onClick={() => toggleSection(cat.id)}>
            <h3 className={styles.headerTitle}>
              <span className={styles.icon}>{cat.icon}</span> 
              {cat.id} 
              <span className={styles.subLabel}>{` > TOP`}</span>
            </h3>
            <span className={styles.arrow}>{openSections[cat.id] ? '▲' : '▼'}</span>
          </div>
          {openSections[cat.id] && (
            <div className={styles.contentBody}>
              <ul className={styles.masterList}>
                {cat.data.length > 0 ? (
                  cat.data.map(item => (
                    <li key={item.id} className={styles.masterListItem}>
                      <Link href={getSafeLink(cat.type, item)} className={styles.masterLink}>
                        <span className={styles.itemName}>{item.name}</span>
                        <span className={styles.itemCount}>{(item.product_count || 0).toLocaleString()}</span>
                      </Link>
                    </li>
                  ))
                ) : (
                  <li className={styles.emptyStatus}>[!] NO_DATA</li>
                )}
              </ul>
            </div>
          )}
        </section>
      ))}

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
      </div>
    </aside>
  );
}
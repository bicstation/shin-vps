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
  product_count?: number;
  count?: number;
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
  navigation?: OfficialService[];
  makers?: MasterItem[];
  genres?: MasterItem[];
  actresses?: MasterItem[];
  aiAttributes?: MasterItem[]; // 🚀 Wrapper (sidebar-stats) から渡される属性
  recentPosts?: { id: string; title: string; slug?: string }[];
  currentBrand?: string;       // 'FANZA' | 'DMM' | 'DUGA'
  siteName?: string;
}

/**
 * =====================================================================
 * 🛰️ AdultSidebar - Standard Tactical Edition (V4.2)
 * ---------------------------------------------------------------------
 * Tiper/一般サイト向け。情報密度を優先し、目録（Index）への導線を強化。
 * =====================================================================
 */
export default function AdultSidebar({
  navigation = [],
  makers = [],
  genres = [],
  actresses = [], 
  aiAttributes = [], 
  recentPosts = [],
  currentBrand = 'FANZA',
}: SidebarProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // 🪄 セクション開閉状態：標準サイドバーは基本項目をデフォルト展開
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'PLATFORMS': true,
    'OFFICIAL_NAV': true,
    'AI_SPECS': true, 
    'GENRES': true,
    'ACTRESSES': true,
    'MAKERS': false,
    'LOGS': true
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const activePlat = useMemo(() => currentBrand.toLowerCase(), [currentBrand]);

  const toggleSection = (section: string) => 
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));

  const getOfficialLink = (sCode: string, fCode?: string) => {
    const base = `/brand/${activePlat}/svc`;
    return fCode ? `${base}/${sCode}/${fCode}` : `${base}/${sCode}`;
  };

  const isSvcActive = (sCode: string) => pathname?.includes(`/svc/${sCode}`);
  const isFlrActive = (sCode: string, fCode: string) => pathname?.includes(`/svc/${sCode}/${fCode}`);

  const getSafeLink = (category: string, item: any) => {
    const identifier = item.slug || item.id;
    return `/${category}/${identifier}`;
  };

  if (!mounted) return null;

  return (
    <aside className={styles.sidebar}>
      
      {/* 🌐 PLATFORM_MATRIX */}
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
              const isActive = activePlat === platId;
              return (
                <Link key={p} href={`/brand/${platId}`} className={`${styles.platBtn} ${isActive ? styles.active : ''}`}>
                  {p}
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* 🚀 OFFICIAL_LAYERS (サービス・フロア) */}
      <section className={styles.sectionWrapper}>
        <div className={styles.sectionHeader} onClick={() => toggleSection('OFFICIAL_NAV')}>
          <h3 className={styles.headerTitle}>
            <span className={styles.icon}>⚡</span> {currentBrand.toUpperCase()}_LAYERS
          </h3>
          <span className={styles.arrow}>{openSections['OFFICIAL_NAV'] ? '▲' : '▼'}</span>
        </div>
        {openSections['OFFICIAL_NAV'] && (
          <div className={styles.contentBody}>
            <ul className={styles.masterList}>
              {navigation.length > 0 ? (
                navigation.map((service, idx) => {
                  const sName = service.service_name || service.name;
                  const sCode = service.service_code || service.code || service.slug;
                  if (!sCode) return null;
                  const floors = service.floors || service.items || [];
                  
                  return (
                    <React.Fragment key={`svc-${sCode}-${idx}`}>
                      <li className={styles.masterListItem}>
                        <Link href={getOfficialLink(sCode)} className={`${styles.masterLink} ${isSvcActive(sCode) ? styles.active : ''}`}>
                          <span className={styles.itemName} style={{ color: 'var(--site-theme-color)', fontWeight: 'bold' }}>{sName}</span>
                        </Link>
                      </li>
                      {floors.map((floor, fIdx) => {
                        const fName = floor.floor_name || floor.name;
                        const fCode = floor.floor_code || floor.code || floor.slug;
                        if (!fCode) return null;
                        return (
                          <li key={`flr-${fCode}-${fIdx}`} className={styles.masterListItem}>
                            <Link href={getOfficialLink(sCode, fCode)} className={`${styles.masterLink} ${isFlrActive(sCode, fCode) ? styles.active : ''}`} style={{ paddingLeft: '1.2rem' }}>
                              <span className={styles.itemName}>
                                <span style={{ color: 'var(--site-theme-color)', marginRight: '6px', opacity: 0.5 }}>└</span>{fName}
                              </span>
                            </Link>
                          </li>
                        );
                      })}
                    </React.Fragment>
                  );
                })
              ) : (
                <li className={styles.emptyStatus}>NO_SERVICES_LOADED</li>
              )}
            </ul>
          </div>
        )}
      </section>

      {/* 💎 SYSTEM_SPEC_TAGS (AI属性) */}
      <section className={styles.sectionWrapper} style={{ border: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <div className={`${styles.sectionHeader} ${styles.aiHeader}`} onClick={() => toggleSection('AI_SPECS')}>
          <h3 className={styles.headerTitle}>
            <span className={styles.icon}>💎</span> SYSTEM_SPEC_TAGS
          </h3>
          <span className={styles.arrow}>{openSections['AI_SPECS'] ? '▲' : '▼'}</span>
        </div>
        {openSections['AI_SPECS'] && (
          <div className={styles.contentBody}>
            <ul className={styles.masterList}>
              {aiAttributes.length > 0 ? (
                aiAttributes.map((item, idx) => (
                  <li key={`ai-${item.id || idx}`} className={styles.masterListItem}>
                    <Link href={`/adults/products?attribute=${item.slug || item.id}`} className={styles.masterLink}>
                      <span className={styles.itemName}>
                        <span className={styles.tagPrefix}>#</span>{item.name}
                      </span>
                      <span className={styles.itemCount}>{(item.count || 0).toLocaleString()}</span>
                    </Link>
                  </li>
                ))
              ) : (
                <li className={styles.emptyStatus}>[!] ANALYZING_DATABASE...</li>
              )}
            </ul>
          </div>
        )}
      </section>

      {/* 🛠️ MASTER_DATA_INDEXES (女優・ジャンル・メーカー) */}
      {[
        { id: 'ACTRESSES', type: 'actress', data: actresses, icon: '👩', label: '女優' },
        { id: 'GENRES', type: 'genre', data: genres, icon: '🏷️', label: 'ジャンル' },
        { id: 'MAKERS', type: 'maker', data: makers, icon: '🏢', label: 'メーカー' },
      ].map((cat) => (
        <section key={`sec-${cat.id}`} className={styles.sectionWrapper}>
          <div className={styles.sectionHeader} onClick={() => toggleSection(cat.id)}>
            <h3 className={styles.headerTitle}>
              <span className={styles.icon}>{cat.icon}</span> {cat.id}
            </h3>
            <span className={styles.arrow}>{openSections[cat.id] ? '▲' : '▼'}</span>
          </div>
          {openSections[cat.id] && (
            <div className={styles.contentBody}>
              <ul className={styles.masterList}>
                {cat.data.length > 0 ? (
                  <>
                    {cat.data.slice(0, 15).map((item, idx) => (
                      <li key={`${cat.id}-${item.id || idx}`} className={styles.masterListItem}>
                        <Link href={getSafeLink(cat.type, item)} className={styles.masterLink}>
                          <span className={styles.itemName}>{item.name}</span>
                          <span className={styles.itemCount}>{(item.product_count || 0).toLocaleString()}</span>
                        </Link>
                      </li>
                    ))}
                    <li className={styles.viewMoreItem}>
                      <Link href={`/${cat.type}`} className={styles.viewMoreLink}>
                        <span className={styles.viewMoreText}>{cat.label}の全目録へ</span>
                        <span className={styles.viewMoreArrow}>→</span>
                      </Link>
                    </li>
                  </>
                ) : (
                  <li className={styles.emptyStatus}>[!] NO_DATA_AVAILABLE</li>
                )}
              </ul>
            </div>
          )}
        </section>
      ))}

      {/* 📰 RECENT_REPORTS */}
      <section className={styles.sectionWrapper}>
        <div className={styles.sectionHeader} onClick={() => toggleSection('LOGS')}>
          <h3 className={styles.headerTitle}>
            <span className={styles.icon}>📝</span> RECENT_REPORTS
          </h3>
          <span className={styles.arrow}>{openSections['LOGS'] ? '▲' : '▼'}</span>
        </div>
        {openSections['LOGS'] && (
          <div className={styles.contentBody}>
            <ul className={styles.masterList}>
              {recentPosts.length > 0 ? (
                recentPosts.map((post) => (
                  <li key={`post-${post.id}`} className={styles.masterListItem}>
                    <Link href={`/news/${post.slug || post.id}`} className={styles.masterLink}>
                      <span className={styles.itemName}>{post.title}</span>
                    </Link>
                  </li>
                ))
              ) : (
                <li className={styles.emptyStatus}>[!] NO_REPORTS_FOUND</li>
              )}
            </ul>
          </div>
        )}
      </section>

      {/* 🛰️ SYSTEM_FOOTER */}
      <div className={styles.systemFooter}>
        <div className={styles.statusRow}>
          <div className={styles.blinkContainer}>
            <span className={styles.blinkDot} />
            <span className={styles.statusLabel}>SYS_CORE: ONLINE</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
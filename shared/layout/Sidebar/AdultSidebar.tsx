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

interface AiAttributeItem {
  id: number;
  name: string;
  slug: string;
  count: number;
  // attr_type は将来的な拡張用
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
  actresses?: MasterItem[];
  series?: MasterItem[];
  directors?: MasterItem[];
  authors?: MasterItem[]; 
  labels?: MasterItem[];   
  aiAttributes?: AiAttributeItem[];
  recentPosts?: { id: string; title: string; slug?: string }[];
}

export default function AdultSidebar({
  officialHierarchy = [],
  makers = [],
  genres = [],
  actresses = [], 
  series = [],
  directors = [],
  authors = [],
  labels = [],
  aiAttributes = [], 
  recentPosts = [],
}: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  // セクション開閉状態（AI_SPECS と ACTRESSES は重要度が高いためデフォルト Open）
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'PLATFORMS': true,
    'OFFICIAL_NAV': true,
    'AI_SPECS': true, 
    'GENRES': false,
    'MAKERS': false,
    'ACTRESSES': true,
    'LOGS': true
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentPlatform = useMemo(() => {
    if (pathname?.includes('/brand/fanza')) return 'fanza';
    if (pathname?.includes('/brand/dmm')) return 'dmm';
    if (pathname?.includes('/brand/duga')) return 'duga';
    return searchParams.get('brand')?.toLowerCase() || 'fanza';
  }, [pathname, searchParams]);

  const toggleSection = (section: string) => 
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));

  const getOfficialLink = (sCode: string, fCode?: string) => {
    const base = `/brand/${currentPlatform}/svc`;
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
              const isActive = currentPlatform === platId;
              return (
                <Link key={p} href={`/brand/${platId}`} className={`${styles.platBtn} ${isActive ? styles.active : ''}`}>
                  {p}
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* 💎 SYSTEM_SPEC_TAGS: AI属性（分析結果） */}
      <section className={styles.sectionWrapper} style={{ border: '1px solid var(--site-theme-alpha)' }}>
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
                aiAttributes.map(item => (
                  <li key={`ai-attr-${item.id}`} className={styles.masterListItem}>
                    <Link href={`/adult/products?attribute_id=${item.id}`} className={styles.masterLink}>
                      <span className={styles.itemName}>
                        <span className={styles.tagPrefix}>#</span>{item.name}
                      </span>
                      <span className={styles.itemCount}>{item.count.toLocaleString()}</span>
                    </Link>
                    {/* PC推奨バッジ：スラッグに特定のキーワードが含まれる場合のみ表示 */}
                    {/4k|vr|high-spec|8k/.test(item.slug.toLowerCase()) && (
                      <Link href={`/spec-lab/pc-recommend?attr=${item.slug}`} className={styles.specLinkBadge}>
                        推奨PC ↗
                      </Link>
                    )}
                  </li>
                ))
              ) : (
                <li className={styles.emptyStatus}>[!] ANALYZING_DATABASE...</li>
              )}
            </ul>
          </div>
        )}
      </section>

      {/* 🚀 OFFICIAL_LAYERS */}
      {currentPlatform && (officialHierarchy.length > 0) && (
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
                  const floors = service.floors || service.items || [];
                  return (
                    <React.Fragment key={`svc-wrap-${sCode}`}>
                      <li className={styles.masterListItem}>
                        <Link href={getOfficialLink(sCode)} className={`${styles.masterLink} ${isSvcActive(sCode) ? styles.active : ''}`}>
                          <span className={styles.itemName} style={{ color: 'var(--site-theme-color)', fontWeight: 'bold' }}>{sName}</span>
                        </Link>
                      </li>
                      {floors.map((floor) => {
                        const fName = floor.floor_name || floor.name;
                        const fCode = floor.floor_code || floor.code || floor.slug;
                        if (!fCode) return null;
                        return (
                          <li key={`flr-item-${fCode}`} className={styles.masterListItem}>
                            <Link href={getOfficialLink(sCode, fCode)} className={`${styles.masterLink} ${isFlrActive(sCode, fCode) ? styles.active : ''}`} style={{ paddingLeft: '1.2rem' }}>
                              <span className={styles.itemName}><span style={{ color: 'var(--site-theme-color)', marginRight: '6px', opacity: 0.5 }}>└</span>{fName}</span>
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

      {/* 🛠️ MASTER_DATA_INDEXES */}
      {[
        { id: 'ACTRESSES', type: 'actress', data: actresses, icon: '👩', label: '女優' },
        { id: 'GENRES', type: 'genre', data: genres, icon: '🏷️', label: 'ジャンル' },
        { id: 'MAKERS', type: 'maker', data: makers, icon: '🏢', label: 'メーカー' },
      ].map((cat) => (
        <section key={`master-sec-${cat.id}`} className={styles.sectionWrapper}>
          <div className={styles.sectionHeader} onClick={() => toggleSection(cat.id)}>
            <h3 className={styles.headerTitle}>
              <span className={styles.icon}>{cat.icon}</span> {cat.id}
            </h3>
            <span className={styles.arrow}>{openSections[cat.id] ? '▲' : '▼'}</span>
          </div>
          {openSections[cat.id] && (
            <div className={styles.contentBody}>
              <ul className={styles.masterList}>
                {cat.data && cat.data.length > 0 ? (
                  <>
                    {cat.data.slice(0, 10).map(item => (
                      <li key={`${cat.id}-${item.id}`} className={styles.masterListItem}>
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
                    <Link href={`/news/${post.slug}`} className={styles.masterLink}>
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
            <span className={styles.statusLabel}>SYS_CORE: OPERATIONAL</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
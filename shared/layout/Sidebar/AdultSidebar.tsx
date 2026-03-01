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
  navigation?: OfficialService[]; // 🚀 Wrapper側の名称に統一
  makers?: MasterItem[];
  genres?: MasterItem[];
  actresses?: MasterItem[];
  series?: MasterItem[];
  directors?: MasterItem[];
  authors?: MasterItem[]; 
  labels?: MasterItem[];   
  aiAttributes?: AiAttributeItem[];
  recentPosts?: { id: string; title: string; slug?: string }[];
  currentBrand?: string; // 🚀 Wrapperから渡される 'FANZA' | 'DMM' | 'DUGA'
  siteName?: string;
}

export default function AdultSidebar({
  navigation = [], // 🚀 共通名称化
  makers = [],
  genres = [],
  actresses = [], 
  series = [],
  directors = [],
  authors = [],
  labels = [],
  aiAttributes = [], 
  recentPosts = [],
  currentBrand = 'FANZA',
}: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  // 🪄 セクション開閉状態：Tiperは情報量重視のため主要項目をOpen
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'PLATFORMS': true,
    'OFFICIAL_NAV': true,
    'AI_SPECS': true, 
    'GENRES': true,
    'MAKERS': false,
    'ACTRESSES': true,
    'LOGS': true
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // 現在表示中のブランドを小文字で取得（URL生成用）
  const activePlat = useMemo(() => {
    return currentBrand.toLowerCase();
  }, [currentBrand]);

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
      
      {/* 🌐 PLATFORM_MATRIX: ブランド切り替え機能 */}
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

      {/* 🚀 OFFICIAL_LAYERS: 動的に取得したサービス・フロア */}
      {navigation.length > 0 && (
        <section className={styles.sectionWrapper}>
          <div className={styles.sectionHeader} onClick={() => toggleSection('OFFICIAL_NAV')}>
            <h3 className={styles.headerTitle}>
              <span className={styles.icon}>⚡</span> {currentBrand}_LAYERS
            </h3>
            <span className={styles.arrow}>{openSections['OFFICIAL_NAV'] ? '▲' : '▼'}</span>
          </div>
          {openSections['OFFICIAL_NAV'] && (
            <div className={styles.contentBody}>
              <ul className={styles.masterList}>
                {navigation.map((service) => {
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

      {/* 💎 SYSTEM_SPEC_TAGS: AI属性 */}
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
                aiAttributes.map(item => {
                  const attrIdentifier = item.slug || String(item.id);
                  return (
                    <li key={`ai-attr-${item.id}`} className={styles.masterListItem}>
                      <Link href={`/adults/products?attribute=${attrIdentifier}`} className={styles.masterLink}>
                        <span className={styles.itemName}>
                          <span className={styles.tagPrefix}>#</span>{item.name}
                        </span>
                        <span className={styles.itemCount}>{item.count.toLocaleString()}</span>
                      </Link>
                    </li>
                  );
                })
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
      ].map((cat) => {
        const items = Array.isArray(cat.data) ? cat.data : (cat.data as any)?.results || [];
        
        return (
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
                  {items.length > 0 ? (
                    <>
                      {items.slice(0, 20).map((item: any) => (
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
        );
      })}

      {/* 📰 RECENT_REPORTS (WP記事) */}
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
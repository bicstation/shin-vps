'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  aiAttributes?: MasterItem[];
  recentPosts?: { id: string; title: string; slug?: string }[];
  currentBrand?: string;
  siteName?: string;
}

/**
 * =====================================================================
 * 🛰️ AdultSidebar - Fleet Integrated Edition (V5.1 Final)
 * ---------------------------------------------------------------------
 * BICSTATION 黄金艦隊アンテナを完全統合。
 * ラッパーからの動的ブランド指定に基づき、PLATFORM_MATRIX を自動制御。
 * =====================================================================
 */
export default function AdultSidebar({
  navigation = [],
  makers = [],
  genres = [],
  actresses = [], 
  aiAttributes = [], 
  recentPosts = [],
  currentBrand = 'FANZA', // SidebarWrapper から渡される小文字/大文字を許容
}: SidebarProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // 🪄 セクション開閉状態
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'PLATFORMS': true,
    'FLEET': true,      
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

  // 💡 ブランド判定の正規化 (常に小文字で比較・利用)
  const activePlat = useMemo(() => (currentBrand || 'fanza').toLowerCase(), [currentBrand]);

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

  // ⚜️ 黄金艦隊データ定義
  const fleetNetwork = [
    { name: '先行予約', slug: 'reserve', icon: '📅', tag: '速報' },
    { name: '熟女・人妻', slug: 'jukujo', icon: '💋', tag: '人妻' },
    { name: 'VR快楽', slug: 'vr', icon: '👓', tag: '360°' },
    { name: '美少女', slug: 'idol', icon: '💎', tag: 'アイドル' },
    { name: 'NTR・不倫', slug: 'ntr', icon: '💔', tag: '寝取' },
    { name: 'フェチ・巨乳', slug: 'fetish', icon: '🍓', tag: '爆乳' },
    { name: '名作まとめ', slug: 'wiki', icon: '📚', tag: 'Wiki' },
    { name: '中出し', slug: 'nakadashi', icon: '💦', tag: '生ハメ' },
    { name: '素人', slug: 'amateur', icon: '🔰', tag: '18禁' },
    { name: '処女・初体験', slug: 'virgin', icon: '🌸', tag: 'Debut' },
    { name: '現役女子校生', slug: 'jk', icon: '🏫', tag: 'JK' },
    { name: '現役女子大生', slug: 'jd', icon: '🎓', tag: 'JD' },
    { name: 'パパ活・放課後', slug: 'enkou', icon: '💰', tag: '援交' },
    { name: '新婚若妻', slug: 'wakazuma', icon: '💍', tag: 'エプロン' },
    { name: '白衣・ナース', slug: 'nurse', icon: '💉', tag: '病院' },
    { name: '背徳OL・女上司', slug: 'ol', icon: '👠', tag: 'スーツ' },
    { name: '痴女・野外', slug: 'chijo', icon: '👙', tag: '露出' },
    { name: '爆乳ギャル', slug: 'gal', icon: '👱‍♀️', tag: 'ヤリマン' },
    { name: '極薄スレンダー', slug: 'slender', icon: '👗', tag: '美体' },
  ];

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

      {/* ⚜️ BICSTATION_FLEET (黄金艦隊アンテナ統合) */}
      <section className={styles.sectionWrapper} style={{ border: '1px solid #d4af37' }}>
        <div className={`${styles.sectionHeader} ${styles.fleetHeader}`} onClick={() => toggleSection('FLEET')}>
          <h3 className={styles.headerTitle} style={{ color: '#d4af37' }}>
            <span className={styles.icon}>⚜️</span> BICSTATION_FLEET
          </h3>
          <span className={styles.arrow} style={{ color: '#d4af37' }}>{openSections['FLEET'] ? '▲' : '▼'}</span>
        </div>
        {openSections['FLEET'] && (
          <div className={styles.contentBody}>
            <ul className={styles.masterList}>
              <li className={styles.masterListItem}>
                <a href="https://main.tiper.live" target="_blank" rel="noopener noreferrer" className={styles.masterLink} style={{ background: 'rgba(212, 175, 55, 0.1)' }}>
                  <span className={styles.itemName} style={{ color: '#d4af37', fontWeight: 'bold' }}>▶ Tiper.Live (Main Portal)</span>
                </a>
              </li>
              {fleetNetwork.map((site) => (
                <li key={site.slug} className={styles.masterListItem}>
                  <a href={`https://${site.slug}.tiper.live`} target="_blank" rel="noopener noreferrer" className={styles.masterLink}>
                    <span className={styles.itemName}>
                      <span style={{ marginRight: '8px', filter: 'drop-shadow(0 0 2px rgba(212,175,55,0.5))' }}>{site.icon}</span>
                      {site.name}
                    </span>
                    <span className={styles.itemCount} style={{ fontSize: '9px', opacity: 0.6 }}>{site.tag}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* 🚀 OFFICIAL_LAYERS */}
      <section className={styles.sectionWrapper}>
        <div className={styles.sectionHeader} onClick={() => toggleSection('OFFICIAL_NAV')}>
          <h3 className={styles.headerTitle}>
            <span className={styles.icon}>⚡</span> {activePlat.toUpperCase()}_LAYERS
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

      {/* 🛠️ MASTER_DATA_INDEXES (ACTRESSES / GENRES / MAKERS) */}
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
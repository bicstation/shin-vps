'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './AdultSidebar.module.css';

// --- インターフェース定義 ---
interface MasterItem {
  id: number;
  name: string;
  slug: string | null;
  product_count: number;
}

interface SidebarProps {
  navigation?: any[];    // DUGA サービス/フロア構造
  makers?: MasterItem[];
  genres?: MasterItem[];
  actresses?: MasterItem[];
  aiAttributes?: any[];
  currentBrand?: string;
  siteName?: string;
}

/**
 * =====================================================================
 * ⚡ AdultSidebarAvFlash
 * ---------------------------------------------------------------------
 * AV Flash サイト専用のサイドバー。
 * DUGA のコンテンツを最優先に表示し、AI解析タグを強調したデザイン。
 * =====================================================================
 */
export default function AdultSidebarAvFlash({
  navigation = [],
  makers = [],
  genres = [],
  actresses = [],
  aiAttributes = [],
}: SidebarProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // AV Flashは特化型のため、主要セクションは最初から全て展開
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'CONTENTS': true,
    'AI_SPECS': true,
    'GENRES': true,
    'ACTRESSES': true,
    'MAKERS': false, // メーカー数が多い場合はここだけ閉じておく
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const toggleSection = (section: string) => 
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));

  // 汎用リンク生成
  const getSafeLink = (category: string, item: any) => {
    const identifier = item.slug || item.id;
    return `/${category}/${identifier}`;
  };

  return (
    <aside className={styles.sidebar}>
      
      {/* 🚀 DUGA CONTENTS MENU: DUGA独自のサービス階層 */}
      <section className={styles.sectionWrapper}>
        <div className={styles.sectionHeader} onClick={() => toggleSection('CONTENTS')}>
          <h3 className={styles.headerTitle}>
            <span className={styles.icon}>⚡</span> CONTENTS_MENU
          </h3>
          <span className={styles.arrow}>{openSections['CONTENTS'] ? '▲' : '▼'}</span>
        </div>
        {openSections['CONTENTS'] && (
          <div className={styles.contentBody}>
            <ul className={styles.masterList}>
              {navigation.length > 0 ? (
                navigation.map((item: any) => {
                  const sCode = item.service_code || item.slug || item.code;
                  const sName = item.name || item.service_name;
                  if (!sCode) return null;

                  return (
                    <li key={`duga-svc-${sCode}`} className={styles.masterListItem}>
                      <Link 
                        href={`/brand/duga/svc/${sCode}`} 
                        className={`${styles.masterLink} ${pathname?.includes(`/svc/${sCode}`) ? styles.active : ''}`}
                      >
                        <span className={styles.itemName}>{sName}</span>
                      </Link>
                    </li>
                  );
                })
              ) : (
                <li className={styles.emptyStatus}>LOADING_SERVICES...</li>
              )}
            </ul>
          </div>
        )}
      </section>

      {/* 💎 AI_SPEC_TAGS: 高画質・AIタグ */}
      <section className={styles.sectionWrapper} style={{ border: '1px solid var(--site-theme-alpha)' }}>
        <div className={`${styles.sectionHeader} ${styles.aiHeader}`} onClick={() => toggleSection('AI_SPECS')}>
          <h3 className={styles.headerTitle}>
            <span className={styles.icon}>💎</span> AI_SPEC_TAGS
          </h3>
          <span className={styles.arrow}>{openSections['AI_SPECS'] ? '▲' : '▼'}</span>
        </div>
        {openSections['AI_SPECS'] && (
          <div className={styles.contentBody}>
            <ul className={styles.masterList}>
              {aiAttributes.map(item => (
                <li key={`ai-tag-${item.id}`} className={styles.masterListItem}>
                  <Link href={`/adults/products?attribute=${item.slug || item.id}`} className={styles.masterLink}>
                    <span className={styles.itemName}>
                      <span className={styles.tagPrefix}>#</span>{item.name}
                    </span>
                    <span className={styles.itemCount}>{item.count.toLocaleString()}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* 🏷️ GENRES (Top 20) */}
      <section className={styles.sectionWrapper}>
        <div className={styles.sectionHeader} onClick={() => toggleSection('GENRES')}>
          <h3 className={styles.headerTitle}>
            <span className={styles.icon}>🏷️</span> GENRES
          </h3>
          <span className={styles.arrow}>{openSections['GENRES'] ? '▲' : '▼'}</span>
        </div>
        {openSections['GENRES'] && (
          <div className={styles.contentBody}>
            <ul className={styles.masterList}>
              {genres.slice(0, 20).map(item => (
                <li key={`genre-${item.id}`} className={styles.masterListItem}>
                  <Link href={getSafeLink('genre', item)} className={styles.masterLink}>
                    <span className={styles.itemName}>{item.name}</span>
                    <span className={styles.itemCount}>{item.product_count?.toLocaleString()}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* 👩 ACTRESSES (Top 20) */}
      <section className={styles.sectionWrapper}>
        <div className={styles.sectionHeader} onClick={() => toggleSection('ACTRESSES')}>
          <h3 className={styles.headerTitle}>
            <span className={styles.icon}>👩</span> ACTRESSES
          </h3>
          <span className={styles.arrow}>{openSections['ACTRESSES'] ? '▲' : '▼'}</span>
        </div>
        {openSections['ACTRESSES'] && (
          <div className={styles.contentBody}>
            <ul className={styles.masterList}>
              {actresses.slice(0, 20).map(item => (
                <li key={`actress-${item.id}`} className={styles.masterListItem}>
                  <Link href={getSafeLink('actress', item)} className={styles.masterLink}>
                    <span className={styles.itemName}>{item.name}</span>
                    <span className={styles.itemCount}>{item.product_count?.toLocaleString()}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* 🏢 MAKERS (Top 20) */}
      <section className={styles.sectionWrapper}>
        <div className={styles.sectionHeader} onClick={() => toggleSection('MAKERS')}>
          <h3 className={styles.headerTitle}>
            <span className={styles.icon}>🏢</span> MAKERS
          </h3>
          <span className={styles.arrow}>{openSections['MAKERS'] ? '▲' : '▼'}</span>
        </div>
        {openSections['MAKERS'] && (
          <div className={styles.contentBody}>
            <ul className={styles.masterList}>
              {makers.slice(0, 20).map(item => (
                <li key={`maker-${item.id}`} className={styles.masterListItem}>
                  <Link href={getSafeLink('maker', item)} className={styles.masterLink}>
                    <span className={styles.itemName}>{item.name}</span>
                    <span className={styles.itemCount}>{item.product_count?.toLocaleString()}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* 🛰️ SYSTEM_FOOTER */}
      <div className={styles.systemFooter}>
        <div className={styles.blinkContainer}>
          <span className={styles.blinkDot} />
          <span className={styles.statusLabel}>AV_FLASH_CORE: ONLINE</span>
        </div>
      </div>
    </aside>
  );
}
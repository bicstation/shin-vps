'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  category?: string;
  description?: string;
}

interface SidebarProps {
  navigation?: any[];
  makers?: MasterItem[];
  genres?: MasterItem[];
  actresses?: MasterItem[];
  aiAttributes?: MasterItem[];
  currentBrand?: string;
  siteName?: string;
}

/**
 * =====================================================================
 * ⚡ AdultSidebarAvFlash - Tactical Matrix Edition (Final v4.2)
 * ---------------------------------------------------------------------
 * Statsデータにはcategory属性がないため、キーワードから動的に
 * マトリックス（body/feature/scene/style）を再構成します。
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

  // 1. カテゴリー分類の定義（正規表現による自動判別）
  const CATEGORY_ORDER = [
    { 
      key: 'body', 
      label: 'BODY_SPEC', 
      icon: '👤', 
      regex: /mature|girl|body|slender|chubby|college|熟女|巨乳|美少女|ぽっちゃり|スレンダー|女子大生/i 
    },
    { 
      key: 'feature', 
      label: 'TECH_FEATURE', 
      icon: '📡', 
      regex: /feat|high|hd|4k|vr|3d|軽量|画質/i 
    },
    { 
      key: 'scene', 
      label: 'SCENE_REGISTRY', 
      icon: '🎬', 
      regex: /scene|shot|amateur|solo|nanpa|撮影|素人|単体|ナンパ/i 
    },
    { 
      key: 'style', 
      label: 'STYLE_LOG', 
      icon: '🧨', 
      regex: /style|fetish|cosplay|sm|squirting|creampie|痴漢|露出|中出し|制服|フェチ|潮吹き|拘束/i 
    }
  ];

  // 2. セクションの開閉状態
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'CONTENTS': true,
    'body': true,
    'feature': true,
    'scene': true,
    'style': true,
    'GENRES': false,
    'ACTRESSES': false,
    'MAKERS': false,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  /**
   * 🚀 属性マトリックスの動的生成（キーワード判定版）
   * sidebar-stats から届く category 無しのデータに対応。
   */
  const attributeMatrix = useMemo(() => {
    const matrix: Record<string, MasterItem[]> = {
      body: [],
      feature: [],
      scene: [],
      style: [],
      other: []
    };

    if (!aiAttributes || aiAttributes.length === 0) return matrix;

    aiAttributes.forEach(attr => {
      const matchText = `${attr.name}${attr.slug || ''}`.toLowerCase();
      
      // 定義した正規表現にマッチするか確認
      const foundCategory = CATEGORY_ORDER.find(cat => cat.regex.test(matchText));
      
      if (foundCategory) {
        matrix[foundCategory.key].push(attr);
      } else {
        matrix.other.push(attr);
      }
    });

    return matrix;
  }, [aiAttributes]);

  if (!mounted) return null;

  const toggleSection = (section: string) => 
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));

  return (
    <aside className={styles.sidebar}>
      
      {/* 🚀 DUGA CONTENTS MENU */}
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
                navigation.map((item: any, idx: number) => {
                  const sCode = item.service_code || item.slug || item.code;
                  const sName = item.name || item.service_name;
                  if (!sCode) return null;
                  return (
                    <li key={`duga-svc-${idx}`} className={styles.masterListItem}>
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

      {/* 💎 AI_SPEC_MATRIX (自動判定されたカテゴリー別に展開) */}
      {CATEGORY_ORDER.map((cat) => {
        const items = attributeMatrix[cat.key] || [];
        if (items.length === 0) return null;

        return (
          <section key={`matrix-${cat.key}`} className={styles.sectionWrapper} 
                   style={{ borderLeft: `2px solid ${cat.key === 'feature' ? 'var(--s-ai-gold, #ffb800)' : 'rgba(255,255,255,0.05)'}` }}>
            <div className={`${styles.sectionHeader} ${cat.key === 'feature' ? styles.aiHeader : ''}`} 
                 onClick={() => toggleSection(cat.key)}>
              <h3 className={styles.headerTitle}>
                <span className={styles.icon}>{cat.icon}</span> {cat.label}
              </h3>
              <span className={styles.arrow}>{openSections[cat.key] ? '▲' : '▼'}</span>
            </div>
            {openSections[cat.key] && (
              <div className={styles.contentBody}>
                <ul className={styles.masterList}>
                  {items.map((item, idx) => (
                    <li key={`ai-tag-${item.id || idx}`} className={styles.masterListItem}>
                      <Link href={`/adults/products?attribute=${item.slug || item.id}`} className={styles.masterLink}>
                        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                          <span className={styles.itemName}>
                            <span className={styles.tagPrefix}>#</span>{item.name}
                          </span>
                        </div>
                        <span className={styles.itemCount}>
                          {(item.count || item.product_count || 0).toLocaleString()}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        );
      })}

      {/* 🏷️ GENRES / ACTRESSES / MAKERS (標準セクション) */}
      {[
        { id: 'GENRES', data: genres, icon: '🏷️', path: 'genre' },
        { id: 'ACTRESSES', data: actresses, icon: '👩', path: 'actress' },
        { id: 'MAKERS', data: makers, icon: '🏢', path: 'maker' }
      ].map((sec) => (
        <section key={sec.id} className={styles.sectionWrapper}>
          <div className={styles.sectionHeader} onClick={() => toggleSection(sec.id)}>
            <h3 className={styles.headerTitle}>
              <span className={styles.icon}>{sec.icon}</span> {sec.id}
            </h3>
            <span className={styles.arrow}>{openSections[sec.id] ? '▲' : '▼'}</span>
          </div>
          {openSections[sec.id] && (
            <div className={styles.contentBody}>
              <ul className={styles.masterList}>
                {sec.data && sec.data.length > 0 ? (
                  sec.data.map((item, idx) => (
                    <li key={`${sec.id}-${item.id || idx}`} className={styles.masterListItem}>
                      <Link href={`/${sec.path}/${item.slug || item.id}`} className={styles.masterLink}>
                        <span className={styles.itemName}>{item.name}</span>
                        <span className={styles.itemCount}>
                          {(item.product_count || 0).toLocaleString()}
                        </span>
                      </Link>
                    </li>
                  ))
                ) : (
                  <li className={styles.emptyStatus}>NO_DATA</li>
                )}
              </ul>
            </div>
          )}
        </section>
      ))}

      {/* 🛰️ SYSTEM_FOOTER */}
      <div className={styles.systemFooter}>
        <div className={styles.blinkContainer}>
          <span className={styles.blinkDot} />
          <span className={styles.statusLabel}>AV_FLASH_MATRIX: SYNCHRONIZED (STATS_MODE)</span>
        </div>
      </div>
    </aside>
  );
}
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './AdultSidebarAvFlash.module.css';

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
 * 🛰️ AVFLASH GOLD-FLEET NETWORK (提督提供データ完全移植)
 */
const AVFLASH_FLEET = [
  { name: "AVFLASH 総合ポータル", url: "https://portal.avflash.xyz", tag: "PORTAL", icon: "💎" },
  { name: "AVFLASH 速報/予約", url: "https://reserve.avflash.xyz", tag: "RSV", icon: "⚡" },
  { name: "熟女・人妻ルポ", url: "https://jukujo.avflash.xyz", tag: "JKJ", icon: "💄" },
  { name: "最先端VR没入体験", url: "https://vr.avflash.xyz", tag: "VR", icon: "🕶️" },
  { name: "専属アイドル推し", url: "https://idol.avflash.xyz", tag: "IDOL", icon: "✨" },
  { name: "NTR心理心理アナライズ", url: "https://ntr.avflash.xyz", tag: "NTR", icon: "💔" },
  { name: "特殊フェチ目利き", url: "https://fetish.avflash.xyz", tag: "FTS", icon: "👠" },
  { name: "AV全集キュレーション", url: "https://wiki.avflash.xyz", tag: "WIKI", icon: "📚" },
  { name: "生ハメ快楽肯定", url: "https://nakadashi.avflash.xyz", tag: "NKD", icon: "💧" },
  { name: "素人自撮り実録", url: "https://amateur.avflash.xyz", tag: "AMT", icon: "📹" },
  { name: "初撮り処女美学", url: "https://virgin2.avflash.xyz", tag: "VIR", icon: "🌸" },
  { name: "JK制服ウォッチャー", url: "https://jk.avflash.xyz", tag: "JK", icon: "🎒" },
  { name: "JD開放性活レポ", url: "https://jd.avflash.xyz", tag: "JD", icon: "🎓" },
  { name: "援助交際現場ルポ", url: "https://enkou.avflash.xyz", tag: "ENK", icon: "📱" },
  { name: "若妻情事ドキュメント", url: "https://wakazuma.avflash.xyz", tag: "WZM", icon: "🏠" },
  { name: "白衣ナース密室治療", url: "https://nurse.avflash.xyz", tag: "NRS", icon: "🏥" },
  { name: "OLオフィスラブ背徳", url: "https://ol.avflash.xyz", tag: "OL", icon: "💼" },
  { name: "野外露出痴女ハンター", url: "https://chijo.avflash.xyz", tag: "CJO", icon: "🌳" },
  { name: "キャバ嬢・ギャル専", url: "https://gal.avflash.xyz", tag: "GAL", icon: "👠" },
  { name: "スレンダー曲線美", url: "https://slender.avflash.xyz", tag: "SLD", icon: "💃" }
];

export default function AdultSidebarAvFlash({
  navigation = [],
  makers = [],
  genres = [],
  actresses = [],
  aiAttributes = [],
}: SidebarProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // 1. カテゴリー分類の定義
  const CATEGORY_ORDER = [
    { key: 'body', label: 'BODY_SPEC', icon: '👤', regex: /mature|girl|body|slender|chubby|college|熟女|巨乳|美少女|ぽっちゃり|スレンダー|女子大生/i },
    { key: 'feature', label: 'TECH_FEATURE', icon: '📡', regex: /feat|high|hd|4k|vr|3d|軽量|画質/i },
    { key: 'scene', label: 'SCENE_REGISTRY', icon: '🎬', regex: /scene|shot|amateur|solo|nanpa|撮影|素人|単体|ナンパ/i },
    { key: 'style', label: 'STYLE_LOG', icon: '🧨', regex: /style|fetish|cosplay|sm|squirting|creampie|痴漢|露出|中出し|制服|フェチ|潮吹き|拘束/i }
  ];

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'FLEET': true,
    'CONTENTS': true,
    'body': false,
    'feature': false,
    'scene': false,
    'style': false,
    'GENRES': false,
    'ACTRESSES': false,
    'MAKERS': false,
  });

  useEffect(() => { setMounted(true); }, []);

  const attributeMatrix = useMemo(() => {
    const matrix: Record<string, MasterItem[]> = { body: [], feature: [], scene: [], style: [], other: [] };
    if (!aiAttributes) return matrix;
    aiAttributes.forEach(attr => {
      const matchText = `${attr.name}${attr.slug || ''}`.toLowerCase();
      const foundCategory = CATEGORY_ORDER.find(cat => cat.regex.test(matchText));
      if (foundCategory) matrix[foundCategory.key].push(attr);
      else matrix.other.push(attr);
    });
    return matrix;
  }, [aiAttributes]);

  if (!mounted) return null;

  const toggleSection = (section: string) => 
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));

  return (
    <aside className={styles.sidebar}>
      
      {/* ⚜️ AVFLASH GOLD-FLEET (黄金艦隊サテライト) */}
      <section className={styles.sectionWrapper}>
        <div className={`${styles.sectionHeader} ${styles.fleetHeader}`} onClick={() => toggleSection('FLEET')}>
          <h3 className={styles.headerTitle}>
            <span className={styles.icon}>🔱</span> AVFLASH_FLEET
          </h3>
          <span className={styles.arrow}>{openSections['FLEET'] ? '▲' : '▼'}</span>
        </div>
        {openSections['FLEET'] && (
          <div className={styles.contentBody}>
            <ul className={styles.masterList}>
              {AVFLASH_FLEET.map((fleet, idx) => (
                <li key={idx} className={styles.masterListItem}>
                  <a href={fleet.url} target="_blank" rel="noopener noreferrer" className={styles.masterLink}>
                    <span className={styles.itemName}>
                      <span className={styles.tagPrefix}>[{fleet.tag}]</span> {fleet.name}
                    </span>
                    <span className={styles.itemCount}>{fleet.icon}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* ⚡ CONTENTS MENU (DUGA等) */}
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
                      <Link href={`/brand/duga/svc/${sCode}`} className={`${styles.masterLink} ${pathname?.includes(`/svc/${sCode}`) ? styles.active : ''}`}>
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

      {/* 💎 AI_SPEC_MATRIX (動的判定カテゴリー) */}
      {CATEGORY_ORDER.map((cat) => {
        const items = attributeMatrix[cat.key] || [];
        if (items.length === 0) return null;
        return (
          <section key={`matrix-${cat.key}`} className={styles.sectionWrapper} 
                   style={{ borderLeft: cat.key === 'feature' ? '3px solid var(--s-ai-gold)' : '' }}>
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
                        <span className={styles.itemName}><span className={styles.tagPrefix}>#</span>{item.name}</span>
                        <span className={styles.itemCount}>{(item.count || item.product_count || 0).toLocaleString()}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        );
      })}

      {/* 🏷️ GENRES / ACTRESSES / MAKERS */}
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
                        <span className={styles.itemCount}>{(item.product_count || 0).toLocaleString()}</span>
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

      {/* ⚙️ SYSTEM_FOOTER */}
      <div className={styles.systemFooter}>
        <div className={styles.statusRow}>
          <div className={styles.blinkContainer}>
            <div className={styles.blinkDot} />
            <span className={styles.statusLabel}>AV_FLASH_MATRIX: ONLINE</span>
          </div>
          <span className={`${styles.statusLabel} ${styles.glitchText}`}>CORE_SYNCHRONIZED</span>
        </div>
      </div>
    </aside>
  );
}
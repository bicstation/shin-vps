'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getSiteMetadata, getSiteColor } from '../lib/siteConfig';
import { PCProduct } from '@/shared/lib/api/types';
import styles from './Sidebar.module.css';

// ✅ 五十音グループ化ユーティリティ
import { groupByGojuon } from '../utils/grouping';

// --- 型定義 ---
interface MasterItem {
  id: number;
  name: string;
  slug: string | null;
  product_count: number;
}

interface FanzaFloor {
  name: string;
  slug: string;
  count: number;
}

interface FanzaService {
  name: string;
  slug: string;
  floors: FanzaFloor[];
}

interface SidebarData {
  [category: string]: any;
  fanza_hierarchy?: FanzaService[];
}

interface SidebarProps {
  activeMenu?: string;
  makers?: any[]; 
  recentPosts?: { id: string; title: string; slug?: string }[];
  product?: PCProduct;
}

export default function Sidebar({ makers: initialMakers = [], recentPosts = [], product }: SidebarProps) {
  const site = getSiteMetadata();
  const siteColor = getSiteColor(site.site_name);
  const isAdult = site.site_group === 'adult';
  const pathname = usePathname();

  // --- ステート管理 ---
  const [dynamicStats, setDynamicStats] = useState<SidebarData | null>(null);
  const [groupedActresses, setGroupedActresses] = useState<Record<string, any[]>>({});
  const [genres, setGenres] = useState<MasterItem[]>([]);
  const [series, setSeries] = useState<MasterItem[]>([]);
  const [directors, setDirectors] = useState<MasterItem[]>([]);
  const [makers, setMakers] = useState<any[]>(initialMakers);
  const [isLoading, setIsLoading] = useState(true);

  // セクションの開閉状態
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'SPEC': true,
    'PLATFORMS': true,
    'MAIN': true,
    'ACTRESSES': false,
    'GENRES': true,
    'SERIES': false,
    'CATEGORIES': true,
    'SOURCE_EXPLORER': false,
    'LATEST': true,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // ✅ 安全なURL生成ヘルパー
  const getSafeLink = (type: string, item: any) => {
    const identifier = item.slug && item.slug !== "null" ? item.slug : item.id;
    return `/${type}/${identifier}`;
  };

  // ✅ JSONのみを受け入れる防弾仕様フェッチ
  const safeJsonFetch = async (url: string) => {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        return await res.json();
      }
      return null;
    } catch (e) {
      console.warn(`[Sidebar API Error]: ${url}`, e);
      return null;
    }
  };

  // ✅ メイン・エフェクト: Django URLS.PY に完全準拠した取得ロジック
  useEffect(() => {
    async function fetchSidebarData() {
      setIsLoading(true);
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8083/api';
      const cleanBase = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase;

      // 引数の組み立て (?api_source=DUGA)
      const sourceQuery = isAdult ? '?api_source=DUGA' : '';

      if (isAdult) {
        // 1. 女優データの取得 (五十音順)
        const actressData = await safeJsonFetch(`${cleanBase}/actresses/${sourceQuery}${sourceQuery ? '&' : '?'}limit=300`);
        if (actressData) {
          const list = actressData.results || (Array.isArray(actressData) ? actressData : []);
          setGroupedActresses(groupByGojuon(list));
        }

        // 2. マスターデータの並列取得 (スラッシュ必須)
        const [gData, sData, dData, mData] = await Promise.all([
          safeJsonFetch(`${cleanBase}/genres/${sourceQuery}${sourceQuery ? '&' : '?'}limit=15&ordering=-product_count`),
          safeJsonFetch(`${cleanBase}/series/${sourceQuery}${sourceQuery ? '&' : '?'}limit=10&ordering=-product_count`),
          safeJsonFetch(`${cleanBase}/directors/${sourceQuery}${sourceQuery ? '&' : '?'}limit=10&ordering=-product_count`),
          safeJsonFetch(`${cleanBase}/makers/${sourceQuery}${sourceQuery ? '&' : '?'}limit=20&ordering=-product_count`),
        ]);

        if (gData) setGenres(gData.results || (Array.isArray(gData) ? gData : []));
        if (sData) setSeries(sData.results || (Array.isArray(sData) ? sData : []));
        if (dData) setDirectors(dData.results || (Array.isArray(dData) ? dData : []));
        
        // Propsが空、またはDUGAデータを優先する場合にmakersをセット
        if (mData && (initialMakers.length === 0 || isAdult)) {
          setMakers(mData.results || (Array.isArray(mData) ? mData : []));
        }
      } else {
        // PCサイト用統計 (存在するエンドポイントを使用)
        const pcStats = await safeJsonFetch(`${cleanBase}/pc-sidebar-stats/`);
        if (pcStats) setDynamicStats(pcStats);
      }
      
      setIsLoading(false);
    }
    fetchSidebarData();
  }, [isAdult, initialMakers]);

  // UIパーツ: セクション見出し
  const SectionHeader = ({ title, id, icon }: { title: string, id: string, icon?: string }) => (
    <div 
      className={styles.sectionTitle} 
      onClick={() => toggleSection(id)}
      style={{ 
        borderLeft: openSections[id] ? `3px solid ${siteColor}` : '3px solid transparent'
      }}
    >
      <span>
        {icon && <span style={{ marginRight: '8px' }}>{icon}</span>}
        {title}
      </span>
      <span style={{ 
        transform: openSections[id] ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform 0.3s ease'
      }}>▼</span>
    </div>
  );

  return (
    <aside className={styles.sidebar}>
      
      {/* 💻 PC SPEC CARD */}
      {!isAdult && product && (
        <div className={styles.sectionWrapper}>
          <SectionHeader title="HARDWARE ANALYSIS" id="SPEC" icon="💾" />
          {openSections['SPEC'] && (
            <div className={styles.productSpecCard}>
              <div className={styles.specScoreBox}>
                <div className={styles.scoreCircle} style={{ borderTopColor: siteColor }}>
                    <span className={styles.scoreValue} style={{ color: siteColor }}>{product.spec_score}</span>
                </div>
                <span className={styles.scoreLabel}>SYSTEM_RANK</span>
              </div>
              <div className={styles.miniSpecList}>
                {product.cpu_model && <div className={styles.specRow}><small>CPU</small><span>{product.cpu_model}</span></div>}
                {product.gpu_model && <div className={styles.specRow}><small>GPU</small><span>{product.gpu_model}</span></div>}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 🚀 PLATFORM MATRIX */}
      <div className={styles.sectionWrapper}>
        <SectionHeader title="PLATFORM MATRIX" id="PLATFORMS" icon="📡" />
        {openSections['PLATFORMS'] && (
          <div className={styles.platformGrid}>
            {[
              { name: 'DUGA', path: '/brand/duga' },
              { name: 'FANZA', path: '/brand/fanza' },
              { name: 'DMM', path: '/brand/dmm' },
            ].map((plat) => (
              <Link key={plat.name} href={plat.path} className={styles.platLink}>
                <div 
                  className={`${styles.platBtn} ${pathname?.includes(plat.path) ? styles.platActive : ''}`}
                  style={{ '--active-color': siteColor } as any}
                >
                  {plat.name}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* 🔥 COMMAND CENTER */}
      <div className={styles.sectionWrapper}>
        <SectionHeader title="COMMAND CENTER" id="MAIN" icon="🕹️" />
        {openSections['MAIN'] && (
          <ul className={styles.accordionContent}>
            <li>
              <Link href={isAdult ? '/ranking/' : '/pc-finder/'} className={styles.specialLink} 
                    style={{ background: `linear-gradient(45deg, ${siteColor}33, transparent)`, borderRight: `2px solid ${siteColor}` }}>
                <span className={styles.glitchText}>{isAdult ? '🔥 総合ランキング' : '🔍 AIスペック診断'}</span>
              </Link>
            </li>
          </ul>
        )}
      </div>

      {/* 💃 ACTRESSES (五十音) */}
      {isAdult && Object.keys(groupedActresses).length > 0 && (
        <div className={styles.sectionWrapper}>
          <SectionHeader title="ACTRESSES" id="ACTRESSES" icon="💃" />
          {openSections['ACTRESSES'] && (
            <div className={styles.scrollArea}>
              {Object.entries(groupedActresses).map(([row, list]) => (
                <details key={row} className={styles.detailsGroup}>
                  <summary className={styles.subCategoryLabel}>
                    <span style={{ color: siteColor }}>●</span> {row} <small>({list.length})</small>
                  </summary>
                  <ul className={styles.nestedList}>
                    {list.map((a) => (
                      <li key={a.id}>
                        <Link href={getSafeLink('actress', a)} className={styles.link}>
                          <span className={styles.linkText}>{a.name}</span>
                          {a.product_count > 0 && <span className={styles.badge}>{a.product_count}</span>}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 🏷️ GENRES */}
      {isAdult && genres.length > 0 && (
        <div className={styles.sectionWrapper}>
          <SectionHeader title="GENRES" id="GENRES" icon="🏷️" />
          {openSections['GENRES'] && (
            <ul className={styles.accordionContent}>
              {genres.map(g => (
                <li key={g.id}>
                  <Link href={getSafeLink('genre', g)} className={styles.link}>
                    <span className={styles.linkText}>{g.name}</span>
                    <span className={styles.badge}>{g.product_count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* 🏢 PRODUCTION BRANDS (メーカー) */}
      <div className={styles.sectionWrapper}>
        <SectionHeader title={isAdult ? "PRODUCTION BRANDS" : "MANUFACTURERS"} id="CATEGORIES" icon="🏢" />
        {openSections['CATEGORIES'] && (
          <ul className={styles.accordionContent}>
            {makers.length > 0 ? makers.slice(0, 25).map((item, idx) => (
              <li key={idx}>
                <Link href={getSafeLink('brand', item)} className={styles.link}>
                  <span className={styles.linkText}>{(item.name || item.maker || "").toUpperCase()}</span>
                  <span className={styles.badge}>{item.product_count || item.count}</span>
                </Link>
              </li>
            )) : (
              <li className={styles.emptyLink}>NO BRANDS LOADED</li>
            )}
          </ul>
        )}
      </div>

      {/* 📝 INTEL LOGS (最新記事) */}
      <div className={styles.sectionWrapper}>
        <SectionHeader title="INTEL LOGS" id="LATEST" icon="📄" />
        {openSections['LATEST'] && (
          <ul className={styles.accordionContent}>
            {recentPosts.length > 0 ? recentPosts.map((post) => (
              <li key={post.id}>
                <Link href={`/news/${post.slug || post.id}`} className={styles.link}>
                  <span className={styles.recentTitle}>{post.title}</span>
                </Link>
              </li>
            )) : (
              <li className={styles.emptyLink}>NO RECENT LOGS</li>
            )}
          </ul>
        )}
      </div>

      {/* 📟 SYSTEM STATUS */}
      <div className={styles.systemStatus}>
        <div className={styles.statusLine}>
          <span className={styles.statusDot} style={{ backgroundColor: isLoading ? '#ffaa00' : '#00ffaa' }} />
          <span>SYSTEM_{isLoading ? 'SYNCING' : 'READY'}</span>
        </div>
        <div className={styles.timestamp}>
          {new Date().toISOString().split('T')[0].replace(/-/g, '.')}
        </div>
      </div>
    </aside>
  );
}
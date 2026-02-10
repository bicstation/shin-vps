'use client';

import React, { useEffect, useState, useMemo } from 'react';
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

export default function Sidebar({ makers = [], recentPosts = [], product }: SidebarProps) {
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
  const [isLoading, setIsLoading] = useState(true);

  // セクションの開閉状態（初期値）
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'SPEC': true,
    'PLATFORMS': true,
    'MAIN': true,
    'ACTRESSES': false,
    'GENRES': true,
    'SERIES': false,
    'DIRECTORS': false,
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

  // ✅ 防弾仕様のデータフェッチ (JSONのみを受け入れ、HTMLエラーを無視する)
  const safeJsonFetch = async (url: string) => {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        return await res.json();
      }
      return null;
    } catch (e) {
      console.warn(`[Sidebar API Silent Error] Failed to fetch: ${url}`);
      return null;
    }
  };

  // ✅ メイン・エフェクト: データ取得
  useEffect(() => {
    async function fetchSidebarData() {
      setIsLoading(true);
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://api-tiper-host:8083/api';
      const cleanBase = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase;

      // 1. 統計情報の取得
      const statsUrl = isAdult ? `${cleanBase}/adult-stats/` : `${cleanBase}/pc-sidebar-stats/`;
      const stats = await safeJsonFetch(statsUrl);
      if (stats) setDynamicStats(stats.results || stats);

      if (isAdult) {
        // 2. 女優データの取得とグループ化
        const actressData = await safeJsonFetch(`${cleanBase}/actresses/?limit=500`);
        if (actressData) {
          const list = Array.isArray(actressData) ? actressData : (actressData.results || []);
          setGroupedActresses(groupByGojuon(list));
        }

        // 3. その他マスターデータの並列取得
        const [g, s, d] = await Promise.all([
          safeJsonFetch(`${cleanBase}/genres/?limit=20&ordering=-product_count`),
          safeJsonFetch(`${cleanBase}/series/?limit=15&ordering=-product_count`),
          safeJsonFetch(`${cleanBase}/directors/?limit=10&ordering=-product_count`),
        ]);

        if (g) setGenres(Array.isArray(g) ? g : (g.results || []));
        if (s) setSeries(Array.isArray(s) ? s : (s.results || []));
        if (d) setDirectors(Array.isArray(d) ? d : (d.results || []));
      }
      setIsLoading(false);
    }
    fetchSidebarData();
  }, [isAdult]);

  // --- UIコンポーネント: セクション見出し ---
  const SectionHeader = ({ title, id, icon }: { title: string, id: string, icon?: string }) => (
    <div 
      className={styles.sectionTitle} 
      onClick={() => toggleSection(id)}
      style={{ 
        cursor: 'pointer', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderLeft: openSections[id] ? `3px solid ${siteColor}` : '3px solid transparent',
        paddingLeft: '10px'
      }}
    >
      <span style={{ color: openSections[id] ? '#fff' : '#888', fontWeight: 'bold', fontSize: '0.75rem', letterSpacing: '1px' }}>
        {icon && <span style={{ marginRight: '8px' }}>{icon}</span>}
        {title}
      </span>
      <span style={{ 
        transform: openSections[id] ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        fontSize: '0.6rem',
        opacity: 0.5
      }}>▼</span>
    </div>
  );

  return (
    <aside className={styles.sidebar}>
      
      {/* 💻 PC SPEC CARD (PCサイト詳細時のみ) */}
      {!isAdult && product && (
        <div className={styles.sectionWrapper}>
          <SectionHeader title="HARDWARE ANALYSIS" id="SPEC" icon="💾" />
          {openSections['SPEC'] && (
            <div className={styles.productSpecCard}>
              <div className={styles.specScoreBox} style={{ borderColor: `${siteColor}44` }}>
                <div className={styles.scoreCircle} style={{ borderTopColor: siteColor }}>
                    <span className={styles.scoreValue} style={{ color: siteColor }}>{product.spec_score}</span>
                </div>
                <span className={styles.scoreLabel}>AI_SYSTEM_RANK</span>
              </div>
              <div className={styles.miniSpecList}>
                {product.cpu_model && <div className={styles.specRow}><small>CPU</small><span>{product.cpu_model}</span></div>}
                {product.gpu_model && <div className={styles.specRow}><small>GPU</small><span>{product.gpu_model}</span></div>}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 🚀 PLATFORM MATRIX (ブランド・プラットフォーム切替) */}
      <div className={styles.sectionWrapper}>
        <SectionHeader title="PLATFORM MATRIX" id="PLATFORMS" icon="📡" />
        {openSections['PLATFORMS'] && (
          <div className={styles.platformGrid}>
            {[
              { name: 'DUGA', path: '/brand/duga' },
              { name: 'FANZA', path: '/brand/fanza' },
              { name: 'DMM', path: '/brand/dmm' },
            ].map((plat) => {
              const isActive = pathname?.includes(plat.path);
              return (
                <Link key={plat.name} href={plat.path} className={styles.platLink}>
                  <div 
                    className={`${styles.platBtn} ${isActive ? styles.platActive : ''}`}
                    style={{ '--active-color': siteColor } as any}
                  >
                    {plat.name}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* 🔥 NAVIGATION HUB */}
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

      {/* 💃 ACTRESSES (五十音インデックス) */}
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

      {/* 🏷️ MASTER TAXONOMY (ジャンル・シリーズ等) */}
      {isAdult && (
        <>
          {genres.length > 0 && (
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

          {series.length > 0 && (
            <div className={styles.sectionWrapper}>
              <SectionHeader title="SERIES" id="SERIES" icon="📺" />
              {openSections['SERIES'] && (
                <ul className={styles.accordionContent}>
                  {series.map(s => (
                    <li key={s.id}>
                      <Link href={getSafeLink('series', s)} className={styles.link}>
                        <span className={styles.linkText}>{s.name}</span>
                        <span className={styles.badge}>{s.product_count}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </>
      )}

      {/* 🏢 BRAND NODES (メーカーリスト) */}
      <div className={styles.sectionWrapper}>
        <SectionHeader title={isAdult ? "PRODUCTION BRANDS" : "MANUFACTURERS"} id="CATEGORIES" icon="🏢" />
        {openSections['CATEGORIES'] && (
          <ul className={styles.accordionContent}>
            {makers.slice(0, 30).map((item, idx) => {
              const mName = item.name || item.maker || "Unknown Node";
              const mSlug = (item.slug || (item.maker ? item.maker.toLowerCase() : 'unknown'));
              return (
                <li key={idx}>
                  <Link href={`/brand/${mSlug}`} className={styles.link}>
                    <span className={styles.linkText}>{mName.toUpperCase()}</span>
                    {(item.count || item.product_count) !== undefined && (
                      <span className={styles.badge}>{item.count || item.product_count}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* 🔞 SOURCE EXPLORER (FANZA階層構造) */}
      {isAdult && dynamicStats?.fanza_hierarchy && (
        <div className={styles.sectionWrapper}>
          <SectionHeader title="SOURCE EXPLORER" id="SOURCE_EXPLORER" icon="📂" />
          {openSections['SOURCE_EXPLORER'] && (
            <div className={styles.accordionContent}>
              {dynamicStats.fanza_hierarchy.map((service: FanzaService) => (
                <div key={service.slug} className={styles.serviceBlock}>
                  <div className={styles.subCategoryLabel} style={{ color: siteColor, fontSize: '0.65rem' }}>{service.name.toUpperCase()}</div>
                  <ul className={styles.nestedList}>
                    {service.floors.map((floor) => (
                      <li key={floor.slug}>
                        <Link href={`/adults/fanza/${service.slug}/${floor.slug}`} className={styles.link}>
                          <span className={styles.linkText}>{floor.name}</span>
                          <span className={styles.badge}>{floor.count}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
        <div className={styles.timestamp}>{new Date().toISOString().split('T')[0].replace(/-/g, '.')}</div>
      </div>
    </aside>
  );
}
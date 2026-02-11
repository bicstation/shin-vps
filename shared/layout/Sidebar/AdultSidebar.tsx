'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getSiteMetadata, getSiteColor } from '../../lib/siteConfig';
import { PCProduct } from '@/shared/lib/api/types';
import styles from './Sidebar.module.css';

// ✅ 五十音グループ化ユーティリティ
import { groupByGojuon } from '../../utils/grouping';

// --- 型定義 ---
interface MasterItem {
  id: number;
  name: string;
  slug: string | null;
  product_count: number;
  count?: number;
}

interface SidebarProps {
  activeMenu?: string;
  makers?: any[]; 
  recentPosts?: { id: string; title: string; slug?: string }[];
  product?: PCProduct;
}

export default function AdultSidebar({ makers: initialMakers = [], recentPosts = [] }: SidebarProps) {
  const site = getSiteMetadata();
  const siteColor = getSiteColor(site.site_name);
  const pathname = usePathname();

  // --- ステート管理 ---
  const [groupedActresses, setGroupedActresses] = useState<Record<string, any[]>>({});
  const [genres, setGenres] = useState<MasterItem[]>([]);
  const [series, setSeries] = useState<MasterItem[]>([]);
  const [directors, setDirectors] = useState<MasterItem[]>([]);
  const [makers, setMakers] = useState<any[]>(initialMakers);
  const [isLoading, setIsLoading] = useState(true);

  // セクションの開閉状態
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'PLATFORMS': true,
    'MAIN': true,
    'ACTRESSES': false,
    'GENRES': true,
    'SERIES': false,
    'CATEGORIES': true,
    'LATEST': true,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  /**
   * ✅ 安全なURL生成ヘルパー
   * DB側の slug に日本語名が入ったため、そのまま identifier として使用可能になりました。
   */
  const getSafeLink = (type: string, item: any) => {
    // slug を優先。なければフォールバックとして id を使用
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
      console.warn(`[AdultSidebar API Error]: ${url}`, e);
      return null;
    }
  };

  /**
   * ✅ メイン・エフェクト
   */
  useEffect(() => {
    async function fetchSidebarData() {
      setIsLoading(true);
      const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8083/api').replace(/\/$/, '');
      const sourceQuery = '?api_source=DUGA';

      // 並列データフェッチ
      const [actressData, gData, sData, dData, mData] = await Promise.all([
        safeJsonFetch(`${apiBase}/actresses/${sourceQuery}&limit=300&ordering=-product_count`),
        safeJsonFetch(`${apiBase}/genres/${sourceQuery}&limit=100&ordering=-product_count`),
        safeJsonFetch(`${apiBase}/series/${sourceQuery}&limit=100&ordering=-product_count`),
        safeJsonFetch(`${apiBase}/directors/${sourceQuery}&limit=100&ordering=-product_count`),
        safeJsonFetch(`${apiBase}/makers/${sourceQuery}&limit=100&ordering=-product_count`),
      ]);

      // 1. 女優：全体から上位300件を取得し、五十音グループ化
      if (actressData) {
        const list = actressData.results || (Array.isArray(actressData) ? actressData : []);
        setGroupedActresses(groupByGojuon(list));
      }

      // 2. その他のマスターデータ：作品数順にソートしてTop 20に絞る
      const filterTop20 = (data: any) => {
        const list = data?.results || (Array.isArray(data) ? data : []);
        return [...list]
          .sort((a, b) => (b.product_count || b.count || 0) - (a.product_count || a.count || 0))
          .slice(0, 20);
      };

      if (gData) setGenres(filterTop20(gData));
      if (sData) setSeries(filterTop20(sData));
      if (dData) setDirectors(filterTop20(dData));
      
      if (mData && initialMakers.length === 0) {
        setMakers(filterTop20(mData));
      }
      
      setIsLoading(false);
    }
    fetchSidebarData();
  }, [initialMakers]);

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
              <Link href='/ranking/' className={styles.specialLink} 
                    style={{ background: `linear-gradient(45deg, ${siteColor}33, transparent)`, borderRight: `2px solid ${siteColor}` }}>
                <span className={styles.glitchText}>🔥 総合ランキング</span>
              </Link>
            </li>
          </ul>
        )}
      </div>

      {/* 💃 ACTRESSES */}
      <div className={styles.sectionWrapper}>
        <SectionHeader title="ACTRESSES" id="ACTRESSES" icon="💃" />
        {openSections['ACTRESSES'] && (
          <div className={styles.scrollArea}>
            <Link href="/actress" className={styles.allLink}>＞ 女優一覧を表示</Link>
            {Object.entries(groupedActresses).map(([row, list]) => (
              <details key={row} className={styles.detailsGroup}>
                <summary className={styles.subCategoryLabel}>
                  <span style={{ color: siteColor }}>●</span> {row} <small>({list.length})</small>
                </summary>
                <ul className={styles.nestedList}>
                  {list.slice(0, 20).map((a) => (
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

      {/* 🏷️ GENRES */}
      <div className={styles.sectionWrapper}>
        <SectionHeader title="GENRES" id="GENRES" icon="🏷️" />
        {openSections['GENRES'] && (
          <ul className={styles.accordionContent}>
            <li><Link href="/genre" className={styles.allLink}>＞ ジャンル一覧を表示</Link></li>
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

      {/* 🏢 PRODUCTION BRANDS */}
      <div className={styles.sectionWrapper}>
        <SectionHeader title="PRODUCTION BRANDS" id="CATEGORIES" icon="🏢" />
        {openSections['CATEGORIES'] && (
          <ul className={styles.accordionContent}>
            <li><Link href="/maker" className={styles.allLink}>＞ メーカー一覧を表示</Link></li>
            {makers.map((item, idx) => (
              <li key={idx}>
                <Link href={getSafeLink('maker', item)} className={styles.link}>
                  <span className={styles.linkText}>{(item.name || "").toUpperCase()}</span>
                  <span className={styles.badge}>{item.product_count || item.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 📝 INTEL LOGS */}
      <div className={styles.sectionWrapper}>
        <SectionHeader title="INTEL LOGS" id="LATEST" icon="📄" />
        {openSections['LATEST'] && (
          <ul className={styles.accordionContent}>
            {recentPosts.length > 0 ? recentPosts.slice(0, 5).map((post) => (
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
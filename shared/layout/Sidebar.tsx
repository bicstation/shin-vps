'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { getSiteMetadata, getSiteColor } from '../lib/siteConfig';
import { PCProduct } from '@/shared/lib/api/types';
import styles from './Sidebar.module.css';

// ✅ インポート：五十音グループ化ユーティリティ
import { groupByGojuon } from '../utils/grouping';

// --- 型定義 ---
interface SidebarItem {
  id: number | string;
  name: string;
  slug: string;
  count: number;
}

interface MasterItem {
  id: number;
  name: string;
  slug: string;
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
  [category: string]: SidebarItem[] | FanzaService[] | any;
  fanza_hierarchy?: FanzaService[];
  duga_hierarchy?: any[];
  ai_tags?: SidebarItem[];
}

interface SidebarProps {
  activeMenu?: string;
  makers?: { maker: string; count: number }[];
  recentPosts?: { id: string; title: string; slug?: string }[];
  product?: PCProduct;
}

export default function Sidebar({ activeMenu, makers = [], recentPosts = [], product }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const attribute = searchParams.get('attribute');
  
  const site = getSiteMetadata();
  const siteColor = getSiteColor(site.site_name);
  const isAdult = site.site_group === 'adult';

  // --- ステート管理 ---
  const [dynamicStats, setDynamicStats] = useState<SidebarData | null>(null);
  const [groupedActresses, setGroupedActresses] = useState<Record<string, any[]>>({});
  const [genres, setGenres] = useState<MasterItem[]>([]);
  const [series, setSeries] = useState<MasterItem[]>([]);
  const [directors, setDirectors] = useState<MasterItem[]>([]);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'SPEC': true,
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

  // ✅ データフェッチ統合
  useEffect(() => {
    async function fetchSidebarData() {
      const baseApiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      const cleanBaseUrl = baseApiUrl.endsWith('/') ? baseApiUrl.slice(0, -1) : baseApiUrl;

      // 1. 基本統計データ (既存ロジック)
      const statsPath = isAdult ? `${cleanBaseUrl}/adult-stats/` : `${cleanBaseUrl}/pc-sidebar-stats/`;
      try {
        const res = await fetch(statsPath, { cache: 'no-store', mode: 'cors' });
        if (res.ok) {
          const data = await res.json();
          setDynamicStats(data);
        }
      } catch (e) { console.error("[Sidebar] Stats Fetch Error:", e); }

      // 2. マスターデータ取得 (アダルト専用)
      if (isAdult) {
        const fetchMaster = async (endpoint: string) => {
          try {
            // 末尾スラッシュ必須 / 配列直下レスポンス対応
            const res = await fetch(`${cleanBaseUrl}/${endpoint}/?ordering=-product_count&limit=20`, { mode: 'cors' });
            if (!res.ok) return [];
            const data = await res.json();
            return Array.isArray(data) ? data : (data.results || []);
          } catch (e) { return []; }
        };

        // 女優 (五十音用にある程度多めに取得)
        fetch(`${cleanBaseUrl}/actresses/?limit=1000`, { mode: 'cors' })
          .then(res => res.json())
          .then(data => {
            const list = Array.isArray(data) ? data : (data.results || []);
            setGroupedActresses(groupByGojuon(list));
          }).catch(e => console.error(e));

        fetchMaster('genres').then(setGenres);
        fetchMaster('series').then(setSeries);
        fetchMaster('directors').then(setDirectors);
      }
    }
    fetchSidebarData();
  }, [isAdult]);

  // --- ヘルパー: セクション見出し ---
  const SectionHeader = ({ title, id }: { title: string, id: string }) => (
    <h3 
      className={styles.sectionTitle} 
      onClick={() => toggleSection(id)}
      style={{ 
        color: openSections[id] ? siteColor : '#555577',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
    >
      {title}
      <span style={{ 
        transform: openSections[id] ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform 0.3s ease',
        fontSize: '0.8rem'
      }}>▼</span>
    </h3>
  );

  return (
    <aside className={styles.sidebar}>
      {/* 🚀 1. PC詳細スペック (既存維持) */}
      {!isAdult && product && (
        <div className={styles.sectionWrapper}>
          <SectionHeader title="PRODUCT SPEC" id="SPEC" />
          {openSections['SPEC'] && (
            <div className={styles.productSpecCard}>
              <div className={styles.specScoreBox} style={{ borderColor: siteColor }}>
                <span className={styles.scoreLabel}>AI Spec Score</span>
                <span className={styles.scoreValue} style={{ color: siteColor }}>{product.spec_score}</span>
              </div>
              <dl className={styles.miniSpecList}>
                {product.cpu_model && <div className={styles.specRow}><dt>CPU</dt><dd>{product.cpu_model}</dd></div>}
                {product.gpu_model && <div className={styles.specRow}><dt>GPU</dt><dd>{product.gpu_model}</dd></div>}
              </dl>
            </div>
          )}
        </div>
      )}

      {/* 🚀 2. メインツール (既存維持) */}
      <div className={styles.sectionWrapper}>
        <SectionHeader title={isAdult ? "HOT CONTENTS" : "SPECIAL"} id="MAIN" />
        {openSections['MAIN'] && (
          <ul className={styles.accordionContent}>
            <li>
              <Link href={`${site.site_prefix}${isAdult ? '/ranking/' : '/pc-finder/'}`} 
                    className={styles.link} 
                    style={{ background: `linear-gradient(135deg, ${siteColor}dd, #000)`, color: '#fff' }}>
                <span style={{ fontWeight: '900' }}>{isAdult ? '🔥 総合ランキング' : '🔍 AIスペック診断'}</span>
              </Link>
            </li>
          </ul>
        )}
      </div>

      {/* 💃 3. 女優セクション (五十音グループ) */}
      {isAdult && Object.keys(groupedActresses).length > 0 && (
        <div className={styles.sectionWrapper}>
          <SectionHeader title="ACTRESSES" id="ACTRESSES" />
          {openSections['ACTRESSES'] && (
            <div className={styles.accordionContent} style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {Object.entries(groupedActresses).map(([row, list]) => (
                <details key={row} className={styles.detailsGroup}>
                  <summary className={styles.subCategoryLabel}>
                    <span style={{ color: siteColor }}>📁</span> {row} ({list.length})
                  </summary>
                  <ul className={styles.nestedList}>
                    {list.map((a) => (
                      <li key={a.id}>
                        <Link href={`/actress/${encodeURIComponent(a.slug)}`} className={styles.link}>
                          <span>💃 {a.name}</span>
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

      {/* 🏷️ 4. ジャンルセクション (Top 20) */}
      {isAdult && genres.length > 0 && (
        <div className={styles.sectionWrapper}>
          <SectionHeader title="GENRES" id="GENRES" />
          {openSections['GENRES'] && (
            <ul className={styles.accordionContent}>
              {genres.map(g => (
                <li key={g.id}>
                  <Link href={`/genre/${encodeURIComponent(g.slug)}`} className={styles.link}>
                    <span>🏷️ {g.name}</span>
                    <span className={styles.badge}>{g.product_count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* 📺 5. シリーズセクション (Top 20) */}
      {isAdult && series.length > 0 && (
        <div className={styles.sectionWrapper}>
          <SectionHeader title="SERIES" id="SERIES" />
          {openSections['SERIES'] && (
            <ul className={styles.accordionContent}>
              {series.map(s => (
                <li key={s.id}>
                  <Link href={`/series/${encodeURIComponent(s.slug)}`} className={styles.link}>
                    <span>📺 {s.name}</span>
                    <span className={styles.badge}>{s.product_count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* 🎬 6. 監督セクション (Top 20) */}
      {isAdult && directors.length > 0 && (
        <div className={styles.sectionWrapper}>
          <SectionHeader title="DIRECTORS" id="DIRECTORS" />
          {openSections['DIRECTORS'] && (
            <ul className={styles.accordionContent}>
              {directors.map(d => (
                <li key={d.id}>
                  <Link href={`/director/${encodeURIComponent(d.slug)}`} className={styles.link}>
                    <span>🎬 {d.name}</span>
                    <span className={styles.badge}>{d.product_count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* 📦 7. メーカー/ブランド (既存維持) */}
      <div className={styles.sectionWrapper}>
        <SectionHeader title={isAdult ? "BRANDS" : "MANUFACTURERS"} id="CATEGORIES" />
        {openSections['CATEGORIES'] && (
          <ul className={styles.accordionContent}>
            {makers.slice(0, 20).map((item) => (
              <li key={item.maker}>
                <Link href={`${site.site_prefix}/brand/${item.maker.toLowerCase()}`} className={styles.link}>
                  <span>{isAdult ? '🏢' : '💻'} {item.maker.toUpperCase()}</span>
                  <span className={styles.badge}>{item.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 🔞 8. FANZA階層構造 (既存維持) */}
      {isAdult && dynamicStats?.fanza_hierarchy && (
        <div className={styles.sectionWrapper}>
          <SectionHeader title="FANZA ARCHIVE" id="SOURCE_EXPLORER" />
          {openSections['SOURCE_EXPLORER'] && (
            <div className={styles.accordionContent}>
              {dynamicStats.fanza_hierarchy.map((service: FanzaService) => (
                <div key={service.slug} className={styles.serviceBlock}>
                  <div className={styles.subCategoryLabel} style={{ color: siteColor }}>{service.name}</div>
                  <ul className={styles.nestedList}>
                    {service.floors.map((floor) => (
                      <li key={floor.slug}>
                        <Link href={`/adults/fanza/${service.slug}/${floor.slug}`} className={styles.link}>
                          <span>📂 {floor.name}</span>
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

      {/* 📝 9. LATEST POSTS (既存維持) */}
      <div className={styles.sectionWrapper}>
        <SectionHeader title="LATEST NEWS" id="LATEST" />
        {openSections['LATEST'] && (
          <ul className={styles.accordionContent}>
            {recentPosts.map((post) => (
              <li key={post.id}>
                <Link href={`${site.site_prefix}/news/${post.slug || post.id}`} className={styles.link}>
                  <span className={styles.recentTitle}>{isAdult ? '📄' : '📄'} {post.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
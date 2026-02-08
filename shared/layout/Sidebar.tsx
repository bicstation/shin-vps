'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { getSiteMetadata, getSiteColor } from '../lib/siteConfig';
import styles from './Sidebar.module.css';

// --- 型定義 ---
interface SidebarItem {
  id: number | string;
  name: string;
  slug: string;
  count: number;
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
  duga_hierarchy?: any[]; // 将来的なDUGA拡張用
  ai_tags?: SidebarItem[]; // 「仕分け」用タグ
}

interface SidebarProps {
  activeMenu?: string;
  makers?: { maker: string; count: number }[];
  recentPosts?: { id: string; title: string; slug?: string }[];
}

export default function Sidebar({ activeMenu, makers = [], recentPosts = [] }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const attribute = searchParams.get('attribute');
  
  // ✅ サイト設定取得
  const site = getSiteMetadata();
  const siteColor = getSiteColor(site.site_name);
  const isAdult = site.site_group === 'adult';

  const [dynamicStats, setDynamicStats] = useState<SidebarData | null>(null);
  const [activeSource, setActiveSource] = useState<'fanza' | 'duga'>('fanza'); // ソース切り替え状態

  // アコーディオン状態
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    'MAIN': true,
    'SOURCE_EXPLORER': true,
    'AI_TAGS': true,
    'CATEGORIES': true,
    'LATEST': true,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // ✅ 統計データ取得
  useEffect(() => {
    async function fetchStats() {
      try {
        const apiPath = isAdult ? '/api/adult-stats/' : '/api/pc-sidebar-stats/';
        const res = await fetch(apiPath);
        if (res.ok) {
          const data = await res.json();
          setDynamicStats(data);
        }
      } catch (error) {
        console.error("統計データの取得に失敗:", error);
      }
    }
    fetchStats();
  }, [isAdult]);

  // --- ヘルパー: セクション見出し ---
  const SectionHeader = ({ title, id }: { title: string, id: string }) => (
    <h3 
      className={styles.sectionTitle} 
      onClick={() => toggleSection(id)}
      style={{ color: openSections[id] ? siteColor : '#555577' }}
    >
      {title}
      <span className={styles.arrow} style={{ 
        transform: openSections[id] ? 'rotate(180deg)' : 'rotate(0deg)' 
      }}>▼</span>
    </h3>
  );

  return (
    <aside className={styles.sidebar}>
      
      {/* 🔘 1. ソーススイッチャー (アダルトのみ表示) */}
      {isAdult && (
        <div className={styles.sourceSwitcher}>
          <button 
            className={activeSource === 'fanza' ? styles.activeFanza : ''} 
            onClick={() => setActiveSource('fanza')}
          >
            FANZA
          </button>
          <button 
            className={activeSource === 'duga' ? styles.activeDuga : ''} 
            onClick={() => setActiveSource('duga')}
          >
            DUGA
          </button>
        </div>
      )}

      {/* 🚀 2. メインツール/ランキング */}
      <SectionHeader title={isAdult ? "HOT CONTENTS" : "SPECIAL"} id="MAIN" />
      {openSections['MAIN'] && (
        <ul className={styles.accordionContent}>
          <li>
            <Link href={`${site.site_prefix}${isAdult ? '/ranking/' : '/pc-finder/'}`} 
                  className={styles.link} 
                  style={{ background: `linear-gradient(135deg, ${siteColor}dd, #000)`, color: '#fff' }}>
              <span style={{ fontWeight: '900' }}>
                {isAdult ? '🔥 総合ランキング' : '🔍 AIスペック診断'}
              </span>
            </Link>
          </li>
        </ul>
      )}

      {/* 🔞 3. FANZA/DUGA 階層エクスプローラー */}
      {isAdult && openSections['SOURCE_EXPLORER'] && (
        <>
          <SectionHeader title={`${activeSource.toUpperCase()} ARCHIVE`} id="SOURCE_EXPLORER" />
          {activeSource === 'fanza' && dynamicStats?.fanza_hierarchy && (
            <div className={styles.accordionContent}>
              {dynamicStats.fanza_hierarchy.map((service: FanzaService) => (
                <div key={service.slug} className={styles.serviceBlock}>
                  <div className={styles.subCategoryLabel} style={{ color: siteColor }}>{service.name}</div>
                  <ul className={styles.nestedList}>
                    {service.floors.map((floor) => (
                      <li key={floor.slug}>
                        <Link href={`/adults/fanza/${service.slug}/${floor.slug}`} className={styles.link}>
                          <span className={styles.floorName}>📂 {floor.name}</span>
                          <span className={styles.badge}>{floor.count}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
          {/* DUGA用 (APIからデータが来る想定) */}
          {activeSource === 'duga' && (
            <div className={styles.accordionContent}>
              <p className={styles.emptyMsg}>DUGAノードをスキャン中...</p>
            </div>
          )}
        </>
      )}

      {/* ✨ 4. AI解析タグ（仕分けメニュー） */}
      {isAdult && dynamicStats?.ai_tags && (
        <>
          <SectionHeader title="AI ATTRIBUTES" id="AI_TAGS" />
          {openSections['AI_TAGS'] && (
            <div className={styles.tagCloud}>
              {dynamicStats.ai_tags.map((tag: SidebarItem) => (
                <Link 
                  key={tag.id} 
                  href={`${site.site_prefix}/products?attribute=${tag.slug}`}
                  className={attribute === tag.slug ? styles.tagChipActive : styles.tagChip}
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          )}
        </>
      )}

      {/* 📦 5. カテゴリ/メーカー/ブランド */}
      <SectionHeader title={isAdult ? "BRANDS" : "MANUFACTURERS"} id="CATEGORIES" />
      {openSections['CATEGORIES'] && (
        <ul className={styles.accordionContent}>
          {makers.map((item) => (
            <li key={item.maker}>
              <Link href={`${site.site_prefix}/brand/${item.maker.toLowerCase()}`} 
                    className={styles.link}
                    style={{ color: activeMenu === item.maker ? siteColor : undefined }}>
                <span>{isAdult ? '🎬' : '💻'} {item.maker.toUpperCase()}</span>
                <span className={styles.badge}>{item.count}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* 📊 6. 動的なその他のスペック (PCサイト用など) */}
      {dynamicStats && Object.entries(dynamicStats)
        .filter(([key]) => !['fanza_hierarchy', 'duga_hierarchy', 'ai_tags'].includes(key))
        .map(([category, items]) => (
        <div key={category}>
          <SectionHeader title={category.toUpperCase()} id={category} />
          {openSections[category] && (
            <ul className={styles.accordionContent}>
              {(items as SidebarItem[]).map((item) => (
                <li key={item.id}>
                  <Link href={`${site.site_prefix}/products?attribute=${item.slug}`} className={styles.link}>
                    <span>✨ {item.name}</span>
                    <span className={styles.badge}>{item.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}

      {/* 📝 7. LATEST */}
      <SectionHeader title="LATEST" id="LATEST" />
      {openSections['LATEST'] && (
        <ul className={styles.accordionContent}>
          {recentPosts.map((post) => (
            <li key={post.id}>
              <Link href={`${site.site_prefix}/news/${post.slug || post.id}`} className={styles.link}>
                <span className={styles.recentTitle}>{isAdult ? '🎥' : '📄'} {post.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
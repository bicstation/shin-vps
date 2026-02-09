'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { getSiteMetadata, getSiteColor } from '../lib/siteConfig';
import { PCProduct } from '@/shared/lib/api/types';
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
  
  // ✅ サイト設定取得
  const site = getSiteMetadata();
  const siteColor = getSiteColor(site.site_name);
  const isAdult = site.site_group === 'adult';

  const [dynamicStats, setDynamicStats] = useState<SidebarData | null>(null);
  const [activeSource, setActiveSource] = useState<'fanza' | 'duga'>('fanza');

  // アコーディオン状態（初期値は全て閉じておき、データが来たら動的に追加）
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    'SPEC': true,
    'MAIN': true,
    'SOURCE_EXPLORER': true,
    'AI_TAGS': true,
    'CATEGORIES': true,
    'LATEST': true,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // ✅ 統計データ取得 & 強力デバッグ
  useEffect(() => {
    async function fetchStats() {
      // .env からブラウザ用URLを取得 (NEXT_PUBLIC_API_URL = http://localhost:8083/api)
      const baseApiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      
      // パスの構築（末尾スラッシュの二重化を防ぐ）
      const cleanBaseUrl = baseApiUrl.endsWith('/') ? baseApiUrl.slice(0, -1) : baseApiUrl;
      const apiPath = isAdult ? `${cleanBaseUrl}/adult-stats/` : `${cleanBaseUrl}/pc-sidebar-stats/`;
      
      console.log(`[Sidebar DEBUG] 🚀 Fetching from (Browser Direct): ${apiPath}`);
      
      try {
        const res = await fetch(apiPath, { 
          cache: 'no-store',
          mode: 'cors' // 明示的にCORSモードを指定
        });
        
        console.log(`[Sidebar DEBUG] 📡 Response Status: ${res.status} (${res.statusText})`);
        
        if (res.ok) {
          const data = await res.json();
          console.log("[Sidebar DEBUG] ✅ Received Data:", data);
          
          if (Object.keys(data).length === 0) {
            console.warn("[Sidebar DEBUG] ⚠️ Warning: Received data is EMPTY {}");
          }

          setDynamicStats(data);

          // 動的に取得したカテゴリのアコーディオンをデフォルトで開く設定
          const dynamicKeys = Object.keys(data);
          setOpenSections(prev => {
            const newState = { ...prev };
            dynamicKeys.forEach(key => {
              if (newState[key] === undefined) newState[key] = true;
            });
            return newState;
          });

        } else {
          console.error(`[Sidebar DEBUG] ❌ API Error: ${res.status}. URL may be wrong or Django is not responding.`);
        }
      } catch (error) {
        console.error("[Sidebar DEBUG] 🆘 Fetch Exception (CORS or Network Error):", error);
        console.error("[Sidebar DEBUG] TIP: Check if Django is running at localhost:8083 and CORS is allowed.");
      }
    }
    fetchStats();
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
      <span className={styles.arrow} style={{ 
        transform: openSections[id] ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform 0.3s ease',
        fontSize: '0.8rem'
      }}>▼</span>
    </h3>
  );

  return (
    <aside className={styles.sidebar}>
      {/* 💻 PC詳細ページ専用：製品スペッククイックビュー */}
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
                {product.cpu_model && (
                  <div className={styles.specRow}>
                    <dt>CPU</dt><dd>{product.cpu_model}</dd>
                  </div>
                )}
                {product.gpu_model && (
                  <div className={styles.specRow}>
                    <dt>GPU</dt><dd>{product.gpu_model}</dd>
                  </div>
                )}
                {product.memory_gb && (
                  <div className={styles.specRow}>
                    <dt>RAM</dt><dd>{product.memory_gb}GB</dd>
                  </div>
                )}
                {product.storage_gb && (
                  <div className={styles.specRow}>
                    <dt>SSD</dt><dd>{product.storage_gb}GB</dd>
                  </div>
                )}
              </dl>

              {product.is_ai_pc && (
                <div className={styles.aiBadge} style={{ backgroundColor: siteColor }}>
                  ✨ AI PC 認定モデル
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 🚀 2. メインツール/ランキング */}
      <div className={styles.sectionWrapper}>
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
      </div>

      {/* 📦 5. カテゴリ/メーカー/ブランド (既存のPropsから表示) */}
      <div className={styles.sectionWrapper}>
        <SectionHeader title={isAdult ? "BRANDS" : "MANUFACTURERS"} id="CATEGORIES" />
        {openSections['CATEGORIES'] && (
          <ul className={styles.accordionContent}>
            {makers.length > 0 ? makers.map((item) => (
              <li key={item.maker}>
                <Link href={`${site.site_prefix}/brand/${item.maker.toLowerCase()}`} 
                      className={styles.link}
                      style={{ color: activeMenu === item.maker ? siteColor : undefined }}>
                  <span>{isAdult ? '🎬' : '💻'} {item.maker.toUpperCase()}</span>
                  <span className={styles.badge}>{item.count}</span>
                </Link>
              </li>
            )) : (
              <p className={styles.emptyMsg} style={{padding: '10px', fontSize: '0.8rem', color: '#888'}}>No data available</p>
            )}
          </ul>
        )}
      </div>

      {/* 📊 6. 【重要】動的なその他のスペック (APIから取得したデータをループ) */}
      {dynamicStats && Object.entries(dynamicStats)
        .filter(([key]) => !['fanza_hierarchy', 'duga_hierarchy', 'ai_tags', 'MANUFACTURERS'].includes(key))
        .map(([category, items]) => {
          // デバッグ：実際に描画されるかコンソールに通知
          if (Array.isArray(items) && items.length > 0) {
            console.log(`[Sidebar DEBUG] Rendering Dynamic Category: ${category}`);
          }
          
          return (
            <div key={category} className={styles.sectionWrapper}>
              <SectionHeader title={category.toUpperCase()} id={category} />
              {openSections[category] && (
                <ul className={styles.accordionContent}>
                  {(items as SidebarItem[]).map((item) => (
                    <li key={item.id}>
                      <Link href={`${site.site_prefix}/pc-products/?attribute=${item.slug}`} 
                            className={`${styles.link} ${attribute === item.slug ? styles.activeLink : ''}`}>
                        <span>✨ {item.name}</span>
                        <span className={styles.badge}>{item.count}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}

      {/* 🔞 3. アダルト専用階層 (isAdult時のみ) */}
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
        </div>
      )}

      {/* 📝 7. LATEST */}
      <div className={styles.sectionWrapper}>
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
      </div>
    </aside>
  );
}
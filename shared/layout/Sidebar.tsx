'use client';

import React, { useEffect, useState, useCallback } from 'react';
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

interface SidebarData {
  [category: string]: SidebarItem[];
}

interface SidebarProps {
  activeMenu?: string;
  makers?: { maker: string; count: number }[]; // 汎用的なメーカー/カテゴリリスト
  recentPosts?: { id: string; title: string; slug?: string }[];
}

export default function Sidebar({ activeMenu, makers = [], recentPosts = [] }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const attribute = searchParams.get('attribute');
  
  // ✅ 共通設定からサイト情報を取得
  const site = getSiteMetadata();
  const siteColor = getSiteColor(site.site_name);
  const isAdult = site.site_group === 'adult';

  const [dynamicStats, setDynamicStats] = useState<SidebarData | null>(null);
  
  // アコーディオン状態（初期値はサイトによって変えることも可能）
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    'MAIN': true,
    'CATEGORIES': true,
    'LATEST': true,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // ✅ サイトに応じた統計データを取得
  useEffect(() => {
    async function fetchStats() {
      try {
        // APIパスもサイトごとに切り替わるように設計（将来的に）
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
  const SectionHeader = ({ title, id, sub = false }: { title: string, id: string, sub?: boolean }) => (
    <h3 
      className={styles.sectionTitle} 
      onClick={() => toggleSection(id)}
      style={{ 
        cursor: 'pointer', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        fontSize: sub ? '0.85rem' : undefined,
        borderLeft: sub ? `2px solid ${siteColor}44` : undefined,
        color: sub ? undefined : siteColor
      }}
    >
      {title}
      <span style={{ 
        fontSize: '0.7rem', 
        transition: 'transform 0.3s', 
        transform: openSections[id] ? 'rotate(180deg)' : 'rotate(0deg)' 
      }}>▼</span>
    </h3>
  );

  return (
    <aside className={styles.sidebar}>
      
      {/* 🚀 サイトごとのメインツール/ランキング */}
      <SectionHeader title={isAdult ? "HOT CONTENTS" : "SPECIAL"} id="MAIN" />
      {openSections['MAIN'] && (
        <ul className={styles.accordionContent}>
          <li style={{ marginBottom: '8px' }}>
            <Link href={`${site.site_prefix}${isAdult ? '/ranking/' : '/pc-finder/'}`} 
                  className={styles.link} 
                  style={{ background: `linear-gradient(135deg, ${siteColor}, #000)`, color: '#fff', borderRadius: '8px', padding: '12px' }}>
              <span style={{ fontWeight: 'bold' }}>
                {isAdult ? '🔥 総合ランキング' : '🔍 AIスペック診断'}
              </span>
            </Link>
          </li>
        </ul>
      )}

      {/* 📦 カテゴリ/メーカーセクション */}
      <SectionHeader title={isAdult ? "GENRE" : "BRANDS"} id="CATEGORIES" />
      {openSections['CATEGORIES'] && (
        <ul className={styles.accordionContent}>
          {makers.map((item) => {
            const isActive = activeMenu?.toLowerCase() === item.maker.toLowerCase();
            return (
              <li key={item.maker}>
                <Link href={`${site.site_prefix}/brand/${item.maker.toLowerCase()}`} 
                      className={styles.link}
                      style={{ color: isActive ? siteColor : undefined, fontWeight: isActive ? 'bold' : 'normal' }}>
                  <span>{isAdult ? '🎬' : '💻'} {item.maker.toUpperCase()}</span>
                  <span className={styles.badge}>{item.count}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {/* 📊 動的なスペック/タグセクション */}
      {dynamicStats && Object.entries(dynamicStats).map(([category, items]) => (
        <div key={category}>
          <SectionHeader title={category.toUpperCase()} id={category} />
          {openSections[category] && (
            <ul className={styles.accordionContent}>
              {items.map((item) => {
                const isActive = attribute === item.slug;
                // アイコンをサイト種別で変える遊び心
                const icon = isAdult ? '✨' : (category.includes('CPU') ? '🚀' : '🧠');
                return (
                  <li key={item.id}>
                    <Link href={`${site.site_prefix}/products?attribute=${item.slug}`} 
                          className={styles.link}
                          style={{ color: isActive ? siteColor : undefined }}>
                      <span>{icon} {item.name}</span>
                      <span className={styles.badge}>{item.count}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ))}

      {/* 📝 最新記事 */}
      <SectionHeader title="LATEST" id="LATEST" />
      {openSections['LATEST'] && (
        <ul className={styles.accordionContent}>
          {recentPosts.map((post) => (
            <li key={post.id}>
              <Link href={`${site.site_prefix}/news/${post.slug || post.id}`} className={styles.link}>
                <span style={{ fontSize: '0.85rem' }}>{isAdult ? '🎥' : '📄'} {post.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
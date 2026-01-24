'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { COLORS } from '@/constants';
import { MakerCount } from '@/lib/api'; 
import styles from './Sidebar.module.css';

interface AttributeItem {
  id: number;
  name: string;
  slug: string;
  count: number;
  order?: number;
}

interface SidebarData {
  [category: string]: AttributeItem[];
}

interface SidebarProps {
  activeMenu?: string;
  makers?: MakerCount[]; 
  recentPosts?: { id: string; title: string; slug?: string }[];
}

export default function Sidebar({ activeMenu, makers = [], recentPosts = [] }: SidebarProps) {
  const pathname = usePathname(); 
  const searchParams = useSearchParams(); 
  const attribute = searchParams.get('attribute');
  const siteColor = COLORS?.SITE_COLOR || '#007bff';

  const [specStats, setSpecStats] = useState<SidebarData | null>(null);
  
  // 🚀 アコーディオンの開閉状態を管理するState
  // 初期値として「BRANDS」と「RANKING」を開いておく設定
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    'RANKING': true,
    'BRANDS': true,
    'LATEST ARTICLES': true
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  useEffect(() => {
    async function fetchSpecStats() {
      try {
        const res = await fetch('/api/pc-sidebar-stats/');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setSpecStats(data);
      } catch (error) {
        console.error("スペック統計の取得に失敗しました:", error);
      }
    }
    fetchSpecStats();
  }, []);

  const getFilterHref = (attrSlug: string) => {
    const isBrandPage = pathname.startsWith('/brand');
    if (isBrandPage && activeMenu) {
      return { pathname: `/brand/${activeMenu.toLowerCase()}`, query: { attribute: attrSlug } };
    }
    return { pathname: '/pc-products', query: { attribute: attrSlug } };
  };

  const formatHref = (hrefObj: { pathname: string; query: { attribute: string } }) => {
    return `${hrefObj.pathname}?attribute=${hrefObj.query.attribute}`;
  };

  // 🚀 セクション見出し（トリガー）コンポーネント
  const SectionHeader = ({ title, id }: { title: string, id: string }) => (
    <h3 
      className={styles.sectionTitle} 
      onClick={() => toggleSection(id)}
      style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
    >
      {title}
      <span style={{ 
        fontSize: '0.8rem', 
        transition: 'transform 0.3s', 
        transform: openSections[id] ? 'rotate(180deg)' : 'rotate(0deg)' 
      }}>
        ▼
      </span>
    </h3>
  );

  return (
    <aside className={styles.sidebar}>
      
      {/* 🏆 RANKING */}
      <SectionHeader title="RANKING" id="RANKING" />
      {openSections['RANKING'] && (
        <ul className={styles.accordionContent}>
          <li>
            <Link href="/ranking/" className={styles.link} style={{ 
                color: pathname === '/ranking/' ? siteColor : undefined,
                background: 'rgba(236, 201, 75, 0.1)',
                borderRadius: '8px', padding: '10px'
              }}>
              <span>🏆 スペック解析ランキング</span>
            </Link>
          </li>
        </ul>
      )}

      {/* 1. BRANDS */}
      <SectionHeader title="BRANDS" id="BRANDS" />
      {openSections['BRANDS'] && (
        <ul className={styles.accordionContent}>
          {makers.map((item) => {
            const isActive = activeMenu?.toLowerCase() === item.maker.toLowerCase();
            return (
              <li key={item.maker}>
                <Link href={`/brand/${item.maker.toLowerCase()}`} className={styles.link}
                  style={{ color: isActive ? siteColor : undefined, fontWeight: isActive ? 'bold' : 'normal' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>💻 {item.maker.toUpperCase()}</span>
                  <span className={styles.badge}>{item.count}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {/* 2. SPECS (動的生成セクション) */}
      {specStats && Object.entries(specStats)
        .sort((a, b) => a[0].localeCompare(b[0], 'ja'))
        .map(([category, items]) => (
        <div key={category}>
          <SectionHeader title={category.toUpperCase()} id={category} />
          {openSections[category] && (
            <ul className={styles.accordionContent}>
              {items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((item) => {
                const isActive = attribute === item.slug;
                const icon = category.includes('CPU') ? '🚀' : category.includes('メモリ') ? '🧠' : category.includes('NPU') ? '🤖' : '✨';
                return (
                  <li key={item.id}>
                    <Link href={formatHref(getFilterHref(item.slug))} className={styles.link}
                      style={{ color: isActive ? siteColor : undefined, fontWeight: isActive ? 'bold' : 'normal' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>{icon} {item.name}</span>
                      <span className={styles.badge}>{item.count}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ))}

      {/* 3. LATEST ARTICLES */}
      <SectionHeader title="LATEST ARTICLES" id="LATEST" />
      {openSections['LATEST'] && (
        <ul className={styles.accordionContent}>
          {recentPosts.map((post) => (
            <li key={post.id} style={{ marginBottom: '10px' }}>
              <Link href={`/bicstation/${post.slug || post.id}`} className={styles.link}>
                <span>📄 {post.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* 4. OTHERS */}
      <SectionHeader title="OTHERS" id="OTHERS" />
      {openSections['OTHERS'] && (
        <ul className={styles.accordionContent}>
          <li>
            <Link href="/pc-products" className={styles.link} 
              style={{ color: !attribute && (!activeMenu || activeMenu === 'all') ? siteColor : undefined }}>
              <span>🏠 全製品一覧</span>
            </Link>
          </li>
          <li>
            <Link href="/contact" className={styles.link}>
              <span>✉️ スペック相談</span>
            </Link>
          </li>
        </ul>
      )}
    </aside>
  );
}
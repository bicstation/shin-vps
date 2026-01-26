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
  
  // アコーディオンの開閉状態を管理
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    'RANKING': true,
    'BRANDS': true,
    'LATEST': true,
    'DOMESTIC': true, // 追加
    'OVERSEAS': true  // 追加
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

  // --- メーカーをグループ分けするロジック ---
  const domesticNames = ['mouse', 'panasonic', 'vaio', 'dynabook', 'fujitsu', 'nec', 'iiyama'];
  
  const categorizedMakers = makers.reduce((acc, curr) => {
    const name = curr.maker.toLowerCase();
    if (domesticNames.includes(name)) {
      acc.domestic.push(curr);
    } else {
      acc.overseas.push(curr);
    }
    return acc;
  }, { domestic: [] as MakerCount[], overseas: [] as MakerCount[] });

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

  // セクション見出し（トリガー）コンポーネント
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
        opacity: sub ? 0.8 : 1,
        marginTop: sub ? '10px' : undefined,
        paddingLeft: sub ? '10px' : undefined,
        borderLeft: sub ? `2px solid ${siteColor}44` : undefined
      }}
    >
      {title}
      <span style={{ 
        fontSize: '0.7rem', 
        transition: 'transform 0.3s', 
        transform: openSections[id] ? 'rotate(180deg)' : 'rotate(0deg)' 
      }}>
        ▼
      </span>
    </h3>
  );

  // メーカーアイテムを描画する共通関数
  const renderMakerList = (makerItems: MakerCount[]) => (
    <ul className={styles.accordionContent}>
      {makerItems.map((item) => {
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
  );

  return (
    <aside className={styles.sidebar} style={{ height: 'auto', minHeight: '100%', maxHeight: 'none', overflowY: 'visible' }}>
      
      {/* 🏆 RANKING & TOOLS */}
      <SectionHeader title="SPECIAL" id="RANKING" />
      {openSections['RANKING'] && (
        <ul className={styles.accordionContent}>
          <li style={{ marginBottom: '8px' }}>
            <Link href="/pc-finder/" className={styles.link} style={{ 
                background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                color: '#ffffff',
                borderRadius: '12px', padding: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}>
              <span style={{ fontWeight: '900', letterSpacing: '0.05em' }}>🔍 PC-FINDER (AI選定)</span>
            </Link>
          </li>
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

      {/* 1. BRANDS (Grouped) */}
      <SectionHeader title="BRANDS" id="BRANDS" />
      {openSections['BRANDS'] && (
        <div style={{ marginBottom: '20px' }}>
          {/* 国内ブランド */}
          <SectionHeader title="国内メーカー" id="DOMESTIC" sub />
          {openSections['DOMESTIC'] && renderMakerList(categorizedMakers.domestic)}

          {/* 海外ブランド */}
          <SectionHeader title="海外メーカー" id="OVERSEAS" sub />
          {openSections['OVERSEAS'] && renderMakerList(categorizedMakers.overseas)}
        </div>
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
                <span style={{ fontSize: '0.85rem', lineHeight: '1.4', display: 'block' }}>📄 {post.title}</span>
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
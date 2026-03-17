import React from 'react';
import Link from 'next/link';
import { headers } from 'next/headers';
import { COLORS } from '../../styles/constants';

/**
 * ✅ 司令部統合：API & Bridge
 */
import { fetchMakers } from '@/shared/lib/api/django/pc';
import { fetchDjangoBridgeContent } from '@/shared/lib/api/django-bridge';
import { getDjangoHeaders } from '@/shared/lib/api/django/client'; 
import styles from './PCSidebar.module.css';

interface AttributeItem {
  id: number;
  name: string;
  slug: string;
  count: number;
}

interface SidebarData {
  [category: string]: AttributeItem[];
}

export default async function Sidebar() {
  const headerList = await headers();
  const pathname = headerList.get('x-url') || '/';
  const siteColor = COLORS?.SITE_COLOR || '#007bff';

  // 💡 通信経路の最適化 (VPS環境ではDocker内部、ローカルでは8083)
  const API_BASE = process.env.INTERNAL_API_URL || "http://127.0.0.1:8083";
  const statsUrl = `${API_BASE}/api/general/pc-sidebar-stats/`;

  /**
   * 🛡️ フェッチ・セーフティ
   */
  async function safeFetch<T>(promise: Promise<T>, fallback: T): Promise<T> {
    try {
      const result = await promise;
      return result ?? fallback;
    } catch (e) {
      console.error("[PCSidebar Fetch Error]:", e);
      return fallback;
    }
  }

  // 1. 並列データ取得
  const [makers, bridgeData, specStatsRes] = await Promise.all([
    safeFetch(fetchMakers(), []),
    safeFetch(fetchDjangoBridgeContent('latest_news', 5), []), 
    fetch(statsUrl, {
      headers: getDjangoHeaders(), 
      next: { revalidate: 3600 } 
    }).catch(() => ({ ok: false }))
  ]);

  const recentArticles = Array.isArray(bridgeData) ? bridgeData : [];
  
  // 2. スペック統計の解析
  let specStats: SidebarData | null = null;
  if (specStatsRes && 'ok' in specStatsRes && (specStatsRes as any).ok) {
    try {
      specStats = await (specStatsRes as Response).json();
    } catch (e) {
      console.error("[PCSidebar Stats Parse Error]:", e);
    }
  }

  // 3. 国内外ブランドの自動仕分け
  const domesticNames = ['mouse', 'panasonic', 'vaio', 'dynabook', 'fujitsu', 'nec', 'iiyama'];
  const categorizedMakers = (makers || []).reduce((acc, curr) => {
    // APIの構造に合わせて curr.maker または curr.name を考慮
    const rawName = curr.maker || curr.name || '';
    const name = rawName.toLowerCase();
    if (domesticNames.some(d => name.includes(d))) {
      acc.domestic.push({ ...curr, displayName: rawName.toUpperCase() });
    } else {
      acc.overseas.push({ ...curr, displayName: rawName.toUpperCase() });
    }
    return acc;
  }, { domestic: [] as any[], overseas: [] as any[] });

  return (
    <aside className={styles.sidebar}>
      
      {/* 🏆 SPECIAL: AIツール導線 */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>SPECIAL</h3>
        <Link href="/pc-finder/" className={styles.specialBanner}>
          <span className={styles.finderIcon}>🔍</span>
          <div className={styles.finderText}>
            <span className={styles.finderMain}>PC-FINDER</span>
            <span className={styles.finderSub}>AIが最適な1台を提案</span>
          </div>
        </Link>
      </section>

      {/* 🏢 BRANDS: メーカー別索引 */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>BRANDS</h3>
        <div className={styles.brandGroup}>
          <p className={styles.subLabel}>国内メーカー</p>
          <ul className={styles.list}>
            {categorizedMakers.domestic.map((item: any) => (
              <li key={item.id || item.maker}>
                <Link href={`/brand/${(item.maker || item.name).toLowerCase()}`} 
                      className={`${styles.link} ${pathname.includes((item.maker || item.name).toLowerCase()) ? styles.active : ''}`}
                      style={pathname.includes((item.maker || item.name).toLowerCase()) ? { color: siteColor } : {}}>
                  <span>💻 {item.displayName}</span>
                  <span className={styles.badge}>{item.count}</span>
                </Link>
              </li>
            ))}
          </ul>

          <p className={styles.subLabel} style={{ marginTop: '12px' }}>海外メーカー</p>
          <ul className={styles.list}>
            {categorizedMakers.overseas.map((item: any) => (
              <li key={item.id || item.maker}>
                <Link href={`/brand/${(item.maker || item.name).toLowerCase()}`} 
                      className={`${styles.link} ${pathname.includes((item.maker || item.name).toLowerCase()) ? styles.active : ''}`}
                      style={pathname.includes((item.maker || item.name).toLowerCase()) ? { color: siteColor } : {}}>
                  <span>💻 {item.displayName}</span>
                  <span className={styles.badge}>{item.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ⚙️ SPECS: Djangoによる動的属性 */}
      {specStats && Object.entries(specStats).map(([category, items]) => (
        <section key={category} className={styles.section}>
          <h3 className={styles.sectionTitle}>{category.replace('_', ' ').toUpperCase()}</h3>
          <ul className={styles.list}>
            {items.map((item) => (
              <li key={item.id}>
                <Link href={`/pc-products?attribute=${item.slug}`} className={styles.link}>
                  <span>✨ {item.name}</span>
                  <span className={styles.badge}>{item.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {/* 📄 UPDATES: Bridge経由の最新レポート */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>LATEST UPDATES</h3>
        <ul className={styles.list}>
          {recentArticles.length > 0 ? (
            recentArticles.map((item: any) => (
              <li key={item.id} className={styles.newsItem}>
                <Link href={`/news/${item.slug || item.id}`} className={styles.newsLink}>
                   <span className={styles.newsIcon}>📄</span>
                   <span className={styles.newsTitle}>{item.title}</span>
                </Link>
              </li>
            ))
          ) : (
            <li className={styles.empty}>最新情報を取得中...</li>
          )}
        </ul>
      </section>

      {/* 🚀 SYSTEM FOOTER */}
      <div className={styles.sidebarFooter}>
        <span className={styles.statusDot}></span>
        <span className={styles.statusText}>BICSTATION PC_NODE ONLINE</span>
      </div>
    </aside>
  );
}
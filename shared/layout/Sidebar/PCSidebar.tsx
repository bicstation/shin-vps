// @ts-nocheck
import React from 'react';
import Link from 'next/link';
import { headers } from 'next/headers';
import { COLORS } from '../../styles/constants';

/**
 * ✅ 司令部統合：Maya's Logic v5.6
 * 生の fetch を廃止し、shared 側の安全なフェッチ関数に一本化します。
 */
import { fetchMakers, fetchPCSidebarStats } from '@/shared/lib/api/django/pc';
import { fetchDjangoBridgeContent } from '@/shared/lib/api/django-bridge';
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
  /**
   * 1. 環境情報の取得 (Async)
   */
  const headerList = await headers();
  const pathname = headerList.get('x-url') || '/';
  // サイトカラーの安全な取得
  const siteColor = COLORS?.SITE_COLOR || '#007bff';

  /**
   * 2. フェッチ・セーフティ (エラー時にプロセスを止めない)
   */
  async function safeFetch<T>(promise: Promise<T>, fallback: T): Promise<T> {
    try {
      const result = await promise;
      return result ?? fallback;
    } catch (e) {
      console.error("🚨 [PCSidebar Fetch Error]:", e);
      return fallback;
    }
  }

  /**
   * 3. データ並列取得
   * 💡 生の fetch(statsUrl) を廃止。
   * 💡 fetchPCSidebarStats() 内部で getDjangoHeaders() と URL 解決を完結させています。
   */
  const [makers, bridgeData, specStats] = await Promise.all([
    safeFetch(fetchMakers(), []),
    safeFetch(fetchDjangoBridgeContent('latest_news', 5), []), 
    safeFetch(fetchPCSidebarStats(), null) 
  ]);

  const recentArticles = Array.isArray(bridgeData) ? bridgeData : [];
  
  /**
   * 4. 国内外ブランドの自動仕分け
   */
  const domesticNames = ['mouse', 'panasonic', 'vaio', 'dynabook', 'fujitsu', 'nec', 'iiyama'];
  const categorizedMakers = (makers || []).reduce((acc, curr) => {
    const rawName = curr.maker || curr.name || '';
    const name = rawName.toLowerCase();
    
    const makerData = { 
      ...curr, 
      displayName: rawName.toUpperCase(),
      lowerName: name
    };

    if (domesticNames.some(d => name.includes(d))) {
      acc.domestic.push(makerData);
    } else {
      acc.overseas.push(makerData);
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
                <Link href={`/brand/${item.lowerName}`} 
                      className={`${styles.link} ${pathname.includes(item.lowerName) ? styles.active : ''}`}
                      style={pathname.includes(item.lowerName) ? { color: siteColor } : {}}>
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
                <Link href={`/brand/${item.lowerName}`} 
                      className={`${styles.link} ${pathname.includes(item.lowerName) ? styles.active : ''}`}
                      style={pathname.includes(item.lowerName) ? { color: siteColor } : {}}>
                  <span>💻 {item.displayName}</span>
                  <span className={styles.badge}>{item.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ⚙️ SPECS: Djangoによる動的属性 (CPU/GPU/Memory等) */}
      {specStats && Object.entries(specStats as SidebarData).map(([category, items]) => {
        if (!Array.isArray(items)) return null;
        return (
          <section key={category} className={styles.section}>
            <h3 className={styles.sectionTitle}>{category.replace('_', ' ').toUpperCase()}</h3>
            <ul className={styles.list}>
              {items.map((item) => (
                <li key={item.id || item.slug}>
                  <Link href={`/pc-products?attribute=${item.slug}`} className={styles.link}>
                    <span>✨ {item.name}</span>
                    <span className={styles.badge}>{item.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

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
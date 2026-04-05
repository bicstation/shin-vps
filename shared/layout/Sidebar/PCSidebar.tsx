// @ts-nocheck
import React from 'react';
import Link from 'next/link';
import { headers } from 'next/headers';

/**
 * ✅ Maya's Logic: 実データ(News) + ダミー(Specs/Brands) 統合運用
 */
import { getSiteMetadata, getSiteColor } from '@/shared/lib/utils/siteConfig';
import { fetchDjangoBridgeContent } from '@/shared/lib/api/django-bridge';
import styles from './PCSidebar.module.css';

export default async function Sidebar() {
  /**
   * 1. アイデンティティ確定
   */
  const headerList = await headers();
  const host = headerList.get('x-forwarded-host') || headerList.get('host') || '';
  const site = getSiteMetadata(host);
  const pathname = headerList.get('x-url') || '/';
  const siteColor = site ? getSiteColor(site.site_name) : '#00f2ff';

  /**
   * 2. データ取得 (最新記事のみ実戦投入)
   */
  async function safeFetch<T>(promise: Promise<T>, fallback: T): Promise<T> {
    try {
      const result = await promise;
      return result ?? fallback;
    } catch (e) {
      return fallback;
    }
  }

  const bridgeData = await safeFetch(
    fetchDjangoBridgeContent('posts', 5, { content_type: 'news' }), 
    { results: [] }
  );

  const recentArticles = Array.isArray(bridgeData) ? bridgeData : (bridgeData?.results || []);

  /**
   * 3. ダミーデータ定義 (DB設定完了までこれを使用)
   */
  const dummyMakers = {
    domestic: [
      { id: 'd1', lowerName: 'mouse', displayName: 'MOUSE', count: '-' },
      { id: 'd2', lowerName: 'fujitsu', displayName: 'FUJITSU', count: '-' }
    ],
    overseas: [
      { id: 'o1', lowerName: 'dell', displayName: 'DELL', count: '-' },
      { id: 'o2', lowerName: 'hp', displayName: 'HP', count: '-' },
      { id: 'o3', lowerName: 'lenovo', displayName: 'LENOVO', count: '-' }
    ]
  };

  const dummySpecs = {
    "CPU_SERIES": [
      { slug: 'core-i7', name: 'Core i7', count: 0 },
      { slug: 'ryzen-7', name: 'Ryzen 7', count: 0 }
    ],
    "GPU_SERIES": [
      { slug: 'rtx-4060', name: 'RTX 4060', count: 0 },
      { slug: 'rtx-4070', name: 'RTX 4070', count: 0 }
    ]
  };

  const siteUpperName = site ? site.site_name.toUpperCase() : 'BICSTATION';

  return (
    <aside className={styles.sidebar}>
      
      {/* 🏆 SPECIAL */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle} style={{ color: siteColor }}>SPECIAL</h3>
        <Link href="/pc-finder/" className={styles.specialBanner} style={{ borderLeft: `4px solid ${siteColor}` }}>
          <span className={styles.finderIcon}>🔍</span>
          <div className={styles.finderText}>
            <span className={styles.finderMain}>PC-FINDER</span>
            <span className={styles.finderSub}>AIが最適な1台を提案</span>
          </div>
        </Link>
      </section>

      {/* 🏢 BRANDS (Dummy Mode) */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>BRANDS</h3>
        <div className={styles.brandGroup}>
          <p className={styles.subLabel}>国内メーカー</p>
          <ul className={styles.list}>
            {dummyMakers.domestic.map((item) => (
              <li key={item.id}>
                <Link href={`/brand/${item.lowerName}`} className={styles.link}>
                  <span>💻 {item.displayName}</span>
                  <span className={styles.badge}>{item.count}</span>
                </Link>
              </li>
            ))}
          </ul>
          <p className={styles.subLabel} style={{ marginTop: '12px' }}>海外メーカー</p>
          <ul className={styles.list}>
            {dummyMakers.overseas.map((item) => (
              <li key={item.id}>
                <Link href={`/brand/${item.lowerName}`} className={styles.link}>
                  <span>💻 {item.displayName}</span>
                  <span className={styles.badge}>{item.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ⚙️ SPECS (Dummy Mode) */}
      {Object.entries(dummySpecs).map(([category, items]) => (
        <section key={category} className={styles.section}>
          <h3 className={styles.sectionTitle}>{category}</h3>
          <ul className={styles.list}>
            {items.map((item) => (
              <li key={item.slug}>
                <div className={styles.link} style={{ opacity: 0.6, cursor: 'default' }}>
                  <span>✨ {item.name}</span>
                  <span className={styles.badge}>-</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {/* 📄 UPDATES (Real Data) */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>LATEST UPDATES</h3>
        <ul className={styles.list}>
          {recentArticles.length > 0 ? (
            recentArticles.map((item: any) => (
              <li key={item.id} className={styles.newsItem}>
                <Link href={`/post/${item.id}`} className={styles.newsLink}>
                   <span className={styles.newsIcon}>📄</span>
                   <span className={styles.newsTitle}>{item.title}</span>
                </Link>
              </li>
            ))
          ) : (
            <li className={styles.empty}>最新ニュースを同期中...</li>
          )}
        </ul>
      </section>

      {/* 🚀 SYSTEM FOOTER */}
      <div className={styles.sidebarFooter}>
        <span className={styles.statusDot} style={{ backgroundColor: siteColor }}></span>
        <span className={styles.statusText}>{siteUpperName} PC_NODE ONLINE</span>
      </div>
    </aside>
  );
}
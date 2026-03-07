import React from 'react';
import Link from 'next/link';
import { headers } from 'next/headers';
import { COLORS } from '../../styles/constants';

/**
 * ✅ 修正ポイント: django-bridge.ts を使用して Django 経由でコンテンツ取得
 */
import { fetchMakers } from '@/shared/lib/api/django/pc';
import { fetchDjangoBridgeContent } from '@/shared/lib/api/django-bridge'; // 👈 ブリッジを使用
import { resolveApiUrl, getDjangoHeaders } from '@/shared/lib/api/django/client'; 
import styles from './PCSidebar.module.css';

// サーバー側で取得するための型定義
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

export default async function Sidebar() {
  // 1. ヘッダーからパス名等を取得
  const headerList = await headers();
  const pathname = headerList.get('x-url') || '/';
  const siteColor = COLORS?.SITE_COLOR || '#007bff';

  /**
   * 🛡️ フェッチ・セーフティ・ラッパー
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

  /**
   * 🌐 スペック統計取得用のURL構築
   */
  const statsUrl = resolveApiUrl('/api/general/pc-sidebar-stats/');

  // 2. データのフェッチ（WPを完全に排除し、Django Bridgeに差し替え）
  const [makers, bridgeData, specStatsRes] = await Promise.all([
    safeFetch(fetchMakers(), []),
    // Django Bridge経由で「お知らせ」や「最新レポート」を取得する想定
    safeFetch(fetchDjangoBridgeContent('latest_news', 5), []), 
    
    fetch(statsUrl, {
      headers: getDjangoHeaders(), 
      next: { revalidate: 3600 } 
    }).catch((e) => {
      console.error("[PCSidebar Stats Fetch Failed]:", e);
      return { ok: false };
    })
  ]);

  const recentArticles = Array.isArray(bridgeData) ? bridgeData : [];
  
  // スペック統計データの処理
  let specStats: SidebarData | null = null;
  if (specStatsRes && 'ok' in specStatsRes && (specStatsRes as any).ok) {
    try {
      specStats = await (specStatsRes as Response).json();
    } catch (e) {
      console.error("[PCSidebar Stats Parse Error]:", e);
    }
  }

  // メーカー分けロジック
  const domesticNames = ['mouse', 'panasonic', 'vaio', 'dynabook', 'fujitsu', 'nec', 'iiyama'];
  const categorizedMakers = (makers || []).reduce((acc, curr) => {
    if (!curr || !curr.maker) return acc;
    const name = curr.maker.toLowerCase();
    if (domesticNames.includes(name)) {
      acc.domestic.push(curr);
    } else {
      acc.overseas.push(curr);
    }
    return acc;
  }, { domestic: [] as any[], overseas: [] as any[] });

  return (
    <aside className={styles.sidebar}>
      
      {/* 🏆 SPECIAL (AIツールへの導線) */}
      <h3 className={styles.sectionTitle}>SPECIAL</h3>
      <ul className={styles.accordionContent}>
        <li style={{ marginBottom: '8px' }}>
          <Link href="/pc-finder/" className={styles.link} style={{ 
              background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
              color: '#ffffff', borderRadius: '12px', padding: '12px', display: 'block'
            }}>
            <span style={{ fontWeight: '900' }}>🔍 PC-FINDER (AI選定)</span>
          </Link>
        </li>
      </ul>

      {/* 1. BRANDS: メーカー別 */}
      <h3 className={styles.sectionTitle}>BRANDS</h3>
      <div style={{ marginBottom: '20px' }}>
        <p className={styles.subLabel}>国内メーカー</p>
        <ul className={styles.accordionContent}>
          {categorizedMakers.domestic.map((item) => (
            <li key={item.maker}>
              <Link href={`/brand/${item.maker.toLowerCase()}`} 
                    className={styles.link}
                    style={{ color: pathname.includes(item.maker.toLowerCase()) ? siteColor : undefined }}>
                <span>💻 {item.maker.toUpperCase()}</span>
                <span className={styles.badge}>{item.count}</span>
              </Link>
            </li>
          ))}
        </ul>

        <p className={styles.subLabel} style={{ marginTop: '10px' }}>海外メーカー</p>
        <ul className={styles.accordionContent}>
          {categorizedMakers.overseas.map((item) => (
            <li key={item.maker}>
              <Link href={`/brand/${item.maker.toLowerCase()}`} 
                    className={styles.link}
                    style={{ color: pathname.includes(item.maker.toLowerCase()) ? siteColor : undefined }}>
                <span>💻 {item.maker.toUpperCase()}</span>
                <span className={styles.badge}>{item.count}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* 2. SPECS: Django動的統計 */}
      {specStats && Object.entries(specStats).map(([category, items]) => (
        <div key={category}>
          <h3 className={styles.sectionTitle}>{category.toUpperCase()}</h3>
          <ul className={styles.accordionContent}>
            {items.map((item) => (
              <li key={item.id}>
                <Link href={`/pc-products?attribute=${item.slug}`} className={styles.link}>
                  <span>✨ {item.name}</span>
                  <span className={styles.badge}>{item.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {/* 3. UPDATES: Django Bridge 経由の最新情報 */}
      <h3 className={styles.sectionTitle}>LATEST UPDATES</h3>
      <ul className={styles.accordionContent}>
        {recentArticles.length > 0 ? (
          recentArticles.map((item: any) => (
            <li key={item.id} style={{ marginBottom: '10px' }}>
              <Link href={`/news/${item.slug || item.id}`} className={styles.link}>
                <span style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
                  📄 {item.title}
                </span>
              </Link>
            </li>
          ))
        ) : (
          <li className={styles.link} style={{ fontSize: '0.8rem', color: '#999' }}>
            最新情報を取得中...
          </li>
        )}
      </ul>
    </aside>
  );
}
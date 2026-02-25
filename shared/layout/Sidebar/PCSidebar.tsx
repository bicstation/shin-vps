// /home/maya/dev/shin-vps/shared/layout/Sidebar/PCSidebar.tsx

import React from 'react';
import Link from 'next/link';
import { headers } from 'next/headers';
import { COLORS } from '../../styles/constants';

/**
 * ✅ 修正済みインポート
 * Django API 層の共通ユーティリティ（resolveApiUrl, getDjangoHeaders）を使用して
 * 環境変数やパスの不整合を自動的に吸収します。
 */
import { fetchMakers } from '@shared/lib/api/django/pc';
import { resolveApiUrl, getDjangoHeaders } from '@shared/lib/api/django/client'; 
import { fetchPostList } from '@shared/lib/api/wordpress';
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
   * pc.ts の他の関数と同様に resolveApiUrl を使用して /api の重複を回避します。
   */
  const statsUrl = resolveApiUrl('/api/general/pc-sidebar-stats/');

  // 2. データのフェッチ（Promise.allで効率的に並列実行）
  const [makers, wpData, specStatsRes] = await Promise.all([
    safeFetch(fetchMakers(), []),
    safeFetch(fetchPostList('post', 10, 0), { results: [], count: 0 }),
    
    // 手動 fetch ではなく Django API 層と同じヘッダーとパス解決を使用
    fetch(statsUrl, {
      headers: getDjangoHeaders(), 
      next: { revalidate: 3600 } 
    }).catch((e) => {
      console.error("[PCSidebar Stats Fetch Failed]:", e);
      return { ok: false };
    })
  ]);

  const recentPosts = (wpData as any).results || [];
  
  // スペック統計データの処理
  let specStats: SidebarData | null = null;
  if (specStatsRes && 'ok' in specStatsRes && (specStatsRes as any).ok) {
    try {
      specStats = await (specStatsRes as Response).json();
    } catch (e) {
      console.error("[PCSidebar Stats Parse Error]:", e);
    }
  }

  // メーカー分けロジック（国内 vs 海外）
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

  /**
   * WPタイトルのHTMLエンティティをデコード
   */
  const decodeTitle = (title: string) => {
    if (!title) return '';
    return title.replace(/&amp;/g, '&').replace(/&#039;/g, "'").replace(/&quot;/g, '"');
  };

  return (
    <aside className={styles.sidebar}>
      
      {/* 🏆 SPECIAL (コンバージョン導線) */}
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

      {/* 1. BRANDS: メーカー別絞り込み */}
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

      {/* 2. SPECS: Djangoから取得した動的な属性統計 */}
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

      {/* 3. LATEST: WordPress最新記事 */}
      <h3 className={styles.sectionTitle}>LATEST ARTICLES</h3>
      <ul className={styles.accordionContent}>
        {recentPosts.length > 0 ? (
          recentPosts.map((post: any) => (
            <li key={post.id} style={{ marginBottom: '10px' }}>
              <Link href={`/blog/${post.id}`} className={styles.link}>
                <span style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
                  📄 {decodeTitle(post.title?.rendered || '無題の記事')}
                </span>
              </Link>
            </li>
          ))
        ) : (
          <li className={styles.link} style={{ fontSize: '0.8rem', color: '#999' }}>
            最新記事を読み込み中...
          </li>
        )}
      </ul>
    </aside>
  );
}
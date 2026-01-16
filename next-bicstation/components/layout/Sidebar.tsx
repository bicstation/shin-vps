'use client'; // 🚀 クライアントコンポーネントであることを明示

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { COLORS } from '@/constants';
import { MakerCount } from '@/lib/api'; 
import styles from './Sidebar.module.css';

// 💡 スペック統計用の型定義
interface AttributeItem {
  id: number;
  name: string;
  slug: string;
  count: number;
  order?: number; // ✅ Django側から渡される並び順プロパティ
}

interface SidebarData {
  [category: string]: AttributeItem[];
}

interface SidebarProps {
  activeMenu?: string; // 現在選択中のメーカーSlug
  makers?: MakerCount[]; 
  recentPosts?: { id: string; title: string; slug?: string }[];
}

export default function Sidebar({ activeMenu, makers = [], recentPosts = [] }: SidebarProps) {
  const pathname = usePathname(); 
  const searchParams = useSearchParams(); 
  
  const attribute = searchParams.get('attribute');
  const siteColor = COLORS?.SITE_COLOR || '#007bff';

  const [specStats, setSpecStats] = useState<SidebarData | null>(null);

  // 🚀 Django APIから統計情報を取得
  useEffect(() => {
    async function fetchSpecStats() {
      try {
        /**
         * 💡 Traefik経由でのアクセスを安定させるため相対パスを使用
         */
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

  /**
   * 🚀 リンク先URLを動的に生成する関数
   */
  const getFilterHref = (attrSlug: string) => {
    const isBrandPage = pathname.startsWith('/brand');
    
    if (isBrandPage && activeMenu) {
      return {
        pathname: `/brand/${activeMenu.toLowerCase()}`,
        query: { attribute: attrSlug },
      };
    }
    
    return {
      pathname: '/pc-products',
      query: { attribute: attrSlug },
    };
  };

  /**
   * 🚀 Linkコンポーネントに渡すhrefを整形するヘルパー
   */
  const formatHref = (hrefObj: { pathname: string; query: { attribute: string } }) => {
    return `${hrefObj.pathname}?attribute=${hrefObj.query.attribute}`;
  };

  return (
    <aside className={styles.sidebar}>
      
      {/* 1. メーカー別（BRANDS） */}
      <h3 className={styles.sectionTitle} style={{ marginTop: 0 }}>BRANDS</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {makers.length > 0 ? (
          makers.map((item) => {
            const makerName = item.maker;
            const productCount = item.count;
            const lowerMaker = makerName.toLowerCase();
            const isActive = activeMenu?.toLowerCase() === lowerMaker;
            
            return (
              <li key={makerName}>
                <Link 
                  href={`/brand/${lowerMaker}`} 
                  className={styles.link}
                  style={{ 
                    color: isActive ? siteColor : undefined,
                    fontWeight: isActive ? 'bold' : 'normal' 
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    💻 {makerName.toUpperCase()}
                  </span>
                  {productCount > 0 && (
                    <span className={styles.badge}>{productCount}</span>
                  )}
                </Link>
              </li>
            );
          })
        ) : (
          <li style={{ color: '#ccc', fontSize: '0.8rem' }}>メーカー取得中...</li>
        )}
      </ul>

      {/* 2. 🚀 スペック・属性別（APIから動的生成 ＆ 表示順ソート適用） */}
      {specStats && Object.entries(specStats)
        /**
         * 💡 カテゴリ自体の並び順を安定させる処理
         * CPU -> メモリ -> NPU のようにカテゴリ名で並び替え
         */
        .sort((a, b) => a[0].localeCompare(b[0], 'ja'))
        .map(([category, items]) => (
        <div key={category}>
          <h3 className={styles.sectionTitle}>{category}</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {items
              /**
               * ✅ 【重要】Django側の order フィールドでアイテムをソート
               * orderが設定されていない場合は 0 とみなして計算
               */
              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
              .map((item) => {
                const isActive = attribute === item.slug;
                
                // カテゴリに応じたアイコンの動的決定
                const icon = category.includes('CPU') ? '🚀' : 
                             category.includes('メモリ') ? '🧠' : 
                             category.includes('NPU') ? '🤖' : '✨';
                
                return (
                  <li key={item.id}>
                    <Link 
                      href={formatHref(getFilterHref(item.slug))}
                      className={styles.link}
                      style={{ 
                        color: isActive ? siteColor : undefined,
                        fontWeight: isActive ? 'bold' : 'normal'
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {icon} {item.name}
                      </span>
                      <span className={styles.badge}>{item.count}</span>
                    </Link>
                  </li>
                );
            })}
          </ul>
        </div>
      ))}

      {/* 3. 最新記事 (LATEST ARTICLES) */}
      <h3 className={styles.sectionTitle}>LATEST ARTICLES</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {recentPosts.length > 0 ? (
          recentPosts.map((post) => (
            <li key={post.id} style={{ marginBottom: '10px', lineHeight: '1.4' }}>
              <Link 
                href={`/bicstation/${post.slug || post.id}`} 
                className={styles.link}
              >
                <span>📄 {post.title}</span>
              </Link>
            </li>
          ))
        ) : (
             <li style={{ color: '#ccc', fontSize: '0.8rem' }}>記事を読み込み中...</li>
        )}
      </ul>

      {/* 4. その他 (OTHERS) */}
      <h3 className={styles.sectionTitle}>OTHERS</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li>
          <Link 
            href="/pc-products" 
            className={styles.link} 
            style={{ color: !attribute && (!activeMenu || activeMenu === 'all') ? siteColor : undefined }}
          >
            <span>🏠 全製品一覧</span>
          </Link>
        </li>
        <li>
          <Link href="/contact" className={styles.link}>
            <span>✉️ スペック相談</span>
          </Link>
        </li>
      </ul>
    </aside>
  );
}
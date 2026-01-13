'use client'; // 🚀 クライアントコンポーネントであることを明示（useState, useEffect使用のため）

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation'; // 🚀 App Router用のフックに変更
import { COLORS } from '@/constants';
import { MakerCount } from '@/lib/api'; 
import styles from './Sidebar.module.css';

// 💡 スペック統計用の型定義
interface AttributeItem {
  id: number;
  name: string;
  slug: string;
  count: number;
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
  const pathname = usePathname(); // 🚀 現在のURLパスを取得
  const searchParams = useSearchParams(); // 🚀 現在のクエリパラメータを取得
  
  // 現在選択されている attribute を取得
  const attribute = searchParams.get('attribute');
  const siteColor = COLORS?.SITE_COLOR || '#007bff';

  // 🚀 スペック統計用のステート
  const [specStats, setSpecStats] = useState<SidebarData | null>(null);

  // 🚀 Django APIから統計情報を取得
  useEffect(() => {
    async function fetchSpecStats() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/pc-sidebar-stats/`);
        if (!res.ok) throw new Error('Network response was not ok');
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
   * 現在メーカーページ (/brand/[slug]) にいればそのパスを維持し、
   * それ以外なら全製品一覧 (/pc-products) へ飛ばす
   */
  const getFilterHref = (attrSlug: string) => {
    // 現在のパスが /brand/ 配下かどうか判定
    const isBrandPage = pathname.startsWith('/brand');
    
    // メーカーページなら、現在のメーカーパスを維持してパラメータを付与
    if (isBrandPage && activeMenu) {
      return {
        pathname: `/brand/${activeMenu.toLowerCase()}`,
        query: { attribute: attrSlug },
      };
    }
    
    // それ以外は全製品ページで絞り込み
    return {
      pathname: '/pc-products',
      query: { attribute: attrSlug },
    };
  };

  /**
   * 🚀 Linkコンポーネントに渡すhrefを文字列に変換するヘルパー
   * Next.js 13以降のLinkはオブジェクトも受け取れますが、型安全のため整形
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

      {/* 2. 🚀 スペック・属性別（APIから動的生成） */}
      {specStats && Object.entries(specStats).map(([category, items]) => (
        <div key={category}>
          <h3 className={styles.sectionTitle}>{category}</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {items.map((item) => {
              const isActive = attribute === item.slug;
              // カテゴリに応じたアイコン
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
                    <span>{icon} {item.name}</span>
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
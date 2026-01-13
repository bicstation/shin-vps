import React from 'react';
import Link from 'next/link';
import { COLORS } from '@/constants';

interface SidebarProps {
  activeMenu?: string;
  // メーカーリストを外部（Page）から渡せるように拡張
  makers?: string[]; 
  recentPosts?: { id: string; title: string; slug?: string }[];
}

export default function Sidebar({ activeMenu, makers = [], recentPosts = [] }: SidebarProps) {
  const siteColor = COLORS?.SITE_COLOR || '#007bff';

  // サブタイトル用の共通スタイル
  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    color: '#aaa',
    marginBottom: '15px',
    marginTop: '30px',
    letterSpacing: '1.5px',
    fontWeight: 'bold',
    borderBottom: '1px solid #f0f0f0',
    paddingBottom: '5px'
  };

  // リンクの共通スタイル（判定を小文字で行う）
  const linkStyle = (isActive: boolean): React.CSSProperties => ({
    color: isActive ? siteColor : '#444',
    textDecoration: 'none',
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 0',
    fontWeight: isActive ? 'bold' : 'normal',
    transition: 'color 0.2s'
  });

  // デフォルトの表示用メーカーリスト（データが空の場合のバックアップ）
  const displayMakers = makers.length > 0 ? makers : ['lenovo', 'hp', 'dell'];

  return (
    <aside style={{ 
      width: '260px', 
      background: '#fff', 
      padding: '20px', 
      borderRight: '1px solid #eee',
      height: 'fit-content',
      position: 'sticky',
      top: '90px'
    }}>
      
      {/* 1. メーカー別（動的生成） */}
      <h3 style={{ ...sectionTitleStyle, marginTop: 0 }}>BRANDS</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {displayMakers.map((maker) => {
          const lowerMaker = maker.toLowerCase();
          const isActive = activeMenu?.toLowerCase() === lowerMaker;
          
          return (
            <li key={maker}>
              <Link 
                href={`/brand/${lowerMaker}`} 
                style={linkStyle(isActive)}
              >
                💻 {maker.toUpperCase()}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* 2. スペック・カテゴリ別 (既存) */}
      <h3 style={sectionTitleStyle}>SPECS & CATEGORY</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li><Link href="/search?cpu=core-i7" style={linkStyle(false)}>🚀 Core i7 / Ryzen 7 以上</Link></li>
        <li><Link href="/search?gpu=rtx" style={linkStyle(false)}>🎮 ゲーミング (RTX搭載)</Link></li>
        <li><Link href="/search?mem=16" style={linkStyle(false)}>🧠 メモリ 16GB 以上</Link></li>
        <li><Link href="/search?ssd=512" style={linkStyle(false)}>💿 SSD 512GB 以上</Link></li>
        <li><Link href="/category/workstation" style={linkStyle(activeMenu === 'workstation')}>🏗️ ワークステーション</Link></li>
      </ul>

      {/* 3. 最新記事 (既存) */}
      <h3 style={sectionTitleStyle}>LATEST ARTICLES</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {recentPosts.length > 0 ? (
          recentPosts.map((post) => (
            <li key={post.id} style={{ marginBottom: '10px', lineHeight: '1.4' }}>
              <Link href={`/bicstation/${post.slug || post.id}`} style={linkStyle(false)}>
                📄 {post.title}
              </Link>
            </li>
          ))
        ) : (
           <li style={{ color: '#ccc', fontSize: '0.8rem' }}>記事を読み込み中...</li>
        )}
      </ul>

      {/* 4. その他 (既存) */}
      <h3 style={sectionTitleStyle}>OTHERS</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li><Link href="/" style={linkStyle(activeMenu === 'all')}>🏠 ホームに戻る</Link></li>
        <li><Link href="/contact" style={linkStyle(false)}>✉️ スペック相談</Link></li>
      </ul>
    </aside>
  );
}
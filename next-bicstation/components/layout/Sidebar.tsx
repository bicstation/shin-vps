import React from 'react';
import Link from 'next/link';
import { COLORS } from '@/constants';
import { MakerCount } from '@/lib/api'; // 型定義をインポート

interface SidebarProps {
  activeMenu?: string;
  // メーカーリストを MakerCount 型の配列に更新
  makers?: MakerCount[]; 
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

  // リンクの共通スタイル
  const linkStyle = (isActive: boolean): React.CSSProperties => ({
    color: isActive ? siteColor : '#444',
    textDecoration: 'none',
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between', // カウントを右端に寄せるため追加
    width: '100%',
    padding: '6px 0',
    fontWeight: isActive ? 'bold' : 'normal',
    transition: 'color 0.2s'
  });

  // バッジ（製品数）のスタイル
  const badgeStyle: React.CSSProperties = {
    fontSize: '0.7rem',
    color: '#888',
    background: '#f5f5f5',
    padding: '2px 8px',
    borderRadius: '12px',
    minWidth: '24px',
    textAlign: 'center'
  };

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
      
      {/* 1. メーカー別（動約生成・カウント付き） */}
      <h3 style={{ ...sectionTitleStyle, marginTop: 0 }}>BRANDS</h3>
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
                  style={linkStyle(isActive)}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    💻 {makerName.toUpperCase()}
                  </span>
                  {/* 製品数が0より大きい場合にバッジを表示 */}
                  {productCount > 0 && (
                    <span style={badgeStyle}>{productCount}</span>
                  )}
                </Link>
              </li>
            );
          })
        ) : (
          <li style={{ color: '#ccc', fontSize: '0.8rem' }}>メーカー取得中...</li>
        )}
      </ul>

      {/* 2. スペック・カテゴリ別 (既存) */}
      <h3 style={sectionTitleStyle}>SPECS & CATEGORY</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li><Link href="/search?cpu=core-i7" style={linkStyle(false)}><span>🚀 Core i7 / Ryzen 7 以上</span></Link></li>
        <li><Link href="/search?gpu=rtx" style={linkStyle(false)}><span>🎮 ゲーミング (RTX搭載)</span></Link></li>
        <li><Link href="/search?mem=16" style={linkStyle(false)}><span>🧠 メモリ 16GB 以上</span></Link></li>
        <li><Link href="/search?ssd=512" style={linkStyle(false)}><span>💿 SSD 512GB 以上</span></Link></li>
        <li><Link href="/category/workstation" style={linkStyle(activeMenu === 'workstation')}><span>🏗️ ワークステーション</span></Link></li>
      </ul>

      {/* 3. 最新記事 (既存) */}
      <h3 style={sectionTitleStyle}>LATEST ARTICLES</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {recentPosts.length > 0 ? (
          recentPosts.map((post) => (
            <li key={post.id} style={{ marginBottom: '10px', lineHeight: '1.4' }}>
              <Link href={`/bicstation/${post.slug || post.id}`} style={linkStyle(false)}>
                <span>📄 {post.title}</span>
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
        <li><Link href="/" style={linkStyle(activeMenu === 'all')}><span>🏠 ホームに戻る</span></Link></li>
        <li><Link href="/contact" style={linkStyle(false)}><span>✉️ スペック相談</span></Link></li>
      </ul>
    </aside>
  );
}
import React from 'react';
import Link from 'next/link';
// ✅ 共通カラー設定をインポート
import { COLORS } from '@/constants';

interface SidebarProps {
  activeMenu?: string;
  recentPosts?: { id: string; title: string }[]; // 外部から記事一覧を渡せるように拡張
}

export default function Sidebar({ activeMenu, recentPosts = [] }: SidebarProps) {
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
    gap: '8px',
    padding: '6px 0',
    fontWeight: isActive ? 'bold' : 'normal',
    transition: 'color 0.2s'
  });

  return (
    <aside style={{ 
      width: '260px', 
      background: '#fff', 
      padding: '20px', 
      borderRight: '1px solid #eee',
      height: 'fit-content',
      position: 'sticky',
      top: '90px' // ヘッダーの高さ + 余白
    }}>
      
      {/* 1. メーカー別 */}
      <h3 style={{ ...sectionTitleStyle, marginTop: 0 }}>BRANDS</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li><Link href="/brand/lenovo" style={linkStyle(activeMenu === 'lenovo')}>💻 Lenovo (レノボ)</Link></li>
        <li><Link href="/brand/hp" style={linkStyle(activeMenu === 'hp')}>💻 HP (ヒューレット・パッカード)</Link></li>
        <li><Link href="/brand/dell" style={linkStyle(activeMenu === 'dell')}>💻 DELL (デル)</Link></li>
      </ul>

      {/* 2. スペック・カテゴリ別 */}
      <h3 style={sectionTitleStyle}>SPECS & CATEGORY</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li><Link href="/search?cpu=core-i7" style={linkStyle(false)}>🚀 Core i7 / Ryzen 7 以上</Link></li>
        <li><Link href="/search?gpu=rtx" style={linkStyle(false)}>🎮 ゲーミング (RTX搭載)</Link></li>
        <li><Link href="/search?mem=16" style={linkStyle(false)}>🧠 メモリ 16GB 以上</Link></li>
        <li><Link href="/search?ssd=512" style={linkStyle(false)}>💿 SSD 512GB 以上</Link></li>
        <li><Link href="/category/workstation" style={linkStyle(activeMenu === 'workstation')}>🏗️ ワークステーション</Link></li>
      </ul>

      {/* 3. ブログ・特集記事 (動的に表示) */}
      <h3 style={sectionTitleStyle}>LATEST ARTICLES</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {recentPosts.length > 0 ? (
          recentPosts.map((post) => (
            <li key={post.id} style={{ marginBottom: '10px', lineHeight: '1.4' }}>
              <Link href={`/bicstation/${post.id}`} style={{ ...linkStyle(false), fontSize: '0.85rem' }}>
                📄 {post.title}
              </Link>
            </li>
          ))
        ) : (
          <>
            <li style={{ marginBottom: '10px', lineHeight: '1.4' }}>
              <Link href="/bicstation/pc-choose-2024" style={{ ...linkStyle(false), fontSize: '0.85rem' }}>
                📄 失敗しない！2024年PCの選び方ガイド
              </Link>
            </li>
            <li style={{ marginBottom: '10px', lineHeight: '1.4' }}>
              <Link href="/bicstation/lenovo-sale-info" style={linkStyle(false)}>
                📄 Lenovo最新セール情報まとめ
              </Link>
            </li>
          </>
        )}
      </ul>

      {/* 4. その他 */}
      <h3 style={sectionTitleStyle}>OTHERS</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li><Link href="/" style={linkStyle(false)}>🏠 ホームに戻る</Link></li>
        <li><Link href="/contact" style={linkStyle(false)}>✉️ スペック相談</Link></li>
      </ul>

    </aside>
  );
}
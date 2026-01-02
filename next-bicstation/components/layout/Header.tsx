import React from 'react';
import Link from 'next/link';
// ✅ 共通カラー設定をインポート
import { COLORS } from '@/constants';

export default function Header() {
  const siteColor = COLORS?.SITE_COLOR || '#007bff';

  return (
    <header style={{ 
      background: '#1a1a1a', 
      color: 'white', 
      padding: '0 40px', // 上下は内部要素で調整
      height: '70px',
      borderBottom: `3px solid ${siteColor}`,
      boxShadow: '0 2px 15px rgba(0,0,0,0.2)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center'
    }}>
      <div style={{ 
        maxWidth: '1240px', 
        width: '100%',
        margin: '0 auto', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        
        {/* 左側：ロゴとメインナビ */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
          <Link href="/" style={{ textDecoration: 'none', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ 
                background: siteColor, 
                color: 'white', 
                padding: '4px 8px', 
                borderRadius: '4px', 
                fontWeight: '900',
                fontSize: '1.2em'
              }}>B</span>
              <h1 style={{ margin: 0, fontSize: '1.4em', fontWeight: 'bold', letterSpacing: '1px' }}>BICSTATION</h1>
            </div>
          </Link>

          <nav style={{ display: 'flex', gap: '20px', fontSize: '0.95em', fontWeight: '500' }}>
            <Link href="/" style={{ color: '#eee', textDecoration: 'none' }}>PCカタログ</Link>
            <Link href="/bicstation" style={{ color: '#aaa', textDecoration: 'none' }}>特集・ブログ</Link>
          </nav>
        </div>

        {/* 右側：ユーザーメニュー */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          
          {/* ログイン前の表示例（本来は認証状態によって切り替えます） */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link href="/login" style={{ 
              color: '#ccc', 
              textDecoration: 'none', 
              fontSize: '0.9em',
              padding: '8px 16px'
            }}>
              ログイン
            </Link>
            
            <Link href="/register" style={{ 
              background: siteColor, 
              color: 'white', 
              textDecoration: 'none', 
              fontSize: '0.9em',
              fontWeight: 'bold',
              padding: '8px 20px',
              borderRadius: '20px',
              transition: 'opacity 0.2s'
            }}>
              新規登録
            </Link>
          </div>

          {/* 境界線 */}
          <div style={{ width: '1px', height: '20px', background: '#444', margin: '0 5px' }}></div>

          {/* マイページアイコン（ログイン後を想定） */}
          <Link href="/mypage" title="マイページ" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: '#333',
            color: '#fff',
            textDecoration: 'none'
          }}>
            👤
          </Link>
        </div>

      </div>
    </header>
  );
}
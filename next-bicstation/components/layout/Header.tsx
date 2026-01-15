'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { COLORS } from '@/constants';
import styles from './Header.module.css'; // CSS Modulesをインポート

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const siteColor = COLORS?.SITE_COLOR || '#007bff';

  // メニューを閉じる
  const closeMenu = () => setIsOpen(false);

  return (
    <header 
      className={styles.header} 
      style={{ 
        borderBottom: `3px solid ${siteColor}`,
        // CSS変数として色を渡す（CSSファイル側で使用可能にする）
        ['--site-color' as any]: siteColor 
      }}
    >
      <div className={styles.container}>
        
        {/* ロゴエリア */}
        <Link href="/" onClick={closeMenu} style={{ textDecoration: 'none', color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ 
              background: siteColor, color: 'white', padding: '4px 8px', 
              borderRadius: '4px', fontWeight: '900', fontSize: '1.2em'
            }}>B</span>
            <h1 style={{ margin: 0, fontSize: '1.2em', fontWeight: 'bold', letterSpacing: '1px' }}>BICSTATION</h1>
          </div>
        </Link>

        {/* 右側：PC用ナビ ＆ スマホ用トグル */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          
          {/* PC用メインナビ */}
          <nav className={styles.desktopNav} style={{ gap: '25px', marginRight: '20px' }}>
            <Link href="/" style={{ color: '#eee', textDecoration: 'none', fontSize: '0.95em' }}>PCカタログ</Link>
            <Link href="https://blog.tiper.live" style={{ color: '#aaa', textDecoration: 'none', fontSize: '0.95em' }}>特集・ブログ</Link>
          </nav>

          {/* PC用ユーザーメニュー */}
          <div className={styles.desktopNav} style={{ gap: '10px' }}>
            <Link href="/login" style={{ color: '#ccc', textDecoration: 'none', fontSize: '0.85em' }}>ログイン</Link>
            <Link href="/register" style={{ 
              background: siteColor, color: 'white', textDecoration: 'none', 
              fontSize: '0.85em', fontWeight: 'bold', padding: '8px 18px', borderRadius: '20px' 
            }}>新規登録</Link>
            <Link href="/mypage" style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '36px', height: '36px', borderRadius: '50%', background: '#333', color: '#fff', textDecoration: 'none', marginLeft: '5px'
            }}>👤</Link>
          </div>

          {/* 🍔 スマホ用ハンバーガーボタン */}
          <button className={styles.menuToggle} onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* 📱 スマホ用展開メニュー（サイドバー要素を統合） */}
      <div 
        className={`${styles.mobileMenu} ${isOpen ? styles.open : ''}`}
        style={{ borderBottom: `2px solid ${siteColor}` }}
      >
        {/* 1. 検索セクション */}
        <div className={styles.menuSection}>
          <p className={styles.sectionTitle}>Search</p>
          <input 
            type="text" 
            placeholder="製品名・スペックを検索..." 
            className={styles.searchBox} 
          />
        </div>

        {/* 2. メインナビゲーション */}
        <div className={styles.menuSection}>
          <p className={styles.sectionTitle}>Navigation</p>
          <Link href="/" onClick={closeMenu}>PCカタログ（トップ）</Link>
          <Link href="https://blog.tiper.live" onClick={closeMenu}>特集・記事一覧</Link>
        </div>

        {/* 3. カテゴリー（サイドバーから移植） */}
        <div className={styles.menuSection}>
          <p className={styles.sectionTitle}>Categories</p>
          <Link href="/category/gaming" onClick={closeMenu}>ゲーミングPC</Link>
          <Link href="/category/laptop" onClick={closeMenu}>ノートパソコン</Link>
          <Link href="/category/desktop" onClick={closeMenu}>デスクトップ</Link>
          <Link href="/category/workstation" onClick={closeMenu}>ワークステーション</Link>
        </div>

        {/* 4. アカウント関連 */}
        <div className={styles.menuSection}>
          <p className={styles.sectionTitle}>Account</p>
          <Link href="/mypage" onClick={closeMenu}>マイページ 👤</Link>
          <Link href="/login" onClick={closeMenu}>ログイン</Link>
          <Link href="/register" onClick={closeMenu} style={{ color: siteColor, fontWeight: 'bold' }}>新規会員登録</Link>
        </div>
      </div>
    </header>
  );
}
'use client'; // 状態変化(useState)を使うため必須

import React, { useState } from 'react';
import Link from 'next/link';
import { COLORS } from '@/constants';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false); // メニューの開閉状態
  const siteColor = COLORS?.SITE_COLOR || '#007bff';

  // メニューを閉じる処理（リンククリック時など）
  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <header style={{ 
      background: '#1a1a1a', 
      color: 'white', 
      padding: '0 20px', // スマホ用に少し狭める
      height: '70px',
      borderBottom: `3px solid ${siteColor}`,
      boxShadow: '0 2px 15px rgba(0,0,0,0.2)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center'
    }}>
      <style dangerouslySetInnerHTML={{ __html: `
        /* スマホではナビゲーションを隠す */
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu { 
            display: ${isOpen ? 'block' : 'none'}; 
            position: absolute;
            top: 70px;
            left: 0;
            width: 100%;
            background: #1a1a1a;
            border-bottom: 2px solid ${siteColor};
            padding: 20px;
            box-sizing: border-box;
            z-index: 999;
          }
          .mobile-menu a {
            display: block;
            padding: 15px 0;
            border-bottom: 1px solid #333;
            color: white;
            text-decoration: none;
          }
        }
        /* PCではハンバーガーボタンを隠す */
        @media (min-width: 769px) {
          .menu-toggle { display: none !important; }
          .mobile-menu { display: none !important; }
        }
      `}} />

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
              <h1 style={{ margin: 0, fontSize: '1.2em', fontWeight: 'bold', letterSpacing: '1px' }}>BICSTATION</h1>
            </div>
          </Link>

          {/* PC用ナビ */}
          <nav className="desktop-nav" style={{ display: 'flex', gap: '20px', fontSize: '0.95em', fontWeight: '500' }}>
            <Link href="/" style={{ color: '#eee', textDecoration: 'none' }}>PCカタログ</Link>
            <Link href="https://blog.tiper.live" style={{ color: '#aaa', textDecoration: 'none' }}>特集・ブログ</Link>
          </nav>
        </div>

        {/* 右側：ユーザーメニュー ＋ ハンバーガー */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          
          <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link href="/login" style={{ color: '#ccc', textDecoration: 'none', fontSize: '0.9em' }}>ログイン</Link>
            <Link href="/register" style={{ 
              background: siteColor, color: 'white', textDecoration: 'none', 
              fontSize: '0.9em', fontWeight: 'bold', padding: '8px 16px', borderRadius: '20px' 
            }}>新規登録</Link>
          </div>

          <Link href="/mypage" className="desktop-nav" style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '38px', height: '38px', borderRadius: '50%', background: '#333', color: '#fff', textDecoration: 'none'
          }}>👤</Link>

          {/* 🍔 スマホ用トグルボタン */}
          <button 
            className="menu-toggle"
            onClick={toggleMenu}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '5px'
            }}
          >
            {isOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* 📱 スマホ用展開メニュー */}
      <div className="mobile-menu">
        <Link href="/" onClick={toggleMenu}>PCカタログ</Link>
        <Link href="https://blog.tiper.live" onClick={toggleMenu}>特集・ブログ</Link>
        <Link href="/login" onClick={toggleMenu}>ログイン</Link>
        <Link href="/register" onClick={toggleMenu}>新規登録</Link>
        <Link href="/mypage" onClick={toggleMenu}>マイページ 👤</Link>
      </div>
    </header>
  );
}
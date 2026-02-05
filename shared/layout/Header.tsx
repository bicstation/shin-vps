'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
// ✅ shared 内の設定を参照
import { getSiteMetadata, getSiteColor } from '../lib/siteConfig';
import styles from './Header.module.css';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  
  const pathname = usePathname(); 

  // ✅ サイト情報を動的に取得（引数なしでホスト名判定）
  const site = getSiteMetadata();
  const themeColor = getSiteColor(site.site_name);

  const checkAuthStatus = useCallback(() => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('access_token');
    const userDataStr = localStorage.getItem('user'); 
    const storedRole = localStorage.getItem('user_role');

    if (userDataStr || token) {
      setIsLoggedIn(true);
      setUserRole(storedRole || '一般');
      
      if (userDataStr) {
        try {
          const userObj = JSON.parse(userDataStr);
          setUserName(userObj.username || userObj.name || 'ユーザー');
        } catch (e) {
          setUserName('ユーザー');
        }
      }
    } else {
      setIsLoggedIn(false);
      setUserRole(null);
      setUserName(null);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [pathname, checkAuthStatus]);

  const closeMenu = () => setIsOpen(false);

  const handleLogout = () => {
    if (confirm('ログアウトしますか？')) {
      localStorage.clear();
      // ✅ prefix を削除。ホスト名運用なので常に "/" への遷移でOK
      window.location.href = '/';
    }
  };

  return (
    <header 
      className={styles.header} 
      style={{ 
        borderBottom: `3px solid ${themeColor}`,
        backgroundColor: site.site_group === 'adult' ? '#111' : '#1a1a1a',
      }}
    >
      <div className={styles.container}>
        
        {/* ロゴエリア - ホスト名運用なので href="/" で各サイトのトップに飛びます */}
        <Link href="/" onClick={closeMenu} style={{ textDecoration: 'none', color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ 
              background: themeColor, color: 'white', padding: '4px 8px', 
              borderRadius: '4px', fontWeight: '900', fontSize: '1.2em'
            }}>
              {site.site_name.charAt(0)}
            </span>
            <div style={{ margin: 0, fontSize: '1.2em', fontWeight: 'bold', letterSpacing: '1px' }}>
              {site.site_name.toUpperCase()}
            </div>
          </div>
        </Link>

        {/* 右側：PC用ナビ */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          
          <nav className={styles.desktopNav} style={{ gap: '25px', marginRight: '20px' }}>
            {site.site_group === 'general' ? (
              <Link href="/pc-finder" style={{ color: themeColor, textDecoration: 'none', fontWeight: 'bold' }}>
                🔍 PC診断
              </Link>
            ) : (
              <Link href="/ranking" style={{ color: themeColor, textDecoration: 'none', fontWeight: 'bold' }}>
                🔥 人気ランキング
              </Link>
            )}
            <Link href="/" style={{ color: '#eee', textDecoration: 'none' }}>カタログ</Link>
          </nav>

          {/* アカウント関連 */}
          <div className={styles.desktopNav} style={{ gap: '10px', alignItems: 'center' }}>
            {!isLoggedIn ? (
              <>
                <Link href="/login" style={{ color: '#ccc', textDecoration: 'none', fontSize: '0.85em' }}>ログイン</Link>
                <Link href="/register" style={{ 
                  background: themeColor, color: 'white', textDecoration: 'none', 
                  fontSize: '0.85em', fontWeight: 'bold', padding: '8px 18px', borderRadius: '20px' 
                }}>新規登録</Link>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ 
                  fontSize: '0.75em', padding: '2px 8px', borderRadius: '10px', 
                  background: site.site_group === 'adult' ? '#ff4d4f' : '#52c41a', color: 'white' 
                }}>
                  {site.site_group === 'adult' ? 'ADULT' : '一般'}
                </span>

                <span style={{ color: '#fff', fontSize: '0.9em' }}>{userName} 様</span>
                
                <Link href="/mypage" style={{ color: '#eee', textDecoration: 'none', fontSize: '0.9em' }}>マイページ</Link>
                
                <button onClick={handleLogout} className={styles.logoutBtn}>ログアウト</button>
              </div>
            )}
          </div>

          <button className={styles.menuToggle} onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* スマホ用展開メニュー */}
      <div 
        className={`${styles.mobileMenu} ${isOpen ? styles.open : ''}`} 
        style={{ borderBottom: `2px solid ${themeColor}` }}
      >
        <div className={styles.menuSection}>
          <p className={styles.sectionTitle}>Navigation</p>
          <Link href="/" onClick={closeMenu}>トップページ</Link>
          <input 
            type="text" 
            placeholder="キーワード検索..." 
            className={styles.searchBox} 
            onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.target.style.borderColor = themeColor}
            onBlur={(e: React.FocusEvent<HTMLInputElement>) => e.target.style.borderColor = '#444'}
            style={{ border: '1px solid #444', transition: 'border-color 0.2s' }}
          />
        </div>
      </div>
    </header>
  );
}
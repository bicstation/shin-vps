'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { COLORS } from '@/constants';
import styles from './Header.module.css';
import { logoutUser } from '../../lib/auth';

/**
 * 🛠️ 修正のポイント:
 * 1. ログイン中の「ユーザー名」を表示するステートを追加
 * 2. checkAuthStatus で localStorage から username を抽出
 * 3. PC版/スマホ版それぞれのレイアウトにユーザー名を配置
 */

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null); // 🚀 ユーザー名表示用
  
  const router = useRouter();
  const pathname = usePathname(); 

  const siteColor = COLORS?.SITE_COLOR || '#007bff';

  /**
   * 💡 ログイン状態のチェックロジックを共通化
   */
  const checkAuthStatus = useCallback(() => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('access_token');
    const userDataStr = localStorage.getItem('user'); 
    const storedRole = localStorage.getItem('user_role');

    if (userDataStr || token) {
      setIsLoggedIn(true);
      setUserRole(storedRole || '一般');
      
      // 🚀 ユーザーオブジェクトから名前を取得
      if (userDataStr) {
        try {
          const userObj = JSON.parse(userDataStr);
          setUserName(userObj.username || userObj.name || 'ユーザー');
        } catch (e) {
          setUserName('ユーザー');
        }
      }
      console.log("✅ [Header] Auth Status: Logged In", { role: storedRole, name: userName });
    } else {
      setIsLoggedIn(false);
      setUserRole(null);
      setUserName(null);
      console.log("ℹ️ [Header] Auth Status: Not Logged In");
    }
  }, [userName]);

  // 1. 初回マウント時にチェック
  // 2. ページ遷移 (pathname変更) ごとにチェックを実行
  useEffect(() => {
    checkAuthStatus();
  }, [pathname, checkAuthStatus]);

  const closeMenu = () => setIsOpen(false);

  const handleLogout = () => {
    if (confirm('ログアウトしますか？')) {
      logoutUser();
    }
  };

  return (
    <header 
      className={styles.header} 
      style={{ 
        borderBottom: `3px solid ${siteColor}`,
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
            <div style={{ margin: 0, fontSize: '1.2em', fontWeight: 'bold', letterSpacing: '1px' }}>BICSTATION</div>
          </div>
        </Link>

        {/* 右側：PC用ナビ ＆ スマホ用トグル */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          
          <nav className={styles.desktopNav} style={{ gap: '25px', marginRight: '20px' }}>
            <Link 
              href="/pc-finder" 
              style={{ 
                color: siteColor, 
                textDecoration: 'none', 
                fontSize: '0.95em', 
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span style={{ fontSize: '1.1em' }}>🔍</span> PC診断
            </Link>
            <Link href="/" style={{ color: '#eee', textDecoration: 'none', fontSize: '0.95em' }}>PCカタログ</Link>
          </nav>

          {/* 🚀 PC用：ログイン状態による切り分け */}
          <div className={styles.desktopNav} style={{ gap: '10px', alignItems: 'center' }}>
            {!isLoggedIn ? (
              <>
                <Link href="/login" style={{ color: '#ccc', textDecoration: 'none', fontSize: '0.85em' }}>ログイン</Link>
                <Link href="/register" style={{ 
                  background: siteColor, color: 'white', textDecoration: 'none', 
                  fontSize: '0.85em', fontWeight: 'bold', padding: '8px 18px', borderRadius: '20px' 
                }}>新規登録</Link>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* ロールバッジ */}
                <span style={{ 
                  fontSize: '0.75em', padding: '2px 8px', borderRadius: '10px', 
                  background: userRole === 'adult' ? '#ff4d4f' : '#52c41a', color: 'white' 
                }}>
                  {userRole === 'adult' ? 'ADULT' : '一般'}
                </span>

                {/* 🚀 ユーザー名表示 */}
                <span style={{ color: '#fff', fontSize: '0.9em', fontWeight: '500' }}>
                  {userName} 様
                </span>
                
                <Link href="/mypage" style={{ color: '#eee', textDecoration: 'none', fontSize: '0.9em' }}>マイページ</Link>
                
                <button 
                  onClick={handleLogout}
                  style={{ 
                    background: 'transparent', border: '1px solid #555', color: '#aaa', 
                    padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8em' 
                  }}
                >
                  ログアウト
                </button>

                <Link href="/mypage" style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '32px', height: '32px', borderRadius: '50%', background: '#333', color: '#fff', textDecoration: 'none'
                }}>👤</Link>
              </div>
            )}
          </div>

          <button className={styles.menuToggle} onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* 📱 スマホ用展開メニュー */}
      <div className={`${styles.mobileMenu} ${isOpen ? styles.open : ''}`} style={{ borderBottom: `2px solid ${siteColor}` }}>
        <div className={styles.menuSection}>
          <p className={styles.sectionTitle}>Navigation</p>
          <Link href="/pc-finder" onClick={closeMenu} style={{ color: siteColor, fontWeight: 'bold' }}>
            🔍 AIスペック診断 (PC-FINDER)
          </Link>
          <Link href="/" onClick={closeMenu}>PCカタログ</Link>
        </div>

        {/* スマホ用アカウントセクション */}
        <div className={styles.menuSection}>
          <p className={styles.sectionTitle}>Account</p>
          {isLoggedIn ? (
            <>
              {/* 🚀 スマホ版ユーザー名表示 */}
              <div style={{ padding: '5px 0', color: siteColor, fontWeight: 'bold', fontSize: '1.1em' }}>
                👤 {userName} 様
              </div>
              <div style={{ padding: '10px 0', color: '#fff', display: 'flex', justifyContent: 'space-between', fontSize: '0.9em' }}>
                <span>ステータス:</span>
                <span style={{ color: userRole === 'adult' ? '#ff4d4f' : '#52c41a' }}>{userRole === 'adult' ? 'ADULT' : '一般会員'}</span>
              </div>
              <Link href="/mypage" onClick={closeMenu}>マイページ 👤</Link>
              <a onClick={handleLogout} style={{ cursor: 'pointer', color: '#ff4d4f' }}>ログアウト</a>
            </>
          ) : (
            <>
              <Link href="/login" onClick={closeMenu}>ログイン</Link>
              <Link href="/register" onClick={closeMenu} style={{ color: siteColor, fontWeight: 'bold' }}>新規会員登録</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
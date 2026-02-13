'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
// ✅ shared 内の設定を参照
import { getSiteMetadata, getSiteColor } from '../lib/siteConfig';
import styles from './Header.module.css';

// ✅ 共通デバッグコンポーネントをインポート
import SystemDiagnostic from '@/shared/debug/SystemDiagnostic';

interface HeaderProps {
  // ページ側から詳細データが渡される場合のオプション
  debugData?: {
    id?: string;
    source?: string;
    targetUrl?: string;
    data?: any;
    errorMsg?: string | null;
    apiInternalUrl?: string;
  };
}

/**
 * 🛰️ デバッグ表示の判定・描画用サブコンポーネント
 * (useSearchParams を使用するため Suspense 内で動作させる)
 */
function DebugLayer({ debugData }: { debugData?: HeaderProps['debugData'] }) {
  const searchParams = useSearchParams();
  const isDebugParam = searchParams.get('debug') === 'true';
  const isLocal = process.env.NODE_ENV === 'development';
  
  // 🌍 判定条件：ローカル環境である、もしくは URL に debug=true がある場合
  const shouldShowDebug = isLocal || isDebugParam;

  if (!shouldShowDebug) return null;

  return (
    <div style={{ 
      background: '#050510', 
      borderBottom: '2px solid #ffcc00',
      width: '100%',
      position: 'relative',
      zIndex: 10000 
    }}>
      <SystemDiagnostic 
        id={debugData?.id}
        source={debugData?.source}
        targetUrl={debugData?.targetUrl}
        data={debugData?.data}
        errorMsg={debugData?.errorMsg}
        apiInternalUrl={debugData?.apiInternalUrl || process.env.NEXT_PUBLIC_API_URL}
      />
      <div style={{
        background: '#ffcc00',
        color: '#000',
        fontSize: '10px',
        fontWeight: '900',
        padding: '2px 10px',
        display: 'flex',
        justifyContent: 'space-between',
        fontFamily: 'monospace'
      }}>
        <span>📡 SYSTEM_DIAGNOSTIC_ACTIVE // ENV: {process.env.NODE_ENV.toUpperCase()}</span>
        <span>{isLocal ? 'FORCED_BY_LOCAL_DEV' : 'TRIGGERED_BY_URL_PARAM'}</span>
      </div>
    </div>
  );
}

export default function Header({ debugData }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  
  const pathname = usePathname(); 

  // ✅ サイト情報を動的に取得
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
      window.location.href = '/';
    }
  };

  return (
    <>
      {/* --- 🚀 診断ターミナル (最上部に配置) --- */}
      <Suspense fallback={null}>
        <DebugLayer debugData={debugData} />
      </Suspense>

      <header 
        className={styles.header} 
        style={{ 
          borderBottom: `3px solid ${themeColor}`,
          backgroundColor: site.site_group === 'adult' ? '#111' : '#1a1a1a',
        }}
      >
        <div className={styles.container}>
          
          {/* ロゴエリア */}
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
    </>
  );
}
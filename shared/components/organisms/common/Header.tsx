'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * ✅ 物理パスに基づいた正しいインポート
 * tree構造に従い、@shared/lib/utils/siteConfig を指定。
 * TypeScriptの標準規則に従い、インポート時の拡張子 (.ts) は削除しています。
 */
import { getSiteMetadata, getSiteColor } from '@shared/lib/utils/siteConfig';
import styles from './Header.module.css';

/**
 * =====================================================================
 * 🧱 [ORGANISM] Header (shared/components/organisms/common/Header.tsx)
 * 全サイト共通の動的ヘッダー。
 * サイト設定に応じたカラー、ナビゲーション、認証状態を統合管理します。
 * =====================================================================
 */
export default function Header() {
    const [isOpen, setIsOpen] = useState(false); // スマホメニュー用
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null); // PCドロップダウン用
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [userName, setUserName] = useState<string | null>(null);
    
    const pathname = usePathname(); 

    // ✅ siteConfig から全メタデータを取得
    const site = getSiteMetadata();
    const themeColor = getSiteColor(site.site_name);

    // 🌐 ドメインごとの判定フラグ
    const isAdult = site.site_group === 'adult';
    const isTiper = site.site_name === 'Tiper';
    const isAVFlash = site.site_name === 'AV Flash';
    const isBicSaving = site.site_name === 'Bic Saving';
    const isBicStation = site.site_name === 'Bic Station';

    // 🛠️ 3カラムメニューの定義 (ドメイン別に動的に切り替え)
    const menuConfig = {
        col1: {
            title: isAdult ? '🔥 注目コンテンツ' : '🔍 診断・検索',
            links: isTiper ? [{label: '艶華ランキング', href: '/ranking'}, {label: '新人女優', href: '/newface'}] :
                   isAVFlash ? [{label: '新着動画', href: '/new-arrival'}, {label: 'ランキング', href: '/ranking'}] :
                   isBicStation ? [{label: 'PC診断', href: '/pc-finder'}, {label: 'おすすめPC', href: '/recommend'}] :
                   [{label: 'キャンペーン', href: '/campaign'}, {label: '特売品', href: '/sale'}]
        },
        col2: {
            title: isAdult ? '🎞️ カテゴリ' : '📦 プロダクト',
            links: isAdult ? [{label: '女優名鑑', href: '/ranking/style'}, {label: 'メーカー一覧', href: '/maker'}] :
                            [{label: '製品カタログ', href: '/catalog'}, {label: '性能比較', href: '/comparison'}]
        },
        col3: {
            title: '✨ サポート',
            links: [
                {label: isAdult ? '🍷 AIソムリエ相談' : '🤖 AIコンシェルジュ', href: '/contact'},
                {label: 'ご利用ガイド', href: '/guide'}
            ]
        }
    };

    /**
     * 🔐 認証ステータス確認 (クライアントサイド専用)
     */
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
                } catch (e) { setUserName('ユーザー'); }
            }
        } else {
            setIsLoggedIn(false);
            setUserRole(null);
            setUserName(null);
        }
    }, []);

    useEffect(() => {
        checkAuthStatus();
        setIsOpen(false);
        setActiveDropdown(null);
    }, [pathname, checkAuthStatus]);

    const handleLogout = () => {
        const confirmMsg = isAdult ? 'ログアウトして、よろしいですか？' : 'ログアウトしますか？';
        if (confirm(confirmMsg)) {
            localStorage.clear();
            window.location.href = '/';
        }
    };

    return (
        <header 
            className={`${styles.header} ${isAdult ? styles.adultBg : styles.generalBg}`} 
            style={{ borderBottom: `3px solid ${themeColor}` }}
        >
            <div className={styles.container}>
                {/* --- ロゴエリア --- */}
                <Link href="/" onClick={() => setIsOpen(false)} style={{ textDecoration: 'none' }}>
                    <div className={styles.logoWrapper}>
                        <span style={{ 
                            background: themeColor, color: 'white', padding: '4px 10px', 
                            borderRadius: '6px', fontWeight: '900', fontSize: '1.2em'
                        }}>
                            {site.site_name.charAt(0)}
                        </span>
                        <div className={styles.brandInfo}>
                            <div className={styles.siteName} style={{ color: isAdult ? 'white' : '#111' }}>
                                {site.site_name.toUpperCase()}
                            </div>
                            <span className={styles.tagline} style={{ color: themeColor }}>
                                {isTiper && "PREMIUM ADULT SOMMELIER"}
                                {isAVFlash && "ULTIMATE MOVIE ARCHIVE"}
                                {isBicSaving && "SMART SAVING GUIDE"}
                                {isBicStation && "TOTAL PC SUPPORT"}
                            </span>
                        </div>
                    </div>
                </Link>

                {/* --- PC用: 3カラムドロップダウンナビ --- */}
                <nav className={styles.desktopNav}>
                    {Object.entries(menuConfig).map(([key, section]) => (
                        <div 
                            key={key} 
                            className={styles.navGroup}
                            onMouseEnter={() => setActiveDropdown(key)}
                            onMouseLeave={() => setActiveDropdown(null)}
                        >
                            <span className={styles.navTitle} style={{ color: isAdult ? '#eee' : '#333' }}>
                                {section.title}
                            </span>
                            {activeDropdown === key && (
                                <div className={styles.dropdown} style={{ borderTop: `2px solid ${themeColor}` }}>
                                    {section.links.map((link, i) => (
                                        <Link key={i} href={link.href} className={styles.dropdownItem}>
                                            {link.label}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </nav>

                {/* --- 認証・アクション --- */}
                <div className={styles.authSection}>
                    {!isLoggedIn ? (
                        <div className={styles.guestLinks}>
                            <Link href="/login" className={styles.loginLink} style={{ color: isAdult ? '#bbb' : '#666' }}>ログイン</Link>
                            <Link href="/register" className={styles.regBtn} style={{ background: themeColor }}>
                                {isAdult ? '会員入会' : '新規登録'}
                            </Link>
                        </div>
                    ) : (
                        <div className={styles.loggedInWrapper}>
                            <span className={styles.userNameDisplay} style={{ color: isAdult ? '#fff' : '#333' }}>
                                {isTiper ? '貴賓：' : ''}{userName} <small>様</small>
                            </span>
                            <Link href="/mypage" className={styles.mypageLink}>My</Link>
                            <button onClick={handleLogout} className={styles.logoutBtn} title="ログアウト">🚪</button>
                        </div>
                    )}
                    
                    {/* スマホ用トグル */}
                    <button 
                        className={styles.menuToggle} 
                        onClick={() => setIsOpen(!isOpen)} 
                        style={{ color: isAdult ? '#fff' : '#333' }}
                        aria-label="メニュー開閉"
                    >
                        {isOpen ? '✕' : '☰'}
                    </button>
                </div>
            </div>

            {/* --- 📱 スマホ用展開メニュー --- */}
            <div className={`${styles.mobileMenu} ${isOpen ? styles.open : ''}`} style={{ background: isAdult ? '#111' : '#fff' }}>
                <div className={styles.mobileSearchWrapper}>
                    <input type="text" placeholder="キーワード検索..." className={styles.searchBox} />
                </div>

                {Object.entries(menuConfig).map(([key, section]) => (
                    <div key={key} className={styles.menuSection}>
                        <p className={styles.sectionTitle} style={{ color: themeColor }}>{section.title}</p>
                        {section.links.map((link, i) => (
                            <Link key={i} href={link.href} onClick={() => setIsOpen(false)} style={{ color: isAdult ? '#eee' : '#444' }}>
                                {link.label}
                            </Link>
                        ))}
                    </div>
                ))}

                <div className={styles.menuSection}>
                    <p className={styles.sectionTitle}>Account</p>
                    {!isLoggedIn ? (
                        <>
                            <Link href="/login" onClick={() => setIsOpen(false)}>ログイン</Link>
                            <Link href="/register" onClick={() => setIsOpen(false)} style={{ color: themeColor }}>
                                {isAdult ? '会員入会' : '新規登録'}
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link href="/mypage" onClick={() => setIsOpen(false)}>マイページ</Link>
                            <button onClick={handleLogout} className={styles.mobileLogoutBtn}>ログアウト 🚪</button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
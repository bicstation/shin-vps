'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * ✅ エイリアスを @/shared に統一
 */
import { getSiteMetadata, getSiteColor } from '@/shared/lib/utils/siteConfig';
import styles from './Header.module.css';

/**
 * =====================================================================
 * 🧱 [ORGANISM] Header (shared/components/organisms/common/Header.tsx)
 * 🛡️ Maya's Logic: ハイドレーション・ガード & マルチドメイン完全対応版
 * =====================================================================
 */
export default function Header() {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false); // ハイドレーションエラー防止用
    const [isOpen, setIsOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState<string | null>(null);

    // ✅ マウント状態の管理
    useEffect(() => {
        setMounted(true);
    }, []);

    // ✅ サイト設定の動的取得 (クライアントサイドでの安全な判定)
    const site = useMemo(() => {
        if (!mounted || typeof window === 'undefined') return null;
        const host = window.location.hostname;
        return getSiteMetadata(host);
    }, [mounted]);

    /**
     * 🔐 認証ステータス確認
     */
    const checkAuthStatus = useCallback(() => {
        if (typeof window === 'undefined') return;
        const userDataStr = localStorage.getItem('user');
        if (userDataStr) {
            try {
                const userObj = JSON.parse(userDataStr);
                setIsLoggedIn(true);
                setUserName(userObj.username || userObj.name || 'ユーザー');
            } catch (e) {
                setIsLoggedIn(false);
            }
        } else {
            setIsLoggedIn(false);
        }
    }, []);

    useEffect(() => {
        checkAuthStatus();
        setIsOpen(false);
        setActiveDropdown(null);
    }, [pathname, checkAuthStatus]);

    const handleLogout = () => {
        const isAdult = site?.site_group === 'adult';
        if (confirm(isAdult ? 'ログアウトしてよろしいですか？' : 'ログアウトしますか？')) {
            localStorage.clear();
            window.location.href = '/';
        }
    };

    // 🚩 ガード: マウント前やサイトデータ未取得時は透明なプレースホルダーを返す
    // これにより "Element type is invalid" やハイドレーションエラーを封殺します
    if (!mounted || !site) {
        return <header className={styles.header} style={{ height: '70px', visibility: 'hidden' }} />;
    }

    const themeColor = getSiteColor(site.site_name);
    const isAdult = site.site_group === 'adult';

    // 🛠️ ドメイン別メニュー設定
    const menuConfig = {
        col1: {
            title: isAdult ? '🔥 注目コンテンツ' : '🔍 診断・検索',
            links: site.site_name === 'Tiper' ? [{label: '艶華ランキング', href: '/ranking'}, {label: '新人女優', href: '/newface'}] :
                   site.site_name === 'Bic Station' ? [{label: 'PC診断', href: '/pc-finder'}, {label: 'おすすめPC', href: '/recommend'}] :
                   [{label: '新着動画', href: '/new-arrival'}, {label: 'ランキング', href: '/ranking'}]
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

    return (
        <header 
            className={`${styles.header} ${isAdult ? styles.adultBg : styles.generalBg}`} 
            style={{ borderBottom: `3px solid ${themeColor}` }}
        >
            <div className={styles.container}>
                {/* ロゴエリア */}
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
                                {site.site_name === 'Tiper' && "PREMIUM ADULT SOMMELIER"}
                                {site.site_name === 'Bic Station' && "TOTAL PC SUPPORT"}
                            </span>
                        </div>
                    </div>
                </Link>

                {/* PCナビゲーション */}
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

                {/* 認証・アクション */}
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
                                {site.site_name === 'Tiper' ? '貴賓：' : ''}{userName} <small>様</small>
                            </span>
                            <Link href="/mypage" className={styles.mypageLink}>My</Link>
                            <button onClick={handleLogout} className={styles.logoutBtn} title="ログアウト">🚪</button>
                        </div>
                    )}
                    
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

            {/* スマホ用メニュー */}
            <div className={`${styles.mobileMenu} ${isOpen ? styles.open : ''}`} style={{ background: isAdult ? '#111' : '#fff' }}>
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
            </div>
        </header>
    );
}
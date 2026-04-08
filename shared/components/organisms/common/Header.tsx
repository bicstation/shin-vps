'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * ✅ 内部ライブラリのインポート
 */
import { getSiteMetadata, getSiteColor } from '@/shared/lib/utils/siteConfig';
import styles from './Header.module.css';

/**
 * =====================================================================
 * 🛡️ Maya's Logic: ハイブリッド・アイデンティティ確定ヘッダー (完全版)
 * ---------------------------------------------------------------------
 * 🚀 更新内容:
 * 1. 各ドメインの guide/ リンクを動的に生成し、ドロップダウンへ統合。
 * 2. BIC STATION 用のガイド構成（BTO/周辺機器/パーツ）を追加。
 * 3. SSR 時のアイデンティティ解決を維持しつつ、ナビゲーションを強化。
 * =====================================================================
 */
export default function Header() {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState<string | null>(null);

    // 🛰️ アイデンティティの確定
    const site = useMemo(() => {
        const identifier = typeof window !== 'undefined' 
            ? window.location.hostname 
            : process.env.NEXT_PUBLIC_SITE_DOMAIN;

        return getSiteMetadata(identifier || "");
    }, []);

    useEffect(() => {
        setMounted(true);
    }, []);

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

    if (!site) {
        return <header className={styles.header} style={{ height: '70px', visibility: 'hidden' }} />;
    }

    const themeColor = getSiteColor(site.site_name);
    const isAdult = site.site_group === 'adult';

    /**
     * 🛠️ サイト別「ガイド」メニュー動的生成
     */
    const dynamicGuideLinks = useMemo(() => {
        switch (site.site_name) {
            case 'Saving':
                return [
                    { label: '💳 クレジットカード', href: '/guide/card' },
                    { label: '📈 証券・FX口座', href: '/guide/broker' },
                    { label: '📱 格安SIM比較', href: '/guide/sim' },
                ];
            case 'Tiper':
            case 'AV Flash':
                return [
                    { label: '🎯 マッチング解析', href: '/guide/matching' },
                    { label: '📺 ライブチャット案内', href: '/guide/live-chat' },
                    { label: '💌 チャットレディ募集', href: '/guide/chat-lady' }
                ];
            case 'Bic Station':
                return [
                    { label: '🔥 BTOセール・裏技比較', href: '/guide/bto' },
                    { label: '📊 パーツ別・コスパ分岐点', href: '/guide/parts' },
                    { label: '🛒 周辺機器・底値リスト', href: '/guide/peripherals' }
                ];
            default:
                return [];
        }
    }, [site.site_name]);

    const supportLinks = [
        { label: isAdult ? '🍷 AIソムリエ相談' : '🤖 AIコンシェルジュ', href: '/concierge' },
        ...dynamicGuideLinks,
        { label: 'お問い合わせ', href: '/contact' },
        { label: '当サイトについて', href: '/about' },
        { label: 'ご利用ガイド', href: '/guideline' }
    ];

    const menuConfig = {
        col1: {
            title: isAdult ? '🔥 注目' : '🔍 診断',
            links: site.site_name === 'Tiper' ? [
                { label: '艶華ランキング', href: '/ranking' }, 
                { label: '新人女優', href: '/newface' }
            ] : site.site_name === 'Bic Station' ? [
                { label: 'PC診断', href: '/pc-finder' }, 
                { label: 'おすすめPC', href: '/recommend' }
            ] : [
                { label: '新着記事', href: '/news' }, 
                { label: 'ランキング', href: '/ranking' }
            ]
        },
        col2: {
            title: isAdult ? '🎞️ カテゴリ' : '📦 ツール',
            links: isAdult ? [
                { label: '女優名鑑', href: '/ranking/style' }, 
                { label: 'メーカー名', href: '/maker' }
            ] : [
                { label: '性能比較', href: '/comparison' }, 
                { label: 'カタログ', href: '/catalog' }
            ]
        },
        col3: {
            title: '✨ ガイド & サポート',
            links: supportLinks
        }
    };

    return (
        <header 
            className={`${styles.header} ${isAdult ? styles.adultBg : styles.generalBg}`} 
            style={{ borderBottom: `3px solid ${themeColor}` }}
        >
            <div className={styles.container}>
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
                                {site.site_name === 'AV Flash' && "NEWS & ARCHIVE"}
                                {site.site_name === 'Saving' && "LIFE HACK & COST CUT"}
                            </span>
                        </div>
                    </div>
                </Link>

                <nav className={styles.desktopNav}>
                    {Object.entries(menuConfig).map(([key, section]) => (
                        <div 
                            key={key} 
                            className={styles.navGroup}
                            onMouseEnter={() => setActiveDropdown(key)}
                            onMouseLeave={() => setActiveDropdown(null)}
                        >
                            <span className={styles.navTitle} style={{ color: isAdult ? '#eee' : '#333' }}>
                                {section.title} <span className={styles.arrow}>▼</span>
                            </span>
                            {activeDropdown === key && (
                                <div className={styles.dropdown} style={{ borderTop: `3px solid ${themeColor}` }}>
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
                            <Link href="/mypage" className={styles.mypageLink} style={{ borderColor: themeColor, color: themeColor }}>My</Link>
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

            {/* モバイルメニュー */}
            <div className={`${styles.mobileMenu} ${isOpen ? styles.open : ''}`} style={{ background: isAdult ? '#111' : '#fff' }}>
                {Object.entries(menuConfig).map(([key, section]) => (
                    <div key={key} className={styles.menuSection}>
                        <p className={styles.sectionTitle} style={{ color: themeColor, borderLeft: `4px solid ${themeColor}`, paddingLeft: '10px' }}>
                            {section.title}
                        </p>
                        <div className={styles.mobileLinkGrid}>
                            {section.links.map((link, i) => (
                                <Link key={i} href={link.href} onClick={() => setIsOpen(false)} style={{ color: isAdult ? '#ccc' : '#444' }}>
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
                
                {!isLoggedIn && (
                    <div className={styles.mobileAuthActions}>
                        <Link href="/login" onClick={() => setIsOpen(false)} className={styles.mobileLoginBtn}>ログイン</Link>
                        <Link href="/register" onClick={() => setIsOpen(false)} className={styles.mobileRegBtn} style={{ background: themeColor }}>新規登録</Link>
                    </div>
                )}
            </div>
        </header>
    );
}
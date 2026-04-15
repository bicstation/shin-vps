'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * ✅ 内部ライブラリのインポート
 */
import { getSiteMetadata } from '@/shared/lib/utils/siteConfig';
import styles from './Header.module.css';

/**
 * =====================================================================
 * 🛡️ Maya's Logic: ハイブリッド・アイデンティティ確定ヘッダー (Hardened Edition)
 * ---------------------------------------------------------------------
 * 🚀 修正の要点:
 * 1. 【安全な文字列操作】site_name の未定義エラー(toUpperCase)を完全封殺。
 * 2. 【ハイドレーション同期】mounted フラグによりSSRとの不整合を回避。
 * 3. 【フォールバック】データ欠落時もレイアウトを崩さないガードを実装。
 * =====================================================================
 */
export default function Header() {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState<string | null>(null);

    // 🛰️ アイデンティティの確定 (安全なデフォルト値を設定)
    const site = useMemo(() => {
        const identifier = typeof window !== 'undefined' 
            ? window.location.hostname 
            : '';

        // site が null の場合でも downstream で落ちないように空の構造を担保
        const meta = getSiteMetadata(identifier);
        return meta || {
            site_name: 'Loading...',
            site_tag: 'general',
            site_group: 'general',
            theme_color: '#333',
            site_prefix: '/general'
        };
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

    // 🛡️ SSR/初期マウント時のクラッシュ防止
    if (!mounted) {
        return <header className={styles.header} style={{ height: '70px', background: '#000' }} />;
    }

    const themeColor = site?.theme_color || '#333';
    const isAdult = site?.site_group === 'adult';
    const siteNameRaw = site?.site_name || ""; // 安全な文字列として抽出

    /**
     * 🛠️ サイト別「ガイド」メニュー動的生成
     */
    const dynamicGuideLinks = useMemo(() => {
        if (!site?.site_tag) return [];
        switch (site.site_tag) {
            case 'saving':
                return [
                    { label: '💳 クレジットカード', href: '/guide/card' },
                    { label: '📈 証券・FX口座', href: '/guide/broker' },
                    { label: '📱 格安SIM比較', href: '/guide/sim' },
                ];
            case 'bicstation':
                return [
                    { label: '🔥 BTOセール比較', href: '/guide/bto' },
                    { label: '📊 パーツ別コスパ表', href: '/guide/parts' },
                    { label: '🛒 周辺機器・底値', href: '/guide/peripherals' }
                ];
            case 'tiper':
            case 'avflash':
                return [
                    { label: '🎯 マッチング解析', href: '/guide/matching' },
                    { label: '📺 ライブチャット案内', href: '/guide/live-chat' },
                    { label: '💌 チャットレディ募集', href: '/guide/chat-lady' }
                ];
            default:
                return [];
        }
    }, [site?.site_tag]);

    /**
     * 🛡️ AdSense & 信頼性向上のための共通リンク
     */
    const supportLinks = [
        { label: isAdult ? '🍷 AIソムリエ相談' : '🤖 AIコンシェルジュ', href: '/concierge' },
        ...dynamicGuideLinks,
        { label: '---', href: '#' },
        { label: 'ℹ️ 運営者情報', href: '/about' },
        { label: '🛡️ プライバシーポリシー', href: '/privacy-policy' },
        { label: '⚖️ 特定商取引法に基づく表記', href: '/legal' },
        { label: '📧 お問い合わせ', href: '/contact' }
    ];

    const menuConfig = {
        col1: {
            title: isAdult ? '🔥 注目' : '🔍 コンテンツ',
            links: site?.site_tag === 'saving' ? [
                { label: '技術ブログ', href: '/post' }, 
                { label: 'ポートフォリオ', href: '/portfolio' }
            ] : site?.site_tag === 'bicstation' ? [
                { label: 'PC性能診断', href: '/pc-finder' }, 
                { label: 'おすすめPC', href: '/ranking/popularity' }
            ] : [
                { label: '新着記事', href: '/post' }, 
                { label: '人気ランキング', href: '/ranking' }
            ]
        },
        col2: {
            title: isAdult ? '🎞️ カテゴリ' : '📦 ツール',
            links: isAdult ? [
                { label: '女優名鑑', href: '/ranking/style' }, 
                { label: 'メーカー検索', href: '/maker' }
            ] : [
                { label: 'AI性能比較', href: '/ranking' }, 
                { label: 'データベース', href: '/catalog' }
            ]
        },
        col3: {
            title: '✨ ガイド & 法的表記',
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
                            {/* 🛡️ 安全ガード: charAt */}
                            {siteNameRaw ? siteNameRaw.charAt(0) : 'B'}
                        </span>
                        <div className={styles.brandInfo}>
                            <div className={styles.siteName} style={{ color: isAdult ? 'white' : '#111' }}>
                                {/* 🛡️ 安全ガード: toUpperCase */}
                                {siteNameRaw ? siteNameRaw.toUpperCase() : ''}
                            </div>
                            <span className={styles.tagline} style={{ color: themeColor }}>
                                {siteNameRaw === 'Tiper' && "PREMIUM ADULT SOMMELIER"}
                                {siteNameRaw === 'Bic Station' && "TOTAL PC SUPPORT"}
                                {siteNameRaw === 'AV Flash' && "NEWS & ARCHIVE"}
                                {siteNameRaw === 'ビック的節約生活' && "LIFE HACK & COST CUT"}
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
                                        link.label === '---' ? (
                                            <hr key={i} className={styles.divider} />
                                        ) : (
                                            <Link key={i} href={link.href} className={styles.dropdownItem}>
                                                {link.label}
                                            </Link>
                                        )
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
                                {siteNameRaw === 'Tiper' ? '貴賓：' : ''}{userName} <small>様</small>
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
                                link.label !== '---' && (
                                    <Link key={i} href={link.href} onClick={() => setIsOpen(false)} style={{ color: isAdult ? '#ccc' : '#444' }}>
                                        {link.label}
                                    </Link>
                                )
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </header>
    );
}
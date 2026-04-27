'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { getSiteMetadata } from '@/shared/lib/utils/siteConfig';
import styles from './Header.module.css';

export default function Header() {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState<string | null>(null);

    const [site, setSite] = useState<any>(null);

    useEffect(() => {
        const identifier = typeof window !== 'undefined' ? window.location.hostname : '';
        const meta = getSiteMetadata(identifier);
        
        setSite(meta || {
            site_name: 'BIC STATION',
            site_tag: 'bicstation',
            site_group: 'general',
            theme_color: '#333',
            site_prefix: '/general'
        });
        
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
            } catch {
                setIsLoggedIn(false);
            }
        } else {
            setIsLoggedIn(false);
        }
    }, []);

    useEffect(() => {
        if (mounted) checkAuthStatus();
    }, [mounted, checkAuthStatus]);

    useEffect(() => {
        const handler = () => checkAuthStatus();
        window.addEventListener('authChanged', handler);
        return () => window.removeEventListener('authChanged', handler);
    }, [checkAuthStatus]);

    const handleLogout = () => {
        const isAdult = site?.site_group === 'adult';
        if (confirm(isAdult ? 'ログアウトしてよろしいですか？' : 'ログアウトしますか？')) {
            localStorage.clear();
            window.location.href = '/';
        }
    };

    if (!mounted || !site) {
        return (
            <header className={styles.header} style={{ height: '70px', background: '#000' }}>
                <div className={styles.container}></div>
            </header>
        );
    }

    const themeColor = site.theme_color || '#333';
    const isAdult = site.site_group === 'adult';
    const siteNameRaw = (site.site_name || "").toString();

    const dynamicGuideLinks = site.site_tag === 'saving' ? [
        { label: '💳 クレジットカード', href: '/guide/card' },
        { label: '📈 証券・FX口座', href: '/guide/broker' },
        { label: '📱 格安SIM比較', href: '/guide/sim' },
    ] : site.site_tag === 'bicstation' ? [
        { label: '🔥 BTOセール比較', href: '/guide/bto' },
        { label: '📊 パーツ別コスパ表', href: '/guide/parts' },
        { label: '🛒 周辺機器・底値', href: '/guide/peripherals' }
    ] : [];

    const supportLinks = [
        { label: isAdult ? '🍷 AIソムリエ相談' : '🤖 AIコンシェルジュ', href: '/concierge' },
        ...dynamicGuideLinks,
        { label: '---', href: '#' },
        { label: 'ℹ️ 運営者情報', href: '/about' },
        { label: '📏 ガイドライン', href: '/guideline' },
        { label: '🛡️ プライバシーポリシー', href: '/privacy-policy' },
        { label: '⚖️ 免責事項', href: '/disclaimer' },
        { label: '📢 広告掲載について', href: '/ads-policy' },
        { label: '📧 お問い合わせ', href: '/contact' }
    ];

    const menuConfig = {
        col1: {
            title: '🔍 コンテンツ',
            links: [
                { label: 'PC性能診断', href: '/pc-finder' },
                { label: 'おすすめPC', href: '/ranking/popularity' }
            ]
        },
        col2: {
            title: '📦 ツール',
            links: [
                { label: 'AI性能比較', href: '/ranking' },
                { label: 'データベース', href: '/catalog' }
            ]
        },
        col3: {
            title: '✨ ガイド',
            links: supportLinks
        }
    };

    return (
        <header 
            className={`${styles.header} ${isAdult ? styles.adultBg : styles.generalBg}`}
            style={{ borderBottom: `3px solid ${themeColor}` }}
        >
            <div className={styles.container}>

                {/* ロゴ */}
                <Link href="/" style={{ textDecoration: 'none' }}>
                    <div className={styles.logoWrapper}>
                        <span style={{
                            background: themeColor,
                            color: '#fff',
                            padding: '4px 10px',
                            borderRadius: '6px'
                        }}>
                            {siteNameRaw.charAt(0)}
                        </span>
                        <div className={styles.brandInfo}>
                            <div className={styles.siteName}>
                                {siteNameRaw.toUpperCase()}
                            </div>
                        </div>
                    </div>
                </Link>

                {/* メニュー */}
                <nav className={styles.desktopNav}>
                    {Object.entries(menuConfig).map(([key, section]) => (
                        <div
                            key={key}
                            className={styles.navGroup}
                            onMouseEnter={() => setActiveDropdown(key)}
                            onMouseLeave={() => setActiveDropdown(null)}
                        >
                            <span className={styles.navTitle}>
                                {section.title} ▼
                            </span>

                            {activeDropdown === key && (
                                <div className={styles.dropdown}>
                                    {section.links.map((link, i) => (
                                        link.label === '---'
                                            ? <hr key={i} />
                                            : <Link key={i} href={link.href}>{link.label}</Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </nav>

                {/* 認証 */}
                <div className={styles.authSection}>
                    {!isLoggedIn ? (
                        <>
                            <Link href="/login">ログイン</Link>
                            <Link href="/register">登録</Link>
                        </>
                    ) : (
                        <>
                            <span>{userName}</span>
                            <button onClick={handleLogout}>ログアウト</button>
                        </>
                    )}
                </div>

            </div>
        </header>
    );
}
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
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState<string | null>(null);

    const [site, setSite] = useState<any>(null);

    useEffect(() => {
        const identifier =
            typeof window !== 'undefined'
                ? window.location.hostname
                : '';

        const meta = getSiteMetadata(identifier);

        setSite(
            meta || {
                site_name: 'BIC STATION',
                site_tag: 'bicstation',
                site_group: 'general',
                theme_color: '#333',
                site_prefix: '/general',
            }
        );

        setMounted(true);
    }, []);

    const checkAuthStatus = useCallback(() => {
        if (typeof window === 'undefined') return;

        const userDataStr = localStorage.getItem('user');

        if (userDataStr) {
            try {
                const userObj = JSON.parse(userDataStr);

                setIsLoggedIn(true);
                setUserName(
                    userObj.username ||
                    userObj.name ||
                    'ユーザー'
                );
            } catch {
                setIsLoggedIn(false);
                setUserName(null);
            }
        } else {
            setIsLoggedIn(false);
            setUserName(null);
        }
    }, []);

    useEffect(() => {
        if (mounted) {
            checkAuthStatus();
        }
    }, [mounted, checkAuthStatus]);

    useEffect(() => {
        const handler = () => checkAuthStatus();

        window.addEventListener('authChanged', handler);

        return () => {
            window.removeEventListener('authChanged', handler);
        };
    }, [checkAuthStatus]);

    /*
     * --------------------------------------------------------------------------
     * Route Change
     * --------------------------------------------------------------------------
     *
     * Mobile menu is always closed after navigation.
     *
     */

    useEffect(() => {
        setMobileMenuOpen(false);
        setActiveDropdown(null);
    }, [pathname]);

    /*
     * --------------------------------------------------------------------------
     * Body Scroll Lock
     * --------------------------------------------------------------------------
     *
     * Prevent background scrolling while mobile navigation is open.
     *
     */

    useEffect(() => {
        if (!mobileMenuOpen) {
            document.body.style.overflow = '';
            return;
        }

        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileMenuOpen]);

    const handleLogout = () => {
        const isAdult = site?.site_group === 'adult';

        if (
            confirm(
                isAdult
                    ? 'ログアウトしてよろしいですか？'
                    : 'ログアウトしますか？'
            )
        ) {
            localStorage.clear();
            window.location.href = '/';
        }
    };

    const toggleMobileMenu = () => {
        setMobileMenuOpen((current) => !current);
    };

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };

    if (!mounted || !site) {
        return (
            <header
                className={styles.header}
                style={{
                    height: '70px',
                    background: '#000',
                }}
            >
                <div className={styles.container}></div>
            </header>
        );
    }

    const themeColor = site.theme_color || '#333';
    const isAdult = site.site_group === 'adult';
    const siteNameRaw = (site.site_name || '').toString();

    console.log('🔥 [HEADER SITE]', {
        site_tag: site?.site_tag,
        site_group: site?.site_group,
        site_name: site?.site_name,
    });

    /*
     * --------------------------------------------------------------------------
     * Site-specific Guide Links
     * --------------------------------------------------------------------------
     */

    const dynamicGuideLinks =
        site.site_tag === 'tiper'
            ? [
                  {
                      label: '🥇❤️ 出会いを探す',
                      href: '/guide/matching',
                  },
                  {
                      label: '🥈💬 会話を楽しむ',
                      href: '/guide/chat-lady',
                  },
                  {
                      label: '🥉💼 副業を始める',
                      href: '/guide/live-chat',
                  },
                  {
                      label: '🎬 新着動画',
                      href: 'https://avflash.xyz/videos/latest',
                  },
                  {
                      label: '🔥 人気ランキング',
                      href: 'https://avflash.xyz/ranking',
                  },
                  {
                      label: '🔎 ジャンル検索',
                      href: 'https://avflash.xyz/genres',
                  },
              ]
            : site.site_tag === 'avflash'
            ? [
                  {
                      label: '🥇❤️ 出会いを探す',
                      href: 'https://tiper.live/guide/matching',
                  },
                  {
                      label: '🥈💬 会話を楽しむ',
                      href: 'https://tiper.live/guide/chat-lady',
                  },
                  {
                      label: '🥉💼 副業を始める',
                      href: 'https://tiper.live/guide/live-chat',
                  },
                  {
                      label: '🎬 新着動画',
                      href: '/videos/latest',
                  },
                  {
                      label: '🔥 人気ランキング',
                      href: '/ranking',
                  },
                  {
                      label: '🔎 ジャンル検索',
                      href: '/genres',
                  },
              ]
            : site.site_tag === 'saving'
            ? [
                  {
                      label: '💳 クレジットカード',
                      href: '/guide/card',
                  },
                  {
                      label: '📈 証券・FX口座',
                      href: '/guide/broker',
                  },
                  {
                      label: '📱 格安SIM比較',
                      href: '/guide/sim',
                  },
              ]
            : site.site_tag === 'bicstation'
            ? [
                  {
                      label: '🧭 自分に合うPCを探す',
                      href: '/pc-finder',
                  },
                  {
                      label: '🎮 ゲーム向けPC',
                      href: '/ranking/usage-gaming',
                  },
                  {
                      label: '🤖 AI向けPC',
                      href: '/ranking/usage-ai',
                  },
                  {
                      label: '🔍 目的から探す',
                      href: '/discover/',
                  },
                  {
                      label: '📚 全PC一覧',
                      href: '/catalog',
                  },
                  {
                      label: '🔥 セール情報',
                      href: '/guide/bto',
                  },
                  {
                      label: '📊 コスパ比較',
                      href: '/guide/parts',
                  },
                  {
                      label: '🛒 PC棚',
                      href: '/shelves',
                  },
              ]
            : [];

    /*
     * --------------------------------------------------------------------------
     * Support Links
     * --------------------------------------------------------------------------
     */

    const supportLinks = [
        {
            label: isAdult
                ? '🍷 AIソムリエ相談'
                : '🤖 AIコンシェルジュ',
            href: '/concierge',
        },
        {
            label: '---',
            href: '#',
        },
        {
            label: 'ℹ️ 運営者情報',
            href: '/guide/about',
        },
        {
            label: '📏 ガイドライン',
            href: '/guide/guideline',
        },
        {
            label: '🛡️ プライバシーポリシー',
            href: '/guide/privacy-policy',
        },
        {
            label: '⚖️ 免責事項',
            href: '/guide/disclaimer',
        },
        {
            label: '📢 広告掲載について',
            href: '/guide/ads-policy',
        },
        {
            label: '📧 お問い合わせ',
            href: '/contact',
        },
    ];

    /*
     * --------------------------------------------------------------------------
     * Desktop Menu Configuration
     * --------------------------------------------------------------------------
     */

    let menuConfig;

    switch (site.site_tag) {
        case 'tiper':
            menuConfig = {
                col1: {
                    title: '🎯 人つながり',
                    links: dynamicGuideLinks.slice(0, 3),
                },
                col2: {
                    title: '🚀 動画発見',
                    links: dynamicGuideLinks.slice(3, 6),
                },
                col3: {
                    title: '🛟 サポート',
                    links: supportLinks,
                },
            };
            break;

        case 'avflash':
            menuConfig = {
                col1: {
                    title: '🎬 人つながり',
                    links: dynamicGuideLinks.slice(0, 3),
                },
                col2: {
                    title: '📂 ジャンル発見',
                    links: dynamicGuideLinks.slice(3, 6),
                },
                col3: {
                    title: '🛟 サポート',
                    links: supportLinks,
                },
            };
            break;

        case 'saving':
            menuConfig = {
                col1: {
                    title: '💰 節約',
                    links: dynamicGuideLinks,
                },
                col2: {
                    title: '📈 比較',
                    links: [],
                },
                col3: {
                    title: '🛟 サポート',
                    links: supportLinks,
                },
            };
            break;

        case 'bicstation':
            menuConfig = {
                col1: {
                    title: '🔍 コンテンツ',
                    links: dynamicGuideLinks.slice(0, 4),
                },
                col2: {
                    title: '📦 ツール',
                    links: dynamicGuideLinks.slice(4, 8),
                },
                col3: {
                    title: '✨ ガイド',
                    links: supportLinks,
                },
            };
            break;

        default:
            menuConfig = {
                col1: {
                    title: '🏠 ホーム',
                    links: [
                        {
                            label: 'トップページ',
                            href: '/',
                        },
                    ],
                },
                col2: {
                    title: '📚 コンテンツ',
                    links: [],
                },
                col3: {
                    title: 'ℹ️ サポート',
                    links: supportLinks,
                },
            };
    }

    /*
     * --------------------------------------------------------------------------
     * Mobile Primary Discovery
     * --------------------------------------------------------------------------
     *
     * BIC STATION:
     *
     * Header is not only navigation.
     * It is the primary Discovery Gateway.
     *
     */

    const primaryDiscovery =
        site.site_tag === 'bicstation'
            ? dynamicGuideLinks[0]
            : null;

    /*
     * --------------------------------------------------------------------------
     * Mobile Navigation
     * --------------------------------------------------------------------------
     */

    const renderMobileLink = (
        link: {
            label: string;
            href: string;
        },
        index: number
    ) => {
        if (link.label === '---') {
            return (
                <div
                    key={`mobile-divider-${index}`}
                    className={styles.mobileDivider}
                />
            );
        }

        const isExternal =
            link.href.startsWith('http://') ||
            link.href.startsWith('https://');

        if (isExternal) {
            return (
                <a
                    key={`mobile-link-${index}`}
                    href={link.href}
                    className={styles.mobileMenuLink}
                    onClick={closeMobileMenu}
                >
                    {link.label}
                </a>
            );
        }

        return (
            <Link
                key={`mobile-link-${index}`}
                href={link.href}
                className={styles.mobileMenuLink}
                onClick={closeMobileMenu}
            >
                {link.label}
            </Link>
        );
    };

    return (
        <header
            className={`${styles.header} ${
                isAdult
                    ? styles.adultBg
                    : styles.generalBg
            }`}
            style={{
                borderBottom: `3px solid ${themeColor}`,
            }}
        >
            <div className={styles.container}>

                {/* ============================================================
                    Desktop Logo
                   ============================================================ */}

                <Link
                    href="/"
                    style={{
                        textDecoration: 'none',
                    }}
                >
                    <div className={styles.logoWrapper}>
                        <span
                            style={{
                                background: themeColor,
                                color: '#fff',
                                padding: '4px 10px',
                                borderRadius: '6px',
                            }}
                        >
                            {siteNameRaw.charAt(0)}
                        </span>

                        <div className={styles.brandInfo}>
                            <div className={styles.siteName}>
                                {siteNameRaw.toUpperCase()}
                            </div>
                        </div>
                    </div>
                </Link>

                {/* ============================================================
                    Desktop Navigation
                   ============================================================ */}

                <nav className={styles.desktopNav}>
                    {Object.entries(menuConfig).map(
                        ([key, section]) => (
                            <div
                                key={key}
                                className={styles.navGroup}
                                onMouseEnter={() =>
                                    setActiveDropdown(key)
                                }
                                onMouseLeave={() =>
                                    setActiveDropdown(null)
                                }
                            >
                                <span
                                    className={styles.navTitle}
                                >
                                    {section.title} ▼
                                </span>

                                {activeDropdown === key && (
                                    <div
                                        className={
                                            styles.dropdown
                                        }
                                    >
                                        {section.links.map(
                                            (link, i) =>
                                                link.label ===
                                                '---' ? (
                                                    <hr
                                                        key={i}
                                                    />
                                                ) : (
                                                    <Link
                                                        key={i}
                                                        href={
                                                            link.href
                                                        }
                                                    >
                                                        {
                                                            link.label
                                                        }
                                                    </Link>
                                                )
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    )}
                </nav>

                {/* ============================================================
                    Desktop Authentication
                   ============================================================ */}

                <div className={styles.authSection}>
                    {!isLoggedIn ? (
                        <>
                            <Link href="/login">
                                ログイン
                            </Link>

                            <Link href="/register">
                                登録
                            </Link>
                        </>
                    ) : (
                        <>
                            <span>
                                {userName}
                            </span>

                            <button
                                onClick={handleLogout}
                            >
                                ログアウト
                            </button>
                        </>
                    )}
                </div>

                {/* ============================================================
                    Mobile Header
                   ============================================================ */}

                <div
                    className={styles.mobileHeader}
                    style={{
                        borderColor: themeColor,
                    }}
                >
                    {/* Mobile Menu Button */}

                    <button
                        type="button"
                        className={styles.mobileMenuButton}
                        onClick={toggleMobileMenu}
                        aria-label={
                            mobileMenuOpen
                                ? 'メニューを閉じる'
                                : 'メニューを開く'
                        }
                        aria-expanded={mobileMenuOpen}
                    >
                        <span
                            className={
                                styles.mobileMenuIcon
                            }
                        >
                            {mobileMenuOpen
                                ? '✕'
                                : '☰'}
                        </span>
                    </button>

                    {/* Mobile Brand */}

                    <Link
                        href="/"
                        className={
                            styles.mobileBrand
                        }
                        onClick={closeMobileMenu}
                    >
                        <span
                            className={
                                styles.mobileBrandMark
                            }
                            style={{
                                background: themeColor,
                            }}
                        >
                            {siteNameRaw.charAt(0)}
                        </span>

                        <span
                            className={
                                styles.mobileBrandName
                            }
                        >
                            {siteNameRaw.toUpperCase()}
                        </span>
                    </Link>

                    {/* Mobile Search / Discovery */}

                    <Link
                        href={
                            site.site_tag ===
                            'bicstation'
                                ? '/pc-finder'
                                : '/search'
                        }
                        className={
                            styles.mobileSearchButton
                        }
                        aria-label="検索"
                        onClick={closeMobileMenu}
                    >
                        🔍
                    </Link>
                </div>
            </div>

            {/* ================================================================
                Mobile Navigation Overlay
               ================================================================ */}

            {mobileMenuOpen && (
                <div
                    className={
                        styles.mobileMenuOverlay
                    }
                >
                    <div
                        className={
                            styles.mobileMenuPanel
                        }
                    >
                        {/* Mobile Menu Header */}

                        <div
                            className={
                                styles.mobileMenuPanelHeader
                            }
                        >
                            <span>
                                {siteNameRaw.toUpperCase()}
                            </span>

                            <button
                                type="button"
                                className={
                                    styles.mobileMenuClose
                                }
                                onClick={
                                    closeMobileMenu
                                }
                                aria-label="メニューを閉じる"
                            >
                                ✕
                            </button>
                        </div>

                        {/* ====================================================
                            Primary Discovery
                           ==================================================== */}

                        {primaryDiscovery && (
                            <div
                                className={
                                    styles.mobilePrimaryDiscovery
                                }
                            >
                                <Link
                                    href={
                                        primaryDiscovery.href
                                    }
                                    onClick={
                                        closeMobileMenu
                                    }
                                >
                                    <span>
                                        {
                                            primaryDiscovery.label
                                        }
                                    </span>

                                    <span
                                        className={
                                            styles.mobilePrimaryArrow
                                        }
                                    >
                                        →
                                    </span>
                                </Link>
                            </div>
                        )}

                        {/* ====================================================
                            Menu Sections
                           ==================================================== */}

                        <nav
                            className={
                                styles.mobileMenuSections
                            }
                        >
                            {Object.entries(
                                menuConfig
                            ).map(
                                (
                                    [key, section]
                                ) => (
                                    <section
                                        key={key}
                                        className={
                                            styles.mobileMenuSection
                                        }
                                    >
                                        <h2
                                            className={
                                                styles.mobileMenuSectionTitle
                                            }
                                        >
                                            {
                                                section.title
                                            }
                                        </h2>

                                        <div
                                            className={
                                                styles.mobileMenuSectionLinks
                                            }
                                        >
                                            {section.links.map(
                                                (
                                                    link,
                                                    index
                                                ) =>
                                                    renderMobileLink(
                                                        link,
                                                        index
                                                    )
                                            )}
                                        </div>
                                    </section>
                                )
                            )}
                        </nav>

                        {/* ====================================================
                            Authentication
                           ==================================================== */}

                        <section
                            className={
                                styles.mobileAccountSection
                            }
                        >
                            <h2
                                className={
                                    styles.mobileMenuSectionTitle
                                }
                            >
                                👤 アカウント
                            </h2>

                            {!isLoggedIn ? (
                                <div
                                    className={
                                        styles.mobileAccountLinks
                                    }
                                >
                                    <Link
                                        href="/login"
                                        className={
                                            styles.mobileMenuLink
                                        }
                                        onClick={
                                            closeMobileMenu
                                        }
                                    >
                                        ログイン
                                    </Link>

                                    <Link
                                        href="/register"
                                        className={
                                            styles.mobileMenuLink
                                        }
                                        onClick={
                                            closeMobileMenu
                                        }
                                    >
                                        登録
                                    </Link>
                                </div>
                            ) : (
                                <div
                                    className={
                                        styles.mobileAccountLinks
                                    }
                                >
                                    <div
                                        className={
                                            styles.mobileUserName
                                        }
                                    >
                                        {userName}
                                    </div>

                                    <button
                                        type="button"
                                        className={
                                            styles.mobileLogoutButton
                                        }
                                        onClick={
                                            handleLogout
                                        }
                                    >
                                        ログアウト
                                    </button>
                                </div>
                            )}
                        </section>

                        {/* ====================================================
                            Close
                           ==================================================== */}

                        <button
                            type="button"
                            className={
                                styles.mobileMenuBottomClose
                            }
                            onClick={
                                closeMobileMenu
                            }
                        >
                            メニューを閉じる
                        </button>
                    </div>
                </div>
            )}
        </header>
    );
}
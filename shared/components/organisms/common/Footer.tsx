'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

/**
 * ✅ 物理パスに基づいた正しいインポート
 */
import { getSiteMetadata, getSiteColor } from '@/shared/lib/utils/siteConfig';
import styles from './Footer.module.css';
import SystemDiagnosticHero from '@/shared/components/molecules/SystemDiagnosticHero';

interface FooterProps {
    debugData?: {
        id?: string;
        source?: string;
        targetUrl?: string;
        data?: any;
        sidebarData?: any;
        fetchError?: string | null;
        errorMsg?: string | null;
        relatedError?: any;
        params?: any;
        apiInternalUrl?: string;
    };
}

/**
 * 🌐 内部コンポーネント: searchParams を安全に使用するため分離
 */
function FooterContent({ debugData }: FooterProps) {
    const [mounted, setMounted] = useState(false);
    const searchParams = useSearchParams();
    const currentYear = new Date().getFullYear();

    // ✅ ハイドレーション・ミスマッチ防止
    useEffect(() => {
        setMounted(true);
    }, []);

    // 🛰️ サイト設定の動的取得 (SSR & Client 両対応)
    const site = useMemo(() => {
        // 1. サーバーサイドなら環境変数、クライアントサイドなら hostname を優先
        const identifier = typeof window !== 'undefined' 
            ? window.location.hostname 
            : process.env.NEXT_PUBLIC_SITE_DOMAIN;

        // 2. 識別子を元にメタデータを解決 (SSR時の undefined ログを根絶)
        return getSiteMetadata(identifier || "");
    }, []);

    // 🚩 サイト情報が確定できない致命的な場合のみガード (SSR時は環境変数から確定済み)
    if (!site) {
        return <footer className={styles.footer} style={{ height: '300px', visibility: 'hidden' }} />;
    }

    const siteColor = getSiteColor(site.site_name);
    const isDebugMode = searchParams.get('debug') === 'true';
    const isAdult = site.site_group === 'adult';
    
    // hostname の判定も SSR 安全に
    const isLocal = typeof window !== 'undefined' 
        ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        : process.env.NODE_ENV === 'development';

    /**
     * 🛰️ SHIN-VPS ネットワーク設定
     */
    const networkSites = [
        { name: 'Bic Station', domain: 'bicstation.com', port: 3000, color: '#0055ff', external: false },
        { name: 'Bic Saving', domain: 'bic-saving.com', port: 3001, color: '#ff9900', external: false },
        { name: 'AV Flash', domain: 'avflash.xyz', port: 3002, color: '#e60012', external: false },
        { name: 'Tiper', domain: 'tiper.live', port: 3003, color: '#d4af37', external: false },
        { name: 'ビックAV動画', domain: 'bic-erog.com', port: 3004, color: '#bc00ff', external: true },
        { name: 'シークレットXYZ', domain: 'adult-search.xyz', port: 3005, color: '#6a0dad', external: true },
    ];

    const getNetworkUrl = (s: typeof networkSites[0]) => {
        return isLocal ? `http://localhost:${s.port}` : `https://${s.domain}`;
    };

    /**
     * 🛠️ サイト別ブランド・テキスト定義
     */
    const siteConfigs: Record<string, any> = {
        'Tiper': {
            desc: "大人のためのプレミアム・エンターテインメント・ガイド。AIソムリエがあなたの感性に響く最高の1本をエスコートします。",
            brands: [{ name: 'FANZA', slug: 'fanza' }, { name: 'DUGA', slug: 'duga' }, { name: 'MGS', slug: 'mgs' }],
            suffix: 'Tactical Archive Interface'
        },
        'AV Flash': {
            desc: "圧倒的なアーカイブ量を誇る動画情報ポータル。メーカー・女優・ジャンル別の詳細解析で、見たい動画がすぐに見つかります。",
            brands: [{ name: 'S1', slug: 's1' }, { name: 'MOODYZ', slug: 'moodyz' }, { name: 'SOD', slug: 'sod' }],
            suffix: 'Ultimate Movie Registry'
        },
        'Bic Saving': {
            desc: "「賢く買う」をAIが徹底サポート。主要ECサイトの価格推移とポイント還元率をリアルタイムに解析し、最安値をお届けします。",
            brands: [{ name: 'Amazon', slug: 'amazon' }, { name: '楽天', slug: 'rakuten' }, { name: 'Yahoo!', slug: 'yahoo' }],
            suffix: 'Smart Saving Index'
        },
        'Bic Station': {
            desc: "ハードウェア性能の真実を数値化。最新PCスペック診断とBTOメーカー比較で、あなたの用途に最適な1台を提案します。",
            brands: [{ name: 'Lenovo', slug: 'lenovo' }, { name: 'DELL', slug: 'dell' }, { name: 'Apple', slug: 'apple' }],
            suffix: 'Performance Registry'
        },
        'Bic的AV動画': {
            desc: "FANZA作品に特化した超速報レビューサイト。独自のAI解析スコアで、今最も熱いトレンド作品をダイレクトに抽出します。",
            brands: [{ name: 'FANZA', slug: 'fanza' }, { name: 'PRESTIGE', slug: 'prestige' }],
            suffix: 'Direct Stream Index'
        },
        'シークレットXYZ': {
            desc: "秘匿性の高い検索体験を提供するアダルトサーチエンジン。あらゆるプラットフォームを横断し、あなたの理想を瞬時に形にします。",
            brands: [{ name: 'Deep Search', slug: 'search' }, { name: 'Premium', slug: 'premium' }],
            suffix: 'Private Search Node'
        }
    };

    const config = siteConfigs[site.site_name] || siteConfigs['Bic Station'];

    return (
        <footer
            className={styles.footer}
            style={{ '--accent-red': siteColor } as React.CSSProperties}
        >
            <div className={styles.container}>
                <div className={styles.column}>
                    <h3 className={styles.siteTitle}>{site.site_name.toUpperCase()}</h3>
                    <p className={styles.description}>{config.desc}</p>
                    <div className={styles.brandGrid}>
                        <h4 className={styles.miniTitle}>{isAdult ? 'MAIN PLATFORMS' : 'MAJOR BRANDS'}</h4>
                        <div className={styles.brandLinks}>
                            {config.brands.map((item: any, index: number) => (
                                <React.Fragment key={item.slug}>
                                    <Link href={`${site.site_prefix}/brand/${item.slug}`} className={styles.brandLink}>
                                        {item.name}
                                    </Link>
                                    {index < config.brands.length - 1 && <span className={styles.brandSeparator}>|</span>}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </div>

                <div className={styles.column}>
                    <h3 className={styles.sectionTitle}>SHIN-VPS NETWORK</h3>
                    <ul className={styles.networkList}>
                        {networkSites.map((s) => (
                            <li key={s.name} className={styles.linkItem}>
                                <a
                                    href={getNetworkUrl(s)}
                                    className={styles.networkLink}
                                    style={{ borderLeft: `3px solid ${s.color}`, paddingLeft: '8px' }}
                                    target={s.external ? "_blank" : "_self"}
                                    rel={s.external ? "noopener noreferrer" : ""}
                                >
                                    {s.name} {s.external && <small>(EXT)</small>} <small>{isLocal ? `(:${s.port})` : ''}</small>
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className={styles.column}>
                    <h3 className={styles.sectionTitle}>INFORMATION</h3>
                    <ul className={styles.linkList}>
                        <li className={styles.linkItem}>
                            <Link href={`${site.site_prefix}/concierge`}>
                                {isAdult ? '🍷 AIソムリエ相談' : '🤖 AIコンシェルジュ'}
                            </Link>
                        </li>
                        <li className={styles.linkItem}>
                            <Link href={`${site.site_prefix}/contact`}>📧 お問い合わせ</Link>
                        </li>
                        <li className={styles.linkItem}>
                            <Link href={`${site.site_prefix}/about`}>ℹ️ 当サイトについて</Link>
                        </li>
                        <li className={styles.linkItem}>
                            <Link href={`${site.site_prefix}/privacy-policy`}>🛡️ 規約とポリシー</Link>
                        </li>
                        <li className={styles.linkItem}>
                            <Link href={`${site.site_prefix}/disclaimer`}>⚠️ 免責事項</Link>
                        </li>
                        <li className={styles.linkItem}>
                            <Link href={`${site.site_prefix}/guideline`}>📝 ご利用ガイドライン</Link>
                        </li>
                    </ul>
                </div>
            </div>

            <div className={styles.bottomBar}>
                <p className={styles.copyright}>
                    &copy; {currentYear} {site.site_name.toUpperCase()} - {config.suffix}
                </p>
            </div>

            {isDebugMode && debugData && (
                <div className={styles.debugContainer}>
                    <SystemDiagnosticHero
                        id={debugData.id}
                        source={debugData.source}
                        data={debugData.data}
                        rawJson={debugData.data}
                        sidebarData={debugData.sidebarData}
                        fetchError={debugData.fetchError || debugData.errorMsg}
                        relatedError={debugData.relatedError}
                        params={debugData.params}
                        componentPath={debugData.apiInternalUrl}
                    />
                </div>
            )}
        </footer>
    );
}

/**
 * 🏛️ Root Footer Component
 * Next.js 15: useSearchParams を内部で持つため Suspense でラップしてエクスポート
 */
export default function Footer(props: FooterProps) {
    return (
        <Suspense fallback={<footer className={styles.footer} style={{ height: '300px' }} />}>
            <FooterContent {...props} />
        </Suspense>
    );
}
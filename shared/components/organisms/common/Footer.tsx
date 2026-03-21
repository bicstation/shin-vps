'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

/**
 * ✅ 物理パスに基づいた正しいインポート
 * エイリアスを @/shared に統一し、マルチブランド対応を確実なものにします。
 */
import { getSiteMetadata, getSiteColor } from '@/shared/lib/utils/siteConfig';
import styles from './Footer.module.css';
import SystemDiagnosticHero from '@/shared/components/molecules/SystemDiagnosticHero';

/**
 * =====================================================================
 * 🧱 [ORGANISM] Footer (shared/components/organisms/common/Footer.tsx)
 * 🛡️ Maya's Logic: ハイドレーション・ガード & デバッグターミナル統合版
 * ---------------------------------------------------------------------
 * 修正点:
 * 1. AIコンシェルジュ(/concierge) と お問い合わせ(/contact) を分離・併記
 * 2. Next.js 15 用の Suspense 境界を Root レベルで適用
 * 3. ネットワークサイトの URL 生成ロジックを最新化
 * =====================================================================
 */
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

    // 🛰️ サイト設定の動的取得
    const site = useMemo(() => {
        if (!mounted || typeof window === 'undefined') return null;
        const host = window.location.hostname;
        return getSiteMetadata(host);
    }, [mounted]);

    // 🚩 ガード: クライアントサイドの準備ができるまで不可視状態で枠だけ確保
    if (!mounted || !site) {
        return <footer className={styles.footer} style={{ height: '300px', visibility: 'hidden' }} />;
    }

    const siteColor = getSiteColor(site.site_name);
    const isDebugMode = searchParams.get('debug') === 'true';
    const isAdult = site.site_group === 'adult';
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    /**
     * 🛰️ SHIN-VPS ネットワーク設定
     */
    const networkSites = [
        { name: 'Bic Station', domain: 'bicstation.com', port: 3000, color: '#0055ff' },
        { name: 'Bic Saving', domain: 'bic-saving.com', port: 3001, color: '#ff9900' },
        { name: 'AV Flash', domain: 'av-flash.xyz', port: 3002, color: '#e60012' },
        { name: 'Tiper', domain: 'tiper.live', port: 3003, color: '#d4af37' },
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
        }
    };

    const config = siteConfigs[site.site_name] || siteConfigs['Bic Station'];

    return (
        <footer
            className={styles.footer}
            style={{ '--accent-red': siteColor } as React.CSSProperties}
        >
            <div className={styles.container}>
                {/* --- 1. サイト概要 --- */}
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

                {/* --- 2. ネットワークリンク --- */}
                <div className={styles.column}>
                    <h3 className={styles.sectionTitle}>SHIN-VPS NETWORK</h3>
                    <ul className={styles.networkList}>
                        {networkSites.map((s) => (
                            <li key={s.name} className={styles.linkItem}>
                                <a
                                    href={getNetworkUrl(s)}
                                    className={styles.networkLink}
                                    style={{ borderLeft: `3px solid ${s.color}`, paddingLeft: '8px' }}
                                >
                                    {s.name} <small>{isLocal ? `(:${s.port})` : ''}</small>
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* --- 3. リーガル & インフォメーション (AIリンクを統合) --- */}
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

            {/* --- 🚀 診断ターミナル (デバッグモード用) --- */}
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
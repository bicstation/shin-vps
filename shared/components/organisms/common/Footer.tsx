'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

/**
 * ✅ 物理パスに基づいた正しいインポート
 * tree構造に従い、@shared の後に lib/utils や components/molecules を明示しています。
 */
import { getSiteMetadata, getSiteColor } from '@shared/lib/utils/siteConfig';
import styles from './Footer.module.css';
import SystemDiagnosticHero from '@shared/components/molecules/SystemDiagnosticHero';

/**
 * =====================================================================
 * 🧱 [ORGANISM] Footer (shared/components/organisms/common/Footer.tsx)
 * 全サイト共通のフッター。
 * サイト切替ネットワーク、デバッグターミナル、法的情報を統合。
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

export default function Footer({ debugData }: FooterProps) {
    const currentYear = new Date().getFullYear();
    const site = getSiteMetadata();
    const siteColor = getSiteColor(site.site_name);
    const searchParams = useSearchParams();
    
    const isDebugMode = searchParams.get('debug') === 'true';
    const isAdult = site.site_group === 'adult';

    // 🌐 ローカル・VPS 判定ロジック
    const isLocal = typeof window !== 'undefined' && 
                   (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    /**
     * 🛰️ SHIN-VPS ネットワーク設定
     */
    const networkSites = [
        { name: 'Bic Station', domain: 'bic-station.com', port: 3000, color: '#0055ff' },
        { name: 'Bic Saving', domain: 'bic-saving.com', port: 3001, color: '#ff9900' },
        { name: 'AV Flash', domain: 'av-flash.com', port: 3002, color: '#e60012' },
        { name: 'Tiper', domain: 'tiper.jp', port: 3003, color: '#d4af37' },
    ];

    const getNetworkUrl = (s: typeof networkSites[0]) => {
        return isLocal ? `http://localhost:${s.port}` : `https://${s.domain}`;
    };

    /**
     * 🛠️ リンク定義
     */
    const siteConfigs: Record<string, any> = {
        'Tiper': {
            desc: "大人のためのプレミアム・エンターテインメント・ガイド。AIソムリエがあなたの感性に響く最高の1本をエスコートします。",
            brands: [{ name: 'FANZA', slug: 'fanza' }, { name: 'DUGA', slug: 'duga' }, { name: 'MGS', slug: 'mgs' }],
            content: [{ name: '🏠 トップ', path: '/' }, { name: '🔥 艶華ランキング', path: '/ranking' }, { name: '📅 発売カレンダー', path: '/calendar' }],
            suffix: 'Tactical Archive Interface'
        },
        'AV Flash': {
            desc: "圧倒的なアーカイブ量を誇る動画情報ポータル。メーカー・女優・ジャンル別の詳細解析で、見たい動画がすぐに見つかります。",
            brands: [{ name: 'S1', slug: 's1' }, { name: 'MOODYZ', slug: 'moodyz' }, { name: 'SOD', slug: 'sod' }],
            content: [{ name: '🏠 トップ', path: '/' }, { name: '🎬 新着動画', path: '/new-arrival' }, { name: '🏢 メーカー一覧', path: '/maker' }],
            suffix: 'Ultimate Movie Registry'
        },
        'Bic Saving': {
            desc: "「賢く買う」をAIが徹底サポート。主要ECサイトの価格推移とポイント還元率をリアルタイムに解析し、最安値をお届けします。",
            brands: [{ name: 'Amazon', slug: 'amazon' }, { name: '楽天', slug: 'rakuten' }, { name: 'Yahoo!', slug: 'yahoo' }],
            content: [{ name: '🏠 トップ', path: '/' }, { name: '🉐 特売情報', path: '/campaign' }, { name: '🎫 クーポン', path: '/coupon' }],
            suffix: 'Smart Saving Index'
        },
        'Bic Station': {
            desc: "ハードウェア性能の真実を数値化。最新PCスペック診断とBTOメーカー比較で、あなたの用途に最適な1台を提案します。",
            brands: [{ name: 'Lenovo', slug: 'lenovo' }, { name: 'DELL', slug: 'dell' }, { name: 'Apple', slug: 'apple' }],
            content: [{ name: '🏠 カタログ', path: '/' }, { name: '🔍 PC診断', path: '/pc-finder' }, { name: '🛠 パーツ比較', path: '/ranking' }],
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

                {/* --- 2. ネットワーク (サイト切替) --- */}
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

                {/* --- 3. リーガル/情報 --- */}
                <div className={styles.column}>
                    <h3 className={styles.sectionTitle}>INFORMATION</h3>
                    <ul className={styles.linkList}>
                        <li className={styles.linkItem}><Link href={`${site.site_prefix}/privacy-policy`}>🛡 プライバシーポリシー</Link></li>
                        <li className={styles.linkItem}><Link href={`${site.site_prefix}/disclaimer`}>⚠️ 免責事項</Link></li>
                        <li className={styles.linkItem}><Link href={`${site.site_prefix}/contact`}>📧 お問い合わせ</Link></li>
                    </ul>
                </div>
            </div>

            <div className={styles.bottomBar}>
                <p className={styles.copyright}>
                    &copy; {currentYear} {site.site_name.toUpperCase()} - {config.suffix}
                </p>
            </div>

            {/* --- 🚀 診断ターミナル --- */}
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
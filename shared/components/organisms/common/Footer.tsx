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
 * 🌐 内部コンポーネント
 */
function FooterContent({ debugData }: FooterProps) {
    const [mounted, setMounted] = useState(false);
    const searchParams = useSearchParams();
    const currentYear = new Date().getFullYear();

    useEffect(() => {
        setMounted(true);
    }, []);

    const site = useMemo(() => {
        const identifier = typeof window !== 'undefined' 
            ? window.location.hostname 
            : process.env.NEXT_PUBLIC_SITE_DOMAIN;
        return getSiteMetadata(identifier || "");
    }, []);

    if (!site) {
        return <footer className={styles.footer} style={{ height: '300px', visibility: 'hidden' }} />;
    }

    const siteColor = getSiteColor(site.site_name);
    const isDebugMode = searchParams.get('debug') === 'true';
    
    const isLocal = typeof window !== 'undefined' 
        ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        : process.env.NODE_ENV === 'development';

    /**
     * 🛰️ SHIN-VPS NETWORK (全4サイト網羅)
     */
    const networkSites = [
        { name: 'Bic Station', domain: 'bicstation.com', port: 3000, color: '#0055ff' },
        { name: 'Bic Saving', domain: 'bic-saving.com', port: 3001, color: '#ff9900' },
        { name: 'AV Flash', domain: 'avflash.xyz', port: 3002, color: '#e60012' },
        { name: 'Tiper', domain: 'tiper.live', port: 3003, color: '#d4af37' },
    ];

    const getNetworkUrl = (s: typeof networkSites[0]) => {
        return isLocal ? `http://localhost:${s.port}` : `https://${s.domain}`;
    };

    /**
     * 🛠️ サイト別設定（編集者情報含む）
     * 各サイトの特性に合わせて E-E-A-T を強化
     */
    const siteConfigs: Record<string, any> = {
        'Bic Station': {
            desc: "ハードウェア性能の真実を数値化。最新PCスペック診断とBTOメーカー比較で、最適な1台を提案します。",
            suffix: 'Performance Registry',
            editor: 'Maya / BICSTATION 編集長',
            editorDesc: 'サーバーエンジニア。自作PCと自動化スクリプトをこよなく愛するテックマニア。'
        },
        'Bic Saving': {
            desc: "「賢く買う」をAIがサポート。主要ECサイトの価格推移とポイント還元率をリアルタイムに解析します。",
            suffix: 'Smart Saving Index',
            editor: 'Maya / BIC SAVING 管理人',
            editorDesc: 'データ解析エンジニア。APIを駆使した価格監視とポイ活の自動化が専門。'
        },
        'AV Flash': {
            desc: "圧倒的なアーカイブ量を誇る情報ポータル。詳細なメタデータ解析で、最高の視聴体験をサポートします。",
            suffix: 'Ultimate Movie Registry',
            editor: 'Maya / AV FLASH 開発代表',
            editorDesc: '大規模データベース構築を得意とするエンジニア。膨大なデータの構造化がライフワーク。'
        },
        'Tiper': {
            desc: "大人のためのプレミアム・ガイド。AIソムリエがあなたの感性に響く最高の1本をエスコートします。",
            suffix: 'Tactical Archive Interface',
            editor: 'Maya / TIPER コンシェルジュ',
            editorDesc: 'AIレコメンドエンジンの開発者。感性を数値化するアルゴリズムを研究中。'
        }
    };

    const config = siteConfigs[site.site_name] || siteConfigs['Bic Station'];

    return (
        <footer
            className={styles.footer}
            style={{ '--accent-red': siteColor } as React.CSSProperties}
        >
            <div className={styles.container}>
                {/* 1. ブランド & 編集者プロフィール (信頼性の明示) */}
                <div className={styles.column}>
                    <h3 className={styles.siteTitle}>{site.site_name.toUpperCase()}</h3>
                    <p className={styles.description}>{config.desc}</p>
                    
                    <div className={styles.editorProfile}>
                        <h4 className={styles.miniTitle}>PRODUCED BY</h4>
                        <div className={styles.editorFlex}>
                            <div className={styles.editorIcon}>M</div>
                            <div>
                                <p className={styles.editorName}>{config.editor}</p>
                                <p className={styles.editorText}>{config.editorDesc}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. SHIN-VPS NETWORK */}
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

                {/* 3. INFORMATION (法的開示 & 連絡先) */}
                <div className={styles.column}>
                    <h3 className={styles.sectionTitle}>INFORMATION</h3>
                    <ul className={styles.linkList}>
                        <li className={styles.linkItem}><Link href={`${site.site_prefix}/about`}>ℹ️ 当サイトについて</Link></li>
                        <li className={styles.linkItem}><Link href={`${site.site_prefix}/guideline`}>📝 編集ガイドライン</Link></li>
                        <li className={styles.linkItem}><Link href={`${site.site_prefix}/privacy-policy`}>🛡️ プライバシーポリシー</Link></li>
                        <li className={styles.linkItem}><Link href={`${site.site_prefix}/disclaimer`}>⚠️ 免責事項</Link></li>
                        {/* ✅ contact ディレクトリへのリンクを確実に追加 */}
                        <li className={styles.linkItem}><Link href={`${site.site_prefix}/contact`}>📧 お問い合わせ</Link></li>
                    </ul>
                    
                    <div className={styles.affiliateDisclosure}>
                        <p>※当サイトはアフィリエイト広告を利用しています</p>
                    </div>
                </div>
            </div>

            <div className={styles.bottomBar}>
                <div className={styles.bottomContainer}>
                    <p className={styles.copyright}>
                        &copy; {currentYear} {site.site_name.toUpperCase()} - {config.suffix}
                    </p>
                    <div className={styles.systemStatus}>
                        STATUS: <span className={styles.statusOnline}>ONLINE</span> | NODE: {typeof window === 'undefined' ? 'SSR' : 'HYDRATED'}
                    </div>
                </div>
            </div>

            {/* デバッグ用診断ツール */}
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
 * 🏛️ Root Footer
 */
export default function Footer(props: FooterProps) {
    return (
        <Suspense fallback={<footer className={styles.footer} style={{ height: '300px' }} />}>
            <FooterContent {...props} />
        </Suspense>
    );
}
'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getSiteMetadata, getSiteColor } from '../lib/siteConfig';
import styles from './Footer.module.css';

/** * ✅ 指定パス: /home/maya/dev/shin-vps/shared/debug/SystemDiagnosticHero.tsx
 * プロジェクト構成に合わせてエイリアス (@/shared/...) でインポートします
 */
import SystemDiagnosticHero from '@/shared/debug/SystemDiagnosticHero';

interface FooterProps {
  debugData?: {
    id?: string;
    source?: string;
    data?: any;          // メイン商品のRAWデータ
    sidebarData?: any;   // サイドバー（関連商品）のRAWデータ
    fetchError?: string | null;
    relatedError?: string | null;
    params?: any;
  };
}

export default function Footer({ debugData }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const site = getSiteMetadata();
  const siteColor = getSiteColor(site.site_name);
  const searchParams = useSearchParams();
  
  // URLに ?debug=true が含まれているか判定
  const isDebugMode = searchParams.get('debug') === 'true';
  const isAdult = site.site_group === 'adult';

  const siteDescription = isAdult 
    ? "新作から人気作品まで、最新の動画情報を網羅。独自の5軸解析データに基づき、あなたに最適なエンタメ体験を提案します。"
    : "AIによる最新スペック解析と価格比較。メーカー直販モデルから自作PCパーツまで、ハードウェア性能を数値化して最適な1台を提案します。";

  const mainCategories = isAdult 
    ? [ { name: 'FANZA', slug: 'fanza' }, { name: 'DUGA', slug: 'duga' }, { name: 'MGS', slug: 'mgs' } ]
    : [ { name: 'Lenovo', slug: 'lenovo' }, { name: 'DELL', slug: 'dell' }, { name: 'Apple', slug: 'apple' } ];

  const contentLinks = isAdult
    ? [ { name: '🏠 トップページ', path: '/' }, { name: '🔥 人気ランキング', path: '/ranking' }, { name: '📅 発売カレンダー', path: '/calendar' } ]
    : [ { name: '🏠 製品カタログ', path: '/' }, { name: '🔍 PC診断', path: '/pc-finder' }, { name: '🛠 パーツ比較', path: '/ranking' } ];

  return (
    <footer className={styles.footer} style={{ borderTop: `4px solid ${siteColor}` }}>
      <div className={styles.container}>
        {/* --- 1. サイト概要 --- */}
        <div className={styles.column}>
          <h3 className={styles.siteTitle}>{site.site_name.toUpperCase()}</h3>
          <p className={styles.description}>{siteDescription}</p>
          <div className={styles.brandGrid}>
            <h4 className={styles.miniTitle}>{isAdult ? '主要プラットフォーム' : '主要ブランド'}</h4>
            <div className={styles.brandLinks}>
              {mainCategories.map((item, index) => (
                <React.Fragment key={item.slug}>
                  <Link href={`${site.site_prefix}/brand/${item.slug}`} className={styles.brandLink}>
                    {item.name}
                  </Link>
                  {index < mainCategories.length - 1 && <span className={styles.brandSeparator}>|</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* --- 2. メインナビ --- */}
        <div className={styles.column}>
          <h3 className={styles.sectionTitle}>コンテンツ</h3>
          <ul className={styles.linkList}>
            {contentLinks.map((link) => (
              <li key={link.path} className={styles.linkItem}>
                <Link href={`${site.site_prefix}${link.path}`}>{link.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* --- 3. リーガル/情報 --- */}
        <div className={styles.column}>
          <h3 className={styles.sectionTitle}>インフォメーション</h3>
          <ul className={styles.linkList}>
            <li className={styles.linkItem}>
              <Link href={`${site.site_prefix}/privacy-policy`}>🛡 プライバシーポリシー</Link>
            </li>
            <li className={styles.linkItem}>
              <Link href={`${site.site_prefix}/disclaimer`}>⚠️ 免責事項</Link>
            </li>
            <li className={styles.linkItem}>
              <Link href={`${site.site_prefix}/contact`}>📧 お問い合わせ</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <p className={styles.copyright}>&copy; {currentYear} {site.site_name.toUpperCase()} All Rights Reserved.</p>
      </div>

      {/* --- 🚀 診断ターミナル (最下部: SystemDiagnosticHero) --- */}
      {isDebugMode && (
        <div className={styles.debugContainer} style={{ marginTop: '30px' }}>
          <SystemDiagnosticHero 
            id={debugData?.id}
            source={debugData?.source}
            data={debugData?.data}
            sidebarData={debugData?.sidebarData}
            fetchError={debugData?.fetchError}
            relatedError={debugData?.relatedError}
            params={debugData?.params}
          />
          <div style={{ 
            textAlign: 'center', 
            background: '#ffcc00', 
            color: '#000', 
            fontSize: '10px', 
            fontWeight: 'bold', 
            padding: '2px' 
          }}>
            DEBUG_MODE_ACTIVE: Data stream from /shared/debug/SystemDiagnosticHero.tsx
          </div>
        </div>
      )}
    </footer>
  );
}
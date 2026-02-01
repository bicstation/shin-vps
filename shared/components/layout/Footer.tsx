'use client';

import React from 'react';
import Link from 'next/link';
import { getSiteMetadata, getSiteColor } from '../lib/siteConfig';
import styles from './Footer.module.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const site = getSiteMetadata();
  const siteColor = getSiteColor(site.site_name);

  // 💡 サイトごとのコンテンツ設定
  const isAdult = site.site_group === 'adult';

  // 1. 説明文の切り替え
  const siteDescription = isAdult 
    ? "新作から人気作品まで、最新の動画情報を網羅。価格比較や出演者データに基づき、あなたに最適なエンタメ体験を提案します。"
    : "AIによる最新スペック解析と価格比較。メーカー直販モデルから自作PCパーツまで、ハードウェア性能を数値化して最適な1台を提案します。";

  // 2. 主要ジャンル（ブランド）の切り替え
  const mainCategories = isAdult 
    ? [ { name: 'MGS', slug: 'mgs' }, { name: '新作動画', slug: 'new' }, { name: '独占配信', slug: 'exclusive' } ]
    : [ { name: 'Lenovo', slug: 'lenovo' }, { name: 'DELL', slug: 'dell' }, { name: 'Apple', slug: 'apple' }, { name: 'HP', slug: 'hp' } ];

  // 3. コンテンツリンクの切り替え
  const contentLinks = isAdult
    ? [ { name: '🏠 トップページ', path: '/' }, { name: '🔥 人気ランキング', path: '/ranking' }, { name: '📅 発売カレンダー', path: '/calendar' } ]
    : [ { name: '🏠 製品カタログ', path: '/' }, { name: '🔍 PC診断', path: '/pc-finder' }, { name: '🛠 パーツ比較', path: '/parts' } ];

  return (
    <footer className={styles.footer} style={{ borderTop: `4px solid ${siteColor}` }}>
      <div className={styles.container}>
        
        {/* 1列目：サイト概要 */}
        <div className={styles.column}>
          <h3 className={styles.siteTitle}>{site.site_name.toUpperCase()}</h3>
          <p className={styles.description}>{siteDescription}</p>
          
          <div className={styles.brandGrid}>
            <h4 className={styles.miniTitle}>{isAdult ? 'カテゴリー' : '主要ブランド'}</h4>
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

        {/* 2列目：メインナビゲーション */}
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

        {/* 3列目：規約・法的情報（共通） */}
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
            <li className={styles.note}>
              {isAdult 
                ? "※本サイトは18歳未満の方の閲覧を固く禁じています。掲載情報は投稿時点のものであり、必ず遷移先の各販売サイトにて最新情報をご確認ください。"
                : "※本サイトの解析データはAPIに基づいた投稿時点のものであり、ご購入の際は必ず遷移先の各販売サイトにて最新情報をご確認ください。"}
            </li>
          </ul>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <div className={styles.bottomContent}>
          <p>&copy; {currentYear} {site.site_name.toUpperCase()}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
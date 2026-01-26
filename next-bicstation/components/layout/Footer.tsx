import React from 'react';
import Link from 'next/link';
import { COLORS } from '@/constants';
import styles from './Footer.module.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const siteColor = COLORS?.SITE_COLOR || '#0f172a';

  const mainBrands = [
    { name: 'Lenovo', slug: 'lenovo' },
    { name: 'DELL', slug: 'dell' },
    { name: 'HP', slug: 'hp' },
    { name: 'Apple', slug: 'apple' },
    { name: 'Mouse', slug: 'mouse' },
    { name: 'ASUS', slug: 'asus' },
    { name: 'MSI', slug: 'msi' },
  ];

  return (
    <footer className={styles.footer} style={{ borderTop: `4px solid ${siteColor}` }}>
      <div className={styles.container}>
        
        {/* 1列目：ブランド・コンセプト */}
        <div className={styles.column}>
          <h3 className={styles.siteTitle}>BICSTATION</h3>
          <p className={styles.description}>
            AIによる最新スペック解析と価格比較。
            メーカー直販モデルから自作PCパーツまで、
            ハードウェア性能を数値化してあなたに最適な1台を提案します。
          </p>
          <div className={styles.brandGrid}>
            <h4 className={styles.miniTitle}>主要ブランド</h4>
            <div className={styles.brandLinks}>
              {mainBrands.map((brand, index) => (
                <React.Fragment key={brand.slug}>
                  <Link href={`/brand/${brand.slug}`} className={styles.brandLink}>
                    {brand.name}
                  </Link>
                  {index < mainBrands.length - 1 && <span className={styles.brandSeparator}>|</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* 2列目：ナビゲーション */}
        <div className={styles.column}>
          <h3 className={styles.sectionTitle}>コンテンツ・解析</h3>
          <ul className={styles.linkList}>
            <li className={styles.linkItem}>
              <Link href="/">🏠 製品カタログトップ</Link>
            </li>
            <li className={styles.linkItem}>
              <Link href="/bicstation">📝 最新テックニュース</Link>
            </li>
            <li className={styles.linkItem}>
              <Link href="/parts">🛠 自作PCパーツ比較</Link>
            </li>
            <li className={styles.linkItem}>
              <Link href="/ranking">🏆 コスパランキング</Link>
            </li>
            <li className={styles.linkItem}>
              <Link href="/about">ℹ️ BICSTATIONについて</Link>
            </li>
          </ul>
        </div>

        {/* 3列目：法的・信頼性情報（5つのページを統合） */}
        <div className={styles.column}>
          <h3 className={styles.sectionTitle}>インフォメーション</h3>
          <ul className={styles.linkList}>
            <li className={styles.linkItem}>
              <Link href="/privacy-policy">🛡 プライバシーポリシー</Link>
            </li>
            <li className={styles.linkItem}>
              <Link href="/ads-policy">📢 広告掲載規定 (API利用)</Link>
            </li>
            <li className={styles.linkItem}>
              <Link href="/disclaimer">⚠️ 免責事項</Link>
            </li>
            <li className={styles.linkItem}>
              <Link href="/guideline">📋 編集ガイドライン</Link>
            </li>
            <li className={styles.linkItem}>
              <Link href="/contact">📧 お問い合わせ</Link>
            </li>
            <li className={styles.note}>
              ※本サイトの解析データはAPIに基づいた投稿時点のものであり、ご購入の際は必ず遷移先の各販売サイトにて最新情報をご確認ください。
            </li>
          </ul>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <div className={styles.bottomContent}>
          <p>&copy; {currentYear} BICSTATION. Hardware analysis powered by AI.</p>
        </div>
      </div>
    </footer>
  );
}
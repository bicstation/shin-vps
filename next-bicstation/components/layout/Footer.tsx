import React from 'react';
import Link from 'next/link';
import { COLORS } from '@/constants';
import styles from './Footer.module.css'; // 🚀 CSSインポート

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const siteColor = COLORS?.SITE_COLOR || '#007bff';

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
        
        {/* 1列目：サイト情報 */}
        <div>
          <h3 className={styles.siteTitle}>BICSTATION</h3>
          <p className={styles.description}>
            最新のPCスペックと価格をリアルタイムに比較。
            メーカー直販サイトの情報を集約し、あなたに最適な1台を見つけるお手伝いをします。
          </p>
        </div>

        {/* 2列目：クイックリンク ＆ 主要ブランド */}
        <div>
          <h3 className={styles.sectionTitle}>コンテンツ</h3>
          <ul className={styles.linkList}>
            <li className={styles.linkItem}>
              <Link href="/">🏠 カタログトップ</Link>
            </li>
            <li className={styles.linkItem}>
              <Link href="/bicstation">📝 特集記事・ブログ</Link>
            </li>
            <li className={styles.linkItem}>
              <Link href="/about">ℹ️ BICSTATIONについて</Link>
            </li>
          </ul>

          <h4 className={styles.brandTitle}>主要ブランド</h4>
          <div className={styles.brandGrid}>
            {mainBrands.map((brand, index) => (
              <React.Fragment key={brand.slug}>
                <Link href={`/brand/${brand.slug}`} className={styles.brandLink}>
                  {brand.name}
                </Link>
                {index < mainBrands.length - 1 && <span className={styles.brandSeparator}>/</span>}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* 3列目：法的情報 */}
        <div>
          <h3 className={styles.sectionTitle}>インフォメーション</h3>
          <ul className={styles.linkList}>
            <li className={styles.linkItem}>
              <Link href="/contact">📧 お問い合わせ</Link>
            </li>
            <li className={styles.linkItem}>
              <Link href="/privacy-policy" style={{ color: '#888' }}>プライバシーポリシー</Link>
            </li>
            <li className={styles.linkItem}>
              <Link href="/terms" style={{ color: '#888' }}>利用規約</Link>
            </li>
            <li className={styles.note}>
              ※掲載情報の正確性には万全を期していますが、最新情報は必ず各メーカー公式サイトをご確認ください。
            </li>
          </ul>
        </div>
      </div>

      {/* 下部コピーライト */}
      <div className={styles.bottomBar}>
        <p>&copy; {currentYear} BICSTATION. All Rights Reserved.</p>
      </div>
    </footer>
  );
}
import React from 'react';
import Link from 'next/link';
import { COLORS } from '@/constants';
import styles from './Footer.module.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const siteColor = COLORS?.SITE_COLOR || '#0f172a'; // メインカラーを反映

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

        {/* 2列目：ナビゲーション・解析メニュー */}
        <div className={styles.column}>
          <h3 className={styles.sectionTitle}>コンテンツ・解析</h3>
          <ul className={styles.linkList}>
            <li className={styles.linkItem}>
              <Link href="/">🏠 製品カタログトップ</Link>
            </li>
            <li className={styles.linkItem}>
              <Link href="/bicstation">📝 最新テックニュース・ブログ</Link>
            </li>
            <li className={styles.linkItem}>
              <Link href="/parts">🛠 自作PCパーツ比較</Link>
            </li>
            <li className={styles.linkItem}>
              <Link href="/ranking">🏆 スペック・コスパランキング</Link>
            </li>
            <li className={styles.linkItem}>
              <Link href="/about">ℹ️ BICSTATIONについて</Link>
            </li>
          </ul>
        </div>

        {/* 3列目：サポート・法的情報 */}
        <div className={styles.column}>
          <h3 className={styles.sectionTitle}>インフォメーション</h3>
          <ul className={styles.linkList}>
            <li className={styles.linkItem}>
              <Link href="/contact">📧 お問い合わせ</Link>
            </li>
            <li className={styles.linkItem}>
              <Link href="/privacy-policy">プライバシーポリシー</Link>
            </li>
            <li className={styles.linkItem}>
              <Link href="/terms">利用規約</Link>
            </li>
            <li className={styles.note}>
              ※製品スペック、在庫状況、価格は各メーカー公式サイトを必ず優先してご確認ください。本サイトの解析データは購入の参考として提供されています。
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
'use client';

import React, { useState, useEffect } from 'react';
import { getSiteColor } from '../../lib/utils/siteConfig'; 
import styles from './GeneralSidebar.module.css';

/* ✅ 安全化（window依存回避 + fallback対応） */
const ALL_SATELLITES_SAFE = typeof window !== 'undefined' ? [
  { name: "家計の守護神", url: "https://h.money.bic-saving.com", icon: "🧼" },
  { name: "ポイント還元攻略", url: "https://h.point.bic-saving.com", icon: "🏷️" },
  { name: "新NISA資産運用", url: "https://h.invest.bic-saving.com", icon: "📈" },
  { name: "ふるさと納税達人", url: "https://h.furusato.bic-saving.com", icon: "🍱" },
  { name: "固定費削減ハッカー", url: "https://h.life.bic-saving.com", icon: "🛠️" }
] : [];

export default function GeneralSidebar({ product, siteName = 'General Site', isBicSaving = false }: any) {

  const siteColor = isBicSaving ? '#f59e0b' : getSiteColor('general');
  const [randomSatellites, setRandomSatellites] = useState<any[]>([]);

  useEffect(() => {
    if (!ALL_SATELLITES_SAFE.length) return;

    const shuffled = [...ALL_SATELLITES_SAFE].sort(() => 0.5 - Math.random());
    setRandomSatellites(shuffled.slice(0, 5));
  }, []);

  return (
    <aside className={styles.sidebar}>
      
      {/* メニュー */}
      <section className={styles.sectionWrapper}>
        <div className={styles.sectionTitle} style={{ borderLeft: `3px solid ${siteColor}` }}>
          {siteName} Menu
        </div>

        <nav className={styles.navList}>
          <a href="/" className={styles.navLink}>🏠 Dashboard</a>
          <a href="/pc-finder" className={styles.navLink}>🔍 PC Finder</a>
        </nav>
      </section>

      {/* サテライト */}
      {isBicSaving && randomSatellites.length > 0 && (
        <section className={styles.sectionWrapper}>
          <div className={styles.sectionTitle}>
            Expert Networks
          </div>

          {randomSatellites.map((blog, idx) => (
            <a key={idx} href={blog.url} target="_blank" className={styles.satelliteCard}>
              {blog.icon} {blog.name}
            </a>
          ))}
        </section>
      )}

      {/* 商品 */}
      {product && (
        <section className={styles.sectionWrapper}>
          <div className={styles.sectionTitle}>Hardware Analysis</div>
          <div className={styles.specCard}>
            RANK: {product.spec_score}
          </div>
        </section>
      )}

    </aside>
  );
}
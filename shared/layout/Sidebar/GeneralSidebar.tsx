'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSiteColor } from '../../lib/utils/siteConfig'; 
import styles from './GeneralSidebar.module.css';

export default function GeneralSidebar({ product, siteName = 'General Site', isBicSaving = false }: any) {
  const siteColor = isBicSaving ? '#f59e0b' : getSiteColor('general');
  const [randomSatellites, setRandomSatellites] = useState<any[]>([]);

  useEffect(() => {
    const shuffled = [...ALL_SATELLITES].sort(() => 0.5 - Math.random());
    setRandomSatellites(shuffled.slice(0, 8));
  }, []);

  return (
    <aside className={styles.sidebar}>
      
      {/* 1. 共通メニュー */}
      <section className={styles.sectionWrapper}>
        <div className={styles.sectionTitle} style={{ borderLeft: `3px solid ${siteColor}` }}>
          {siteName} Menu
        </div>
        <nav className={styles.navList}>
          <Link href="/" className={styles.navLink}>
            <span className={styles.icon}>🏠</span> Dashboard
          </Link>
          <Link href="/blog/pc-finder" className={styles.navLink}>
            <span className={styles.icon}>🔍</span> PC Finder
          </Link>
        </nav>
      </section>

      {/* 2. Bic Saving 専用サテライト */}
      {isBicSaving && randomSatellites.length > 0 && (
        <section className={styles.sectionWrapper}>
          <div className={styles.sectionTitle} style={{ borderLeft: `3px solid #f59e0b` }}>
            Expert Networks
          </div>
          <div className={styles.navList} style={{ gap: '0.4rem' }}>
            {randomSatellites.map((blog, idx) => (
              <a 
                key={idx} 
                href={blog.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={styles.satelliteCard}
                title={blog.name}
              >
                <span className={styles.icon} style={{ fontSize: '0.85rem' }}>{blog.icon}</span>
                <span className={styles.satelliteName}>{blog.name}</span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* 3. ハードウェア解析 */}
      {product?.spec_score && (
        <section className={styles.sectionWrapper}>
          <div className={styles.sectionTitle} style={{ borderLeft: `3px solid ${siteColor}` }}>
            Hardware Analysis
          </div>
          <div className={styles.specCard}>
            <div className={styles.specLabel}>Performance Index</div>
            <div className={styles.specRank}>
              RANK: <span className={styles.scoreHighlight}>{product.spec_score}</span>
            </div>
            <div className={styles.gaugeContainer}>
              <div 
                className={styles.gaugeBar} 
                style={{ 
                  width: `${Math.min(product.spec_score, 100)}%`,
                  backgroundColor: siteColor 
                }} 
              />
            </div>
          </div>
        </section>
      )}

      <footer className={styles.footer}>
        <p className={styles.systemNode}>
          FLEET-CORE: {siteName.replace(/\s+/g, '-').toUpperCase()}
        </p>
      </footer>
    </aside>
  );
}
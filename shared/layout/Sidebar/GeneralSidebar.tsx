'use client';

import React from 'react';
import { getSiteColor } from '../../lib/siteConfig';
import styles from './Sidebar.module.css';

export default function GeneralSidebar({ product }: any) {
  const siteColor = getSiteColor('general');

  return (
    <aside className={styles.sidebar}>
      {product && (
        <div className={styles.sectionWrapper}>
          <div className={styles.sectionTitle} style={{ borderLeft: `3px solid ${siteColor}` }}>HARDWARE ANALYSIS</div>
          <div className={styles.specCard}>
            {/* スペック解析UI */}
            <div className={styles.scoreText}>RANK: {product.spec_score}</div>
          </div>
        </div>
      )}
      {/* 一般用メーカー一覧など */}
    </aside>
  );
}
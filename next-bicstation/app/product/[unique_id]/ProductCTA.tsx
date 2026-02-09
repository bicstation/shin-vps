'use client';

import React from 'react';
import Link from 'next/link';
import { COLORS } from '@/shared/styles/constants';
import styles from './ProductCTA.module.css';

export default function ProductCTA() {
  const primaryColor = COLORS?.SITE_COLOR || '#007bff';

  return (
    <section className={styles.ctaWrapper}>
      <div className={styles.ctaCard}>
        <div className={styles.content}>
          <h3 className={styles.title}>お探しのスペックが見つかりませんか？</h3>
          <p className={styles.description}>
            PC選びのプロが、あなたの用途と予算に合わせた最適な1台をご提案します。
          </p>
        </div>
        <div className={styles.action}>
          <Link 
            href="/contact" 
            className={styles.consultButton}
            style={{ backgroundColor: primaryColor }}
          >
            コンシェルジュに無料相談する
            <span className={styles.arrow}>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
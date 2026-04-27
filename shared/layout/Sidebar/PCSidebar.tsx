/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { getSiteMetadata, getSiteColor } from '@/shared/lib/utils/siteConfig';
import styles from './PCSidebar.module.css';

export default function PCSidebar() {
  const [siteColor, setSiteColor] = useState('#00f2ff');

  useEffect(() => {
    const host = window.location.host;
    const site = getSiteMetadata(host);
    const color = site ? getSiteColor(site.site_name) : '#00f2ff';
    setSiteColor(color);
  }, []);

  return (
    <aside className={styles.sidebar}>
      
      {/* 🚀 CTAだけ残す（最重要） */}
      <section className={styles.section}>
        <p className={styles.ctaLead}>
          あなたに合う1台をすぐ見つける
        </p>

        <Link href="/ranking" className={styles.ctaButton}>
          🔥 人気No.1をチェック
        </Link>

        <Link href="/pc-finder" className={styles.ctaSub}>
          🤖 30秒で最適PCを診断
        </Link>
      </section>

      {/* 🔥 軽量ランキング（仮） */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle} style={{ color: siteColor }}>
          🔥 人気ランキング
        </h3>

        <ul className={styles.rankingList}>
          <li className={styles.rankingItem}>
            <span className={styles.rankBadge}>1</span> MacBook Air
          </li>
          <li className={styles.rankingItem}>
            <span className={styles.rankBadge}>2</span> Dell XPS
          </li>
          <li className={styles.rankingItem}>
            <span className={styles.rankBadge}>3</span> ThinkPad
          </li>
        </ul>
      </section>

    </aside>
  );
}
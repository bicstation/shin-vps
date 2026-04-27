/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './AdultSidebar.module.css';

const ADULT_SATELLITES = [
  { name: "最新AVトレンド速報", url: "https://main.tiper.live", icon: "💎" },
  { name: "新作予約中毒マニア", url: "https://reserve.tiper.live", icon: "📅" },
  { name: "熟女・人妻の深み", url: "https://jukujo.tiper.live", icon: "💄" },
  { name: "360度没入VR専門", url: "https://vr.tiper.live", icon: "🽽" },
  { name: "美少女新人発掘", url: "https://idol.tiper.live", icon: "✨" },
  { name: "嫉妬と興奮のNTR", url: "https://ntr.tiper.live", icon: "💔" },
];

export default function AdultSidebar() {
  const siteColor = "#d946ef";

  const [satellites, setSatellites] = useState<any[]>([]);

  useEffect(() => {
    const shuffled = [...ADULT_SATELLITES].sort(() => Math.random() - 0.5);
    setSatellites(shuffled.slice(0, 6));
  }, []);

  return (
    <aside className={styles.sidebar}>
      
      {/* 🔞 CTA */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle} style={{ color: siteColor }}>
          SPECIAL SEARCH
        </h3>

        <Link href="/video-finder/" className={styles.specialBanner}>
          🔞 AV-FINDER（AIおすすめ）
        </Link>
      </section>

      {/* 🛰️ サテライト */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>NETWORK</h3>

        <div className={styles.satelliteGrid}>
          {satellites.map((sat, idx) => (
            <a key={idx} href={sat.url} target="_blank" rel="noopener noreferrer">
              {sat.icon} {sat.name}
            </a>
          ))}
        </div>
      </section>

      {/* 📂 カテゴリ */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>GENRES</h3>

        <ul className={styles.list}>
          {['単体作品', '熟女', '素人', 'VR'].map((g) => (
            <li key={g}>
              <Link href={`/genre/${encodeURIComponent(g)}`}>
                💋 {g}
              </Link>
            </li>
          ))}
        </ul>
      </section>

    </aside>
  );
}
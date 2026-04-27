'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './AdultSidebarAvFlash.module.css';

const AVFLASH_FLEET = [
  { name: "AVFLASH 総合ポータル", url: "https://portal.avflash.xyz", icon: "💎" },
  { name: "AVFLASH 速報", url: "https://reserve.avflash.xyz", icon: "⚡" },
  { name: "熟女・人妻", url: "https://jukujo.avflash.xyz", icon: "💄" },
  { name: "VR専門", url: "https://vr.avflash.xyz", icon: "🕶️" },
  { name: "アイドル", url: "https://idol.avflash.xyz", icon: "✨" },
];

export default function AdultSidebarAvFlash() {
  const [mounted, setMounted] = useState(false);
  const [fleet, setFleet] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    const shuffled = [...AVFLASH_FLEET].sort(() => Math.random() - 0.5);
    setFleet(shuffled);
  }, []);

  if (!mounted) return null;

  return (
    <aside className={styles.sidebar}>
      
      {/* 🔞 CTA */}
      <section className={styles.sectionWrapper}>
        <h3 className={styles.headerTitle}>🔞 AV SEARCH</h3>

        <Link href="/video-finder/" className={styles.masterLink}>
          AIでおすすめを見る
        </Link>
      </section>

      {/* 🛰️ サテライト */}
      <section className={styles.sectionWrapper}>
        <h3 className={styles.headerTitle}>AVFLASH NETWORK</h3>

        <ul className={styles.masterList}>
          {fleet.map((f, idx) => (
            <li key={idx}>
              <a href={f.url} target="_blank" rel="noopener noreferrer">
                {f.icon} {f.name}
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* 📂 カテゴリ */}
      <section className={styles.sectionWrapper}>
        <h3 className={styles.headerTitle}>GENRES</h3>

        <ul className={styles.masterList}>
          {['単体', '熟女', '素人', 'VR'].map((g) => (
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
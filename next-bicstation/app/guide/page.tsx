// /home/maya/shin-dev/shin-vps/next-bicstation/app/guide/page.tsx
import Link from 'next/link';

import styles from './page.module.css';

const guides = [
  {
    title: '初心者向けPC選び',
    description:
      '最初の1台で失敗しないための基本ガイド。',
    href: '/guide/pc-select',
    emoji: '🖥️',
  },

  {
    title: 'CPUの違い',
    description:
      'Core i5・i7・Ryzenの違いをやさしく解説。',
    href: '/guide/cpu',
    emoji: '⚡',
  },

  {
    title: 'ゲーミングPCの選び方',
    description:
      'FPS・MMO・配信向け構成を初心者向けに整理。',
    href: '/guide/gaming-pc',
    emoji: '🎮',
  },

  {
    title: 'AI用PCガイド',
    description:
      '画像生成・ローカルAI向けPC構成の基礎。',
    href: '/guide/ai-pc',
    emoji: '🤖',
  },

  {
    title: '動画編集PC',
    description:
      'Premiere・DaVinci向けおすすめ構成。',
    href: '/guide/video-editing',
    emoji: '🎬',
  },

  {
    title: 'コスパ重視PC',
    description:
      '価格と性能のバランスを重視した選び方。',
    href: '/guide/cost-performance',
    emoji: '💴',
  },

  {
    title: 'ノート vs デスクトップ',
    description:
      '用途別にどちらが向いているか比較。',
    href: '/guide/laptop-vs-desktop',
    emoji: '💻',
  },
];

export default function GuideIndexPage() {

  return (

    <main className={styles.container}>

      {/* =====================================================
          Hero
      ===================================================== */}
      <section className={styles.hero}>

        <div className={styles.heroBadge}>
          SHIN CORE LINX GUIDE
        </div>

        <h1 className={styles.title}>
          パソコン選びガイド
        </h1>

        <p className={styles.description}>
          初心者でも迷わない。
          <br />
          用途別に「本当に必要な性能」をわかりやすく整理しました。
        </p>

      </section>

      {/* =====================================================
          Guide Grid
      ===================================================== */}
      <section className={styles.grid}>

        {guides.map((guide) => (

          <Link
            key={guide.href}
            href={guide.href}
            className={styles.card}
          >

            <div className={styles.cardTop}>

              <div className={styles.emoji}>
                {guide.emoji}
              </div>

              <div className={styles.arrow}>
                →
              </div>

            </div>

            <h2 className={styles.cardTitle}>
              {guide.title}
            </h2>

            <p className={styles.cardDescription}>
              {guide.description}
            </p>

          </Link>

        ))}

      </section>

      {/* =====================================================
          CTA
      ===================================================== */}
      <section className={styles.cta}>

        <h2 className={styles.ctaTitle}>
          迷ったらランキングから探せます
        </h2>

        <p className={styles.ctaText}>
          用途別・価格別におすすめPCを整理しています。
        </p>

        <Link
          href="/ranking"
          className={styles.ctaButton}
        >
          👉 おすすめPCを見る
        </Link>

      </section>

    </main>
  );
}

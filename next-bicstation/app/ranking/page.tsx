/* eslint-disable @next/next/no-img-element */

import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import styles from './Ranking.module.css';

/** 🔥 SEO */
export const metadata: Metadata = {
  title: "PCランキング一覧｜用途・GPU・メーカー別",
  description: "目的・GPU・メーカー別にPCランキングを比較。失敗しない選び方ができます。",
};

/** 🔥 カテゴリ */
const CATEGORY_GROUPS = [
  {
    title: "🏆 まずはここから",
    items: [
      {
        title: "総合ランキング",
        desc: "迷ったらこれ。失敗しないPC",
        href: "/ranking/score",
      },
      {
        title: "ゲーミングPC",
        desc: "ゲームするならこの構成",
        href: "/ranking/gaming",
      },
      {
        title: "コスパ重視",
        desc: "安くても後悔しない",
        href: "/ranking/price-low",
      },
      {
        title: "ビジネスPC",
        desc: "仕事効率を上げる",
        href: "/ranking/business",
      },
    ],
  },

  {
    title: "⚡ GPUで選ぶ",
    items: [
      {
        title: "RTX 4060",
        desc: "一番バランスがいいGPU",
        href: "/ranking/gpu-rtx-4060",
      },
      {
        title: "RTX 4070",
        desc: "ワンランク上の性能",
        href: "/ranking/gpu-rtx-4070",
      },
      {
        title: "RTX 4080以上",
        desc: "ハイエンド構成",
        href: "/ranking/gpu-high",
      },
    ],
  },

  {
    title: "🏢 メーカーで選ぶ",
    items: [
      {
        title: "ASUS",
        desc: "人気No.1メーカー",
        href: "/ranking/maker-asus",
      },
      {
        title: "Dell",
        desc: "安定・コスパ",
        href: "/ranking/maker-dell",
      },
      {
        title: "HP",
        desc: "ビジネスに強い",
        href: "/ranking/maker-hp",
      },
      {
        title: "Lenovo",
        desc: "コスパ最強",
        href: "/ranking/maker-lenovo",
      },
    ],
  },
];

export default function RankingIndexPage() {
  return (
    <main className={styles.container}>

      {/* 🔥 HERO */}
      <section className={styles.heroText}>
        <h1>目的別にPCを選ぶ</h1>
        <p>用途・GPU・メーカーから選ぶのが最短ルートです</p>
      </section>

      {/* 🔥 セクションごとに表示 */}
      {CATEGORY_GROUPS.map((group) => (
        <section key={group.title} className={styles.section}>
          
          <h2 className={styles.sectionTitle}>
            {group.title}
          </h2>

          <div className={styles.grid}>
            {group.items.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className={styles.categoryCard}
              >
                <h3>{cat.title}</h3>
                <p>{cat.desc}</p>
              </Link>
            ))}
          </div>

        </section>
      ))}

      {/* 🔥 回遊CTA */}
      <section className={styles.bottomCta}>
        <Link href="/ranking/score">
          → 迷ったら総合ランキングを見る
        </Link>
      </section>

    </main>
  );
}
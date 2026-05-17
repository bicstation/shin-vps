// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/components/RankingHero.tsx
// ============================================================================

'use client'

import styles from '../RankingPage.module.css'

type Props = {
  activeGroup?: string | null
}

/* ============================================================================
🔥 Hero Floating Labels
============================================================================ */

const HERO_FLOATING_LABELS: Record<
  string,
  {
    top: string
    middle: string
    bottom: string
  }
> = {

  gpu: {
    top: 'RTX',
    middle: 'AI GPU',
    bottom: 'Gaming',
  },

  cpu: {
    top: 'Core Ultra',
    middle: 'Ryzen AI',
    bottom: 'Compute',
  },

  usage: {
    top: 'Gaming',
    middle: 'Creator',
    bottom: 'Business',
  },

  maker: {
    top: 'ASUS',
    middle: 'MSI',
    bottom: 'DELL',
  },

  device: {
    top: 'Laptop',
    middle: 'Desktop',
    bottom: 'WS',
  },

}

/* ============================================================================
🔥 Hero Runtime Copy
============================================================================ */

const HERO_COPY: Record<
  string,
  {
    eyebrow: string
    title: string
    description: string
  }
> = {

  gpu: {

    eyebrow:
      'GPU PERFORMANCE RUNTIME',

    title:
      'GPU性能から\n未来のPCを探索',

    description:
      'RTX・AI・クリエイターGPUを中心に、\nsemantic performance runtime として比較探索。',

  },

  cpu: {

    eyebrow:
      'CPU PERFORMANCE RUNTIME',

    title:
      'CPU性能とAI処理能力を探索',

    description:
      'Core Ultra・Ryzen AIなど、\n次世代CPU performance runtime を可視化。',

  },

  usage: {

    eyebrow:
      'USAGE DISCOVERY RUNTIME',

    title:
      '用途から\n理想のPCを発見',

    description:
      'Gaming・Creator・Business向けPCを、\nsemantic UX runtime として探索。',

  },

}

/* ============================================================================
🔥 Ranking Hero
============================================================================ */

export default function RankingHero({
  activeGroup,
}: Props) {

  const heroCopy =
    HERO_COPY[
      activeGroup || ''
    ]

  const floating =
    HERO_FLOATING_LABELS[
      activeGroup || ''
    ]

  return (

    <section className={styles.hero}>

      {/* Background */}
      <div className={styles.heroNoise} />

      <div className={styles.heroGlow} />

      {/* Runtime Orb */}
      <div className={styles.heroEnergyCore} />

      {/* Inner */}
      <div className={styles.heroInner}>

        {/* Badge */}
        <div className={styles.heroBadge}>

          <div className={styles.heroBadgeDot} />

          SHIN CORE LINX

        </div>

        {/* Content */}
        <div className={styles.heroContent}>

          {/* ============================================================
          LEFT
          ============================================================ */}

          <div className={styles.heroLeft}>

            <div className={styles.heroEyebrow}>

              {heroCopy?.eyebrow
                || 'SEMANTIC DISCOVERY RUNTIME'}

            </div>

            <h1 className={styles.heroTitle}>

              {(heroCopy?.title
                ||
                'あなたに最適な\nPCカテゴリを探索'
              )
                .split('\n')
                .map((line) => (
                  <div key={line}>
                    {line}
                  </div>
                ))}

            </h1>

            <p className={styles.heroDescription}>

              {(heroCopy?.description
                ||
                'semantic ontology runtime を、人間中心UXへ翻訳。'
              )
                .split('\n')
                .map((line) => (
                  <div key={line}>
                    {line}
                  </div>
                ))}

            </p>

          </div>

          {/* ============================================================
          RIGHT
          ============================================================ */}

          <div className={styles.heroOrbArea}>

            {/* Orb */}
            <div className={styles.heroOrb} />

            <div className={styles.heroOrbRing} />

            <div className={styles.heroOrbRing2} />

            {/* Floating Labels */}
            <div className={styles.heroFloating}>

              {floating?.top || 'Gaming'}

            </div>

            <div className={styles.heroFloating2}>

              {floating?.middle || 'AI'}

            </div>

            <div className={styles.heroFloating3}>

              {floating?.bottom || 'Creator'}

            </div>

          </div>

        </div>

      </div>

    </section>

  )
}
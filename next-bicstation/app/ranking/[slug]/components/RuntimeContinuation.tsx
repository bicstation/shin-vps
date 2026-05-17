// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[slug]/components/RuntimeContinuation.tsx
// ============================================================================

'use client'

import Link from 'next/link'

import styles from '../styles/runtime-continuation.module.css'

/* ============================================================================
🔥 Runtime Continuation
============================================================================ */

const discoveryLinks = [

  {
    title: 'AI開発向けPC',
    description:
      'ローカルAI・生成AI用途に強い構成を探索',
    href:
      '/ranking/usage-ai/',
  },

  {
    title: 'ゲーミングPC',
    description:
      '高性能GPU搭載モデルを比較',
    href:
      '/ranking/usage-gaming/',
  },

  {
    title: 'クリエイター向け',
    description:
      '動画編集・3DCG制作向けモデル',
    href:
      '/ranking/usage-creator/',
  },

]

/* ============================================================================
🔥 Component
============================================================================ */

export default function RuntimeContinuation() {

  return (

    <section className={styles.runtimeContinuation}>

      {/* ================================================================
      Header
      ================================================================ */}

      <div className={styles.runtimeContinuationHeader}>

        <div className={styles.runtimeContinuationEyebrow}>

          CONTINUE DISCOVERY

        </div>

        <h2 className={styles.runtimeContinuationTitle}>

          次の探索を続ける

        </h2>

        <p className={styles.runtimeContinuationDescription}>

          semantic runtime が関連性の高い探索ルートを提案しています。

        </p>

      </div>

      {/* ================================================================
      Grid
      ================================================================ */}

      <div className={styles.runtimeContinuationGrid}>

        {discoveryLinks.map(
          (
            item
          ) => (

            <Link
              key={item.href}
              href={item.href}
              className={
                styles.runtimeContinuationCard
              }
            >

              <div
                className={
                  styles.runtimeContinuationGlow
                }
              />

              <div
                className={
                  styles.runtimeContinuationCardTitle
                }
              >

                {item.title}

              </div>

              <p
                className={
                  styles.runtimeContinuationCardDescription
                }
              >

                {item.description}

              </p>

              <div
                className={
                  styles.runtimeContinuationAction
                }
              >

                探索を続ける →

              </div>

            </Link>

          )
        )}

      </div>

    </section>

  )
}
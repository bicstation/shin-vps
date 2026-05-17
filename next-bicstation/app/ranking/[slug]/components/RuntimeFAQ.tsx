// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[slug]/components/RuntimeFAQ.tsx
// ============================================================================

'use client'

import styles from '../RankingSlugPage.module.css'

type Props = {
  faq?: Array<{
    question?: string
    answer?: string
  }>
}

/* ============================================================================
🔥 Runtime FAQ
============================================================================ */

export default function RuntimeFAQ({
  faq = [],
}: Props) {

  /* ==========================================================================
  🔥 Empty
  ========================================================================== */

  if (!faq.length) {

    return null
  }

  /* ==========================================================================
  🔥 Render
  ========================================================================== */

  return (

    <section className={styles.runtimeFAQSection}>

      {/* ================================================================
      Header
      ================================================================ */}

      <div className={styles.runtimeFAQHeader}>

        <div>

          <div className={styles.runtimeFAQEyebrow}>

            RUNTIME FAQ

          </div>

          <h2 className={styles.runtimeFAQTitle}>

            よくある質問

          </h2>

        </div>

      </div>

      {/* ================================================================
      FAQ List
      ================================================================ */}

      <div className={styles.runtimeFAQList}>

        {faq.map(
          (
            item,
            index
          ) => (

            <article
              key={index}
              className={
                styles.runtimeFAQItem
              }
            >

              {/* Question */}
              <h3
                className={
                  styles.runtimeFAQQuestion
                }
              >

                {item?.question}

              </h3>

              {/* Answer */}
              <p
                className={
                  styles.runtimeFAQAnswer
                }
              >

                {item?.answer}

              </p>

            </article>

          )
        )}

      </div>

    </section>

  )
}
// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[slug]/components/RuntimeFAQ.tsx
// ============================================================================

'use client'

import styles from '../styles/runtime-faq.module.css'

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

    <section className={styles.runtimeFaq}>

      {/* ================================================================
      Glow
      ================================================================ */}

      <div className={styles.runtimeFaqGlow} />

      {/* ================================================================
      Header
      ================================================================ */}

      <div className={styles.runtimeFaqHeader}>

        <div>

          <div className={styles.runtimeFaqEyebrow}>

            RUNTIME FAQ

          </div>

          <h2 className={styles.runtimeFaqTitle}>

            よくある質問

          </h2>

        </div>

      </div>

      {/* ================================================================
      FAQ List
      ================================================================ */}

      <div className={styles.runtimeFaqList}>

        {faq.map(
          (
            item,
            index
          ) => (

            <article
              key={index}
              className={
                styles.runtimeFaqItem
              }
            >

              {/* ========================================================
              Question
              ======================================================== */}

              <h3
                className={
                  styles.runtimeFaqQuestion
                }
              >

                <span
                  className={
                    styles.runtimeFaqQuestionBadge
                  }
                >

                  Q

                </span>

                <span>

                  {item?.question}

                </span>

              </h3>

              {/* ========================================================
              Answer
              ======================================================== */}

              <p
                className={
                  styles.runtimeFaqAnswer
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
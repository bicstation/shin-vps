// /home/maya/shin-vps/next-bicstation/app/components/home/recommendation/HomeFinderCTA.tsx

import Link
  from 'next/link'

import styles
  from '../../styles/recommendation.module.css'

export default function HomeFinderCTA() {

  return (

    <section
      className={
        styles.finderSection
      }
    >

      <div
        className={
          styles.finderCard
        }
      >

        {/* =====================================
        LABEL
        ===================================== */}

        <div
          className={
            styles.finderLabel
          }
        >
          AI SEMANTIC FINDER
        </div>

        {/* =====================================
        TITLE
        ===================================== */}

        <h2
          className={
            styles.finderTitle
          }
        >
          あなたの用途から
          semantic recommendation
        </h2>

        {/* =====================================
        DESCRIPTION
        ===================================== */}

        <p
          className={
            styles.finderDescription
          }
        >
          gaming・creator・
          AI画像生成・budget など。

          用途ベース recommendation により、
          あなたに合うPCを
          semantic に比較できます。
        </p>

        {/* =====================================
        CTA
        ===================================== */}

        <Link
          href="/pc-finder"

          className={
            styles.finderButton
          }
        >
          semantic finder を使う →
        </Link>

      </div>

    </section>

  )
}
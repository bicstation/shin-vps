import Link
  from 'next/link'

import styles
  from '../page.module.css'

export default function HomeBottomCTA() {

  return (

    <section
      className={
        styles.bottomSection
      }
    >

      <div
        className={
          styles.bottomCard
        }
      >

        {/* ============================
        LABEL
        ============================ */}

        <div
          className={
            styles.bottomLabel
          }
        >
          🚀 SEMANTIC PC FINDER
        </div>

        {/* ============================
        TITLE
        ============================ */}

        <h2
          className={
            styles.bottomTitle
          }
        >
          あなたに合うPCを、
          用途から比較して探す
        </h2>

        {/* ============================
        DESCRIPTION
        ============================ */}

        <p
          className={
            styles.bottomDescription
          }
        >
          ゲーミング・AI・動画編集・
          コスパ重視など、
          用途別におすすめ構成を
          わかりやすく比較できます。
        </p>

        {/* ============================
        FEATURES
        ============================ */}

        <div
          className={
            styles.bottomFeatures
          }
        >

          <div
            className={
              styles.bottomFeature
            }
          >
            ✔ 初心者向け比較
          </div>

          <div
            className={
              styles.bottomFeature
            }
          >
            ✔ RTX 50シリーズ対応
          </div>

          <div
            className={
              styles.bottomFeature
            }
          >
            ✔ AI用途にも対応
          </div>

        </div>

        {/* ============================
        CTA
        ============================ */}

        <Link
          href="/ranking"

          className={
            styles.bottomButton
          }
        >
          おすすめランキングを見る →
        </Link>

      </div>

    </section>

  )
}
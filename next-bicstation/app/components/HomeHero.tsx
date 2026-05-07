import Link
  from 'next/link'

import styles
  from '../page.module.css'

export default function HomeHero() {

  return (
    <section
      className={
        styles.hero
      }
    >

      {/* =====================================
      LABEL
      ===================================== */}

      <div
        className={
          styles.heroLabel
        }
      >
        🎮 今おすすめのゲーミングPC
      </div>

      {/* =====================================
      TITLE
      ===================================== */}

      <h1
        className={
          styles.heroTitle
        }
      >
        ゲームも動画編集も快適な
        高性能PCを比較
      </h1>

      {/* =====================================
      DESCRIPTION
      ===================================== */}

      <p
        className={
          styles.heroDescription
        }
      >
        FPSゲーム・配信・動画編集・
        AI画像生成まで、
        用途別におすすめPCを
        わかりやすく紹介しています。
      </p>

      {/* =====================================
      FEATURE POINTS
      ===================================== */}

      <div
        className={
          styles.heroPoints
        }
      >

        <div
          className={
            styles.heroPoint
          }
        >
          🎮 FPSゲーム向け
        </div>

        <div
          className={
            styles.heroPoint
          }
        >
          🎬 動画編集も快適
        </div>

        <div
          className={
            styles.heroPoint
          }
        >
          🤖 AI画像生成対応
        </div>

      </div>

      {/* =====================================
      CTA
      ===================================== */}

      <div
        className={
          styles.heroActions
        }
      >

        <Link
          href="/ranking/score"

          className={
            styles.heroPrimaryButton
          }
        >
          人気ランキングを見る
        </Link>

        <Link
          href="/pc-finder"

          className={
            styles.heroSecondaryButton
          }
        >
          自分に合うPCを探す
        </Link>

      </div>

      {/* =====================================
      NOTICE
      ===================================== */}

      <div
        className={
          styles.heroNotice
        }
      >
        初心者向けの選び方も掲載しています
      </div>

    </section>
  )
}
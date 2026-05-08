// /home/maya/shin-vps/next-bicstation/app/components/home/hero/HomeHero.tsx

import Link
  from 'next/link'

import styles
  from '../styles/hero.module.css'

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
        AI対応・ゲーミングPC比較
      </div>

      {/* =====================================
      TITLE
      ===================================== */}

      <h1
        className={
          styles.heroTitle
        }
      >
        あなたに合う
        高性能PCを
        わかりやすく比較
      </h1>

      {/* =====================================
      DESCRIPTION
      ===================================== */}

      <p
        className={
          styles.heroDescription
        }
      >
        FPSゲーム・動画編集・
        AI画像生成・普段使いまで。

        用途別 recommendation により、
        初心者でも比較しやすい
        PC選びをサポートします。
      </p>

      {/* =====================================
      SEMANTIC POINTS
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
          🎮 FPS gaming向け
        </div>

        <div
          className={
            styles.heroPoint
          }
        >
          🤖 AI画像生成対応
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
          🛡 初心者でも選びやすい
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
          用途からPCを探す
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
        スペック知識がなくても、
        用途ベースで比較できます。
      </div>

    </section>

  )
}
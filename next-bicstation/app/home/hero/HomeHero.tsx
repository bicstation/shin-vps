// /home/maya/shin-vps/next-bicstation/app/components/home/hero/HomeHero.tsx

import Link
  from 'next/link'

import styles
  from '../styles/hero.module.css'

type Props = {
  meaning?: any
  stats?: any
  featuredGroups?: any[]
}


export default function HomeHero({

  meaning,
  stats,
  featuredGroups,

}: Props) {

  console.log(
    'TOP_MEANING',
    meaning
  )

  console.log(
    'TOP_STATS',
    stats
  )

  // console.log(
  //   'FEATURED_GROUPS',
  //   runtime?.top?.featured_groups
  // )

  // console.log(
  //   'RANKING_PRODUCTS',
  //   rankingProducts
  // )

  console.log(
    'FEATURED_GROUPS',
    featuredGroups
  )

  return (

    <section
      className={
        styles.hero
      }
    >

      <div className={styles.heroRuntimeMeaning}>
        {meaning?.identity}
      </div>

      <div className={styles.heroStats}>
        <span>
          製品数 {stats?.product_count}
        </span>
      </div>

      <div className={styles.heroFeaturedGroups}>

        {featuredGroups
          ?.slice(0, 5)
          .map(group => (

            <span
              key={group.group_slug}
              className={styles.heroFeaturedGroup}
            >
              {group.group_name}
            </span>

        ))}

      </div>


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
        わかりやすく提案
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
          href="/ranking/all"

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

        <Link
          href="/concierge"

          className={
            styles.heroConciergeButton
          }
        >
          AIコンシェルジュに相談する
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
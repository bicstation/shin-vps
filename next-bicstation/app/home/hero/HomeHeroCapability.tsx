// /home/maya/shin-vps/next-bicstation/app/components/home/hero/HomeHeroTrust.tsx

import styles
  from '../styles/hero.module.css'

const TRUST_POINTS = [
  {
    title: '初心者でも選びやすい',
    description:
      'ゲーム・動画編集・普段使いなど、目的に合わせてPCを探せます。',
  },
  {
    title: 'AI向けPCもわかりやすい',
    description:
      'AI画像生成や動画編集に向いているPCを比較しやすくしています。',
  },
  {
    title: '長く使いやすいPCを比較',
    description:
      '価格だけでなく、使いやすさや性能バランスも重視しています。',
  },
]

export default function HomeHeroTrust() {

  return (

    <section
      className={
        styles.heroTrustSection
      }
    >

      {/* =====================================
      HEADER
      ===================================== */}

      <div
        className={
          styles.heroTrustHeader
        }
      >

        <div
          className={
            styles.heroTrustLabel
          }
        >
          TRUSTED RECOMMENDATION
        </div>

        <h2
          className={
            styles.heroTrustTitle
          }
        >
          はじめてでも
          比較しやすい
          PC選びへ
        </h2>

        <p
          className={
            styles.heroTrustDescription
          }
        >
          SHIN CORE LINX は、
          スペックだけではなく、

          「どんなことに向いているか」

          をわかりやすく整理し、

          ゲーム・動画編集・AI画像生成など、
          目的に合ったPCを
          比較しやすくする
          PC比較サービスです。
        </p>

      </div>

      {/* =====================================
      GRID
      ===================================== */}

      <div
        className={
          styles.heroTrustGrid
        }
      >

        {TRUST_POINTS.map((item) => (

          <div
            key={item.title}

            className={
              styles.heroTrustCard
            }
          >

            <div
              className={
                styles.heroTrustIcon
              }
            >
              ✔
            </div>

            <h3
              className={
                styles.heroTrustCardTitle
              }
            >
              {item.title}
            </h3>

            <p
              className={
                styles.heroTrustCardDescription
              }
            >
              {item.description}
            </p>

          </div>

        ))}

      </div>

    </section>

  )
}
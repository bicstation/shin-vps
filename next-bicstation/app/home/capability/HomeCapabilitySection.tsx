// /home/maya/shin-vps/next-bicstation/app/components/home/capability/HomeCapabilitySection.tsx

import styles
  from '../styles/capability.module.css'

const CAPABILITY_ITEMS = [
  {
    icon: '🤖',
    title: 'AI画像生成',
    description:
      'Stable Diffusion や生成AI用途に向いた高性能GPU構成を比較できます。',
  },
  {
    icon: '🎮',
    title: 'FPS Gaming',
    description:
      '高FPS・高リフレッシュレート向けの gaming PC を探しやすい。',
  },
  {
    icon: '🎬',
    title: '動画編集',
    description:
      'Premiere Pro や配信用途にも快適な構成を semantic に整理。',
  },
  {
    icon: '📡',
    title: '配信・マルチタスク',
    description:
      'ゲーム配信や複数アプリ同時利用にも対応しやすい構成。',
  },
  {
    icon: '🧠',
    title: '長く使いやすい',
    description:
      '将来性やバランスも考慮した recommendation を重視。',
  },
  {
    icon: '💡',
    title: '初心者向け',
    description:
      'スペック知識がなくても用途ベースで比較しやすい。',
  },
]

export default function HomeCapabilitySection() {

  return (

    <section
      className={
        styles.capabilitySection
      }
    >

      {/* =====================================
      HEADER
      ===================================== */}

      <div
        className={
          styles.capabilityHeader
        }
      >

        <div
          className={
            styles.capabilityLabel
          }
        >
          WHAT YOU CAN DO
        </div>

        <h2
          className={
            styles.capabilityTitle
          }
        >
          何ができるか
          から探せる
        </h2>

        <p
          className={
            styles.capabilityDescription
          }
        >
          SHIN CORE LINX は、
          GPUやCPUだけではなく、

          「どんな用途に向いているか」

          を semantic に整理し、
          比較しやすい recommendation
          experience を提供します。
        </p>

      </div>

      {/* =====================================
      GRID
      ===================================== */}

      <div
        className={
          styles.capabilityGrid
        }
      >

        {CAPABILITY_ITEMS.map((item) => (

          <div
            key={item.title}

            className={
              styles.capabilityCard
            }
          >

            <div
              className={
                styles.capabilityIcon
              }
            >
              {item.icon}
            </div>

            <h3
              className={
                styles.capabilityCardTitle
              }
            >
              {item.title}
            </h3>

            <p
              className={
                styles.capabilityCardDescription
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
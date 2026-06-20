// /home/maya/shin-vps/next-bicstation/app/components/home/recommendation/HomeIntentNav.tsx

import Link
  from 'next/link'

import styles
  from '../styles/recommendation.module.css'

import {

  Gamepad2,
  Sparkles,
  PenTool,
  BadgeDollarSign,
  Briefcase,
  Smartphone,
  Laptop,
  Monitor,
  Cpu,
  Server,
  Box,

} from 'lucide-react'

import {
  LucideIcon,
} from 'lucide-react'

type Props = {

  intents?: any[]
}

import SemanticIcon
  from '@/shared/lib/ui/semantic/SemanticIcon'

export default function HomeIntentNav({

  intents = [],

}: Props) {

  console.log(
    '🔥 HOME INTENTS',
    intents
  )

  

  /* ==========================================
  Usage Intent Only
  ========================================== */

  const usageIntents =

    intents.filter(
      (intent) =>
        intent?.type === 'usage'
    )

  return (

    <section
      className={
        styles.intentSection
      }
    >

      {/* =====================================
      HEADER
      ===================================== */}

      <div
        className={
          styles.intentHeader
        }
      >

        <div
          className={
            styles.intentLabel
          }
        >
          RECOMMENDATION PATHS
        </div>

        <h2
          className={
            styles.intentTitle
          }
        >
          やりたいこと
          から探せる
        </h2>

        <p
          className={
            styles.intentDescription
          }
        >
          gaming・AI画像生成・
          動画編集・長期利用など。

          「何をしたいか」

          から比較しやすい
          semantic recommendation
          navigation を提供します。
        </p>

      </div>

      {/* =====================================
      GRID
      ===================================== */}
      

      <div className={styles.intentGrid}>

        {usageIntents.map((intent) => (

          <Link
            key={intent.slug}
            href={`/ranking/${intent.slug}`}
            className={styles.intentCard}
          >

            {/* ===============================
            TOP
            =============================== */}

            <div
              className={
                styles.intentCardTop
              }
            >

              <div
                className={
                  styles.intentIcon
                }
              >

                <SemanticIcon
                  icon={intent.icon}
                  color={intent.color}
                  size={24}
                />

              </div>

              <div>

                <div
                  className={
                    styles.intentCardTitle
                  }
                >
                  {intent.title}
                </div>

                <div
                  className={
                    styles.intentProductCount
                  }
                >
                  {intent.product_count ?? 0}
                  製品
                </div>

                <div
                  className={
                    styles.intentCardText
                  }
                >
                  {intent.description}
                </div>

              </div>

            </div>

            {/* ===============================
            FOOTER
            =============================== */}

            <div
              className={
                styles.intentCardFooter
              }
            >
              おすすめを見る →
            </div>

          </Link>

        ))}

      </div>

    </section>

  )
}
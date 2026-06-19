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

import {
  ICON_MAP,
} from '@/shared/lib/ui/icon-map'

import {
  COLOR_MAP,
} from '@/shared/lib/ui/color-map'



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

      <div className={ styles.intentGrid } >


        {
          usageIntents.map((intent) => {

            const Icon =

              ICON_MAP[
                intent.icon
              ]

            const accentColor =

              COLOR_MAP[
                intent.color
              ]

              ||

              '#0ea5e9'

            return (

              <Link
                key={intent.slug}

                href={
                  `/ranking/${intent.slug}`
                }

                className={
                  styles.intentCard
                }

                 style={{

                  borderColor:
                    `${accentColor}33`,
                  boxShadow:
                    `0 0 40px ${accentColor}15`,

                }}
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

                      style={{

                        color:
                          accentColor,

                        border:
                          `1px solid ${accentColor}44`,

                        background:
                          `linear-gradient(
                            135deg,
                            ${accentColor}22,
                            rgba(255,255,255,.03)
                          )`,

                        boxShadow:
                          `0 0 24px ${accentColor}22`,

                      }}
                    >

                      {

                        Icon

                          ? (
                              <Icon
                                size={24}
                                strokeWidth={2.2}
                              />
                            )

                          : '📦'

                      }

                    </div>

                    <div>

                      <div
                        className={
                          styles.intentCardTitle
                        }

                        style={{

                          textShadow:
                            `0 0 12px ${accentColor}22`,

                        }}
                      >
                        {intent.title}
                      </div>

                      <div

                        style={{

                          display:
                            'inline-flex',

                          alignItems:
                            'center',

                          padding:
                            '4px 10px',

                          borderRadius:
                            '999px',

                          background:
                            `${accentColor}18`,

                          border:
                            `1px solid ${accentColor}33`,

                          color:
                            accentColor,

                          fontSize:
                            '11px',

                          fontWeight:
                            800,

                          marginBottom:
                            '12px',

                        }}
                      >

                        {intent.product_count}
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

            )

          })
        }


      </div>
      

    </section>

  )
}
// /app/ranking/[type]/components/RankingBottomCTA.tsx

import Link
  from 'next/link'

import styles
  from '../page.module.css'

type Props = {
  type: string
}

export default function RankingBottomCTA({
  type,
}: Props) {

  // =====================================
  // Contextual Copy
  // =====================================

  const contextualCopy: Record<
    string,
    {
      title: string
      description: string
    }
  > = {

    'usage-gaming': {

      title:
        '高FPS gaming向けPCを\n比較して探す',

      description:
        '144fps・240fps gamingや配信向け構成を比較できます。',

    },

    'usage-ai': {

      title:
        'AI画像生成向けPCを\n比較して探す',

      description:
        'Stable Diffusion・ローカルAI向けGPU構成を比較できます。',

    },

    'usage-creator': {

      title:
        '動画編集向けPCを\n比較して探す',

      description:
        '4K編集・配信・creator workload向け構成を比較できます。',

    },

  }

  const copy =

    contextualCopy[type]
    || {

      title:
        'あなたに合うPCを\n比較して探す',

      description:
        '用途・性能・コスパからおすすめ構成を比較できます。',

    }

  return (

    <section
      className={
        styles.rankingBottomSection
      }
    >

      <div
        className={
          styles.rankingBottomCard
        }
      >

        {/* ===============================
        LABEL
        =============================== */}

        <div
          className={
            styles.rankingBottomLabel
          }
        >
          CONTINUE COMPARING
        </div>

        {/* ===============================
        TITLE
        =============================== */}

        <h2
          className={
            styles.rankingBottomTitle
          }
        >
          {copy.title
            .split('\n')
            .map((line) => (

              <span
                key={line}
              >
                {line}
                <br />
              </span>

            ))}
        </h2>

        {/* ===============================
        DESCRIPTION
        =============================== */}

        <p
          className={
            styles.rankingBottomDescription
          }
        >
          {copy.description}
        </p>

        {/* ===============================
        TRUST
        =============================== */}

        <div
          className={
            styles.rankingBottomTrust
          }
        >

          <div
            className={
              styles.rankingBottomTrustItem
            }
          >
            ✔ 初心者向け比較
          </div>

          <div
            className={
              styles.rankingBottomTrustItem
            }
          >
            ✔ AI・gaming対応
          </div>

          <div
            className={
              styles.rankingBottomTrustItem
            }
          >
            ✔ 用途別おすすめ
          </div>

        </div>

        {/* ===============================
        CTA
        =============================== */}

        <div
          className={
            styles.rankingBottomActions
          }
        >

          <Link
            href="/ranking"

            className={
              styles.rankingBottomPrimary
            }
          >
            おすすめランキングを見る
          </Link>

          <Link
            href="/pc-finder"

            className={
              styles.rankingBottomSecondary
            }
          >
            PC診断を試す
          </Link>

        </div>

      </div>

    </section>

  )
}
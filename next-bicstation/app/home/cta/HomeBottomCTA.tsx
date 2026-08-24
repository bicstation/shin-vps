// /app/home/cta/HomeBottomCTA.tsx

import Link from 'next/link'
import SemanticIcon from '@/shared/lib/ui/semantic/SemanticIcon'
import styles from '../styles/v2/cta.module.css'

const FEATURES = [
  '1049製品掲載',
  'AI用途対応',
  'ゲーミング対応',
  '初心者でも比較しやすい',
]

export default function HomeBottomCTA() {
  return (
    <section className={styles.bottomSection}>
      <div className={styles.bottomCard}>
        <div className={styles.bottomLabel}>
          FINAL DISCOVERY GATEWAY
        </div>

        <h2 className={styles.bottomTitle}>
          あなたに合うPCを
          今すぐ見つけよう
        </h2>

        <p className={styles.bottomDescription}>
          AI・ゲーム・動画編集・ビジネス利用まで。
          SHIN CORE LINXは、
          用途から比較し、
          あなたに合うPC探しをサポートします。
        </p>

        <div className={styles.bottomFeatures}>
          {FEATURES.map(feature => (
            <div
              key={feature}
              className={styles.bottomFeature}
            >
              ✓ {feature}
            </div>
          ))}
        </div>

        <div className={styles.bottomActions}>
          <Link
            href="/ranking"
            className={styles.primaryButton}
          >
            🔥 人気ランキングを見る
          </Link>

          <Link
            href="/pc-finder"
            className={styles.secondaryButton}
          >
            🎯 Finderで探す
          </Link>

          <Link
            href="/concierge"
            className={styles.secondaryButton}
          >
            🤖 AIに相談する
          </Link>
        </div>
      </div>
    </section>
  )
}
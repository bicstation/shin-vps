// /home/maya/shin-vps/next-bicstation/app/guide/cost-performance/page.tsx

import Link
  from 'next/link'

import styles
  from './page.module.css'

export const metadata = {
  title:
    'コスパ重視PCの選び方｜価格と性能のバランス完全ガイド【2026年版】',

  description:
    'gaming・動画編集・AI用途まで、価格と性能のバランスを重視した失敗しにくいPC構成を初心者向けに解説。',
}

export default function CostPerformanceGuidePage() {

  return (

    <main
      className={styles.page}
    >

      {/* =====================================================
      HERO
      ===================================================== */}

      <section
        className={styles.hero}
      >

        <div
          className={styles.heroLabel}
        >
          COST PERFORMANCE GUIDE
        </div>

        <h1
          className={styles.heroTitle}
        >
          コスパ重視PCの選び方
        </h1>

        <p
          className={styles.heroDescription}
        >
          gaming・creator・AI用途まで。

          「価格」と「性能」の
          バランスを重視した
          semantic recommendation guide。
        </p>

        <div
          className={styles.heroActions}
        >

          <Link
            href="/ranking/cost-performance"

            className={styles.primaryButton}
          >
            コスパランキングを見る
          </Link>

          <Link
            href="/pc-finder"

            className={styles.secondaryButton}
          >
            用途からPCを探す
          </Link>

        </div>

      </section>

      {/* =====================================================
      ARTICLE
      ===================================================== */}

      <article
        className={styles.article}
      >

        <section
          className={styles.section}
        >

          <h2
            className={styles.sectionTitle}
          >
            コスパ重視PCとは？
          </h2>

          <p>
            コスパ重視PCとは、
            価格だけではなく、
            「どれだけ快適に使えるか」
            を重視した balanced PC 構成です。
          </p>

          <p>
            単純に安いだけではなく、
            gaming・動画編集・AI用途まで
            幅広く使いやすいことが重要です。
          </p>

        </section>

        <section
          className={styles.section}
        >

          <h2
            className={styles.sectionTitle}
          >
            安いだけでは失敗しやすい
          </h2>

          <p>
            極端に安いPCは：
          </p>

          <ul
            className={styles.list}
          >
            <li>冷却不足</li>

            <li>電源品質不足</li>

            <li>メモリ不足</li>

            <li>将来性不足</li>
          </ul>

          <p>
            などで長期利用時に
            不満が出やすくなります。
          </p>

        </section>

        <section
          className={styles.section}
        >

          <h2
            className={styles.sectionTitle}
          >
            バランス重視おすすめ構成
          </h2>

          <div
            className={styles.specTable}
          >

            <div className={styles.specRow}>
              <div>GPU</div>
              <div>RTX 5060 / 5070</div>
            </div>

            <div className={styles.specRow}>
              <div>CPU</div>
              <div>Ryzen 7 / Core i7</div>
            </div>

            <div className={styles.specRow}>
              <div>メモリ</div>
              <div>32GB推奨</div>
            </div>

            <div className={styles.specRow}>
              <div>SSD</div>
              <div>1TB以上</div>
            </div>

          </div>

        </section>

        <section
          className={styles.section}
        >

          <h2
            className={styles.sectionTitle}
          >
            用途別おすすめ
          </h2>

          <div
            className={styles.cardGrid}
          >

            <div
              className={styles.infoCard}
            >
              <h3>🎮 gaming</h3>

              <p>
                FPS gaming中心なら
                RTX 5070クラスが
                非常にバランス良好です。
              </p>
            </div>

            <div
              className={styles.infoCard}
            >
              <h3>🎬 creator</h3>

              <p>
                動画編集用途では
                メモリ32GB以上が
                快適性に影響します。
              </p>
            </div>

            <div
              className={styles.infoCard}
            >
              <h3>🤖 AI</h3>

              <p>
                AI用途では
                VRAM容量も重要になります。
              </p>
            </div>

          </div>

        </section>

        <section
          className={styles.section}
        >

          <h2
            className={styles.sectionTitle}
          >
            長く使いやすい構成とは？
          </h2>

          <p>
            SHIN CORE LINX では：
          </p>

          <ul
            className={styles.list}
          >
            <li>将来性</li>

            <li>拡張性</li>

            <li>冷却性能</li>

            <li>用途バランス</li>
          </ul>

          <p>
            を重視しています。
          </p>

          <p>
            「今だけ速い」よりも、
            数年後も快適に使いやすい
            recommendation を重視しています。
          </p>

        </section>

        <section
          className={styles.section}
        >

          <h2
            className={styles.sectionTitle}
          >
            SHIN CORE LINX の recommendation
          </h2>

          <p>
            SHIN CORE LINX は：
          </p>

          <ul
            className={styles.list}
          >
            <li>semantic recommendation</li>

            <li>AI wording</li>

            <li>用途別比較</li>

            <li>decision confidence</li>
          </ul>

          <p>
            を重視した
            next-generation comparison platform
            を目指しています。
          </p>

        </section>

      </article>

      {/* =====================================================
      CTA
      ===================================================== */}

      <section
        className={styles.bottomCTA}
      >

        <h2
          className={styles.bottomTitle}
        >
          コスパ重視PCを比較
        </h2>

        <p
          className={styles.bottomDescription}
        >
          gaming・AI・creator用途まで、
          バランス重視 recommendation を
          比較できます。
        </p>

        <div
          className={styles.bottomActions}
        >

          <Link
            href="/ranking/cost-performance"

            className={styles.primaryButton}
          >
            コスパランキング
          </Link>

          <Link
            href="/pc-finder"

            className={styles.secondaryButton}
          >
            semantic finder
          </Link>

        </div>

      </section>

    </main>

  )
}
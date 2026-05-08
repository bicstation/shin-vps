// /home/maya/shin-vps/next-bicstation/app/guide/video-editing/page.tsx

// /home/maya/shin-vps/next-bicstation/app/guide/video-editing/page.tsx

import Link
  from 'next/link'

import styles
  from './page.module.css'

export const metadata = {
  title:
    '動画編集PCの選び方｜Premiere Pro・DaVinci向け完全ガイド【2026年版】',

  description:
    'Premiere Pro・DaVinci Resolve・配信向けに、動画編集PCの失敗しにくい選び方を初心者向けに解説。',
}

export default function VideoEditingGuidePage() {

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
          VIDEO EDITING GUIDE
        </div>

        <h1
          className={styles.heroTitle}
        >
          動画編集PCの選び方
        </h1>

        <p
          className={styles.heroDescription}
        >
          Premiere Pro・DaVinci Resolve・
          配信・creator用途まで。

          動画編集向け
          semantic recommendation guide。
        </p>

        <div
          className={styles.heroActions}
        >

          <Link
            href="/ranking/creator"

            className={styles.primaryButton}
          >
            creatorランキングを見る
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
            動画編集PCとは？
          </h2>

          <p>
            動画編集PCとは、
            Premiere Pro・DaVinci Resolve・
            After Effects などを
            快適に利用するための高性能PCです。
          </p>

          <p>
            最近では：
          </p>

          <ul
            className={styles.list}
          >
            <li>4K編集</li>

            <li>配信</li>

            <li>AI編集</li>

            <li>creator workload</li>
          </ul>

          <p>
            など、高いPC性能が必要になる場面が増えています。
          </p>

        </section>

        <section
          className={styles.section}
        >

          <h2
            className={styles.sectionTitle}
          >
            動画編集では CPU とメモリが重要
          </h2>

          <p>
            gamingとは異なり、
            動画編集では CPU・メモリ・SSD速度 が
            非常に重要になります。
          </p>

          <div
            className={styles.cardGrid}
          >

            <div
              className={styles.infoCard}
            >
              <h3>🎬 Premiere Pro</h3>

              <p>
                CPU性能とメモリ容量が
                timeline快適性へ影響します。
              </p>
            </div>

            <div
              className={styles.infoCard}
            >
              <h3>⚡ DaVinci Resolve</h3>

              <p>
                GPU性能も
                rendering速度へ影響します。
              </p>
            </div>

            <div
              className={styles.infoCard}
            >
              <h3>📡 配信</h3>

              <p>
                配信や multitask では
                CPUコア数も重要です。
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
            creator向けおすすめ構成
          </h2>

          <div
            className={styles.specTable}
          >

            <div className={styles.specRow}>
              <div>GPU</div>
              <div>RTX 5070 / 5080</div>
            </div>

            <div className={styles.specRow}>
              <div>CPU</div>
              <div>Ryzen 9 / Core Ultra 9</div>
            </div>

            <div className={styles.specRow}>
              <div>メモリ</div>
              <div>32GB〜64GB</div>
            </div>

            <div className={styles.specRow}>
              <div>SSD</div>
              <div>2TB以上推奨</div>
            </div>

          </div>

        </section>

        <section
          className={styles.section}
        >

          <h2
            className={styles.sectionTitle}
          >
            初心者が失敗しやすいポイント
          </h2>

          <ul
            className={styles.list}
          >
            <li>
              メモリ不足
            </li>

            <li>
              SSD容量不足
            </li>

            <li>
              CPU性能不足
            </li>

            <li>
              冷却不足
            </li>
          </ul>

          <p>
            特に動画編集では、
            長時間高負荷になるため、
            冷却性能も重要です。
          </p>

        </section>

        <section
          className={styles.section}
        >

          <h2
            className={styles.sectionTitle}
          >
            gaming兼用でも使える？
          </h2>

          <p>
            最近の high-end gaming PC は、
            creator用途にもかなり適しています。
          </p>

          <p>
            特に RTX 5070 / 5080 クラスは：
          </p>

          <ul
            className={styles.list}
          >
            <li>FPS gaming</li>

            <li>動画編集</li>

            <li>配信</li>

            <li>AI creator</li>
          </ul>

          <p>
            を1台で対応しやすく、
            非常にバランスが良いです。
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
          creator向けPCを比較
        </h2>

        <p
          className={styles.bottomDescription}
        >
          Premiere Pro・DaVinci・配信向け
          recommendation を比較できます。
        </p>

        <div
          className={styles.bottomActions}
        >

          <Link
            href="/ranking/creator"

            className={styles.primaryButton}
          >
            creatorランキング
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
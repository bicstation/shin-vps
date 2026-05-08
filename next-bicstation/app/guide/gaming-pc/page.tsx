// /home/maya/shin-vps/next-bicstation/app/guide/gaming-pc/page.tsx

import Link
  from 'next/link'

import styles
  from './page.module.css'

export const metadata = {
  title:
    'ゲーミングPCの選び方｜初心者向け完全ガイド【2026年版】',

  description:
    'FPS gaming・動画編集・AI画像生成向けに、失敗しにくいゲーミングPCの選び方を初心者向けに解説。',
}

export default function GamingPCGuidePage() {

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
          GAMING PC GUIDE
        </div>

        <h1
          className={styles.heroTitle}
        >
          ゲーミングPCの選び方
        </h1>

        <p
          className={styles.heroDescription}
        >
          FPS gaming・動画編集・AI画像生成まで。

          初心者でも失敗しにくい
          semantic recommendation guide。
        </p>

        <div
          className={styles.heroActions}
        >

          <Link
            href="/ranking/gaming"

            className={styles.primaryButton}
          >
            gamingランキングを見る
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
            ゲーミングPCとは？
          </h2>

          <p>
            ゲーミングPCとは、
            高性能GPUを搭載し、
            FPSゲームや動画編集、AI画像生成などを
            快適に行える高性能PCです。
          </p>

          <p>
            最近では gaming だけでなく、
            creator用途や AI用途も重視されるようになっています。
          </p>

        </section>

        <section
          className={styles.section}
        >

          <h2
            className={styles.sectionTitle}
          >
            最重要なのは GPU
          </h2>

          <p>
            gaming性能に最も影響するのは GPU です。
          </p>

          <div
            className={styles.cardGrid}
          >

            <div
              className={styles.infoCard}
            >
              <h3>🎮 FPS Gaming</h3>
              <p>
                RTX 5070 クラスが
                現在かなりバランス良好。
              </p>
            </div>

            <div
              className={styles.infoCard}
            >
              <h3>🤖 AI画像生成</h3>
              <p>
                Stable Diffusion 用途では
                VRAM が重要。
              </p>
            </div>

            <div
              className={styles.infoCard}
            >
              <h3>🎬 Creator</h3>
              <p>
                動画編集では GPU と CPU の
                両方が重要です。
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
            初心者向けおすすめ構成
          </h2>

          <div
            className={styles.specTable}
          >

            <div className={styles.specRow}>
              <div>GPU</div>
              <div>RTX 5070</div>
            </div>

            <div className={styles.specRow}>
              <div>CPU</div>
              <div>Ryzen 7 / Core i7</div>
            </div>

            <div className={styles.specRow}>
              <div>メモリ</div>
              <div>32GB</div>
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
            失敗しにくい選び方
          </h2>

          <ul
            className={styles.list}
          >
            <li>
              GPUだけで選ばない
            </li>

            <li>
              冷却性能も重視する
            </li>

            <li>
              長く使いやすい構成を選ぶ
            </li>

            <li>
              用途ベースで比較する
            </li>
          </ul>

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
            <li>用途別比較</li>
            <li>AI wording</li>
            <li>decision confidence</li>
          </ul>

          <p>
            を重視した comparison platform を
            目指しています。
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
          用途からおすすめPCを比較
        </h2>

        <p
          className={styles.bottomDescription}
        >
          gaming・AI・動画編集など、
          用途別 recommendation を比較できます。
        </p>

        <div
          className={styles.bottomActions}
        >

          <Link
            href="/ranking/gaming"

            className={styles.primaryButton}
          >
            gamingランキング
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

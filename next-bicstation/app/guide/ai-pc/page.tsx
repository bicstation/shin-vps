// /home/maya/shin-vps/next-bicstation/app/guide/ai-pc/page.tsx

// /home/maya/shin-vps/next-bicstation/app/guide/ai-pc/page.tsx

import Link
  from 'next/link'

import styles
  from './page.module.css'

export const metadata = {
  title:
    'AI用PCの選び方｜Stable Diffusion・生成AI向け完全ガイド【2026年版】',

  description:
    'AI画像生成・Stable Diffusion・ローカルLLM向けに、失敗しにくいAI用PC構成を初心者向けに解説。',
}

export default function AIPCGuidePage() {

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
          AI PC GUIDE
        </div>

        <h1
          className={styles.heroTitle}
        >
          AI用PCの選び方
        </h1>

        <p
          className={styles.heroDescription}
        >
          Stable Diffusion・ローカルLLM・
          AI画像生成まで。

          AI用途に適した
          semantic recommendation guide。
        </p>

        <div
          className={styles.heroActions}
        >

          <Link
            href="/ranking/ai"

            className={styles.primaryButton}
          >
            AI向けランキングを見る
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
            AI用PCとは？
          </h2>

          <p>
            AI用PCとは、
            Stable Diffusion・ローカルLLM・
            画像生成AI・動画生成AIなどを
            快適に実行するための高性能PCです。
          </p>

          <p>
            特に最近は、
            AI画像生成やローカルAI需要が急増しており、
            GPU性能が非常に重要になっています。
          </p>

        </section>

        <section
          className={styles.section}
        >

          <h2
            className={styles.sectionTitle}
          >
            AI用途では VRAM が重要
          </h2>

          <p>
            AI用途では、
            通常の gaming よりも
            VRAM容量が重要になります。
          </p>

          <div
            className={styles.cardGrid}
          >

            <div
              className={styles.infoCard}
            >
              <h3>🤖 Stable Diffusion</h3>

              <p>
                画像生成では
                VRAM容量が生成速度や
                解像度に大きく影響します。
              </p>
            </div>

            <div
              className={styles.infoCard}
            >
              <h3>🧠 ローカルLLM</h3>

              <p>
                LLM用途では
                GPUメモリが重要になります。
              </p>
            </div>

            <div
              className={styles.infoCard}
            >
              <h3>🎬 AI動画生成</h3>

              <p>
                動画生成では
                GPU・CPU・SSD速度が
                全体性能へ影響します。
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
            AI向けおすすめ構成
          </h2>

          <div
            className={styles.specTable}
          >

            <div className={styles.specRow}>
              <div>GPU</div>
              <div>RTX 5080 / 5090</div>
            </div>

            <div className={styles.specRow}>
              <div>VRAM</div>
              <div>16GB以上推奨</div>
            </div>

            <div className={styles.specRow}>
              <div>CPU</div>
              <div>Ryzen 9 / Core Ultra 9</div>
            </div>

            <div className={styles.specRow}>
              <div>メモリ</div>
              <div>64GB以上推奨</div>
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
            AI初心者が失敗しやすいポイント
          </h2>

          <ul
            className={styles.list}
          >
            <li>
              VRAM不足で生成できない
            </li>

            <li>
              メモリ不足で動作が重い
            </li>

            <li>
              SSD容量不足
            </li>

            <li>
              冷却不足による性能低下
            </li>
          </ul>

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
            AI用途にもかなり適しています。
          </p>

          <p>
            特に RTX 5080 / 5090 クラスは：
          </p>

          <ul
            className={styles.list}
          >
            <li>FPS gaming</li>
            <li>動画編集</li>
            <li>AI画像生成</li>
            <li>ローカルLLM</li>
          </ul>

          <p>
            を1台で対応しやすく、
            長く使いやすい構成です。
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
          AI用途からおすすめPCを比較
        </h2>

        <p
          className={styles.bottomDescription}
        >
          Stable Diffusion・ローカルLLM・
          AI creator用途向け recommendation を
          比較できます。
        </p>

        <div
          className={styles.bottomActions}
        >

          <Link
            href="/ranking/ai"

            className={styles.primaryButton}
          >
            AIランキング
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
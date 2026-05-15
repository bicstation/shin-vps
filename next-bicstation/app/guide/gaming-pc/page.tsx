// /home/maya/shin-vps/next-bicstation/app/guide/gaming-pc/page.tsx

import styles from './page.module.css';

export default function GuideGamingPC() {
  return (
    <div className={styles.container}>

      {/* タイトル */}
      <h1 className={styles.title}>
        ゲーミングPC初心者ガイド
      </h1>

      {/* 導入 */}
      <p className={styles.description}>
        「ゲーミングPCって難しそう…」と思うかもしれませんが、
        最初は難しく考えなくて大丈夫です。
      </p>

      {/* 結論 */}
      <div className={styles.highlightBox}>
        <p className={styles.highlightText}>
          👉 初心者なら「Core i7 + RTX4060」くらいを選べば安心です
        </p>
      </div>

      {/* 解説 */}
      <h2 className={styles.sectionTitle}>
        ゲーミングPCって普通のPCと何が違う？
      </h2>

      <p className={styles.text}>
        一番大きな違いは「グラフィック性能」です。<br />
        ゲームを快適に動かすために、
        高性能なGPU（グラボ）が入っています。
      </p>

      {/* 選び方 */}
      <h2 className={styles.sectionTitle}>
        初心者はどれを選べばいい？
      </h2>

      <ul className={styles.list}>
        <li>✔ 軽いゲーム → RTX4060</li>
        <li>✔ FPS・重いゲーム → RTX4070以上</li>
        <li>✔ 配信・動画編集 → Core i7以上</li>
      </ul>

      {/* 注意 */}
      <h2 className={styles.sectionTitle}>
        最初から超高額モデルは必要？
      </h2>

      <p className={styles.text}>
        必ずしも必要ではありません。<br />
        最近のミドルクラスPCでも、
        十分ゲームを楽しめます。
      </p>

      {/* CTA */}
      <div className={styles.ctaBox}>
        <p className={styles.ctaText}>
          初心者向けおすすめモデルはこちら
        </p>

        {/* temporarily Link → a */}
        <a
          href="/ranking"
          className={styles.ctaButton}
        >
          👉 おすすめPCランキングを見る
        </a>
      </div>

    </div>
  );
}
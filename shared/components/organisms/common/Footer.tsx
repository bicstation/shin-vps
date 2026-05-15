'use client';

import styles from './Footer.module.css';

export default function Footer() {

  return (

    <footer className={styles.footer}>

      {/* =================================================
      🛡 Trust
      ================================================= */}
      <div className={styles.trustBlock}>

        <div className={styles.trustTitle}>
          安心してご利用いただけます
        </div>

        <div className={styles.trustItem}>
          ✔ 掲載商品はすべて公式ショップ
        </div>

        <div className={styles.trustItem}>
          ✔ 安全な購入リンクのみ使用
        </div>

        <div className={styles.trustItem}>
          ✔ 無理な販売は行いません
        </div>

      </div>

      {/* =================================================
      ⚠ Notice
      ================================================= */}
      <div className={styles.notice}>
        ※在庫状況や価格は変動する場合があります
      </div>

      {/* =================================================
      🧠 Brand
      ================================================= */}
      <div className={styles.brand}>
        Powered by{' '}
        <span className={styles.brandStrong}>
          SHIN CORE LINX
        </span>
      </div>

      {/* =================================================
      📢 Rectangle Ad
      ================================================= */}
      <div className={styles.adSection}>

        <div className={styles.adLabel}>
          SPONSORED
        </div>

        <div className={styles.rectangleAd}>

          {/* Adsense差込位置 */}
          RECTANGLE AD AREA

        </div>

      </div>

      {/* =================================================
      🔗 Links
      ================================================= */}
      <div className={styles.links}>

        <a
          href="/privacy"
          className={styles.link}
        >
          プライバシーポリシー
        </a>

        <a
          href="/terms"
          className={styles.link}
        >
          利用規約
        </a>

      </div>

      {/* =================================================
      🏁 Copyright
      ================================================= */}
      <div className={styles.copy}>
        © {new Date().getFullYear()} SHIN CORE LINX
      </div>

    </footer>
  );
}
import Link from 'next/link';
import styles from './home.module.css';

export function HeroSection() {
return ( <section className={styles.hero}>


  <div className={styles.heroContent}>

    <span className={styles.heroLabel}>
      AVFLASH
    </span>

    <h1 className={styles.heroTitle}>
      あなたに合う作品を見つけよう
    </h1>

    <p className={styles.heroDescription}>
      人気作品や新着作品から、
      気になる作品を簡単に探せます。
    </p>

    <div className={styles.heroActions}>

      <Link
        href="/adults"
        className={styles.primaryButton}
      >
        作品を探す
      </Link>

      <Link
        href="/ranking"
        className={styles.secondaryButton}
      >
        人気作品を見る
      </Link>

    </div>

  </div>

</section>


);
}

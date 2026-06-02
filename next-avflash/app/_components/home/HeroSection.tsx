// app/_components/home/HeroSection.tsx

import styles from './home.module.css';

export default function HeroSection() {
  return (
    <section className={styles.hero}>
      <div className={styles.inner}>
        <h1 className={styles.title}>
          AVFLASH
        </h1>

        <p className={styles.catchcopy}>
          次に見る作品を見つけよう
        </p>

        <p className={styles.description}>
          13,000作品以上のアーカイブから
          気になる作品を探せます。
        </p>
      </div>
    </section>
  );
}


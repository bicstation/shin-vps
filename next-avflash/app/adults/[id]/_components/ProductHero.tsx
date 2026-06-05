import Link from 'next/link';

import styles from '../page.module.css';

type Props = {
  title: string;
  releaseDate?: string | null;
  makerName?: string | null;
};

export function ProductHero({
  title,
  releaseDate,
  makerName,
}: Props) {
  return (
    <section className={styles.hero}>

      <div className={styles.breadcrumb}>

        <Link
          href="/adults"
          className={styles.backLink}
        >
          ← 作品一覧へ戻る
        </Link>

      </div>

      <h1 className={styles.title}>
        {title}
      </h1>

      <div className={styles.meta}>

        {makerName && (
          <span className={styles.metaItem}>
            メーカー：{makerName}
          </span>
        )}

        {releaseDate && (
          <span className={styles.metaItem}>
            公開日：{releaseDate}
          </span>
        )}

      </div>

    </section>
  );
}
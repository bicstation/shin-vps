'use client';

import Link from 'next/link';
import styles from './AttributeEntry.module.css';

type Item = {
  name: string;
  slug: string;
  count: number;
};

export default function AttributeEntry({
  title,
  icon,
  list,
}: {
  title: string;
  icon: string;
  list: Item[];
}) {
  if (!list?.length) return null;

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>
        {icon} {title}
      </h2>

      <div className={styles.grid}>
        {list.slice(0, 8).map((item) => (
          <Link
            key={item.slug}
            href={`/ranking/${item.slug}`}
            className={styles.card}
          >
            <span className={styles.name}>{item.name}</span>
            <span className={styles.count}>（{item.count}）</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
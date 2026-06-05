import Link from 'next/link';

import styles from './page.module.css';

const genres = [
  '単体',
  '熟女',
  '素人',
  'VR',
  '人妻',
  '企画',
];

export default function GenrePage() {
  return (
    <div className={styles.page}>

      <h1>ジャンルから探す</h1>

      <p>
        気になるジャンルを選んでください。
      </p>

      <div className={styles.grid}>

        {genres.map((genre) => (
          <Link
            key={genre}
            href={`/genre/${encodeURIComponent(genre)}`}
            className={styles.card}
          >
            {genre}
          </Link>
        ))}

      </div>

    </div>
  );
}
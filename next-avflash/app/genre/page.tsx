import Link from 'next/link';

import { getNoImage }
  from '@/shared/lib/no-image/getNoImage';

import styles from './page.module.css';

const genres = [
  {
    name: '単体',
    description:
      '人気の単体作品を探す',
  },

  {
    name: '熟女',
    description:
      '大人の魅力を持つ作品を探す',
  },

  {
    name: '素人',
    description:
      'リアルな雰囲気の作品を探す',
  },

  {
    name: 'VR',
    description:
      '没入感のあるVR作品を探す',
  },

  {
    name: '人妻',
    description:
      '人妻ジャンルの作品を探す',
  },

  {
    name: '企画',
    description:
      '話題の企画作品を探す',
  },
];

export default function GenrePage() {

  return (
    <div className={styles.page}>

      <header className={styles.header}>

        <h1 className={styles.title}>
          ジャンルから探す
        </h1>

        <p className={styles.description}>
          好みのジャンルから
          作品を見つけましょう。
        </p>

      </header>

      <div className={styles.grid}>

        {genres.map((genre) => {

          const image =
            getNoImage({
              genres: [genre.name],
            });

          return (
            <Link
              key={genre.name}
              href={`/genre/${encodeURIComponent(
                genre.name
              )}`}
              className={styles.card}
              style={{
                backgroundImage:
                  `url(${image})`,
              }}
            >

              <div
                className={styles.overlay}
              />

              <div
                className={styles.content}
              >

                <h2
                  className={
                    styles.cardTitle
                  }
                >
                  {genre.name}
                </h2>

                <p
                  className={
                    styles.cardDescription
                  }
                >
                  {genre.description}
                </p>

              </div>

            </Link>
          );
        })}

      </div>

    </div>
  );
}
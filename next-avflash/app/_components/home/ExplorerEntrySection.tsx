import Link from 'next/link';
import styles from './home.module.css';

const entries = [
  {
    title: '作品一覧を見る',
    description:
      '新着作品や人気作品をまとめてチェック',
    href: '/adults',
    image: '/images/explorer/list.png',
  },

  {
    title: '人気作品ランキング',
    description:
      '今注目されている作品から探す',
    href: '/ranking',
    image: '/images/explorer/ranking.png',
  },

  {
    title: 'ジャンルから探す',
    description:
      '単体・熟女・VRなど好みから探す',
    href: '/genre',
    image: '/images/explorer/genre.png',
  },

  {
    title: 'キーワード検索',
    description:
      '作品名や出演者名から探す',
    href: '/search',
    image: '/images/explorer/search.png',
  },

  {
    title: '出演者から探す',
    description:
      '好きな出演者の作品を見る',
    href: '/actress',
    image: '/images/explorer/actress.png',
  },

  {
    title: 'メーカーから探す',
    description:
      'お気に入りメーカーの作品を見る',
    href: '/maker',
    image: '/images/explorer/maker.png',
  },
];

export function ExplorerEntrySection() {

  return (
    <section className={styles.explorer}>

      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>
          作品を探す
        </h2>

        <p
          className={
            styles.sectionDescription
          }
        >
          あなたに合った方法で
          作品を見つけましょう。
        </p>
      </div>

      <div className={styles.explorerGrid}>

        {entries.map((entry) => (
          <Link
            key={entry.href}
            href={entry.href}
            className={styles.explorerCard}
            style={{
              backgroundImage:
                `url(${entry.image})`,
            }}
          >

            <div
              className={
                styles.explorerOverlay
              }
            />

            <div
              className={
                styles.explorerContent
              }
            >

              <h3
                className={
                  styles.explorerCardTitle
                }
              >
                {entry.title}
              </h3>

              <p
                className={
                  styles.explorerCardDescription
                }
              >
                {entry.description}
              </p>

              <span
                className={
                  styles.explorerArrow
                }
              >
                →
              </span>

            </div>

          </Link>
        ))}

      </div>

    </section>
  );
}
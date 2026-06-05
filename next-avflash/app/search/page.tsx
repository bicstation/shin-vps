// @ts-nocheck

import Link from 'next/link';

import styles from './page.module.css';

export default function SearchPage() {

  return (
    <div className={styles.page}>

      <header className={styles.header}>

        <h1 className={styles.title}>
          作品を検索
        </h1>

        <p className={styles.description}>
          作品名や出演者名から探すことができます。
        </p>

      </header>

      <section className={styles.searchSection}>

        <form
          action="/adults"
          method="get"
          className={styles.searchForm}
        >

          <input
            type="text"
            name="q"
            placeholder="作品名・出演者名・メーカー名"
            className={styles.input}
          />

          <button
            type="submit"
            className={styles.button}
          >
            検索する
          </button>

        </form>

      </section>

      <section className={styles.quickLinks}>

        <h2>
          よく使われる導線
        </h2>

        <div className={styles.links}>

          <Link
            href="/ranking"
            className={styles.linkCard}
          >
            人気作品ランキング
          </Link>

          <Link
            href="/genre"
            className={styles.linkCard}
          >
            ジャンルから探す
          </Link>

          <Link
            href="/adults"
            className={styles.linkCard}
          >
            作品一覧を見る
          </Link>

        </div>

      </section>

    </div>
  );
}
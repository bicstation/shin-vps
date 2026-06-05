import Link from 'next/link';
import styles from './home.module.css';

const entries = [
{
title: '作品を探す',
description:
'すべての作品一覧から探す',
href: '/adults',
},
{
title: '人気作品を見る',
description:
'今注目されている作品をチェック',
href: '/ranking',
},
{
title: '作品を検索する',
description:
'気になるキーワードで探す',
href: '/search',
},
{
title: 'ガイドを見る',
description:
'作品選びや楽しみ方を知る',
href: '/guide',
},
];

export function ExplorerEntrySection() {
return ( <section className={styles.explorer}>


  <div className={styles.sectionHeader}>
    <h2 className={styles.sectionTitle}>
      まずは探してみる
    </h2>

    <p className={styles.sectionDescription}>
      気になる方法から作品を探してみましょう。
    </p>
  </div>

  <div className={styles.explorerGrid}>

    {entries.map((entry) => (
      <Link
        key={entry.href}
        href={entry.href}
        className={styles.explorerCard}
      >
        <h3 className={styles.explorerCardTitle}>
          {entry.title}
        </h3>

        <p className={styles.explorerCardDescription}>
          {entry.description}
        </p>
      </Link>
    ))}

  </div>

</section>


);
}

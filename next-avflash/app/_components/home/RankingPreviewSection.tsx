import Link from 'next/link';
import styles from './home.module.css';

type Props = {
products?: any[];
};

export function RankingPreviewSection({
products = [],
}: Props) {
return ( <section className={styles.rankingPreview}>


  <div className={styles.sectionHeader}>

    <h2 className={styles.sectionTitle}>
      今人気の作品
    </h2>

    <p className={styles.sectionDescription}>
      多くのユーザーに選ばれている作品です。
    </p>

  </div>

  <div className={styles.productGrid}>

    {products.slice(0, 5).map((product) => (
      <Link
        key={product.id}
        href={`/adults/${product.id}`}
        className={styles.productCard}
      >

        <div className={styles.productImage}>
          <img
            src={product.image}
            alt={product.title}
          />
        </div>

        <div className={styles.productBody}>

          <h3 className={styles.productTitle}>
            {product.title}
          </h3>

          {product.actress && (
            <p className={styles.productMeta}>
              {product.actress}
            </p>
          )}

        </div>

      </Link>
    ))}

  </div>

  <div className={styles.sectionFooter}>

    <Link
      href="/ranking"
      className={styles.sectionMore}
    >
      ランキングをもっと見る
    </Link>

  </div>

</section>


);
}

// app/_components/home/LatestProductsSection.tsx

import AdultProductExplorerCard
  from '@/shared/components/organisms/cards/AdultProductExplorerCard';

import type {
  ProductCardVM,
} from '@/shared/lib/api/django/adult/products';

import styles from './home.module.css';

interface Props {
  products: ProductCardVM[];
}

export default function LatestProductsSection({
  products,
}: Props) {
  return (
    <section className={styles.homeSection}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>
          最新追加作品
        </h2>

        <p className={styles.sectionDescription}>
          最近AVFLASHへ追加された作品です。
          気になる作品を見つけてみましょう。
        </p>
      </div>

      {products.length > 0 ? (
        <div className={styles.productGrid}>
          {products.map(product => (
            <AdultProductExplorerCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      ) : (
        <p className={styles.sectionDescription}>
          作品を読み込み中です。
        </p>
      )}
    </section>
  );
}


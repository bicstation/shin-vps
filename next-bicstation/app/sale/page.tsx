import sale from "./sale.json";
import styles from "./page.module.css";

type PCProductReality = {
  id: number;
  unique_id: string;
  name: string;
  url: string;
  image_url: string;
};

type SaleProduct = {
  name: string;
  product_no: string;
  cpu: string;
  memory: string;
  storage: string;
  display: string;
  gpu: string;
  regular_price: number;
  sale_price: number;
  url: string;
  affiliate_url: string;
  identifier?: string;
  match?: boolean;
  pc_product?: PCProductReality | null;
};

type SaleReality = {
  source: {
    type: string;
    message_id: string;
  };
  brand: string;
  coupon_code: string;
  valid_period: string;
  products: SaleProduct[];
};

const saleReality = sale as SaleReality;

function formatPrice(value: number) {
  return `￥${value.toLocaleString("ja-JP")}`;
}

function discount(
  regular: number,
  salePrice: number,
) {
  if (!regular || regular <= salePrice) {
    return null;
  }

  return regular - salePrice;
}

function discountRate(
  regular: number,
  salePrice: number,
) {
  if (!regular || regular <= salePrice) {
    return null;
  }

  return Math.round(
    ((regular - salePrice) / regular) * 100,
  );
}

export default function SalePage() {
  const products = saleReality.products ?? [];

  return (
    <main className={styles.page}>
      <div className={styles.container}>

        <header className={styles.hero}>
          <div className={styles.heroContent}>
            <span className={styles.eyebrow}>
              SALE INFORMATION
            </span>

            <h1 className={styles.heroTitle}>
              {saleReality.brand} Sale
            </h1>

            <p className={styles.heroDescription}>
              {saleReality.brand} の最新セール情報
            </p>

            <div className={styles.meta}>

              {saleReality.coupon_code && (
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>
                    COUPON CODE
                  </span>

                  <strong className={styles.coupon}>
                    {saleReality.coupon_code}
                  </strong>
                </div>
              )}

              {saleReality.valid_period && (
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>
                    VALID PERIOD
                  </span>

                  <strong>
                    {saleReality.valid_period}
                  </strong>
                </div>
              )}

            </div>
          </div>
        </header>


        <section className={styles.productsSection}>

          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.sectionEyebrow}>
                FEATURED PRODUCTS
              </span>

              <h2 className={styles.sectionTitle}>
                セール対象製品
              </h2>
            </div>

            <span className={styles.productCount}>
              {products.length} PRODUCTS
            </span>
          </div>


          <div className={styles.productList}>

            {products.map((product, index) => {

              const saveAmount = discount(
                product.regular_price,
                product.sale_price,
              );

              const saveRate = discountRate(
                product.regular_price,
                product.sale_price,
              );

              const pcProduct =
                product.pc_product;

              const imageUrl =
                pcProduct?.image_url;

              return (
                <article
                  className={styles.card}
                  key={
                    product.identifier ??
                    pcProduct?.unique_id ??
                    `${product.name}-${index}`
                  }
                >

                  <div className={styles.cardBody}>

                    <div className={styles.visual}>

                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className={styles.image}
                        />
                      ) : (
                        <div className={styles.noImage}>
                          NO IMAGE
                        </div>
                      )}

                    </div>


                    <div className={styles.content}>

                      <span className={styles.brandBadge}>
                        {saleReality.brand}
                      </span>

                      <h3 className={styles.productTitle}>
                        {product.name}
                      </h3>


                      <div className={styles.priceArea}>

                        <strong className={styles.salePrice}>
                          {formatPrice(
                            product.sale_price,
                          )}
                        </strong>

                        {product.regular_price >
                          product.sale_price && (
                          <span className={styles.regularPrice}>
                            {formatPrice(
                              product.regular_price,
                            )}
                          </span>
                        )}

                        {saveRate !== null && (
                          <span className={styles.discountBadge}>
                            {saveRate}% OFF
                          </span>
                        )}

                      </div>

                      {saveAmount !== null && (
                        <p className={styles.saveText}>
                          {formatPrice(saveAmount)}
                          お得
                        </p>
                      )}


                      <div className={styles.specGrid}>

                        <div className={styles.spec}>
                          <span>CPU</span>
                          <strong>
                            {product.cpu || "—"}
                          </strong>
                        </div>

                        <div className={styles.spec}>
                          <span>GPU</span>
                          <strong>
                            {product.gpu || "—"}
                          </strong>
                        </div>

                        <div className={styles.spec}>
                          <span>MEMORY</span>
                          <strong>
                            {product.memory || "—"}
                          </strong>
                        </div>

                        <div className={styles.spec}>
                          <span>STORAGE</span>
                          <strong>
                            {product.storage || "—"}
                          </strong>
                        </div>

                        <div className={styles.spec}>
                          <span>DISPLAY</span>
                          <strong>
                            {product.display || "—"}
                          </strong>
                        </div>

                        <div className={styles.spec}>
                          <span>PRODUCT ID</span>
                          <strong>
                            {product.identifier || "—"}
                          </strong>
                        </div>

                      </div>

                    </div>
                  </div>


                  <footer className={styles.cardFooter}>

                    <div className={styles.mapping}>

                      {pcProduct ? (
                        <>
                          <span>
                            BIC STATION
                          </span>

                          <strong>
                            {pcProduct.name}
                          </strong>
                        </>
                      ) : (
                        <span>
                          PCProductとの対応情報なし
                        </span>
                      )}

                    </div>


                    <div className={styles.actions}>

                      {pcProduct && (
                        <a
                          href={`/product/${pcProduct.unique_id}`}
                          className={styles.detailButton}
                        >
                          商品詳細を見る
                          <span>→</span>
                        </a>
                      )}

                      {product.affiliate_url && (
                        <a
                          href={product.affiliate_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.purchaseButton}
                        >
                          Lenovo公式で購入
                          <span>↗</span>
                        </a>
                      )}

                    </div>

                  </footer>

                </article>
              );
            })}

          </div>
        </section>


        <footer className={styles.pageFooter}>
          Source: {saleReality.source.type}
        </footer>

      </div>
    </main>
  );
}
import ProductCard
from '@/shared/components/organisms/cards/ProductCard'

import styles
from '../styles/v2/featured-products.module.css'

type Props = {
  products?: any[]
}

export default function
HomeFeaturedProducts({

  products = [],

}: Props) {

  if (!products.length) {
    return null
  }

  return (

    <section
      className={
        styles.grid
      }
    >

      {

        products.map(

          (
            product,
            index
          ) => (

            <ProductCard
              key={
                product?.unique_id
                ?? index
              }
              product={product}
            />

          )

        )

      }

    </section>

  )

}
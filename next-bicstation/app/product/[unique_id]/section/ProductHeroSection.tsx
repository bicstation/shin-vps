import ProductHero
  from '../components/hero/ProductHero'

import ProductHeroCapability
  from '../components/hero/ProductHeroCapability'

import ProductHeroTrust
  from '../components/hero/ProductHeroTrust'

type Props = {
  product: any
}

export default function
ProductHeroSection({
  product,
}: Props) {

  return (

    <>

      <ProductHero
        product={product}
      />

      <ProductHeroCapability
        product={product}
      />

      <ProductHeroTrust
        product={product}
      />

    </>

  )
}
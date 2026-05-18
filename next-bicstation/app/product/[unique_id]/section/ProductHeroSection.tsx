import ProductHero
  from '../components/hero/ProductHero'

import ProductHeroCapability
  from '../components/hero/ProductHeroCapability'

import ProductHeroTrust
  from '../components/hero/ProductHeroTrust'

import ProductAISummary
  from '../components/semantic/ProductAISummary'

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

      <ProductAISummary
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
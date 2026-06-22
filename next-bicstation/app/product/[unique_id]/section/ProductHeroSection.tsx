import ProductBreadcrumb
  from '../components/common/ProductBreadcrumb'

import ProductHero
  from '../components/hero/ProductHero'

import ProductHeroCapability
  from '../components/hero/ProductHeroCapability'

import ProductAISummary
  from '../components/semantic/ProductAISummary'

type Props = {

  product: any

  semanticRuntime?: any

}

export default function
ProductHeroSection({

  product,
  semanticRuntime,

}: Props) {

  return (

    <>

      <ProductBreadcrumb
        breadcrumbs={
          product?.breadcrumbs
        }
      />

      <ProductHero
        product={product}
        semanticRuntime={
          semanticRuntime
        }
      />

      <ProductAISummary
        product={product}
      />

      <ProductHeroCapability
        product={product}
        semanticRuntime={
          semanticRuntime
        }
      />

      {/* <ProductHeroTrust
        product={product}
        semanticRuntime={
          semanticRuntime
        }
      /> */}

    </>

  )

}
import ProductBreadcrumb
  from '../components/common/ProductBreadcrumb'

import ProductHero
  from '../components/hero/ProductHero'

import ProductAISummary
  from '../components/hero/ProductAISummary'

import ProductHeroCapability
  from '../components/hero/ProductHeroCapability'


type Props = {

  product: any

  semanticRuntime?: any

}

export default function ProductHeroSection({

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
        semanticRuntime={
          semanticRuntime
        }
      />

      <ProductHeroCapability
        product={product}
        semanticRuntime={
          semanticRuntime
        }
      />

    </>

  )

}